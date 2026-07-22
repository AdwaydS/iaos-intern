import { useEffect, useState } from "react";
import { get, post, patch, del } from "../../lib/api";

const BASE = "/api/modules/related_party_transactions";

type Tab =
  | "dashboard"
  | "procedures"
  | "scope"
  | "rcm"
  | "rules"
  | "datasources"
  | "samples"
  | "exceptions"
  | "evidence"
  | "findings"
  | "actions";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "procedures", label: "Procedures" },
  { key: "scope", label: "Scope" },
  { key: "rcm", label: "RCM" },
  { key: "rules", label: "Rule Library" },
  { key: "datasources", label: "Data Sources" },
  { key: "samples", label: "Sampling" },
  { key: "exceptions", label: "Exceptions" },
  { key: "evidence", label: "Working Papers" },
  { key: "findings", label: "Findings" },
  { key: "actions", label: "Remediation" },
];

export default function RelatedPartyTransactionsPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div>
      <h1>Related-Party Transactions</h1>
      <p style={{ opacity: 0.7, marginTop: -8 }}>
        Finance Cycles — identify, test and evidence related-party dealings.
      </p>

      <div className="btn-group" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className="btn"
            style={{ opacity: tab === t.key ? 1 : 0.55 }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "procedures" && <ProceduresTab />}
      {tab === "scope" && (
        <SimpleListTab
          endpoint="scope"
          columns={["entity_name", "process_area", "in_scope", "rationale"]}
          emptyItem={{ entity_name: "", process_area: "", in_scope: true, rationale: "" }}
        />
      )}
      {tab === "rcm" && (
        <SimpleListTab
          endpoint="rcm"
          columns={["risk_description", "control_description", "assertion", "control_owner", "risk_rating"]}
          emptyItem={{ risk_description: "", control_description: "", assertion: "", control_owner: "", risk_rating: "medium" }}
        />
      )}
      {tab === "rules" && (
        <SimpleListTab
          endpoint="rules"
          columns={["rule_name", "description", "threshold", "active"]}
          emptyItem={{ rule_name: "", description: "", threshold: "", logic: "", active: true }}
        />
      )}
      {tab === "datasources" && (
        <SimpleListTab
          endpoint="datasources"
          columns={["name", "source_type", "status"]}
          emptyItem={{ name: "", source_type: "upload", connection_details: "", status: "not_connected" }}
        />
      )}
      {tab === "samples" && (
        <SimpleListTab
          endpoint="samples"
          columns={["population_desc", "sample_method", "population_size", "sample_size"]}
          emptyItem={{ population_desc: "", sample_method: "judgemental", population_size: 0, sample_size: 0, notes: "" }}
        />
      )}
      {tab === "exceptions" && (
        <SimpleListTab
          endpoint="exceptions"
          columns={["description", "severity", "status", "disposition"]}
          emptyItem={{ description: "", severity: "medium", status: "open", disposition: "" }}
        />
      )}
      {tab === "evidence" && (
        <SimpleListTab
          endpoint="evidence"
          columns={["title", "file_ref", "reviewer", "reviewed"]}
          emptyItem={{ title: "", file_ref: "", reviewer: "", reviewed: false, notes: "" }}
        />
      )}
      {tab === "findings" && (
        <SimpleListTab
          endpoint="findings"
          columns={["title", "grade", "status", "description"]}
          emptyItem={{ title: "", description: "", grade: "medium", status: "open" }}
        />
      )}
      {tab === "actions" && (
        <SimpleListTab
          endpoint="actions"
          columns={["action_desc", "owner", "due_date", "status", "retest_status"]}
          emptyItem={{ action_desc: "", owner: "", due_date: null, status: "open", retest_status: "not_started" }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function DashboardTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    get(`${BASE}/dashboard`).then(setData);
  }, []);

  if (!data) return <p>Loading…</p>;

  const cards = [
    { label: "Procedures Complete", value: `${data.completed_procedures}/${data.total_procedures}` },
    { label: "Coverage", value: `${data.coverage_pct}%` },
    { label: "Open Exceptions", value: data.open_exceptions },
    { label: "Open Findings", value: data.open_findings },
    { label: "Open Actions", value: data.open_actions },
    { label: "Risk Score", value: data.risk_score.toUpperCase() },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {cards.map((c) => (
        <div className="card" key={c.label} style={{ padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Procedures — the 15 Signature sign-off steps
// ---------------------------------------------------------------------------
function ProceduresTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [signer, setSigner] = useState("");

  const load = () => get<any[]>(`${BASE}/procedures`).then(setRows);
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
      <table className="table">
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
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.step_no}</td>
              <td>{r.title}</td>
              <td style={{ opacity: 0.7 }}>{r.description}</td>
              <td>
                <select
                  className="input"
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="na">N/A</option>
                </select>
              </td>
              <td>
                {r.signed_by ? (
                  <span className="badge">{r.signed_by}</span>
                ) : (
                  <button className="btn" onClick={() => sign(r.id)}>
                    Sign off
                  </button>
                )}
              </td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic list tab for the Shell entities (scope, rcm, rules, etc.)
// ---------------------------------------------------------------------------
function SimpleListTab({
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
          <button className="btn" onClick={create}>
            Add
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c.replace(/_/g, " ")}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c}>{String(r[c] ?? "")}</td>
              ))}
              <td>
                <button className="btn" onClick={() => remove(r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
