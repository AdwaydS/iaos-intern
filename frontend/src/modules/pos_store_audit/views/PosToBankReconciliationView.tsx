import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Reconciliation {
  id: number;
  store_id: string;
  sale_date: string;
  total_sales: number;
  total_settlements: number;
  variance: number;
  status: string;
  notes: string;
}

export default function PosToBankReconciliationView() {
  const [items, setItems] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_id: "",
    sale_date: "",
    total_sales: "",
    total_settlements: "",
  });

  const ENDPOINT = "/api/modules/pos_store_audit/pos-bank-reconciliation";

  async function load() {
    setLoading(true);
    try {
      const data = await get<Reconciliation[]>(ENDPOINT);
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
    if (!form.store_id || !form.sale_date) return;
    try {
      const total_sales = Number(form.total_sales);
      const total_settlements = Number(form.total_settlements);
      await post(ENDPOINT, {
        store_id: form.store_id,
        sale_date: form.sale_date,
        total_sales,
        total_settlements,
        variance: Number((total_sales - total_settlements).toFixed(2)),
        status: "open",
      });
      setForm({ store_id: "", sale_date: "", total_sales: "", total_settlements: "" });
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>POS-to-Bank Reconciliations</h3>
          <span className="badge badge-success">{items.length} Records</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading reconciliation records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Sales Date</th>
                <th>POS Total</th>
                <th>Bank Credit</th>
                <th>Variance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.store_id}</strong></td>
                  <td>{it.sale_date}</td>
                  <td>{Number(it.total_sales).toLocaleString()}</td>
                  <td>{Number(it.total_settlements).toLocaleString()}</td>
                  <td>
                    <span style={{ color: it.variance < 0 ? "var(--danger)" : it.variance > 0 ? "var(--gold-strong)" : "var(--success)", fontWeight: 600 }}>
                      {Number(it.variance).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${it.status === "matched" ? "badge-success" : it.status === "unmatched" ? "badge-danger" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No reconciliation records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add Reconciliation</h3>
        <div className="field">
          <label>Store</label>
          <input className="input" value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} placeholder="e.g. Downtown Store" required />
        </div>
        <div className="field">
          <label>Sales Date</label>
          <input className="input" type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} required />
        </div>
        <div className="field">
          <label>POS Total</label>
          <input className="input" type="number" value={form.total_sales} onChange={(e) => setForm({ ...form, total_sales: e.target.value })} placeholder="e.g. 125000" required />
        </div>
        <div className="field">
          <label>Bank Credit</label>
          <input className="input" type="number" value={form.total_settlements} onChange={(e) => setForm({ ...form, total_settlements: e.target.value })} placeholder="e.g. 124500" required />
        </div>
        <button className="btn btn-primary btn-block">Save Reconciliation</button>
      </form>
    </div>
  );
}
