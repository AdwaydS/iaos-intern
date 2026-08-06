import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface ImpairmentIndicator {
  id: number;
  asset_tag: string;
  description: string;
  indicator_type: string;
  trigger_event: string;
  carrying_amount: number;
  recoverable_amount: number;
  impairment_loss: number;
  status: string;
}

export default function ImpairmentIndicatorsView() {
  const [items, setItems] = useState<ImpairmentIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    description: "",
    indicator_type: "External",
    trigger_event: "",
    carrying_amount: 0,
    recoverable_amount: 0,
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<ImpairmentIndicator[]>(`/api/modules/fixed_assets_cwip/impairment`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/impairment`, {
        ...form,
        impairment_loss: Math.max(0, form.carrying_amount - form.recoverable_amount),
        status: "Under Review",
      });
      setForm({ asset_tag: "", description: "", indicator_type: "External", trigger_event: "", carrying_amount: 0, recoverable_amount: 0 });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/impairment/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Impairment Indicator Register</h3>
          <span className="badge badge-danger">{items.length} Indicators Flagged</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading impairment data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Trigger Event</th>
                <th>Carrying Amt</th>
                <th>Recoverable Amt</th>
                <th>Impairment Loss</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.trigger_event}</td>
                  <td>₹{it.carrying_amount.toLocaleString()}</td>
                  <td>₹{it.recoverable_amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.impairment_loss > 0 ? "badge-danger" : "badge-success"}`}>
                      ₹{it.impairment_loss.toLocaleString()}
                    </span>
                  </td>
                  <td><span className={`badge ${it.status === "Recognised" ? "badge-success" : "badge-gold"}`}>{it.status}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No impairment indicators found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Impairment Indicator</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. CNC Milling Machine" required />
        </div>
        <div className="field">
          <label>Indicator Type</label>
          <select className="select" value={form.indicator_type} onChange={(e) => setForm({ ...form, indicator_type: e.target.value })}>
            <option>External</option>
            <option>Internal</option>
            <option>Market Decline</option>
            <option>Physical Damage</option>
            <option>Technological Obsolescence</option>
          </select>
        </div>
        <div className="field">
          <label>Trigger Event</label>
          <input className="input" value={form.trigger_event} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })} placeholder="e.g. Market value decline > 40%" required />
        </div>
        <div className="field">
          <label>Carrying Amount (₹)</label>
          <input className="input" type="number" value={form.carrying_amount} onChange={(e) => setForm({ ...form, carrying_amount: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Recoverable Amount (₹)</label>
          <input className="input" type="number" value={form.recoverable_amount} onChange={(e) => setForm({ ...form, recoverable_amount: Number(e.target.value) })} min={0} required />
        </div>
        <button className="btn btn-primary btn-block">Log Impairment Indicator</button>
      </form>
    </div>
  );
}
