import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Classification {
  id: number;
  asset_tag: string;
  description: string;
  amount: number;
  classification_type: string;
  justification: string;
  reviewed_by: string;
  status: string;
}

export default function CapexOpexClassificationView() {
  const [items, setItems] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    description: "",
    amount: 0,
    classification_type: "Capex",
    justification: "",
    reviewed_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Classification[]>(`/api/modules/fixed_assets_cwip/classification`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/classification`, { ...form, status: "Under Review" });
      setForm({ asset_tag: "", description: "", amount: 0, classification_type: "Capex", justification: "", reviewed_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/classification/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Capex vs Opex Classification</h3>
          <span className="badge badge-gold">{items.length} Reviews</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading classification records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Classification</th>
                <th>Justification</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.description}</td>
                  <td>₹{it.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.classification_type === "Capex" ? "badge-success" : "badge-gold"}`}>
                      {it.classification_type}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>{it.justification}</td>
                  <td><span className={`badge ${it.status === "Approved" ? "badge-success" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No classification records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Classification Decision</h3>
        <div className="field">
          <label>Asset Tag / Reference</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Annual Maintenance Contract Renewal" required />
        </div>
        <div className="field">
          <label>Amount (₹)</label>
          <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Classification</label>
          <select className="select" value={form.classification_type} onChange={(e) => setForm({ ...form, classification_type: e.target.value })}>
            <option>Capex</option>
            <option>Opex</option>
          </select>
        </div>
        <div className="field">
          <label>Justification</label>
          <input className="input" value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} placeholder="e.g. Capitalises per Ind AS 16" required />
        </div>
        <div className="field">
          <label>Reviewed By</label>
          <input className="input" value={form.reviewed_by} onChange={(e) => setForm({ ...form, reviewed_by: e.target.value })} placeholder="e.g. Finance Controller" required />
        </div>
        <button className="btn btn-primary btn-block">Submit Classification</button>
      </form>
    </div>
  );
}
