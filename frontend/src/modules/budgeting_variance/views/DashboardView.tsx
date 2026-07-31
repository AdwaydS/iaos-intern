import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";
import { BarRow } from "../components/Charts";
import { LoadingState } from "../components/StateViews";
import { DASHBOARD_WIDGET_LINKS } from "../constants/pages";
import type { KPISummary } from "../types";

const SLUG = "budgeting_variance";

interface DashboardViewProps {
  onNavigate: (pageId: number) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [kpi, setKPI] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<KPISummary>(`/api/modules/${SLUG}/kpi-summary`)
      .then(setKPI)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard…" />;

  const nav = (widget: string) => () => {
    const id = DASHBOARD_WIDGET_LINKS[widget];
    if (id) onNavigate(id);
  };

  return (
    <div>
      <div className="bgt-kpi-strip">
        <div className="card bgt-kpi">
          <span className="bgt-kpi-icon tone-navy"><Icon name="activity" size={20} /></span>
          <div className="bgt-kpi-body">
            <span className="bgt-kpi-value">{kpi?.live_risk_score ?? "—"}%</span>
            <span className="bgt-kpi-label">Live Risk Score</span>
          </div>
        </div>
        <div className="card bgt-kpi">
          <span className="bgt-kpi-icon tone-gold"><Icon name="alert-triangle" size={20} /></span>
          <div className="bgt-kpi-body">
            <span className="bgt-kpi-value">{kpi?.open_exceptions_count ?? "—"}</span>
            <span className="bgt-kpi-label">Open Exceptions</span>
          </div>
        </div>
        <div className="card bgt-kpi">
          <span className="bgt-kpi-icon tone-success"><Icon name="check" size={20} /></span>
          <div className="bgt-kpi-body">
            <span className="bgt-kpi-value">{kpi?.testing_coverage_pct ?? "—"}%</span>
            <span className="bgt-kpi-label">Testing Coverage</span>
          </div>
        </div>
        <div className="card bgt-kpi">
          <span className="bgt-kpi-icon tone-navy"><Icon name="trending-up" size={20} /></span>
          <div className="bgt-kpi-body">
            <span className="bgt-kpi-value">{kpi?.action_tracker_rate ?? "—"}%</span>
            <span className="bgt-kpi-label">Action Tracker Rate</span>
          </div>
        </div>
      </div>

      <div className="bgt-dash-grid">
        <button type="button" className="card bgt-dash-widget" onClick={nav("budget-vs-actual")}>
          <div className="bgt-card-head"><h3>Budget vs Actual — by Head</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <BarRow label="Salaries" budget={120} actual={118} />
            <BarRow label="Marketing" budget={80} actual={92} negative />
            <BarRow label="IT Infra" budget={60} actual={55} />
            <BarRow label="Travel" budget={30} actual={34} negative />
            <BarRow label="Supplies" budget={20} actual={18} />
          </div>
        </button>

        <button type="button" className="card bgt-dash-widget" onClick={nav("cost-driver-trend")}>
          <div className="bgt-card-head"><h3>Cost-Driver Trends</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <BarRow label="Volume" budget={100} actual={108} negative />
            <BarRow label="Price" budget={100} actual={96} />
            <BarRow label="Mix" budget={40} actual={42} negative />
            <BarRow label="Exchange" budget={20} actual={19} />
            <BarRow label="Productivity" budget={30} actual={28} />
          </div>
        </button>

        <button type="button" className="card bgt-dash-widget" onClick={nav("pre-approval-timing")}>
          <div className="bgt-card-head"><h3>Pre-Approval Timing</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <BarRow label="CC-1001" budget={100} actual={87} />
            <BarRow label="CC-1002" budget={100} actual={112} negative />
            <BarRow label="CC-1003" budget={100} actual={125} negative />
            <BarRow label="CC-1004" budget={100} actual={94} />
            <BarRow label="CC-1005" budget={100} actual={0} />
            <p className="bgt-chart-footnote">% approved before period start (target 100%)</p>
          </div>
        </button>

        <button type="button" className="card bgt-dash-widget" onClick={nav("chronic-overspend")}>
          <div className="bgt-card-head"><h3>Chronic Overspend Heads</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <BarRow label="CC-1001 (Salaries)" budget={100} actual={121} negative />
            <BarRow label="CC-1003 (Mktg)" budget={100} actual={115} negative />
            <BarRow label="CC-1002 (Travel)" budget={100} actual={109} negative />
            <p className="bgt-chart-footnote">Heads consistently exceeding budget by &gt;5% for 3+ periods</p>
          </div>
        </button>

        <button type="button" className="card bgt-dash-widget bgt-dash-full" onClick={nav("forecast-bias")}>
          <div className="bgt-card-head"><h3>Forecast-to-Actual Bias</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <div className="bgt-spark">
              <div className="bgt-spark-bar over" style={{ height: "70%" }} title="Jan: +8%" />
              <div className="bgt-spark-bar under" style={{ height: "20%" }} title="Feb: -5%" />
              <div className="bgt-spark-bar over" style={{ height: "55%" }} title="Mar: +6%" />
              <div className="bgt-spark-bar over" style={{ height: "80%" }} title="Apr: +10%" />
              <div className="bgt-spark-bar under" style={{ height: "30%" }} title="May: -3%" />
              <div className="bgt-spark-bar over" style={{ height: "65%" }} title="Jun: +7%" />
              <div className="bgt-spark-bar over" style={{ height: "90%" }} title="Jul: +12%" />
              <div className="bgt-spark-bar under" style={{ height: "15%" }} title="Aug: -2%" />
              <div className="bgt-spark-bar over" style={{ height: "50%" }} title="Sep: +5%" />
              <div className="bgt-spark-bar over" style={{ height: "75%" }} title="Oct: +9%" />
              <div className="bgt-spark-bar under" style={{ height: "25%" }} title="Nov: -4%" />
              <div className="bgt-spark-bar over" style={{ height: "60%" }} title="Dec: +6%" />
            </div>
            <div className="bgt-spark-label">
              <span>← Under-forecast (bias toward over)</span>
              <span>Red bars = Actual &gt; Forecast</span>
            </div>
          </div>
        </button>

        <button type="button" className="card bgt-dash-widget bgt-dash-full" onClick={nav("unspent-parked")}>
          <div className="bgt-card-head"><h3>Unspent / Parked Budget (Year-End Spike)</h3><Icon name="chevron-right" size={16} /></div>
          <div className="bgt-card-body">
            <div className="bgt-kpi-strip bgt-dash-mini-kpis">
              {[
                { q: "Q1", v: "8%" },
                { q: "Q2", v: "6%" },
                { q: "Q3", v: "9%" },
                { q: "Q4 (Oct)", v: "15%" },
                { q: "Q4 (Nov)", v: "28%" },
                { q: "Q4 (Dec)", v: "44%" },
              ].map((m) => (
                <div key={m.q} className="card bgt-kpi bgt-kpi-mini">
                  <div className="bgt-kpi-body">
                    <span className="bgt-kpi-value">{m.v}</span>
                    <span className="bgt-kpi-label">{m.q}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="bgt-chart-footnote danger">
              Q4 spend-it-or-lose-it spike — 44% of annual parked budget released in December
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
