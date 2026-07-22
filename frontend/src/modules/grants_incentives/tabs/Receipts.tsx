import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Receipt { id: number; claim_id: number; claim_ref: string; scheme_code: string; amount_received: number; receipt_date: string | null; ageing_days: number; status: string; notes: string; }

export default function Receipts() {
  const [items, setItems] = useState<Receipt[]>([]);
  const [form, setForm] = useState({ claim_id: 0, claim_ref: "", scheme_code: "", amount_received: 0, receipt_date: "", ageing_days: 0, status: "pending", notes: "" });
  const load = () => get<Receipt[]>(`/api/modules/${SLUG}/receipts`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claim_ref.trim()) return;
    await post(`/api/modules/${SLUG}/receipts`, { ...form, receipt_date: form.receipt_date || null });
    setForm({ claim_id: 0, claim_ref: "", scheme_code: "", amount_received: 0, receipt_date: "", ageing_days: 0, status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/receipts/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Claim Ref</th><th>Received</th><th>Date</th><th>Ageing</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.claim_ref}</td><td>{r.amount_received.toLocaleString()}</td><td>{r.receipt_date || "--"}</td>
                <td style={{ color: r.ageing_days > 90 ? "var(--red)" : undefined }}>{r.ageing_days}d</td>
                <td><span className={`badge ${r.status === "received" ? "badge-success" : "badge-gold"}`}>{r.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(r.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No receipts tracked.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Receipt</h3>
        <div className="field"><label>Claim ID</label><input className="input" type="number" value={form.claim_id} onChange={(e) => setForm({ ...form, claim_id: Number(e.target.value) })} /></div>
        <div className="field"><label>Claim Ref</label><input className="input" value={form.claim_ref} onChange={(e) => setForm({ ...form, claim_ref: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Amount Received</label><input className="input" type="number" value={form.amount_received} onChange={(e) => setForm({ ...form, amount_received: Number(e.target.value) })} /></div>
        <div className="field"><label>Receipt Date</label><input className="input" type="date" value={form.receipt_date} onChange={(e) => setForm({ ...form, receipt_date: e.target.value })} /></div>
        <div className="field"><label>Ageing (days)</label><input className="input" type="number" value={form.ageing_days} onChange={(e) => setForm({ ...form, ageing_days: Number(e.target.value) })} /></div>
        <button className="btn btn-primary btn-block">Add Receipt</button>
      </form>
    </div>
  );
}
