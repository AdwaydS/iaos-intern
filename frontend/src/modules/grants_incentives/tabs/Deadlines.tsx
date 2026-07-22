import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Deadline { id: number; deadline_type: string; deadline_name: string; due_date: string; scheme_code: string; claim_ref: string; responsible: string; status: string; notes: string; }

export default function Deadlines() {
  const [items, setItems] = useState<Deadline[]>([]);
  const [form, setForm] = useState({ deadline_type: "filing", deadline_name: "", due_date: "", scheme_code: "", claim_ref: "", responsible: "", status: "pending", notes: "" });
  const load = () => get<Deadline[]>(`/api/modules/${SLUG}/deadlines`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.deadline_name.trim()) return;
    await post(`/api/modules/${SLUG}/deadlines`, form);
    setForm({ deadline_type: "filing", deadline_name: "", due_date: "", scheme_code: "", claim_ref: "", responsible: "", status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/deadlines/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Type</th><th>Name</th><th>Due Date</th><th>Responsible</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td>{d.deadline_type}</td><td>{d.deadline_name}</td><td>{d.due_date}</td>
                <td>{d.responsible}</td>
                <td><span className={`badge ${d.status === "completed" ? "badge-success" : "badge-gold"}`}>{d.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(d.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No deadlines.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Deadline</h3>
        <div className="field"><label>Type</label><select className="select" value={form.deadline_type} onChange={(e) => setForm({ ...form, deadline_type: e.target.value })}><option value="filing">Filing</option><option value="claim">Claim</option><option value="utilisation">Utilisation</option><option value="report">Report</option></select></div>
        <div className="field"><label>Deadline Name</label><input className="input" value={form.deadline_name} onChange={(e) => setForm({ ...form, deadline_name: e.target.value })} /></div>
        <div className="field"><label>Due Date</label><input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Claim Ref</label><input className="input" value={form.claim_ref} onChange={(e) => setForm({ ...form, claim_ref: e.target.value })} /></div>
        <div className="field"><label>Responsible</label><input className="input" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Deadline</button>
      </form>
    </div>
  );
}
