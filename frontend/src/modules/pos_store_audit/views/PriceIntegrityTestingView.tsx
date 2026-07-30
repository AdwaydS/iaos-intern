import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface PriceCheck {
  id: number;
  store_name: string;
  sku: string;
  product_name: string;
  shelf_price: number;
  system_price: number;
  variance: number;
  checked_by: string;
}

export default function PriceIntegrityTestingView() {
  const [items, setItems] = useState<PriceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    sku: "",
    product_name: "",
    shelf_price: "",
    system_price: "",
    checked_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<PriceCheck[]>(`/api/modules/pos_store_audit/price_checks`);
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
      await post(`/api/modules/pos_store_audit/price_checks`, {
        ...form,
        shelf_price: Number(form.shelf_price),
        system_price: Number(form.system_price),
      });
      setForm({ store_name: "", sku: "", product_name: "", shelf_price: "", system_price: "", checked_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/price_checks/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Price Integrity Testing</h3>
          <span className="badge badge-success">{items.length} Checks</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading price check records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>SKU</th>
                <th>Product</th>
                <th>Shelf Price</th>
                <th>System Price</th>
                <th>Variance</th>
                <th>Checked By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.sku}</td>
                  <td>{it.product_name}</td>
                  <td>{Number(it.shelf_price).toLocaleString()}</td>
                  <td>{Number(it.system_price).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.variance !== 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.variance).toLocaleString()}
                    </span>
                  </td>
                  <td>{it.checked_by}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No price check records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Price Check</h3>
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
          <input className="input" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Premium Basmati Rice" required />
        </div>
        <div className="field">
          <label>Shelf Price</label>
          <input className="input" type="number" value={form.shelf_price} onChange={(e) => setForm({ ...form, shelf_price: e.target.value })} placeholder="e.g. 450" required />
        </div>
        <div className="field">
          <label>System Price</label>
          <input className="input" type="number" value={form.system_price} onChange={(e) => setForm({ ...form, system_price: e.target.value })} placeholder="e.g. 475" required />
        </div>
        <div className="field">
          <label>Checked By</label>
          <input className="input" value={form.checked_by} onChange={(e) => setForm({ ...form, checked_by: e.target.value })} placeholder="e.g. Audit Staff" required />
        </div>
        <button className="btn btn-primary btn-block">Save Price Check</button>
      </form>
    </div>
  );
}
