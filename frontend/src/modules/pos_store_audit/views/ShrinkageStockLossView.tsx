import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Shrinkage {
  id: number;
  store_id: string;
  period: string;
  category: string;
  book_stock: number;
  physical_stock: number;
  variance: number;
  variance_pct: number;
  root_cause: string;
}

export default function ShrinkageStockLossView() {
  const [items, setItems] = useState<Shrinkage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    period: "",
    category: "theft",
    book_stock: "",
    physical_stock: "",
    root_cause: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/shrinkage";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Shrinkage[]>(ENDPOINT);
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
    if (!form.store_id || !form.period) return;
    try {
      const book_stock = Number(form.book_stock);
      const physical_stock = Number(form.physical_stock);
      const variance = Number((book_stock - physical_stock).toFixed(2));
      await post(ENDPOINT, {
        store_id: form.store_id,
        period: form.period,
        category: form.category,
        book_stock,
        physical_stock,
        variance,
        variance_pct: book_stock > 0 ? Number((variance / book_stock * 100).toFixed(2)) : 0,
        root_cause: form.root_cause,
      });
      setForm({ store_id: "", period: "", category: "theft", book_stock: "", physical_stock: "", root_cause: "" });
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
                <th>Period</th>
                <th>Book Stock</th>
                <th>Physical Stock</th>
                <th>Variance</th>
                <th>Variance %</th>
                <th>Category</th>
                <th>Root Cause</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.period}</td>
                  <td>{it.book_stock}</td>
                  <td>{it.physical_stock}</td>
                  <td style={{ color: it.variance > 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{it.variance}</td>
                  <td>{it.variance_pct}%</td>
                  <td><span className={`badge ${it.category === "theft" ? "badge-danger" : it.category === "damage" ? "badge-gold" : it.category === "expiry" ? "badge-slate" : "badge-success"}`}>{it.category}</span></td>
                  <td>{it.root_cause || "—"}</td>
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
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Period</label>
          <input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. Mar 2026" required />
        </div>
        <div className="field">
          <label>Book Stock</label>
          <input className="input" type="number" value={form.book_stock} onChange={(e) => setForm({ ...form, book_stock: e.target.value })} placeholder="e.g. 50" required />
        </div>
        <div className="field">
          <label>Physical Stock</label>
          <input className="input" type="number" value={form.physical_stock} onChange={(e) => setForm({ ...form, physical_stock: e.target.value })} placeholder="e.g. 47" required />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="theft">Theft</option>
            <option value="damage">Damage</option>
            <option value="expiry">Expiry</option>
            <option value="admin_error">Admin Error</option>
          </select>
        </div>
        <div className="field">
          <label>Root Cause</label>
          <input className="input" value={form.root_cause} onChange={(e) => setForm({ ...form, root_cause: e.target.value })} placeholder="e.g. Unauthorised removal" />
        </div>
        <button className="btn btn-primary btn-block">Report Shrinkage</button>
      </form>
    </div>
  );
}
