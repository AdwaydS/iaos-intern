import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface VoidRecord {
  id: number;
  store_id: string;
  transaction_id: string;
  type: string;
  amount: number;
  reason: string;
  cashier_id: string;
  timestamp: string;
  risk_level: string;
}

export default function VoidRefundAnalyticsView() {
  const [items, setItems] = useState<VoidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    transaction_id: "",
    type: "void",
    amount: "",
    reason: "",
    cashier_id: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/void-refund";

  async function load() {
    setLoading(true);
    try {
      const data = await get<VoidRecord[]>(ENDPOINT);
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
    if (!form.store_id || !form.transaction_id) return;
    try {
      const amount = Number(form.amount);
      await post(ENDPOINT, {
        store_id: form.store_id,
        transaction_id: form.transaction_id,
        type: form.type,
        amount,
        reason: form.reason,
        cashier_id: form.cashier_id,
        timestamp: new Date().toISOString(),
        risk_level: amount > 10000 ? "high" : amount > 5000 ? "medium" : "low",
      });
      setForm({ store_id: "", transaction_id: "", type: "void", amount: "", reason: "", cashier_id: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`${ENDPOINT}/${id}`);
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
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.transaction_id}</td>
                  <td><span className={`badge ${it.type === "refund" ? "badge-gold" : "badge-slate"}`}>{it.type}</span></td>
                  <td>{Number(it.amount).toLocaleString()}</td>
                  <td>{it.reason}</td>
                  <td>{it.cashier_id}</td>
                  <td>
                    <span className={`badge ${it.risk_level === "high" || it.risk_level === "critical" ? "badge-danger" : it.risk_level === "medium" ? "badge-gold" : "badge-success"}`}>
                      {it.risk_level}
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
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="void">Void</option>
            <option value="refund">Refund</option>
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
          <input className="input" value={form.cashier_id} onChange={(e) => setForm({ ...form, cashier_id: e.target.value })} placeholder="e.g. Rajesh" required />
        </div>
        <button className="btn btn-primary btn-block">Save Record</button>
      </form>
    </div>
  );
}
