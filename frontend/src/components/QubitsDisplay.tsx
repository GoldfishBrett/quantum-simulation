import { useEffect } from 'react';
import waterImage from '../assets/images/Water_(0).png';
import iceImage from '../assets/images/Ice_(1).png';
import iceOverWaterImage from '../assets/images/IceWater_(-).png';
import waterOverIceImage from '../assets/images/WaterIce_(+).png';

interface QubitsDisplayProps {
  currentState: any;
}

const QubitsDisplay: React.FC<QubitsDisplayProps> = ({ currentState }) => {
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
    switch (state) {
      case "0":
        return <img key={index} src={waterImage} alt="Water" />;
      case "1":
        return <img key={index} src={iceImage} alt="Ice" />;
      case "+":
        return <img key={index} src={waterOverIceImage} alt="Water over Ice" />;
      case "-":
        return <img key={index} src={iceOverWaterImage} alt="Ice over Water" />;
      default:
        return <div key={index} style={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>;
    }
  };

  return <div className="qubits-display">{safeState.map((state, index) => renderQubitImage(state, index))}</div>;
};

export default QubitsDisplay;