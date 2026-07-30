import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Writeoff {
  id: number;
  store_name: string;
  sku: string;
  product_name: string;
  quantity: number;
  writeoff_value: number;
  reason: string;
  approved_by: string;
}

export default function DamageExpiryWriteoffView() {
  const [items, setItems] = useState<Writeoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    sku: "",
    product_name: "",
    quantity: "",
    writeoff_value: "",
    reason: "Damage",
    approved_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Writeoff[]>(`/api/modules/pos_store_audit/writeoffs`);
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
    if (!form.store_name || !form.sku) return;
    try {
      await post(`/api/modules/pos_store_audit/writeoffs`, {
        ...form,
        quantity: Number(form.quantity),
        writeoff_value: Number(form.writeoff_value),
      });
      setForm({ store_name: "", sku: "", product_name: "", quantity: "", writeoff_value: "", reason: "Damage", approved_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/writeoffs/${id}`);
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
                <th>SKU</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Write-off Value</th>
                <th>Reason</th>
                <th>Approved By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.sku}</td>
                  <td>{it.product_name}</td>
                  <td>{it.quantity}</td>
                  <td>{Number(it.writeoff_value).toLocaleString()}</td>
                  <td><span className={`badge ${it.reason === "Damage" ? "badge-danger" : it.reason === "Expiry" ? "badge-gold" : it.reason === "Obsolescence" ? "badge-slate" : "badge-success"}`}>{it.reason}</span></td>
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
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>SKU</label>
          <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-00412" required />
        </div>
        <div className="field">
          <label>Product Name</label>
          <input className="input" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Packaged Snacks" required />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10" required />
        </div>
        <div className="field">
          <label>Write-off Value</label>
          <input className="input" type="number" value={form.writeoff_value} onChange={(e) => setForm({ ...form, writeoff_value: e.target.value })} placeholder="e.g. 2500" required />
        </div>
        <div className="field">
          <label>Reason</label>
          <select className="select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
            <option>Damage</option>
            <option>Expiry</option>
            <option>Obsolescence</option>
            <option>Other</option>
          </select>
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
