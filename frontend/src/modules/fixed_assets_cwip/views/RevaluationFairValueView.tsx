import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Revaluation {
  id: number;
  asset_tag: string;
  asset_description: string;
  carrying_amount: number;
  fair_value: number;
  revaluation_surplus: number;
  valuation_date: string;
  valuer: string;
  status: string;
}

export default function RevaluationFairValueView() {
  const [items, setItems] = useState<Revaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    carrying_amount: 0,
    fair_value: 0,
    valuer: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Revaluation[]>(`/api/modules/fixed_assets_cwip/revaluations`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/revaluations`, {
        ...form,
        revaluation_surplus: Math.max(0, form.fair_value - form.carrying_amount),
        valuation_date: new Date().toISOString().slice(0, 10),
        status: "Pending Review",
      });
      setForm({ asset_tag: "", asset_description: "", carrying_amount: 0, fair_value: 0, valuer: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/revaluations/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Revaluation & Fair-Value Review</h3>
          <span className="badge badge-gold">{items.length} Revaluations</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading revaluation records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Carrying Amount</th>
                <th>Fair Value</th>
                <th>Surplus / Deficit</th>
                <th>Valuer</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.asset_description}</td>
                  <td>₹{it.carrying_amount.toLocaleString()}</td>
                  <td>₹{it.fair_value.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.revaluation_surplus > 0 ? "badge-success" : it.revaluation_surplus < 0 ? "badge-danger" : "badge-slate"}`}>
                      {it.revaluation_surplus >= 0 ? "+" : ""}₹{it.revaluation_surplus.toLocaleString()}
                    </span>
                  </td>
                  <td>{it.valuer}</td>
                  <td><span className={`badge ${it.status === "Approved" ? "badge-success" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No revaluation records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Revaluation</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. Land - Plot 12" required />
        </div>
        <div className="field">
          <label>Carrying Amount (₹)</label>
          <input className="input" type="number" value={form.carrying_amount} onChange={(e) => setForm({ ...form, carrying_amount: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Fair Value (₹)</label>
          <input className="input" type="number" value={form.fair_value} onChange={(e) => setForm({ ...form, fair_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Independent Valuer</label>
          <input className="input" value={form.valuer} onChange={(e) => setForm({ ...form, valuer: e.target.value })} placeholder="e.g. Knight Frank India" required />
        </div>
        <button className="btn btn-primary btn-block">Submit Revaluation</button>
      </form>
    </div>
  );
}
