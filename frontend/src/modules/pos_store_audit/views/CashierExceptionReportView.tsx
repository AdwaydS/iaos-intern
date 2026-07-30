import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CashierEvent {
  id: number;
  store_name: string;
  cashier_name: string;
  event_type: string;
  event_time: string;
  register_id: string;
  notes: string;
}

export default function CashierExceptionReportView() {
  const [items, setItems] = useState<CashierEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    cashier_name: "",
    event_type: "No-Sale",
    register_id: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<CashierEvent[]>(`/api/modules/pos_store_audit/cashier_events`);
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
    if (!form.store_name || !form.cashier_name) return;
    try {
      await post(`/api/modules/pos_store_audit/cashier_events`, form);
      setForm({ store_name: "", cashier_name: "", event_type: "No-Sale", register_id: "", notes: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/cashier_events/${id}`);
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
                <th>Event Type</th>
                <th>Event Time</th>
                <th>Register ID</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.cashier_name}</td>
                  <td><span className={`badge ${it.event_type === "Override" ? "badge-danger" : it.event_type === "No-Sale" ? "badge-gold" : "badge-slate"}`}>{it.event_type}</span></td>
                  <td>{it.event_time}</td>
                  <td>{it.register_id}</td>
                  <td>{it.notes}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No cashier events found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Cashier Event</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Cashier Name</label>
          <input className="input" value={form.cashier_name} onChange={(e) => setForm({ ...form, cashier_name: e.target.value })} placeholder="e.g. Priya Singh" required />
        </div>
        <div className="field">
          <label>Event Type</label>
          <select className="select" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
            <option>No-Sale</option>
            <option>Drawer-Open</option>
            <option>Cash-Pickup</option>
            <option>Override</option>
          </select>
        </div>
        <div className="field">
          <label>Register ID</label>
          <input className="input" value={form.register_id} onChange={(e) => setForm({ ...form, register_id: e.target.value })} placeholder="e.g. REG-03" required />
        </div>
        <div className="field">
          <label>Notes</label>
          <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Manager approval obtained" />
        </div>
        <button className="btn btn-primary btn-block">Save Event</button>
      </form>
    </div>
  );
}
