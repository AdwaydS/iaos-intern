import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Cap { id: number; entity_name: string; scheme_code: string; scheme_name: string; investment_amount: number; subsidy_amount: number; status: string; claim_date: string | null; notes: string; }

export default function CapitalSubsidy() {
  const [items, setItems] = useState<Cap[]>([]);
  const [form, setForm] = useState({ entity_name: "", scheme_code: "", scheme_name: "", investment_amount: 0, subsidy_amount: 0, status: "pending", claim_date: "", notes: "" });
  const load = () => get<Cap[]>(`/api/modules/${SLUG}/capital`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/capital`, { ...form, claim_date: form.claim_date || null });
    setForm({ entity_name: "", scheme_code: "", scheme_name: "", investment_amount: 0, subsidy_amount: 0, status: "pending", claim_date: "", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/capital/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme</th><th>Investment</th><th>Subsidy</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.entity_name}</td><td>{c.scheme_code}</td><td>{c.investment_amount.toLocaleString()}</td>
                <td>{c.subsidy_amount.toLocaleString()}</td>
                <td><span className={`badge ${c.status === "received" ? "badge-success" : "badge-gold"}`}>{c.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(c.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No capital subsidies.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Capital Subsidy</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Investment Amount</label><input className="input" type="number" value={form.investment_amount} onChange={(e) => setForm({ ...form, investment_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Subsidy Amount</label><input className="input" type="number" value={form.subsidy_amount} onChange={(e) => setForm({ ...form, subsidy_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Claim Date</label><input className="input" type="date" value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Capital Subsidy</button>
      </form>
    </div>
  );
}
