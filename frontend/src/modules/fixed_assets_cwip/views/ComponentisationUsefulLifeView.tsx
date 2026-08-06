import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Component {
  id: number;
  parent_asset: string;
  component_name: string;
  useful_life_months: number;
  depreciation_rate: number;
  replacement_cycle: string;
  status: string;
}

export default function ComponentisationUsefulLifeView() {
  const [items, setItems] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    parent_asset: "",
    component_name: "",
    useful_life_months: 120,
    depreciation_rate: 0.83,
    replacement_cycle: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Component[]>(`/api/modules/fixed_assets_cwip/components`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parent_asset || !form.component_name) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/components`, { ...form, status: "Active" });
      setForm({ parent_asset: "", component_name: "", useful_life_months: 120, depreciation_rate: 0.83, replacement_cycle: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/components/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Componentisation & Useful Life</h3>
          <span className="badge badge-success">{items.length} Components Mapped</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading component data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Parent Asset</th>
                <th>Component</th>
                <th>Useful Life (Mo.)</th>
                <th>Rate (%)</th>
                <th>Replacement Cycle</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.parent_asset}</strong></td>
                  <td>{it.component_name}</td>
                  <td>{it.useful_life_months}</td>
                  <td>{it.depreciation_rate}%</td>
                  <td>{it.replacement_cycle || "—"}</td>
                  <td><span className={`badge ${it.status === "Active" ? "badge-success" : "badge-slate"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No component records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Component</h3>
        <div className="field">
          <label>Parent Asset Tag</label>
          <input className="input" value={form.parent_asset} onChange={(e) => setForm({ ...form, parent_asset: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Component Name</label>
          <input className="input" value={form.component_name} onChange={(e) => setForm({ ...form, component_name: e.target.value })} placeholder="e.g. Main Motor Assembly" required />
        </div>
        <div className="field">
          <label>Useful Life (Months)</label>
          <input className="input" type="number" value={form.useful_life_months} onChange={(e) => setForm({ ...form, useful_life_months: Number(e.target.value) })} min={1} required />
        </div>
        <div className="field">
          <label>Depreciation Rate (%)</label>
          <input className="input" type="number" step="0.01" value={form.depreciation_rate} onChange={(e) => setForm({ ...form, depreciation_rate: Number(e.target.value) })} min={0} max={100} required />
        </div>
        <div className="field">
          <label>Replacement Cycle</label>
          <input className="input" value={form.replacement_cycle} onChange={(e) => setForm({ ...form, replacement_cycle: e.target.value })} placeholder="e.g. Every 5 years" />
        </div>
        <button className="btn btn-primary btn-block">Add Component</button>
      </form>
    </div>
  );
}
