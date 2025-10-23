import waterImage from '../assets/images/Water_(0).png';
import iceImage from '../assets/images/ice_(1).png';
import iceOverWaterImage from '../assets/images/IceWater_(-).png';
import waterOverIceImage from '../assets/images/WaterIce_(+).png';

interface QubitsDisplayProps {
  currentState: string[];
}

const QubitsDisplay: React.FC<QubitsDisplayProps> = ({ currentState }) => {
    const renderQubitImage = (state: string, index: number) => {
        switch (state) {
        case '0':
            return <img key={index} src={waterImage} alt="Water" />;
        case '1':
            return <img key={index} src={iceImage} alt="Ice" />;
        case '-':
            return <img key={index} src={iceOverWaterImage} alt="Ice over Water" />;
        case '+':
            return <img key={index} src={waterOverIceImage} alt="Water over Ice" />;
        default:
            return null;
        }
    };

    return (
        <div className="qubits-display">
        {currentState.map((state, index) => renderQubitImage(state, index))}
        </div>
    );
}

export default QubitsDisplay;