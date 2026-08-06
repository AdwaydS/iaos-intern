import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

const SLUG = "master_data_change_governance";
const MT = ["chart_of_accounts", "cost_centre", "bank_master", "gl_account", "profit_centre"];

type Tab = "dashboard" | "change_log" | "coa" | "cost_centre" | "bank" | "maker_checker"
  | "after_hours" | "orphan" | "bulk_upload" | "field_access" | "quality" | "duplicates"
  | "reference" | "ageing" | "reconciliation" | "alerting" | "scope" | "rcm" | "rules"
  | "data_sources" | "sampling" | "exceptions" | "working_papers" | "findings" | "remediation";

const TABS: { key: Tab; label: string; group: string }[] = [
  { key: "dashboard", label: "Dashboard & KPIs", group: "Overview" },
  { key: "change_log", label: "Critical-Field Change Log", group: "Change Tracking" },
  { key: "coa", label: "Chart-of-Accounts", group: "Change Tracking" },
  { key: "cost_centre", label: "Cost-Centre / Profit-Centre", group: "Change Tracking" },
  { key: "bank", label: "Bank-Master", group: "Change Tracking" },
  { key: "maker_checker", label: "Maker-Checker Enforcement", group: "Governance Controls" },
  { key: "after_hours", label: "After-Hours Changes", group: "Governance Controls" },
  { key: "orphan", label: "Orphan / Unmapped Records", group: "Governance Controls" },
  { key: "bulk_upload", label: "Bulk-Upload Controls", group: "Governance Controls" },
  { key: "field_access", label: "Field-Level Access", group: "Governance Controls" },
  { key: "quality", label: "Data-Quality Scorecard", group: "Analytics & Quality" },
  { key: "duplicates", label: "Duplicate Detection", group: "Analytics & Quality" },
  { key: "reference", label: "Reference-Data Consistency", group: "Analytics & Quality" },
  { key: "ageing", label: "Approval Ageing", group: "Analytics & Quality" },
  { key: "reconciliation", label: "Master Reconciliation", group: "Analytics & Quality" },
  { key: "alerting", label: "Sensitive-Change Alerting", group: "Analytics & Quality" },
  { key: "scope", label: "Scope & Audit Universe", group: "Audit Framework" },
  { key: "rcm", label: "Risk & Control Matrix", group: "Audit Framework" },
  { key: "rules", label: "Test Rule Library", group: "Audit Framework" },
  { key: "data_sources", label: "Data Source Setup", group: "Audit Framework" },
  { key: "sampling", label: "Sampling & Population", group: "Audit Framework" },
  { key: "exceptions", label: "Exception & Red-Flag Queue", group: "Audit Framework" },
  { key: "working_papers", label: "Working Papers", group: "Audit Framework" },
  { key: "findings", label: "Observation & Finding Log", group: "Audit Framework" },
  { key: "remediation", label: "Remediation Tracker", group: "Audit Framework" },
];
const GROUPS = ["Overview", "Change Tracking", "Governance Controls", "Analytics & Quality", "Audit Framework"];

/* ───────── helpers ───────── */
function badge(s: string) {
  if (s === "completed" || s === "match" || s === "auto_approved" || s === "Yes" || s === "Final") return "badge-success";
  if (s === "High" || s === "Open" || s === "failed" || s === "mismatch" || s === "danger") return "badge-danger";
  if (s === "Medium" || s === "pending" || s === "In Progress" || s === "gold") return "badge-gold";
  return "badge-slate";
}
function scoreBadge(n: number, hi: number, lo: number) {
  if (n >= hi) return "badge-success";
  if (n >= lo) return "badge-gold";
  return "badge-danger";
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function MasterDataChangeGovernancePage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(g: string) {
    setCollapsed((p) => { const n = new Set(p); n.has(g) ? n.delete(g) : n.add(g); return n; });
  }

  return (
    <div>
      <p style={{ color: "var(--slate)", marginBottom: 20 }}>
        Cross-cutting oversight of critical master data with change control and integrity analytics.
      </p>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "220px 1fr" }}>
        {/* ── Sidebar ── */}
        <nav>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {GROUPS.map((g) => {
              const items = TABS.filter((t) => t.group === g);
              const open = !collapsed.has(g);
              return (
                <div key={g}>
                  <button onClick={() => toggle(g)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 14px", background: "var(--navy)", color: "#fff",
                    border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}>{open ? "▾" : "▸"} {g}</button>
                  {open && items.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 14px 8px 22px",
                      background: tab === t.key ? "var(--accent, #e0e7ff)" : "transparent",
                      color: tab === t.key ? "var(--navy)" : "var(--text, #334155)",
                      border: "none",
                      borderLeft: tab === t.key ? "3px solid var(--navy)" : "3px solid transparent",
                      cursor: "pointer", fontSize: 13,
                      fontWeight: tab === t.key ? 600 : 400,
                    }}>{t.label}</button>
                  ))}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── Content ── */}
        <div style={{ minWidth: 0 }}>
          {tab === "dashboard" && <DashboardSection />}
          {tab === "change_log" && <ChangeLogSection />}
          {tab === "coa" && <ChangeLogSection endpoint="chart-of-accounts" title="Chart-of-Accounts Changes" />}
          {tab === "cost_centre" && <ChangeLogSection endpoint="cost-centres" title="Cost-Centre Changes" />}
          {tab === "bank" && <ChangeLogSection endpoint="bank-masters" title="Bank-Master Changes" />}
          {tab === "maker_checker" && <MakerCheckerSection />}
          {tab === "after_hours" && <AfterHoursSection />}
          {tab === "orphan" && <OrphanSection />}
          {tab === "bulk_upload" && <BulkUploadSection />}
          {tab === "field_access" && <FieldAccessSection />}
          {tab === "quality" && <QualitySection />}
          {tab === "duplicates" && <DuplicatesSection />}
          {tab === "reference" && <ReferenceSection />}
          {tab === "ageing" && <AgeingSection />}
          {tab === "reconciliation" && <ReconciliationSection />}
          {tab === "alerting" && <AlertingSection />}
          {tab === "scope" && <ScopeSection />}
          {tab === "rcm" && <RcmSection />}
          {tab === "rules" && <RulesSection />}
          {tab === "data_sources" && <DataSourcesSection />}
          {tab === "sampling" && <SamplingSection />}
          {tab === "exceptions" && <ExceptionsSection />}
          {tab === "working_papers" && <WorkingPapersSection />}
          {tab === "findings" && <FindingsSection />}
          {tab === "remediation" && <RemediationSection />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   16. DASHBOARD & KPIs
   ══════════════════════════════════════════════════════════════ */
function DashboardSection() {
  const [k, setK] = useState<any>(null);
  const [l, setL] = useState(true);
  useEffect(() => { get<any>(`/api/modules/${SLUG}/dashboard/kpis`).then((d) => { setK(d); setL(false); }); }, []);
  if (l) return <p>Loading…</p>;
  if (!k) return <p style={{ color: "var(--slate)" }}>Unable to load KPIs.</p>;
  const cards = [
    { label: "Total Change Logs", value: k.total_change_logs, color: "var(--navy)" },
    { label: "Active Workflows", value: k.active_workflows, color: "#2563eb" },
    { label: "Open Exceptions", value: k.open_exceptions, color: k.open_exceptions > 0 ? "#dc2626" : "#16a34a" },
    { label: "Open Duplicates", value: k.open_duplicates, color: k.open_duplicates > 0 ? "#d97706" : "#16a34a" },
    { label: "Match Rate", value: `${k.reconciliation_match_rate}%`, color: k.reconciliation_match_rate >= 95 ? "#16a34a" : "#d97706" },
    { label: "Open Findings", value: k.open_findings, color: k.open_findings > 0 ? "#dc2626" : "#16a34a" },
    { label: "Open Remediations", value: k.open_remediations, color: k.open_remediations > 0 ? "#d97706" : "#16a34a" },
  ];
  const score = k.open_exceptions * 3 + k.open_duplicates * 2 + k.open_findings * 4 + k.open_remediations;
  const riskLabel = score >= 20 ? "High" : score >= 8 ? "Medium" : "Low";
  const riskCol = riskLabel === "High" ? "#dc2626" : riskLabel === "Medium" ? "#d97706" : "#16a34a";
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h4 style={{ color: "var(--navy)", marginBottom: 10 }}>Overall Risk Score</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: riskCol, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>{riskLabel}</div>
          <div>
            <p style={{ margin: 0, fontSize: 14 }}>Based on open exceptions, duplicates, findings, and remediation items.</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--slate)" }}>Formula: (exceptions × 3) + (duplicates × 2) + (findings × 4) + remediations = {score}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   1-4. CHANGE LOG (critical-field / coa / cost-centre / bank)
   ══════════════════════════════════════════════════════════════ */
function ChangeLogSection({ endpoint = "change-logs", title = "Critical-Field Change Log" }: { endpoint?: string; title?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", record_id: "", record_name: "", field_name: "", old_value: "", new_value: "", change_type: "update", change_user: "", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/${endpoint}`)); setLoading(false); }
  useEffect(() => { refresh(); }, [endpoint]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_id.trim() || !form.field_name.trim()) return;
    await post(`/api/modules/${SLUG}/change-logs`, form);
    setForm({ ...form, record_id: "", record_name: "", field_name: "", old_value: "", new_value: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>{title}</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Record ID</label><input className="input" value={form.record_id} onChange={(e) => setForm({ ...form, record_id: e.target.value })} required /></div>
          <div className="field"><label>Record Name</label><input className="input" value={form.record_name} onChange={(e) => setForm({ ...form, record_name: e.target.value })} /></div>
          <div className="field"><label>Field Name</label><input className="input" value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })} required /></div>
          <div className="field"><label>Old Value</label><input className="input" value={form.old_value} onChange={(e) => setForm({ ...form, old_value: e.target.value })} /></div>
          <div className="field"><label>New Value</label><input className="input" value={form.new_value} onChange={(e) => setForm({ ...form, new_value: e.target.value })} /></div>
          <div className="field"><label>Change Type</label>
            <select className="select" value={form.change_type} onChange={(e) => setForm({ ...form, change_type: e.target.value })}>
              {["create", "update", "delete"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Changed By</label><input className="input" value={form.change_user} onChange={(e) => setForm({ ...form, change_user: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}><label>Notes</label><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Change</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No change log entries yet.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Timestamp</th><th>Master</th><th>Record</th><th>Field</th><th>Old → New</th><th>User</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{new Date(it.change_timestamp).toLocaleString()}</td>
                  <td><span className="badge badge-slate">{it.master_type}</span></td>
                  <td><strong>{it.record_name || it.record_id}</strong></td>
                  <td>{it.field_name}</td>
                  <td style={{ fontSize: 12 }}><span style={{ color: "var(--slate)" }}>{it.old_value || "—"}</span> → <span style={{ color: "var(--navy)" }}>{it.new_value || "—"}</span></td>
                  <td>{it.change_user || "—"}</td>
                  <td><span className={`badge ${badge(it.approval_status)}`}>{it.approval_status}</span></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/change-logs/${it.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   5. MAKER-CHECKER ENFORCEMENT
   ══════════════════════════════════════════════════════════════ */
function MakerCheckerSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", field_name: "*", required_approvers: 1, description: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/workflows`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/workflows`, form);
    setForm({ ...form, field_name: "*", description: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Maker-Checker Enforcement</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 150 }}><label>Field (* = all)</label><input className="input" value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Required Approvers</label><input className="input" type="number" min={1} max={10} value={form.required_approvers} onChange={(e) => setForm({ ...form, required_approvers: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Workflow Rule</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No workflow rules configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Field</th><th>Approvers</th><th>Active</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td><span className="badge badge-slate">{w.master_type}</span></td>
                  <td>{w.field_name}</td>
                  <td>{w.required_approvers}</td>
                  <td><span className={`badge ${w.is_active ? "badge-success" : "badge-danger"}`}>{w.is_active ? "Yes" : "No"}</span></td>
                  <td style={{ color: "var(--slate)" }}>{w.description || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/workflows/${w.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   6. AFTER-HOURS MASTER CHANGES
   ══════════════════════════════════════════════════════════════ */
function AfterHoursSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { get<any[]>(`/api/modules/${SLUG}/after-hours-changes`).then((d) => { setItems(d); setLoading(false); }); }, []);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>After-Hours Master Changes</h3>
        <p style={{ color: "var(--slate)", marginTop: 4, fontSize: 14 }}>Changes made outside business hours (before 8 AM or after 6 PM).</p>
      </div>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No after-hours changes detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Timestamp</th><th>Master</th><th>Record</th><th>Field</th><th>User</th><th>New Value</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontSize: 12 }}>{new Date(it.change_timestamp).toLocaleString()}</td>
                  <td><span className="badge badge-gold">{it.master_type}</span></td>
                  <td><strong>{it.record_name || it.record_id}</strong></td>
                  <td>{it.field_name}</td>
                  <td>{it.change_user || "—"}</td>
                  <td>{it.new_value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   7. ORPHAN / UNMAPPED RECORDS
   ══════════════════════════════════════════════════════════════ */
function OrphanSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { get<any[]>(`/api/modules/${SLUG}/orphan-records`).then((d) => { setItems(d); setLoading(false); }); }, []);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>Orphan / Unmapped Records</h3>
        <p style={{ color: "var(--slate)", marginTop: 4, fontSize: 14 }}>Master records created but never updated — potential orphans lacking linkages.</p>
      </div>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No orphan records detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record ID</th><th>Name</th><th>Created</th><th>User</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><span className="badge badge-slate">{it.master_type}</span></td>
                  <td>{it.record_id}</td>
                  <td><strong>{it.record_name || "—"}</strong></td>
                  <td style={{ fontSize: 12 }}>{new Date(it.change_timestamp).toLocaleString()}</td>
                  <td>{it.change_user || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   8. BULK-UPLOAD CONTROLS
   ══════════════════════════════════════════════════════════════ */
function BulkUploadSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ filename: "", master_type: "chart_of_accounts", uploaded_by: "", record_count: 0, success_count: 0, failure_count: 0, status: "completed", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/bulk-uploads`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.filename.trim()) return;
    await post(`/api/modules/${SLUG}/bulk-uploads`, form);
    setForm({ ...form, filename: "", record_count: 0, success_count: 0, failure_count: 0, notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Bulk-Upload Controls</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Filename</label><input className="input" value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Uploaded By</label><input className="input" value={form.uploaded_by} onChange={(e) => setForm({ ...form, uploaded_by: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Total</label><input className="input" type="number" value={form.record_count} onChange={(e) => setForm({ ...form, record_count: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Success</label><input className="input" type="number" value={form.success_count} onChange={(e) => setForm({ ...form, success_count: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Failed</label><input className="input" type="number" value={form.failure_count} onChange={(e) => setForm({ ...form, failure_count: Number(e.target.value) })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Upload</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No bulk uploads logged.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Filename</th><th>Master</th><th>By</th><th>Total</th><th>OK</th><th>Fail</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.filename}</strong></td>
                  <td><span className="badge badge-slate">{u.master_type}</span></td>
                  <td>{u.uploaded_by || "—"}</td>
                  <td>{u.record_count}</td>
                  <td style={{ color: "var(--green, #16a34a)" }}>{u.success_count}</td>
                  <td style={{ color: "var(--red, #dc2626)" }}>{u.failure_count}</td>
                  <td><span className={`badge ${badge(u.status)}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   9. FIELD-LEVEL ACCESS REVIEW
   ══════════════════════════════════════════════════════════════ */
function FieldAccessSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", field_name: "", role: "auditor", can_edit: false, can_view: true });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/field-access`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.field_name.trim()) return;
    await post(`/api/modules/${SLUG}/field-access`, form);
    setForm({ ...form, field_name: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Field-Level Access Review</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Field Name</label><input className="input" value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Role</label>
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {["auditor", "tenant_admin", "super_admin"].map((r) => <option key={r}>{r}</option>)}
            </select></div>
          <div className="field"><label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={form.can_edit} onChange={(e) => setForm({ ...form, can_edit: e.target.checked })} /> Can Edit</label></div>
          <div className="field"><label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={form.can_view} onChange={(e) => setForm({ ...form, can_view: e.target.checked })} /> Can View</label></div>
          <button className="btn btn-primary">Add</button>
        </div>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No field access configs defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Field</th><th>Role</th><th>Edit</th><th>View</th><th></th></tr></thead>
            <tbody>
              {items.map((fa) => (
                <tr key={fa.id}>
                  <td><span className="badge badge-slate">{fa.master_type}</span></td>
                  <td>{fa.field_name}</td>
                  <td>{fa.role}</td>
                  <td><span className={`badge ${fa.can_edit ? "badge-success" : "badge-danger"}`}>{fa.can_edit ? "Yes" : "No"}</span></td>
                  <td><span className={`badge ${fa.can_view ? "badge-success" : "badge-danger"}`}>{fa.can_view ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/field-access/${fa.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   10. DATA-QUALITY SCORECARD
   ══════════════════════════════════════════════════════════════ */
function QualitySection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", dimension: "completeness", score: 0, total_records: 0, passing_records: 0, notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/quality-scores`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/quality-scores`, form);
    setForm({ ...form, score: 0, total_records: 0, passing_records: 0, notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Data-Quality Scorecard</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Dimension</label>
            <select className="select" value={form.dimension} onChange={(e) => setForm({ ...form, dimension: e.target.value })}>
              {["completeness", "accuracy", "consistency", "timeliness"].map((d) => <option key={d}>{d}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Score (0-100)</label><input className="input" type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Total</label><input className="input" type="number" value={form.total_records} onChange={(e) => setForm({ ...form, total_records: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Passing</label><input className="input" type="number" value={form.passing_records} onChange={(e) => setForm({ ...form, passing_records: Number(e.target.value) })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Record Score</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No quality scores recorded.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Dimension</th><th>Score</th><th>Pass / Total</th><th>Evaluated</th></tr></thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id}>
                  <td><span className="badge badge-slate">{q.master_type}</span></td>
                  <td>{q.dimension}</td>
                  <td><span className={`badge ${scoreBadge(q.score, 90, 70)}`}>{q.score}%</span></td>
                  <td>{q.passing_records} / {q.total_records}</td>
                  <td style={{ fontSize: 12 }}>{new Date(q.evaluated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   11. DUPLICATE DETECTION ENGINE
   ══════════════════════════════════════════════════════════════ */
function DuplicatesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", record_a_id: "", record_a_name: "", record_b_id: "", record_b_name: "", match_score: 80, status: "open" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/duplicates`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_a_id.trim() || !form.record_b_id.trim()) return;
    await post(`/api/modules/${SLUG}/duplicates`, form);
    setForm({ ...form, record_a_id: "", record_a_name: "", record_b_id: "", record_b_name: "", match_score: 80 });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Duplicate Detection Engine</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Record A ID</label><input className="input" value={form.record_a_id} onChange={(e) => setForm({ ...form, record_a_id: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Record A Name</label><input className="input" value={form.record_a_name} onChange={(e) => setForm({ ...form, record_a_name: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Record B ID</label><input className="input" value={form.record_b_id} onChange={(e) => setForm({ ...form, record_b_id: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Record B Name</label><input className="input" value={form.record_b_name} onChange={(e) => setForm({ ...form, record_b_name: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Match %</label><input className="input" type="number" min={0} max={100} value={form.match_score} onChange={(e) => setForm({ ...form, match_score: Number(e.target.value) })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Duplicate</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No duplicate pairs detected.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record A</th><th>Record B</th><th>Match</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td><span className="badge badge-slate">{d.master_type}</span></td>
                  <td><strong>{d.record_a_name || d.record_a_id}</strong></td>
                  <td><strong>{d.record_b_name || d.record_b_id}</strong></td>
                  <td><span className={`badge ${d.match_score >= 90 ? "badge-danger" : d.match_score >= 70 ? "badge-gold" : "badge-success"}`}>{d.match_score}%</span></td>
                  <td>
                    <select className="select" value={d.status} onChange={async (e) => { await patch(`/api/modules/${SLUG}/duplicates/${d.id}`, { status: e.target.value }); refresh(); }} style={{ padding: "4px 8px", fontSize: 12 }}>
                      <option value="open">Open</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="false_positive">False Positive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   12. REFERENCE-DATA CONSISTENCY
   ══════════════════════════════════════════════════════════════ */
function ReferenceSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code_system: "", code_value: "", code_description: "", module_a: "", module_b: "", is_consistent: true, notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/reference-data`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code_system.trim() || !form.code_value.trim()) return;
    await post(`/api/modules/${SLUG}/reference-data`, form);
    setForm({ ...form, code_value: "", code_description: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Reference-Data Consistency</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Code System</label><input className="input" value={form.code_system} onChange={(e) => setForm({ ...form, code_system: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Code Value</label><input className="input" value={form.code_value} onChange={(e) => setForm({ ...form, code_value: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Module A</label><input className="input" value={form.module_a} onChange={(e) => setForm({ ...form, module_a: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Module B</label><input className="input" value={form.module_b} onChange={(e) => setForm({ ...form, module_b: e.target.value })} /></div>
          <div className="field"><label style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="checkbox" checked={form.is_consistent} onChange={(e) => setForm({ ...form, is_consistent: e.target.checked })} /> Consistent</label></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Entry</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No reference data entries.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>System</th><th>Code</th><th>Module A</th><th>Module B</th><th>Consistent</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.code_system}</td>
                  <td><strong>{r.code_value}</strong></td>
                  <td>{r.module_a || "—"}</td>
                  <td>{r.module_b || "—"}</td>
                  <td><span className={`badge ${r.is_consistent ? "badge-success" : "badge-danger"}`}>{r.is_consistent ? "Yes" : "No"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   13. CHANGE-APPROVAL AGEING
   ══════════════════════════════════════════════════════════════ */
function AgeingSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { get<any[]>(`/api/modules/${SLUG}/approval-ageing`).then((d) => { setItems(d); setLoading(false); }); }, []);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>Change-Approval Ageing</h3>
        <p style={{ color: "var(--slate)", marginTop: 4, fontSize: 14 }}>Pending approvals sorted by age (oldest first).</p>
      </div>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No pending approvals.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record</th><th>Field</th><th>Requested</th><th>Days Open</th><th>User</th></tr></thead>
            <tbody>
              {items.map((a) => {
                const days = Math.floor((Date.now() - new Date(a.change_timestamp).getTime()) / 86400000);
                return (
                  <tr key={a.id}>
                    <td><span className="badge badge-slate">{a.master_type}</span></td>
                    <td><strong>{a.record_name || a.record_id}</strong></td>
                    <td>{a.field_name}</td>
                    <td style={{ fontSize: 12 }}>{new Date(a.change_timestamp).toLocaleDateString()}</td>
                    <td><span className={`badge ${days > 7 ? "badge-danger" : days > 3 ? "badge-gold" : "badge-success"}`}>{days}d</span></td>
                    <td>{a.change_user || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   14. MASTER RECONCILIATION
   ══════════════════════════════════════════════════════════════ */
function ReconciliationSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", record_id: "", source_system: "", target_system: "", source_hash: "", target_hash: "", status: "pending", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/reconciliation`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.record_id.trim()) return;
    await post(`/api/modules/${SLUG}/reconciliation`, form);
    setForm({ ...form, record_id: "", source_hash: "", target_hash: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Master Reconciliation</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Record ID</label><input className="input" value={form.record_id} onChange={(e) => setForm({ ...form, record_id: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Source System</label><input className="input" value={form.source_system} onChange={(e) => setForm({ ...form, source_system: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Target System</label><input className="input" value={form.target_system} onChange={(e) => setForm({ ...form, target_system: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["pending", "match", "mismatch"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Log Reconciliation</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No reconciliation records.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Record</th><th>Source</th><th>Target</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><span className="badge badge-slate">{r.master_type}</span></td>
                  <td><strong>{r.record_id}</strong></td>
                  <td>{r.source_system || "—"}</td>
                  <td>{r.target_system || "—"}</td>
                  <td><span className={`badge ${badge(r.status)}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(r.reconciled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   15. SENSITIVE-CHANGE ALERTING
   ══════════════════════════════════════════════════════════════ */
function AlertingSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ master_type: "chart_of_accounts", field_name: "*", threshold: 1, recipients: "", message: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/alerts`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/alerts`, form);
    setForm({ ...form, field_name: "*", recipients: "", message: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Sensitive-Change Alerting</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 140 }}><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Field (* = all)</label><input className="input" value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 80 }}><label>Threshold</label><input className="input" type="number" min={1} value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Recipients</label><input className="input" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: e.target.value })} placeholder="email1,email2" /></div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Message</label><input className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Create Alert Rule</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No alert rules configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Master</th><th>Field</th><th>Threshold</th><th>Recipients</th><th>Active</th><th>Triggered</th><th></th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td><span className="badge badge-slate">{a.master_type}</span></td>
                  <td>{a.field_name}</td>
                  <td>{a.threshold}</td>
                  <td style={{ fontSize: 12 }}>{a.recipients || "—"}</td>
                  <td><span className={`badge ${a.is_active ? "badge-success" : "badge-slate"}`}>{a.is_active ? "Active" : "Inactive"}</span></td>
                  <td style={{ fontSize: 12 }}>{a.triggered_at ? new Date(a.triggered_at).toLocaleString() : "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await post(`/api/modules/${SLUG}/alerts/${a.id}/trigger`); refresh(); }}>Trigger</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   17. SCOPE & AUDIT UNIVERSE
   ══════════════════════════════════════════════════════════════ */
function ScopeSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entity_type: "GL", entity_name: "", description: "", risk_rating: "Medium" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/scope`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entity_name.trim()) return;
    await post(`/api/modules/${SLUG}/scope`, form);
    setForm({ ...form, entity_name: "", description: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Scope & Audit Universe</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Entity Type</label>
            <select className="select" value={form.entity_type} onChange={(e) => setForm({ ...form, entity_type: e.target.value })}>
              {["GL", "Cost Centre", "Profit Centre", "Bank", "Vendor", "Customer", "Other"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label>Entity Name</label><input className="input" value={form.entity_name} onChange={(e) => setForm({ ...form, entity_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Risk Rating</label>
            <select className="select" value={form.risk_rating} onChange={(e) => setForm({ ...form, risk_rating: e.target.value })}>
              {["High", "Medium", "Low"].map((r) => <option key={r}>{r}</option>)}
            </select></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Entity</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No scope items defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Type</th><th>Entity</th><th>Description</th><th>Risk</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-slate">{s.entity_type}</span></td>
                  <td><strong>{s.entity_name}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{s.description || "—"}</td>
                  <td><span className={`badge ${badge(s.risk_rating)}`}>{s.risk_rating}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/scope/${s.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   18. RISK & CONTROL MATRIX
   ══════════════════════════════════════════════════════════════ */
function RcmSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ risk_id: "", risk_description: "", control_id: "", control_description: "", assertion: "", control_type: "Preventive", control_owner: "", frequency: "Quarterly" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/rcm`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.risk_id.trim() || !form.control_id.trim()) return;
    await post(`/api/modules/${SLUG}/rcm`, form);
    setForm({ ...form, risk_id: "", risk_description: "", control_id: "", control_description: "", assertion: "", control_owner: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Risk & Control Matrix (RCM)</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Risk ID</label><input className="input" value={form.risk_id} onChange={(e) => setForm({ ...form, risk_id: e.target.value })} required /></div>
          <div className="field"><label>Risk Description</label><input className="input" value={form.risk_description} onChange={(e) => setForm({ ...form, risk_description: e.target.value })} /></div>
          <div className="field"><label>Control ID</label><input className="input" value={form.control_id} onChange={(e) => setForm({ ...form, control_id: e.target.value })} required /></div>
          <div className="field"><label>Control Description</label><input className="input" value={form.control_description} onChange={(e) => setForm({ ...form, control_description: e.target.value })} /></div>
          <div className="field"><label>Assertion</label><input className="input" value={form.assertion} onChange={(e) => setForm({ ...form, assertion: e.target.value })} /></div>
          <div className="field"><label>Control Type</label>
            <select className="select" value={form.control_type} onChange={(e) => setForm({ ...form, control_type: e.target.value })}>
              {["Preventive", "Detective", "Corrective"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Control Owner</label><input className="input" value={form.control_owner} onChange={(e) => setForm({ ...form, control_owner: e.target.value })} /></div>
          <div className="field"><label>Frequency</label>
            <select className="select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              {["Daily", "Weekly", "Monthly", "Quarterly", "Annually"].map((f) => <option key={f}>{f}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add RCM Entry</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No RCM entries.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Risk</th><th>Control</th><th>Type</th><th>Owner</th><th>Frequency</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.risk_id}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.risk_description}</div></td>
                  <td><strong>{r.control_id}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.control_description}</div></td>
                  <td><span className="badge badge-slate">{r.control_type}</span></td>
                  <td>{r.control_owner || "—"}</td>
                  <td>{r.frequency}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/rcm/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   19. TEST & ANALYTICS RULE LIBRARY
   ══════════════════════════════════════════════════════════════ */
function RulesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rule_name: "", rule_type: "Red-Flag", master_type: "chart_of_accounts", threshold: "", caat_script: "", is_active: true });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/rules`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rule_name.trim()) return;
    await post(`/api/modules/${SLUG}/rules`, form);
    setForm({ ...form, rule_name: "", threshold: "", caat_script: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Test & Analytics Rule Library</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Rule Name</label><input className="input" value={form.rule_name} onChange={(e) => setForm({ ...form, rule_name: e.target.value })} required /></div>
          <div className="field"><label>Rule Type</label>
            <select className="select" value={form.rule_type} onChange={(e) => setForm({ ...form, rule_type: e.target.value })}>
              {["Red-Flag", "Threshold", "Anomaly", "Compliance"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Master Type</label>
            <select className="select" value={form.master_type} onChange={(e) => setForm({ ...form, master_type: e.target.value })}>
              {MT.map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Threshold</label><input className="input" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}><label>CAAT Script / Description</label><input className="input" value={form.caat_script} onChange={(e) => setForm({ ...form, caat_script: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Rule</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No rules defined.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Rule</th><th>Type</th><th>Master</th><th>Threshold</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.rule_name}</strong></td>
                  <td><span className="badge badge-slate">{r.rule_type}</span></td>
                  <td>{r.master_type}</td>
                  <td>{r.threshold || "—"}</td>
                  <td><span className={`badge ${r.is_active ? "badge-success" : "badge-danger"}`}>{r.is_active ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/rules/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   20. DATA SOURCE & CONNECTOR SETUP
   ══════════════════════════════════════════════════════════════ */
function DataSourcesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source_name: "", source_type: "ERP", connection_detail: "", table_mapping: "", is_active: true });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/data-sources`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source_name.trim()) return;
    await post(`/api/modules/${SLUG}/data-sources`, form);
    setForm({ ...form, source_name: "", connection_detail: "", table_mapping: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Data Source & Connector Setup</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label>Source Name</label><input className="input" value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Source Type</label>
            <select className="select" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
              {["ERP", "API", "CSV Upload", "Database", "Manual"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}><label>Connection Detail</label><input className="input" value={form.connection_detail} onChange={(e) => setForm({ ...form, connection_detail: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 8 }}><label>Table Mapping</label><input className="input" value={form.table_mapping} onChange={(e) => setForm({ ...form, table_mapping: e.target.value })} /></div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Data Source</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No data sources configured.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Source</th><th>Type</th><th>Connection</th><th>Mapping</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.source_name}</strong></td>
                  <td><span className="badge badge-slate">{d.source_type}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{d.connection_detail || "—"}</td>
                  <td style={{ fontSize: 12 }}>{d.table_mapping || "—"}</td>
                  <td><span className={`badge ${d.is_active ? "badge-success" : "badge-danger"}`}>{d.is_active ? "Yes" : "No"}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/data-sources/${d.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   21. SAMPLING & POPULATION BUILDER
   ══════════════════════════════════════════════════════════════ */
function SamplingSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ population_name: "", population_size: 0, sample_size: 0, sample_method: "Random", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/sampling`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.population_name.trim()) return;
    await post(`/api/modules/${SLUG}/sampling`, form);
    setForm({ ...form, population_name: "", population_size: 0, sample_size: 0, notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Sampling & Population Builder</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 2, minWidth: 180 }}><label>Population Name</label><input className="input" value={form.population_name} onChange={(e) => setForm({ ...form, population_name: e.target.value })} required /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Population Size</label><input className="input" type="number" value={form.population_size} onChange={(e) => setForm({ ...form, population_size: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 100 }}><label>Sample Size</label><input className="input" type="number" value={form.sample_size} onChange={(e) => setForm({ ...form, sample_size: Number(e.target.value) })} /></div>
          <div className="field" style={{ flex: 1, minWidth: 120 }}><label>Method</label>
            <select className="select" value={form.sample_method} onChange={(e) => setForm({ ...form, sample_method: e.target.value })}>
              {["Random", "Stratified", "Systematic", "Judgemental"].map((m) => <option key={m}>{m}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Create Sample</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No sampling records.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Population</th><th>Pop. Size</th><th>Sample</th><th>Method</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.population_name}</strong></td>
                  <td>{s.population_size.toLocaleString()}</td>
                  <td>{s.sample_size.toLocaleString()}</td>
                  <td><span className="badge badge-slate">{s.sample_method}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/sampling/${s.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   22. EXCEPTION & RED-FLAG QUEUE
   ══════════════════════════════════════════════════════════════ */
function ExceptionsSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ exception_type: "", description: "", severity: "Medium", status: "Open", assigned_to: "", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/exceptions`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.exception_type.trim()) return;
    await post(`/api/modules/${SLUG}/exceptions`, form);
    setForm({ ...form, exception_type: "", description: "", assigned_to: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Exception & Red-Flag Queue</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Exception Type</label><input className="input" value={form.exception_type} onChange={(e) => setForm({ ...form, exception_type: e.target.value })} required /></div>
          <div className="field"><label>Severity</label>
            <select className="select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Assigned To</label><input className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Exception</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No exceptions in queue.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th><th>Assigned</th><th></th></tr></thead>
            <tbody>
              {items.map((ex) => (
                <tr key={ex.id}>
                  <td><strong>{ex.exception_type}</strong></td>
                  <td style={{ color: "var(--slate)" }}>{ex.description || "—"}</td>
                  <td><span className={`badge ${badge(ex.severity)}`}>{ex.severity}</span></td>
                  <td><span className={`badge ${badge(ex.status)}`}>{ex.status}</span></td>
                  <td>{ex.assigned_to || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/exceptions/${ex.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   23. WORKING PAPERS & EVIDENCE
   ══════════════════════════════════════════════════════════════ */
function WorkingPapersSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", paper_type: "Evidence", reference_url: "", status: "Draft" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/working-papers`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await post(`/api/modules/${SLUG}/working-papers`, form);
    setForm({ ...form, title: "", description: "", reference_url: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Working Papers & Evidence</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="field"><label>Paper Type</label>
            <select className="select" value={form.paper_type} onChange={(e) => setForm({ ...form, paper_type: e.target.value })}>
              {["Evidence", "Memo", "Checklist", "Analysis", "Screenshot"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Reference URL</label><input className="input" value={form.reference_url} onChange={(e) => setForm({ ...form, reference_url: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Paper</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No working papers.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.title}</strong></td>
                  <td><span className="badge badge-slate">{w.paper_type}</span></td>
                  <td><span className={`badge ${badge(w.status)}`}>{w.status}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/working-papers/${w.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   24. OBSERVATION & FINDING LOG
   ══════════════════════════════════════════════════════════════ */
function FindingsSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ finding_title: "", description: "", severity: "Medium", status: "Open", assigned_to: "", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/findings`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.finding_title.trim()) return;
    await post(`/api/modules/${SLUG}/findings`, form);
    setForm({ ...form, finding_title: "", description: "", assigned_to: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Observation & Finding Log</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Finding Title</label><input className="input" value={form.finding_title} onChange={(e) => setForm({ ...form, finding_title: e.target.value })} required /></div>
          <div className="field"><label>Severity</label>
            <select className="select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {["High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Assigned To</label><input className="input" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Finding</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No findings logged.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Finding</th><th>Severity</th><th>Status</th><th>Assigned</th><th></th></tr></thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.finding_title}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{f.description}</div></td>
                  <td><span className={`badge ${badge(f.severity)}`}>{f.severity}</span></td>
                  <td><span className={`badge ${badge(f.status)}`}>{f.status}</span></td>
                  <td>{f.assigned_to || "—"}</td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/findings/${f.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   25. REMEDIATION / ACTION TRACKER
   ══════════════════════════════════════════════════════════════ */
function RemediationSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ action_title: "", description: "", owner: "", status: "Planned", notes: "" });

  async function refresh() { setItems(await get<any[]>(`/api/modules/${SLUG}/remediation`)); setLoading(false); }
  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.action_title.trim()) return;
    await post(`/api/modules/${SLUG}/remediation`, form);
    setForm({ ...form, action_title: "", description: "", owner: "", notes: "" });
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h3 style={{ color: "var(--navy)", margin: 0 }}>Remediation / Action Tracker</h3>
      <form className="card" style={{ padding: 20 }} onSubmit={add}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label>Action Title</label><input className="input" value={form.action_title} onChange={(e) => setForm({ ...form, action_title: e.target.value })} required /></div>
          <div className="field"><label>Owner</label><input className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
          <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="field"><label>Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["Planned", "In Progress", "Completed"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }}>Add Action</button>
      </form>
      {loading ? <p>Loading…</p> : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No remediation items.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Action</th><th>Owner</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.action_title}</strong><div style={{ fontSize: 11, color: "var(--slate)" }}>{r.description}</div></td>
                  <td>{r.owner || "—"}</td>
                  <td><span className={`badge ${badge(r.status)}`}>{r.status}</span></td>
                  <td><button className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={async () => { await del(`/api/modules/${SLUG}/remediation/${r.id}`); refresh(); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
