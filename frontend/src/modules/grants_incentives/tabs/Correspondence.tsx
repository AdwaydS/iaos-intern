import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Corr { id: number; scheme_code: string; authority: string; subject: string; date_sent: string | null; response_due: string | null; status: string; notes: string; }

export default function Correspondence() {
  const [items, setItems] = useState<Corr[]>([]);
  const [form, setForm] = useState({ scheme_code: "", authority: "", subject: "", date_sent: "", response_due: "", status: "sent", notes: "" });
  const load = () => get<Corr[]>(`/api/modules/${SLUG}/correspondence`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) return;
    await post(`/api/modules/${SLUG}/correspondence`, { ...form, date_sent: form.date_sent || null, response_due: form.response_due || null });
    setForm({ scheme_code: "", authority: "", subject: "", date_sent: "", response_due: "", status: "sent", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/correspondence/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Authority</th><th>Subject</th><th>Sent</th><th>Response Due</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.authority}</td><td>{c.subject}</td><td>{c.date_sent || "--"}</td>
                <td>{c.response_due || "--"}</td>
                <td><span className={`badge ${c.status === "resolved" ? "badge-success" : "badge-gold"}`}>{c.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(c.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No correspondence logged.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Correspondence</h3>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Authority</label><input className="input" value={form.authority} onChange={(e) => setForm({ ...form, authority: e.target.value })} /></div>
        <div className="field"><label>Subject</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="field"><label>Date Sent</label><input className="input" type="date" value={form.date_sent} onChange={(e) => setForm({ ...form, date_sent: e.target.value })} /></div>
        <div className="field"><label>Response Due</label><input className="input" type="date" value={form.response_due} onChange={(e) => setForm({ ...form, response_due: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Correspondence</button>
      </form>
    </div>
  );
}
