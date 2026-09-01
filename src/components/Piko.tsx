type PikoProps = {
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
};

function Piko({
  size = "medium",
  message,
  className = "",
}: PikoProps) {
  return (
    <div className={`piko-wrapper piko-${size} ${className}`}>
      <div className="piko-mascot">
        <div className="piko-glow"></div>

        <div className="piko-rocket">
          🚀
        </div>

        <span className="piko-spark spark-one">✦</span>
        <span className="piko-spark spark-two">✧</span>
        <span className="piko-spark spark-three">·</span>
      </div>

      {message && (
        <div className="piko-message">
          {message}
        </div>
      )}
    </div>
  );
}

export default Piko;