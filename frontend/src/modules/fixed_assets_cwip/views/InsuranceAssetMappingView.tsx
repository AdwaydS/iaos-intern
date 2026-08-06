import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface InsuranceMapping {
  id: number;
  asset_tag: string;
  asset_description: string;
  policy_number: string;
  insurer: string;
  insured_value: number;
  premium: number;
  policy_expiry: string;
  coverage_status: string;
}

export default function InsuranceAssetMappingView() {
  const [items, setItems] = useState<InsuranceMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    policy_number: "",
    insurer: "",
    insured_value: 0,
    premium: 0,
    policy_expiry: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<InsuranceMapping[]>(`/api/modules/fixed_assets_cwip/insurance`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag || !form.policy_number) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/insurance`, { ...form, coverage_status: "Active" });
      setForm({ asset_tag: "", asset_description: "", policy_number: "", insurer: "", insured_value: 0, premium: 0, policy_expiry: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/insurance/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Insurance-to-Asset Mapping</h3>
          <span className="badge badge-success">{items.length} Mappings</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading insurance mappings...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Policy No.</th>
                <th>Insurer</th>
                <th>Insured Value</th>
                <th>Premium</th>
                <th>Expiry</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.policy_number}</td>
                  <td>{it.insurer}</td>
                  <td>₹{it.insured_value.toLocaleString()}</td>
                  <td>₹{it.premium.toLocaleString()}</td>
                  <td>{it.policy_expiry}</td>
                  <td>
                    <span className={`badge ${it.coverage_status === "Active" ? "badge-success" : "badge-danger"}`}>
                      {it.coverage_status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No insurance mappings found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Map Insurance to Asset</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. CNC Lathe Machine" required />
        </div>
        <div className="field">
          <label>Policy Number</label>
          <input className="input" value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} placeholder="e.g. POL-2026-FA-018" required />
        </div>
        <div className="field">
          <label>Insurer</label>
          <input className="input" value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} placeholder="e.g. ICICI Lombard" required />
        </div>
        <div className="field">
          <label>Insured Value (₹)</label>
          <input className="input" type="number" value={form.insured_value} onChange={(e) => setForm({ ...form, insured_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Annual Premium (₹)</label>
          <input className="input" type="number" value={form.premium} onChange={(e) => setForm({ ...form, premium: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Policy Expiry Date</label>
          <input className="input" type="date" value={form.policy_expiry} onChange={(e) => setForm({ ...form, policy_expiry: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-block">Create Mapping</button>
      </form>
    </div>
  );
}
