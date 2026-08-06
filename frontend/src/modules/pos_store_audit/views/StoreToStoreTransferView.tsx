import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Transfer {
  id: number;
  from_store: string;
  to_store: string;
  item_code: string;
  quantity: number;
  transfer_date: string;
  status: string;
  document_ref: string;
}

export default function StoreToStoreTransferView() {
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    from_store: "",
    to_store: "",
    item_code: "",
    quantity: "",
    transfer_date: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/store-transfer";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Transfer[]>(ENDPOINT);
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
    if (!form.from_store || !form.to_store || !form.item_code) return;
    try {
      await post(ENDPOINT, {
        from_store: form.from_store,
        to_store: form.to_store,
        item_code: form.item_code,
        quantity: Number(form.quantity) || 0,
        transfer_date: form.transfer_date,
        status: "pending",
      });
      setForm({ from_store: "", to_store: "", item_code: "", quantity: "", transfer_date: "" });
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
                <th>Item Code</th>
                <th>Quantity</th>
                <th>Transfer Date</th>
                <th>Doc Ref</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.from_store}</strong></td>
                  <td><strong>{it.to_store}</strong></td>
                  <td>{it.item_code}</td>
                  <td>{it.quantity}</td>
                  <td>{it.transfer_date}</td>
                  <td>{it.document_ref || "—"}</td>
                  <td>
                    <span className={`badge ${it.status === "completed" ? "badge-success" : it.status === "in_transit" ? "badge-gold" : "badge-slate"}`}>
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
          <label>Item Code</label>
          <input className="input" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} placeholder="e.g. SKU-00412" required />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 25" required />
        </div>
        <div className="field">
          <label>Transfer Date</label>
          <input className="input" type="date" value={form.transfer_date} onChange={(e) => setForm({ ...form, transfer_date: e.target.value })} required />
        </div>
        <button className="btn btn-primary btn-block">Save Transfer</button>
      </form>
    </div>
  );
}
