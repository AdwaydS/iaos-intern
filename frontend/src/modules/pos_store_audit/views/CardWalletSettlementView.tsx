import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Settlement {
  id: number;
  store_name: string;
  settlement_date: string;
  card_type: string;
  gross_sales: number;
  mdr_rate: number;
  mdr_amount: number;
  net_settlement: number;
  settlement_timing_days: number;
}

export default function CardWalletSettlementView() {
  const [items, setItems] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: "",
    settlement_date: "",
    card_type: "Visa",
    gross_sales: "",
    mdr_rate: "",
    net_settlement: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Settlement[]>(`/api/modules/pos_store_audit/settlements`);
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
    if (!form.store_name || !form.settlement_date) return;
    try {
      await post(`/api/modules/pos_store_audit/settlements`, {
        ...form,
        gross_sales: Number(form.gross_sales),
        mdr_rate: Number(form.mdr_rate),
        net_settlement: Number(form.net_settlement),
      });
      setForm({ store_name: "", settlement_date: "", card_type: "Visa", gross_sales: "", mdr_rate: "", net_settlement: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/pos_store_audit/settlements/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Card & Wallet Settlements</h3>
          <span className="badge badge-success">{items.length} Settlements</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading settlement records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Settlement Date</th>
                <th>Card Type</th>
                <th>Gross Sales</th>
                <th>MDR Rate</th>
                <th>MDR Amount</th>
                <th>Net Settlement</th>
                <th>Timing (Days)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_name}</strong></td>
                  <td>{it.settlement_date}</td>
                  <td><span className="badge badge-gold">{it.card_type}</span></td>
                  <td>{Number(it.gross_sales).toLocaleString()}</td>
                  <td>{it.mdr_rate}%</td>
                  <td>{Number(it.mdr_amount).toLocaleString()}</td>
                  <td>{Number(it.net_settlement).toLocaleString()}</td>
                  <td>{it.settlement_timing_days}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={9} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No settlement records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Settlement Record</h3>
        <div className="field">
          <label>Store Name</label>
          <input className="input" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Settlement Date</label>
          <input className="input" type="date" value={form.settlement_date} onChange={(e) => setForm({ ...form, settlement_date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Card Type</label>
          <select className="select" value={form.card_type} onChange={(e) => setForm({ ...form, card_type: e.target.value })}>
            <option>Visa</option>
            <option>Mastercard</option>
            <option>UPI</option>
            <option>Wallet</option>
            <option>Amex</option>
          </select>
        </div>
        <div className="field">
          <label>Gross Sales</label>
          <input className="input" type="number" value={form.gross_sales} onChange={(e) => setForm({ ...form, gross_sales: e.target.value })} placeholder="e.g. 150000" required />
        </div>
        <div className="field">
          <label>MDR Rate (%)</label>
          <input className="input" type="number" step="0.01" value={form.mdr_rate} onChange={(e) => setForm({ ...form, mdr_rate: e.target.value })} placeholder="e.g. 1.5" required />
        </div>
        <div className="field">
          <label>Net Settlement</label>
          <input className="input" type="number" value={form.net_settlement} onChange={(e) => setForm({ ...form, net_settlement: e.target.value })} placeholder="e.g. 147750" required />
        </div>
        <button className="btn btn-primary btn-block">Save Settlement</button>
      </form>
    </div>
  );
}
