import "../styles/components/LoadingSpinner.css";

export function LoadingDots({ color = "white" }) {
  return (
    <div className="dots-container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
}

export default LoadingDots;