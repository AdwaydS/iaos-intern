import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface AssetRecord {
  id: number;
  asset_tag: string;
  description: string;
  asset_class: string;
  location: string;
  in_service_date: string;
  book_value: number;
  completeness_score: number;
  missing_fields: string;
}

export default function AssetRegisterCompletenessView() {
  const [items, setItems] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    description: "",
    asset_class: "",
    location: "",
    book_value: 0,
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<AssetRecord[]>(`/api/modules/fixed_assets_cwip/assets`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/assets`, { ...form, in_service_date: new Date().toISOString().slice(0, 10), completeness_score: 60, missing_fields: "Insurance, Warranty" });
      setForm({ asset_tag: "", description: "", asset_class: "", location: "", book_value: 0 });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/assets/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Asset Register Completeness</h3>
          <span className="badge badge-gold">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading asset register...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Class</th>
                <th>Book Value</th>
                <th>Completeness</th>
                <th>Missing Fields</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.description}</td>
                  <td>{it.asset_class}</td>
                  <td>₹{it.book_value.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.completeness_score >= 90 ? "badge-success" : it.completeness_score >= 70 ? "badge-gold" : "badge-danger"}`}>
                      {it.completeness_score}%
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>{it.missing_fields || "Complete"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No asset register records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Asset to Register</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Hydraulic Press Unit" required />
        </div>
        <div className="field">
          <label>Asset Class</label>
          <input className="input" value={form.asset_class} onChange={(e) => setForm({ ...form, asset_class: e.target.value })} placeholder="e.g. Plant & Machinery" required />
        </div>
        <div className="field">
          <label>Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Factory Block A" required />
        </div>
        <div className="field">
          <label>Book Value (₹)</label>
          <input className="input" type="number" value={form.book_value} onChange={(e) => setForm({ ...form, book_value: Number(e.target.value) })} min={0} required />
        </div>
        <button className="btn btn-primary btn-block">Add to Register</button>
      </form>
    </div>
  );
}
