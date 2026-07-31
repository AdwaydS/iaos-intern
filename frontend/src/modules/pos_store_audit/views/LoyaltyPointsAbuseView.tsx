import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface LoyaltyRecord {
  id: number;
  store_id: string;
  loyalty_id: string;
  transaction_id: string;
  points_accrued: number;
  points_expected: number;
  anomaly_flag: string;
  timestamp: string;
}

export default function LoyaltyPointsAbuseView() {
  const [items, setItems] = useState<LoyaltyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    loyalty_id: "",
    transaction_id: "",
    points_accrued: "",
    points_expected: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/loyalty-abuse";

  async function load() {
    setLoading(true);
    try {
      const data = await get<LoyaltyRecord[]>(ENDPOINT);
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
    if (!form.store_id || !form.loyalty_id) return;
    try {
      const points_accrued = Number(form.points_accrued);
      const points_expected = Number(form.points_expected);
      await post(ENDPOINT, {
        store_id: form.store_id,
        loyalty_id: form.loyalty_id,
        transaction_id: form.transaction_id,
        points_accrued,
        points_expected,
        anomaly_flag: points_accrued > points_expected * 1.15 ? "anomaly" : "normal",
        timestamp: new Date().toISOString(),
      });
      setForm({ store_id: "", loyalty_id: "", transaction_id: "", points_accrued: "", points_expected: "" });
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
                <th>Transaction ID</th>
                <th>Points Accrued</th>
                <th>Points Expected</th>
                <th>Anomaly Flag</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.loyalty_id}</td>
                  <td>{it.transaction_id}</td>
                  <td>{it.points_accrued}</td>
                  <td>{it.points_expected}</td>
                  <td>
                    <span className={`badge ${it.anomaly_flag === "anomaly" ? "badge-danger" : "badge-success"}`}>
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
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Loyalty ID</label>
          <input className="input" value={form.loyalty_id} onChange={(e) => setForm({ ...form, loyalty_id: e.target.value })} placeholder="e.g. LOY-00412" required />
        </div>
        <div className="field">
          <label>Transaction ID</label>
          <input className="input" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} placeholder="e.g. TXN-2026-00412" required />
        </div>
        <div className="field">
          <label>Points Accrued</label>
          <input className="input" type="number" value={form.points_accrued} onChange={(e) => setForm({ ...form, points_accrued: e.target.value })} placeholder="e.g. 1500" required />
        </div>
        <div className="field">
          <label>Points Expected</label>
          <input className="input" type="number" value={form.points_expected} onChange={(e) => setForm({ ...form, points_expected: e.target.value })} placeholder="e.g. 1200" required />
        </div>
        <button className="btn btn-primary btn-block">Save Loyalty Record</button>
      </form>
    </div>
  );
}
