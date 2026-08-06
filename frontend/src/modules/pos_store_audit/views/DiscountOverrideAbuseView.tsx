import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Discount {
  id: number;
  store_id: string;
  transaction_id: string;
  discount_amount: number;
  original_amount: number;
  discount_pct: number;
  override_reason: string;
  cashier_id: string;
  timestamp: string;
  risk_level: string;
}

export default function DiscountOverrideAbuseView() {
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    transaction_id: "",
    original_amount: "",
    discount_pct: "",
    override_reason: "",
    cashier_id: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/discount-override";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Discount[]>(ENDPOINT);
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
      const original_amount = Number(form.original_amount);
      const discount_pct = Number(form.discount_pct);
      await post(ENDPOINT, {
        store_id: form.store_id,
        transaction_id: form.transaction_id,
        original_amount,
        discount_pct,
        discount_amount: Number((original_amount * discount_pct / 100).toFixed(2)),
        override_reason: form.override_reason,
        cashier_id: form.cashier_id,
        timestamp: new Date().toISOString(),
        risk_level: discount_pct > 20 ? "high" : discount_pct > 10 ? "medium" : "low",
      });
      setForm({ store_id: "", transaction_id: "", original_amount: "", discount_pct: "", override_reason: "", cashier_id: "" });
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
                <th>Discount Amount</th>
                <th>Cashier</th>
                <th>Reason</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.transaction_id}</td>
                  <td>{it.discount_pct}%</td>
                  <td>{Number(it.discount_amount).toLocaleString()}</td>
                  <td>{it.cashier_id}</td>
                  <td>{it.override_reason}</td>
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
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No discount override records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Discount Override</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Original Amount</label>
          <input className="input" type="number" value={form.original_amount} onChange={(e) => setForm({ ...form, original_amount: e.target.value })} placeholder="e.g. 5000" required />
        </div>
        <div className="field">
          <label>Discount %</label>
          <input className="input" type="number" value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: e.target.value })} placeholder="e.g. 25" required />
        </div>
        <div className="field">
          <label>Cashier</label>
          <input className="input" value={form.cashier_id} onChange={(e) => setForm({ ...form, cashier_id: e.target.value })} placeholder="e.g. Rajesh" required />
        </div>
        <div className="field">
          <label>Override Reason</label>
          <input className="input" value={form.override_reason} onChange={(e) => setForm({ ...form, override_reason: e.target.value })} placeholder="e.g. Customer complaint" required />
        </div>
        <button className="btn btn-primary btn-block">Save Discount Record</button>
      </form>
    </div>
  );
}
