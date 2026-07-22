import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Cond { id: number; scheme_code: string; scheme_name: string; entity_name: string; condition_desc: string; compliance_status: string; due_date: string | null; evidence_ref: string; notes: string; }

export default function Conditions() {
  const [items, setItems] = useState<Cond[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", entity_name: "", condition_desc: "", compliance_status: "pending", due_date: "", evidence_ref: "", notes: "" });
  const load = () => get<Cond[]>(`/api/modules/${SLUG}/conditions`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.condition_desc.trim()) return;
    await post(`/api/modules/${SLUG}/conditions`, { ...form, due_date: form.due_date || null });
    setForm({ scheme_code: "", scheme_name: "", entity_name: "", condition_desc: "", compliance_status: "pending", due_date: "", evidence_ref: "", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/conditions/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Scheme</th><th>Entity</th><th>Condition</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.scheme_code}</td><td>{c.entity_name}</td><td>{c.condition_desc}</td>
                <td><span className={`badge ${c.compliance_status === "compliant" ? "badge-success" : c.compliance_status === "breach" ? "badge-danger" : "badge-gold"}`}>{c.compliance_status}</span></td>
                <td>{c.due_date || "--"}</td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(c.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No conditions tracked.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Condition</h3>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Entity Name</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Condition Description</label><input className="input" value={form.condition_desc} onChange={(e) => setForm({ ...form, condition_desc: e.target.value })} /></div>
        <div className="field"><label>Due Date</label><input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Condition</button>
      </form>
    </div>
  );
}
