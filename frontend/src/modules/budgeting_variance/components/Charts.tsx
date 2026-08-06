import type { ChartBarItem, ChartSparkItem } from "../types";

export function BarChartPanel({ title, items, footnote }: {
  title: string;
  items: ChartBarItem[];
  footnote?: string;
}) {
  return (
    <div className="card">
      <div className="bgt-card-head"><h3>{title}</h3></div>
      <div className="bgt-card-body">
        {items.map((item) => (
          <BarRow key={item.label} {...item} />
        ))}
        {footnote && (
          <p className="bgt-chart-footnote">{footnote}</p>
        )}
      </div>
    </div>
  );
}

export function SparkChartPanel({ title, items, footnote }: {
  title: string;
  items: ChartSparkItem[];
  footnote?: string;
}) {
  const maxVal = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div className="card">
      <div className="bgt-card-head"><h3>{title}</h3></div>
      <div className="bgt-card-body">
        <div className="bgt-spark">
          {items.map((item) => (
            <div
              key={item.label}
              className={`bgt-spark-bar ${item.direction}`}
              style={{ height: `${Math.max(4, (Math.abs(item.value) / maxVal) * 100)}%` }}
              title={`${item.label}: ${item.value > 0 ? "+" : ""}${item.value}%`}
            />
          ))}
        </div>
        <div className="bgt-spark-labels">
          {items.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
        {footnote && (
          <div className="bgt-spark-label">
            <span>← Under-forecast</span>
            <span>{footnote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BarRow({ label, budget, actual, negative }: ChartBarItem) {
  const pct = budget > 0 ? Math.min((actual / budget) * 100, 100) : 0;
  const diff = actual - budget;
  return (
    <div className="bgt-bar-row">
      <span className="bgt-bar-label">{label}</span>
      <div className="bgt-bar-track">
        <div className="bgt-bar-budget" style={{ width: `${100 - pct}%` }} />
        {pct > 0 && <div className="bgt-bar-actual" style={{ width: `${pct}%` }} />}
      </div>
      <span className={`bgt-bar-value ${negative ? "negative" : "positive"}`}>
        {diff > 0 ? "+" : ""}{diff}
      </span>
    </div>
  );
}

export { BarRow };
