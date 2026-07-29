import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface CwipItem {
  id: number;
  project_id: string;
  project_name: string;
  cwip_value: number;
  inception_date: string;
  age_days: number;
  status: string;
  capitalisation_date: string;
}

export default function CwipAgeingCapitalisationView() {
  const [items, setItems] = useState<CwipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    project_id: "",
    project_name: "",
    cwip_value: 0,
    inception_date: "",
    status: "In Progress",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<CwipItem[]>(`/api/modules/fixed_assets_cwip/cwip`);
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_id) return;
    try {
      await post(`/api/modules/fixed_assets_cwip/cwip`, form);
      setForm({ project_id: "", project_name: "", cwip_value: 0, inception_date: "", status: "In Progress" });
      load();
    } catch (err) { console.error(err); }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/fixed_assets_cwip/cwip/${id}`);
      load();
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>CWIP Ageing Register</h3>
          <span className="badge badge-gold">{items.length} Projects Tracked</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading CWIP records...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>CWIP Value (₹)</th>
                <th>Inception Date</th>
                <th>Age (Days)</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><strong>{it.project_id}</strong></td>
                  <td>{it.project_name}</td>
                  <td>{it.cwip_value.toLocaleString()}</td>
                  <td>{it.inception_date}</td>
                  <td>
                    <span className={`badge ${it.age_days > 730 ? "badge-danger" : it.age_days > 365 ? "badge-gold" : "badge-success"}`}>
                      {it.age_days}d
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${it.status === "Capitalised" ? "badge-success" : "badge-gold"}`}>
                      {it.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>No CWIP project records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add CWIP Project</h3>
        <div className="field">
          <label>Project ID</label>
          <input className="input" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} placeholder="e.g. CWIP-2026-018" required />
        </div>
        <div className="field">
          <label>Project Name</label>
          <input className="input" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="e.g. New Warehouse Construction" required />
        </div>
        <div className="field">
          <label>CWIP Value (₹)</label>
          <input className="input" type="number" value={form.cwip_value} onChange={(e) => setForm({ ...form, cwip_value: Number(e.target.value) })} min={0} required />
        </div>
        <div className="field">
          <label>Inception Date</label>
          <input className="input" type="date" value={form.inception_date} onChange={(e) => setForm({ ...form, inception_date: e.target.value })} required />
        </div>
        <div className="field">
          <label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>In Progress</option>
            <option>Capitalised</option>
            <option>On Hold</option>
            <option>Delayed</option>
          </select>
        </div>
        <button className="btn btn-primary btn-block">Add CWIP Project</button>
      </form>
    </div>
  );
}
