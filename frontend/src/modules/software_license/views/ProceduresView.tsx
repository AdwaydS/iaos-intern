import { useEffect, useState } from "react";
import { get, post, patch } from "../../../lib/api";

const BASE = "/api/modules/software_license";

interface Procedure {
  id: number;
  step_no: number;
  title: string;
  description: string;
  status: string;
  performed_by: string;
  signed_by: string;
  signed_at: string | null;
  notes: string;
}

export default function ProceduresView({ highlightStep }: { highlightStep?: number }) {
  const [rows, setRows] = useState<Procedure[]>([]);
  const [signer, setSigner] = useState("");

  const load = () => get<Procedure[]>(`${BASE}/procedures`).then(setRows);
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await patch(`${BASE}/procedures/${id}`, { status });
    load();
  };

  const sign = async (id: number) => {
    if (!signer.trim()) {
      alert("Enter your name to sign");
      return;
    }
    await post(`${BASE}/procedures/${id}/sign`, { signed_by: signer });
    load();
  };

  const displayRows = highlightStep ? rows.filter((r) => r.step_no === highlightStep) : rows;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Your name (for sign-off)"
          value={signer}
          onChange={(e) => setSigner(e.target.value)}
          style={{ maxWidth: 260 }}
        />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Step</th>
              <th>Description</th>
              <th>Status</th>
              <th>Signed By</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r) => (
              <tr key={r.id}>
                <td>{r.step_no}</td>
                <td>{r.title}</td>
                <td style={{ opacity: 0.7, maxWidth: 260 }}>{r.description}</td>
                <td>
                  <select
                    className="input"
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    style={{ fontSize: 12, padding: "4px 8px" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="na">N/A</option>
                  </select>
                </td>
                <td>
                  {r.signed_by ? (
                    <span className="badge badge-success">{r.signed_by}</span>
                  ) : (
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => sign(r.id)}>
                      Sign off
                    </button>
                  )}
                </td>
                <td style={{ fontSize: 13, opacity: 0.7 }}>{r.notes || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
