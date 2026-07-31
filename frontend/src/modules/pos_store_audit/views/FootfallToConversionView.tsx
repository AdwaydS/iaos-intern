import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Footfall {
  id: number;
  store_id: string;
  date: string;
  footfall_count: number;
  transaction_count: number;
  conversion_rate: number;
  expected_revenue: number;
  actual_revenue: number;
}

export default function FootfallToConversionView() {
  const [items, setItems] = useState<Footfall[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    date: "",
    footfall_count: "",
    transaction_count: "",
    expected_revenue: "",
    actual_revenue: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/footfall-conversion";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Footfall[]>(ENDPOINT);
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
      const footfall_count = Number(form.footfall_count);
      const transaction_count = Number(form.transaction_count);
      await post(ENDPOINT, {
        store_id: form.store_id,
        date: form.date,
        footfall_count,
        transaction_count,
        conversion_rate: footfall_count > 0 ? Number((transaction_count / footfall_count * 100).toFixed(2)) : 0,
        expected_revenue: Number(form.expected_revenue) || 0,
        actual_revenue: Number(form.actual_revenue) || 0,
      });
      setForm({ store_id: "", date: "", footfall_count: "", transaction_count: "", expected_revenue: "", actual_revenue: "" });
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Footfall to Conversion Analytics</h3>
          <span className="badge badge-success">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading footfall records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Date</th>
                <th>Footfall</th>
                <th>Transactions</th>
                <th>Conversion %</th>
                <th>Expected Revenue</th>
                <th>Actual Revenue</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.date}</td>
                  <td>{it.footfall_count}</td>
                  <td>{it.transaction_count}</td>
                  <td>
                    <span style={{ color: it.conversion_rate < 25 ? "var(--danger)" : it.conversion_rate < 40 ? "var(--gold-strong)" : "var(--success)", fontWeight: 600 }}>
                      {it.conversion_rate}%
                    </span>
                  </td>
                  <td>{Number(it.expected_revenue).toLocaleString()}</td>
                  <td>{Number(it.actual_revenue).toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No footfall records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Footfall Data</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Footfall Count</label>
          <input className="input" type="number" value={form.footfall_count} onChange={(e) => setForm({ ...form, footfall_count: e.target.value })} placeholder="e.g. 1200" required />
        </div>
        <div className="field">
          <label>Transaction Count</label>
          <input className="input" type="number" value={form.transaction_count} onChange={(e) => setForm({ ...form, transaction_count: e.target.value })} placeholder="e.g. 340" required />
        </div>
        <div className="field">
          <label>Expected Revenue</label>
          <input className="input" type="number" value={form.expected_revenue} onChange={(e) => setForm({ ...form, expected_revenue: e.target.value })} placeholder="e.g. 900000" required />
        </div>
        <div className="field">
          <label>Actual Revenue</label>
          <input className="input" type="number" value={form.actual_revenue} onChange={(e) => setForm({ ...form, actual_revenue: e.target.value })} placeholder="e.g. 850000" required />
        </div>
        <button className="btn btn-primary btn-block">Save Footfall Record</button>
      </form>
    </div>
  );
}
