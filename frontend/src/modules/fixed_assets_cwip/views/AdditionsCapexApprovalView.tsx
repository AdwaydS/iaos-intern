import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CapexAddition {
  id: number;
  capex_id: string;
  description: string;
  estimated_cost: number;
  department: string;
  requesting_manager: string;
  approval_status: string;
  capitalisation_date: string;
}

export default function AdditionsCapexApprovalView() {
  const [items, setItems] = useState<CapexAddition[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    capex_id: "",
    description: "",
    estimated_cost: 0,
    department: "",
    requesting_manager: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<CapexAddition[]>(`/api/modules/fixed_assets_cwip/capex`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.capex_id) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/capex`, { ...form, approval_status: "Pending", capitalisation_date: "" });
      setForm({ capex_id: "", description: "", estimated_cost: 0, department: "", requesting_manager: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/capex/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Capex Additions Register</h3>
          <span className="badge badge-gold">{items.length} Proposals Tracked</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading capex additions...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Capex ID</th>
                <th>Description</th>
                <th>Est. Cost (₹)</th>
                <th>Department</th>
                <th>Requestor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.capex_id}</strong></td>
                  <td>{it.description}</td>
                  <td>₹{it.estimated_cost.toLocaleString()}</td>
                  <td>{it.department}</td>
                  <td>{it.requesting_manager}</td>
                  <td>
                    <span className={`badge ${it.approval_status === "Approved" ? "badge-success" : it.approval_status === "Rejected" ? "badge-danger" : "badge-gold"}`}>
                      {it.approval_status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No capex addition records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>New Capex Addition</h3>
        <div className="field">
          <label>Capex Request ID</label>
          <input className="input" value={form.capex_id} onChange={(e) => setForm({ ...form, capex_id: e.target.value })} placeholder="e.g. CAPEX-2026-0045" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. New Assembly Line Robot" required />
        </div>
        <div className="field">
          <label>Estimated Cost (₹)</label>
          <input className="input" type="number" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Department</label>
          <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Manufacturing" required />
        </div>
        <div className="field">
          <label>Requesting Manager</label>
          <input className="input" value={form.requesting_manager} onChange={(e) => setForm({ ...form, requesting_manager: e.target.value })} placeholder="e.g. Plant Head" required />
        </div>
        <button className="btn btn-primary btn-block">Submit Capex Proposal</button>
      </form>
    </div>
  );
}
