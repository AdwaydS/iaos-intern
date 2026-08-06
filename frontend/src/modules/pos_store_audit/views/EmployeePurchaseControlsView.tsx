import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface EmployeePurchase {
  id: number;
  store_id: string;
  employee_id: string;
  transaction_id: string;
  discount_percent: number;
  amount: number;
  approved_by: string;
  timestamp: string;
}

export default function EmployeePurchaseControlsView() {
  const [items, setItems] = useState<EmployeePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    employee_id: "",
    transaction_id: "",
    amount: "",
    discount_percent: "",
    approved_by: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/employee-purchase";

  async function load() {
    setLoading(true);
    try {
      const data = await get<EmployeePurchase[]>(ENDPOINT);
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
    if (!form.store_id || !form.employee_id) return;
    try {
      await post(ENDPOINT, {
        store_id: form.store_id,
        employee_id: form.employee_id,
        transaction_id: form.transaction_id,
        amount: Number(form.amount) || 0,
        discount_percent: Number(form.discount_percent) || 0,
        approved_by: form.approved_by,
        timestamp: new Date().toISOString(),
      });
      setForm({ store_id: "", employee_id: "", transaction_id: "", amount: "", discount_percent: "", approved_by: "" });
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Employee Purchase Controls</h3>
          <span className="badge badge-success">{items.length} Purchases</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading employee purchase records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Employee ID</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Discount %</th>
                <th>Approved By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.employee_id}</td>
                  <td>{it.transaction_id}</td>
                  <td>{Number(it.amount).toLocaleString()}</td>
                  <td>{it.discount_percent}%</td>
                  <td>{it.approved_by}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No employee purchase records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Employee Purchase</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Employee ID</label>
          <input className="input" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g. EMP-00412" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Purchase Amount</label>
          <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 5000" required />
        </div>
        <div className="field">
          <label>Discount %</label>
          <input className="input" type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} placeholder="e.g. 10" required />
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} placeholder="e.g. Store Manager" required />
        </div>
        <button className="btn btn-primary btn-block">Save Purchase</button>
      </form>
    </div>
  );
}
