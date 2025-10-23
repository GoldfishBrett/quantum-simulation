import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const GATES = {
    X: [[0, 1], [1, 0]],
    H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]],
    Z: [[1, 0], [0, -1]]
}

function applyGate(matrix, vector) {
    const [[m00, m01], [m10, m11]] = matrix;
    const [a, b] = vector;
    const newState = [m00 * a + m01 * b, m10 * a + m11 * b];
    return newState;
}

function identifyState([a, b]) {
    const tol = 0.001;
    if (Math.abs(a - 1) < tol && Math.abs(b) < tol) return "0";
    if (Math.abs(a) < tol && Math.abs(b - 1) < tol) return "1";
    if (Math.abs(a) < tol && Math.abs(b + 1) < tol) return "1";
    if (Math.abs(a + 1) < tol && Math.abs(b) < tol) return "0";
    if (Math.abs(a - 1/Math.sqrt(2)) < tol && Math.abs(b - 1/Math.sqrt(2)) < tol) return "+";
    if (Math.abs(a - 1/Math.sqrt(2)) < tol && Math.abs(b + 1/Math.sqrt(2)) < tol) return "-";
    if (Math.abs(a + 1/Math.sqrt(2)) < tol && Math.abs(b - 1/Math.sqrt(2)) < tol) return "-";
    if (Math.abs(a + 1/Math.sqrt(2)) < tol && Math.abs(b + 1/Math.sqrt(2)) < tol) return "+";
    return "?";
}

function measure(state) {
    const [a, b] = state;
    const p0 = a ** 2;
    const p1 = b ** 2;
    return Math.random() < p0 ? [1, 0] : [0, 1];
}

app.post('/next-state', (req, res) => {
  const { action, state } = req.body;

  let newState = state;

  switch (action) {
    case 'SET_ZERO':
      newState = [1, 0];
      break;
    case 'SET_ONE':
      newState = [0, 1];
      break;
    case 'H':
      newState = applyGate(GATES.H, newState);
      break;
    case 'X':
      newState = applyGate(GATES.X, newState);
      break;
    case 'Z':
      newState = applyGate(GATES.Z, newState);
      break;
    case 'MEASURE':
      newState = measure(newState);
      break;
    default:
      break;
  }

    const symbol = identifyState(newState) || '?';

    res.json({ newState, symbol });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});