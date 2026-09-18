/**
 * Deliberately hand-rolled instead of pulling in a chart library — the
 * dashboard only needs simple bar charts, so a small SVG component keeps
 * the dependency list unchanged (per "do not add unnecessary libraries").
 */
export default function BarChart({ data = [], valueFormatter = (v) => v, height = 220 }) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-charcoal-soft"
        style={{ height }}
      >
        No data for this period.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 24);
          const x = i * barWidth;
          return (
            <g key={d.label}>
              <rect
                x={x + barWidth * 0.15}
                y={height - 24 - barHeight}
                width={barWidth * 0.7}
                height={Math.max(barHeight, d.value > 0 ? 1 : 0)}
                className="fill-rose"
                rx="1"
              >
                <title>{`${d.label}: ${valueFormatter(d.value)}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex text-[10px] text-charcoal-soft">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="text-center truncate"
            style={{ width: `${barWidth}%`, display: data.length > 14 && i % Math.ceil(data.length / 10) !== 0 ? "none" : "block" }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
