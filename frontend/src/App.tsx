import { useState } from 'react';

import QubitsDisplay from './components/QubitsDisplay';
import ControlPanel from './components/ControlPanel';

import './App.css';

function App() {
    // Start in the |0> state ('0')
    const [currentState, setCurrentState] = useState<string[]>(['0']);

    // SIMULATING THE BACKEND LOGIC
    const getNextStateFromBackend = (action: string, state: string[]): string[] => {
        console.log(`Sending action to backend: ${action}`);

        // --- TODO: REPLACE THIS LOGIC ---
        const [current] = state;
        let newState = current;

        switch (action) {
            case 'SET_ZERO':
                newState = '0';
                break;
            case 'SET_ONE':
                newState = '1';
                break;
            case 'H':
                if (current === '0') newState = '+';
                else if (current === '1') newState = '-';
                else if (current === '+') newState = '0';
                else if (current === '-') newState = '1';
                break;
            case 'X':
                if (current === '0') newState = '1';
                else if (current === '1') newState = '0';
                break;
            case 'Z':
                if (current === '+') newState = '-';
                else if (current === '-') newState = '+';
                break;
            case 'MEASURE':
                if (current === '+' || current === '-') {
                    newState = Math.random() < 0.5 ? '0' : '1';
                }
                break;
            default:
                break;
        }
// todo: End of replacing -----------------------------------------------------------------------------

        return [newState];
    };

    const handleAction = (action: string) => {
        // Pass the action and current state to backend
        const newState = getNextStateFromBackend(action, currentState);

        // Update the state with what was returned
        setCurrentState(newState);
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