import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface InventoryCount {
  id: number;
  store_id: string;
  count_date: string;
  item_code: string;
  system_qty: number;
  physical_qty: number;
  variance: number;
  counted_by: string;
  verified_by: string;
}

export default function PhysicalCountVsSystemView() {
  const [items, setItems] = useState<InventoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    item_code: "",
    system_qty: "",
    physical_qty: "",
    count_date: "",
    counted_by: "",
    verified_by: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/physical-count";

  async function load() {
    setLoading(true);
    try {
      const data = await get<InventoryCount[]>(ENDPOINT);
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
      const system_qty = Number(form.system_qty);
      const physical_qty = Number(form.physical_qty);
      await post(ENDPOINT, {
        store_id: form.store_id,
        item_code: form.item_code,
        system_qty,
        physical_qty,
        variance: system_qty - physical_qty,
        count_date: form.count_date,
        counted_by: form.counted_by,
        verified_by: form.verified_by,
      });
      setForm({ store_id: "", item_code: "", system_qty: "", physical_qty: "", count_date: "", counted_by: "", verified_by: "" });
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
                <th>Item Code</th>
                <th>System Qty</th>
                <th>Physical Qty</th>
                <th>Variance</th>
                <th>Count Date</th>
                <th>Counted By</th>
                <th>Verified By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.item_code}</td>
                  <td>{it.system_qty}</td>
                  <td>{it.physical_qty}</td>
                  <td style={{ color: it.variance !== 0 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{it.variance}</td>
                  <td>{it.count_date}</td>
                  <td>{it.counted_by}</td>
                  <td>{it.verified_by || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={9} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No inventory count records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Inventory Count</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Item Code</label>
          <input className="input" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} placeholder="e.g. SKU-00412" required />
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
          <label>Count Date</label>
          <input className="input" type="date" value={form.count_date} onChange={(e) => setForm({ ...form, count_date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Counted By</label>
          <input className="input" value={form.counted_by} onChange={(e) => setForm({ ...form, counted_by: e.target.value })} placeholder="e.g. Audit Team" required />
        </div>
        <div className="field">
          <label>Verified By</label>
          <input className="input" value={form.verified_by} onChange={(e) => setForm({ ...form, verified_by: e.target.value })} placeholder="e.g. Store Manager" />
        </div>
        <button className="btn btn-primary btn-block">Save Count</button>
      </form>
    </div>
  );
}
