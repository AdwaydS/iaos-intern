import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Inspection {
  id: number;
  lot_number: string;
  inspector: string;
  percentage_inspected: number;
  passed_qty: number;
  rejected_qty: number;
  stage: string;
  status: string;
}

export default function FinalInspectionView() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    lot_number: "",
    inspector: "",
    percentage_inspected: 100,
    passed_qty: 0,
    rejected_qty: 0,
    status: "Pending",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Inspection[]>("/api/modules/quality_control_rejections/inspections");
      setItems(data.filter((i) => i.stage === "final"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lot_number || !form.inspector) return;
    try {
      await post("/api/modules/quality_control_rejections/inspections", {
        ...form,
        stage: "final",
      });
      setForm({
        lot_number: "",
        inspector: "",
        percentage_inspected: 100,
        passed_qty: 0,
        rejected_qty: 0,
        status: "Pending",
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/quality_control_rejections/inspections/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Final Inspection Pre-dispatch</h3>
          <span className="badge badge-success">{items.length} Lots Released</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading release records…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Finished Goods Lot</th>
                <th>Final Count</th>
                <th>Rejects</th>
                <th>Release Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.lot_number}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Signoff: {it.inspector}</div>
                  </td>
                  <td>{it.passed_qty} units</td>
                  <td>{it.rejected_qty} units</td>
                  <td>
                    <span
                      className={`badge ${
                        it.status === "Passed"
                          ? "badge-success"
                          : it.status === "Rejected"
                          ? "badge-danger"
                          : "badge-gold"
                      }`}
                    >
                      {it.status === "Passed" ? "Released" : it.status === "Rejected" ? "Hold / Quarantine" : "Under Review"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "5px 10px", fontSize: 12 }}
                      onClick={() => remove(it.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--slate)", textAlign: "center", padding: 30 }}>
                    No final pre-dispatch records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Pre-Dispatch Release</h3>
        
        <div className="field">
          <label>Finished Product Lot / CO Reference</label>
          <input
            className="input"
            value={form.lot_number}
            onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
            placeholder="e.g. FG-LOT-10255"
            required
          />
        </div>
        
        <div className="field">
          <label>Releasing Officer (Signature Authorized)</label>
          <input
            className="input"
            value={form.inspector}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
            placeholder="e.g. Chief Inspector Roberts"
            required
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Release Qty</label>
            <input
              className="input"
              type="number"
              value={form.passed_qty}
              onChange={(e) => setForm({ ...form, passed_qty: Number(e.target.value) })}
              min={0}
              required
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Hold Qty</label>
            <input
              className="input"
              type="number"
              value={form.rejected_qty}
              onChange={(e) => setForm({ ...form, rejected_qty: Number(e.target.value) })}
              min={0}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Governance Status</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Pending">Under Review</option>
            <option value="Passed">Released for Shipment</option>
            <option value="Rejected">Quarantine / Hold</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block">Log Dispatch Audit</button>
      </form>
    </div>
  );
}
