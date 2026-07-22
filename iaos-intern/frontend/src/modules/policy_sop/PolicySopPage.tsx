import { useEffect, useState, useCallback } from "react";
import { del, get, post, put } from "../../lib/api";

const SLUG = "policy_sop";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "policies", label: "Policies" },
  { key: "approvals", label: "Approvals" },
  { key: "attestations", label: "Attestations" },
  { key: "exceptions", label: "Exceptions" },
  { key: "gap_analysis", label: "Gap Analysis" },
  { key: "breach_reports", label: "Breach Reports" },
  { key: "observations", label: "Observations" },
  { key: "remediation", label: "Remediation" },
  { key: "regulations", label: "Regulations" },
  { key: "risk_controls", label: "Risk Controls" },
  { key: "templates", label: "Templates" },
  { key: "working_papers", label: "Working Papers" },
  { key: "data_sources", label: "Data Sources" },
  { key: "sampling", label: "Sampling" },
  { key: "ownership", label: "Ownership" },
  { key: "departments", label: "Departments" },
  { key: "announcements", label: "Announcements" },
  { key: "audit_logs", label: "Audit Logs" },
  { key: "notifications", label: "Notifications" },
];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`} style={{ padding: 18 }}>{children}</div>;
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: color + "22",
        color,
      }}
    >
      {children}
    </span>
  );
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  under_review: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  retired: "#6b7280",
  open: "#3b82f6",
  pending: "#f59e0b",
  in_progress: "#8b5cf6",
  completed: "#22c55e",
  closed: "#6b7280",
  acknowledged: "#22c55e",
  non_compliant: "#ef4444",
  compliant: "#22c55e",
  partial: "#f59e0b",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge color={STATUS_COLORS[status] || "#6b7280"}>{status.replace(/_/g, " ")}</Badge>;
}

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
      <button
        className="btn btn-ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span style={{ padding: "6px 12px", fontSize: 13, color: "var(--slate)" }}>
        {page} / {pages}
      </span>
      <button
        className="btn btn-ghost"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function Empty({ text = "No records yet." }: { text?: string }) {
  return (
    <p style={{ padding: 18, color: "var(--slate)", textAlign: "center" }}>{text}</p>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Tab
// ---------------------------------------------------------------------------

function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<any>(`/api/modules/${SLUG}/dashboard/stats`)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 18 }}>Loading...</p>;
  if (!stats) return <Empty text="No dashboard data available." />;

  const cards = [
    { label: "Total Policies", value: stats.total_policies ?? 0 },
    { label: "Active Policies", value: stats.active_policies ?? 0 },
    { label: "Pending Approvals", value: stats.pending_approvals ?? 0 },
    { label: "Pending Attestations", value: stats.pending_attestations ?? 0 },
    { label: "Open Exceptions", value: stats.open_exceptions ?? 0 },
    { label: "Compliance Gaps", value: stats.compliance_gaps ?? 0 },
    { label: "Expiring Soon", value: stats.expiring_soon ?? 0 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{c.value}</div>
          <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Policies Tab
// ---------------------------------------------------------------------------

function PoliciesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", department: "" });
  const [formError, setFormError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    get<any>(`/api/modules/${SLUG}/policies?${params}`)
      .then((r) => {
        setItems(r.items || []);
        setTotal(r.total || 0);
        setPages(r.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await post(`/api/modules/${SLUG}/policies`, form);
      setForm({ title: "", description: "", category: "", department: "" });
      setShowForm(false);
      refresh();
    } catch (err: any) {
      setFormError(err?.message || "Failed to create policy");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="input"
          placeholder="Search policies..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="retired">Retired</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Policy"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 14 }} onSubmit={create}>
          <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Create Policy</h3>
          {formError && <div style={{ color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6, marginBottom: 10, fontSize: 13 }}>{formError}</div>}
          <div style={{ display: "grid", gap: 10 }}>
            <div className="field">
              <label>Title</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label>Category</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="field">
                <label>Department</label>
                <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-block">Create</button>
          </div>
        </form>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Policy #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Department</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.policy_number}</td>
                  <td>{p.title}</td>
                  <td>{p.category || "---"}</td>
                  <td>{p.department || "---"}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={async () => {
                        try {
                          await del(`/api/modules/${SLUG}/policies/${p.id}`);
                          refresh();
                        } catch (err: any) {
                          alert(err?.message || "Failed to delete");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6}><Empty /></td></tr>
              )}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
      <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 8 }}>{total} total policies</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic CRUD Tab
// ---------------------------------------------------------------------------

function GenericCrudTab({
  title,
  endpoint,
  columns,
  createFields,
}: {
  title: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (v: any) => React.ReactNode }[];
  createFields: { key: string; label: string; type?: string; required?: boolean }[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/${endpoint}?page=${page}&per_page=20`)
      .then((r) => {
        if (Array.isArray(r)) {
          setItems(r);
          setTotal(r.length);
          setPages(1);
        } else {
          setItems(r.items || []);
          setTotal(r.total || 0);
          setPages(r.pages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, endpoint]);

  useEffect(() => { refresh(); }, [refresh]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await post(`/api/modules/${SLUG}/${endpoint}`, form);
      setForm({});
      setShowForm(false);
      refresh();
    } catch (err: any) {
      setFormError(err?.message || "Failed to create");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>{title}</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : `+ New ${title.replace(/s$/, "")}`}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 18, marginBottom: 14 }} onSubmit={create}>
          {formError && <div style={{ color: "#ef4444", background: "#fef2f2", padding: "8px 12px", borderRadius: 6, marginBottom: 10, fontSize: 13 }}>{formError}</div>}
          <div style={{ display: "grid", gap: 10 }}>
            {createFields.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input
                  className="input"
                  type={f.type || "text"}
                  required={f.required}
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <button className="btn btn-primary btn-block">Create</button>
          </div>
        </form>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(item[c.key]) : (item[c.key] ?? "---")}
                    </td>
                  ))}
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={async () => {
                        try {
                          await del(`/api/modules/${SLUG}/${endpoint}/${item.id}`);
                          refresh();
                        } catch (err: any) {
                          alert(err?.message || "Failed to delete");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={columns.length + 1}><Empty /></td></tr>
              )}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
      <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 8 }}>{total} total records</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications Tab
// ---------------------------------------------------------------------------

function NotificationsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Promise.all([
      get<any>(`/api/modules/${SLUG}/notifications?per_page=50`),
      get<any>(`/api/modules/${SLUG}/notifications/unread-count`),
    ])
      .then(([notifs, count]) => {
        setItems(notifs.items || []);
        setUnreadCount(count.count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ color: "var(--navy)", margin: 0 }}>
          Notifications {unreadCount > 0 && <Badge color="#ef4444">{unreadCount} unread</Badge>}
        </h3>
        <button
          className="btn btn-ghost"
          onClick={async () => {
            await put(`/api/modules/${SLUG}/notifications/read-all`);
            setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
          }}
        >
          Mark all read
        </button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading...</p>
        ) : items.length === 0 ? (
          <Empty text="No notifications." />
        ) : (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n: any) => (
                <tr key={n.id} style={{ opacity: n.is_read ? 0.6 : 1 }}>
                  <td style={{ width: 8 }}>
                    {!n.is_read && (
                      <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                    )}
                  </td>
                  <td style={{ fontWeight: n.is_read ? 400 : 600 }}>{n.title}</td>
                  <td style={{ color: "var(--slate)" }}>{n.message || "---"}</td>
                  <td>{n.type || "---"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit Logs Tab
// ---------------------------------------------------------------------------

function AuditLogsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    get<any>(`/api/modules/${SLUG}/audit-logs?page=${page}&per_page=20`)
      .then((r) => {
        setItems(r.items || []);
        setPages(r.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Audit Trail</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log: any) => (
                <tr key={log.id}>
                  <td><StatusBadge status={log.action} /></td>
                  <td>{log.entity_type}</td>
                  <td>{log.entity_id ?? "---"}</td>
                  <td style={{ fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {log.details ? JSON.stringify(log.details) : "---"}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--slate)" }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "---"}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5}><Empty /></td></tr>}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Approvals Tab
// ---------------------------------------------------------------------------

function ApprovalsTab() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      get<any>(`/api/modules/${SLUG}/policies?status=draft&per_page=100`),
      get<any>(`/api/modules/${SLUG}/approvals/pending?per_page=100`),
    ])
      .then(([policiesResp, workflowsResp]) => {
        setDrafts(Array.isArray(policiesResp) ? policiesResp : (policiesResp.items || []));
        setWorkflows(Array.isArray(workflowsResp) ? workflowsResp : (workflowsResp.items || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function submitForApproval(policyId: number) {
    try {
      await post(`/api/modules/${SLUG}/approvals/submit/${policyId}`);
      refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to submit for approval");
    }
  }

  async function review(id: number, status: string) {
    try {
      await put(`/api/modules/${SLUG}/approvals/review/${id}`, { status });
      refresh();
    } catch (err: any) {
      alert(err?.message || `Failed to ${status}`);
    }
  }

  if (loading) return <p style={{ padding: 18 }}>Loading...</p>;

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Draft Policies Awaiting Submission</h3>
      <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>Policy #</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((p: any) => (
              <tr key={p.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.policy_number}</td>
                <td>{p.title}</td>
                <td>{p.category || "---"}</td>
                <td><StatusBadge status={p.status} /></td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#3b82f6" }}
                    onClick={() => submitForApproval(p.id)}
                  >
                    Submit for Approval
                  </button>
                </td>
              </tr>
            ))}
            {drafts.length === 0 && (
              <tr><td colSpan={5}><Empty text="No draft policies awaiting submission." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Submitted Workflows Pending Review</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>Submitted By</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((item: any) => (
              <tr key={item.id}>
                <td>{item.policy_id}</td>
                <td>{item.submitted_by ?? "---"}</td>
                <td><StatusBadge status={item.status} /></td>
                <td style={{ textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#22c55e" }}
                    onClick={() => review(item.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#ef4444" }}
                    onClick={() => review(item.id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {workflows.length === 0 && (
              <tr><td colSpan={4}><Empty text="No pending approval workflows." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attestations Tab
// ---------------------------------------------------------------------------

function AttestationsTab() {
  const [attestations, setAttestations] = useState<any[]>([]);
  const [workingPapers, setWorkingPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      get<any>(`/api/modules/${SLUG}/attestations/pending?per_page=100`),
      get<any>(`/api/modules/${SLUG}/working-papers?per_page=100`),
    ])
      .then(([attResp, wpResp]) => {
        setAttestations(Array.isArray(attResp) ? attResp : (attResp.items || []));
        const allWp = Array.isArray(wpResp) ? wpResp : (wpResp.items || []);
        setWorkingPapers(allWp.filter((wp: any) => wp.review_status === "pending"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function acknowledge(id: number) {
    try {
      await post(`/api/modules/${SLUG}/attestations/${id}/acknowledge`);
      refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to acknowledge");
    }
  }

  async function reviewWorkingPaper(id: number, status: string) {
    try {
      await put(`/api/modules/${SLUG}/working-papers/${id}`, { review_status: status });
      refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to update review status");
    }
  }

  if (loading) return <p style={{ padding: 18 }}>Loading...</p>;

  return (
    <div>
      <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Pending Attestations</h3>
      <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>User ID</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attestations.map((item: any) => (
              <tr key={item.id}>
                <td>{item.policy_id}</td>
                <td>{item.user_id ?? "---"}</td>
                <td><StatusBadge status={item.status} /></td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#22c55e" }}
                    onClick={() => acknowledge(item.id)}
                  >
                    Acknowledge
                  </button>
                </td>
              </tr>
            ))}
            {attestations.length === 0 && (
              <tr><td colSpan={4}><Empty text="No pending attestations." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Working Papers Pending Review</h3>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Review Status</th>
              <th>Evidence Notes</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workingPapers.map((wp: any) => (
              <tr key={wp.id}>
                <td>{wp.title}</td>
                <td><StatusBadge status={wp.review_status} /></td>
                <td style={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wp.evidence_notes || "---"}</td>
                <td style={{ textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#22c55e" }}
                    onClick={() => reviewWorkingPaper(wp.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12, color: "#ef4444" }}
                    onClick={() => reviewWorkingPaper(wp.id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {workingPapers.length === 0 && (
              <tr><td colSpan={4}><Empty text="No working papers pending review." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function PolicySopPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border, #e2e8f0)",
          marginBottom: 20,
          overflowX: "auto",
          flexWrap: "nowrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? "var(--navy)" : "var(--slate)",
              borderBottom: activeTab === t.key ? "2px solid var(--navy)" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "policies" && <PoliciesTab />}
      {activeTab === "approvals" && <ApprovalsTab />}
      {activeTab === "attestations" && <AttestationsTab />}
      {activeTab === "exceptions" && (
        <GenericCrudTab
          title="Exceptions"
          endpoint="exceptions"
          columns={[
            { key: "title", label: "Title" },
            { key: "policy_id", label: "Policy ID" },
            { key: "risk_rating", label: "Risk" },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
          ]}
          createFields={[
            { key: "policy_id", label: "Policy ID", type: "number", required: true },
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description" },
            { key: "risk_rating", label: "Risk Rating" },
          ]}
        />
      )}
      {activeTab === "gap_analysis" && (
        <GenericCrudTab
          title="Gap Analysis"
          endpoint="gap-analysis"
          columns={[
            { key: "regulation_name", label: "Regulation" },
            { key: "requirement_description", label: "Requirement" },
            { key: "gap_status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "risk_level", label: "Risk Level" },
          ]}
          createFields={[
            { key: "regulation_name", label: "Regulation Name", required: true },
            { key: "requirement_description", label: "Requirement", required: true },
            { key: "gap_status", label: "Gap Status" },
            { key: "risk_level", label: "Risk Level" },
          ]}
        />
      )}
      {activeTab === "breach_reports" && (
        <GenericCrudTab
          title="Breach Reports"
          endpoint="breach-reports"
          columns={[
            { key: "title", label: "Title" },
            { key: "severity", label: "Severity" },
            { key: "department", label: "Department" },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
          ]}
          createFields={[
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description" },
            { key: "severity", label: "Severity" },
            { key: "department", label: "Department" },
          ]}
        />
      )}
      {activeTab === "observations" && (
        <GenericCrudTab
          title="Observations"
          endpoint="observations"
          columns={[
            { key: "title", label: "Title" },
            { key: "finding_type", label: "Type" },
            { key: "severity", label: "Severity" },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
          ]}
          createFields={[
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description" },
            { key: "finding_type", label: "Finding Type" },
            { key: "severity", label: "Severity" },
          ]}
        />
      )}
      {activeTab === "remediation" && (
        <GenericCrudTab
          title="Remediations"
          endpoint="remediations"
          columns={[
            { key: "title", label: "Title" },
            { key: "action_type", label: "Type" },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "progress", label: "Progress" },
          ]}
          createFields={[
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description" },
            { key: "action_type", label: "Action Type" },
            { key: "due_date", label: "Due Date", type: "date" },
          ]}
        />
      )}
      {activeTab === "regulations" && (
        <GenericCrudTab
          title="Regulations"
          endpoint="regulations"
          columns={[
            { key: "name", label: "Name" },
            { key: "code", label: "Code" },
            { key: "category", label: "Category" },
            { key: "version", label: "Version" },
          ]}
          createFields={[
            { key: "name", label: "Name", required: true },
            { key: "code", label: "Code", required: true },
            { key: "description", label: "Description" },
            { key: "category", label: "Category" },
            { key: "version", label: "Version" },
          ]}
        />
      )}
      {activeTab === "risk_controls" && (
        <GenericCrudTab
          title="Risk Controls"
          endpoint="risk-controls"
          columns={[
            { key: "risk_name", label: "Risk" },
            { key: "control_name", label: "Control" },
            { key: "risk_rating", label: "Rating" },
            { key: "control_type", label: "Type" },
          ]}
          createFields={[
            { key: "risk_name", label: "Risk Name", required: true },
            { key: "control_name", label: "Control Name", required: true },
            { key: "risk_description", label: "Risk Description" },
            { key: "control_description", label: "Control Description" },
            { key: "risk_rating", label: "Risk Rating" },
            { key: "control_type", label: "Control Type" },
          ]}
        />
      )}
      {activeTab === "templates" && (
        <GenericCrudTab
          title="Templates"
          endpoint="templates"
          columns={[
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "is_active", label: "Active", render: (v) => v ? "Yes" : "No" },
          ]}
          createFields={[
            { key: "name", label: "Name", required: true },
            { key: "description", label: "Description" },
            { key: "category", label: "Category" },
          ]}
        />
      )}
      {activeTab === "working_papers" && (
        <GenericCrudTab
          title="Working Papers"
          endpoint="working-papers"
          columns={[
            { key: "title", label: "Title" },
            { key: "review_status", label: "Review Status", render: (v) => <StatusBadge status={v} /> },
          ]}
          createFields={[
            { key: "title", label: "Title", required: true },
            { key: "description", label: "Description" },
            { key: "evidence_notes", label: "Evidence Notes" },
          ]}
        />
      )}
      {activeTab === "data_sources" && (
        <GenericCrudTab
          title="Data Sources"
          endpoint="data-sources"
          columns={[
            { key: "name", label: "Name" },
            { key: "source_type", label: "Type" },
            { key: "is_active", label: "Active", render: (v) => v ? "Yes" : "No" },
          ]}
          createFields={[
            { key: "name", label: "Name", required: true },
            { key: "source_type", label: "Source Type" },
            { key: "description", label: "Description" },
          ]}
        />
      )}
      {activeTab === "sampling" && (
        <GenericCrudTab
          title="Sampling"
          endpoint="sampling"
          columns={[
            { key: "name", label: "Name" },
            { key: "sample_type", label: "Type" },
            { key: "population_size", label: "Population" },
            { key: "sample_size", label: "Sample Size" },
          ]}
          createFields={[
            { key: "name", label: "Name", required: true },
            { key: "description", label: "Description" },
            { key: "sample_type", label: "Sample Type" },
            { key: "population_size", label: "Population Size", type: "number" },
            { key: "sample_size", label: "Sample Size", type: "number" },
          ]}
        />
      )}
      {activeTab === "ownership" && (
        <GenericCrudTab
          title="Ownership"
          endpoint="ownership"
          columns={[
            { key: "user_id", label: "User ID" },
            { key: "role_type", label: "Role" },
            { key: "department", label: "Department" },
            { key: "is_active", label: "Active", render: (v) => v ? "Yes" : "No" },
          ]}
          createFields={[
            { key: "user_id", label: "User ID", type: "number", required: true },
            { key: "role_type", label: "Role Type" },
            { key: "department", label: "Department" },
            { key: "responsibilities", label: "Responsibilities" },
          ]}
        />
      )}
      {activeTab === "departments" && (
        <GenericCrudTab
          title="Departments"
          endpoint="departments"
          columns={[
            { key: "name", label: "Name" },
            { key: "code", label: "Code" },
            { key: "is_active", label: "Active", render: (v) => v ? "Yes" : "No" },
          ]}
          createFields={[
            { key: "name", label: "Name", required: true },
            { key: "code", label: "Code", required: true },
          ]}
        />
      )}
      {activeTab === "announcements" && (
        <GenericCrudTab
          title="Announcements"
          endpoint="announcements"
          columns={[
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            { key: "is_published", label: "Published", render: (v) => v ? "Yes" : "No" },
          ]}
          createFields={[
            { key: "title", label: "Title", required: true },
            { key: "content", label: "Content" },
            { key: "priority", label: "Priority" },
          ]}
        />
      )}
      {activeTab === "audit_logs" && <AuditLogsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </div>
  );
}
