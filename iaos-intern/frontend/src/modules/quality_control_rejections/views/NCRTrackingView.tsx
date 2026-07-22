import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface NCR {
  id: number;
  ncr_number: string;
  description: string;
  severity: string;
  status: string;
  corrective_action: string;
  closed_at: string | null;
}

export default function NCRTrackingView() {
  const [items, setItems] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    ncr_number: "",
    description: "",
    severity: "Minor",
    status: "Open",
    corrective_action: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<NCR[]>("/api/modules/quality_control_rejections/ncr");
      setItems(data);
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
    if (!form.ncr_number || !form.description) return;
    try {
      await post("/api/modules/quality_control_rejections/ncr", {
        ...form,
        closed_at: form.status === "Closed" ? new Date().toISOString() : null,
      });
      setForm({
        ncr_number: "",
        description: "",
        severity: "Minor",
        status: "Open",
        corrective_action: "",
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/quality_control_rejections/ncr/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Non-Conformance Reports (NCR)</h3>
          <span className="badge badge-danger">Active NCRs: {items.filter(i => i.status !== "Closed").length}</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading NCRs…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>NCR Number</th>
                <th>Details / CAPA Action</th>
                <th>Severity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.ncr_number}</strong>
                    {it.closed_at && (
                      <div style={{ fontSize: 11, color: "var(--slate)" }}>
                        Closed: {new Date(it.closed_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{it.description}</div>
                    <div style={{ fontSize: 12, color: "var(--slate-soft)" }}>
                      CAPA: {it.corrective_action || "Pending CAPA logging"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        it.severity === "Critical"
                          ? "badge-danger"
                          : it.severity === "Major"
                          ? "badge-gold"
                          : "badge-slate"
                      }`}
                    >
                      {it.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        it.status === "Closed"
                          ? "badge-success"
                          : it.status === "Open"
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
                    No non-conformance incidents logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Raise Non-Conformance (NCR)</h3>

        <div className="field">
          <label>NCR Number / ID Reference</label>
          <input
            className="input"
            value={form.ncr_number}
            onChange={(e) => setForm({ ...form, ncr_number: e.target.value })}
            placeholder="e.g. NCR-2026-0044"
            required
          />
        </div>

        <div className="field">
          <label>Non-Conformance Description</label>
          <textarea
            className="input"
            style={{ minHeight: 70, fontFamily: "inherit" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the failure or spec deviation..."
            required
          />
        </div>

        <div className="field">
          <label>Corrective & Preventive Action (CAPA)</label>
          <textarea
            className="input"
            style={{ minHeight: 70, fontFamily: "inherit" }}
            value={form.corrective_action}
            onChange={(e) => setForm({ ...form, corrective_action: e.target.value })}
            placeholder="Action plan to close this deviation..."
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Severity</label>
            <select
              className="select"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option>Minor</option>
              <option>Major</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>NCR Status</label>
            <select
              className="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Open</option>
              <option>Under Investigation</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-block">Log NCR Issue</button>
      </form>
    </div>
  );
}
