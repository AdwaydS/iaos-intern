import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Claim {
  id: number; claim_ref: string; scheme_code: string; scheme_name: string;
  entity_name: string; claimed_amount: number; computed_amount: number;
  claim_date: string | null; status: string; notes: string;
}
interface Accuracy { total_claims: number; matched: number; variances: { claim_ref: string; claimed: number; computed: number; variance: number }[]; }

export default function ClaimAccuracy() {
  const [items, setItems] = useState<Claim[]>([]);
  const [acc, setAcc] = useState<Accuracy | null>(null);
  const [form, setForm] = useState({ claim_ref: "", scheme_code: "", scheme_name: "", entity_name: "", claimed_amount: 0, computed_amount: 0, claim_date: "", status: "pending", notes: "" });

  const load = () => {
    get<Claim[]>(`/api/modules/${SLUG}/claims`).then(setItems);
    get<Accuracy>(`/api/modules/${SLUG}/claims/accuracy`).then(setAcc);
  };
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claim_ref.trim()) return;
    await post(`/api/modules/${SLUG}/claims`, { ...form, claim_date: form.claim_date || null });
    setForm({ claim_ref: "", scheme_code: "", scheme_name: "", entity_name: "", claimed_amount: 0, computed_amount: 0, claim_date: "", status: "pending", notes: "" });
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/claims/${id}`);
    load();
  }

  return (
    <div>
      {acc && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{acc.total_claims}</div>
            <div style={{ color: "var(--slate)", fontSize: 13 }}>Total Claims</div>
          </div>
          <div className="card" style={{ padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>{acc.matched}</div>
            <div style={{ color: "var(--slate)", fontSize: 13 }}>Matched</div>
          </div>
          <div className="card" style={{ padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--red)" }}>{acc.variances.length}</div>
            <div style={{ color: "var(--slate)", fontSize: 13 }}>Variances</div>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Ref</th><th>Entity</th><th>Claimed</th><th>Computed</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.claim_ref}</td><td>{c.entity_name}</td><td>{c.claimed_amount.toLocaleString()}</td>
                  <td style={{ color: c.claimed_amount !== c.computed_amount ? "var(--red)" : undefined }}>{c.computed_amount.toLocaleString()}</td>
                  <td><span className={`badge ${c.status === "approved" ? "badge-success" : "badge-gold"}`}>{c.status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(c.id)}>Delete</button></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center" }}>No claims yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form className="card" style={{ padding: 22 }} onSubmit={add}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log a Claim</h3>
          <div className="field"><label>Claim Ref</label><input className="input" value={form.claim_ref} onChange={(e) => setForm({ ...form, claim_ref: e.target.value })} /></div>
          <div className="field"><label>Scheme Code</label><input className="input" value={form.scheme_code} onChange={(e) => setForm({ ...form, scheme_code: e.target.value })} /></div>
          <div className="field"><label>Scheme Name</label><input className="input" value={form.scheme_name} onChange={(e) => setForm({ ...form, scheme_name: e.target.value })} /></div>
          <div className="field"><label>Entity Name</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} /></div>
          <div className="field"><label>Claimed Amount</label><input className="input" type="number" value={form.claimed_amount} onChange={(e) => setForm({ ...form, claimed_amount: Number(e.target.value) })} /></div>
          <div className="field"><label>Computed Amount</label><input className="input" type="number" value={form.computed_amount} onChange={(e) => setForm({ ...form, computed_amount: Number(e.target.value) })} /></div>
          <div className="field"><label>Claim Date</label><input className="input" type="date" value={form.claim_date} onChange={(e) => setForm({ ...form, claim_date: e.target.value })} /></div>
          <button className="btn btn-primary btn-block">Add Claim</button>
        </form>
      </div>
    </div>
  );
}
