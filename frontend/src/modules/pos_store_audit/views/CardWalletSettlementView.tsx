import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Settlement {
  id: number;
  store_id: string;
  settlement_date: string;
  total_card_sales: number;
  mdr_amount: number;
  mdr_rate: number;
  net_settlement: number;
  settlement_timing_days: number;
  status: string;
}

export default function CardWalletSettlementView() {
  const [items, setItems] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    settlement_date: "",
    total_card_sales: "",
    mdr_rate: "",
    settlement_timing_days: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/card-settlement";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Settlement[]>(ENDPOINT);
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
    if (!form.store_id || !form.settlement_date) return;
    try {
      const total_card_sales = Number(form.total_card_sales);
      const mdr_rate = Number(form.mdr_rate);
      const mdr_amount = Number((total_card_sales * mdr_rate / 100).toFixed(2));
      await post(ENDPOINT, {
        store_id: form.store_id,
        settlement_date: form.settlement_date,
        total_card_sales,
        mdr_rate,
        mdr_amount,
        net_settlement: Number((total_card_sales - mdr_amount).toFixed(2)),
        settlement_timing_days: Number(form.settlement_timing_days) || 0,
        status: "pending",
      });
      setForm({ store_id: "", settlement_date: "", total_card_sales: "", mdr_rate: "", settlement_timing_days: "" });
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
                <th>Card Sales</th>
                <th>MDR Rate</th>
                <th>MDR Amount</th>
                <th>Net Settlement</th>
                <th>Timing (Days)</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.settlement_date}</td>
                  <td>{Number(it.total_card_sales).toLocaleString()}</td>
                  <td>{it.mdr_rate}%</td>
                  <td>{Number(it.mdr_amount).toLocaleString()}</td>
                  <td>{Number(it.net_settlement).toLocaleString()}</td>
                  <td>{it.settlement_timing_days}</td>
                  <td>
                    <span className={`badge ${it.status === "settled" ? "badge-success" : it.status === "delayed" ? "badge-danger" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
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
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Settlement Date</label>
          <input className="input" type="date" value={form.settlement_date} onChange={(e) => setForm({ ...form, settlement_date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Card / Wallet Sales</label>
          <input className="input" type="number" value={form.total_card_sales} onChange={(e) => setForm({ ...form, total_card_sales: e.target.value })} placeholder="e.g. 150000" required />
        </div>
        <div className="field">
          <label>MDR Rate (%)</label>
          <input className="input" type="number" step="0.01" value={form.mdr_rate} onChange={(e) => setForm({ ...form, mdr_rate: e.target.value })} placeholder="e.g. 1.5" required />
        </div>
        <div className="field">
          <label>Settlement Timing (Days)</label>
          <input className="input" type="number" value={form.settlement_timing_days} onChange={(e) => setForm({ ...form, settlement_timing_days: e.target.value })} placeholder="e.g. 2" required />
        </div>
        <button className="btn btn-primary btn-block">Save Settlement</button>
      </form>
    </div>
  );
}
