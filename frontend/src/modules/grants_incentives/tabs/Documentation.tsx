import { useEffect, useState } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Doc { id: number; claim_id: number; document_name: string; document_type: string; status: string; notes: string; }

export default function Documentation() {
  const [items, setItems] = useState<Doc[]>([]);
  const [form, setForm] = useState({ claim_id: 0, document_name: "", document_type: "supporting", status: "pending", notes: "" });
  const load = () => get<Doc[]>(`/api/modules/${SLUG}/documents`).then(setItems);
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.document_name.trim()) return;
    await post(`/api/modules/${SLUG}/documents`, form);
    setForm({ claim_id: 0, document_name: "", document_type: "supporting", status: "pending", notes: "" });
    load();
  }
  async function remove(id: number) { await del(`/api/modules/${SLUG}/documents/${id}`); load(); }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Document</th><th>Claim ID</th><th>Type</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td>{d.document_name}</td><td>{d.claim_id}</td><td>{d.document_type}</td>
                <td><span className={`badge ${d.status === "complete" ? "badge-success" : "badge-gold"}`}>{d.status}</span></td>
                <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(d.id)}>Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} style={{ color: "var(--slate)", textAlign: "center" }}>No documents logged.</td></tr>}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Document</h3>
        <div className="field"><label>Claim ID</label><input className="input" type="number" value={form.claim_id} onChange={(e) => setForm({ ...form, claim_id: Number(e.target.value) })} /></div>
        <div className="field"><label>Document Name</label><input className="input" value={form.document_name} onChange={(e) => setForm({ ...form, document_name: e.target.value })} /></div>
        <div className="field"><label>Type</label><select className="select" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}><option value="supporting">Supporting</option><option value="sanction_letter">Sanction Letter</option><option value="utilisation_cert">Utilisation Certificate</option><option value="bank_statement">Bank Statement</option></select></div>
        <button className="btn btn-primary btn-block">Add Document</button>
      </form>
    </div>
  );
}
