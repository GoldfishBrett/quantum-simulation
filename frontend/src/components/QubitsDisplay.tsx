import waterImage from '../assets/images/Water_(0).png';
import iceImage from '../assets/images/ice_(1).png';
import iceOverWaterImage from '../assets/images/IceWater_(-).png';
import waterOverIceImage from '../assets/images/WaterIce_(+).png';

interface QubitsDisplayProps {
  currentState: any;
}

const QubitsDisplay: React.FC<QubitsDisplayProps> = ({ currentState }) => {
  console.log("QubitsDisplay received:", currentState);
  
  let safeState: string[];

  if (Array.isArray(currentState)) {
    safeState = currentState.map((s) => String(s));
  } else if (typeof currentState === "string") {
    safeState = [currentState];
  } else if (currentState && typeof currentState === "object" && "symbol" in currentState) {
    safeState = [String((currentState as any).symbol)];
  } else {
    safeState = ["?"];
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
        return <div key={index}>?</div>;
    }
  };

  return <div className="qubits-display">{safeState.map((state, index) => renderQubitImage(state, index))}</div>;
};

export default QubitsDisplay;