import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Export { id: number; scheme_code: string; scheme_name: string; claim_ref: string; export_value: number; incentive_amount: number; status: string; claim_date: string | null; notes: string; }

export default function ExportIncentive() {
  const [items, setItems] = useState<Export[]>([]);
  const [form, setForm] = useState({ scheme_code: "", scheme_name: "", claim_ref: "", export_value: 0, incentive_amount: 0, status: "pending", claim_date: "", notes: "" });
  const load = () => get<Export[]>(`/api/modules/${SLUG}/export`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claim_ref.trim()) return;
    await post(`/api/modules/${SLUG}/export`, { ...form, claim_date: form.claim_date || null });
    setForm({ scheme_code: "", scheme_name: "", claim_ref: "", export_value: 0, incentive_amount: 0, status: "pending", claim_date: "", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/export/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Ref</th><th>Scheme</th><th>Export Value</th><th>Incentive</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((ex) => (
              <tr key={ex.id}>
                <td>{ex.claim_ref}</td><td>{ex.scheme_code}</td><td>{ex.export_value.toLocaleString()}</td>
                <td>{ex.incentive_amount.toLocaleString()}</td>
                <td><span className={`badge ${ex.status === "received" ? "badge-success" : "badge-gold"}`}>{ex.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(ex.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No export incentives.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Export Incentive</h3>
        <div className="field"><label>Claim Ref</label><input className="input" value={form.claim_ref} onChange={(e) => setForm({ ...form, claim_ref: e.target.value })} /></div>
        <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
        <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
        <div className="field"><label>Export Value</label><input className="input" type="number" value={form.export_value} onChange={(e) => setForm({ ...form, export_value: Number(e.target.value) })} /></div>
        <div className="field"><label>Incentive Amount</label><input className="input" type="number" value={form.incentive_amount} onChange={(e) => setForm({ ...form, incentive_amount: Number(e.target.value) })} /></div>
        <div className="field"><label>Claim Date</label><input className="input" type="date" value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
        <button className="btn btn-primary btn-block">Add Export Incentive</button>
      </form>
    </div>
  );
}
