// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const INV_SQRT2 = 1 / Math.SQRT2;
const TOL = 1e-3;

const SINGLE = {
  "0": [1, 0],
  "1": [0, 1],
  "+": [INV_SQRT2, INV_SQRT2],
  "-": [INV_SQRT2, -INV_SQRT2],
};

// Precompute all product vectors and mappings symbol -> 4-vector
const PRODUCT = []; // { symbols: [s0,s1], vec: [4] }
const singleKeys = Object.keys(SINGLE);
for (const s0 of singleKeys) {
  for (const s1 of singleKeys) {
    const a = SINGLE[s0];
    const b = SINGLE[s1];
    const vec = [
      round(a[0] * b[0]),
      round(a[0] * b[1]),
      round(a[1] * b[0]),
      round(a[1] * b[1]),
    ];
    PRODUCT.push({ symbols: [s0, s1], vec });
  }
}

function round(x) {
  return Math.round(x * 1000) / 1000;
}
function approxEq(a, b, tol = TOL) {
  return Math.abs(a - b) <= tol;
}

// Try match incoming 4-vector to one of the product canonical vectors
function matchProduct(vec) {
  const v = vec.map(round);
  for (const p of PRODUCT) {
    let ok = true;
    for (let i = 0; i < 4; i++) {
      if (!approxEq(p.vec[i], v[i])) { ok = false; break; }
    }
    if (ok) return { matched: true, symbols: p.symbols.slice(), vec: p.vec.slice() };
  }
  return { matched: false };
}

// Build 4-vector from symbols pair
function vecFromSymbols(sym0, sym1) {
  const a = SINGLE[sym0];
  const b = SINGLE[sym1];
  if (!a || !b) return null;
  return [
    round(a[0] * b[0]),
    round(a[0] * b[1]),
    round(a[1] * b[0]),
    round(a[1] * b[1]),
  ];
}

// Utility: apply 4x4 matrix to 4-vector
function matMul4(M, v) {
  const out = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let c = 0; c < 4; c++) s += M[r][c] * v[c];
    out[r] = round(s);
  }
  return out;
}

// Build single-qubit-on-which-qubit 4x4 matrix by kron
function kron2x2(A, B) {
  const out = [];
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < 2; k++) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        for (let l = 0; l < 2; l++) {
          row.push(round(A[i][j] * B[k][l]));
        }
      }
      out.push(row);
    }
  }
  return out;
}

// single-qubit matrices
const I2 = [[1,0],[0,1]];
const X2 = [[0,1],[1,0]];
const Z2 = [[1,0],[0,-1]];
const H2 = [[INV_SQRT2, INV_SQRT2],[INV_SQRT2, -INV_SQRT2]];

// two-qubit 4x4 matrices for single-on-qubit
function singleOnMatrix(mat2, qubitIndex) {
  return (qubitIndex === 0) ? kron2x2(mat2, I2) : kron2x2(I2, mat2);
}

const CNOT_01 = [ // control qubit 0 -> target qubit 1 (|00,|01,|10,|11|)
  [1,0,0,0],
  [0,1,0,0],
  [0,0,0,1],
  [0,0,1,0],
];
const CNOT_10 = [ // control qubit 1 -> target 0
  [1,0,0,0],
  [0,0,1,0],
  [0,1,0,0],
  [0,0,0,1],
];

// Marginal probability for qubit i being 0
// convention: vector indices: 0->|00>,1->|01>,2->|10>,3->|11>
// qubitIndex 0 => most-significant (first), prob(0) = |a00|^2 + |a01|^2
// qubitIndex 1 => second, prob(0) = |a00|^2 + |a10|^2
function marginalProbZero(vec, qubitIndex) {
  // using amplitude real values
  const [a00, a01, a10, a11] = vec;
  if (qubitIndex === 0) return clamp(a00*a00 + a01*a01);
  return clamp(a00*a00 + a10*a10);
}

function clamp(x) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

// initial canonical product |00>
let currentVec = [1,0,0,0]; // amplitude vector
let currentSymbols = ["0","0"]; // symbol pair (kept in sync for product cases)

// API
app.post('/next-state', (req, res) => {
  const { action, state: incomingState, qubitIndex, control, target } = req.body;

  // If frontend provided state, prefer that (round values)
  if (Array.isArray(incomingState) && incomingState.length === 4) {
    currentVec = incomingState.map(round);
    // attempt to match to product canonical symbols; if not matched, symbols become ["?","?"]
    const m = matchProduct(currentVec);
    if (m.matched) {
      currentSymbols = m.symbols.slice();
      currentVec = m.vec.slice(); // use canonical rounded product vector
    } else {
      currentSymbols = ["?","?"];
    }
  } else {
    // otherwise ensure currentVec and currentSymbols are consistent
    const m = matchProduct(currentVec);
    if (m.matched) currentSymbols = m.symbols.slice();
    else currentSymbols = ["?","?"];
  }

  // Helper: respond with current state
  const respond = (vec, symbols) => {
    // ensure vector is 4 numbers rounded
    const outVec = (Array.isArray(vec) && vec.length===4) ? vec.map(round) : currentVec.map(round);
    const outSymbols = Array.isArray(symbols) ? symbols : currentSymbols;
    // persist
    currentVec = outVec.slice();
    currentSymbols = outSymbols.slice();
    return res.json({ newState: outVec, symbol: outSymbols });
  };

  try {
    switch (action) {
      case 'SET_ZERO': {
        // Only allowed before any gate applied? (frontend disables sets after gate) — backend simply performs requested set if product or fallback
        if (typeof qubitIndex !== 'number') return respond(currentVec, currentSymbols);

        const m = matchProduct(currentVec);
        if (m.matched) {
          const other = (qubitIndex === 0) ? m.symbols[1] : m.symbols[0];
          const s0 = (qubitIndex === 0) ? "0" : other;
          const s1 = (qubitIndex === 0) ? other : "0";
          const v = vecFromSymbols(s0, s1);
          return respond(v, [s0, s1]);
        } else {
          // fallback: set entire to |00>
          return respond([1,0,0,0], ["0","0"]);
        }
      }

      case 'SET_ONE': {
        if (typeof qubitIndex !== 'number') return respond(currentVec, currentSymbols);

        const m = matchProduct(currentVec);
        if (m.matched) {
          const other = (qubitIndex === 0) ? m.symbols[1] : m.symbols[0];
          const s0 = (qubitIndex === 0) ? "1" : other;
          const s1 = (qubitIndex === 0) ? other : "1";
          const v = vecFromSymbols(s0, s1);
          return respond(v, [s0, s1]);
        } else {
          // fallback: set to |10> if qubitIndex 0, or |01> if qubitIndex 1
          const fallback = (qubitIndex === 0) ? [0,0,1,0] : [0,1,0,0];
          const syms = (qubitIndex === 0) ? ["1","0"] : ["0","1"];
          return respond(fallback, syms);
        }
      }

      case 'H': {
        if (typeof qubitIndex !== 'number') return respond(currentVec, currentSymbols);

        // Only operate when product canonical symbol exists for the targeted qubit
        const m = matchProduct(currentVec);
        if (!m.matched) {
          // cannot deterministically apply → ignore
          return respond(currentVec, currentSymbols);
        }

        const sym = m.symbols[qubitIndex];
        if (!["0","1","+","-"].includes(sym)) return respond(currentVec, currentSymbols);

        // mapping: 0->+, 1->-, +->0, -->1
        let newSym = sym;
        if (sym === "0") newSym = "+";
        else if (sym === "1") newSym = "-";
        else if (sym === "+") newSym = "0";
        else if (sym === "-") newSym = "1";

        const newSymbols = m.symbols.slice();
        newSymbols[qubitIndex] = newSym;
        const v = vecFromSymbols(newSymbols[0], newSymbols[1]);
        return respond(v, newSymbols);
      }

      case 'X': {
        if (typeof qubitIndex !== 'number') return respond(currentVec, currentSymbols);
        const m = matchProduct(currentVec);
        if (!m.matched) return respond(currentVec, currentSymbols); // ignore if not canonical product
        const sym = m.symbols[qubitIndex];
        if (sym !== "0" && sym !== "1") {
          // X only allowed on basis states -> ignore
          return respond(currentVec, currentSymbols);
        }
        const newSym = (sym === "0") ? "1" : "0";
        const newSymbols = m.symbols.slice();
        newSymbols[qubitIndex] = newSym;
        const v = vecFromSymbols(newSymbols[0], newSymbols[1]);
        return respond(v, newSymbols);
      }

      case 'Z': {
        if (typeof qubitIndex !== 'number') return respond(currentVec, currentSymbols);
        const m = matchProduct(currentVec);
        if (!m.matched) return respond(currentVec, currentSymbols); // ignore if not canonical product
        const sym = m.symbols[qubitIndex];
        if (sym !== "+" && sym !== "-") {
          // Z only allowed on +/-
          return respond(currentVec, currentSymbols);
        }
        const newSym = (sym === "+") ? "-" : "+";
        const newSymbols = m.symbols.slice();
        newSymbols[qubitIndex] = newSym;
        const v = vecFromSymbols(newSymbols[0], newSymbols[1]);
        return respond(v, newSymbols);
      }

      case 'CNOT': {
        // Only allowed if both qubits are basis states (0/1) AND product
        if (typeof control !== 'number' || typeof target !== 'number') return respond(currentVec, currentSymbols);
        const m = matchProduct(currentVec);
        if (!m.matched) return respond(currentVec, currentSymbols);
        const s0 = m.symbols[0], s1 = m.symbols[1];
        // check both basis
        if (!((s0 === "0" || s0 === "1") && (s1 === "0" || s1 === "1"))) {
          return respond(currentVec, currentSymbols);
        }
        // perform classical CNOT on symbols
        const syms = m.symbols.slice();
        if (m.symbols[control] === "1") {
          // flip target
          syms[target] = (syms[target] === "0") ? "1" : "0";
        }
        const v = vecFromSymbols(syms[0], syms[1]);
        return respond(v, syms);
      }

      case 'MEASURE': {
        // Collapse per-qubit independently:
        // - if product canonical: collapse deterministically for 0/1, 50/50 for +/- for each qubit
        // - if not product: use marginals computed from amplitude squared and sample independently for each qubit
        const m = matchProduct(currentVec);
        if (m.matched) {
          const outSyms = m.symbols.slice();
          for (let q = 0; q <= 1; q++) {
            const sym = outSyms[q];
            if (sym === "+") {
              outSyms[q] = (Math.random() < 0.5) ? "0" : "1";
            } else if (sym === "-") {
              outSyms[q] = (Math.random() < 0.5) ? "0" : "1";
            } else {
              // sym is basis 0/1 -> stays same
            }
          }
          const v = vecFromSymbols(outSyms[0], outSyms[1]);
          return respond(v, outSyms);
        } else {
          // compute marginal probabilities and sample each qubit independently
          const p0_q0 = clamp(currentVec[0]*currentVec[0] + currentVec[1]*currentVec[1]);
          const p0_q1 = clamp(currentVec[0]*currentVec[0] + currentVec[2]*currentVec[2]);
          // sample
          const s0 = (Math.random() < p0_q0) ? "0" : "1";
          const s1 = (Math.random() < p0_q1) ? "0" : "1";
          const v = vecFromSymbols(s0, s1);
          return respond(v, [s0, s1]);
        }
      }

      default:
        return respond(currentVec, currentSymbols);
    }
  } catch (err) {
    console.error("server error:", err);
    return respond(currentVec, currentSymbols);
  }
});

app.listen(5000, () => console.log("Backend listening on :5000"));