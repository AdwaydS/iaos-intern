import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface InventoryCount {
  id: number;
  store_name: string;
  sku: string;
  product_name: string;
  system_qty: number;
  physical_qty: number;
  variance_qty: number;
  variance_value: number;
  count_date: string;
  counted_by: string;
}

export default function PhysicalCountVsSystemView() {
  const [items, setItems] = useState<InventoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    sku: "",
    product_name: "",
    system_qty: "",
    physical_qty: "",
    counted_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<InventoryCount[]>(`/api/modules/pos_store_audit/inventory_counts`);
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
      await post(`/api/modules/pos_store_audit/inventory_counts`, {
        ...form,
        system_qty: Number(form.system_qty),
        physical_qty: Number(form.physical_qty),
      });
      setForm({ store_name: "", sku: "", product_name: "", system_qty: "", physical_qty: "", counted_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/inventory_counts/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Physical Count vs System Comparison</h3>
          <span className="badge badge-success">{items.length} Counts</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading inventory count records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>SKU</th>
                <th>Product</th>
                <th>System Qty</th>
                <th>Physical Qty</th>
                <th>Variance Qty</th>
                <th>Variance Value</th>
                <th>Count Date</th>
                <th>Counted By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.sku}</td>
                  <td>{it.product_name}</td>
                  <td>{it.system_qty}</td>
                  <td>{it.physical_qty}</td>
                  <td style={{ color: it.variance_qty !== 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{it.variance_qty}</td>
                  <td>{Number(it.variance_value).toLocaleString()}</td>
                  <td>{it.count_date}</td>
                  <td>{it.counted_by}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={10} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No inventory count records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Inventory Count</h3>
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
          <input className="input" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Basmati Rice 5kg" required />
        </div>
        <div className="field">
          <label>System Qty</label>
          <input className="input" type="number" value={form.system_qty} onChange={(e) => setForm({ ...form, system_qty: e.target.value })} placeholder="e.g. 100" required />
        </div>
        <div className="field">
          <label>Physical Qty</label>
          <input className="input" type="number" value={form.physical_qty} onChange={(e) => setForm({ ...form, physical_qty: e.target.value })} placeholder="e.g. 98" required />
        </div>
        <div className="field">
          <label>Counted By</label>
          <input className="input" value={form.counted_by} onChange={(e) => setForm({ ...form, counted_by: e.target.value })} placeholder="e.g. Audit Team" required />
        </div>
        <button className="btn btn-primary btn-block">Save Count</button>
      </form>
    </div>
  );
}
