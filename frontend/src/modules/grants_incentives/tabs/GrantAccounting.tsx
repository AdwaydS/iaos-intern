import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Acct { id: number; scheme_code: string; scheme_name: string; entity_name: string; grant_amount: number; recognition_method: string; periods: number; period_amount: number; status: string; notes: string; }

export default function GrantAccounting() {
  const [items, setItems] = useState<Acct[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", entity_name: "", grant_amount: 0, recognition_method: "income", periods: 1, period_amount: 0, status: "pending", notes: "" });
  const load = () => get<Acct[]>(`/api/modules/${SLUG}/accounting`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/accounting`, form);
    setForm({ scheme_code: "", scheme_name: "", entity_name: "", grant_amount: 0, recognition_method: "income", periods: 1, period_amount: 0, status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/accounting/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme</th><th>Grant</th><th>Method</th><th>Periods</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.entity_name}</td><td>{a.scheme_code}</td><td>{a.grant_amount.toLocaleString()}</td>
                <td>{a.recognition_method}</td><td>{a.periods}</td>
                <td><span className={`badge ${a.status === "recognized" ? "badge-success" : "badge-gold"}`}>{a.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(a.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No accounting records.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Accounting Record</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Grant Amount</label><input className="input" type="number" value={form.grant_amount} onChange={(e) => setForm({ ...form, grant_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Recognition Method</label><select className="select" value={form.recognition_method} onChange={(e) => setForm({ ...form, recognition_method: e.target.value })}><option value="income">Income</option><option value="capital">Capital</option></select></div>
        <div className="field"><label>Periods</label><input className="input" type="number" value={form.periods} onChange={(e) => setForm({ ...form, periods: Number(e.target.value) })} /></div>
        <button className="btn btn-primary btn-block">Add Record</button>
      </form>
    </div>
  );
}
