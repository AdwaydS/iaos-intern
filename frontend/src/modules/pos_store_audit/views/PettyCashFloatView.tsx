import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface PettyCash {
  id: number;
  store_name: string;
  float_amount: number;
  expense_amount: number;
  replenishment_amount: number;
  balance: number;
  recorded_date: string;
}

export default function PettyCashFloatView() {
  const [items, setItems] = useState<PettyCash[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    float_amount: "",
    expense_amount: "",
    replenishment_amount: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<PettyCash[]>(`/api/modules/pos_store_audit/petty_cash`);
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
    if (!form.store_name) return;
    try {
      await post(`/api/modules/pos_store_audit/petty_cash`, {
        ...form,
        float_amount: Number(form.float_amount),
        expense_amount: Number(form.expense_amount),
        replenishment_amount: Number(form.replenishment_amount),
      });
      setForm({ store_name: "", float_amount: "", expense_amount: "", replenishment_amount: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/petty_cash/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Petty Cash & Float Management</h3>
          <span className="badge badge-success">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading petty cash records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Float Amount</th>
                <th>Expense Amount</th>
                <th>Replenishment</th>
                <th>Balance</th>
                <th>Recorded Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{Number(it.float_amount).toLocaleString()}</td>
                  <td>{Number(it.expense_amount).toLocaleString()}</td>
                  <td>{Number(it.replenishment_amount).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.balance < 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.balance).toLocaleString()}
                    </span>
                  </td>
                  <td>{it.recorded_date}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No petty cash records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Petty Cash</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Float Amount</label>
          <input className="input" type="number" value={form.float_amount} onChange={(e) => setForm({ ...form, float_amount: e.target.value })} placeholder="e.g. 10000" required />
        </div>
        <div className="field">
          <label>Expense Amount</label>
          <input className="input" type="number" value={form.expense_amount} onChange={(e) => setForm({ ...form, expense_amount: e.target.value })} placeholder="e.g. 3500" required />
        </div>
        <div className="field">
          <label>Replenishment Amount</label>
          <input className="input" type="number" value={form.replenishment_amount} onChange={(e) => setForm({ ...form, replenishment_amount: e.target.value })} placeholder="e.g. 3500" />
        </div>
        <button className="btn btn-primary btn-block">Save Petty Cash</button>
      </form>
    </div>
  );
}
