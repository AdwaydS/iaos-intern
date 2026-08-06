import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Util { id: number; scheme_code: string; scheme_name: string; entity_name: string; grant_amount: number; utilised_amount: number; report_date: string | null; status: string; notes: string; }

export default function Utilisation() {
  const [items, setItems] = useState<Util[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", entity_name: "", grant_amount: 0, utilised_amount: 0, report_date: "", status: "pending", notes: "" });
  const load = () => get<Util[]>(`/api/modules/${SLUG}/utilisation`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/utilisation`, { ...form, report_date: form.report_date || null });
    setForm({ scheme_code: "", scheme_name: "", entity_name: "", grant_amount: 0, utilised_amount: 0, report_date: "", status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/utilisation/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme</th><th>Grant</th><th>Utilised</th><th>Report Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.entity_name}</td><td>{u.scheme_code}</td><td>{u.grant_amount.toLocaleString()}</td>
                <td>{u.utilised_amount.toLocaleString()}</td><td>{u.report_date || "--"}</td>
                <td><span className={`badge ${u.status === "submitted" ? "badge-success" : "badge-gold"}`}>{u.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(u.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No utilisation reports.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Utilisation Report</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Grant Amount</label><input className="input" type="number" value={form.grant_amount} onChange={(e) => setForm({ ...form, grant_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Utilised Amount</label><input className="input" type="number" value={form.utilised_amount} onChange={(e) => setForm({ ...form, utilised_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Report Date</label><input className="input" type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Report</button>
      </form>
    </div>
  );
}
