import { useEffect, useMemo, useState } from "react";
import { del, get, patch, post } from "../../lib/api";
import "./patient-billing.css";

const SLUG = "ip_patient_billing";

/* ── Types (mirror the backend /subpages catalogue) ──────────────────────── */

type ColType = "text" | "textarea" | "int" | "float" | "bool" | "select";

interface ColumnDef {
  name: string;
  label: string;
  type: ColType;
  options?: string[];
  required?: boolean;
  derived?: boolean;
  default?: string | number | boolean | null;
  money?: boolean;
  pct?: boolean;
}

interface SubPage {
  no: number;
  key: string;
  title: string;
  type: "signature" | "shell";
  purpose: string;
  columns: ColumnDef[];
}

interface Row {
  id: number;
  [key: string]: string | number | boolean | null;
}

interface SummaryData {
  selects: Record<string, { label: string; count: number }[]>;
  totals: Record<string, number>;
}

interface Overview {
  counts: Record<string, number>;
  coverage_pct: number;
  risk_score: number;
  open_exceptions: number;
  open_critical: number;
  open_exception_money: number;
  open_findings: number;
  high_critical_findings: number;
  leakage_at_risk: number;
  leakage_total: number;
  charge_capture_rate: number;
  missed_charge_amount: number;
  claim_realisation_pct: number;
  denial_amount: number;
  credit_outstanding: number;
  ageing_over_90: number;
  ageing_buckets: { bucket: string; count: number; amount: number }[];
  payer_mix: { payer_type: string; count: number; revenue: number }[];
  recent_exceptions: {
    exception_id: string;
    entity_ref: string;
    severity: string;
    amount_at_risk: number;
    disposition: string;
    raised_date: string | null;
  }[];
}

type FormValue = string | number | boolean | null;
type FormState = Record<string, FormValue>;

/* ── Shared helpers ──────────────────────────────────────────────────────── */

function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const BADGES: Record<string, string> = {
  // danger
  High: "badge-danger",
  Critical: "badge-danger",
  Rejected: "badge-danger",
  Missed: "badge-danger",
  "Under-billed": "badge-danger",
  "Over-billed": "badge-danger",
  "Not Billed": "badge-danger",
  Ineffective: "badge-danger",
  "False Positive": "badge-success",
  // success
  Captured: "badge-success",
  Approved: "badge-success",
  Realised: "badge-success",
  Reconciled: "badge-success",
  "Billed Correctly": "badge-success",
  Effective: "badge-success",
  Connected: "badge-success",
  Recovered: "badge-success",
  Utilized: "badge-success",
  Refunded: "badge-success",
  Processed: "badge-success",
  Implemented: "badge-success",
  "Re-tested": "badge-success",
  Resolved: "badge-success",
  Closed: "badge-success",
  // gold
  Medium: "badge-gold",
  Open: "badge-gold",
  Partial: "badge-gold",
  Pending: "badge-gold",
  "Pending Approval": "badge-gold",
  "Partially Approved": "badge-gold",
  Investigating: "badge-gold",
  "In Progress": "badge-gold",
  "In Remediation": "badge-gold",
  "In Review": "badge-gold",
  Accepted: "badge-gold",
  "Under Dispute": "badge-gold",
  Syncing: "badge-gold",
  Overdue: "badge-danger",
};

function badgeClass(v: string): string {
  return BADGES[v] ?? "badge-slate";
}

function riskTone(score: number): string {
  if (score >= 50) return "danger";
  if (score >= 25) return "gold";
  return "ok";
}

/* ── Main page ──────────────────────────────────────────────────────────── */

export default function IpPatientBillingPage() {
  const [subpages, setSubpages] = useState<SubPage[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const reloadOverview = async () => {
    try {
      setOverview(await get<Overview>(`/api/modules/${SLUG}/overview`));
    } catch {
      /* dashboard stays with last good data */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [pages, ov] = await Promise.all([
          get<SubPage[]>(`/api/modules/${SLUG}/subpages`),
          get<Overview>(`/api/modules/${SLUG}/overview`),
        ]);
        setSubpages(pages);
        setOverview(ov);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function seed() {
    setSeeding(true);
    try {
      await post(`/api/modules/${SLUG}/seed`);
      await reloadOverview();
    } finally {
      setSeeding(false);
    }
  }

  const active = subpages.find((s) => s.key === activeKey);
  const counts = overview?.counts ?? {};
  const signature = subpages.filter((s) => s.type === "signature");
  const shell = subpages.filter((s) => s.type === "shell");

  return (
    <div className="pbrc">
      <div className="pbrc-layout">
        <aside className="card pbrc-nav">
          <div className="pbrc-nav-title">
            <span className="pbrc-nav-total">25</span>
            Sub-pages
          </div>
          <div className="pbrc-nav-scroll">
            <div className="pbrc-nav-head">Signature Procedures</div>
            {signature.map((sp) => (
              <NavItem
                key={sp.key}
                sp={sp}
                count={counts[sp.key] ?? 0}
                active={sp.key === activeKey}
                onClick={() => setActiveKey(sp.key)}
              />
            ))}
            <div className="pbrc-nav-head">Workspace Shell</div>
            {shell.map((sp) => (
              <NavItem
                key={sp.key}
                sp={sp}
                count={sp.key === "dashboard" ? undefined : counts[sp.key] ?? 0}
                active={sp.key === activeKey}
                onClick={() => setActiveKey(sp.key)}
              />
            ))}
          </div>
        </aside>

        <section className="pbrc-main">
          {loading ? (
            <p style={{ color: "var(--slate)" }}>Loading module…</p>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="pbrc-head">
                <div>
                  <div className="pbrc-head-badges">
                    <span
                      className={`badge ${
                        active?.type === "signature" ? "badge-success" : "badge-slate"
                      }`}
                    >
                      {active?.type === "signature" ? "Signature Procedure" : "Workspace Shell"}
                    </span>
                    <span className="badge badge-gold">Sub-page {active?.no} / 25</span>
                  </div>
                  <h2>{active?.title}</h2>
                  <p className="pbrc-purpose">{active?.purpose}</p>
                </div>
              </div>

              {activeKey === "dashboard" ? (
                <Dashboard
                  overview={overview!}
                  signature={signature}
                  onOpen={setActiveKey}
                  onSeed={seed}
                  seeding={seeding}
                />
              ) : active ? (
                <DataGrid key={active.key} sub={active} onMutated={reloadOverview} />
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function NavItem({
  sp,
  count,
  active,
  onClick,
}: {
  sp: SubPage;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`pbrc-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      title={`${sp.no}. ${sp.title} — ${sp.purpose}`}
    >
      <span className="pbrc-nav-no">{sp.no}</span>
      <span className="pbrc-nav-label">{sp.title}</span>
      {count !== undefined && <span className="pbrc-nav-rec">{count}</span>}
    </button>
  );
}

/* ── Module dashboard (sub-page 16) ──────────────────────────────────────── */

function Dashboard({
  overview,
  signature,
  onOpen,
  onSeed,
  seeding,
}: {
  overview: Overview;
  signature: SubPage[];
  onOpen: (key: string) => void;
  onSeed: () => void;
  seeding: boolean;
}) {
  const covered = signature.filter((s) => (overview.counts[s.key] ?? 0) > 0).length;
  const kpis = [
    {
      label: "Risk Score",
      value: String(overview.risk_score),
      suffix: "/100",
      tone: riskTone(overview.risk_score),
      hint: `${overview.open_critical} critical open exceptions`,
    },
    {
      label: "Coverage",
      value: String(overview.coverage_pct),
      suffix: "%",
      tone: riskTone(100 - overview.coverage_pct),
      hint: `${covered}/${signature.length} signature pages in scope`,
    },
    {
      label: "Open Exceptions",
      value: String(overview.open_exceptions),
      tone: overview.open_critical > 0 ? "gold" : "ok",
      hint: `${fmtMoney(overview.open_exception_money)} amount at risk`,
    },
    {
      label: "Revenue Leakage",
      value: fmtMoney(overview.leakage_at_risk),
      tone: overview.leakage_at_risk > 200000 ? "danger" : "gold",
      hint: `total detected ${fmtMoney(overview.leakage_total)}`,
    },
    {
      label: "Charge Capture",
      value: String(overview.charge_capture_rate),
      suffix: "%",
      tone: overview.charge_capture_rate >= 95 ? "ok" : "gold",
      hint: `missed ${fmtMoney(overview.missed_charge_amount)}`,
    },
    {
      label: "Claim Realisation",
      value: String(overview.claim_realisation_pct),
      suffix: "%",
      tone: overview.claim_realisation_pct >= 85 ? "ok" : "gold",
      hint: `credit outstanding ${fmtMoney(overview.credit_outstanding)}`,
    },
    {
      label: "Denials",
      value: fmtMoney(overview.denial_amount),
      tone: overview.denial_amount > 150000 ? "danger" : "gold",
      hint: "rejected claim value",
    },
    {
      label: "Ageing > 90d",
      value: fmtMoney(overview.ageing_over_90),
      tone: overview.ageing_over_90 > 100000 ? "danger" : "gold",
      hint: "stale receivables",
    },
  ];

  const maxMix = Math.max(1, ...overview.payer_mix.map((p) => p.revenue));
  const maxAge = Math.max(1, ...overview.ageing_buckets.map((b) => b.amount));

  return (
    <div className="pbrc-dash">
      <div className="pbrc-dash-bar">
        <div className="pbrc-dash-bar-note">
          Live view across all 15 signature procedures + workspace shell.
        </div>
        <div className="pbrc-dash-actions">
          <button className="btn btn-ghost" onClick={onSeed} disabled={seeding}>
            {seeding ? "Loading…" : "Load demo data"}
          </button>
        </div>
      </div>

      <div className="pbrc-kpis">
        {kpis.map((k) => (
          <div className="card pbrc-kpi" key={k.label}>
            <div className="pbrc-kpi-label">{k.label}</div>
            <div className={`pbrc-kpi-value ${k.tone}`}>
              {k.value}
              {k.suffix && <span className="pbrc-kpi-suffix">{k.suffix}</span>}
            </div>
            <div className="pbrc-kpi-hint">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="pbrc-dash-cols">
        <div className="card pbrc-panel">
          <div className="pbrc-panel-head">
            <h3>Signature procedure coverage</h3>
            <span className="badge badge-slate">{covered} / {signature.length}</span>
          </div>
          <div className="pbrc-tiles">
            {signature.map((sp) => {
              const c = overview.counts[sp.key] ?? 0;
              return (
                <button
                  key={sp.key}
                  className={`pbrc-tile ${c > 0 ? "ok" : "empty"}`}
                  onClick={() => onOpen(sp.key)}
                >
                  <span className="pbrc-tile-no">{sp.no}</span>
                  <span className="pbrc-tile-title">{sp.title}</span>
                  <span className={`badge ${c > 0 ? "badge-success" : "badge-slate"}`}>
                    {c > 0 ? `${c} records` : "empty"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pbrc-dash-stack">
          <div className="card pbrc-panel">
            <div className="pbrc-panel-head">
              <h3>Payer mix</h3>
            </div>
            {overview.payer_mix.length === 0 ? (
              <p className="pbrc-muted">No payer-mix data yet.</p>
            ) : (
              <div className="pbrc-bars">
                {overview.payer_mix.map((p) => (
                  <div className="pbrc-bar-row" key={p.payer_type}>
                    <span className="pbrc-bar-label">{p.payer_type}</span>
                    <div className="pbrc-bar-track">
                      <div
                        className="pbrc-bar-fill"
                        style={{ width: `${Math.round((p.revenue / maxMix) * 100)}%` }}
                      />
                    </div>
                    <span className="pbrc-bar-value">{fmtMoney(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card pbrc-panel">
            <div className="pbrc-panel-head">
              <h3>Credit ageing buckets</h3>
            </div>
            {overview.ageing_buckets.length === 0 ? (
              <p className="pbrc-muted">No credit-ageing data yet.</p>
            ) : (
              <div className="pbrc-bars">
                {overview.ageing_buckets.map((b) => (
                  <div className="pbrc-bar-row" key={b.bucket}>
                    <span className="pbrc-bar-label">{b.bucket} days</span>
                    <div className="pbrc-bar-track">
                      <div
                        className={`pbrc-bar-fill ${b.bucket === "90+" ? "danger" : ""}`}
                        style={{ width: `${Math.round((b.amount / maxAge) * 100)}%` }}
                      />
                    </div>
                    <span className="pbrc-bar-value">{fmtMoney(b.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card pbrc-panel">
        <div className="pbrc-panel-head">
          <h3>Latest open exceptions</h3>
          <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => onOpen("exception_queue")}>
            Open queue →
          </button>
        </div>
        {overview.recent_exceptions.length === 0 ? (
          <p className="pbrc-muted">No exceptions raised yet.</p>
        ) : (
          <div className="pbrc-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Entity ref</th>
                  <th>Severity</th>
                  <th>Amount at risk</th>
                  <th>Disposition</th>
                  <th>Raised</th>
                </tr>
              </thead>
              <tbody>
                {overview.recent_exceptions.map((e) => (
                  <tr key={e.exception_id}>
                    <td>{e.exception_id}</td>
                    <td>{e.entity_ref}</td>
                    <td>
                      <span className={`badge ${badgeClass(e.severity)}`}>{e.severity}</span>
                    </td>
                    <td>{fmtMoney(e.amount_at_risk)}</td>
                    <td>
                      <span className={`badge ${badgeClass(e.disposition)}`}>{e.disposition}</span>
                    </td>
                    <td>{e.raised_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Generic data grid for any record sub-page ───────────────────────────── */

function DataGrid({ sub, onMutated }: { sub: SubPage; onMutated: () => void }) {
  const [records, setRecords] = useState<Row[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<{ col: string; val: string } | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = sub.columns.filter((c) => !c.derived);
  const derived = sub.columns.filter((c) => c.derived);
  const statusCol =
    sub.columns.find(
      (c) =>
        c.type === "select" &&
        (c.name === "status" || c.name === "claim_status" || c.name === "disposition")
    ) ?? sub.columns.find((c) => c.type === "select" && !c.derived);

  async function refresh() {
    try {
      const [rows, sm] = await Promise.all([
        get<Row[]>(`/api/modules/${SLUG}/data/${sub.key}`),
        get<SummaryData>(`/api/modules/${SLUG}/data/${sub.key}/summary`),
      ]);
      setRecords(rows);
      setSummary(sm);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, [sub.key]);

  function defaultsFor(cols: ColumnDef[]): FormState {
    const d: FormState = {};
    for (const c of cols) {
      if (c.default !== undefined && c.default !== null) d[c.name] = c.default;
      else if (c.type === "bool") d[c.name] = false;
      else if (c.type === "int" || c.type === "float") d[c.name] = c.type === "int" ? 0 : 0;
      else d[c.name] = "";
    }
    return d;
  }

  function openCreate() {
    setEditing(null);
    setForm(defaultsFor(editable));
    setShowForm(true);
  }

  function openEdit(row: Row) {
    const d: FormState = {};
    for (const c of editable) d[c.name] = row[c.name] ?? "";
    setEditing(row);
    setForm(d);
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, FormValue> = {};
      for (const c of editable) {
        let v = form[c.name];
        if ((c.type === "int" || c.type === "float") && (v === "" || v === null || v === undefined)) v = 0;
        payload[c.name] = v;
      }
      if (editing) {
        await patch(`/api/modules/${SLUG}/data/${sub.key}/${editing.id}`, payload);
      } else {
        await post(`/api/modules/${SLUG}/data/${sub.key}`, payload);
      }
      setShowForm(false);
      setEditing(null);
      await refresh();
      onMutated();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete ${sub.title} record #${row.id}?`)) return;
    await del(`/api/modules/${SLUG}/data/${sub.key}/${row.id}`);
    await refresh();
    onMutated();
  }

  const filtered = useMemo(() => {
    let rows = records;
    if (filter) {
      rows = rows.filter((r) => String(r[filter.col] ?? "") === filter.val);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      rows = rows.filter((r) =>
        sub.columns.some(
          (c) =>
            c.type !== "bool" &&
            String(r[c.name] ?? "").toLowerCase().includes(needle)
        )
      );
    }
    return rows;
  }, [records, q, filter, sub]);

  const chips = statusCol ? summary?.selects[statusCol.name] ?? [] : [];

  return (
    <div className="pbrc-grid">
      <div className="card pbrc-table-card">
        <div className="pbrc-toolbar">
          <input
            className="input"
            placeholder="Search records…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <span className="pbrc-count">{filtered.length} of {records.length} records</span>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add record
          </button>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: "0 16px 12px" }}>{error}</div>}

        {statusCol && chips.length > 0 && (
          <div className="pbrc-chips">
            {chips.map((chip) => {
              const on =
                filter && filter.col === statusCol.name && filter.val === chip.label;
              return (
                <button
                  key={chip.label}
                  className={`pbrc-chip ${on ? "active" : ""}`}
                  onClick={() =>
                    setFilter(on ? null : { col: statusCol.name, val: chip.label })
                  }
                >
                  <span className={`badge ${badgeClass(chip.label)}`}>{chip.label}</span>
                  <span className="pbrc-chip-count">{chip.count}</span>
                </button>
              );
            })}
            {Object.entries(summary?.totals ?? {}).map(([name, total]) => {
              const label =
                sub.columns.find((c) => c.name === name)?.label ?? name;
              return (
                <span key={name} className="pbrc-total-chip">
                  {label}: <strong>{fmtMoney(total)}</strong>
                </span>
              );
            })}
          </div>
        )}

        <div className="pbrc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {sub.columns.map((c) => (
                  <th key={c.name}>
                    {c.label}
                    {c.derived && <span className="pbrc-derived-tag">auto</span>}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="pbrc-muted">{row.id}</td>
                  {sub.columns.map((c) => (
                    <td key={c.name} className={c.derived ? "pbrc-derived" : ""}>
                      {renderCell(c, row[c.name])}
                    </td>
                  ))}
                  <td className="pbrc-actions">
                    <button className="btn btn-ghost" style={{ padding: "5px 10px" }} onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost" style={{ padding: "5px 10px", color: "var(--danger)" }} onClick={() => remove(row)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={sub.columns.length + 2} className="pbrc-muted" style={{ textAlign: "center", padding: 24 }}>
                    {records.length === 0
                      ? `No ${sub.title.toLowerCase()} records yet — add the first one.`
                      : "No records match your search / filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <form className="card pbrc-form" onSubmit={submit}>
          <div className="pbrc-form-head">
            <h3>{editing ? "Edit record" : "Add record"}</h3>
            <button type="button" className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>
          <div className="pbrc-form-body">
            {editable.map((c) => (
              <Field key={c.name} col={c} value={form[c.name] ?? ""} onChange={(v) => setForm((f) => ({ ...f, [c.name]: v }))} />
            ))}
            {derived.length > 0 && (
              <div className="pbrc-derived-note">
                Computed fields ({derived.map((c) => c.label).join(", ")}) are calculated automatically on save.
              </div>
            )}
          </div>
          <div className="pbrc-form-foot">
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Saving…" : editing ? "Save changes" : "Add record"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function renderCell(col: ColumnDef, v: FormValue) {
  if (v === null || v === undefined || v === "") {
    return <span className="pbrc-muted">—</span>;
  }
  if (col.type === "bool") {
    return v ? "Yes" : "No";
  }
  if (col.type === "int") {
    return String(v);
  }
  if (col.type === "float") {
    if (col.money) return fmtMoney(Number(v));
    if (col.pct) return `${Number(v)}%`;
    return String(v);
  }
  if (col.type === "select") {
    return <span className={`badge ${badgeClass(String(v))}`}>{String(v)}</span>;
  }
  return String(v);
}

function Field({
  col,
  value,
  onChange,
}: {
  col: ColumnDef;
  value: FormValue;
  onChange: (v: FormValue) => void;
}) {
  const label = (
    <label>
      {col.label}
      {col.required && <span style={{ color: "var(--danger)" }}> *</span>}
    </label>
  );

  if (col.type === "textarea") {
    return (
      <div className="field">
        {label}
        <textarea
          className="input"
          rows={2}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (col.type === "bool") {
    return (
      <div className="field">
        <label className="pbrc-check">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {col.label}
        </label>
      </div>
    );
  }

  if (col.type === "select") {
    return (
      <div className="field">
        {label}
        <select className="select" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {!col.required && <option value="">— select —</option>}
          {col.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const isNum = col.type === "int" || col.type === "float";
  return (
    <div className="field">
      {label}
      <input
        className="input"
        type={isNum ? "number" : "text"}
        step={isNum && col.type === "float" ? "any" : undefined}
        value={String(value ?? "")}
        onChange={(e) => {
          const v = e.target.value;
          onChange(isNum ? (v === "" ? "" : Number(v)) : v);
        }}
      />
    </div>
  );
}
