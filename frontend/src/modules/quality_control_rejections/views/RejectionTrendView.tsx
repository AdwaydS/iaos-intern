import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

interface Rejection {
  id: number;
  item_code: string;
  vendor_name: string;
  production_line: string;
  defect_category: string;
  quantity: number;
  cost: number;
  disposition: string;
}

export default function RejectionTrendView() {
  const [items, setItems] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    item_code: "",
    vendor_name: "",
    production_line: "",
    defect_category: "Dimensions Off",
    quantity: 0,
    cost: 0,
    disposition: "rework",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await get<Rejection[]>("/api/modules/quality_control_rejections/rejections");
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
    if (!form.item_code || !form.vendor_name || !form.production_line) return;
    try {
      await post("/api/modules/quality_control_rejections/rejections", form);
      setForm({
        item_code: "",
        vendor_name: "",
        production_line: "",
        defect_category: "Dimensions Off",
        quantity: 0,
        cost: 0,
        disposition: "rework",
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id: number) {
    try {
      await del(`/api/modules/quality_control_rejections/rejections/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const totalCost = items.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <div style={{ padding: "16px 20px", background: "var(--navy-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "var(--navy)", margin: 0 }}>Rejections & Defect Log</h3>
          <span className="badge badge-danger">Total Loss: ${totalCost.toLocaleString()}</span>
        </div>
        {loading ? (
          <p style={{ padding: 20 }}>Loading rejections…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item / Vendor</th>
                <th>Line / Defect</th>
                <th>Cost / Qty</th>
                <th>Action Taken</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <strong>{it.item_code}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Supplier: {it.vendor_name}</div>
                  </td>
                  <td>
                    {it.production_line}
                    <div style={{ fontSize: 12, color: "var(--danger)" }}>{it.defect_category}</div>
                  </td>
                  <td>
                    <strong>${it.cost.toLocaleString()}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>{it.quantity} units</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        it.disposition === "scrap" ? "badge-danger" : "badge-gold"
                      }`}
                    >
                      {it.disposition.toUpperCase()}
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
                    No defect logs exist.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log Rejection Instance</h3>

        <div className="field">
          <label>Item Code / Part Number</label>
          <input
            className="input"
            value={form.item_code}
            onChange={(e) => setForm({ ...form, item_code: e.target.value })}
            placeholder="e.g. COMP-904-XL"
            required
          />
        </div>

        <div className="field">
          <label>Vendor / Supplier Name</label>
          <input
            className="input"
            value={form.vendor_name}
            onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
            placeholder="e.g. Apex Industrial Solutions"
            required
          />
        </div>

        <div className="field">
          <label>Production Line Location</label>
          <input
            className="input"
            value={form.production_line}
            onChange={(e) => setForm({ ...form, production_line: e.target.value })}
            placeholder="e.g. Line 2 (Packaging)"
            required
          />
        </div>

        <div className="field">
          <label>Defect Category</label>
          <select
            className="select"
            value={form.defect_category}
            onChange={(e) => setForm({ ...form, defect_category: e.target.value })}
          >
            <option>Dimensions Off</option>
            <option>Material Contamination</option>
            <option>Packaging Defect</option>
            <option>Functional Failure</option>
            <option>Surface Blemish</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Quantity Rejected</label>
            <input
              className="input"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              min={1}
              required
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Estimated Cost ($)</label>
            <input
              className="input"
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
              min={0}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Disposition Action</label>
          <select
            className="select"
            value={form.disposition}
            onChange={(e) => setForm({ ...form, disposition: e.target.value })}
          >
            <option value="rework">Rework</option>
            <option value="scrap">Scrap</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block">Log Defect</button>
      </form>
    </div>
  );
}
