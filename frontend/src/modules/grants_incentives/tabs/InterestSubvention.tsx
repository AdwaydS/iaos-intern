import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface IntSub { id: number; entity_name: string; scheme_code: string; scheme_name: string; loan_amount: number; subvention_pct: string; subvention_amount: number; status: string; claim_date: string | null; notes: string; }

export default function InterestSubvention() {
  const [items, setItems] = useState<IntSub[]>([]);
  const [form, setForm] = useState({ entity_name: "", scheme_code: "", scheme_name: "", loan_amount: 0, subvention_pct: "0", subvention_amount: 0, status: "pending", claim_date: "", notes: "" });
  const load = () => get<IntSub[]>(`/api/modules/${SLUG}/interest`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/interest`, { ...form, claim_date: form.claim_date || null });
    setForm({ entity_name: "", scheme_code: "", scheme_name: "", loan_amount: 0, subvention_pct: "0", subvention_amount: 0, status: "pending", claim_date: "", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/interest/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme</th><th>Loan</th><th>%</th><th>Subvention</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.entity_name}</td><td>{i.scheme_code}</td><td>{i.loan_amount.toLocaleString()}</td>
                <td>{i.subvention_pct}%</td><td>{i.subvention_amount.toLocaleString()}</td>
                <td><span className={`badge ${i.status === "received" ? "badge-success" : "badge-gold"}`}>{i.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(i.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No interest subventions.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Interest Subvention</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Loan Amount</label><input className="input" type="number" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Subvention %</label><input className="input" value={form.subvention_pct} onChange={(e) => setForm({ ...form, subvention_pct: e.target.value })} /></div>
        <div className="field"><label>Subvention Amount</label><input className="input" type="number" value={form.subvention_amount} onChange={(e) => setForm({ ...form, subvention_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Claim Date</label><input className="input" type="date" value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Interest Subvention</button>
      </form>
    </div>
  );
}
