import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Claw { id: number; scheme_code: string; scheme_name: string; entity_name: string; condition_breached: string; risk_level: string; exposure_amount: number; mitigation: string; status: string; notes: string; }

export default function ClawbackRisk() {
  const [items, setItems] = useState<Claw[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", entity_name: "", condition_breached: "", risk_level: "medium", exposure_amount: 0, mitigation: "", status: "open", notes: "" });
  const load = () => get<Claw[]>(`/api/modules/${SLUG}/clawback`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.condition_breached.trim()) return;
    await post(`/api/modules/${SLUG}/clawback`, form);
    setForm({ scheme_code: "", scheme_name: "", entity_name: "", condition_breached: "", risk_level: "medium", exposure_amount: 0, mitigation: "", status: "open", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/clawback/${id}`); load(); }

  const riskBadge = (r: string) => r === "high" ? "badge-danger" : r === "medium" ? "badge-gold" : "badge-success";

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Scheme</th><th>Entity</th><th>Condition</th><th>Risk</th><th>Exposure</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.scheme_code}</td><td>{c.entity_name}</td><td>{c.condition_breached}</td>
                <td><span className={`badge ${riskBadge(c.risk_level)}`}>{c.risk_level}</span></td>
                <td>{c.exposure_amount.toLocaleString()}</td>
                <td><span className={`badge ${c.status === "closed" ? "badge-success" : "badge-danger"}`}>{c.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(c.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No clawback risks.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Clawback Risk</h3>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Condition Breached</label><input className="input" value={form.condition_breached} onChange={(e) => setForm({ ...form, condition_breached: e.target.value })} /></div>
        <div className="field"><label>Risk Level</label><select className="select" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <div className="field"><label>Exposure Amount</label><input className="input" type="number" value={form.exposure_amount} onChange={(e) => setForm({ ...form, exposure_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Mitigation</label><input className="input" value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Risk</button>
      </form>
    </div>
  );
}
