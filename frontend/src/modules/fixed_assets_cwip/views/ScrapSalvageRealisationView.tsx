import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface ScrapRecord {
  id: number;
  asset_tag: string;
  asset_description: string;
  original_cost: number;
  accumulated_dep: number;
  scrap_value: number;
  disposal_date: string;
  disposal_method: string;
  status: string;
}

export default function ScrapSalvageRealisationView() {
  const [items, setItems] = useState<ScrapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    original_cost: 0,
    accumulated_dep: 0,
    scrap_value: 0,
    disposal_method: "Scrap Sale",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<ScrapRecord[]>(`/api/modules/fixed_assets_cwip/scrap`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/scrap`, { ...form, disposal_date: new Date().toISOString().slice(0, 10), status: "Pending Review" });
      setForm({ asset_tag: "", asset_description: "", original_cost: 0, accumulated_dep: 0, scrap_value: 0, disposal_method: "Scrap Sale" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/scrap/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Scrap & Salvage Realisation</h3>
          <span className="badge badge-gold">{items.length} Items</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading scrap records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Original Cost</th>
                <th>Accum. Dep</th>
                <th>Scrap Value</th>
                <th>Method</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.asset_description}</td>
                  <td>₹{it.original_cost.toLocaleString()}</td>
                  <td>₹{it.accumulated_dep.toLocaleString()}</td>
                  <td>₹{it.scrap_value.toLocaleString()}</td>
                  <td>{it.disposal_method}</td>
                  <td><span className={`badge ${it.status === "Realised" ? "badge-success" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No scrap records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Scrap / Salvage</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. Old Conveyor Belt" required />
        </div>
        <div className="field">
          <label>Original Cost (₹)</label>
          <input className="input" type="number" value={form.original_cost} onChange={(e) => setForm({ ...form, original_cost: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Accumulated Depreciation (₹)</label>
          <input className="input" type="number" value={form.accumulated_dep} onChange={(e) => setForm({ ...form, accumulated_dep: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Expected Scrap / Salvage Value (₹)</label>
          <input className="input" type="number" value={form.scrap_value} onChange={(e) => setForm({ ...form, scrap_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Disposal Method</label>
          <select className="select" value={form.disposal_method} onChange={(e) => setForm({ ...form, disposal_method: e.target.value })}>
            <option>Scrap Sale</option>
            <option>Auction</option>
            <option>Cannibalised</option>
            <option>Donated</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Log Scrap Record</button>
      </form>
    </div>
  );
}
