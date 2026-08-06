import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface IdleAsset {
  id: number;
  asset_tag: string;
  description: string;
  location: string;
  book_value: number;
  idle_since: string;
  idle_days: number;
  utilization_pct: number;
  recommendation: string;
}

export default function IdleUnderutilisedAssetsView() {
  const [items, setItems] = useState<IdleAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    description: "",
    location: "",
    book_value: 0,
    idle_since: "",
    utilization_pct: 0,
    recommendation: "Review",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<IdleAsset[]>(`/api/modules/fixed_assets_cwip/idle`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/idle`, form);
      setForm({ asset_tag: "", description: "", location: "", book_value: 0, idle_since: "", utilization_pct: 0, recommendation: "Review" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/idle/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Idle / Under-utilised Assets</h3>
          <span className="badge badge-danger">{items.length} Flagged</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading idle asset data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Book Value</th>
                <th>Utilization</th>
                <th>Idle Since</th>
                <th>Recommendation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.description}</td>
                  <td>₹{it.book_value.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.utilization_pct < 20 ? "badge-danger" : "badge-gold"}`}>
                      {it.utilization_pct}%
                    </span>
                  </td>
                  <td>{it.idle_since}</td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>{it.recommendation}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No idle assets flagged.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Flag Idle / Under-utilised Asset</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Old Packaging Machine" required />
        </div>
        <div className="field">
          <label>Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Warehouse Block C" required />
        </div>
        <div className="field">
          <label>Book Value (₹)</label>
          <input className="input" type="number" value={form.book_value} onChange={(e) => setForm({ ...form, book_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Idle Since</label>
          <input className="input" type="date" value={form.idle_since} onChange={(e) => setForm({ ...form, idle_since: e.target.value })} required />
        </div>
        <div className="field">
          <label>Utilization (%)</label>
          <input className="input" type="number" value={form.utilization_pct} onChange={(e) => setForm({ ...form, utilization_pct: Number(e.target.value) })} min={0} max={100} required />
        </div>
        <div className="field">
          <label>Recommendation</label>
          <select className="select" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}>
            <option>Review</option>
            <option>Dispose</option>
            <option>Transfer</option>
            <option>Retain with Justification</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Flag Asset</button>
      </form>
    </div>
  );
}
