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

export default function IncomingInspectionView() {
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
      setItems(data.filter((i) => i.stage === "incoming"));
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
        stage: "incoming",
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
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Incoming Shipments Inspected</h3>
          <span className="badge badge-success">{items.length} Lots Registered</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading inspections…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lot / Inspector</th>
                <th>Coverage</th>
                <th>Passed / Rejected</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.lot_number}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Inspected by {it.inspector}</div>
                  </td>
                  <td>{it.percentage_inspected}%</td>
                  <td>
                    <span style={{ color: "var(--success)" }}>{it.passed_qty}</span> /{" "}
                    <span style={{ color: "var(--danger)" }}>{it.rejected_qty}</span>
                  </td>
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
                      {it.status}
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
                    No incoming inspection records log found for this tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Inward Inspection</h3>
        
        <div className="field">
          <label>Lot Number / GRN Reference</label>
          <input
            className="input"
            value={form.lot_number}
            onChange={(e) => setForm({ ...form, lot_number: e.target.value })}
            placeholder="e.g. LOT-2026-A99"
            required
          />
        </div>
        
        <div className="field">
          <label>Inspector Name</label>
          <input
            className="input"
            value={form.inspector}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
            placeholder="e.g. Alan Smith"
            required
          />
        </div>

        <div className="field">
          <label>Inspection Coverage (% of Lot)</label>
          <input
            className="input"
            type="number"
            value={form.percentage_inspected}
            onChange={(e) => setForm({ ...form, percentage_inspected: Number(e.target.value) })}
            min={1}
            max={100}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Passed Qty</label>
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
            <label>Rejected Qty</label>
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
          <label>Inspection Disposition Status</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Pending</option>
            <option>Passed</option>
            <option>Rejected</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block">Log Lot Results</button>
      </form>
    </div>
  );
}
