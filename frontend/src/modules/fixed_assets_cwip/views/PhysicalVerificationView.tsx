import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Verification {
  id: number;
  asset_tag: string;
  asset_description: string;
  location: string;
  verified_by: string;
  verification_date: string;
  status: string;
}

export default function PhysicalVerificationView() {
  const [items, setItems] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    asset_tag: "",
    asset_description: "",
    location: "",
    verified_by: "",
    status: "Pending",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Verification[]>(`/api/modules/fixed_assets_cwip/verifications`);
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
    if (!form.asset_tag || !form.verified_by) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/verifications`, { ...form, verification_date: new Date().toISOString().slice(0, 10) });
      setForm({ asset_tag: "", asset_description: "", location: "", verified_by: "", status: "Pending" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/verifications/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Physical Verification Register</h3>
          <span className="badge badge-success">{items.length} Assets Verified</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading verification records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Description</th>
                <th>Location</th>
                <th>Verified By</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.asset_tag}</strong></td>
                  <td>{it.asset_description}</td>
                  <td>{it.location}</td>
                  <td>{it.verified_by}</td>
                  <td>
                    <span className={`badge ${it.status === "Verified" ? "badge-success" : it.status === "Discrepancy" ? "badge-danger" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No physical verification records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Physical Verification</h3>
        <div className="field">
          <label>Asset Tag / QR Code</label>
          <input className="input" value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} placeholder="e.g. FA-2026-00412" required />
        </div>
        <div className="field">
          <label>Asset Description</label>
          <input className="input" value={form.asset_description} onChange={(e) => setForm({ ...form, asset_description: e.target.value })} placeholder="e.g. CNC Lathe Machine" required />
        </div>
        <div className="field">
          <label>Physical Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Factory Block B, Bay 7" required />
        </div>
        <div className="field">
          <label>Verified By</label>
          <input className="input" value={form.verified_by} onChange={(e) => setForm({ ...form, verified_by: e.target.value })} placeholder="e.g. Rajesh Kumar" required />
        </div>
        <div className="field">
          <label>Verification Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option>
            <option>Verified</option>
            <option>Discrepancy</option>
            <option>Missing</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Record Verification</button>
      </form>
    </div>
  );
}
