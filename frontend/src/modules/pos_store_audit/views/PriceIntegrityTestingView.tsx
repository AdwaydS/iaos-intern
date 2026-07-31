import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface PriceCheck {
  id: number;
  store_id: string;
  item_code: string;
  shelf_price: number;
  system_price: number;
  variance: number;
  test_date: string;
  status: string;
}

export default function PriceIntegrityTestingView() {
  const [items, setItems] = useState<PriceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    item_code: "",
    shelf_price: "",
    system_price: "",
    test_date: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/price-integrity";

  async function load() {
    setLoading(true);
    try {
      const data = await get<PriceCheck[]>(ENDPOINT);
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
      const shelf_price = Number(form.shelf_price);
      const system_price = Number(form.system_price);
      const variance = Number((shelf_price - system_price).toFixed(2));
      await post(ENDPOINT, {
        store_id: form.store_id,
        item_code: form.item_code,
        shelf_price,
        system_price,
        variance,
        test_date: form.test_date,
        status: variance === 0 ? "pass" : "fail",
      });
      setForm({ store_id: "", item_code: "", shelf_price: "", system_price: "", test_date: "" });
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
                <th>Item Code</th>
                <th>Shelf Price</th>
                <th>System Price</th>
                <th>Variance</th>
                <th>Test Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.item_code}</td>
                  <td>{Number(it.shelf_price).toLocaleString()}</td>
                  <td>{Number(it.system_price).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.variance !== 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.variance).toLocaleString()}
                    </span>
                  </td>
                  <td>{it.test_date}</td>
                  <td>
                    <span className={`badge ${it.status === "pass" ? "badge-success" : "badge-danger"}`}>{it.status}</span>
                  </td>
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
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Item Code</label>
          <input className="input" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} placeholder="e.g. SKU-00412" required />
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
          <label>Test Date</label>
          <input className="input" type="date" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-block">Save Price Check</button>
      </form>
    </div>
  );
}
