export default function PieLegend({ items }) {
  if (!items?.length) return null;

  return (
    <div className="pie-legend">
      {items.map((item) => (
        <span key={item.name} className="pie-legend-item">
          <span className="pie-legend-dot" style={{ backgroundColor: item.color }} />
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  );
}
