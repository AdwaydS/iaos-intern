import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Transfer {
  id: number;
  from_store: string;
  to_store: string;
  sku: string;
  quantity: number;
  transfer_date: string;
  authorised_by: string;
  status: string;
}

export default function StoreToStoreTransferView() {
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    from_store: "",
    to_store: "",
    sku: "",
    quantity: "",
    authorised_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Transfer[]>(`/api/modules/pos_store_audit/transfers`);
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
    if (!form.from_store || !form.to_store || !form.sku) return;
    try {
      await post(`/api/modules/pos_store_audit/transfers`, {
        ...form,
        quantity: Number(form.quantity),
      });
      setForm({ from_store: "", to_store: "", sku: "", quantity: "", authorised_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/transfers/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Store-to-Store Transfers</h3>
          <span className="badge badge-success">{items.length} Transfers</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading transfer records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>From Store</th>
                <th>To Store</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Transfer Date</th>
                <th>Authorised By</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.from_store}</strong></td>
                  <td><strong>{it.to_store}</strong></td>
                  <td>{it.sku}</td>
                  <td>{it.quantity}</td>
                  <td>{it.transfer_date}</td>
                  <td>{it.authorised_by}</td>
                  <td>
                    <span className={`badge ${it.status === "Completed" ? "badge-success" : it.status === "In Transit" ? "badge-gold" : "badge-slate"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No transfer records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Record Transfer</h3>
        <div className="field">
          <label>From Store</label>
          <input className="input" value={form.from_store} onChange={(e) => setForm({ ...form, from_store: e.target.value })} placeholder="e.g. Store A" required />
        </div>
        <div className="field">
          <label>To Store</label>
          <input className="input" value={form.to_store} onChange={(e) => setForm({ ...form, to_store: e.target.value })} placeholder="e.g. Store B" required />
        </div>
        <div className="field">
          <label>SKU</label>
          <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SKU-00412" required />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 25" required />
        </div>
        <div className="field">
          <label>Authorised By</label>
          <input className="input" value={form.authorised_by} onChange={(e) => setForm({ ...form, authorised_by: e.target.value })} placeholder="e.g. Warehouse Manager" required />
        </div>
        <button className="btn btn-primary btn-block">Save Transfer</button>
      </form>
    </div>
  );
}
