import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CashVariance {
  id: number;
  store_name: string;
  variance_date: string;
  expected_cash: number;
  actual_cash: number;
  variance: number;
  trend: string;
}

export default function CashVarianceAnalyticsView() {
  const [items, setItems] = useState<CashVariance[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    variance_date: "",
    expected_cash: "",
    actual_cash: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<CashVariance[]>(`/api/modules/pos_store_audit/cash_variances`);
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
    if (!form.store_name || !form.variance_date) return;
    try {
      await post(`/api/modules/pos_store_audit/cash_variances`, {
        ...form,
        expected_cash: Number(form.expected_cash),
        actual_cash: Number(form.actual_cash),
      });
      setForm({ store_name: "", variance_date: "", expected_cash: "", actual_cash: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/cash_variances/${id}`);
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
                <th>Variance Date</th>
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
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.variance_date}</td>
                  <td>{Number(it.expected_cash).toLocaleString()}</td>
                  <td>{Number(it.actual_cash).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.variance < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.variance).toLocaleString()}
                    </span>
                  </td>
                  <td>{it.trend}</td>
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
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Variance Date</label>
          <input className="input" type="date" value={form.variance_date} onChange={(e) => setForm({ ...form, variance_date: e.target.value })} required />
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
