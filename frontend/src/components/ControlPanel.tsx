interface ControlPanelProps {
    onSetZero: () => void
    onSetOne: () => void
    onHadamard: () => void
    onX: () => void
    onZ: () => void
    onMeasure: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onSetZero, onSetOne, onHadamard, onX, onZ, onMeasure }) => {
    return (
        <div className="control-panel">
            <button onClick={onSetZero}>Set to |0⟩</button>
            <button onClick={onSetOne}>Set to |1⟩</button>
            <button onClick={onHadamard}>Hadamard (H)</button>
            <button onClick={onX}>Pauli-X (X)</button>
            <button onClick={onZ}>Pauli-Z (Z)</button>
            <button onClick={onMeasure}>Measure</button>
        </div>
    );
}

export default ControlPanel;