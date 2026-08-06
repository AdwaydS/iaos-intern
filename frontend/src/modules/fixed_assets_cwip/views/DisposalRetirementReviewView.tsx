import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Disposal {
  id: number;
  asset_tag: string;
  asset_description: string;
  original_cost: number;
  disposal_date: string;
  disposal_value: number;
  method: string;
  approved_by: string;
  status: string;
}

export default function DisposalRetirementReviewView() {
  const [items, setItems] = useState<Disposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    original_cost: 0,
    disposal_value: 0,
    method: "Scrap Sale",
    approved_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Disposal[]>(`/api/modules/fixed_assets_cwip/disposals`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/disposals`, { ...form, disposal_date: new Date().toISOString().slice(0, 10), status: "Pending Review" });
      setForm({ asset_tag: "", asset_description: "", original_cost: 0, disposal_value: 0, method: "Scrap Sale", approved_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/disposals/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Disposal & Retirement Register</h3>
          <span className="badge badge-gold">{items.length} Disposals Logged</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading disposal records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Original Cost</th>
                <th>Disposal Value</th>
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
                  <td>₹{it.disposal_value.toLocaleString()}</td>
                  <td>{it.method}</td>
                  <td>
                    <span className={`badge ${it.status === "Approved" ? "badge-success" : it.status === "Rejected" ? "badge-danger" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No disposal records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Asset Disposal</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. CNC Lathe Machine" required />
        </div>
        <div className="field">
          <label>Original Cost (₹)</label>
          <input className="input" type="number" value={form.original_cost} onChange={(e) => setForm({ ...form, original_cost: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Expected Disposal Value (₹)</label>
          <input className="input" type="number" value={form.disposal_value} onChange={(e) => setForm({ ...form, disposal_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Disposal Method</label>
          <select className="select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option>Scrap Sale</option>
            <option>Auction</option>
            <option>Donation</option>
            <option>Internal Transfer</option>
            <option>Decommissioned</option>
          </select>
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} placeholder="e.g. CFO Name" required />
        </div>
        <button className="btn btn-primary btn-block">Submit Disposal for Review</button>
      </form>
    </div>
  );
}
