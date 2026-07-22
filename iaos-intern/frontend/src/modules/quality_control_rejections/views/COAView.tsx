import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface COARecord {
  id: number;
  vendor: string;
  raw_material: string;
  coa_present: boolean;
  valid_until: string | null;
  matching_specs: boolean;
}

export default function COAView() {
  const [items, setItems] = useState<COARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vendor: "",
    raw_material: "",
    coa_present: true,
    valid_until: "",
    matching_specs: true,
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<COARecord[]>("/api/modules/quality_control_rejections/coa");
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
    if (!form.vendor || !form.raw_material) return;
    try {
      await post("/api/modules/quality_control_rejections/coa", {
        ...form,
        valid_until: form.valid_until || null,
      });
      setForm({
        vendor: "",
        raw_material: "",
        coa_present: true,
        valid_until: "",
        matching_specs: true,
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/quality_control_rejections/coa/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Certificate of Analysis (CoA) Registry</h3>
          <span className="badge badge-success">Audited: {items.length} materials</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading CoA registry…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vendor / Material</th>
                <th>CoA Presence</th>
                <th>Matching Specs</th>
                <th>Valid Until</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.raw_material}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Supplier: {it.vendor}</div>
                  </td>
                  <td>
                    <span className={`badge ${it.coa_present ? "badge-success" : "badge-danger"}`}>
                      {it.coa_present ? "Received" : "Missing / NC"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${it.matching_specs ? "badge-success" : "badge-danger"}`}>
                      {it.matching_specs ? "Within Spec" : "Out of Spec"}
                    </span>
                  </td>
                  <td>{it.valid_until ? new Date(it.valid_until).toLocaleDateString() : "Permanent / No Exp"}</td>
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
                    No CoA records verified yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log CoA Verification</h3>

        <div className="field">
          <label>Material / Raw Compound</label>
          <input
            className="input"
            value={form.raw_material}
            onChange={(e) => setForm({ ...form, raw_material: e.target.value })}
            placeholder="e.g. Active API Lactose Base"
            required
          />
        </div>

        <div className="field">
          <label>Vendor / Supplier</label>
          <input
            className="input"
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            placeholder="e.g. Global Chemical Corp"
            required
          />
        </div>

        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={form.coa_present}
              onChange={(e) => setForm({ ...form, coa_present: e.target.checked })}
              style={{ width: 16, height: 16 }}
            />
            CoA Document Present & Valid
          </label>
        </div>

        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={form.matching_specs}
              onChange={(e) => setForm({ ...form, matching_specs: e.target.checked })}
              style={{ width: 16, height: 16 }}
            />
            Chemical/Physical Spec Match Check Passed
          </label>
        </div>

        <div className="field">
          <label>Certificate Expiry / Valid Until</label>
          <input
            className="input"
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
          />
        </div>

        <button className="btn btn-primary btn-block">Verify & Add CoA</button>
      </form>
    </div>
  );
}
