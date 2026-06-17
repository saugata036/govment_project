import { statusColor, statusLabel, TEAL } from '../utils/scoring';

function ScoreRing({ score, color }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="header-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TEAL[100]}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="header-ring-center">
        <div className="header-ring-text">
          <span className="header-ring-value">{score}</span>
          <span className="header-ring-unit">%</span>
        </div>
      </div>
    </div>
  );
}

export default function HeaderScorePanel({ score, status }) {
  const color = statusColor(status);

  return (
    <div className="header-score-panel">
      <div className="header-panel-section header-panel-score">
        <span className="header-panel-label">Overall Score</span>
        <div className="header-panel-body">
          <ScoreRing score={score} color={color} />
        </div>
      </div>

      <div className="header-panel-divider" aria-hidden="true" />

      <div className={`header-panel-section header-panel-status ${status}`}>
        <span className="header-panel-label">Readiness Status</span>
        <div className="header-panel-body">
          <div className="header-status-display">
            <span className="header-status-indicator" style={{ backgroundColor: color }} />
            <span className="header-status-text" style={{ color }}>
              {statusLabel(status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
