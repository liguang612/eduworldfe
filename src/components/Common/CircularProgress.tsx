interface CircularProgressProps {
  percentage: number;
  sqSize?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  sqSize = 60,
  strokeWidth = 6,
}) => {
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  let progressColor = "text-green-500";
  if (percentage < 50) {
    progressColor = "text-red-500";
  } else if (percentage < 75) {
    progressColor = "text-yellow-500";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: sqSize, height: sqSize }}>
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="text-gray-300"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          className={`${progressColor} transition-all duration-300 ease-in-out`}
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            strokeLinecap: 'round',
          }}
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <span className={`absolute text-xs font-semibold ${progressColor.replace('text-', 'text-')}`}>
        {`${Math.round(percentage)}%`}
      </span>
    </div>
  );
};
