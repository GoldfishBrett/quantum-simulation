import { useEffect } from 'react';
import waterImage from '../assets/images/Water_(0).png';
import iceImage from '../assets/images/Ice_(1).png';
import iceOverWaterImage from '../assets/images/IceWater_(-).png';
import waterOverIceImage from '../assets/images/WaterIce_(+).png';

interface QubitsDisplayProps {
  currentState: any;
  activeQubit: number;
  onQubitClick: (index: number) => void;
}

const QubitsDisplay: React.FC<QubitsDisplayProps> = ({
  currentState,
  activeQubit,
  onQubitClick
}) => {

  useEffect(() => {
    console.log("QubitsDisplay received:", currentState);
  }, [currentState]);

  let safeState: string[];

  if (Array.isArray(currentState) && currentState.length >= 2) {
    // assume first two entries are the two qubit symbols
    safeState = [String(currentState[0]), String(currentState[1])];
  } else if (Array.isArray(currentState) && currentState.length === 1) {
    safeState = [String(currentState[0]), "?"];
  } else if (typeof currentState === "string") {
    safeState = [currentState, "?"];
  } else if (currentState && typeof currentState === "object" && "symbol" in currentState) {
    const s = (currentState as any).symbol;
    if (Array.isArray(s)) safeState = [String(s[0]), String(s[1])];
    else safeState = [String(s), "?"];
  } else {
    safeState = ["?", "?"];
  }

  const renderQubitImage = (state: string, index: number) => {
    const isSelected = activeQubit === index;
    const className = isSelected ? "selected" : "";

    const commonProps = {
      key: index,
      className: className,
    };

    switch (state) {
      case "0":
        return <img {...commonProps} src={waterImage} alt="Water" />;
      case "1":
        return <img {...commonProps} src={iceImage} alt="Ice" />;
      case "+":
        return <img {...commonProps} src={waterOverIceImage} alt="Water over Ice" />;
      case "-":
        return <img {...commonProps} src={iceOverWaterImage} alt="Ice over Water" />;
      default:
        return (
          <div {...commonProps} className={`qubit-unknown ${className}`}>
            ?
          </div>
        );
    }
  };

  return (
    <div className="qubits-display">
      {safeState.map((state, index) => (
        <div key={index} className="qubit-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 10px' }}>
          <button
            className={`qubit-label-btn ${activeQubit === index ? 'selected' : ''}`}
            style={{
              marginBottom: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '8px 16px',
              border: activeQubit === index ? '2px solid #ffcc00' : '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: activeQubit === index ? '#fff8e1' : '#f0f0f0',
              fontSize: '1rem'
            }}
            onClick={() => onQubitClick(index)}
          >
            Qubit {index + 1}
          </button>
          {renderQubitImage(state, index)}
        </div>
      ))}
    </div>
  );
};

export default QubitsDisplay;