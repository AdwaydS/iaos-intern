import { useEffect, useState } from "react";
import { api, get, post, del } from "../../lib/api";

const put = <T>(p: string, data?: unknown) =>
  api<T>(p, { method: "PUT", body: JSON.stringify(data ?? {}) });

const SLUG = "engagement_fieldwork";

interface Engagement {
  id: number;
  title: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

interface ScopingMemo {
  id: number;
  engagement_id: number;
  background: string;
  scope_limitations: string;
  objectives_summary: string;
  status: string;
  review_notes: string;
  created_by: string;
  reviewed_by?: string;
  approved_by?: string;
}

interface ProgrammeItem {
  id: number;
  engagement_id: number;
  objective: string;
  risk_area: string;
  procedures: string;
}

interface FieldworkTask {
  id: number;
  engagement_id: number;
  programme_item_id?: number;
  title: string;
  description: string;
  assigned_to?: string;
  status: string;
  doc_link?: string;
}

interface TimeLog {
  id: number;
  engagement_id: number;
  task_id: number;
  auditor_email: string;
  hours: number;
  date: string;
  description: string;
}

interface QualityReview {
  id: number;
  engagement_id: number;
  reviewer_email?: string;
  status: string;
  review_notes: string;
  sign_off_date?: string;
  checks_completed: Record<string, boolean>;
}

export default function EngagementFieldworkPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEng, setSelectedEng] = useState<Engagement | null>(null);
  const [activeTab, setActiveTab] = useState<"scoping" | "programme" | "tasks" | "time" | "quality">("scoping");

  // Error/Success alerts
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  // Form states
  const [newEng, setNewEng] = useState({ title: "", description: "" });
  const [scopingForm, setScopingForm] = useState({ background: "", scope_limitations: "", objectives_summary: "" });
  const [scopingMemo, setScopingMemo] = useState<ScopingMemo | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const [progItems, setProgItems] = useState<ProgrammeItem[]>([]);
  const [newProgItem, setNewProgItem] = useState({ objective: "", risk_area: "", procedures: "" });

  const [tasks, setTasks] = useState<FieldworkTask[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    status: "To Do",
    programme_item_id: "",
    doc_link: "",
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [newTimeLog, setNewTimeLog] = useState({
    task_id: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [qualityReviews, setQualityReviews] = useState<QualityReview[]>([]);
  const [newQR, setNewQR] = useState({ reviewer_email: "", review_notes: "" });
  const [checks, setChecks] = useState({
    all_procedures_executed: false,
    working_papers_referenced: false,
    findings_documented: false,
  });

  // Load all engagements on mount
  useEffect(() => {
    loadEngagements();
  }, []);

  // Reload selected engagement details whenever it changes or active tab changes
  useEffect(() => {
    if (selectedEng) {
      loadTabContent();
    }
  }, [selectedEng, activeTab]);

  async function loadEngagements() {
    try {
      const data = await get<Engagement[]>(`/api/modules/${SLUG}/engagements`);
      setEngagements(data);
      if (data.length > 0 && !selectedEng) {
        setSelectedEng(data[0]);
      }
    } catch (err: any) {
      triggerAlert("danger", "Failed to load engagements");
    }
  }

  async function loadTabContent() {
    if (!selectedEng) return;
    try {
      if (activeTab === "scoping") {
        try {
          const data = await get<ScopingMemo>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/scoping-memo`);
          setScopingMemo(data);
          setScopingForm({
            background: data.background,
            scope_limitations: data.scope_limitations,
            objectives_summary: data.objectives_summary,
          });
        } catch {
          setScopingMemo(null);
          setScopingForm({ background: "", scope_limitations: "", objectives_summary: "" });
        }
      } else if (activeTab === "programme") {
        const data = await get<ProgrammeItem[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/programme-items`);
        setProgItems(data);
      } else if (activeTab === "tasks") {
        const t = await get<FieldworkTask[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/tasks`);
        setTasks(t);
        // Also fetch programme items to populate dropdown selection
        const p = await get<ProgrammeItem[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/programme-items`);
        setProgItems(p);
      } else if (activeTab === "time") {
        const l = await get<TimeLog[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/time-logs`);
        setTimeLogs(l);
        const t = await get<FieldworkTask[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/tasks`);
        setTasks(t.filter(task => task.status !== "To Do"));
      } else if (activeTab === "quality") {
        const q = await get<QualityReview[]>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/quality-reviews`);
        setQualityReviews(q);
      }
    } catch (err: any) {
      triggerAlert("danger", "Failed to load tab details");
    }
  }

  function triggerAlert(type: "success" | "danger", message: string) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }

  async function handleCreateEngagement(e: React.FormEvent) {
    e.preventDefault();
    if (!newEng.title.trim()) return;
    try {
      const created = await post<Engagement>(`/api/modules/${SLUG}/engagements`, newEng);
      setNewEng({ title: "", description: "" });
      triggerAlert("success", "Audit engagement created!");
      await loadEngagements();
      setSelectedEng(created);
      setActiveTab("scoping");
    } catch (err: any) {
      triggerAlert("danger", "Failed to create engagement");
    }
  }

  async function handleSaveScopingMemo(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEng) return;
    try {
      const data = await post<ScopingMemo>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/scoping-memo`, scopingForm);
      setScopingMemo(data);
      triggerAlert("success", "Scoping memo saved successfully.");
    } catch (err: any) {
      triggerAlert("danger", "Failed to save scoping memo");
    }
  }

  async function handleTransitionScoping(action: "submit" | "approve" | "reject") {
    if (!selectedEng) return;
    try {
      let data: ScopingMemo;
      if (action === "submit") {
        data = await post<ScopingMemo>(`/api/modules/${SLUG}/engagements/${selectedEng.id}/scoping-memo/submit`);
      } else {
        data = await post<ScopingMemo>(
          `/api/modules/${SLUG}/engagements/${selectedEng.id}/scoping-memo/${action}`,
          { review_notes: reviewNotes }
        );
      }
      setScopingMemo(data);
      setReviewNotes("");
      triggerAlert("success", `Scoping memo status updated to: ${data.status}`);
      // Refresh selected engagement state in parent list
      await loadEngagements();
      const updatedEng = await get<Engagement>(`/api/modules/${SLUG}/engagements/${selectedEng.id}`);
      setSelectedEng(updatedEng);
    } catch (err: any) {
      const detail = err.response?.data?.detail || `Failed to ${action} scoping memo`;
      triggerAlert("danger", detail);
    }
  }

  async function handleAddProgItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEng || !newProgItem.objective.trim()) return;
    try {
      await post(`/api/modules/${SLUG}/engagements/${selectedEng.id}/programme-items`, newProgItem);
      setNewProgItem({ objective: "", risk_area: "", procedures: "" });
      triggerAlert("success", "Audit program item added.");
      loadTabContent();
    } catch (err: any) {
      triggerAlert("danger", "Failed to add audit program item");
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEng || !newTask.title.trim()) return;
    try {
      const payload: any = { ...newTask };
      if (payload.programme_item_id) {
        payload.programme_item_id = Number(payload.programme_item_id);
      } else {
        delete payload.programme_item_id;
      }
      if (!payload.doc_link) delete payload.doc_link;
      if (!payload.assigned_to) delete payload.assigned_to;

      await post(`/api/modules/${SLUG}/engagements/${selectedEng.id}/tasks`, payload);
      setNewTask({ title: "", description: "", assigned_to: "", status: "To Do", programme_item_id: "", doc_link: "" });
      triggerAlert("success", "Fieldwork task created.");
      loadTabContent();
      // Reload engagements in case status changed to Fieldwork
      loadEngagements();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to create fieldwork task. Make sure Scoping Memo is Approved first.";
      triggerAlert("danger", msg);
    }
  }

  async function handleUpdateTaskStatus(taskId: number, statusVal: string) {
    try {
      await put(`/api/modules/${SLUG}/tasks/${taskId}`, { status: statusVal });
      triggerAlert("success", "Task status updated.");
      loadTabContent();
      loadEngagements();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to update task status. Make sure Scoping Memo is Approved.";
      triggerAlert("danger", msg);
    }
  }

  async function handleAddTimeLog(e: React.FormEvent) {
    e.preventDefault();
    if (!newTimeLog.task_id || !newTimeLog.hours) return;
    try {
      await post(`/api/modules/${SLUG}/tasks/${newTimeLog.task_id}/time-logs`, {
        hours: Number(newTimeLog.hours),
        date: newTimeLog.date,
        description: newTimeLog.description,
      });
      setNewTimeLog({ task_id: "", hours: "", date: new Date().toISOString().split("T")[0], description: "" });
      triggerAlert("success", "Time log logged successfully!");
      loadTabContent();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to log time.";
      triggerAlert("danger", msg);
    }
  }

  async function handleInitiateQualityReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEng) return;
    try {
      await post(`/api/modules/${SLUG}/engagements/${selectedEng.id}/quality-reviews`, newQR);
      setNewQR({ reviewer_email: "", review_notes: "" });
      triggerAlert("success", "Quality review initiated.");
      loadTabContent();
      loadEngagements();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to initiate review. Ensure Scoping Memo is Approved.";
      triggerAlert("danger", msg);
    }
  }

  async function handleQRSignoff(reviewId: number, statusVal: "Passed" | "Failed") {
    try {
      await post(`/api/modules/${SLUG}/quality-reviews/${reviewId}/sign-off`, {
        reviewer_email: scopingMemo?.approved_by || "reviewer@capcorp.com",
        status: statusVal,
        review_notes: `Review outcome set to ${statusVal}. Checked status checklist.`,
        checks_completed: checks,
      });
      triggerAlert("success", `Quality Review completed with status: ${statusVal}`);
      loadTabContent();
      loadEngagements();
    } catch (err: any) {
      triggerAlert("danger", "Failed to complete quality review sign-off");
    }
  }

  function getStatusColor(statusStr: string) {
    switch (statusStr) {
      case "Approved":
      case "Passed":
      case "Completed":
        return "badge-success";
      case "Rejected":
      case "Failed":
        return "badge-danger";
      case "Under Review":
      case "QualityReview":
      case "Fieldwork":
        return "badge-gold";
      default:
        return "badge-slate";
    }
  }

  return (
    <div style={{ padding: "10px 0" }}>
      {/* Dynamic Alert */}
      {alert && (
        <div className={`alert ${alert.type === "danger" ? "alert-danger" : ""}`} style={{
          position: "sticky", top: 10, zIndex: 100,
          background: alert.type === "success" ? "var(--success-tint)" : "var(--danger-tint)",
          color: alert.type === "success" ? "var(--success)" : "var(--danger)",
          border: `1px solid ${alert.type === "success" ? "rgba(18, 128, 92, 0.2)" : "rgba(180, 35, 24, 0.2)"}`,
          padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 16
        }}>
          {alert.message}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Column: Engagements Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* New Engagement Form */}
          <form className="card" style={{ padding: 18 }} onSubmit={handleCreateEngagement}>
            <h4 style={{ marginBottom: 12, color: "var(--navy)" }}>New Engagement</h4>
            <div className="field">
              <label>Audit Title</label>
              <input
                className="input"
                placeholder="e.g. FY26 Procurement Audit"
                value={newEng.title}
                onChange={(e) => setNewEng({ ...newEng, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Description</label>
              <input
                className="input"
                placeholder="Audit scope summary..."
                value={newEng.description}
                onChange={(e) => setNewEng({ ...newEng, description: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" style={{ padding: "8px 12px" }}>Create</button>
          </form>

          {/* Engagement List Selection */}
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ marginBottom: 12, color: "var(--navy)" }}>Engagements</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {engagements.map((eng) => (
                <div
                  key={eng.id}
                  onClick={() => {
                    setSelectedEng(eng);
                    setActiveTab("scoping");
                  }}
                  style={{
                    padding: 12,
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${selectedEng?.id === eng.id ? "var(--navy)" : "var(--line)"}`,
                    background: selectedEng?.id === eng.id ? "var(--navy-tint)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)" }}>{eng.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span className={`badge ${getStatusColor(eng.status)}`} style={{ scale: "0.85", originX: "0" }}>
                      {eng.status}
                    </span>
                  </div>
                </div>
              ))}
              {engagements.length === 0 && (
                <div style={{ color: "var(--slate-soft)", textAlign: "center", padding: 10, fontSize: 13 }}>
                  No engagements created.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Workspace & Workflow details */}
        {selectedEng ? (
          <div>
            {/* Header Area */}
            <div className="card" style={{ padding: 20, marginBottom: 24, background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h2 style={{ fontSize: 22, color: "var(--navy)" }}>{selectedEng.title}</h2>
                  <p style={{ color: "var(--slate)", fontSize: 14, marginTop: 4 }}>{selectedEng.description || "No description provided."}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: 6 }}>
                  <span className="badge badge-slate" style={{ fontSize: 11 }}>Engagement ID: #{selectedEng.id}</span>
                  <span className={`badge ${getStatusColor(selectedEng.status)}`} style={{ fontSize: 13, padding: "4px 12px" }}>
                    Stage: {selectedEng.status}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: 10, marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                {[
                  { id: "scoping", label: "Scoping Memo" },
                  { id: "programme", label: "Audit Programme" },
                  { id: "tasks", label: "Fieldwork Tasks" },
                  { id: "time", label: "Time Tracking" },
                  { id: "quality", label: "Quality Review" }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`btn ${activeTab === t.id ? "btn-primary" : "btn-ghost"}`}
                    style={{ padding: "8px 16px", fontSize: 13.5 }}
                    onClick={() => setActiveTab(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT WORKSPACES */}

            {/* Tab 1: Scoping Memo */}
            {activeTab === "scoping" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                
                {/* Form to Draft Scoping Memo */}
                <form className="card" style={{ padding: 22 }} onSubmit={handleSaveScopingMemo}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Audit Scoping Details</h3>
                  <div className="field">
                    <label>Background Context</label>
                    <textarea
                      className="input"
                      rows={3}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={scopingForm.background}
                      onChange={(e) => setScopingForm({ ...scopingForm, background: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Scope Limitations & Exclusions</label>
                    <textarea
                      className="input"
                      rows={3}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={scopingForm.scope_limitations}
                      onChange={(e) => setScopingForm({ ...scopingForm, scope_limitations: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Objectives Summary</label>
                    <textarea
                      className="input"
                      rows={3}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={scopingForm.objectives_summary}
                      onChange={(e) => setScopingForm({ ...scopingForm, objectives_summary: e.target.value })}
                      required
                    />
                  </div>
                  {(!scopingMemo || scopingMemo.status === "Draft" || scopingMemo.status === "Rejected") && (
                    <button className="btn btn-primary" style={{ padding: "9px 20px" }}>Save Draft</button>
                  )}
                </form>

                {/* Scoping Memo Status & Workflow Actions */}
                <div className="card" style={{ padding: 22, height: "fit-content" }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Memo Review Status</h3>
                  
                  {scopingMemo ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontSize: 14, color: "var(--slate)" }}>Approval State:</span>
                        <span className={`badge ${getStatusColor(scopingMemo.status)}`}>{scopingMemo.status}</span>
                      </div>
                      
                      <div style={{ fontSize: 13.5, color: "var(--ink)", marginBottom: 12 }}>
                        <div><strong>Created By:</strong> {scopingMemo.created_by}</div>
                        {scopingMemo.approved_by && <div><strong>Approved By:</strong> {scopingMemo.approved_by}</div>}
                        {scopingMemo.reviewed_by && <div><strong>Reviewed By:</strong> {scopingMemo.reviewed_by}</div>}
                        {scopingMemo.review_notes && (
                          <div style={{ marginTop: 8, padding: 10, background: "var(--canvas)", borderRadius: "var(--radius-sm)" }}>
                            <strong>Reviewer Notes:</strong> {scopingMemo.review_notes}
                          </div>
                        )}
                      </div>

                      {/* Transition Actions */}
                      <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                        {(scopingMemo.status === "Draft" || scopingMemo.status === "Rejected") && (
                          <button
                            className="btn btn-gold btn-block"
                            onClick={() => handleTransitionScoping("submit")}
                          >
                            Submit for Review
                          </button>
                        )}
                        {scopingMemo.status === "Under Review" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div className="field">
                              <label>Review Notes / Comments</label>
                              <input
                                className="input"
                                placeholder="Add optional comments..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                className="btn btn-primary"
                                style={{ flex: 1, padding: "8px" }}
                                onClick={() => handleTransitionScoping("approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-ghost"
                                style={{ flex: 1, color: "var(--danger)", borderColor: "rgba(180, 35, 24, 0.2)", padding: "8px" }}
                                onClick={() => handleTransitionScoping("reject")}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "var(--slate-soft)", fontSize: 13.5 }}>
                      No scoping memo draft has been created for this engagement yet. Complete and save the details form to register it.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Audit Programme */}
            {activeTab === "programme" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                
                {/* List of Programme Items */}
                <div className="card" style={{ padding: 22, height: "fit-content" }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Objectives & Procedures</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {progItems.map((item) => (
                      <div key={item.id} style={{
                        padding: 14, border: "1px solid var(--line)",
                        borderRadius: "var(--radius)", background: "var(--canvas)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <h4 style={{ fontSize: 14, color: "var(--navy)" }}>Objective: {item.objective}</h4>
                          <span className="badge badge-slate" style={{ scale: "0.85" }}>#{item.id}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>
                          <strong>Risk Area:</strong> {item.risk_area}
                        </div>
                        <div style={{
                          fontSize: 13, color: "var(--ink)", marginTop: 10,
                          whiteSpace: "pre-line", borderTop: "1px dashed var(--line)", paddingTop: 8
                        }}>
                          <strong>Test Procedures:</strong><br />
                          {item.procedures}
                        </div>
                      </div>
                    ))}
                    {progItems.length === 0 && (
                      <div style={{ color: "var(--slate-soft)", textAlign: "center", padding: 20 }}>
                        No audit program items defined.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to Add Programme Item */}
                <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={handleAddProgItem}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Add Program Objective</h3>
                  <div className="field">
                    <label>Audit Objective</label>
                    <input
                      className="input"
                      placeholder="e.g. Ensure physical inventory count accuracy"
                      value={newProgItem.objective}
                      onChange={(e) => setNewProgItem({ ...newProgItem, objective: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Risk Area</label>
                    <input
                      className="input"
                      placeholder="e.g. Shrinkage or inventory valuation error"
                      value={newProgItem.risk_area}
                      onChange={(e) => setNewProgItem({ ...newProgItem, risk_area: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Test Procedures</label>
                    <textarea
                      className="input"
                      placeholder="Describe audit test steps..."
                      rows={5}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={newProgItem.procedures}
                      onChange={(e) => setNewProgItem({ ...newProgItem, procedures: e.target.value })}
                      required
                    />
                  </div>
                  <button className="btn btn-primary btn-block">Add Objective</button>
                </form>
              </div>
            )}

            {/* Tab 3: Fieldwork Tasks */}
            {activeTab === "tasks" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                
                {/* List of Tasks */}
                <div className="card" style={{ padding: 22, height: "fit-content" }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Task Tracking</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {tasks.map((task) => (
                      <div key={task.id} style={{
                        padding: 14, border: "1px solid var(--line)",
                        borderRadius: "var(--radius)", background: "var(--surface)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <h4 style={{ fontSize: 14, color: "var(--navy)" }}>{task.title}</h4>
                          <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>{task.description}</p>
                        
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, fontSize: 12.5, color: "var(--slate-soft)" }}>
                          {task.assigned_to && <div>👤 Assigned: {task.assigned_to}</div>}
                          {task.programme_item_id && <div>📋 Program Link: #{task.programme_item_id}</div>}
                          {task.doc_link && (
                            <div>
                              🔗 <a href={task.doc_link} target="_blank" rel="noreferrer" style={{ color: "var(--gold)", textDecoration: "underline" }}>
                                Document Link
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Status Toggle Actions */}
                        <div style={{ display: "flex", gap: 6, marginTop: 12, borderTop: "1px solid var(--line-soft)", paddingTop: 10 }}>
                          {["To Do", "In Progress", "Review Required", "Done"].map(st => (
                            <button
                              key={st}
                              onClick={() => handleUpdateTaskStatus(task.id, st)}
                              disabled={task.status === st}
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                border: `1px solid ${task.status === st ? "var(--navy)" : "var(--line)"}`,
                                background: task.status === st ? "var(--navy-tint)" : "var(--surface)",
                                color: task.status === st ? "var(--navy)" : "var(--slate)"
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div style={{ color: "var(--slate-soft)", textAlign: "center", padding: 20 }}>
                        No fieldwork tasks created yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to Add Task */}
                <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={handleAddTask}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Add Fieldwork Task</h3>
                  <div className="field">
                    <label>Task Title</label>
                    <input
                      className="input"
                      placeholder="e.g. Obtain ledger reconciliations"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea
                      className="input"
                      placeholder="Describe what needs to be verified..."
                      rows={3}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Program Objective Association</label>
                    <select
                      className="select"
                      value={newTask.programme_item_id}
                      onChange={(e) => setNewTask({ ...newTask, programme_item_id: e.target.value })}
                    >
                      <option value="">-- No Association --</option>
                      {progItems.map(p => (
                        <option key={p.id} value={p.id}>Objective #{p.id}: {p.objective}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Assigned Auditor Email</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="auditor@capcorp.com"
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Documentation URL (Start with http:// or https://)</label>
                    <input
                      className="input"
                      placeholder="https://sharepoint.com/audits/recs"
                      value={newTask.doc_link}
                      onChange={(e) => setNewTask({ ...newTask, doc_link: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-primary btn-block">Add Task</button>
                </form>
              </div>
            )}

            {/* Tab 4: Time Tracking */}
            {activeTab === "time" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                
                {/* List of Time Logs */}
                <div className="card" style={{ padding: 22, height: "fit-content" }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Time logs</h3>
                  <table style={{ minWidth: "100%" }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Task / Description</th>
                        <th>Hours</th>
                        <th>Auditor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ whiteSpace: "nowrap" }}>{log.date}</td>
                          <td>
                            <strong>Task #{log.task_id}</strong>
                            <div style={{ fontSize: 12, color: "var(--slate)" }}>{log.description}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{log.hours} hrs</td>
                          <td style={{ fontSize: 12, color: "var(--slate-soft)" }}>{log.auditor_email}</td>
                        </tr>
                      ))}
                      {timeLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ color: "var(--slate-soft)", textAlign: "center", padding: 20 }}>
                            No logged hours found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Form to Log Time */}
                <form className="card" style={{ padding: 22, height: "fit-content" }} onSubmit={handleAddTimeLog}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Log Auditor Hours</h3>
                  <div className="field">
                    <label>Select Fieldwork Task (Only active tasks shown)</label>
                    <select
                      className="select"
                      value={newTimeLog.task_id}
                      onChange={(e) => setNewTimeLog({ ...newTimeLog, task_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Task --</option>
                      {tasks.map(t => (
                        <option key={t.id} value={t.id}>Task #{t.id}: {t.title} ({t.status})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Hours Spent</label>
                      <input
                        className="input"
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        placeholder="e.g. 4.5"
                        value={newTimeLog.hours}
                        onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Date</label>
                      <input
                        className="input"
                        type="date"
                        value={newTimeLog.date}
                        onChange={(e) => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Work Description</label>
                    <input
                      className="input"
                      placeholder="Details of audit steps performed..."
                      value={newTimeLog.description}
                      onChange={(e) => setNewTimeLog({ ...newTimeLog, description: e.target.value })}
                    />
                  </div>
                  <button className="btn btn-primary btn-block">Log Time</button>
                </form>
              </div>
            )}

            {/* Tab 5: Quality Review */}
            {activeTab === "quality" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
                
                {/* List of Reviews & Checklists */}
                <div className="card" style={{ padding: 22, height: "fit-content" }}>
                  <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Quality Reviews</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {qualityReviews.map((qr) => (
                      <div key={qr.id} style={{
                        padding: 16, border: "1px solid var(--line)",
                        borderRadius: "var(--radius)", background: "var(--canvas)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "var(--slate-soft)" }}>Review ID: #{qr.id}</span>
                          <span className={`badge ${getStatusColor(qr.status)}`}>{qr.status}</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 10 }}>
                          <div><strong>Reviewer:</strong> {qr.reviewer_email || "Not assigned"}</div>
                          <div><strong>Notes:</strong> {qr.review_notes || "—"}</div>
                        </div>

                        {/* Sign-off checklist indicators */}
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                          <strong>Completed Checkpoints:</strong>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: qr.checks_completed.all_procedures_executed ? "var(--success)" : "var(--slate)" }}>
                            {qr.checks_completed.all_procedures_executed ? "✅" : "❌"} All audit procedures executed
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: qr.checks_completed.working_papers_referenced ? "var(--success)" : "var(--slate)" }}>
                            {qr.checks_completed.working_papers_referenced ? "✅" : "❌"} Working papers and evidence referenced
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, color: qr.checks_completed.findings_documented ? "var(--success)" : "var(--slate)" }}>
                            {qr.checks_completed.findings_documented ? "✅" : "❌"} Audit findings documented in registers
                          </div>
                        </div>

                        {/* Sign-off buttons for Reviewers if Pending */}
                        {qr.status === "Pending" && (
                          <div style={{ display: "flex", gap: 10, marginTop: 16, borderTop: "1px solid var(--line-soft)", paddingTop: 12 }}>
                            <button
                              className="btn btn-primary"
                              style={{ flex: 1, padding: "8px" }}
                              onClick={() => handleQRSignoff(qr.id, "Passed")}
                            >
                              Sign-off: Pass
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ flex: 1, color: "var(--danger)", borderColor: "rgba(180, 35, 24, 0.2)", padding: "8px" }}
                              onClick={() => handleQRSignoff(qr.id, "Failed")}
                            >
                              Sign-off: Fail
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {qualityReviews.length === 0 && (
                      <div style={{ color: "var(--slate-soft)", textAlign: "center", padding: 20 }}>
                        No quality review cycles started.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form to Initiate Quality Review */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <form className="card" style={{ padding: 22 }} onSubmit={handleInitiateQualityReview}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, color: "var(--navy)" }}>Initiate Quality Review</h3>
                    <div className="field">
                      <label>Reviewer Email</label>
                      <input
                        className="input"
                        type="email"
                        placeholder="reviewer@capcorp.com"
                        value={newQR.reviewer_email}
                        onChange={(e) => setNewQR({ ...newQR, reviewer_email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Scope & Instructions</label>
                      <input
                        className="input"
                        placeholder="e.g. Conduct quality review checks before close"
                        value={newQR.review_notes}
                        onChange={(e) => setNewQR({ ...newQR, review_notes: e.target.value })}
                      />
                    </div>
                    <button className="btn btn-primary btn-block">Initiate Review</button>
                  </form>

                  {/* Checklist Options */}
                  <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ marginBottom: 14, fontSize: 16, color: "var(--navy)" }}>Sign-off Checkpoints</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13.5 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={checks.all_procedures_executed}
                          onChange={(e) => setChecks({ ...checks, all_procedures_executed: e.target.checked })}
                        />
                        All procedures executed
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={checks.working_papers_referenced}
                          onChange={(e) => setChecks({ ...checks, working_papers_referenced: e.target.checked })}
                        />
                        Working papers referenced
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={checks.findings_documented}
                          onChange={(e) => setChecks({ ...checks, findings_documented: e.target.checked })}
                        />
                        Findings documented in registers
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate-soft)" }}>
            Select an audit engagement from the left panel, or create a new one to begin.
          </div>
        )}
      </div>
    </div>
  );
}
