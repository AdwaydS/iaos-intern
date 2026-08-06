import { useEffect, useState } from "react";
import { get, post, del } from "../../../lib/api";

const BASE = "/api/modules/software_license";

export default function SimpleLicenseListTab({
  endpoint,
  columns,
  emptyItem,
}: {
  endpoint: string;
  columns: string[];
  emptyItem: Record<string, any>;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>(emptyItem);

  const load = () => get<any[]>(`${BASE}/${endpoint}`).then(setRows);
  useEffect(() => {
    load();
  }, [endpoint]);

  const create = async () => {
    await post(`${BASE}/${endpoint}`, form);
    setForm(emptyItem);
    load();
  };

  const remove = async (id: number) => {
    await del(`${BASE}/${endpoint}/${id}`);
    load();
  };

  return (
    <div>
      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {columns.map((col) => (
            <input
              key={col}
              className="input"
              placeholder={col.replace(/_/g, " ")}
              value={form[col] ?? ""}
              onChange={(e) => setForm({ ...form, [col]: e.target.value })}
            />
          ))}
          <button className="btn btn-primary" onClick={create}>
            Add
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c.replace(/_/g, " ")}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ opacity: 0.5, textAlign: "center" }}>
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c}>{String(r[c] ?? "")}</td>
                  ))}
                  <td>
                    <button className="btn btn-ghost" onClick={() => remove(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
