import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Discount {
  id: number;
  store_name: string;
  transaction_id: string;
  discount_pct: number;
  approved_by: string;
  reason: string;
  flagged: boolean;
}

export default function DiscountOverrideAbuseView() {
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    transaction_id: "",
    discount_pct: "",
    approved_by: "",
    reason: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Discount[]>(`/api/modules/pos_store_audit/discounts`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.store_name || !form.transaction_id) return;
    try {
      await post(`/api/modules/pos_store_audit/discounts`, {
        ...form,
        discount_pct: Number(form.discount_pct),
      });
      setForm({ store_name: "", transaction_id: "", discount_pct: "", approved_by: "", reason: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/discounts/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Discount Override & Abuse Monitoring</h3>
          <span className="badge badge-success">{items.length} Discounts</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading discount override records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Transaction ID</th>
                <th>Discount %</th>
                <th>Approved By</th>
                <th>Reason</th>
                <th>Flagged</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.transaction_id}</td>
                  <td>{it.discount_pct}%</td>
                  <td>{it.approved_by}</td>
                  <td>{it.reason}</td>
                  <td>
                    <span className={`badge ${it.flagged ? "badge-danger" : "badge-success"}`}>
                      {it.flagged ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No discount override records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Discount Override</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Discount %</label>
          <input className="input" type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} placeholder="e.g. 25" required />
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} placeholder="e.g. Store Manager" required />
        </div>
        <div className="field">
          <label>Reason</label>
          <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Customer complaint" required />
        </div>
        <button className="btn btn-primary btn-block">Save Discount Record</button>
      </form>
    </div>
  );
}
