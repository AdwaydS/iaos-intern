import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface ComplaintLink {
  id: number;
  complaint_id: string;
  customer_name: string;
  defect_description: string;
  linked_qc_lot_id: number | null;
}

export default function CustomerComplaintView() {
  const [items, setItems] = useState<ComplaintLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    complaint_id: "",
    customer_name: "",
    defect_description: "",
    linked_qc_lot_id: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<ComplaintLink[]>("/api/modules/quality_control_rejections/complaints");
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
    if (!form.complaint_id || !form.customer_name || !form.defect_description) return;
    try {
      await post("/api/modules/quality_control_rejections/complaints", {
        ...form,
        linked_qc_lot_id: form.linked_qc_lot_id ? Number(form.linked_qc_lot_id) : null,
      });
      setForm({
        complaint_id: "",
        customer_name: "",
        defect_description: "",
        linked_qc_lot_id: "",
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/quality_control_rejections/complaints/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Customer Complaint & Field Failure Linkage</h3>
          <span className="badge badge-gold">Traced Gaps: {items.length} Links</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading complaint links…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Complaint Ref / Client</th>
                <th>Field Defect Description</th>
                <th>Linked QC Lot ID</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.complaint_id}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Client: {it.customer_name}</div>
                  </td>
                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.defect_description}
                  </td>
                  <td>
                    {it.linked_qc_lot_id ? (
                      <span className="badge badge-success">QC LOT #{it.linked_qc_lot_id}</span>
                    ) : (
                      <span className="badge badge-danger">Untraced (Gap)</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${it.linked_qc_lot_id ? "badge-success" : "badge-gold"}`}>
                      {it.linked_qc_lot_id ? "Linked / Audited" : "Pending QC Trace"}
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
                    No customer complaints linked to QC inspection lots yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Complaint Trace</h3>

        <div className="field">
          <label>Complaint Reference Number</label>
          <input
            className="input"
            value={form.complaint_id}
            onChange={(e) => setForm({ ...form, complaint_id: e.target.value })}
            placeholder="e.g. COMP-2026-X88"
            required
          />
        </div>

        <div className="field">
          <label>Customer Name</label>
          <input
            className="input"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            placeholder="e.g. BioGen Lab Partners"
            required
          />
        </div>

        <div className="field">
          <label>Field Defect Details / Description</label>
          <textarea
            className="input"
            style={{ minHeight: 80, fontFamily: "inherit" }}
            value={form.defect_description}
            onChange={(e) => setForm({ ...form, defect_description: e.target.value })}
            placeholder="Describe the complaint or failure mode..."
            required
          />
        </div>

        <div className="field">
          <label>Linked QC Inspection Lot ID (Optional)</label>
          <input
            className="input"
            type="number"
            value={form.linked_qc_lot_id}
            onChange={(e) => setForm({ ...form, linked_qc_lot_id: e.target.value })}
            placeholder="Leave empty to flag as untraced gap"
          />
        </div>

        <button className="btn btn-primary btn-block">Log Trace Link</button>
      </form>
    </div>
  );
}
