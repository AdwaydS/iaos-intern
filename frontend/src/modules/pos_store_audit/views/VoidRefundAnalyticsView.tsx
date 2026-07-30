import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface VoidRecord {
  id: number;
  store_name: string;
  transaction_id: string;
  void_type: string;
  amount: number;
  reason: string;
  cashier: string;
  suspicious: boolean;
}

export default function VoidRefundAnalyticsView() {
  const [items, setItems] = useState<VoidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    transaction_id: "",
    void_type: "Void",
    amount: "",
    reason: "",
    cashier: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<VoidRecord[]>(`/api/modules/pos_store_audit/voids`);
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
      await post(`/api/modules/pos_store_audit/voids`, {
        ...form,
        amount: Number(form.amount),
      });
      setForm({ store_name: "", transaction_id: "", void_type: "Void", amount: "", reason: "", cashier: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/voids/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Void & Refund Analytics</h3>
          <span className="badge badge-success">{items.length} Transactions</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading void/refund records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Cashier</th>
                <th>Suspicious</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.transaction_id}</td>
                  <td><span className={`badge ${it.void_type === "Refund" ? "badge-gold" : "badge-slate"}`}>{it.void_type}</span></td>
                  <td>{Number(it.amount).toLocaleString()}</td>
                  <td>{it.reason}</td>
                  <td>{it.cashier}</td>
                  <td>
                    <span className={`badge ${it.suspicious ? "badge-danger" : "badge-success"}`}>
                      {it.suspicious ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No void/refund records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Void/Refund</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Void Type</label>
          <select className="select" value={form.void_type} onChange={(e) => setForm({ ...form, void_type: e.target.value })}>
            <option>Void</option>
            <option>Refund</option>
          </select>
        </div>
        <div className="field">
          <label>Amount</label>
          <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 2500" required />
        </div>
        <div className="field">
          <label>Reason</label>
          <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Item returned" required />
        </div>
        <div className="field">
          <label>Cashier</label>
          <input className="input" value={form.cashier} onChange={(e) => setForm({ ...form, cashier: e.target.value })} placeholder="e.g. Rajesh" required />
        </div>
        <button className="btn btn-primary btn-block">Save Record</button>
      </form>
    </div>
  );
}
