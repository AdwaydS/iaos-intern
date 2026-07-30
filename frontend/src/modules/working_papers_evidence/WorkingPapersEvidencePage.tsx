import { useEffect, useState } from "react";
import { get, getToken, patch, post } from "../../lib/api";

const SLUG = "working_papers_evidence";

// ---- Types mirroring backend/schemas.py -----------------------------------

interface Paper {
  id: number;
  title: string;
  filename: string;
  programme_step: string;
  engagement_ref: string;
  tags: string;
  notes: string;
  source_type: string;
  is_confidential: boolean;
  retention_years: number;
  hash_value: string;
  current_version: number;
  uploaded_by: string;
  created_at: string;
}

interface TickMark {
  id: number;
  symbol: string;
  location_ref: string;
  comment: string;
  created_by: string;
}

interface SignOff {
  id: number;
  stage: string;
  signed_by: string;
  signed_at: string;
}

interface CompletenessRow {
  programme_step: string;
  paper_count: number;
  missing_signoff: number;
  missing_hash: number;
}

const SIGNOFF_STAGES = ["preparer", "reviewer", "manager", "partner"];

// ---- Shell-feature types ----------------------------------------------------

interface DashboardKPIs {
  total_papers: number;
  confidential_papers: number;
  open_exceptions: number;
  open_findings: number;
  overdue_remediation: number;
  coverage_pct: number;
  hash_coverage_pct: number;
}
interface ScopeUnit { id: number; name: string; unit_type: string; description: string; in_scope: boolean; }
interface RcmRow { id: number; risk: string; control: string; assertion: string; control_owner: string; }
interface Rule { id: number; name: string; rule_type: string; config: string; active: boolean; }
interface DataSource { id: number; name: string; source_type: string; connection_info: string; }
interface Population { id: number; name: string; size: number; method: string; sample_size: number; }
interface SampleItem { id: number; population_id: number; reference: string; description: string; }
interface ExceptionRow { id: number; description: string; status: string; disposition: string; }
interface FindingRow { id: number; title: string; grade: string; status: string; }
interface RemediationRow { id: number; action: string; owner: string; status: string; }

type TabKey =
  | "vault" | "completeness" | "dashboard" | "scope" | "rcm" | "rules"
  | "sources" | "sampling" | "exceptions" | "findings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "vault", label: "Evidence Vault" },
  { key: "scope", label: "Scope & Universe" },
  { key: "rcm", label: "Risk & Control Matrix" },
  { key: "rules", label: "Rule Library" },
  { key: "sources", label: "Data Sources" },
  { key: "sampling", label: "Sampling" },
  { key: "exceptions", label: "Exceptions" },
  { key: "findings", label: "Findings & Remediation" },
  { key: "completeness", label: "Completeness Scan" },
];

// Raw fetch for multipart uploads — the shared post()/patch() helpers in
// lib/api.ts always send JSON, so file attachment bypasses them and builds
// the Authorization header itself.
async function uploadFile(path: string, form: FormData) {
  const token = getToken();
  const res = await fetch(path, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}

export default function WorkingPapersEvidencePage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Paper | null>(null);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [completeness, setCompleteness] = useState<CompletenessRow[]>([]);

  // new-paper form
  const [title, setTitle] = useState("");
  const [programmeStep, setProgrammeStep] = useState("");
  const [tags, setTags] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function refreshPapers() {
    setPapers(await get<Paper[]>(`/api/modules/${SLUG}/papers`));
    setLoading(false);
  }
  async function refreshCompleteness() {
    setCompleteness(await get<CompletenessRow[]>(`/api/modules/${SLUG}/completeness-scan`));
  }
  useEffect(() => {
    refreshPapers();
  }, []);
  useEffect(() => {
    if (tab === "completeness") refreshCompleteness();
  }, [tab]);

  async function createPaper(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await post<Paper>(`/api/modules/${SLUG}/papers`, {
      title,
      programme_step: programmeStep,
      tags,
      is_confidential: isConfidential,
    });
    if (pendingFile) {
      const form = new FormData();
      form.append("file", pendingFile);
      await uploadFile(`/api/modules/${SLUG}/papers/${created.id}/file`, form);
    }
    setTitle("");
    setProgrammeStep("");
    setTags("");
    setIsConfidential(false);
    setPendingFile(null);
    refreshPapers();
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "btn btn-primary" : "btn btn-ghost"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <a
          className="btn btn-ghost"
          href={`/api/modules/${SLUG}/export-pack`}
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: "auto" }}
        >
          Export Regulator Pack
        </a>
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "scope" && <SimpleListPanel<ScopeUnit>
        resource="scope-units" title="Scope & Audit Universe"
        columns={[["name", "Name"], ["unit_type", "Type"], ["description", "Description"]]}
        fields={[{ key: "name", label: "Name" }, { key: "unit_type", label: "Type (entity/process)" }, { key: "description", label: "Description" }]}
      />}
      {tab === "rcm" && <SimpleListPanel<RcmRow>
        resource="rcm" title="Risk & Control Matrix"
        columns={[["risk", "Risk"], ["control", "Control"], ["assertion", "Assertion"], ["control_owner", "Owner"]]}
        fields={[{ key: "risk", label: "Risk" }, { key: "control", label: "Control" }, { key: "assertion", label: "Assertion" }, { key: "control_owner", label: "Control owner" }]}
      />}
      {tab === "rules" && <SimpleListPanel<Rule>
        resource="rules" title="Test & Analytics Rule Library"
        columns={[["name", "Name"], ["rule_type", "Type"], ["config", "Config"]]}
        fields={[{ key: "name", label: "Name" }, { key: "rule_type", label: "Type (threshold/script)" }, { key: "config", label: "Config / threshold" }]}
      />}
      {tab === "sources" && <SimpleListPanel<DataSource>
        resource="data-sources" title="Data Source & Connector Setup"
        columns={[["name", "Name"], ["source_type", "Type"], ["connection_info", "Connection"]]}
        fields={[{ key: "name", label: "Name" }, { key: "source_type", label: "Type (erp_table/api/upload)" }, { key: "connection_info", label: "Connection info" }]}
      />}
      {tab === "exceptions" && <SimpleListPanel<ExceptionRow>
        resource="exceptions" title="Exception & Red-Flag Queue"
        columns={[["description", "Description"], ["status", "Status"], ["disposition", "Disposition"]]}
        fields={[{ key: "description", label: "Description" }]}
      />}
      {tab === "sampling" && <SamplingTab />}
      {tab === "findings" && <FindingsTab />}

      {tab === "completeness" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Programme step</th>
                <th>Papers</th>
                <th>Missing sign-off</th>
                <th>Missing hash</th>
              </tr>
            </thead>
            <tbody>
              {completeness.map((row) => (
                <tr key={row.programme_step}>
                  <td>{row.programme_step}</td>
                  <td>{row.paper_count}</td>
                  <td>
                    {row.missing_signoff > 0 ? (
                      <span className="badge badge-danger">{row.missing_signoff}</span>
                    ) : (
                      <span className="badge badge-success">0</span>
                    )}
                  </td>
                  <td>
                    {row.missing_hash > 0 ? (
                      <span className="badge badge-danger">{row.missing_hash}</span>
                    ) : (
                      <span className="badge badge-success">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {completeness.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "var(--slate)" }}>
                    No working papers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vault" && (
        <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
          <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
            {loading ? (
              <p style={{ padding: 18 }}>Loading…</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Step</th>
                    <th>Tags</th>
                    <th>Hash</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((p) => (
                    <tr key={p.id} onClick={() => setSelected(p)} style={{ cursor: "pointer" }}>
                      <td>
                        {p.title}
                        {p.is_confidential && (
                          <span className="badge badge-gold" style={{ marginLeft: 8 }}>
                            Confidential
                          </span>
                        )}
                      </td>
                      <td style={{ color: "var(--slate)" }}>{p.programme_step || "—"}</td>
                      <td style={{ color: "var(--slate)" }}>{p.tags || "—"}</td>
                      <td>
                        {p.hash_value ? (
                          <span className="badge badge-success" title={p.hash_value}>
                            sha256
                          </span>
                        ) : (
                          <span className="badge badge-slate">none</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-ghost" style={{ padding: "6px 12px" }}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                  {papers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ color: "var(--slate)" }}>
                        No working papers yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <form className="card" style={{ padding: 22 }} onSubmit={createPaper}>
            <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add working paper</h3>
            <div className="field">
              <label>Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label>Programme step</label>
              <input
                className="input"
                value={programmeStep}
                onChange={(e) => setProgrammeStep(e.target.value)}
                placeholder="e.g. 3.2 Cash confirmations"
              />
            </div>
            <div className="field">
              <label>Tags</label>
              <input
                className="input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma,separated,tags"
              />
            </div>
            <div className="field">
              <label>Evidence file</label>
              <input
                className="input"
                type="file"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Confidential / privileged
              </label>
            </div>
            <button className="btn btn-primary btn-block">Add</button>
          </form>
        </div>
      )}

      {selected && (
        <PaperDetail paper={selected} onClose={() => setSelected(null)} onChanged={refreshPapers} />
      )}
    </div>
  );
}

// ---- Detail drawer: tick-marks + sign-off chain ----------------------------

function PaperDetail({
  paper,
  onClose,
  onChanged,
}: {
  paper: Paper;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [tickMarks, setTickMarks] = useState<TickMark[]>([]);
  const [signOffs, setSignOffs] = useState<SignOff[]>([]);
  const [symbol, setSymbol] = useState("✓");
  const [comment, setComment] = useState("");
  const [stage, setStage] = useState(SIGNOFF_STAGES[0]);

  async function refresh() {
    setTickMarks(await get<TickMark[]>(`/api/modules/${SLUG}/papers/${paper.id}/tickmarks`));
    setSignOffs(await get<SignOff[]>(`/api/modules/${SLUG}/papers/${paper.id}/signoffs`));
  }
  useEffect(() => {
    refresh();
  }, [paper.id]);

  async function addTickMark(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/papers/${paper.id}/tickmarks`, { symbol, comment });
    setComment("");
    refresh();
  }
  async function addSignOff() {
    await post(`/api/modules/${SLUG}/papers/${paper.id}/signoffs`, { stage });
    refresh();
    onChanged();
  }
  async function verifyHash() {
    const result = await post<{ matches: boolean }>(`/api/modules/${SLUG}/papers/${paper.id}/verify-hash`);
    alert(result.matches ? "Hash matches — evidence unaltered." : "MISMATCH — file may have been altered.");
  }
  async function toggleConfidential() {
    await patch(`/api/modules/${SLUG}/papers/${paper.id}/confidential`, {
      is_confidential: !paper.is_confidential,
    });
    onChanged();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        background: "white",
        borderLeft: "1px solid var(--border, #e2e2e2)",
        padding: 24,
        overflowY: "auto",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.08)",
      }}
    >
      <button className="btn btn-ghost" onClick={onClose} style={{ marginBottom: 12 }}>
        ← Close
      </button>
      <h3 style={{ color: "var(--navy)" }}>{paper.title}</h3>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>
        v{paper.current_version} · uploaded by {paper.uploaded_by || "—"}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={verifyHash}>
          Verify integrity
        </button>
        <button className="btn btn-ghost" onClick={toggleConfidential}>
          {paper.is_confidential ? "Unflag confidential" : "Flag confidential"}
        </button>
      </div>

      <h4 style={{ marginBottom: 8 }}>Sign-off chain</h4>
      <ul style={{ marginBottom: 12, paddingLeft: 18 }}>
        {signOffs.map((s) => (
          <li key={s.id}>
            <span className="badge badge-success">{s.stage}</span> {s.signed_by}
          </li>
        ))}
        {signOffs.length === 0 && <li style={{ color: "var(--slate)" }}>No sign-offs yet.</li>}
      </ul>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <select className="input" value={stage} onChange={(e) => setStage(e.target.value)}>
          {SIGNOFF_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={addSignOff}>
          Sign
        </button>
      </div>

      <h4 style={{ marginBottom: 8 }}>Tick-marks</h4>
      <ul style={{ marginBottom: 12, paddingLeft: 18 }}>
        {tickMarks.map((t) => (
          <li key={t.id}>
            <strong>{t.symbol}</strong> {t.comment}
          </li>
        ))}
        {tickMarks.length === 0 && <li style={{ color: "var(--slate)" }}>No tick-marks yet.</li>}
      </ul>
      <form onSubmit={addTickMark} style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          style={{ width: 60 }}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <input
          className="input"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="btn btn-primary">Add</button>
      </form>
    </div>
  );
}

// ---- #16 Dashboard -----------------------------------------------------------

function DashboardTab() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  useEffect(() => {
    get<DashboardKPIs>(`/api/modules/${SLUG}/dashboard`).then(setKpis);
  }, []);
  if (!kpis) return <p style={{ color: "var(--slate)" }}>Loading…</p>;

  const cards: [string, string | number][] = [
    ["Working papers", kpis.total_papers],
    ["Confidential", kpis.confidential_papers],
    ["Open exceptions", kpis.open_exceptions],
    ["Open findings", kpis.open_findings],
    ["Overdue remediation", kpis.overdue_remediation],
    ["Scope coverage", `${kpis.coverage_pct}%`],
    ["Hash coverage", `${kpis.hash_coverage_pct}%`],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
      {cards.map(([label, value]) => (
        <div className="card" key={label} style={{ padding: 18 }}>
          <div style={{ fontSize: 28, color: "var(--navy)", fontWeight: 600 }}>{value}</div>
          <div style={{ color: "var(--slate)" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Reusable simple list+create panel (#17 #18 #19 #20 #22) -----------------

function SimpleListPanel<T extends { id: number; status?: string; disposition?: string }>({
  resource,
  title,
  columns,
  fields,
}: {
  resource: string;
  title: string;
  columns: [keyof T, string][];
  fields: { key: keyof T; label: string }[];
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});

  async function refresh() {
    setRows(await get<T[]>(`/api/modules/${SLUG}/${resource}`));
  }
  useEffect(() => {
    refresh();
  }, [resource]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/${resource}`, form);
    setForm({});
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.6fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead>
            <tr>
              {columns.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map(([key, label]) => (
                  <td key={label}>{String(r[key] ?? "—")}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ color: "var(--slate)" }}>
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add — {title}</h3>
        {fields.map((f) => (
          <div className="field" key={String(f.key)}>
            <label>{f.label}</label>
            <input
              className="input"
              value={form[String(f.key)] ?? ""}
              onChange={(e) => setForm({ ...form, [String(f.key)]: e.target.value })}
            />
          </div>
        ))}
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}

// ---- #21 Sampling & Population Builder ----------------------------------------

function SamplingTab() {
  const [populations, setPopulations] = useState<Population[]>([]);
  const [selectedPop, setSelectedPop] = useState<number | null>(null);
  const [items, setItems] = useState<SampleItem[]>([]);
  const [name, setName] = useState("");
  const [size, setSize] = useState(0);
  const [sampleSize, setSampleSize] = useState(0);
  const [ref, setRef] = useState("");

  async function refreshPopulations() {
    setPopulations(await get<Population[]>(`/api/modules/${SLUG}/populations`));
  }
  useEffect(() => {
    refreshPopulations();
  }, []);
  useEffect(() => {
    if (selectedPop) {
      get<SampleItem[]>(`/api/modules/${SLUG}/populations/${selectedPop}/items`).then(setItems);
    }
  }, [selectedPop]);

  async function addPopulation(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/populations`, { name, size, sample_size: sampleSize, method: "judgemental" });
    setName("");
    setSize(0);
    setSampleSize(0);
    refreshPopulations();
  }
  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPop || !ref.trim()) return;
    await post(`/api/modules/${SLUG}/populations/${selectedPop}/items`, { reference: ref });
    setRef("");
    get<SampleItem[]>(`/api/modules/${SLUG}/populations/${selectedPop}/items`).then(setItems);
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr 1fr" }}>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Populations</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {populations.map((p) => (
            <li
              key={p.id}
              onClick={() => setSelectedPop(p.id)}
              style={{
                padding: 8,
                cursor: "pointer",
                background: selectedPop === p.id ? "var(--bg-hover, #f3f4f6)" : "transparent",
              }}
            >
              {p.name} <span className="badge badge-slate">{p.sample_size}/{p.size}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={addPopulation} style={{ marginTop: 12 }}>
          <input className="input" placeholder="Population name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 8 }} />
          <input className="input" type="number" placeholder="Population size" value={size || ""} onChange={(e) => setSize(Number(e.target.value))} style={{ marginBottom: 8 }} />
          <input className="input" type="number" placeholder="Sample size" value={sampleSize || ""} onChange={(e) => setSampleSize(Number(e.target.value))} style={{ marginBottom: 8 }} />
          <button className="btn btn-primary btn-block">Add population</button>
        </form>
      </div>

      <div className="card" style={{ padding: 18, gridColumn: "span 2" }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Sample items</h3>
        {!selectedPop ? (
          <p style={{ color: "var(--slate)" }}>Select a population.</p>
        ) : (
          <>
            <ul>
              {items.map((i) => (
                <li key={i.id}>{i.reference}</li>
              ))}
              {items.length === 0 && <li style={{ color: "var(--slate)" }}>No items drawn yet.</li>}
            </ul>
            <form onSubmit={addItem} style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Reference (invoice/txn ID)" value={ref} onChange={(e) => setRef(e.target.value)} />
              <button className="btn btn-primary">Add</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ---- #24 Findings & #25 Remediation ----------------------------------------

function FindingsTab() {
  const [findings, setFindings] = useState<FindingRow[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);
  const [actions, setActions] = useState<RemediationRow[]>([]);
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("medium");
  const [actionText, setActionText] = useState("");
  const [owner, setOwner] = useState("");

  async function refreshFindings() {
    setFindings(await get<FindingRow[]>(`/api/modules/${SLUG}/findings`));
  }
  useEffect(() => {
    refreshFindings();
  }, []);
  useEffect(() => {
    if (selectedFinding) {
      get<RemediationRow[]>(`/api/modules/${SLUG}/findings/${selectedFinding}/remediation`).then(setActions);
    }
  }, [selectedFinding]);

  async function addFinding(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await post(`/api/modules/${SLUG}/findings`, { title, grade });
    setTitle("");
    refreshFindings();
  }
  async function addAction(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFinding || !actionText.trim()) return;
    await post(`/api/modules/${SLUG}/findings/${selectedFinding}/remediation`, { action: actionText, owner });
    setActionText("");
    setOwner("");
    get<RemediationRow[]>(`/api/modules/${SLUG}/findings/${selectedFinding}/remediation`).then(setActions);
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr 1fr" }}>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Findings</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {findings.map((f) => (
            <li
              key={f.id}
              onClick={() => setSelectedFinding(f.id)}
              style={{
                padding: 8,
                cursor: "pointer",
                background: selectedFinding === f.id ? "var(--bg-hover, #f3f4f6)" : "transparent",
              }}
            >
              {f.title} <span className="badge badge-gold">{f.grade}</span>
            </li>
          ))}
          {findings.length === 0 && <li style={{ color: "var(--slate)" }}>No findings yet.</li>}
        </ul>
        <form onSubmit={addFinding} style={{ marginTop: 12 }}>
          <input className="input" placeholder="Finding title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 8 }} />
          <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ marginBottom: 8 }}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
          <button className="btn btn-primary btn-block">Add finding</button>
        </form>
      </div>

      <div className="card" style={{ padding: 18, gridColumn: "span 2" }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Remediation actions</h3>
        {!selectedFinding ? (
          <p style={{ color: "var(--slate)" }}>Select a finding.</p>
        ) : (
          <>
            <ul>
              {actions.map((a) => (
                <li key={a.id}>
                  {a.action} — {a.owner || "unassigned"} <span className="badge badge-slate">{a.status}</span>
                </li>
              ))}
              {actions.length === 0 && <li style={{ color: "var(--slate)" }}>No actions yet.</li>}
            </ul>
            <form onSubmit={addAction} style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Action" value={actionText} onChange={(e) => setActionText(e.target.value)} />
              <input className="input" placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
              <button className="btn btn-primary">Add</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
