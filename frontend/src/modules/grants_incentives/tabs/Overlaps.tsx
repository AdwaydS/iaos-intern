import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Overlap { id: number; entity_name: string; scheme_1_code: string; scheme_1_name: string; scheme_2_code: string; scheme_2_name: string; overlap_desc: string; risk_level: string; resolution: string; status: string; notes: string; }

export default function Overlaps() {
  const [items, setItems] = useState<Overlap[]>([]);
  const [form, setForm] = useState({ entity_name: "", scheme_1_code: "", scheme_1_name: "", scheme_2_code: "", scheme_2_name: "", overlap_desc: "", risk_level: "medium", resolution: "", status: "open", notes: "" });
  const load = () => get<Overlap[]>(`/api/modules/${SLUG}/overlaps`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.overlap_desc.trim()) return;
    await post(`/api/modules/${SLUG}/overlaps`, form);
    setForm({ entity_name: "", scheme_1_code: "", scheme_1_name: "", scheme_2_code: "", scheme_2_name: "", overlap_desc: "", risk_level: "medium", resolution: "", status: "open", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/overlaps/${id}`); load(); }

  const riskBadge = (r: string) => r === "high" ? "badge-danger" : r === "medium" ? "badge-gold" : "badge-success";

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme 1</th><th>Scheme 2</th><th>Overlap</th><th>Risk</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.entity_name}</td><td>{o.scheme_1_code}</td><td>{o.scheme_2_code}</td>
                <td>{o.overlap_desc}</td>
                <td><span className={`badge ${riskBadge(o.risk_level)}`}>{o.risk_level}</span></td>
                <td><span className={`badge ${o.status === "resolved" ? "badge-success" : "badge-danger"}`}>{o.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(o.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No overlaps detected.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Overlap</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme 1 Code</label><input className="input" value={form.scheme_1_code} onChange={(e) => setForm({ ...form, scheme_1_code: e.target.value })} /></div>
        <div className="field"><label>Scheme 1 Name</label><input className="input" value={form.scheme_1_name} onChange={(e) => setForm({ ...form, scheme_1_name: e.target.value })} /></div>
        <div className="field"><label>Scheme 2 Code</label><input className="input" value={form.scheme_2_code} onChange={(e) => setForm({ ...form, scheme_2_code: e.target.value })} /></div>
        <div className="field"><label>Scheme 2 Name</label><input className="input" value={form.scheme_2_name} onChange={(e) => setForm({ ...form, scheme_2_name: e.target.value })} /></div>
        <div className="field"><label>Overlap Description</label><input className="input" value={form.overlap_desc} onChange={(e) => setForm({ ...form, overlap_desc: e.target.value })} /></div>
        <div className="field"><label>Risk Level</label><select className="select" value={form.risk_level} onChange={(e) => setForm({ ...form, risk_level: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <button className="btn btn-primary btn-block">Add Overlap</button>
      </form>
    </div>
  );
}
