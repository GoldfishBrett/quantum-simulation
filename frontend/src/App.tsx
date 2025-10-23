import { useState } from 'react';

import QubitsDisplay from './components/QubitsDisplay';
import ControlPanel from './components/ControlPanel';

import './App.css';

function App() {
    // Start in the |0> state ('0')
    const [currentState, setCurrentState] = useState<string[]>(['0']);
    const [quantumVector, setQuantumVector] = useState<number[]>([1, 0]);


    const getNextStateFromBackend = async (action: string, state: number[]) => {
        try {
            const response = await fetch("http://localhost:5000/next-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, state })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error communicating with backend:", error);
            return { newState: state, symbol: "?" };
        }
    };

    const handleAction = async (action: string) => {
        const { newState, symbol } = await getNextStateFromBackend(action, quantumVector);
        console.log(`New quantum state: ${newState}, symbol: ${symbol}`);

        setQuantumVector(newState);
        setCurrentState(Array.isArray(symbol) ? symbol : [String(symbol || '?')]);
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
                    onSetZero={() => handleAction('SET_ZERO')}
                    onSetOne={() => handleAction('SET_ONE')}
                    onHadamard={() => handleAction('H')}
                    onX={() => handleAction('X')}
                    onZ={() => handleAction('Z')}
                    onMeasure={() => handleAction('MEASURE')}
                />
            </main>
        </div>
    );
}

export default App;