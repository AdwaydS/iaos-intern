import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CashierEvent {
  id: number;
  store_id: string;
  cashier_id: string;
  exception_type: string;
  count: number;
  period: string;
}

export default function CashierExceptionReportView() {
  const [items, setItems] = useState<CashierEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    cashier_id: "",
    exception_type: "no_sale",
    count: "",
    period: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/cashier-exception";

  async function load() {
    setLoading(true);
    try {
      const data = await get<CashierEvent[]>(ENDPOINT);
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
    if (!form.store_id || !form.cashier_id) return;
    try {
      await post(ENDPOINT, {
        store_id: form.store_id,
        cashier_id: form.cashier_id,
        exception_type: form.exception_type,
        count: Number(form.count) || 0,
        period: form.period || "current",
      });
      setForm({ store_id: "", cashier_id: "", exception_type: "no_sale", count: "", period: "" });
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Cashier Exception Report</h3>
          <span className="badge badge-success">{items.length} Events</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading cashier events...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Cashier</th>
                <th>Exception Type</th>
                <th>Count</th>
                <th>Period</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.cashier_id}</td>
                  <td><span className={`badge ${it.exception_type === "override" ? "badge-danger" : it.exception_type === "no_sale" ? "badge-gold" : "badge-slate"}`}>{it.exception_type}</span></td>
                  <td>{it.count}</td>
                  <td>{it.period}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No cashier events found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Cashier Event</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Cashier</label>
          <input className="input" value={form.cashier_id} onChange={(e) => setForm({ ...form, cashier_id: e.target.value })} placeholder="e.g. Priya Singh" required />
        </div>
        <div className="field">
          <label>Exception Type</label>
          <select className="select" value={form.exception_type} onChange={(e) => setForm({ ...form, exception_type: e.target.value })}>
            <option value="no_sale">No-Sale</option>
            <option value="drawer_open">Drawer-Open</option>
            <option value="cash_pickup">Cash-Pickup</option>
            <option value="override">Override</option>
          </select>
        </div>
        <div className="field">
          <label>Count</label>
          <input className="input" type="number" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} placeholder="e.g. 3" required />
        </div>
        <div className="field">
          <label>Period</label>
          <input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. Mar 2026" required />
        </div>
        <button className="btn btn-primary btn-block">Save Event</button>
      </form>
    </div>
  );
}
