import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Shrinkage {
  id: number;
  store_name: string;
  sku: string;
  description: string;
  system_qty: number;
  physical_qty: number;
  loss_qty: number;
  loss_value: number;
  category: string;
}

export default function ShrinkageStockLossView() {
  const [items, setItems] = useState<Shrinkage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    sku: "",
    description: "",
    system_qty: "",
    physical_qty: "",
    category: "Theft",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Shrinkage[]>(`/api/modules/pos_store_audit/shrinkage`);
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
      await post(`/api/modules/pos_store_audit/shrinkage`, {
        ...form,
        system_qty: Number(form.system_qty),
        physical_qty: Number(form.physical_qty),
      });
      setForm({ store_name: "", sku: "", description: "", system_qty: "", physical_qty: "", category: "Theft" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/shrinkage/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Shrinkage & Stock Loss Register</h3>
          <span className="badge badge-success">{items.length} Events</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading shrinkage records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>SKU</th>
                <th>Description</th>
                <th>System Qty</th>
                <th>Physical Qty</th>
                <th>Loss Qty</th>
                <th>Loss Value</th>
                <th>Category</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.sku}</td>
                  <td>{it.description}</td>
                  <td>{it.system_qty}</td>
                  <td>{it.physical_qty}</td>
                  <td style={{ color: "var(--danger)", fontWeight: 600 }}>{it.loss_qty}</td>
                  <td>{Number(it.loss_value).toLocaleString()}</td>
                  <td><span className={`badge ${it.category === "Theft" ? "badge-danger" : it.category === "Damage" ? "badge-gold" : it.category === "Expiry" ? "badge-slate" : "badge-success"}`}>{it.category}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={9} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No shrinkage records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Report Shrinkage</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>SKU</label>
          <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-00412" required />
        </div>
        <div className="field">
          <label>Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Packaged Rice 5kg" required />
        </div>
        <div className="field">
          <label>System Qty</label>
          <input className="input" type="number" value={form.system_qty} onChange={(e) => setForm({ ...form, system_qty: e.target.value })} placeholder="e.g. 50" required />
        </div>
        <div className="field">
          <label>Physical Qty</label>
          <input className="input" type="number" value={form.physical_qty} onChange={(e) => setForm({ ...form, physical_qty: e.target.value })} placeholder="e.g. 47" required />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Theft</option>
            <option>Damage</option>
            <option>Expiry</option>
            <option>Admin Error</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Report Shrinkage</button>
      </form>
    </div>
  );
}
