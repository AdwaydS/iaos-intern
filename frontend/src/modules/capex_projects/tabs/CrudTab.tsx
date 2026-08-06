import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { del, get, post } from "../../../lib/api";

const SLUG = "capex_projects";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  required?: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  format?: "amount" | "pct" | "date" | "text";
  color?: (row: Record<string, unknown>) => string | undefined;
  render?: (row: Record<string, unknown>) => ReactNode;
}

export interface SummaryDef {
  label: string;
  get: (rows: Record<string, unknown>[]) => string | number;
  color?: (value: string | number) => string | undefined;
}

interface CrudTabProps {
  endpoint: string;
  title: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  summaries?: SummaryDef[];
}

export default function CrudTab({
  endpoint,
  title,
  fields,
  columns,
  summaries,
}: CrudTabProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setRows(await get<Record<string, unknown>[]>(`/api/modules/${SLUG}${endpoint}`));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [endpoint]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.key] ?? "";
      if (f.type === "number") body[f.key] = v === "" ? 0 : Number(v);
      else if (f.type === "date") body[f.key] = v || null;
      else body[f.key] = v;
    }
    await post(`/api/modules/${SLUG}${endpoint}`, body);
    setForm({});
    load();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}${endpoint}/${id}`);
    load();
  }

  function cell(row: Record<string, unknown>, col: ColumnDef): ReactNode {
    if (col.render) return col.render(row);
    const v = row[col.key];
    if (v === null || v === undefined || v === "") return "—";
    if (col.format === "amount") return Number(v).toLocaleString();
    if (col.format === "pct") return `${Number(v)}%`;
    return String(v);
  }

  return (
    <div>
      {summaries && summaries.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {summaries.map((s) => {
            const value = s.get(rows);
            return (
              <div key={s.label} className="card" style={{ padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color ? s.color(value) : "var(--navy)" }}>
                  {value}
                </div>
                <div style={{ color: "var(--slate)", fontSize: 13 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "1.5fr 1fr",
          alignItems: "start",
        }}
      >
        <div className="card" style={{ overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: 18 }}>Loading…</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={Number(row.id)}>
                    {columns.map((c) => (
                      <td key={c.key} style={c.color ? { color: c.color(row) } : undefined}>
                        {cell(row, c)}
                      </td>
                    ))}
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 12px" }}
                        onClick={() => remove(Number(row.id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ color: "var(--slate)", textAlign: "center" }}>
                      No records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <form className="card" style={{ padding: 22 }} onSubmit={add}>
          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>{title}</h3>
          {fields.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select
                  className="select"
                  required={f.required}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  required={f.required}
                  type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <button className="btn btn-primary btn-block">Add</button>
        </form>
      </div>
    </div>
  );
}
