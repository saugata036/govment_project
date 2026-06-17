import { getKpiProgress, progressColor } from '../utils/scoring';

function getBarColor(progress) {
  return progressColor(progress);
}

export default function KPIProgressBar({ kpi, onChange, compact = false }) {
  const progress = getKpiProgress(kpi);
  const barColor = getBarColor(progress);
  const max = kpi.targetValue === 0 ? Math.max(kpi.currentValue, 10) : kpi.targetValue;

  return (
    <div className={`tableau-kpi-row ${compact ? 'compact' : ''}`}>
      <div className="tableau-kpi-row-top">
        <span className="tableau-kpi-row-name" title={kpi.name}>
          {kpi.name}
        </span>
        <span className="tableau-kpi-row-value">
          <strong style={{ color: barColor }}>{kpi.currentValue}</strong>
          <span className="tableau-kpi-row-sep">/</span>
          <span>{kpi.targetValue}</span>
          <span className="tableau-kpi-row-unit">{kpi.unit}</span>
        </span>
      </div>

      <div className="tableau-kpi-bar-wrap">
        <div className="tableau-kpi-bar-track">
          <div
            className="tableau-kpi-bar-fill"
            style={{ width: `${progress}%`, backgroundColor: barColor }}
          />
          <div className="tableau-kpi-bar-target" style={{ left: '100%' }} />
        </div>
        <span className="tableau-kpi-bar-pct" style={{ color: barColor }}>
          {progress}%
        </span>
      </div>

      <div className="tableau-kpi-slider-wrap">
        <input
          type="range"
          className="tableau-kpi-slider"
          min={0}
          max={max}
          value={kpi.currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ '--slider-color': barColor }}
          aria-label={`Adjust ${kpi.name}`}
        />
        <div className="tableau-kpi-slider-labels">
          <span>0</span>
          <span className="tableau-kpi-weight">Weight {kpi.weight}%</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

export function KPICard({ label, value, sub, color }) {
  return (
    <div className="tableau-kpi-card">
      <div className="tableau-kpi-card-label">{label}</div>
      <div className="tableau-kpi-card-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && <div className="tableau-kpi-card-sub">{sub}</div>}
    </div>
  );
}
