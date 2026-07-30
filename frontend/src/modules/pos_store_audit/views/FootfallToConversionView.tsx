import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Footfall {
  id: number;
  store_name: string;
  record_date: string;
  footfall_count: number;
  transaction_count: number;
  conversion_pct: number;
  avg_ticket_size: number;
  anomaly_score: number;
}

export default function FootfallToConversionView() {
  const [items, setItems] = useState<Footfall[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    record_date: "",
    footfall_count: "",
    transaction_count: "",
    avg_ticket_size: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Footfall[]>(`/api/modules/pos_store_audit/footfall`);
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
    if (!form.store_name || !form.record_date) return;
    try {
      await post(`/api/modules/pos_store_audit/footfall`, {
        ...form,
        footfall_count: Number(form.footfall_count),
        transaction_count: Number(form.transaction_count),
        avg_ticket_size: Number(form.avg_ticket_size),
      });
      setForm({ store_name: "", record_date: "", footfall_count: "", transaction_count: "", avg_ticket_size: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/footfall/${id}`);
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
                <th>Avg Ticket</th>
                <th>Anomaly Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.record_date}</td>
                  <td>{it.footfall_count}</td>
                  <td>{it.transaction_count}</td>
                  <td>{it.conversion_pct}%</td>
                  <td>{Number(it.avg_ticket_size).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.anomaly_score > 0.7 ? "var(--danger)" : it.anomaly_score > 0.4 ? "var(--gold-strong)" : "var(--success)", fontWeight: 600 }}>
                      {it.anomaly_score}
                    </span>
                  </td>
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
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Record Date</label>
          <input className="input" type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
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
          <label>Avg Ticket Size</label>
          <input className="input" type="number" value={form.avg_ticket_size} onChange={(e) => setForm({ ...form, avg_ticket_size: e.target.value })} placeholder="e.g. 850" required />
        </div>
        <button className="btn btn-primary btn-block">Save Footfall Record</button>
      </form>
    </div>
  );
}
