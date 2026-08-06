import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CashVariance {
  id: number;
  store_id: string;
  date: string;
  expected_cash: number;
  actual_cash: number;
  variance: number;
  trend_flag: string;
  notes: string;
}

export default function CashVarianceAnalyticsView() {
  const [items, setItems] = useState<CashVariance[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    date: "",
    expected_cash: "",
    actual_cash: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/cash-variance";

  async function load() {
    setLoading(true);
    try {
      const data = await get<CashVariance[]>(ENDPOINT);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.store_id || !form.date) return;
    try {
      const expected_cash = Number(form.expected_cash);
      const actual_cash = Number(form.actual_cash);
      await post(ENDPOINT, {
        store_id: form.store_id,
        date: form.date,
        expected_cash,
        actual_cash,
        variance: Number((expected_cash - actual_cash).toFixed(2)),
        trend_flag: Math.abs(expected_cash - actual_cash) > 500 ? "elevated" : "normal",
      });
      setForm({ store_id: "", date: "", expected_cash: "", actual_cash: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`${ENDPOINT}/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Cash Variance Analytics</h3>
          <span className="badge badge-success">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading cash variance records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Date</th>
                <th>Expected Cash</th>
                <th>Actual Cash</th>
                <th>Variance</th>
                <th>Trend</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.date}</td>
                  <td>{Number(it.expected_cash).toLocaleString()}</td>
                  <td>{Number(it.actual_cash).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.variance < 0 ? "var(--danger)" : it.variance > 0 ? "var(--gold-strong)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.variance).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${it.trend_flag === "elevated" ? "badge-danger" : "badge-success"}`}>
                      {it.trend_flag}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No cash variance records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Cash Variance</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Variance Date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Expected Cash</label>
          <input className="input" type="number" value={form.expected_cash} onChange={(e) => setForm({ ...form, expected_cash: e.target.value })} placeholder="e.g. 50000" required />
        </div>
        <div className="field">
          <label>Actual Cash</label>
          <input className="input" type="number" value={form.actual_cash} onChange={(e) => setForm({ ...form, actual_cash: e.target.value })} placeholder="e.g. 49800" required />
        </div>
        <button className="btn btn-primary btn-block">Save Variance</button>
      </form>
    </div>
  );
}
