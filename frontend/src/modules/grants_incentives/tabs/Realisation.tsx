import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Real { id: number; scheme_code: string; scheme_name: string; entity_name: string; claimed_amount: number; received_amount: number; variance: number; claim_date: string | null; receipt_date: string | null; status: string; notes: string; }

export default function Realisation() {
  const [items, setItems] = useState<Real[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", entity_name: "", claimed_amount: 0, received_amount: 0, claim_date: "", receipt_date: "", status: "pending", notes: "" });
  const load = () => get<Real[]>(`/api/modules/${SLUG}/realisation`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/realisation`, { ...form, claim_date: form.claim_date || null, receipt_date: form.receipt_date || null });
    setForm({ scheme_code: "", scheme_name: "", entity_name: "", claimed_amount: 0, received_amount: 0, claim_date: "", receipt_date: "", status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/realisation/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Entity</th><th>Scheme</th><th>Claimed</th><th>Received</th><th>Variance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.entity_name}</td><td>{r.scheme_code}</td><td>{r.claimed_amount.toLocaleString()}</td>
                <td>{r.received_amount.toLocaleString()}</td>
                <td style={{ color: r.variance > 0 ? "var(--red)" : "var(--green)" }}>{r.variance.toLocaleString()}</td>
                <td><span className={`badge ${r.status === "realised" ? "badge-success" : "badge-gold"}`}>{r.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(r.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center" }}>No realisation records.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Realisation</h3>
        <div className="field"><label>Entity</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Claimed Amount</label><input className="input" type="number" value={form.claimed_amount} onChange={(e) => setForm({ ...form, claimed_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Received Amount</label><input className="input" type="number" value={form.received_amount} onChange={(e) => setForm({ ...form, received_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Claim Date</label><input className="input" type="date" value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
        <div className="field"><label>Receipt Date</label><input className="input" type="date" value={form.receipt_date} onChange={(e) => setForm({ ...form, receipt_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Realisation</button>
      </form>
    </div>
  );
}
