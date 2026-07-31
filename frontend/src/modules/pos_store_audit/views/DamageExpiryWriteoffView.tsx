import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Writeoff {
  id: number;
  store_id: string;
  item_code: string;
  quantity: number;
  write_off_type: string;
  value: number;
  date: string;
  approved_by: string;
}

export default function DamageExpiryWriteoffView() {
  const [items, setItems] = useState<Writeoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    item_code: "",
    quantity: "",
    write_off_type: "damage",
    value: "",
    date: "",
    approved_by: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/damage-writeoff";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Writeoff[]>(ENDPOINT);
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
    if (!form.store_id || !form.item_code) return;
    try {
      await post(ENDPOINT, {
        store_id: form.store_id,
        item_code: form.item_code,
        quantity: Number(form.quantity) || 0,
        write_off_type: form.write_off_type,
        value: Number(form.value) || 0,
        date: form.date,
        approved_by: form.approved_by,
      });
      setForm({ store_id: "", item_code: "", quantity: "", write_off_type: "damage", value: "", date: "", approved_by: "" });
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Damage & Expiry Write-off Register</h3>
          <span className="badge badge-success">{items.length} Write-offs</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading write-off records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Item Code</th>
                <th>Qty</th>
                <th>Write-off Type</th>
                <th>Value</th>
                <th>Date</th>
                <th>Approved By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.item_code}</td>
                  <td>{it.quantity}</td>
                  <td><span className={`badge ${it.write_off_type === "damage" ? "badge-danger" : it.write_off_type === "expiry" ? "badge-gold" : "badge-slate"}`}>{it.write_off_type}</span></td>
                  <td>{Number(it.value).toLocaleString()}</td>
                  <td>{it.date}</td>
                  <td>{it.approved_by}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No write-off records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Write-off</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Item Code</label>
          <input className="input" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} placeholder="e.g. SKU-00412" required />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10" required />
        </div>
        <div className="field">
          <label>Write-off Type</label>
          <select className="select" value={form.write_off_type} onChange={(e) => setForm({ ...form, write_off_type: e.target.value })}>
            <option value="damage">Damage</option>
            <option value="expiry">Expiry</option>
            <option value="obsolescence">Obsolescence</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label>Value</label>
          <input className="input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="e.g. 2500" required />
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} placeholder="e.g. Store Manager" required />
        </div>
        <button className="btn btn-primary btn-block">Save Write-off</button>
      </form>
    </div>
  );
}
