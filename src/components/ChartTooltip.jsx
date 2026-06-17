export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="tableau-tooltip">
      {label && <div className="tableau-tooltip-title">{label}</div>}
      {payload.map((entry) => (
        <div key={entry.name} className="tableau-tooltip-row">
          <span
            className="tableau-tooltip-dot"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="tableau-tooltip-name">{entry.name}</span>
          <span className="tableau-tooltip-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
