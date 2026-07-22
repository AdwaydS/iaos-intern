import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Scheme {
  id: number; scheme_code: string; scheme_name: string; scheme_type: string;
  governing_body: string; max_amount: number; start_date: string | null;
  end_date: string | null; status: string; notes: string;
}

export default function SchemeEligibility() {
  const [items, setItems] = useState<Scheme[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", scheme_type: "grant", governing_body: "", max_amount: 0, start_date: "", end_date: "", status: "active", notes: "" });
  const load = () => get<Scheme[]>(`/api/modules/${SLUG}/schemes`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheme_code.trim()) return;
    await post(`/api/modules/${SLUG}/schemes`, { ...form, start_date: form.start_date || null, end_date: form.end_date || null });
    setForm({ scheme_code: "", scheme_name: "", scheme_type: "grant", governing_body: "", max_amount: 0, start_date: "", end_date: "", status: "active", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/schemes/${id}`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Code</th><th>Scheme Name</th><th>Type</th><th>Max Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.scheme_code}</td>
                <td>{s.scheme_name}</td>
                <td>{s.scheme_type}</td>
                <td>{s.max_amount.toLocaleString()}</td>
                <td><span className={`badge ${s.status === "active" ? "badge-success" : "badge-slate"}`}>{s.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(s.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No schemes registered.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Register a Scheme</h3>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Type</label><select className="select" value={form.scheme_type} onChange={(e) => setForm({ ...form, scheme_type: e.target.value })}><option value="grant">Grant</option><option value="subsidy">Subsidy</option><option value="incentive">Incentive</option><option value="rebate">Rebate</option></select></div>
        <div className="field"><label>Governing Body</label><input className="input" value={form.governing_body} onChange={(e) => setForm({ ...form, governing_body: e.target.value })} /></div>
        <div className="field"><label>Max Amount</label><input className="input" type="number" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Start Date</label><input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
        <div className="field"><label>End Date</label><input className="input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
        <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Scheme</button>
      </form>
    </div>
  );
}
