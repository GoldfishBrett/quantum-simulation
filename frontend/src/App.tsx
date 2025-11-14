import {useState} from 'react';

import QubitsDisplay from './components/QubitsDisplay';
import ControlPanel from './components/ControlPanel';

import './App.css';

function arraysAlmostEqual(a: number[], b: number[], eps = 1e-9) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > eps) return false;
    }
    return true;
}

function App() {
    // Visual state (symbols)
    const [currentState, setCurrentState] = useState<string[]>(['0', '0']);

    // Math state: 4-vector
    const [quantumVector, setQuantumVector] = useState<number[]>([1, 0, 0, 0]);

    // Selected qubit
    const [activeQubit, setActiveQubit] = useState<number>(0);

    // Disable SET buttons after a gate is applied
    const [isGateApplied, setIsGateApplied] = useState<boolean>(false);

    // Prevent concurrent requests
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getNextStateFromBackend = async (
        action: string,
        state: number[],
        params: { qubitIndex?: number, control?: number, target?: number } = {}
    ) => {
        try {
            const response = await fetch("http://localhost:5000/next-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, state, ...params })
            });

            // handle non-OK responses gracefully
            if (!response.ok) {
                console.error("Backend returned HTTP", response.status);
                return { newState: state, symbol: ["?", "?"] };
            }

            return await response.json();
        } catch (error) {
            console.error("Error communicating with backend:", error);
            return { newState: state, symbol: ["?", "?"] };
        }
    };

    const handleAction = async (action: string) => {
        // prevent duplicate/concurrent requests
        if (isLoading) {
            console.debug("Ignoring action because request already in flight:", action);
            return;
        }

        // frontend disables SET buttons once a gate is applied,
        // but double-check to be safe: block SET_* if gate applied
        if (isGateApplied && (action === 'SET_ZERO' || action === 'SET_ONE')) {
            console.debug("SET action blocked because a gate has been applied");
            return;
        }

        setIsLoading(true);
        // Determine params
        let params: any;
        let isMeasurement = false;

        if (action === 'CNOT') {
            const control = activeQubit;
            const target = activeQubit === 0 ? 1 : 0;
            params = { control, target };
        } else {
            params = { qubitIndex: activeQubit };
        }

        if (action === 'MEASURE') isMeasurement = true;

        const result = await getNextStateFromBackend(action, quantumVector, params);
        // defend against bad payloads
        const newState = Array.isArray(result?.newState) && result.newState.length === 4
            ? result.newState.map((n: any) => Number(n)) // coerce to numbers
            : quantumVector.slice();

        const symbol = Array.isArray(result?.symbol) ? result.symbol : (result?.symbol ? [String(result.symbol), String(result.symbol)] : ["?", "?"]);

        console.debug("Action:", action, "Backend returned newState:", newState, "symbol:", symbol);

        // Only update quantumVector if it actually changed (reduces re-renders)
        if (!arraysAlmostEqual(newState, quantumVector)) {
            setQuantumVector(newState);
        } else {
            // still set the normalized vector if backend normalized slightly differently:
            setQuantumVector(prev => arraysAlmostEqual(prev, newState) ? prev : newState);
        }

        // Only update visual symbols if changed
        if (!Array.isArray(currentState) || currentState.length !== 2 || currentState[0] !== symbol[0] || currentState[1] !== symbol[1]) {
            setCurrentState(Array.isArray(symbol) ? symbol : [String(symbol || '?'), String(symbol || '?')]);
        }

        if (isMeasurement) {
            // measurement resets the "gate applied" lock
            setIsGateApplied(false);
        } else if (action !== 'SET_ZERO' && action !== 'SET_ONE') {
            // mark that a gate has been applied so SET buttons are disabled
            setIsGateApplied(true);
        }

        setIsLoading(false);
    };

    return (
        <div className="App">
            <header>
                <h1>Qubit Simulator</h1>
            </header>
            <main>
                <QubitsDisplay currentState={currentState} activeQubit={activeQubit} onQubitClick={setActiveQubit}/>

                <ControlPanel
                    isSetDisabled={isGateApplied}
                    isLoading={isLoading}
                    activeQubit={activeQubit}
                    onSetZero={() => handleAction('SET_ZERO')}
                    onSetOne={() => handleAction('SET_ONE')}
                    onHadamard={() => handleAction('H')}
                    onX={() => handleAction('X')}
                    onZ={() => handleAction('Z')}
                    onCNOT={() => handleAction('CNOT')}
                    onMeasure={() => handleAction('MEASURE')}
                />
            </main>
        </div>
    );
}

export default App;