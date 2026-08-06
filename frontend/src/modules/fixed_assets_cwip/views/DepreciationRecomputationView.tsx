import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface DepreciationRecord {
  id: number;
  asset_tag: string;
  asset_class: string;
  original_cost: number;
  useful_life_months: number;
  method: string;
  monthly_dep: number;
  recomputed_dep: number;
  variance: number;
  status: string;
}

export default function DepreciationRecomputationView() {
  const [items, setItems] = useState<DepreciationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_class: "",
    original_cost: 0,
    useful_life_months: 120,
    method: "SLM",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<DepreciationRecord[]>(`/api/modules/fixed_assets_cwip/depreciation`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/depreciation`, form);
      setForm({ asset_tag: "", asset_class: "", original_cost: 0, useful_life_months: 120, method: "SLM" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/depreciation/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Depreciation Recomputation Log</h3>
          <span className="badge badge-gold">{items.length} Assets Reviewed</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading depreciation records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Class</th>
                <th>Cost (₹)</th>
                <th>Method</th>
                <th>Monthly Dep</th>
                <th>Recomputed</th>
                <th>Variance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.asset_class}</td>
                  <td>{it.original_cost.toLocaleString()}</td>
                  <td>{it.method}</td>
                  <td>{it.monthly_dep.toLocaleString()}</td>
                  <td>{it.recomputed_dep.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.variance === 0 ? "badge-success" : "badge-danger"}`}>
                      {it.variance === 0 ? "Nil" : `₹${it.variance.toLocaleString()}`}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No depreciation recomputation records.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Recompute Depreciation</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Class</label>
          <input className="input" value={form.asset_class} onChange={(e) => setForm({ ...form, asset_class: e.target.value })} placeholder="e.g. Plant & Machinery" required />
        </div>
        <div className="field">
          <label>Original Cost (₹)</label>
          <input className="input" type="number" value={form.original_cost} onChange={(e) => setForm({ ...form, original_cost: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Useful Life (Months)</label>
          <input className="input" type="number" value={form.useful_life_months} onChange={(e) => setForm({ ...form, useful_life_months: Number(e.target.value) })} min={1} required />
        </div>
        <div className="field">
          <label>Depreciation Method</label>
          <select className="select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option>SLM</option>
            <option>WDV</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Run Recomputation</button>
      </form>
    </div>
  );
}
