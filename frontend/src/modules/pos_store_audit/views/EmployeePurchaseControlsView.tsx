import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface EmployeePurchase {
  id: number;
  store_name: string;
  employee_name: string;
  employee_id: string;
  purchase_amount: number;
  discount_availed: number;
  approval_ref: string;
  policy_compliant: boolean;
}

export default function EmployeePurchaseControlsView() {
  const [items, setItems] = useState<EmployeePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    employee_name: "",
    employee_id: "",
    purchase_amount: "",
    discount_availed: "",
    approval_ref: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<EmployeePurchase[]>(`/api/modules/pos_store_audit/employee_purchases`);
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
    if (!form.store_name || !form.employee_name) return;
    try {
      await post(`/api/modules/pos_store_audit/employee_purchases`, {
        ...form,
        purchase_amount: Number(form.purchase_amount),
        discount_availed: Number(form.discount_availed),
      });
      setForm({ store_name: "", employee_name: "", employee_id: "", purchase_amount: "", discount_availed: "", approval_ref: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/employee_purchases/${id}`);
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
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Purchase Amount</th>
                <th>Discount Availed</th>
                <th>Approval Ref</th>
                <th>Policy Compliant</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.employee_name}</td>
                  <td>{it.employee_id}</td>
                  <td>{Number(it.purchase_amount).toLocaleString()}</td>
                  <td>{Number(it.discount_availed).toLocaleString()}</td>
                  <td>{it.approval_ref}</td>
                  <td>
                    <span className={`badge ${it.policy_compliant ? "badge-success" : "badge-danger"}`}>
                      {it.policy_compliant ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No employee purchase records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Employee Purchase</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Employee Name</label>
          <input className="input" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} placeholder="e.g. Rajesh Kumar" required />
        </div>
        <div className="field">
          <label>Employee ID</label>
          <input className="input" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g. EMP-00412" required />
        </div>
        <div className="field">
          <label>Purchase Amount</label>
          <input className="input" type="number" value={form.purchase_amount} onChange={(e) => setForm({ ...form, purchase_amount: e.target.value })} placeholder="e.g. 5000" required />
        </div>
        <div className="field">
          <label>Discount Availed</label>
          <input className="input" type="number" value={form.discount_availed} onChange={(e) => setForm({ ...form, discount_availed: e.target.value })} placeholder="e.g. 500" required />
        </div>
        <div className="field">
          <label>Approval Reference</label>
          <input className="input" value={form.approval_ref} onChange={(e) => setForm({ ...form, approval_ref: e.target.value })} placeholder="e.g. APR-00412" required />
        </div>
        <button className="btn btn-primary btn-block">Save Purchase</button>
      </form>
    </div>
  );
}
