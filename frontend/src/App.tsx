import { useState } from 'react';

import QubitsDisplay from './components/QubitsDisplay';
import ControlPanel from './components/ControlPanel';

import './App.css';

function App() {
    // Start in the |00> state.
    // The visual state is an array of two strings: ['0', '0']
    const [currentState, setCurrentState] = useState<string[]>(['0', '0']);

    // The math state is a tensor product of two qubits.
    // |00> = [1, 0, 0, 0]
    const [quantumVector, setQuantumVector] = useState<number[]>([1, 0, 0, 0]);

    // Track which qubit is currently selected (0 for Q1, 1 for Q2)
    const [activeQubit, setActiveQubit] = useState<number>(0);

    // Track if a gate has been applied to disable SET buttons
    const [isGateApplied, setIsGateApplied] = useState<boolean>(false);

    const getNextStateFromBackend = async (
        action: string,
        state: number[],
        params: { qubitIndex?: number, control?: number, target?: number } = {}
    ) => {
        try {
            // We send the action (e.g., "H"), the current vector, and which qubit(s) to target.
            const response = await fetch("http://localhost:5000/next-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, state, ...params })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error communicating with backend:", error);
            return { newState: state, symbol: ["?", "?"] };
        }
    };

    const handleAction = async (action: string) => {
        // Determine params based on action type
        let params = {};
        let isMeasurement = false;

        if (action === 'CNOT') {
            // The currently Active Qubit is Control. The other is Target.
            const control = activeQubit;
            const target = activeQubit === 0 ? 1 : 0;
            params = { control, target };
        } else {
            // Single qubit operations apply to the active qubit
            params = { qubitIndex: activeQubit };
        }

        if (action === 'MEASURE') {
            isMeasurement = true;
        }

        const { newState, symbol } = await getNextStateFromBackend(action, quantumVector, params);
        console.log(`New quantum state: ${newState}, symbol: ${symbol}`);

        setQuantumVector(newState);

        // Backend should return an array of symbols for 2 qubits like ["0", "1"]
        // We fall back to '?' if something goes wrong
        setCurrentState(Array.isArray(symbol) ? symbol : [String(symbol || '?'), String(symbol || '?')]);

        if (isMeasurement) {
            setIsGateApplied(false);
        } else if (action !== 'SET_ZERO' && action !== 'SET_ONE') {
            // If any gate is applied, we block the set buttons
            setIsGateApplied(true);
        }
    };

// Pass the state to QubitsDisplay
    // Pass simple functions to ControlPanel that call handleAction
    return (
        <div className="App">
            <header>
                <h1>Qubit Simulator</h1>
            </header>
            <main>
                <QubitsDisplay currentState={currentState} />

                <ControlPanel
                    isSetDisabled={isGateApplied}
                    activeQubit={activeQubit}
                    onSelectQubit={setActiveQubit}
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