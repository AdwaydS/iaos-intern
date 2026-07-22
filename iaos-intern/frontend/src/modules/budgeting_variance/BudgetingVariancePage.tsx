import { useEffect, useMemo, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

// Budgeting & Variance Analysis — 25 use cases:
//   1-15  Signature analytics tests (tracked as "runs" against a fixed catalog)
//   16-25 Shell / audit-lifecycle sections (dashboard, scope, RCM, rule
//         library, data sources, sampling, exceptions, evidence, findings,
//         remediation actions)
const SLUG = "budgeting_variance";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogEntry {
  code: string;
  seq: number;
  title: string;
  kind: "signature" | "shell";
  description: string;
}

interface Run {
  id: number;
  test_code: string;
  scope_note: string;
  status: string;
  risk_rating: string;
  exceptions_found: number;
  population_size: number;
  sample_size: number;
  notes: string;
}

interface RcmRow {
  id: number;
  risk: string;
  control: string;
  assertion: string;
  control_owner: string;
  frequency: string;
}

interface DataSource {
  id: number;
  name: string;
  source_type: string;
  connection_ref: string;
  notes: string;
}

interface Sample {
  id: number;
  population_desc: string;
  population_size: number;
  method: string;
  sample_size: number;
  notes: string;
}

interface ExceptionRow {
  id: number;
  run_id: number | null;
  description: string;
  amount: number;
  disposition: string;
  reviewer_notes: string;
}

interface Evidence {
  id: number;
  run_id: number | null;
  label: string;
  file_ref: string;
  reviewer: string;
  signed_off: boolean;
}

interface Finding {
  id: number;
  run_id: number | null;
  title: string;
  grade: string;
  description: string;
  owner: string;
  status: string;
}

interface ActionRow {
  id: number;
  finding_id: number | null;
  action: string;
  owner: string;
  due_date: string;
  retest_status: string;
}

interface Dashboard {
  total_runs: number;
  open_exceptions: number;
  open_findings: number;
  high_risk_runs: number;
  coverage_pct: number;
  signature_tests_covered: number;
  signature_tests_total: number;
}

const TABS = [
  "Dashboard",
  "Signature Tests",
  "Risk & Control Matrix",
  "Rule Library",
  "Data Sources",
  "Sampling",
  "Exceptions",
  "Evidence",
  "Findings",
  "Remediation",
] as const;
type Tab = (typeof TABS)[number];

const badgeClass = (v: string) =>
  v === "high" || v === "critical" || v === "escalated" || v === "failed"
    ? "badge badge-danger"
    : v === "medium" || v === "pending" || v === "open" || v === "in_progress" || v === "in_review"
    ? "badge badge-gold"
    : "badge badge-success";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BudgetingVariancePage() {
  const [tab, setTab] = useState<Tab>("Dashboard");

  return (
    <div className="bv-container" style={{ display: "grid", gap: 18 }}>
      <style>{`
        .bv-container {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .bv-container .bv-header {
          background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
          border-radius: 14px;
          padding: 24px;
          color: #ffffff;
          box-shadow: 0 10px 15px -3px rgba(15, 118, 110, 0.1), 0 4px 6px -2px rgba(15, 118, 110, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 6px solid #14b8a6;
        }
        .bv-container .bv-header h2 {
          color: #ffffff !important;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .bv-container .bv-header p {
          color: #ccfbf1 !important;
          margin: 4px 0 0 0;
          font-size: 14px;
        }
        .bv-container .card {
          background: #ffffff !important;
          border: 1px solid #e2dcd0;
          border-left: 4px solid #0f766e !important;
          border-radius: 14px !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02) !important;
          padding: 20px !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .bv-container .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(15, 118, 110, 0.06) !important;
        }
        .bv-container .btn-primary {
          background: #0f766e !important;
          border: 1px solid #0f766e !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 6px rgba(15, 118, 110, 0.2) !important;
        }
        .bv-container .btn-primary:hover {
          background: #115e59 !important;
          transform: translateY(-1px);
        }
        .bv-container .btn-ghost {
          background: transparent !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f766e !important;
          border-radius: 8px !important;
        }
        .bv-container .btn-ghost:hover {
          background: #f0fdf4 !important;
          border-color: #ccfbf1 !important;
          color: #0f766e !important;
        }
        .bv-container th {
          background: #f0fdf4 !important;
          color: #0f766e !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          border-bottom: 2px solid #ccfbf1 !important;
          padding: 12px 16px !important;
        }
        .bv-container td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f0fdf4 !important;
          color: #334155 !important;
        }
        .bv-container tbody tr:hover td {
          background: #f9fdfd !important;
        }
        .bv-container .badge-slate {
          background: #f0fdf4 !important;
          color: #0f766e !important;
          border: 1px solid #ccfbf1 !important;
        }
        .bv-container h3, .bv-container h4 {
          color: #0f766e !important;
          font-weight: 700 !important;
        }
      `}</style>

      {/* Scoped Unique Finance Header */}
      <div className="bv-header">
        <div>
          <h2>Budgeting & Variance Center</h2>
          <p>Financial Integrity & Controls Monitoring Module</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", padding: "10px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: 600 }}>
          📊 Active Session
        </div>
      </div>

      <div className="card" style={{ padding: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? "btn btn-primary" : "btn btn-ghost"}
            style={{ padding: "8px 14px" }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Dashboard" && <DashboardTab />}
      {tab === "Signature Tests" && <SignatureTestsTab />}
      {tab === "Risk & Control Matrix" && <RcmTab />}
      {tab === "Rule Library" && <RuleLibraryTab />}
      {tab === "Data Sources" && <DataSourcesTab />}
      {tab === "Sampling" && <SamplingTab />}
      {tab === "Exceptions" && <ExceptionsTab />}
      {tab === "Evidence" && <EvidenceTab />}
      {tab === "Findings" && <FindingsTab />}
      {tab === "Remediation" && <RemediationTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 16: Dashboard & KPIs
// ---------------------------------------------------------------------------

function KpiCard({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ color: "var(--slate)", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: tone ?? "var(--navy)" }}>{value}</div>
    </div>
  );
}

function DashboardTab() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    get<Dashboard>(`/api/modules/${SLUG}/dashboard`).then(setData);
  }, []);

  if (!data) return <p style={{ padding: 18 }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KpiCard label="Coverage" value={`${data.coverage_pct}%`} />
        <KpiCard
          label="Signature tests run"
          value={`${data.signature_tests_covered} / ${data.signature_tests_total}`}
        />
        <KpiCard label="Total test runs" value={data.total_runs} />
        <KpiCard label="High-risk runs" value={data.high_risk_runs} tone={data.high_risk_runs ? "var(--red, #b42318)" : undefined} />
        <KpiCard label="Open exceptions" value={data.open_exceptions} />
        <KpiCard label="Open findings" value={data.open_findings} />
      </div>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 8 }}>About this module</h3>
        <p style={{ color: "var(--slate)" }}>
          Reviews the budgeting process and variances: pre-approval timing, chronic overspend heads,
          re-budget governance and assumption reasonableness. Use the Signature Tests tab to run and
          score each of the 15 core tests, and the remaining tabs to manage scope, controls, data
          sources, sampling, exceptions, evidence and remediation.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1-15 + 17: Signature Tests (with per-run scope note covering use case 17)
// ---------------------------------------------------------------------------

function SignatureTestsTab() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [scopeNote, setScopeNote] = useState("");
  const [riskRating, setRiskRating] = useState("medium");
  const [populationSize, setPopulationSize] = useState(0);
  const [sampleSize, setSampleSize] = useState(0);
  const [exceptionsFound, setExceptionsFound] = useState(0);
  const [notes, setNotes] = useState("");

  async function refresh() {
    const [c, r] = await Promise.all([
      get<CatalogEntry[]>(`/api/modules/${SLUG}/catalog`),
      get<Run[]>(`/api/modules/${SLUG}/runs`),
    ]);
    const sig = c.filter((e) => e.kind === "signature");
    setCatalog(sig);
    if (!selectedTest && sig.length) setSelectedTest(sig[0].code);
    setRuns(r);
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRun(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTest) return;
    await post(`/api/modules/${SLUG}/runs`, {
      test_code: selectedTest,
      scope_note: scopeNote,
      status: "open",
      risk_rating: riskRating,
      exceptions_found: exceptionsFound,
      population_size: populationSize,
      sample_size: sampleSize,
      notes,
    });
    setScopeNote("");
    setNotes("");
    setExceptionsFound(0);
    setPopulationSize(0);
    setSampleSize(0);
    refresh();
  }

  async function setStatus(run: Run, status: string) {
    await patch(`/api/modules/${SLUG}/runs/${run.id}`, { status });
    refresh();
  }

  const runsByTest = useMemo(() => {
    const m = new Map<string, Run[]>();
    for (const r of runs) m.set(r.test_code, [...(m.get(r.test_code) ?? []), r]);
    return m;
  }, [runs]);

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Signature test catalog (1–15)</h3>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {catalog.map((c) => {
              const testRuns = runsByTest.get(c.code) ?? [];
              return (
                <div
                  key={c.code}
                  className="card"
                  style={{
                    padding: 14,
                    borderColor: c.code === selectedTest ? "var(--navy)" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedTest(c.code)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>
                      {c.seq}. {c.title}
                    </strong>
                    <span className="badge badge-slate">{testRuns.length} run{testRuns.length === 1 ? "" : "s"}</span>
                  </div>
                  <div style={{ color: "var(--slate)", fontSize: 13, marginTop: 2 }}>{c.description}</div>
                  {testRuns.length > 0 && (
                    <table style={{ marginTop: 10 }}>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Risk</th>
                          <th>Population</th>
                          <th>Sample</th>
                          <th>Exceptions</th>
                          <th>Scope note</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {testRuns.map((r) => (
                          <tr key={r.id}>
                            <td><span className={badgeClass(r.status)}>{r.status}</span></td>
                            <td><span className={badgeClass(r.risk_rating)}>{r.risk_rating}</span></td>
                            <td>{r.population_size}</td>
                            <td>{r.sample_size}</td>
                            <td>{r.exceptions_found}</td>
                            <td style={{ color: "var(--slate)" }}>{r.scope_note || "—"}</td>
                            <td style={{ textAlign: "right", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                              {r.status !== "cleared" && (
                                <button className="btn btn-ghost" style={{ padding: "4px 8px" }} onClick={() => setStatus(r, "cleared")}>
                                  Clear
                                </button>
                              )}
                              <button
                                className="btn btn-ghost"
                                style={{ padding: "4px 8px" }}
                                onClick={async () => {
                                  await del(`/api/modules/${SLUG}/runs/${r.id}`);
                                  refresh();
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={addRun}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Run a test</h3>
        <div className="field">
          <label>Test</label>
          <select className="select" value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)}>
            {catalog.map((c) => (
              <option key={c.code} value={c.code}>
                {c.seq}. {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Scope / audit universe note</label>
          <input className="input" value={scopeNote} onChange={(e) => setScopeNote(e.target.value)} placeholder="e.g. FY26 Q1, all cost centres" />
        </div>
        <div className="field">
          <label>Risk rating</label>
          <select className="select" value={riskRating} onChange={(e) => setRiskRating(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Population size</label>
            <input className="input" type="number" value={populationSize} onChange={(e) => setPopulationSize(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Sample size</label>
            <input className="input" type="number" value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))} />
          </div>
        </div>
        <div className="field">
          <label>Exceptions found</label>
          <input className="input" type="number" value={exceptionsFound} onChange={(e) => setExceptionsFound(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Notes</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Save run</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 19: Rule Library (read-only view of the Signature catalog as configurable rules)
// ---------------------------------------------------------------------------

function RuleLibraryTab() {
  const [rules, setRules] = useState<CatalogEntry[]>([]);
  useEffect(() => {
    get<CatalogEntry[]>(`/api/modules/${SLUG}/rule-library`).then(setRules);
  }, []);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Rule</th>
            <th>What it checks</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.code}>
              <td>{r.seq}</td>
              <td>{r.title}</td>
              <td style={{ color: "var(--slate)" }}>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic simple CRUD list+form used by the remaining shell tabs
// ---------------------------------------------------------------------------

function SimpleTable<T extends { id: number }>({
  columns,
  rows,
  onDelete,
}: {
  columns: { key: keyof T; label: string; render?: (v: any, row: T) => React.ReactNode }[];
  rows: T[];
  onDelete: (row: T) => void;
}) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)}>{c.label}</th>
          ))}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((c) => (
              <td key={String(c.key)}>{c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}</td>
            ))}
            <td style={{ textAlign: "right" }}>
              <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => onDelete(row)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length + 1} style={{ color: "var(--slate)" }}>
              No records yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// 18: Risk & Control Matrix
// ---------------------------------------------------------------------------

function RcmTab() {
  const [rows, setRows] = useState<RcmRow[]>([]);
  const [risk, setRisk] = useState("");
  const [control, setControl] = useState("");
  const [assertion, setAssertion] = useState("");
  const [owner, setOwner] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<RcmRow[]>(`/api/modules/${SLUG}/rcm`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!risk.trim()) return;
    await post(`/api/modules/${SLUG}/rcm`, { risk, control, assertion, control_owner: owner, frequency });
    setRisk("");
    setControl("");
    setAssertion("");
    setOwner("");
    setFrequency("");
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <SimpleTable
            columns={[
              { key: "risk", label: "Risk" },
              { key: "control", label: "Control" },
              { key: "assertion", label: "Assertion" },
              { key: "control_owner", label: "Owner" },
              { key: "frequency", label: "Frequency" },
            ]}
            rows={rows}
            onDelete={async (r) => {
              await del(`/api/modules/${SLUG}/rcm/${r.id}`);
              refresh();
            }}
          />
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add risk & control</h3>
        <div className="field">
          <label>Risk</label>
          <input className="input" value={risk} onChange={(e) => setRisk(e.target.value)} required />
        </div>
        <div className="field">
          <label>Control</label>
          <input className="input" value={control} onChange={(e) => setControl(e.target.value)} />
        </div>
        <div className="field">
          <label>Assertion</label>
          <input className="input" value={assertion} onChange={(e) => setAssertion(e.target.value)} placeholder="e.g. completeness, accuracy" />
        </div>
        <div className="field">
          <label>Control owner</label>
          <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <div className="field">
          <label>Frequency</label>
          <input className="input" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. monthly" />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 20: Data Source & Connector Setup
// ---------------------------------------------------------------------------

function DataSourcesTab() {
  const [rows, setRows] = useState<DataSource[]>([]);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("upload");
  const [connectionRef, setConnectionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<DataSource[]>(`/api/modules/${SLUG}/data-sources`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await post(`/api/modules/${SLUG}/data-sources`, { name, source_type: sourceType, connection_ref: connectionRef, notes });
    setName("");
    setConnectionRef("");
    setNotes("");
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <SimpleTable
            columns={[
              { key: "name", label: "Name" },
              { key: "source_type", label: "Type" },
              { key: "connection_ref", label: "Connection" },
              { key: "notes", label: "Notes" },
            ]}
            rows={rows}
            onDelete={async (r) => {
              await del(`/api/modules/${SLUG}/data-sources/${r.id}`);
              refresh();
            }}
          />
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add data source</h3>
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="select" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <option value="erp_table">ERP table</option>
            <option value="api">API</option>
            <option value="upload">Upload</option>
          </select>
        </div>
        <div className="field">
          <label>Connection reference</label>
          <input className="input" value={connectionRef} onChange={(e) => setConnectionRef(e.target.value)} placeholder="table name / endpoint / file" />
        </div>
        <div className="field">
          <label>Notes</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 21: Sampling & Population Builder
// ---------------------------------------------------------------------------

function SamplingTab() {
  const [rows, setRows] = useState<Sample[]>([]);
  const [populationDesc, setPopulationDesc] = useState("");
  const [populationSize, setPopulationSize] = useState(0);
  const [method, setMethod] = useState("judgemental");
  const [sampleSize, setSampleSize] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<Sample[]>(`/api/modules/${SLUG}/samples`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!populationDesc.trim()) return;
    await post(`/api/modules/${SLUG}/samples`, {
      population_desc: populationDesc,
      population_size: populationSize,
      method,
      sample_size: sampleSize,
      notes,
    });
    setPopulationDesc("");
    setPopulationSize(0);
    setSampleSize(0);
    setNotes("");
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <SimpleTable
            columns={[
              { key: "population_desc", label: "Population" },
              { key: "population_size", label: "Pop. size" },
              { key: "method", label: "Method" },
              { key: "sample_size", label: "Sample size" },
              { key: "notes", label: "Notes" },
            ]}
            rows={rows}
            onDelete={async (r) => {
              await del(`/api/modules/${SLUG}/samples/${r.id}`);
              refresh();
            }}
          />
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Draw a sample</h3>
        <div className="field">
          <label>Population description</label>
          <input className="input" value={populationDesc} onChange={(e) => setPopulationDesc(e.target.value)} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Population size</label>
            <input className="input" type="number" value={populationSize} onChange={(e) => setPopulationSize(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Sample size</label>
            <input className="input" type="number" value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))} />
          </div>
        </div>
        <div className="field">
          <label>Method</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="statistical">Statistical</option>
            <option value="judgemental">Judgemental</option>
          </select>
        </div>
        <div className="field">
          <label>Notes</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 22: Exception & Red-Flag Queue
// ---------------------------------------------------------------------------

function ExceptionsTab() {
  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<ExceptionRow[]>(`/api/modules/${SLUG}/exceptions`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    await post(`/api/modules/${SLUG}/exceptions`, { description, amount, disposition: "pending" });
    setDescription("");
    setAmount(0);
    refresh();
  }

  async function setDisposition(row: ExceptionRow, disposition: string) {
    await patch(`/api/modules/${SLUG}/exceptions/${row.id}`, { disposition });
    refresh();
  }

  function handleExport() {
    if (rows.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = "description,amount,disposition\n";
    const csvContent = rows
      .map((r) => `"${r.description.replace(/"/g, '""')}",${r.amount},"${r.disposition}"`)
      .join("\n");
    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "budgeting_exceptions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        alert("Invalid CSV format. Need header line + data lines.");
        return;
      }
      
      const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
      const descIdx = headers.indexOf("description");
      const amtIdx = headers.indexOf("amount");
      const dispIdx = headers.indexOf("disposition");

      if (descIdx === -1) {
        alert("CSV must include a 'description' column.");
        return;
      }

      setLoading(true);
      try {
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.replace(/^"|"$/g, "").trim());
          const descVal = cols[descIdx];
          const amtVal = Number(cols[amtIdx] || 0);
          const dispVal = dispIdx !== -1 ? cols[dispIdx] : "pending";

          if (descVal) {
            await post(`/api/modules/${SLUG}/exceptions`, {
              description: descVal,
              amount: amtVal,
              disposition: dispVal,
            });
          }
        }
        alert("Successfully imported CSV data!");
      } catch (err) {
        console.error(err);
        alert("Error during CSV import.");
      }
      refresh();
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div style={{ display: "grid", gap: 18, height: "fit-content" }}>
        {/* CSV Import/Export Controls */}
        <div className="card" style={{ padding: "12px 18px", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 15 }}>CSV Data Actions</h4>
            <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>Bulk import/export exception items</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label className="btn btn-ghost" style={{ padding: "6px 12px", cursor: "pointer", margin: 0, fontSize: 13 }}>
              📥 Import CSV
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleImport} />
            </label>
            <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 13 }} onClick={handleExport}>
              📤 Export CSV
            </button>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          {loading ? (
            <p style={{ padding: 18 }}>Loading…</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Disposition</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.description}</td>
                    <td>{r.amount}</td>
                    <td>
                      <select className="select" value={r.disposition} onChange={(e) => setDisposition(r, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="valid">Valid</option>
                        <option value="false_positive">False positive</option>
                        <option value="waived">Waived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 12px" }}
                        onClick={async () => {
                          await del(`/api/modules/${SLUG}/exceptions/${r.id}`);
                          refresh();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: "var(--slate)" }}>
                      No exceptions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log an exception</h3>
        <div className="field">
          <label>Description</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="field">
          <label>Amount</label>
          <input className="input" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 23: Working Papers & Evidence
// ---------------------------------------------------------------------------

function EvidenceTab() {
  const [rows, setRows] = useState<Evidence[]>([]);
  const [label, setLabel] = useState("");
  const [fileRef, setFileRef] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<Evidence[]>(`/api/modules/${SLUG}/evidence`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    await post(`/api/modules/${SLUG}/evidence`, { label, file_ref: fileRef, reviewer, signed_off: false });
    setLabel("");
    setFileRef("");
    setReviewer("");
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <SimpleTable
            columns={[
              { key: "label", label: "Evidence" },
              { key: "file_ref", label: "Reference" },
              { key: "reviewer", label: "Reviewer" },
              { key: "signed_off", label: "Signed off", render: (v) => (v ? <span className="badge badge-success">Yes</span> : <span className="badge badge-slate">No</span>) },
            ]}
            rows={rows}
            onDelete={async (r) => {
              await del(`/api/modules/${SLUG}/evidence/${r.id}`);
              refresh();
            }}
          />
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Attach evidence</h3>
        <div className="field">
          <label>Label</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} required />
        </div>
        <div className="field">
          <label>File reference / link</label>
          <input className="input" value={fileRef} onChange={(e) => setFileRef(e.target.value)} />
        </div>
        <div className="field">
          <label>Reviewer</label>
          <input className="input" value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 24: Observation & Finding Log
// ---------------------------------------------------------------------------

function FindingsTab() {
  const [rows, setRows] = useState<Finding[]>([]);
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("medium");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<Finding[]>(`/api/modules/${SLUG}/findings`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await post(`/api/modules/${SLUG}/findings`, { title, grade, description, owner, status: "open" });
    setTitle("");
    setDescription("");
    setOwner("");
    refresh();
  }

  async function setStatus(row: Finding, status: string) {
    await patch(`/api/modules/${SLUG}/findings/${row.id}`, { status });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Finding</th>
                <th>Grade</th>
                <th>Owner</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td><span className={badgeClass(r.grade)}>{r.grade}</span></td>
                  <td>{r.owner || "—"}</td>
                  <td>
                    <select className="select" value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px" }}
                      onClick={async () => {
                        await del(`/api/modules/${SLUG}/findings/${r.id}`);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--slate)" }}>
                    No findings logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Raise a finding</h3>
        <div className="field">
          <label>Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label>Grade</label>
          <select className="select" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Owner</label>
          <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 25: Remediation / Action Tracker
// ---------------------------------------------------------------------------

function RemediationTab() {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [action, setAction] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setRows(await get<ActionRow[]>(`/api/modules/${SLUG}/actions`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!action.trim()) return;
    await post(`/api/modules/${SLUG}/actions`, { action, owner, due_date: dueDate, retest_status: "not_started" });
    setAction("");
    setOwner("");
    setDueDate("");
    refresh();
  }

  async function setRetest(row: ActionRow, retest_status: string) {
    await patch(`/api/modules/${SLUG}/actions/${row.id}`, { retest_status });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Owner</th>
                <th>Due date</th>
                <th>Re-test</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.action}</td>
                  <td>{r.owner || "—"}</td>
                  <td>{r.due_date || "—"}</td>
                  <td>
                    <select className="select" value={r.retest_status} onChange={(e) => setRetest(r, e.target.value)}>
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px" }}
                      onClick={async () => {
                        await del(`/api/modules/${SLUG}/actions/${r.id}`);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--slate)" }}>
                    No remediation actions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Track a CAPA item</h3>
        <div className="field">
          <label>Action</label>
          <input className="input" value={action} onChange={(e) => setAction(e.target.value)} required />
        </div>
        <div className="field">
          <label>Owner</label>
          <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </div>
        <div className="field">
          <label>Due date</label>
          <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}
