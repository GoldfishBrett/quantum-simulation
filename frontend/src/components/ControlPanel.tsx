import React from 'react';

interface ControlPanelProps {
    isSetDisabled: boolean;
    isLoading?: boolean;
    activeQubit: number;
    onSetZero: () => void;
    onSetOne: () => void;
    onHadamard: () => void;
    onX: () => void;
    onZ: () => void;
    onCNOT: () => void;
    onOracle: () => void;
    onMeasure: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    isSetDisabled,
    isLoading = false,
    activeQubit,
    onSetZero,
    onSetOne,
    onHadamard,
    onX,
    onZ,
    onCNOT,
    onOracle,
    onMeasure
}) => {
    const globalDisabled = isLoading; // if loading, disable everything to avoid racing

    return (
        <div className="control-panel-container">
            <div className="control-panel-row">
                <button onClick={onSetZero} disabled={isSetDisabled || globalDisabled}>
                    Set |0⟩
                </button>
                <button onClick={onSetOne} disabled={isSetDisabled || globalDisabled}>
                    Set |1⟩
                </button>
            </div>

            <div className="control-panel-row">
                <button onClick={onHadamard} disabled={globalDisabled}>Hadamard (H)</button>
                <button onClick={onX} disabled={globalDisabled}>Pauli-X (X)</button>
                <button onClick={onZ} disabled={globalDisabled}>Pauli-Z (Z)</button>
            </div>

            <div className="control-panel-row">
                <button onClick={onCNOT} disabled={globalDisabled}>
                    CNOT ({activeQubit === 0 ? 'Q1 → Q2' : 'Q2 → Q1'})
                </button>
                <button onClick={onOracle} disabled={globalDisabled}>
                    Oracle
                </button>
                <button onClick={onMeasure} className="measure-button" disabled={globalDisabled}>
                    Measure
                </button>
            </div>
        </div>
    );
}

export default ControlPanel;