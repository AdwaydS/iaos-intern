import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface LeaseAsset {
  id: number;
  asset_description: string;
  lease_type: string;
  classification: string;
  right_of_use_asset: number;
  lease_liability: number;
  lease_term_months: number;
  discount_rate: number;
  status: string;
}

export default function LeaseOwnIndAS116View() {
  const [items, setItems] = useState<LeaseAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_description: "",
    lease_type: "Operating Lease",
    classification: "Lessee",
    right_of_use_asset: 0,
    lease_liability: 0,
    lease_term_months: 60,
    discount_rate: 8,
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<LeaseAsset[]>(`/api/modules/fixed_assets_cwip/leases`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_description) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/leases`, { ...form, status: "On Balance Sheet" });
      setForm({ asset_description: "", lease_type: "Operating Lease", classification: "Lessee", right_of_use_asset: 0, lease_liability: 0, lease_term_months: 60, discount_rate: 8 });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/leases/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Lease vs Own (Ind AS 116)</h3>
          <span className="badge badge-gold">{items.length} Lease Assets</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading lease data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Description</th>
                <th>Lease Type</th>
                <th>ROU Asset</th>
                <th>Lease Liability</th>
                <th>Term (Mo.)</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_description}</strong></td>
                  <td>{it.lease_type}</td>
                  <td>₹{it.right_of_use_asset.toLocaleString()}</td>
                  <td>₹{it.lease_liability.toLocaleString()}</td>
                  <td>{it.lease_term_months}</td>
                  <td><span className={`badge ${it.status === "On Balance Sheet" ? "badge-success" : "badge-slate"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No lease records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Lease Asset</h3>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. Office Space - Floor 3" required />
        </div>
        <div className="field">
          <label>Lease Type</label>
          <select className="select" value={form.lease_type} onChange={(e) => setForm({ ...form, lease_type: e.target.value })}>
            <option>Operating Lease</option>
            <option>Finance Lease</option>
          </select>
        </div>
        <div className="field">
          <label>Classification</label>
          <select className="select" value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
            <option>Lessee</option>
            <option>Lessor</option>
          </select>
        </div>
        <div className="field">
          <label>Right-of-Use Asset (₹)</label>
          <input className="input" type="number" value={form.right_of_use_asset} onChange={(e) => setForm({ ...form, right_of_use_asset: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Lease Liability (₹)</label>
          <input className="input" type="number" value={form.lease_liability} onChange={(e) => setForm({ ...form, lease_liability: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Lease Term (Months)</label>
          <input className="input" type="number" value={form.lease_term_months} onChange={(e) => setForm({ ...form, lease_term_months: Number(e.target.value) })} min={1} required />
        </div>
        <div className="field">
          <label>Discount Rate (%)</label>
          <input className="input" type="number" step="0.01" value={form.discount_rate} onChange={(e) => setForm({ ...form, discount_rate: Number(e.target.value) })} min={0} max={100} required />
        </div>
        <button className="btn btn-primary btn-block">Add Lease Record</button>
      </form>
    </div>
  );
}
