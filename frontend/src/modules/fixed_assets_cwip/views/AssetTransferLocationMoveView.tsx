import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Transfer {
  id: number;
  asset_tag: string;
  asset_description: string;
  from_location: string;
  to_location: string;
  transfer_date: string;
  transfer_type: string;
  approved_by: string;
  status: string;
}

export default function AssetTransferLocationMoveView() {
  const [items, setItems] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    from_location: "",
    to_location: "",
    transfer_type: "Inter-Department",
    approved_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Transfer[]>(`/api/modules/fixed_assets_cwip/transfers`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset_tag) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/transfers`, { ...form, transfer_date: new Date().toISOString().slice(0, 10), status: "Pending Approval" });
      setForm({ asset_tag: "", asset_description: "", from_location: "", to_location: "", transfer_type: "Inter-Department", approved_by: "" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/transfers/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Asset Transfer & Location Move</h3>
          <span className="badge badge-gold">{items.length} Transfers</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading transfer records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>From</th>
                <th>To</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.from_location}</td>
                  <td>{it.to_location}</td>
                  <td>{it.transfer_type}</td>
                  <td>{it.transfer_date}</td>
                  <td>
                    <span className={`badge ${it.status === "Approved" ? "badge-success" : it.status === "Rejected" ? "badge-danger" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No transfer records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Initiate Asset Transfer</h3>
        <div className="field">
          <label>Asset Tag</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. CNC Lathe Machine" required />
        </div>
        <div className="field">
          <label>From Location</label>
          <input className="input" value={form.from_location} onChange={(e) => setForm({ ...form, from_location: e.target.value })} placeholder="e.g. Factory Block A" required />
        </div>
        <div className="field">
          <label>To Location</label>
          <input className="input" value={form.to_location} onChange={(e) => setForm({ ...form, to_location: e.target.value })} placeholder="e.g. Factory Block B" required />
        </div>
        <div className="field">
          <label>Transfer Type</label>
          <select className="select" value={form.transfer_type} onChange={(e) => setForm({ ...form, transfer_type: e.target.value })}>
            <option>Inter-Department</option>
            <option>Inter-Site</option>
            <option>Inter-Company</option>
          </select>
        </div>
        <div className="field">
          <label>Approved By</label>
          <input className="input" value={form.approved_by} onChange={(e) => setForm({ ...form, approved_by: e.target.value })} placeholder="e.g. Asset Manager" required />
        </div>
        <button className="btn btn-primary btn-block">Submit Transfer Request</button>
      </form>
    </div>
  );
}
