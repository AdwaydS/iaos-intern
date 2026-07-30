import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface LoyaltyRecord {
  id: number;
  store_name: string;
  loyalty_id: string;
  customer_name: string;
  points_accrued: number;
  transaction_value: number;
  anomaly_flag: string;
}

export default function LoyaltyPointsAbuseView() {
  const [items, setItems] = useState<LoyaltyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    loyalty_id: "",
    customer_name: "",
    points_accrued: "",
    transaction_value: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<LoyaltyRecord[]>(`/api/modules/pos_store_audit/loyalty`);
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
    if (!form.store_name || !form.loyalty_id) return;
    try {
      await post(`/api/modules/pos_store_audit/loyalty`, {
        ...form,
        points_accrued: Number(form.points_accrued),
        transaction_value: Number(form.transaction_value),
      });
      setForm({ store_name: "", loyalty_id: "", customer_name: "", points_accrued: "", transaction_value: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/loyalty/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Loyalty Points Abuse Monitoring</h3>
          <span className="badge badge-success">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading loyalty records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Loyalty ID</th>
                <th>Customer</th>
                <th>Points Accrued</th>
                <th>Transaction Value</th>
                <th>Anomaly Flag</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.loyalty_id}</td>
                  <td>{it.customer_name}</td>
                  <td>{it.points_accrued}</td>
                  <td>{Number(it.transaction_value).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${it.anomaly_flag === "Yes" ? "badge-danger" : "badge-success"}`}>
                      {it.anomaly_flag}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No loyalty records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Loyalty Record</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Loyalty ID</label>
          <input className="input" value={form.loyalty_id} onChange={(e) => setForm({ ...form, loyalty_id: e.target.value })} placeholder="e.g. LOY-00412" required />
        </div>
        <div className="field">
          <label>Customer Name</label>
          <input className="input" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="e.g. Amit Sharma" required />
        </div>
        <div className="field">
          <label>Points Accrued</label>
          <input className="input" type="number" value={form.points_accrued} onChange={(e) => setForm({ ...form, points_accrued: e.target.value })} placeholder="e.g. 1500" required />
        </div>
        <div className="field">
          <label>Transaction Value</label>
          <input className="input" type="number" value={form.transaction_value} onChange={(e) => setForm({ ...form, transaction_value: e.target.value })} placeholder="e.g. 12000" required />
        </div>
        <button className="btn btn-primary btn-block">Save Loyalty Record</button>
      </form>
    </div>
  );
}
