import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";

const SLUG = "rcm_library";
const api = (p: string) => `/api/modules/${SLUG}${p}`;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface RcmEntry {
  id: number;
  process: string;
  risk: string;
  control_description: string;
  control_type: string;
  frequency: string;
  nature: string;
  is_key_control: boolean;
  assertions: string;
  regulatory_refs: string;
  owner: string;
  reviewer: string;
  test_procedure: string;
  design_effectiveness: string;
  operating_effectiveness: string;
  rationalization_status: string;
  version: number;
  status: string;
  notes: string;
}
interface VersionLogRow {
  id: number;
  entry_id: number;
  entry_process: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: string;
}
interface Owner {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
}
interface Template {
  id: number;
  name: string;
  cycle: string;
  industry: string;
  description: string;
  default_process: string;
  default_risk: string;
  default_control: string;
  is_active: boolean;
}
interface Approval {
  id: number;
  entry_id: number;
  entry_process: string;
  requested_by: string;
  approver: string;
  status: string;
  comments: string;
}
interface ScopeItem {
  id: number;
  unit_name: string;
  unit_type: string;
  description: string;
  in_scope: boolean;
}
interface TestRule {
  id: number;
  name: string;
  description: string;
  data_source: string;
  threshold: string;
  is_active: boolean;
}
interface Connector {
  id: number;
  name: string;
  source_type: string;
  connection_details: string;
  status: string;
}
interface SamplePlan {
  id: number;
  population_description: string;
  sampling_method: string;
  population_size: number;
  sample_size: number;
  notes: string;
}
interface ExceptionItem {
  id: number;
  description: string;
  source_rule: string;
  severity: string;
  status: string;
  disposition_notes: string;
}
interface WorkingPaper {
  id: number;
  title: string;
  related_entry_id: number | null;
  content: string;
  reviewer: string;
  sign_off_status: string;
}
interface FindingItem {
  id: number;
  title: string;
  description: string;
  severity: string;
  related_entry_id: number | null;
  status: string;
}
interface RemediationItem {
  id: number;
  finding_id: number | null;
  action: string;
  owner: string;
  due_date: string;
  status: string;
  retest_status: string;
}
interface Dashboard {
  total_controls: number;
  key_controls: number;
  effective_operating_controls: number;
  open_exceptions: number;
  open_findings: number;
  coverage_pct: number;
  by_control_type: Record<string, number>;
  by_nature: Record<string, number>;
  by_rationalization_status: Record<string, number>;
  by_design_effectiveness: Record<string, number>;
  by_operating_effectiveness: Record<string, number>;
}
interface GapAnalysis {
  total_scope: number;
  covered: number;
  gaps: { id: number; unit_name: string; unit_type: string; description: string }[];
}

/* ------------------------------------------------------------------ */
/* Small shared helpers                                               */
/* ------------------------------------------------------------------ */

function badgeClass(value: string) {
  const good = ["Effective", "Approved", "Completed", "Connected", "Signed Off", "Closed", "Active", "Passed"];
  const bad = ["Deficient", "Rejected", "Error", "Overdue", "Redundant", "Failed", "Critical", "High"];
  const warn = ["Pending", "Open", "Draft", "Not Started", "Under Review", "In Progress", "Medium", "Over-Controlled"];
  if (good.includes(value)) return "badge badge-success";
  if (bad.includes(value)) return "badge badge-danger";
  if (warn.includes(value)) return "badge badge-gold";
  return "badge badge-slate";
}

function Intro({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "var(--slate)", marginBottom: 18, maxWidth: 820 }}>{children}</p>;
}

function EmptyRow({ span, label }: { span: number; label: string }) {
  return (
    <tr>
      <td colSpan={span} style={{ color: "var(--slate)" }}>
        {label}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Generic CRUD — powers most of the "Shell" sub-pages plus templates */
/* and the core entries register.                                    */
/* ------------------------------------------------------------------ */

type FieldType = "text" | "textarea" | "select" | "checkbox" | "number";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  wide?: boolean;
}

interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

function defaultForField(f: FieldDef) {
  if (f.type === "checkbox") return false;
  if (f.type === "number") return 0;
  if (f.type === "select") return f.options?.[0] ?? "";
  return "";
}

function GenericCrud<T extends { id: number }>({
  endpoint,
  fields,
  columns,
  emptyLabel,
  extraRowActions,
  onChanged,
}: {
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  emptyLabel: string;
  extraRowActions?: (row: T, reload: () => void) => React.ReactNode;
  onChanged?: () => void;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => (init[f.key] = defaultForField(f)));
    return init;
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function resetForm() {
    const init: Record<string, any> = {};
    fields.forEach((f) => (init[f.key] = defaultForField(f)));
    setForm(init);
    setEditingId(null);
  }

  async function load() {
    setLoading(true);
    const data = await get<T[]>(endpoint);
    setRows(data);
    setLoading(false);
    onChanged?.();
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await patch(`${endpoint}/${editingId}`, form);
    } else {
      await post(endpoint, form);
    }
    resetForm();
    setShowForm(false);
    load();
  }

  function startEdit(row: T) {
    const values: Record<string, any> = {};
    fields.forEach((f) => (values[f.key] = (row as any)[f.key]));
    setForm(values);
    setEditingId(row.id);
    setShowForm(true);
  }

  async function remove(id: number) {
    await del(`${endpoint}/${id}`);
    load();
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm && editingId) resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? "Close form" : editingId ? "Edit item" : "+ Add new"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {fields.map((f) => (
              <div
                className="field"
                key={f.key}
                style={f.wide || f.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}
              >
                <label>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={form[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="select"
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                  />
                ) : f.type === "number" ? (
                  <input
                    className="input"
                    type="number"
                    value={form[f.key] ?? 0}
                    onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
                  />
                ) : (
                  <input
                    className="input"
                    value={form[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn btn-primary">{editingId ? "Save changes" : "Create"}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="card" style={{ overflow: "auto" }}>
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
            {loading ? (
              <EmptyRow span={columns.length + 1} label="Loading…" />
            ) : rows.length === 0 ? (
              <EmptyRow span={columns.length + 1} label={emptyLabel} />
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}</td>
                  ))}
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {extraRowActions?.(row, load)}
                    <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => startEdit(row)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px" }}
                      onClick={() => remove(row.id)}
                    >
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

/* ------------------------------------------------------------------ */
/* Shared field option lists                                          */
/* ------------------------------------------------------------------ */

const CONTROL_TYPES = ["Preventive", "Detective", "Corrective"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Annual", "Continuous", "Event-Driven"];
const NATURES = ["Manual", "Automated", "IT-Dependent Manual"];
const EFFECTIVENESS = ["Not Tested", "Effective", "Deficient"];
const RATIONALIZATION = ["Active", "Redundant", "Over-Controlled", "Under Review"];
const ENTRY_STATUS = ["Draft", "Approved"];
const ASSERTIONS_LIST = ["Completeness", "Accuracy", "Existence", "Valuation", "Rights & Obligations", "Presentation & Disclosure", "Cut-off"];

const ENTRY_FIELDS: FieldDef[] = [
  { key: "process", label: "Process", type: "text", placeholder: "e.g. Procure-to-Pay" },
  { key: "owner", label: "Control owner", type: "text" },
  { key: "risk", label: "Risk", type: "textarea", wide: true },
  { key: "control_description", label: "Control description", type: "textarea", wide: true },
  { key: "control_type", label: "Control type", type: "select", options: CONTROL_TYPES },
  { key: "frequency", label: "Frequency", type: "select", options: FREQUENCIES },
  { key: "nature", label: "Nature", type: "select", options: NATURES },
  { key: "is_key_control", label: "Key control", type: "checkbox" },
  { key: "assertions", label: "Assertions (comma-separated)", type: "text", wide: true, placeholder: ASSERTIONS_LIST.join(", ") },
  { key: "regulatory_refs", label: "Regulatory cross-references (comma-separated)", type: "text", wide: true, placeholder: "COSO, ICFR, Companies Act, SOX" },
  { key: "reviewer", label: "Reviewer", type: "text" },
  { key: "status", label: "Status", type: "select", options: ENTRY_STATUS },
  { key: "test_procedure", label: "Test procedure", type: "textarea", wide: true },
  { key: "design_effectiveness", label: "Design & implementation effectiveness", type: "select", options: EFFECTIVENESS },
  { key: "operating_effectiveness", label: "Operating effectiveness", type: "select", options: EFFECTIVENESS },
  { key: "rationalization_status", label: "Rationalisation status", type: "select", options: RATIONALIZATION },
  { key: "notes", label: "Notes", type: "textarea", wide: true },
];

/* ------------------------------------------------------------------ */
/* Shared hook: fetch entries, used by several read-oriented tabs     */
/* ------------------------------------------------------------------ */

function useEntries() {
  const [entries, setEntries] = useState<RcmEntry[]>([]);
  const [loading, setLoading] = useState(true);
  async function reload() {
    setLoading(true);
    setEntries(await get<RcmEntry[]>(api("/entries")));
    setLoading(false);
  }
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { entries, loading, reload };
}

async function patchEntry(id: number, body: Partial<RcmEntry>) {
  await patch(api(`/entries/${id}`), body);
}

/* ------------------------------------------------------------------ */
/* 1. Process-Risk-Control Mapping                                    */
/* ------------------------------------------------------------------ */

function ProcessRiskControlMapping() {
  return (
    <div>
      <Intro>
        The master register: every process, its risk, and the control that mitigates it. Everything else in
        this module — attributes, assertions, regulatory mapping, ownership, testing and effectiveness — lives
        on this same record. Edit an entry here to update it everywhere.
      </Intro>
      <GenericCrud<RcmEntry>
        endpoint={api("/entries")}
        fields={ENTRY_FIELDS}
        emptyLabel="No RCM entries yet — add your first process/risk/control mapping."
        columns={[
          { key: "process", label: "Process" },
          { key: "risk", label: "Risk", render: (r) => <span style={{ color: "var(--slate)" }}>{r.risk.slice(0, 60)}{r.risk.length > 60 ? "…" : ""}</span> },
          { key: "control_description", label: "Control", render: (r) => <span>{r.control_description.slice(0, 60)}{r.control_description.length > 60 ? "…" : ""}</span> },
          { key: "is_key_control", label: "Key?", render: (r) => (r.is_key_control ? <span className="badge badge-gold">Key</span> : "—") },
          { key: "status", label: "Status", render: (r) => <span className={badgeClass(r.status)}>{r.status}</span> },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Read-focused entries views (2, 3, 4, 6, 7, 8, 10, 18)               */
/* ------------------------------------------------------------------ */

function InlineSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select className="select" style={{ padding: "4px 8px", fontSize: 13 }} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ControlAttributeRegister() {
  const { entries, loading, reload } = useEntries();
  return (
    <div>
      <Intro>
        Type, frequency and manual/automated/IT-dependent nature for every control. Change any attribute
        inline — it updates the master record and logs a version change automatically.
      </Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Control</th>
              <th>Type</th>
              <th>Frequency</th>
              <th>Nature</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={5} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={5} label="No controls yet — add some in Process-Risk-Control Mapping." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td style={{ color: "var(--slate)" }}>{e.control_description.slice(0, 50)}{e.control_description.length > 50 ? "…" : ""}</td>
                  <td><InlineSelect value={e.control_type} options={CONTROL_TYPES} onChange={(v) => patchEntry(e.id, { control_type: v }).then(reload)} /></td>
                  <td><InlineSelect value={e.frequency} options={FREQUENCIES} onChange={(v) => patchEntry(e.id, { frequency: v }).then(reload)} /></td>
                  <td><InlineSelect value={e.nature} options={NATURES} onChange={(v) => patchEntry(e.id, { nature: v }).then(reload)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssertionMapping() {
  const { entries, loading, reload } = useEntries();
  const [draft, setDraft] = useState<Record<number, string>>({});
  return (
    <div>
      <Intro>
        Tie each control to the financial-statement assertions it supports (e.g. Completeness, Accuracy,
        Existence, Valuation, Rights &amp; Obligations, Presentation &amp; Disclosure, Cut-off).
      </Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Control</th>
              <th>Assertions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={4} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={4} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td style={{ color: "var(--slate)" }}>{e.control_description.slice(0, 40)}{e.control_description.length > 40 ? "…" : ""}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                      {e.assertions
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean)
                        .map((a) => (
                          <span key={a} className="badge badge-slate">{a}</span>
                        ))}
                    </div>
                    <input
                      className="input"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      placeholder="Completeness, Accuracy, ..."
                      value={draft[e.id] ?? e.assertions}
                      onChange={(ev) => setDraft({ ...draft, [e.id]: ev.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px" }}
                      onClick={() => patchEntry(e.id, { assertions: draft[e.id] ?? e.assertions }).then(reload)}
                    >
                      Save
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

function RegulatoryCrossReference() {
  const { entries, loading, reload } = useEntries();
  const [draft, setDraft] = useState<Record<number, string>>({});
  return (
    <div>
      <Intro>
        Map each control to the laws and frameworks it satisfies — COSO, ICFR, Companies Act, SOX, GST, RBI
        and so on — so audit coverage can be traced back to regulation.
      </Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Regulatory references</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={3} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={3} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                      {e.regulatory_refs
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean)
                        .map((a) => (
                          <span key={a} className="badge badge-slate">{a}</span>
                        ))}
                    </div>
                    <input
                      className="input"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      placeholder="COSO, ICFR, Companies Act..."
                      value={draft[e.id] ?? e.regulatory_refs}
                      onChange={(ev) => setDraft({ ...draft, [e.id]: ev.target.value })}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px" }}
                      onClick={() => patchEntry(e.id, { regulatory_refs: draft[e.id] ?? e.regulatory_refs }).then(reload)}
                    >
                      Save
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

function TestProcedureLinkage() {
  const { entries, loading, reload } = useEntries();
  const [draft, setDraft] = useState<Record<number, string>>({});
  return (
    <div>
      <Intro>Attach the test steps an auditor should follow to confirm each control is operating.</Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Test procedure</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={3} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={3} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ verticalAlign: "top", paddingTop: 12 }}>{e.process}</td>
                  <td>
                    <textarea
                      className="input"
                      rows={2}
                      value={draft[e.id] ?? e.test_procedure}
                      onChange={(ev) => setDraft({ ...draft, [e.id]: ev.target.value })}
                    />
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: 12 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px" }}
                      onClick={() => patchEntry(e.id, { test_procedure: draft[e.id] ?? e.test_procedure }).then(reload)}
                    >
                      Save
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

function DesignVsOperatingEffectiveness() {
  const { entries, loading, reload } = useEntries();
  return (
    <div>
      <Intro>
        Track design &amp; implementation (D&amp;I) separately from operating effectiveness (OE) — a control
        can be well-designed but still fail in practice.
      </Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Design &amp; implementation</th>
              <th>Operating effectiveness</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={3} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={3} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td><InlineSelect value={e.design_effectiveness} options={EFFECTIVENESS} onChange={(v) => patchEntry(e.id, { design_effectiveness: v }).then(reload)} /></td>
                  <td><InlineSelect value={e.operating_effectiveness} options={EFFECTIVENESS} onChange={(v) => patchEntry(e.id, { operating_effectiveness: v }).then(reload)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ControlRationalisation() {
  const { entries, loading, reload } = useEntries();
  return (
    <div>
      <Intro>Flag redundant or over-controlled areas so the library stays lean and easy to maintain.</Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Control</th>
              <th>Rationalisation status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={3} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={3} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td style={{ color: "var(--slate)" }}>{e.control_description.slice(0, 50)}{e.control_description.length > 50 ? "…" : ""}</td>
                  <td><InlineSelect value={e.rationalization_status} options={RATIONALIZATION} onChange={(v) => patchEntry(e.id, { rationalization_status: v }).then(reload)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyControlDesignation() {
  const { entries, loading, reload } = useEntries();
  return (
    <div>
      <Intro>Flag which controls are "key" — the ones ICFR/SOX-style testing relies on for assurance.</Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Control</th>
              <th>Key control</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={3} label="Loading…" />
            ) : entries.length === 0 ? (
              <EmptyRow span={3} label="No controls yet." />
            ) : (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.process}</td>
                  <td style={{ color: "var(--slate)" }}>{e.control_description.slice(0, 50)}{e.control_description.length > 50 ? "…" : ""}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={e.is_key_control}
                      onChange={(ev) => patchEntry(e.id, { is_key_control: ev.target.checked }).then(reload)}
                    />
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

function RcmMatrixShell() {
  const { entries, loading } = useEntries();
  const grouped = entries.reduce<Record<string, RcmEntry[]>>((acc, e) => {
    (acc[e.process] ||= []).push(e);
    return acc;
  }, {});
  return (
    <div>
      <Intro>
        A consolidated, read-only view of the risk &amp; control matrix grouped by process — the shape most
        auditors expect when reviewing coverage for a domain.
      </Intro>
      {loading ? (
        <p>Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No entries yet.</p>
      ) : (
        Object.entries(grouped).map(([process, rows]) => (
          <div key={process} className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>{process}</h3>
            <table>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Control</th>
                  <th>Owner</th>
                  <th>Key?</th>
                  <th>OE</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.risk}</td>
                    <td>{r.control_description}</td>
                    <td>{r.owner || "—"}</td>
                    <td>{r.is_key_control ? <span className="badge badge-gold">Key</span> : "—"}</td>
                    <td><span className={badgeClass(r.operating_effectiveness)}>{r.operating_effectiveness}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Control Owner Directory                                         */
/* ------------------------------------------------------------------ */

function ControlOwnerDirectory() {
  return (
    <div>
      <Intro>Named owners and reviewers for every control — who's accountable, and who signs off.</Intro>
      <GenericCrud<Owner>
        endpoint={api("/owners")}
        emptyLabel="No owners added yet."
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "department", label: "Department", type: "text" },
          { key: "role", label: "Role", type: "select", options: ["Owner", "Reviewer", "Approver"] },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "department", label: "Department" },
          { key: "role", label: "Role", render: (o) => <span className="badge badge-slate">{o.role}</span> },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Change & Version Control                                        */
/* ------------------------------------------------------------------ */

function ChangeVersionControl() {
  const [rows, setRows] = useState<VersionLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    get<VersionLogRow[]>(api("/version-log")).then((d) => {
      setRows(d);
      setLoading(false);
    });
  }, []);
  return (
    <div>
      <Intro>
        Every edit to an RCM entry is logged automatically here — field, old value, new value and who made
        the change — so the control library has a full audit trail.
      </Intro>
      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Field</th>
              <th>Old value</th>
              <th>New value</th>
              <th>Changed by</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={5} label="Loading…" />
            ) : rows.length === 0 ? (
              <EmptyRow span={5} label="No changes logged yet — edit an entry to see history here." />
            ) : (
              rows.map((v) => (
                <tr key={v.id}>
                  <td>{v.entry_process}</td>
                  <td><span className="badge badge-slate">{v.field_changed}</span></td>
                  <td style={{ color: "var(--slate)" }}>{v.old_value || "—"}</td>
                  <td>{v.new_value || "—"}</td>
                  <td>{v.changed_by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Control Gap Analysis                                           */
/* ------------------------------------------------------------------ */

function ControlGapAnalysis() {
  const [data, setData] = useState<GapAnalysis | null>(null);
  useEffect(() => {
    get<GapAnalysis>(api("/gap-analysis")).then(setData);
  }, []);
  return (
    <div>
      <Intro>
        Compares the audit universe (Scope tab) against the control register to surface processes with no
        mitigating control yet.
      </Intro>
      {!data ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 16, minWidth: 160 }}>
              <div style={{ color: "var(--slate)", fontSize: 13 }}>In-scope units</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.total_scope}</div>
            </div>
            <div className="card" style={{ padding: 16, minWidth: 160 }}>
              <div style={{ color: "var(--slate)", fontSize: 13 }}>Covered by a control</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{data.covered}</div>
            </div>
            <div className="card" style={{ padding: 16, minWidth: 160 }}>
              <div style={{ color: "var(--slate)", fontSize: 13 }}>Gaps</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: data.gaps.length ? "var(--danger, #d33)" : undefined }}>
                {data.gaps.length}
              </div>
            </div>
          </div>
          <div className="card" style={{ overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {data.gaps.length === 0 ? (
                  <EmptyRow span={3} label="No gaps — every in-scope unit has at least one control." />
                ) : (
                  data.gaps.map((g) => (
                    <tr key={g.id}>
                      <td>{g.unit_name}</td>
                      <td><span className="badge badge-danger">{g.unit_type}</span></td>
                      <td style={{ color: "var(--slate)" }}>{g.description || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Framework Templates                                            */
/* ------------------------------------------------------------------ */

function FrameworkTemplates() {
  const [applying, setApplying] = useState<number | null>(null);
  return (
    <div>
      <Intro>
        Prebuilt process/risk/control starting points by cycle and industry. Apply one to instantly create a
        draft entry in the Process-Risk-Control Mapping tab, then refine it.
      </Intro>
      <GenericCrud<Template>
        endpoint={api("/templates")}
        emptyLabel="No templates yet."
        fields={[
          { key: "name", label: "Template name", type: "text" },
          { key: "cycle", label: "Cycle", type: "text", placeholder: "e.g. Procure-to-Pay" },
          { key: "industry", label: "Industry", type: "text" },
          { key: "description", label: "Description", type: "textarea", wide: true },
          { key: "default_process", label: "Default process", type: "text" },
          { key: "default_risk", label: "Default risk", type: "textarea", wide: true },
          { key: "default_control", label: "Default control", type: "textarea", wide: true },
          { key: "is_active", label: "Active", type: "checkbox" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "cycle", label: "Cycle" },
          { key: "industry", label: "Industry" },
          { key: "is_active", label: "Active", render: (t) => (t.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-slate">Inactive</span>) },
        ]}
        extraRowActions={(row, reload) => (
          <button
            className="btn btn-ghost"
            style={{ padding: "6px 10px" }}
            disabled={applying === row.id}
            onClick={async () => {
              setApplying(row.id);
              await post(api(`/templates/${row.id}/apply`));
              setApplying(null);
              reload();
            }}
          >
            {applying === row.id ? "Applying…" : "Apply"}
          </button>
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Heat-of-Control Dashboard & 16. Module Dashboard & KPIs         */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "danger" | "gold" | "success" }) {
  const color = tone === "danger" ? "#d33" : tone === "gold" ? "#b8860b" : tone === "success" ? "#1a9c5c" : undefined;
  return (
    <div className="card" style={{ padding: 16, minWidth: 160, flex: "1 1 160px" }}>
      <div style={{ color: "var(--slate)", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function BreakdownBars({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="card" style={{ padding: 16 }}>
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      {entries.length === 0 ? (
        <p style={{ color: "var(--slate)", fontSize: 13 }}>No data yet.</p>
      ) : (
        entries.map(([label, value]) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
              <span>{label}</span>
              <span style={{ color: "var(--slate)" }}>{value}</span>
            </div>
            <div style={{ background: "var(--border, #eee)", borderRadius: 4, height: 8 }}>
              <div style={{ width: `${(value / max) * 100}%`, background: "var(--gold, #b8860b)", height: 8, borderRadius: 4 }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ModuleDashboard() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => {
    get<Dashboard>(api("/dashboard")).then(setD);
  }, []);
  return (
    <div>
      <Intro>Live risk score inputs, open exceptions, coverage % and trend for the RCM Library domain.</Intro>
      {!d ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <KpiCard label="Total controls" value={d.total_controls} />
            <KpiCard label="Key controls" value={d.key_controls} tone="gold" />
            <KpiCard label="Effective (OE)" value={d.effective_operating_controls} tone="success" />
            <KpiCard label="Open exceptions" value={d.open_exceptions} tone={d.open_exceptions ? "danger" : "success"} />
            <KpiCard label="Open findings" value={d.open_findings} tone={d.open_findings ? "danger" : "success"} />
            <KpiCard label="Scope coverage" value={`${d.coverage_pct}%`} tone={d.coverage_pct >= 80 ? "success" : "gold"} />
          </div>
        </>
      )}
    </div>
  );
}

function HeatOfControlDashboard() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => {
    get<Dashboard>(api("/dashboard")).then(setD);
  }, []);
  return (
    <div>
      <Intro>Visual breakdown of control coverage — by type, nature, effectiveness and rationalisation status.</Intro>
      {!d ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <BreakdownBars title="By control type" data={d.by_control_type} />
          <BreakdownBars title="By nature" data={d.by_nature} />
          <BreakdownBars title="By operating effectiveness" data={d.by_operating_effectiveness} />
          <BreakdownBars title="By rationalisation status" data={d.by_rationalization_status} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Bulk Import / Export                                           */
/* ------------------------------------------------------------------ */

function toCsv(rows: RcmEntry[]) {
  const cols: (keyof RcmEntry)[] = ["process", "risk", "control_description", "control_type", "frequency", "nature", "is_key_control", "owner", "status"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

function fromCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? [];
    const row: Record<string, any> = {};
    header.forEach((h, i) => {
      const raw = (cells[i] ?? "").replace(/^"|"$/g, "").replace(/""/g, '"');
      row[h] = h === "is_key_control" ? raw.toLowerCase() === "true" : raw;
    });
    return row;
  });
}

function BulkImportExport() {
  const { entries, reload } = useEntries();
  const [csvText, setCsvText] = useState("");
  const [message, setMessage] = useState("");

  function exportCsv() {
    const blob = new Blob([toCsv(entries)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rcm_library_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv() {
    const rows = fromCsv(csvText).map((r) => ({
      process: r.process || "Untitled process",
      risk: r.risk || "",
      control_description: r.control_description || "",
      control_type: r.control_type || "Preventive",
      frequency: r.frequency || "Monthly",
      nature: r.nature || "Manual",
      is_key_control: !!r.is_key_control,
      owner: r.owner || "",
      status: r.status || "Draft",
    }));
    if (rows.length === 0) {
      setMessage("Paste CSV rows first (header + at least one data row).");
      return;
    }
    await post(api("/entries/bulk-import"), rows);
    setMessage(`Imported ${rows.length} row(s).`);
    setCsvText("");
    reload();
  }

  return (
    <div>
      <Intro>Migrate RCMs to and from spreadsheets. Export the current register, or paste CSV to bulk-create entries.</Intro>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h4 style={{ marginTop: 0 }}>Export</h4>
        <p style={{ color: "var(--slate)", fontSize: 13 }}>Downloads all {entries.length} entries as a CSV file.</p>
        <button className="btn btn-primary" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ marginTop: 0 }}>Import</h4>
        <p style={{ color: "var(--slate)", fontSize: 13 }}>
          Header row: process,risk,control_description,control_type,frequency,nature,is_key_control,owner,status
        </p>
        <textarea
          className="input"
          rows={6}
          style={{ fontFamily: "monospace", fontSize: 12 }}
          placeholder={"process,risk,control_description,control_type,frequency,nature,is_key_control,owner,status"}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={importCsv}>Import CSV</button>
          {message && <span style={{ color: "var(--slate)", fontSize: 13 }}>{message}</span>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 15. RCM Approval Workflow                                          */
/* ------------------------------------------------------------------ */

function RcmApprovalWorkflow() {
  const { entries } = useEntries();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entry_id: 0, requested_by: "", approver: "", comments: "" });

  async function load() {
    setLoading(true);
    setApprovals(await get<Approval[]>(api("/approvals")));
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.entry_id) return;
    await post(api("/approvals"), form);
    setForm({ entry_id: 0, requested_by: "", approver: "", comments: "" });
    load();
  }

  async function decide(id: number, status: "Approved" | "Rejected") {
    await patch(api(`/approvals/${id}`), { status, comments: "" });
    load();
  }

  return (
    <div>
      <Intro>Route control-library changes for sign-off before they go live.</Intro>
      <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 20, maxWidth: 640 }}>
        <div className="field">
          <label>RCM entry</label>
          <select className="select" value={form.entry_id} onChange={(e) => setForm({ ...form, entry_id: Number(e.target.value) })}>
            <option value={0}>Select an entry…</option>
            {entries.map((e) => (
              <option key={e.id} value={e.id}>{e.process} — {e.control_description.slice(0, 40)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Requested by</label>
          <input className="input" value={form.requested_by} onChange={(e) => setForm({ ...form, requested_by: e.target.value })} />
        </div>
        <div className="field">
          <label>Approver</label>
          <input className="input" value={form.approver} onChange={(e) => setForm({ ...form, approver: e.target.value })} />
        </div>
        <div className="field">
          <label>Comments</label>
          <input className="input" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
        </div>
        <button className="btn btn-primary">Submit for approval</button>
      </form>

      <div className="card" style={{ overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Requested by</th>
              <th>Approver</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow span={5} label="Loading…" />
            ) : approvals.length === 0 ? (
              <EmptyRow span={5} label="No approval requests yet." />
            ) : (
              approvals.map((a) => (
                <tr key={a.id}>
                  <td>{a.entry_process}</td>
                  <td>{a.requested_by || "—"}</td>
                  <td>{a.approver || "—"}</td>
                  <td><span className={badgeClass(a.status)}>{a.status}</span></td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {a.status === "Pending" && (
                      <>
                        <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => decide(a.id, "Approved")}>Approve</button>
                        <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => decide(a.id, "Rejected")}>Reject</button>
                      </>
                    )}
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

/* ------------------------------------------------------------------ */
/* 17, 19, 20, 21, 22, 23, 24, 25 — Shell CRUD pages                   */
/* ------------------------------------------------------------------ */

function ScopeAuditUniverse() {
  return (
    <div>
      <Intro>Define the auditable units, entities and processes in scope for this module.</Intro>
      <GenericCrud<ScopeItem>
        endpoint={api("/scope")}
        emptyLabel="No scope items yet."
        fields={[
          { key: "unit_name", label: "Unit name", type: "text", placeholder: "Must match a Process name to count as covered" },
          { key: "unit_type", label: "Type", type: "select", options: ["Entity", "Process", "Function", "Location"] },
          { key: "description", label: "Description", type: "textarea", wide: true },
          { key: "in_scope", label: "In scope", type: "checkbox" },
        ]}
        columns={[
          { key: "unit_name", label: "Unit" },
          { key: "unit_type", label: "Type", render: (u) => <span className="badge badge-slate">{u.unit_type}</span> },
          { key: "description", label: "Description" },
          { key: "in_scope", label: "In scope", render: (u) => (u.in_scope ? <span className="badge badge-success">Yes</span> : <span className="badge badge-slate">No</span>) },
        ]}
      />
    </div>
  );
}

function TestAnalyticsRuleLibrary() {
  return (
    <div>
      <Intro>Configure automated red-flag rules, thresholds and CAAT scripts that feed the exception queue.</Intro>
      <GenericCrud<TestRule>
        endpoint={api("/test-rules")}
        emptyLabel="No test rules yet."
        fields={[
          { key: "name", label: "Rule name", type: "text" },
          { key: "description", label: "Description", type: "textarea", wide: true },
          { key: "data_source", label: "Data source", type: "text" },
          { key: "threshold", label: "Threshold", type: "text", placeholder: "e.g. amount > 500,000" },
          { key: "is_active", label: "Active", type: "checkbox" },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "data_source", label: "Data source" },
          { key: "threshold", label: "Threshold" },
          { key: "is_active", label: "Active", render: (r) => (r.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-slate">Inactive</span>) },
        ]}
      />
    </div>
  );
}

function DataSourceConnectorSetup() {
  return (
    <div>
      <Intro>Map the ERP tables, APIs or uploads that feed this module's analytics.</Intro>
      <GenericCrud<Connector>
        endpoint={api("/connectors")}
        emptyLabel="No connectors configured yet."
        fields={[
          { key: "name", label: "Name", type: "text" },
          { key: "source_type", label: "Source type", type: "select", options: ["ERP", "API", "Manual Upload", "Database"] },
          { key: "connection_details", label: "Connection details", type: "textarea", wide: true },
          { key: "status", label: "Status", type: "select", options: ["Connected", "Pending", "Error"] },
        ]}
        columns={[
          { key: "name", label: "Name" },
          { key: "source_type", label: "Type", render: (c) => <span className="badge badge-slate">{c.source_type}</span> },
          { key: "status", label: "Status", render: (c) => <span className={badgeClass(c.status)}>{c.status}</span> },
        ]}
      />
    </div>
  );
}

function SamplingPopulationBuilder() {
  return (
    <div>
      <Intro>Draw statistical or judgemental samples from the full population for testing.</Intro>
      <GenericCrud<SamplePlan>
        endpoint={api("/samples")}
        emptyLabel="No sample plans yet."
        fields={[
          { key: "population_description", label: "Population", type: "textarea", wide: true },
          { key: "sampling_method", label: "Method", type: "select", options: ["Random", "Judgemental", "Systematic", "Stratified"] },
          { key: "population_size", label: "Population size", type: "number" },
          { key: "sample_size", label: "Sample size", type: "number" },
          { key: "notes", label: "Notes", type: "textarea", wide: true },
        ]}
        columns={[
          { key: "population_description", label: "Population" },
          { key: "sampling_method", label: "Method", render: (s) => <span className="badge badge-slate">{s.sampling_method}</span> },
          { key: "population_size", label: "Population size" },
          { key: "sample_size", label: "Sample size" },
        ]}
      />
    </div>
  );
}

function ExceptionRedFlagQueue() {
  return (
    <div>
      <Intro>Triage system-generated exceptions with disposition and notes.</Intro>
      <GenericCrud<ExceptionItem>
        endpoint={api("/exceptions")}
        emptyLabel="No exceptions in the queue."
        fields={[
          { key: "description", label: "Description", type: "textarea", wide: true },
          { key: "source_rule", label: "Source rule", type: "text" },
          { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
          { key: "status", label: "Status", type: "select", options: ["Open", "Under Review", "Closed", "False Positive"] },
          { key: "disposition_notes", label: "Disposition notes", type: "textarea", wide: true },
        ]}
        columns={[
          { key: "description", label: "Description" },
          { key: "source_rule", label: "Source rule" },
          { key: "severity", label: "Severity", render: (x) => <span className={badgeClass(x.severity)}>{x.severity}</span> },
          { key: "status", label: "Status", render: (x) => <span className={badgeClass(x.status)}>{x.status}</span> },
        ]}
      />
    </div>
  );
}

function WorkingPapersEvidence() {
  return (
    <div>
      <Intro>Attach evidence, tick-marks and reviewer sign-off. Reference an RCM entry by its ID (see the Process-Risk-Control Mapping tab).</Intro>
      <GenericCrud<WorkingPaper>
        endpoint={api("/working-papers")}
        emptyLabel="No working papers yet."
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "related_entry_id", label: "Related RCM entry ID (optional)", type: "number" },
          { key: "content", label: "Evidence / notes", type: "textarea", wide: true },
          { key: "reviewer", label: "Reviewer", type: "text" },
          { key: "sign_off_status", label: "Sign-off status", type: "select", options: ["Pending", "Reviewed", "Signed Off"] },
        ]}
        columns={[
          { key: "title", label: "Title" },
          { key: "related_entry_id", label: "RCM entry #", render: (w) => (w.related_entry_id ? `#${w.related_entry_id}` : "—") },
          { key: "reviewer", label: "Reviewer" },
          { key: "sign_off_status", label: "Sign-off", render: (w) => <span className={badgeClass(w.sign_off_status)}>{w.sign_off_status}</span> },
        ]}
      />
    </div>
  );
}

function ObservationFindingLog() {
  return (
    <div>
      <Intro>Raise, grade and route findings specific to this domain.</Intro>
      <GenericCrud<FindingItem>
        endpoint={api("/findings")}
        emptyLabel="No findings logged yet."
        fields={[
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea", wide: true },
          { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
          { key: "related_entry_id", label: "Related RCM entry ID (optional)", type: "number" },
          { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Closed"] },
        ]}
        columns={[
          { key: "title", label: "Title" },
          { key: "severity", label: "Severity", render: (f) => <span className={badgeClass(f.severity)}>{f.severity}</span> },
          { key: "related_entry_id", label: "RCM entry #", render: (f) => (f.related_entry_id ? `#${f.related_entry_id}` : "—") },
          { key: "status", label: "Status", render: (f) => <span className={badgeClass(f.status)}>{f.status}</span> },
        ]}
      />
    </div>
  );
}

function RemediationActionTracker() {
  return (
    <div>
      <Intro>Track CAPA items, owners, due dates and re-testing status. Reference a Finding by its ID.</Intro>
      <GenericCrud<RemediationItem>
        endpoint={api("/remediation")}
        emptyLabel="No remediation actions yet."
        fields={[
          { key: "finding_id", label: "Related finding ID (optional)", type: "number" },
          { key: "action", label: "Action", type: "textarea", wide: true },
          { key: "owner", label: "Owner", type: "text" },
          { key: "due_date", label: "Due date", type: "text", placeholder: "YYYY-MM-DD" },
          { key: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Completed", "Overdue"] },
          { key: "retest_status", label: "Re-test status", type: "select", options: ["Pending", "Passed", "Failed"] },
        ]}
        columns={[
          { key: "action", label: "Action" },
          { key: "owner", label: "Owner" },
          { key: "due_date", label: "Due date" },
          { key: "status", label: "Status", render: (r) => <span className={badgeClass(r.status)}>{r.status}</span> },
          { key: "retest_status", label: "Re-test", render: (r) => <span className={badgeClass(r.retest_status)}>{r.retest_status}</span> },
        ]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab registry + shell                                                */
/* ------------------------------------------------------------------ */

interface TabDef {
  num: number;
  label: string;
  render: () => React.ReactNode;
}

const SIGNATURE_TABS: TabDef[] = [
  { num: 1, label: "Process-Risk-Control Mapping", render: () => <ProcessRiskControlMapping /> },
  { num: 2, label: "Control Attribute Register", render: () => <ControlAttributeRegister /> },
  { num: 3, label: "Assertion Mapping", render: () => <AssertionMapping /> },
  { num: 4, label: "Regulatory Cross-Reference", render: () => <RegulatoryCrossReference /> },
  { num: 5, label: "Control Owner Directory", render: () => <ControlOwnerDirectory /> },
  { num: 6, label: "Test Procedure Linkage", render: () => <TestProcedureLinkage /> },
  { num: 7, label: "Design vs Operating Effectiveness", render: () => <DesignVsOperatingEffectiveness /> },
  { num: 8, label: "Control Rationalisation", render: () => <ControlRationalisation /> },
  { num: 9, label: "Change & Version Control", render: () => <ChangeVersionControl /> },
  { num: 10, label: "Key-Control Designation", render: () => <KeyControlDesignation /> },
  { num: 11, label: "Control Gap Analysis", render: () => <ControlGapAnalysis /> },
  { num: 12, label: "Framework Templates", render: () => <FrameworkTemplates /> },
  { num: 13, label: "Heat-of-Control Dashboard", render: () => <HeatOfControlDashboard /> },
  { num: 14, label: "Bulk Import / Export", render: () => <BulkImportExport /> },
  { num: 15, label: "RCM Approval Workflow", render: () => <RcmApprovalWorkflow /> },
];

const SHELL_TABS: TabDef[] = [
  { num: 16, label: "Module Dashboard & KPIs", render: () => <ModuleDashboard /> },
  { num: 17, label: "Scope & Audit Universe", render: () => <ScopeAuditUniverse /> },
  { num: 18, label: "Risk & Control Matrix", render: () => <RcmMatrixShell /> },
  { num: 19, label: "Test & Analytics Rule Library", render: () => <TestAnalyticsRuleLibrary /> },
  { num: 20, label: "Data Source & Connector Setup", render: () => <DataSourceConnectorSetup /> },
  { num: 21, label: "Sampling & Population Builder", render: () => <SamplingPopulationBuilder /> },
  { num: 22, label: "Exception & Red-Flag Queue", render: () => <ExceptionRedFlagQueue /> },
  { num: 23, label: "Working Papers & Evidence", render: () => <WorkingPapersEvidence /> },
  { num: 24, label: "Observation & Finding Log", render: () => <ObservationFindingLog /> },
  { num: 25, label: "Remediation / Action Tracker", render: () => <RemediationActionTracker /> },
];

const ALL_TABS = [...SIGNATURE_TABS, ...SHELL_TABS];

export default function RcmLibraryPage() {
  const [active, setActive] = useState(1);
  const activeTab = ALL_TABS.find((t) => t.num === active) ?? ALL_TABS[0];

  function NavGroup({ heading, tabs }: { heading: string; tabs: TabDef[] }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "var(--slate)", margin: "6px 10px" }}>
          {heading}
        </div>
        {tabs.map((t) => (
          <button
            key={t.num}
            className={active === t.num ? "btn btn-primary btn-block" : "btn btn-ghost btn-block"}
            style={{ justifyContent: "flex-start", textAlign: "left", marginBottom: 2, fontSize: 13, padding: "8px 10px" }}
            onClick={() => setActive(t.num)}
          >
            {t.num}. {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 24, alignItems: "start" }}>
      <nav className="card" style={{ padding: 10, position: "sticky", top: 12, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
        <NavGroup heading="SIGNATURE PAGES" tabs={SIGNATURE_TABS} />
        <NavGroup heading="SHELL PAGES" tabs={SHELL_TABS} />
      </nav>
      <div>
        <h2 style={{ marginTop: 0 }}>{activeTab.num}. {activeTab.label}</h2>
        {activeTab.render()}
      </div>
    </div>
  );
}
