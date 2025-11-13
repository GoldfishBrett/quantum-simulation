import React from 'react';

interface ControlPanelProps {
    isSetDisabled: boolean;
    activeQubit: number;
    onSelectQubit: (index: number) => void;
    onSetZero: () => void;
    onSetOne: () => void;
    onHadamard: () => void;
    onX: () => void;
    onZ: () => void;
    onCNOT: () => void;
    onMeasure: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
                                                       isSetDisabled,
                                                       activeQubit,
                                                       onSelectQubit,
                                                       onSetZero,
                                                       onSetOne,
                                                       onHadamard,
                                                       onX,
                                                       onZ,
                                                       onCNOT,
                                                       onMeasure
                                                   }) => {
    return (
        <div className="control-panel-container">
            {/* Qubit Selector */}
            <div className="qubit-selector">
                <label>Select Active Qubit:</label>
                <label>
                    <input type="radio" name="qubit" checked={activeQubit === 0} onChange={() => onSelectQubit(0)}/>
                    Qubit 1
                </label>
                <label>
                    <input type="radio" name="qubit" checked={activeQubit === 1} onChange={() => onSelectQubit(1)}/>
                    Qubit 2
                </label>
            </div>

            {/* Set Qubit Buttons */}
            <div className="control-panel-row">
                <button onClick={onSetZero} disabled={isSetDisabled}>
                    Set |0⟩
                </button>
                <button onClick={onSetOne} disabled={isSetDisabled}>
                    Set |1⟩
                </button>
            </div>

            {/* Single Gate Buttons */}
            <div className="control-panel-row">
                <button onClick={onHadamard}>Hadamard (H)</button>
                <button onClick={onX}>Pauli-X (X)</button>
                <button onClick={onZ}>Pauli-Z (Z)</button>
            </div>

            {/* CNOT and Measure */}
            <div className="control-panel-row">
                <button onClick={onCNOT}>
                    CNOT ({activeQubit === 0 ? 'Q1 → Q2' : 'Q2 → Q1'})
                </button>
                <button onClick={onMeasure} className="measure-button">
                    Measure
                </button>
            </div>
        </div>
    );
}

export default ControlPanel;