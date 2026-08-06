import React, { useState, useEffect, useRef } from "react";
import {
  Building,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Layers,
  Search,
  Database,
  Scale,
  Plus,
  ArrowRight,
  User,
  Settings,
  Info,
  Check,
  X,
  FileCheck,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Briefcase,
  Sliders,
  Terminal,
  Upload,
  Download,
  Trash2,
} from "lucide-react";
import { get, post } from "../../lib/api";
import "./InvestmentsPage.css";


// Types matching backend
interface InvestmentsException {
  id: string;
  module: string;
  security: string;
  amount: string;
  exception: string;
  date: string;
  severity: string;
  status: string;
}

interface SectorGuardrail {
  id: number;
  sector: string;
  limit_pct: number;
  current_pct: number;
  status: string;
}

interface ComplianceTrendPoint {
  id: number;
  month: string;
  score: number;
  exceptions_count: number;
}

interface WorkingPaperDoc {
  id: string;
  name: string;
  refTask: string;
  attachedBy: string;
  uploadDate: string;
  size: string;
  status: "Approved by Lead" | "Awaiting Review" | "Needs Revision";
  fileUrl?: string;
  fileType?: string;
}

interface ReconItem {
  id: string;
  name: string;
  erpQty: string;
  custodianQty: string;
  difference: string;
  erpValue: string;
  custodianValue: string;
  status: "Match" | "Unreconciled";
}

interface AuditableUnit {
  id: string;
  unit: string;
  riskCategory: "High Risk" | "Medium Risk" | "Low Risk";
  lastAuditDate: string;
  leadAuditor: string;
  inScope: string;
}

interface AuditFinding {
  id: string;
  ref: string;
  severity: "High Severity" | "Medium Severity" | "Low Severity";
  title: string;
  description: string;
  owner: string;
  targetCloseDate: string;
  status: "Open" | "In Review" | "Resolved";
}

const INITIAL_WORKING_PAPERS: WorkingPaperDoc[] = [
  {
    id: "wp-1",
    name: "Demat_Custodian_Stmt_June2026.pdf",
    refTask: "Holdings vs Custodian Reconciliation",
    attachedBy: "John Doe",
    uploadDate: "2026-07-02",
    size: "12.4 MB",
    status: "Approved by Lead",
  },
  {
    id: "wp-2",
    name: "Bloomberg_Price_Validation_Q2.xlsx",
    refTask: "Valuation & Fair-Value Testing",
    attachedBy: "Sarah Jenkins",
    uploadDate: "2026-07-05",
    size: "4.2 MB",
    status: "Awaiting Review",
  },
];

const INITIAL_RECON_ITEMS: ReconItem[] = [
  {
    id: "rec-1",
    name: "Microsoft Corp Note 2029",
    erpQty: "15,000",
    custodianQty: "15,000",
    difference: "0",
    erpValue: "$15,000,000",
    custodianValue: "$15,000,000",
    status: "Match",
  },
  {
    id: "rec-2",
    name: "Tesla Inc Note 2028",
    erpQty: "12,500",
    custodianQty: "12,500",
    difference: "0",
    erpValue: "$12,500,000",
    custodianValue: "$12,500,000",
    status: "Match",
  },
  {
    id: "rec-3",
    name: "Evergreen Real Estate Trust",
    erpQty: "4,200",
    custodianQty: "4,000",
    difference: "+200",
    erpValue: "$4,200,000",
    custodianValue: "$4,000,000",
    status: "Unreconciled",
  },
  {
    id: "rec-4",
    name: "Vertex Pharma Paper",
    erpQty: "8,000",
    custodianQty: "8,000",
    difference: "0",
    erpValue: "$8,000,000",
    custodianValue: "$8,000,000",
    status: "Match",
  },
];

const INITIAL_AUDITABLE_UNITS: AuditableUnit[] = [
  {
    id: "unit-1",
    unit: "Corporate Treasury Operations",
    riskCategory: "High Risk",
    lastAuditDate: "2025-06-30",
    leadAuditor: "Sarah Jenkins",
    inScope: "Yes (Primary)",
  },
  {
    id: "unit-2",
    unit: "Offshore Subsidiary Holdings",
    riskCategory: "Medium Risk",
    lastAuditDate: "2025-12-15",
    leadAuditor: "David Miller",
    inScope: "Yes",
  },
  {
    id: "unit-3",
    unit: "Commercial Paper Liquidity Pool",
    riskCategory: "Low Risk",
    lastAuditDate: "2024-11-22",
    leadAuditor: "Emily Watson",
    inScope: "No (Cycle Out)",
  },
];

const INITIAL_FINDINGS: AuditFinding[] = [
  {
    id: "find-1",
    ref: "OBS-INV-001",
    severity: "High Severity",
    title: "Lack of board committee resolution for investment transaction above delegated limit.",
    description: "Tesla Inc. corporate debt purchase of $12.5M was executed with CFO authorization only, breaching the delegated authority cap of $5M.",
    owner: "CFO Office",
    targetCloseDate: "2026-08-30",
    status: "Open",
  },
  {
    id: "find-2",
    ref: "OBS-INV-002",
    severity: "Medium Severity",
    title: "Credit Rating Downgrade not monitored under IPS constraints.",
    description: "Vertex Pharma commercial paper downgraded to BBB+, falling below investment policy guidelines without timely exit or special waiver.",
    owner: "Risk Management Desk",
    targetCloseDate: "2026-09-15",
    status: "In Review",
  },
];

export default function InvestmentsAuditPage() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>("dashboard_kpis");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Data States
  const [exceptions, setExceptions] = useState<InvestmentsException[]>([]);
  const [guardrails, setGuardrails] = useState<SectorGuardrail[]>([]);
  const [trends, setTrends] = useState<ComplianceTrendPoint[]>([]);
  
  // Working Papers & Evidence States
  const [workingPapers, setWorkingPapers] = useState<WorkingPaperDoc[]>(() => {
    try {
      const saved = localStorage.getItem("investments_working_papers");
      return saved ? JSON.parse(saved) : INITIAL_WORKING_PAPERS;
    } catch {
      return INITIAL_WORKING_PAPERS;
    }
  });
  const [wpRefTask, setWpRefTask] = useState<string>("Holdings vs Custodian Reconciliation");
  const [wpSearch, setWpSearch] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("investments_working_papers", JSON.stringify(workingPapers));
    } catch (e) {
      console.error(e);
    }
  }, [workingPapers]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newDocs: WorkingPaperDoc[] = [];

    for (const file of fileArray) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 25MB limit.`);
        continue;
      }

      const fileUrl = URL.createObjectURL(file);
      const today = new Date().toISOString().split("T")[0];

      newDocs.push({
        id: "wp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        name: file.name,
        refTask: wpRefTask,
        attachedBy: "Current Auditor",
        uploadDate: today,
        size: formatBytes(file.size),
        status: "Awaiting Review",
        fileUrl: fileUrl,
        fileType: file.type,
      });
    }

    if (newDocs.length > 0) {
      setWorkingPapers((prev) => [...newDocs, ...prev]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const toggleSignOff = (id: string) => {
    setWorkingPapers((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) return doc;
        const nextStatus: WorkingPaperDoc["status"] =
          doc.status === "Approved by Lead"
            ? "Awaiting Review"
            : doc.status === "Awaiting Review"
            ? "Needs Revision"
            : "Approved by Lead";
        return { ...doc, status: nextStatus };
      })
    );
  };

  const deleteDocument = (id: string) => {
    if (window.confirm("Are you sure you want to remove this working paper document?")) {
      setWorkingPapers((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  const downloadDocument = (doc: WorkingPaperDoc) => {
    if (doc.fileUrl) {
      const a = document.createElement("a");
      a.href = doc.fileUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Simulating file view/download for "${doc.name}"`);
    }
  };

  // 1. Holdings vs Custodian Reconciliation State & Logic
  const [reconItems, setReconItems] = useState<ReconItem[]>(() => {
    try {
      const saved = localStorage.getItem("investments_recon_items");
      return saved ? JSON.parse(saved) : INITIAL_RECON_ITEMS;
    } catch {
      return INITIAL_RECON_ITEMS;
    }
  });
  const [isRefreshingRecon, setIsRefreshingRecon] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [syncBannerMsg, setSyncBannerMsg] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem("investments_recon_items", JSON.stringify(reconItems));
    } catch (e) {
      console.error(e);
    }
  }, [reconItems]);

  const handleRefreshLedger = () => {
    setIsRefreshingRecon(true);
    setSyncBannerMsg("");

    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(`Today at ${nowStr}`);

      // Re-sync items: align custodian balances to ERP ledgers and mark matched
      setReconItems((prev) =>
        prev.map((item) => {
          if (item.status === "Unreconciled") {
            return {
              ...item,
              custodianQty: item.erpQty,
              custodianValue: item.erpValue,
              difference: "0",
              status: "Match",
            };
          }
          return item;
        })
      );

      setIsRefreshingRecon(false);
      setSyncBannerMsg("✓ Real-time Custody API sync completed (NSDL/CDSL/BNY Mellon). All holdings balances and quantities reconciled.");

      setTimeout(() => {
        setSyncBannerMsg("");
      }, 5000);
    }, 1000);
  };

  const handleResetRecon = () => {
    setReconItems(INITIAL_RECON_ITEMS);
    setSyncBannerMsg("Reset reconciliation data to initial demo state.");
    setTimeout(() => setSyncBannerMsg(""), 3000);
  };

  // 2. Scope & Audit Universe State & Logic
  const [auditableUnits, setAuditableUnits] = useState<AuditableUnit[]>(() => {
    try {
      const saved = localStorage.getItem("investments_auditable_units");
      return saved ? JSON.parse(saved) : INITIAL_AUDITABLE_UNITS;
    } catch {
      return INITIAL_AUDITABLE_UNITS;
    }
  });
  const [showAddUnitModal, setShowAddUnitModal] = useState<boolean>(false);
  const [newUnitName, setNewUnitName] = useState<string>("");
  const [newUnitRisk, setNewUnitRisk] = useState<"High Risk" | "Medium Risk" | "Low Risk">("Medium Risk");
  const [newUnitLead, setNewUnitLead] = useState<string>("");
  const [newUnitInScope, setNewUnitInScope] = useState<string>("Yes");

  useEffect(() => {
    try {
      localStorage.setItem("investments_auditable_units", JSON.stringify(auditableUnits));
    } catch (e) {
      console.error(e);
    }
  }, [auditableUnits]);

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    const today = new Date().toISOString().split("T")[0];
    const newUnitObj: AuditableUnit = {
      id: "unit-" + Date.now(),
      unit: newUnitName.trim(),
      riskCategory: newUnitRisk,
      lastAuditDate: today,
      leadAuditor: newUnitLead.trim() || "Current Auditor",
      inScope: newUnitInScope,
    };

    setAuditableUnits((prev) => [newUnitObj, ...prev]);
    setNewUnitName("");
    setNewUnitLead("");
    setShowAddUnitModal(false);
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm("Are you sure you want to remove this auditable unit?")) {
      setAuditableUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // 3. Observation & Finding Log State & Logic
  const [findingsLog, setFindingsLog] = useState<AuditFinding[]>(() => {
    try {
      const saved = localStorage.getItem("investments_findings_log");
      return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
    } catch {
      return INITIAL_FINDINGS;
    }
  });
  const [showRaiseFindingModal, setShowRaiseFindingModal] = useState<boolean>(false);
  const [findingTitle, setFindingTitle] = useState<string>("");
  const [findingDesc, setFindingDesc] = useState<string>("");
  const [findingSeverity, setFindingSeverity] = useState<"High Severity" | "Medium Severity" | "Low Severity">("High Severity");
  const [findingOwner, setFindingOwner] = useState<string>("");
  const [findingTargetDate, setFindingTargetDate] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem("investments_findings_log", JSON.stringify(findingsLog));
    } catch (e) {
      console.error(e);
    }
  }, [findingsLog]);

  const handleRaiseFindingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle.trim() || !findingDesc.trim()) return;

    const nextNum = findingsLog.length + 1;
    const refStr = `OBS-INV-${String(nextNum).padStart(3, "0")}`;
    const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newFinding: AuditFinding = {
      id: "find-" + Date.now(),
      ref: refStr,
      severity: findingSeverity,
      title: findingTitle.trim(),
      description: findingDesc.trim(),
      owner: findingOwner.trim() || "Treasury Operations",
      targetCloseDate: findingTargetDate || defaultDate,
      status: "Open",
    };

    setFindingsLog((prev) => [newFinding, ...prev]);
    setFindingTitle("");
    setFindingDesc("");
    setFindingOwner("");
    setFindingTargetDate("");
    setShowRaiseFindingModal(false);
  };

  const handleDeleteFinding = (id: string) => {
    if (window.confirm("Are you sure you want to delete this observation finding?")) {
      setFindingsLog((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const toggleFindingStatus = (id: string) => {
    setFindingsLog((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const nextStatus: AuditFinding["status"] =
          f.status === "Open" ? "In Review" : f.status === "In Review" ? "Resolved" : "Open";
        return { ...f, status: nextStatus };
      })
    );
  };
  
  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Simulation Form States
  const [simProcedure, setSimProcedure] = useState<string>("holdings_reconciliation");
  const [simSampleSize, setSimSampleSize] = useState<number>(10);
  const [simTolerance, setSimTolerance] = useState<number>(0.10);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

const DEFAULT_EXCEPTIONS: InvestmentsException[] = [
  {
    id: "exc-1",
    module: "Investments Audit",
    security: "Tesla Inc. Note",
    amount: "$12.5M",
    exception: "Exposure Breach",
    date: "2026-07-23",
    severity: "High",
    status: "Open",
  },
  {
    id: "exc-2",
    module: "Investments Audit",
    security: "Vertex Pharma",
    amount: "$8M",
    exception: "Rating Downgrade",
    date: "2026-07-23",
    severity: "High",
    status: "In Review",
  },
];

const DEFAULT_GUARDRAILS: SectorGuardrail[] = [
  { id: 1, sector: "Technology", limit_pct: 25.0, current_pct: 22.4, status: "Normal" },
  { id: 2, sector: "Real Estate", limit_pct: 15.0, current_pct: 18.2, status: "Breached" },
  { id: 3, sector: "Healthcare & Pharma", limit_pct: 20.0, current_pct: 14.5, status: "Normal" },
];

const DEFAULT_TRENDS: ComplianceTrendPoint[] = [
  { id: 1, month: "May", score: 90, exceptions_count: 1 },
  { id: 2, month: "Jun", score: 94, exceptions_count: 1 },
  { id: 3, month: "Jul", score: 96, exceptions_count: 0 },
];

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      let excData: InvestmentsException[] = [];
      let guardData: SectorGuardrail[] = [];
      let trendData: ComplianceTrendPoint[] = [];

      try {
        [excData, guardData, trendData] = await Promise.all([
          get<InvestmentsException[]>("/api/modules/investments/exceptions"),
          get<SectorGuardrail[]>("/api/modules/investments/sector-guardrails"),
          get<ComplianceTrendPoint[]>("/api/modules/investments/compliance-trends"),
        ]);
      } catch {
        [excData, guardData, trendData] = await Promise.all([
          get<InvestmentsException[]>("/api/modules/investments_audit/exceptions"),
          get<SectorGuardrail[]>("/api/modules/investments_audit/sector-guardrails"),
          get<ComplianceTrendPoint[]>("/api/modules/investments_audit/compliance-trends"),
        ]);
      }

      setExceptions(excData && excData.length > 0 ? excData : DEFAULT_EXCEPTIONS);
      setGuardrails(guardData && guardData.length > 0 ? guardData : DEFAULT_GUARDRAILS);
      setTrends(trendData && trendData.length > 0 ? trendData : DEFAULT_TRENDS);
      setError("");
    } catch (e: any) {
      console.warn("Backend API unavailable, using offline fallback data:", e);
      setExceptions(DEFAULT_EXCEPTIONS);
      setGuardrails(DEFAULT_GUARDRAILS);
      setTrends(DEFAULT_TRENDS);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  // Handle resolving an exception
  const handleResolve = async (id: string) => {
    try {
      const updated = await post<InvestmentsException[]>("/api/modules/investments_audit/exceptions/resolve", { id });
      setExceptions(updated);
    } catch (e: any) {
      setExceptions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Resolved" } : item))
      );
    }
  };

  // Run Real-Time Stream Simulation
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimRunning(true);
    setSimLogs(["[SYSTEM] Connection established with simulation agent..."]);
    setSimResult(null);

    const activeProcedureLabel = ALL_SUBPAGES.find(p => p.id === simProcedure)?.title || simProcedure;

    try {
      const response = await fetch("/api/modules/investments_audit/procedures/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("iaos_token") || ""}`
        },
        body: JSON.stringify({
          procedure_id: activeProcedureLabel,
          sample_size: Number(simSampleSize),
          tolerance: Number(simTolerance)
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Response body is not readable");

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "log") {
                setSimLogs(prev => [...prev, data.message]);
              } else if (data.type === "summary") {
                setSimResult(data);
              }
            } catch (err) {
              // Plain text fallback
              setSimLogs(prev => [...prev, dataStr]);
            }
          }
        }
      }

      // Re-fetch exceptions to update tables and charts
      await fetchData();
    } catch (err: any) {
      setSimLogs(prev => [...prev, `[ERROR] Simulation failed: ${err.message}`]);
    } finally {
      setSimRunning(false);
    }
  };

  // Define All 25 Subpages
  const SIGNATURE_PAGES = [
    { id: "holdings_reconciliation", title: "Holdings vs Custodian Reconciliation", desc: "Reconcile ERP ledger values to physical Demat / Custodian statements.", icon: RefreshCw },
    { id: "valuation_testing", title: "Valuation & Fair-Value Testing", desc: "Audit mark-to-market calculations, pricing feeds, and impairment indicators.", icon: Scale },
    { id: "board_approval_limits", title: "Board Approval vs Limits", desc: "Verify transactions comply with delegated authorization matrices and limits.", icon: FileCheck },
    { id: "income_recomputation", title: "Income Recomputation", desc: "Recompute expected interest coupon and dividend rates against actual bank inflows.", icon: Sliders },
    { id: "related_party_flag", title: "Related-Party Investment Flag", desc: "Scan and flag undisclosed or unauthorized investments in group/related companies.", icon: Shield },
    { id: "concentration_exposure", title: "Concentration & Exposure", desc: "Analyze exposure boundaries by asset class, single issuer, and industry sector.", icon: Layers },
    { id: "maturity_rollover", title: "Maturity & Rollover Tracking", desc: "Review reinvestment, cash settlement, and rollover authorization controls.", icon: Clock },
    { id: "instrument_master_governance", title: "Instrument Master Governance", desc: "Audit static security parameters, ISIN registry, and rating thresholds.", icon: Database },
    { id: "realised_gain_loss", title: "Realised Gain/Loss Testing", desc: "Re-calculate FIFO / weighted-average calculations on sold holdings.", icon: TrendingUp },
    { id: "mandate_policy", title: "Mandate & Policy Compliance", desc: "Test holdings against compliance boundaries defined in the Investment Policy Statement.", icon: FileText },
    { id: "accrued_income_ageing", title: "Accrued Income Ageing", desc: "Track and age overdue coupon collections and dividend distributions.", icon: Clock },
    { id: "impairment_screening", title: "Impairment Trigger Screening", desc: "Assess ECL, credit deterioration cues, and diminution in value thresholds.", icon: AlertTriangle },
    { id: "pledged_lien", title: "Pledged / Lien Investments", desc: "Verify encumbered securities, lien assignments, and margin pledges.", icon: FileSpreadsheet },
    { id: "broker_dealing", title: "Broker & Dealing Controls", desc: "Monitor broker empanelment, split volumes, and commission payouts.", icon: User },
    { id: "disclosure_classification", title: "Disclosure & Classification", desc: "Verify classification rules under accounting standards (FVTPL vs FVOCI).", icon: FileText }
  ];

  const SHELL_PAGES = [
    { id: "dashboard_kpis", title: "Module Dashboard & KPIs", desc: "Executive view of investment risks, exceptions trend, and test coverage.", icon: TrendingUp },
    { id: "scope_universe", title: "Scope & Audit Universe", desc: "Define entity scopes, treasury units, and bank accounts in scope.", icon: Building },
    { id: "rcm_matrix", title: "Risk & Control Matrix (RCM)", desc: "Directory of risks, controls, assertions, and control ownership tags.", icon: Shield },
    { id: "test_rule_library", title: "Test & Analytics Rule Library", desc: "Configure automated CAAT scripts, checks, and deviation thresholds.", icon: Sliders },
    { id: "data_connector_setup", title: "Data Source & Connector Setup", desc: "Map custody APIs, ERP ledger uploads, and Bloomberg endpoints.", icon: Database },
    { id: "sampling_builder", title: "Sampling & Population Builder", desc: "Draw random or monetary-unit samples from transaction data.", icon: Layers },
    { id: "exception_queue", title: "Exception & Red-Flag Queue", desc: "Triage and resolve system-generated investment anomalies.", icon: AlertTriangle },
    { id: "working_papers", title: "Working Papers & Evidence", desc: "Store evidence files, tickmark worksheets, and reviewer approvals.", icon: FileCheck },
    { id: "observation_log", title: "Observation & Finding Log", desc: "Track formal audit findings, severity scoring, and management responses.", icon: FileText },
    { id: "remediation_tracker", title: "Remediation & CAPA Tracker", desc: "Follow up on corrective actions, progress reviews, and recheck cycles.", icon: RefreshCw }
  ];

  const ALL_SUBPAGES = [...SHELL_PAGES, ...SIGNATURE_PAGES];

  // Filter subpages based on search
  const filteredSignature = SIGNATURE_PAGES.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredShell = SHELL_PAGES.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePageObj = ALL_SUBPAGES.find(p => p.id === activeTab);

  // Statistics Computations
  const totalExceptions = exceptions.length;
  const unresolvedExceptions = exceptions.filter(e => e.status !== "Resolved").length;
  const resolvedExceptions = exceptions.filter(e => e.status === "Resolved").length;
  const currentScore = trends.length > 0 ? trends[trends.length - 1].score : 90;

  // Custom SVG Chart rendering helpers
  const renderTrendLine = () => {
    if (trends.length < 2) return null;
    const width = 600;
    const height = 150;
    const padding = 25;
    
    const minVal = Math.min(...trends.map(t => t.score)) - 5;
    const maxVal = 100;
    const valRange = maxVal - minVal;

    const points = trends.map((t, index) => {
      const x = padding + (index / (trends.length - 1)) * (width - padding * 2);
      const y = height - padding - ((t.score - minVal) / valRange) * (height - padding * 2);
      return { x, y, ...t };
    });

    const d = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    return (
      <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "180px" }}>
        {/* Grids */}
        {[80, 90, 100].map(gridVal => {
          const y = height - padding - ((gridVal - minVal) / valRange) * (height - padding * 2);
          return (
            <g key={gridVal}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeDasharray="3 3" />
              <text x={padding - 5} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{gridVal}%</text>
            </g>
          );
        })}
        {/* Area Gradient */}
        <path
          d={`${d} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#grad)"
          opacity="0.15"
        />
        {/* Line */}
        <path d={d} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        {/* Nodes */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            <text x={p.x} y={p.y - 12} fill="#ffffff" fontSize="11" fontWeight="600" textAnchor="middle">{p.score}%</text>
            <text x={p.x} y={height - 5} fill="#94a3b8" fontSize="10" textAnchor="middle">{p.month}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="iaos-investments-audit">
      <div className="iaos-layout-grid">
        
        {/* Sidebar sub-navigation panel */}
        <aside className="iaos-module-sidebar">
          <div className="sidebar-search">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search 25 subpages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X className="clear-search" size={14} onClick={() => setSearchTerm("")} />}
          </div>

          <div className="sidebar-scrollable">
            {/* 1. Main views & config shells */}
            <div className="sidebar-section">
              <span className="section-title">Dashboard & Admin Shells ({filteredShell.length})</span>
              {filteredShell.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    className={`sidebar-nav-btn ${activeTab === p.id ? "active" : ""}`}
                    onClick={() => setActiveTab(p.id)}
                  >
                    <IconComponent size={16} className="nav-icon" />
                    <span className="nav-label">{p.title}</span>
                    {p.id === "exception_queue" && unresolvedExceptions > 0 && (
                      <span className="nav-badge alert">{unresolvedExceptions}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. 15 Signature Audit Procedures */}
            <div className="sidebar-section">
              <span className="section-title">Signature Audit Procedures ({filteredSignature.length})</span>
              {filteredSignature.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    className={`sidebar-nav-btn ${activeTab === p.id ? "active" : ""}`}
                    onClick={() => setActiveTab(p.id)}
                  >
                    <IconComponent size={16} className="nav-icon" />
                    <span className="nav-label">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Viewer Panel */}
        <main className="iaos-module-content">
          {error && <div className="error-alert"><AlertTriangle size={18} /> {error}</div>}
          
          {loading && !simRunning ? (
            <div className="loading-state">
              <RefreshCw size={36} className="spinner" />
              <span>Fetching secure tenant records...</span>
            </div>
          ) : (
            <div className="view-content-wrapper">
              
              {/* Header inside viewer */}
              <div className="view-header">
                <div className="view-header-title">
                  <h2>{activePageObj?.title}</h2>
                  <p>{activePageObj?.desc}</p>
                </div>
                <div className="view-header-badge">
                  <span className={`status-pill ${activePageObj?.id.includes("dashboard") || activePageObj?.id.includes("reconciliation") ? "active" : "verified"}`}>
                    {activeTab in SIGNATURE_PAGES.map(p => p.id) || SIGNATURE_PAGES.some(p => p.id === activeTab) ? "Signature Testing Enabled" : "Shell Layout"}
                  </span>
                </div>
              </div>

              {/* VIEW SWITCHER */}

              {/* 1. Module Dashboard & KPIs */}
              {activeTab === "dashboard_kpis" && (
                <div className="subpage-dashboard">
                  <div className="stat-cards-grid">
                    <div className="kpi-card">
                      <span className="kpi-label">Active Exceptions</span>
                      <span className="kpi-value text-red">{unresolvedExceptions}</span>
                      <span className="kpi-subtext">Requires auditor verification</span>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Compliance Score</span>
                      <span className="kpi-value text-blue">{currentScore}%</span>
                      <span className="kpi-subtext">Overall portfolio trust index</span>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Sector Rules Tracked</span>
                      <span className="kpi-value text-green">{guardrails.length}</span>
                      <span className="kpi-subtext">Real-time concentration boundaries</span>
                    </div>
                  </div>

                  <div className="dashboard-row">
                    <div className="dashboard-col card border-glow">
                      <h3>Audit Compliance Score Trend</h3>
                      <div className="chart-container">
                        {renderTrendLine()}
                      </div>
                    </div>

                    <div className="dashboard-col card">
                      <h3>Active Sector Concentration Caps</h3>
                      <div className="sector-limits-list">
                        {guardrails.map((g) => (
                          <div key={g.id} className="sector-limit-row">
                            <div className="sector-meta">
                              <span className="sector-name">{g.sector}</span>
                              <span className="sector-values">{g.current_pct}% / {g.limit_pct}% Cap</span>
                            </div>
                            <div className="sector-progress-bar">
                              <div
                                className={`progress-fill ${g.status === "Breached" ? "danger" : "normal"}`}
                                style={{ width: `${Math.min(100, (g.current_pct / g.limit_pct) * 100)}%` }}
                              ></div>
                            </div>
                            <div className="sector-status">
                              <span className={`badge ${g.status === "Breached" ? "badge-danger" : "badge-success"}`}>
                                {g.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Simulator Quick Launch card */}
                  <div className="card start-simulation-banner">
                    <div className="banner-text">
                      <h4>Launch Simulated Controls Verification Procedure</h4>
                      <p>Draw a statistical sample population of investments and perform real-time verification testing on custodial records.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setActiveTab("sampling_builder")}>
                      Open Simulation Panel <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Holdings vs Custodian Reconciliation (Signature) */}
              {activeTab === "holdings_reconciliation" && (
                <div className="procedure-view">
                  <div className="card">
                    <div className="flex-between mb-2">
                      <div>
                        <h3>Reconciliation Registry (ERP Book vs Custody Statement)</h3>
                        <p className="section-instruction mb-0">
                          Compare securities quantity and values declared in internal ledgers with external securities statements (Demat/NSDL/CDSL/BNY Mellon).
                        </p>
                      </div>
                      <span className="text-xs text-slate-soft font-mono">Last Synced: {lastSyncedTime}</span>
                    </div>

                    {syncBannerMsg && (
                      <div className="sync-banner-alert mb-3">
                        <CheckCircle size={16} /> <span>{syncBannerMsg}</span>
                      </div>
                    )}
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Name</th>
                            <th>ERP Qty</th>
                            <th>Custodian Qty</th>
                            <th>Difference</th>
                            <th>ERP Value</th>
                            <th>Custodian Value</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reconItems.map((item) => (
                            <tr key={item.id}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.erpQty}</td>
                              <td>{item.custodianQty}</td>
                              <td className={item.difference === "0" ? "text-green" : "text-red font-bold"}>{item.difference}</td>
                              <td>{item.erpValue}</td>
                              <td>{item.custodianValue}</td>
                              <td>
                                <span className={`badge ${item.status === "Match" ? "badge-success" : "badge-danger"}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="btn btn-ghost btn-sm text-xs"
                                  onClick={() => {
                                    setReconItems((prev) =>
                                      prev.map((r) =>
                                        r.id === item.id
                                          ? {
                                              ...r,
                                              status: r.status === "Match" ? "Unreconciled" : "Match",
                                              difference: r.status === "Match" ? "+200" : "0",
                                              custodianQty: r.status === "Match" ? "4,000" : r.erpQty,
                                              custodianValue: r.status === "Match" ? "$4,000,000" : r.erpValue,
                                            }
                                          : r
                                      )
                                    );
                                  }}
                                  title="Click to toggle discrepancy status"
                                >
                                  {item.status === "Match" ? "Simulate Discrepancy" : "Reconcile"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="reconciliation-actions mt-3 flex-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary flex items-center gap-2"
                          onClick={handleRefreshLedger}
                          disabled={isRefreshingRecon}
                        >
                          <RefreshCw size={14} className={isRefreshingRecon ? "spinner" : ""} />
                          {isRefreshingRecon ? "Re-synchronizing Ledgers..." : "Refresh Ledger Synced Balances"}
                        </button>
                        <button className="btn btn-ghost btn-sm text-xs" onClick={handleResetRecon} title="Reset table data to default demo state">
                          Reset Demo Data
                        </button>
                      </div>

                      <button className="btn btn-primary" onClick={() => { setActiveTab("sampling_builder"); setSimProcedure("holdings_reconciliation"); }}>
                        Run Sample Audit Simulation
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Valuation & Fair-Value Testing (Signature) */}
              {activeTab === "valuation_testing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Fair-Value Discrepancy Testing Panel</h3>
                    <p className="section-instruction">Verify internal book pricing against independent market pricing sources (Bloomberg, Refinitiv, or Broker Quotes) and calculate Impairment Provisions.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Holding</th>
                            <th>Cost price</th>
                            <th>Independent Price</th>
                            <th>ERP Book Price</th>
                            <th>Variance %</th>
                            <th>ECL Impairment Triggered</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Goldman Sachs MT Note</td>
                            <td>$100.00</td>
                            <td>$100.25</td>
                            <td>$100.00</td>
                            <td>-0.25%</td>
                            <td>No</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                          <tr>
                            <td>Vertex Pharma Paper</td>
                            <td>$100.00</td>
                            <td>$97.50</td>
                            <td>$100.00</td>
                            <td className="text-red">+2.56%</td>
                            <td>Yes (Rating Downgrade BBB+)</td>
                            <td><span className="badge badge-warning">Review Needed</span></td>
                          </tr>
                          <tr>
                            <td>Amazon Paper 2027</td>
                            <td>$100.00</td>
                            <td>$99.95</td>
                            <td>$99.95</td>
                            <td>0.00%</td>
                            <td>No</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Board Approval vs Limits (Signature) */}
              {activeTab === "board_approval_limits" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Delegated Financial Authority Limits Review</h3>
                    <p className="section-instruction">Audit whether investments exceed delegation caps without specific Board of Directors or Treasury Committee approvals.</p>
                    
                    <div className="limits-grid">
                      <div className="limit-block">
                        <h5>CFO Approval Limit</h5>
                        <div className="limit-val">$2,000,000</div>
                      </div>
                      <div className="limit-block">
                        <h5>Treasury Committee Limit</h5>
                        <div className="limit-val">$5,000,000</div>
                      </div>
                      <div className="limit-block">
                        <h5>Board of Directors Limit</h5>
                        <div className="limit-val">Unlimited</div>
                      </div>
                    </div>

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Investment Amount</th>
                            <th>Authorized Signatory</th>
                            <th>Resolution Ref</th>
                            <th>Board Appr Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="breached-row">
                            <td><strong>Tesla Inc. Corporate Note</strong></td>
                            <td>$12,500,000</td>
                            <td>CFO Sign-off Only</td>
                            <td><span className="text-red">Missing Resolution</span></td>
                            <td><span className="badge badge-danger">Breach: Limit Exceeded</span></td>
                          </tr>
                          <tr>
                            <td>Vertex Pharma Commercial Paper</td>
                            <td>$8,000,000</td>
                            <td>Board Committee</td>
                            <td>RES-2026-901</td>
                            <td><span className="badge badge-success">Approved</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Income Recomputation (Signature) */}
              {activeTab === "income_recomputation" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Coupon & Dividend Income Recomputation Engine</h3>
                    <p className="section-instruction">Recalculate yield expectations (coupon rates × face value × daycount convention) and reconcile to received payments.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Holding Security</th>
                            <th>Coupon Rate</th>
                            <th>Daycount</th>
                            <th>Expected Coupon</th>
                            <th>Actual Received</th>
                            <th>Variance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Tesla Inc. Note</td>
                            <td>4.50%</td>
                            <td>30/360</td>
                            <td>$281,250</td>
                            <td>$281,250</td>
                            <td>$0</td>
                            <td><span className="badge badge-success">Match</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Apex Global Equities</strong></td>
                            <td>4.50% (declared)</td>
                            <td>Act/365</td>
                            <td>$67,500</td>
                            <td>$36,000</td>
                            <td className="text-red">-$31,500</td>
                            <td><span className="badge badge-danger">Mismatch</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Related-Party Investment Flag (Signature) */}
              {activeTab === "related_party_flag" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Related-Party Exposures Monitor</h3>
                    <p className="section-instruction">Verify that investments in affiliate and associate firms are correctly flagged and approved under disclosures guidelines.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Asset Name</th>
                            <th>Relationship</th>
                            <th>Exposure Amount</th>
                            <th>Disclosure Status</th>
                            <th>Approval Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Cap Corp Logistics Debentures</td>
                            <td>Subsidiary (100% Owned)</td>
                            <td>$3,000,000</td>
                            <td>Declared in Note 24</td>
                            <td><span className="badge badge-success">Approved</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Apex Global Equities</strong></td>
                            <td>Associate (CFO holds Board seat)</td>
                            <td>$1,500,000</td>
                            <td><span className="text-red">Not Disclosed</span></td>
                            <td><span className="badge badge-warning">No Approval Record</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Concentration & Exposure (Signature) */}
              {activeTab === "concentration_exposure" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Single-Issuer & Industry Sector Concentration Boundaries</h3>
                    <p className="section-instruction">Review concentration statistics against Investment Policy limits (Single-Issuer Limit: 10% of total holdings, Sector Limit: 20-30%).</p>
                    
                    <div className="guardrails-box">
                      {guardrails.map(g => (
                        <div key={g.id} className="limit-meter-card">
                          <div className="meter-head">
                            <strong>{g.sector}</strong>
                            <span>{g.current_pct}% / {g.limit_pct}% Max</span>
                          </div>
                          <div className="progress-track">
                            <div className={`progress-bar ${g.status === "Breached" ? "danger" : "normal"}`} style={{ width: `${(g.current_pct / g.limit_pct) * 100}%` }}></div>
                          </div>
                          <div className="meter-foot">
                            <span className={g.status === "Breached" ? "text-red" : "text-green"}>{g.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Maturity & Rollover Tracking (Signature) */}
              {activeTab === "maturity_rollover" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Upcoming Maturities & Rollover Approvals Ledger</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Name</th>
                            <th>Maturity Date</th>
                            <th>Rollover Terms</th>
                            <th>Authorized By</th>
                            <th>Action Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Chevron Corp Debenture</td>
                            <td>2026-08-15</td>
                            <td>N/A (Settle Cash)</td>
                            <td>Treasury Desk</td>
                            <td><span className="badge badge-success">Settle Cash</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Evergreen Property Trust</strong></td>
                            <td>2026-07-10 (Overdue)</td>
                            <td>Extended +3 Years @ 4.8%</td>
                            <td><span className="text-red">No Sign-off</span></td>
                            <td><span className="badge badge-danger">Unresolved Extension</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. Instrument Master Governance (Signature) */}
              {activeTab === "instrument_master_governance" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Instrument Master Static Data Audit</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>ISIN</th>
                            <th>Issuer</th>
                            <th>Asset Class</th>
                            <th>Credit Rating (S&P/Moody's)</th>
                            <th>Allowed per IPS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>US88160R1014</td>
                            <td>Tesla Inc.</td>
                            <td>Corporate Bond</td>
                            <td>BBB / Baa2</td>
                            <td><span className="badge badge-success">Yes</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td>US92532F1003</td>
                            <td>Vertex Pharma</td>
                            <td>Commercial Paper</td>
                            <td><span className="text-red">BBB+ / Baa1 (Downgraded)</span></td>
                            <td><span className="badge badge-danger">No (Rating Below A-)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. Realised Gain/Loss Testing (Signature) */}
              {activeTab === "realised_gain_loss" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Realised Gain/Loss Audit Sheet</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Sold security</th>
                            <th>Sale date</th>
                            <th>Proceeds</th>
                            <th>Calculated cost (FIFO)</th>
                            <th>Reported Gain/Loss</th>
                            <th>Auditor Recomputed</th>
                            <th>Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Apple Inc. Bond (Partial Sale)</td>
                            <td>2026-06-15</td>
                            <td>$5,100,000</td>
                            <td>$5,000,000</td>
                            <td>+$100,000</td>
                            <td>+$100,000</td>
                            <td>$0 <span className="badge badge-success">Match</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. Mandate & Policy Compliance (Signature) */}
              {activeTab === "mandate_policy" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Investment Policy Statement (IPS) Mandates Compliance Checklist</h3>
                    
                    <ul className="compliance-checklist">
                      <li>
                        <CheckCircle size={18} className="text-green" />
                        <span>Maximum Equity Exposure limit &lt; 15% (Current: 8.2%) - <strong>Compliant</strong></span>
                      </li>
                      <li>
                        <AlertTriangle size={18} className="text-red" />
                        <span>Minimum Credit Quality of debt assets &gt; A- (Breach: Vertex Pharma Downgraded to BBB+) - <strong>Breach</strong></span>
                      </li>
                      <li>
                        <CheckCircle size={18} className="text-green" />
                        <span>Minimum liquid assets pool &gt; $20,000,000 (Current: $24,500,000) - <strong>Compliant</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 12. Accrued Income Ageing (Signature) */}
              {activeTab === "accrued_income_ageing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Accrued Interest Income Ageing Schedule</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Interest Accrued</th>
                            <th>Not Due yet</th>
                            <th>1-30 Days Overdue</th>
                            <th>31-90 Days Overdue</th>
                            <th>90+ Days Overdue</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>JPMorgan Certificate of Deposit</td>
                            <td>$110,000</td>
                            <td>$110,000</td>
                            <td>$0</td>
                            <td>$0</td>
                            <td>$0</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Evergreen Property Trust Bond</td>
                            <td>$84,000</td>
                            <td>$0</td>
                            <td>$0</td>
                            <td>$84,000</td>
                            <td>$0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 13. Impairment Trigger Screening (Signature) */}
              {activeTab === "impairment_screening" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>ECL Stage Classification & Impairment Screening</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Holding Value</th>
                            <th>S&P Rating</th>
                            <th>Stage (IFRS 9)</th>
                            <th>Impairment Triggered</th>
                            <th>Provision Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>NextEra Energy Green Bond</td>
                            <td>$14,000,000</td>
                            <td>A+</td>
                            <td>Stage 1</td>
                            <td>No</td>
                            <td>$0</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Vertex Pharma Paper</td>
                            <td>$8,000,000</td>
                            <td>BBB+</td>
                            <td>Stage 2 (Significant Increase in Credit Risk)</td>
                            <td><span className="text-red font-bold">Yes</span></td>
                            <td>$160,000 (2.0%)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 14. Pledged / Lien Investments (Signature) */}
              {activeTab === "pledged_lien" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Encumbered Securities and Lien Registry</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Pledged Asset</th>
                            <th>Pledged Value</th>
                            <th>Lienholder (Bank)</th>
                            <th>Purpose / Loan Facility</th>
                            <th>Board Authorization Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Microsoft Corp Note</td>
                            <td>$10,000,000</td>
                            <td>HSBC Bank</td>
                            <td>Working Capital Overdraft Margin</td>
                            <td>2025-10-12</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 15. Broker & Dealing Controls (Signature) */}
              {activeTab === "broker_dealing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Broker Empanelment & Allocation Auditing</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Broker Name</th>
                            <th>Empaneled Status</th>
                            <th>Transaction Volume (YTD)</th>
                            <th>Share %</th>
                            <th>Commission Paid</th>
                            <th>Avg Commission Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Morgan Stanley India</td>
                            <td>Empaneled</td>
                            <td>$45,000,000</td>
                            <td>42.0%</td>
                            <td>$45,000</td>
                            <td>0.10%</td>
                          </tr>
                          <tr>
                            <td>Goldman Sachs Brokerage</td>
                            <td>Empaneled</td>
                            <td>$35,000,000</td>
                            <td>33.0%</td>
                            <td>$35,000</td>
                            <td>0.10%</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Alpha Global Dealing Desk</td>
                            <td><span className="text-red font-bold">Not Empaneled</span></td>
                            <td>$25,000,000</td>
                            <td>25.0%</td>
                            <td>$37,500</td>
                            <td><span className="text-red font-bold">0.15% (Exceeds Policy Cap)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 16. Disclosure & Classification (Signature) */}
              {activeTab === "disclosure_classification" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>IFRS 9 Classification (FVTPL vs FVOCI vs Amortized Cost)</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Business Model Assessment</th>
                            <th>SPPI Test Result</th>
                            <th>Accounting Classification</th>
                            <th>Appropriate?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>JPMorgan Cert of Deposit</td>
                            <td>Hold to Collect Cash Flows</td>
                            <td>Pass (Solely Principal & Interest)</td>
                            <td>Amortized Cost</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                          <tr>
                            <td>Apex Global Equities</td>
                            <td>Trading / Capital Appreciation</td>
                            <td>Fail (Equity Dividends)</td>
                            <td>FVTPL (Fair Value through P&L)</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 17. Scope & Audit Universe (Functional) */}
              {activeTab === "scope_universe" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="card-head mb-3">
                      <h3>Auditable Universe Scope Configuration ({auditableUnits.length})</h3>
                      <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => setShowAddUnitModal(true)}>
                        Add Unit <Plus size={14} />
                      </button>
                    </div>

                    {showAddUnitModal && (
                      <form className="modal-form-box mb-4" onSubmit={handleAddUnitSubmit}>
                        <div className="flex-between mb-2">
                          <h4 className="text-sm font-bold text-navy">Add New Auditable Unit</h4>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddUnitModal(false)}><X size={14} /></button>
                        </div>
                        <div className="grid-form-2">
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Auditable Unit Name</label>
                            <input
                              className="input input-sm"
                              placeholder="e.g. Fixed Income Derivatives Desk"
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Risk Category</label>
                            <select
                              className="input input-sm"
                              value={newUnitRisk}
                              onChange={(e) => setNewUnitRisk(e.target.value as any)}
                            >
                              <option value="High Risk">High Risk</option>
                              <option value="Medium Risk">Medium Risk</option>
                              <option value="Low Risk">Low Risk</option>
                            </select>
                          </div>
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Lead Auditor</label>
                            <input
                              className="input input-sm"
                              placeholder="Auditor name"
                              value={newUnitLead}
                              onChange={(e) => setNewUnitLead(e.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">In Scope Status</label>
                            <select
                              className="input input-sm"
                              value={newUnitInScope}
                              onChange={(e) => setNewUnitInScope(e.target.value)}
                            >
                              <option value="Yes (Primary)">Yes (Primary)</option>
                              <option value="Yes">Yes</option>
                              <option value="No (Cycle Out)">No (Cycle Out)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddUnitModal(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm">Add Unit</button>
                        </div>
                      </form>
                    )}

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Auditable Unit</th>
                            <th>Risk Category</th>
                            <th>Last Audit Date</th>
                            <th>Lead Auditor</th>
                            <th>In Scope?</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditableUnits.map((u) => (
                            <tr key={u.id}>
                              <td className="font-medium">{u.unit}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    u.riskCategory === "High Risk"
                                      ? "badge-danger"
                                      : u.riskCategory === "Medium Risk"
                                      ? "badge-warning"
                                      : "badge-success"
                                  }`}
                                >
                                  {u.riskCategory}
                                </span>
                              </td>
                              <td>{u.lastAuditDate}</td>
                              <td>{u.leadAuditor}</td>
                              <td>
                                <span className={u.inScope.includes("Yes") ? "text-green font-bold" : "text-muted"}>
                                  {u.inScope}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="btn btn-ghost btn-sm text-xs text-danger"
                                  title="Delete unit"
                                  onClick={() => handleDeleteUnit(u.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}

                          {auditableUnits.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-4 text-slate">
                                No auditable units in scope. Click "Add Unit" above to add one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 18. Risk & Control Matrix (Shell) */}
              {activeTab === "rcm_matrix" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Risk & Control Matrix (RCM) Index</h3>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Risk Ref</th>
                            <th>Risk Statement</th>
                            <th>Control Ref</th>
                            <th>Control Statement</th>
                            <th>Assertion</th>
                            <th>Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>RSK-INV-01</strong></td>
                            <td>Securities in books do not exist in custody (Demat).</td>
                            <td><strong>CON-INV-01</strong></td>
                            <td>Monthly custody reconciliation to Demat statements.</td>
                            <td>Existence / Completeness</td>
                            <td>Treasury Manager</td>
                          </tr>
                          <tr>
                            <td><strong>RSK-INV-02</strong></td>
                            <td>Securities are carried above fair market value.</td>
                            <td><strong>CON-INV-02</strong></td>
                            <td>Independent pricing validation and impairment evaluation.</td>
                            <td>Valuation / Allocation</td>
                            <td>CFO Office</td>
                          </tr>
                          <tr>
                            <td><strong>RSK-INV-03</strong></td>
                            <td>Concentration exceeds policy limits leading to market loss.</td>
                            <td><strong>CON-INV-03</strong></td>
                            <td>Automated sector exposure cap controls in ERP.</td>
                            <td>Valuation</td>
                            <td>Compliance Head</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 19. Test & Analytics Rule Library (Shell) */}
              {activeTab === "test_rule_library" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Test Analytics and Rule Threshold Library</h3>
                    <div className="rule-grid">
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Single Issuer Exposure Threshold</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Triggers exception if single security exceeds defined percent of total portfolio size.</p>
                        <div className="rule-threshold">Threshold Limit: 10.0%</div>
                      </div>
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Minimum Issuer Credit Rating Check</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Triggers warning if held security drops below minimum credit standard.</p>
                        <div className="rule-threshold">Minimum Rating: A- (S&P)</div>
                      </div>
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Dividend Receipt Variance Test</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Recomputes dividend income and flags if difference exceeds expectation.</p>
                        <div className="rule-threshold">Tolerance Limit: 1.0%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 20. Data Source & Connector Setup (Shell) */}
              {activeTab === "data_connector_setup" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Data Feeds & API Integration Setup</h3>
                    <div className="connector-rows">
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>Bloomberg Pricing API Connector</strong>
                          <span>Sync Status: <span className="text-green font-bold">Online</span> (Last sync: 2 hours ago)</span>
                        </div>
                        <span className="badge badge-success">Connected</span>
                      </div>
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>BNY Mellon Custody Portal Connector</strong>
                          <span>Sync Status: <span className="text-green font-bold">Online</span> (Last sync: 1 day ago)</span>
                        </div>
                        <span className="badge badge-success">Connected</span>
                      </div>
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>SAP S/4HANA Treasury Ledger Upload</strong>
                          <span>Sync Status: <span className="text-warning font-bold">Manual Sync Required</span></span>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => alert("Simulating SAP file sync...")}>Sync Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 21. Sampling & Population Builder (Shell & Simulation execution panel) */}
              {activeTab === "sampling_builder" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Simulation Controls: Sample & Population Tester</h3>
                    <p className="section-instruction">Select an audit procedure, configure verification constraints, and start the automated compliance agent. The agent will read mock custodial ledger logs, apply compliance thresholds, and flag exceptions.</p>

                    <form className="simulation-form border-glow" onSubmit={handleRunSimulation}>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Verify Procedure</label>
                          <select value={simProcedure} onChange={(e) => setSimProcedure(e.target.value)} disabled={simRunning}>
                            {SIGNATURE_PAGES.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Statistical Sample Size</label>
                          <input
                            type="number"
                            min="2"
                            max="50"
                            value={simSampleSize}
                            onChange={(e) => setSimSampleSize(Number(e.target.value))}
                            disabled={simRunning}
                          />
                        </div>
                        <div className="form-group">
                          <label>Tolerance Limit (0.01 - 0.50)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="0.50"
                            value={simTolerance}
                            onChange={(e) => setSimTolerance(Number(e.target.value))}
                            disabled={simRunning}
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-full" disabled={simRunning}>
                        {simRunning ? (
                          <>
                            <RefreshCw className="spinner" size={16} /> Executing Simulation...
                          </>
                        ) : (
                          <>
                            <Play size={16} /> Run Automated Audit Procedure
                          </>
                        )}
                      </button>
                    </form>

                    {/* Simulation logs console */}
                    {(simLogs.length > 0 || simRunning) && (
                      <div className="simulation-terminal mt-4">
                        <div className="terminal-header">
                          <Terminal size={14} />
                          <span>Audit Verification Console Logs</span>
                        </div>
                        <div className="terminal-body">
                          {simLogs.map((log, i) => (
                            <div key={i} className="terminal-line">
                              <span className="line-prefix">&gt;</span> {log}
                            </div>
                          ))}
                          {simRunning && (
                            <div className="terminal-line typing">
                              <span className="line-prefix">&gt;</span> <span className="cursor">█</span>
                            </div>
                          )}
                          <div ref={consoleEndRef} />
                        </div>
                      </div>
                    )}

                    {/* Simulation result panel */}
                    {simResult && (
                      <div className={`simulation-result-card mt-4 ${simResult.status === "PASSED" ? "success" : "failed"}`}>
                        <div className="result-head">
                          <h4>Procedure Simulation: {simResult.status}</h4>
                          <span className={`badge ${simResult.status === "PASSED" ? "badge-success" : "badge-danger"}`}>
                            {simResult.status}
                          </span>
                        </div>
                        <div className="result-stats">
                          <div className="res-stat-col">
                            <span className="res-label">Deviation Count</span>
                            <span className="res-val">{simResult.deviations_count} / {simResult.sample_size}</span>
                          </div>
                          <div className="res-stat-col">
                            <span className="res-label">Deviation Rate</span>
                            <span className="res-val">{(simResult.deviation_rate * 100).toFixed(1)}%</span>
                          </div>
                          <div className="res-stat-col">
                            <span className="res-label">Configured Tolerance</span>
                            <span className="res-val">{(simResult.tolerance * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <p className="result-msg">
                          {simResult.status === "FAILED"
                            ? "CRITICAL: The verification deviation rate exceeds the allowed tolerance standard. The anomalous occurrences have been logged to the Exceptions Queue."
                            : "SUCCESS: The sample deviation rate lies within control limits. The procedure has concluded successfully."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 22. Exception & Red-Flag Queue (Shell & DB action integrated) */}
              {activeTab === "exception_queue" && (
                <div className="procedure-view">
                  <div className="card">
                    <div className="card-head">
                      <h3>Securities Exception Triage Queue</h3>
                      <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                        Reload Queue <RefreshCw size={14} />
                      </button>
                    </div>
                    
                    <p className="section-instruction">Selectively resolve exceptions that have been verified, adjusted, or cleared by the treasury desk.</p>

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Description</th>
                            <th>Amount</th>
                            <th>Identified Mismatch / Exception Description</th>
                            <th>Report Date</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Triage Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exceptions.map((e) => (
                            <tr key={e.id} className={e.status !== "Resolved" ? "unresolved-row" : "resolved-row-dim"}>
                              <td><strong>{e.security}</strong></td>
                              <td>{e.amount}</td>
                              <td><span className="text-muted-desc">{e.exception}</span></td>
                              <td>{e.date}</td>
                              <td>
                                <span className={`badge ${e.severity === "High" ? "badge-danger" : "badge-warning"}`}>
                                  {e.severity}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${e.status === "Resolved" ? "badge-success" : e.status === "In Review" ? "badge-warning" : "badge-danger"}`}>
                                  {e.status}
                                </span>
                              </td>
                              <td>
                                {e.status !== "Resolved" ? (
                                  <button className="btn btn-secondary btn-sm text-green-btn" onClick={() => handleResolve(e.id)}>
                                    Mark Resolved
                                  </button>
                                ) : (
                                  <span className="text-green text-sm font-bold flex-align-center"><Check size={14} /> Cleared</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {exceptions.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center text-muted">No exceptions reported for this tenant.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 23. Working Papers & Evidence (Functional) */}
              {activeTab === "working_papers" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="flex-between mb-3">
                      <div>
                        <h3>Working Papers & Audit Documentation Locker</h3>
                        <p className="text-muted-desc">
                          Upload and manage tickmark worksheets, custodian statements, and sign-off approvals.
                        </p>
                      </div>
                    </div>

                    {/* Task Reference selector before uploading */}
                    <div className="wp-upload-toolbar">
                      <div className="wp-task-select">
                        <label className="text-xs font-semibold text-slate mb-1">Target Reference Task:</label>
                        <select
                          className="input input-sm"
                          value={wpRefTask}
                          onChange={(e) => setWpRefTask(e.target.value)}
                        >
                          <option value="Holdings vs Custodian Reconciliation">Holdings vs Custodian Reconciliation</option>
                          <option value="Valuation & Fair-Value Testing">Valuation & Fair-Value Testing</option>
                          <option value="Pledged / Lien Verification">Pledged / Lien Verification</option>
                          <option value="Board Approval & Delegated Limits">Board Approval & Delegated Limits</option>
                          <option value="Mandate & Policy Compliance">Mandate & Policy Compliance</option>
                          <option value="General Audit Evidence">General Audit Evidence</option>
                        </select>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      multiple
                      accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileSelect}
                    />

                    <div
                      className="upload-box-wrapper"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className={`upload-box ${isDragging ? "drag-active" : ""}`}>
                        <Upload size={32} className={`upload-icon ${isDragging ? "upload-icon-active" : ""}`} />
                        <span>
                          {isDragging
                            ? "Drop your evidence files here to upload"
                            : "Click or Drag & Drop excel spreadsheets, PDF statement confirmation letters, or screenshots here."}
                        </span>
                        <span className="upload-subtext">
                          Supports XLSX, CSV, PDF, Images up to 25MB • Target Task: <strong>{wpRefTask}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex-between mt-4 mb-2">
                      <h4>Attached Evidence Register ({workingPapers.length})</h4>
                      <div className="wp-search-box">
                        <Search size={14} className="wp-search-icon" />
                        <input
                          type="text"
                          className="input input-sm search-input-indent"
                          placeholder="Filter documents or tasks..."
                          value={wpSearch}
                          onChange={(e) => setWpSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Document Name</th>
                            <th>Reference Task</th>
                            <th>Attached By</th>
                            <th>Upload Date</th>
                            <th>Size</th>
                            <th>Sign-off Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workingPapers
                            .filter(
                              (doc) =>
                                doc.name.toLowerCase().includes(wpSearch.toLowerCase()) ||
                                doc.refTask.toLowerCase().includes(wpSearch.toLowerCase()) ||
                                doc.attachedBy.toLowerCase().includes(wpSearch.toLowerCase())
                            )
                            .map((doc) => (
                              <tr key={doc.id}>
                                <td className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-slate-soft" />
                                    <span>{doc.name}</span>
                                  </div>
                                </td>
                                <td>{doc.refTask}</td>
                                <td>{doc.attachedBy}</td>
                                <td>{doc.uploadDate}</td>
                                <td>{doc.size}</td>
                                <td>
                                  <button
                                    className="btn-status-badge"
                                    onClick={() => toggleSignOff(doc.id)}
                                    title="Click to cycle sign-off status"
                                  >
                                    <span
                                      className={`badge ${
                                        doc.status === "Approved by Lead"
                                          ? "badge-success"
                                          : doc.status === "Needs Revision"
                                          ? "badge-danger"
                                          : "badge-warning"
                                      }`}
                                    >
                                      {doc.status}
                                    </span>
                                  </button>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      className="btn btn-ghost btn-sm text-xs"
                                      title="Download / View document"
                                      onClick={() => downloadDocument(doc)}
                                    >
                                      <Download size={14} />
                                    </button>
                                    <button
                                      className="btn btn-ghost btn-sm text-xs text-danger"
                                      title="Delete document"
                                      onClick={() => deleteDocument(doc.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                          {workingPapers.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center py-4 text-slate">
                                No evidence files attached yet. Drag & drop or click above to upload.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 24. Observation & Finding Log (Functional) */}
              {activeTab === "observation_log" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="card-head mb-3">
                      <div>
                        <h3>Formal Audit Findings and Observations ({findingsLog.length})</h3>
                        <p className="text-muted-desc">Track formal audit findings, severity scoring, and management responses.</p>
                      </div>
                      <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => setShowRaiseFindingModal(true)}>
                        Raise Finding <Plus size={14} />
                      </button>
                    </div>

                    {showRaiseFindingModal && (
                      <form className="modal-form-box mb-4" onSubmit={handleRaiseFindingSubmit}>
                        <div className="flex-between mb-2">
                          <h4 className="text-sm font-bold text-navy">Raise New Audit Finding / Observation</h4>
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRaiseFindingModal(false)}><X size={14} /></button>
                        </div>
                        <div className="field mb-2">
                          <label className="text-xs font-semibold text-slate mb-1">Finding Title / Subject</label>
                          <input
                            className="input input-sm"
                            placeholder="e.g. Unapproved corporate bond purchase exceeding authorization limits"
                            value={findingTitle}
                            onChange={(e) => setFindingTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="field mb-2">
                          <label className="text-xs font-semibold text-slate mb-1">Detailed Observation Statement</label>
                          <textarea
                            className="input input-sm"
                            rows={3}
                            placeholder="Describe the condition, criteria, cause, effect, and recommendation..."
                            value={findingDesc}
                            onChange={(e) => setFindingDesc(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid-form-3">
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Severity Level</label>
                            <select
                              className="input input-sm"
                              value={findingSeverity}
                              onChange={(e) => setFindingSeverity(e.target.value as any)}
                            >
                              <option value="High Severity">High Severity</option>
                              <option value="Medium Severity">Medium Severity</option>
                              <option value="Low Severity">Low Severity</option>
                            </select>
                          </div>
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Owner / Responsible Unit</label>
                            <input
                              className="input input-sm"
                              placeholder="e.g. CFO Office / Treasury"
                              value={findingOwner}
                              onChange={(e) => setFindingOwner(e.target.value)}
                            />
                          </div>
                          <div className="field">
                            <label className="text-xs font-semibold text-slate mb-1">Target Close Date</label>
                            <input
                              type="date"
                              className="input input-sm"
                              value={findingTargetDate}
                              onChange={(e) => setFindingTargetDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRaiseFindingModal(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm">Raise Finding</button>
                        </div>
                      </form>
                    )}
                    
                    <div className="findings-rows">
                      {findingsLog.map((item) => (
                        <div key={item.id} className="finding-item border-glow">
                          <div className="finding-meta">
                            <span className="finding-ref">{item.ref}</span>
                            <div className="flex items-center gap-2">
                              <button
                                className="btn-status-badge"
                                onClick={() => toggleFindingStatus(item.id)}
                                title="Click to cycle status (Open -> In Review -> Resolved)"
                              >
                                <span className={`badge ${item.status === "Resolved" ? "badge-success" : item.status === "In Review" ? "badge-warning" : "badge-danger"}`}>
                                  {item.status}
                                </span>
                              </button>
                              <span
                                className={`badge ${
                                  item.severity === "High Severity"
                                    ? "badge-danger"
                                    : item.severity === "Medium Severity"
                                    ? "badge-warning"
                                    : "badge-success"
                                }`}
                              >
                                {item.severity}
                              </span>
                              <button
                                className="btn btn-ghost btn-sm text-xs text-danger"
                                title="Delete finding"
                                onClick={() => handleDeleteFinding(item.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                          <div className="finding-footer">
                            <span>Owner: {item.owner}</span>
                            <span>Target Close Date: {item.targetCloseDate}</span>
                          </div>
                        </div>
                      ))}

                      {findingsLog.length === 0 && (
                        <p className="text-center py-4 text-slate">No audit findings raised yet. Click "Raise Finding" above to create one.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 25. Remediation / Action Tracker (Functional) */}
              {activeTab === "remediation_tracker" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="flex-between mb-3">
                      <div>
                        <h3>Remediation & CAPA Action Plans ({findingsLog.length})</h3>
                        <p className="text-muted-desc">Follow up on corrective actions, progress reviews, and recheck cycles.</p>
                      </div>
                    </div>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Finding Ref</th>
                            <th>Action Plan Statement / Subject</th>
                            <th>Remediation Owner</th>
                            <th>Target Date</th>
                            <th>Remediation Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {findingsLog.map((f) => (
                            <tr key={f.id}>
                              <td><strong className="font-mono">{f.ref}</strong></td>
                              <td>{f.title}</td>
                              <td>{f.owner}</td>
                              <td>{f.targetCloseDate}</td>
                              <td>
                                <button
                                  className="btn-status-badge"
                                  onClick={() => toggleFindingStatus(f.id)}
                                  title="Click to cycle status"
                                >
                                  <span
                                    className={`badge ${
                                      f.status === "Resolved"
                                        ? "badge-success"
                                        : f.status === "In Review"
                                        ? "badge-warning"
                                        : "badge-danger"
                                    }`}
                                  >
                                    {f.status === "Resolved"
                                      ? "Resolved"
                                      : f.status === "In Review"
                                      ? "In Progress"
                                      : "Pending Action"}
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}

                          {findingsLog.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-4 text-slate">
                                No remediation plans logged yet. Raise a finding in Observation Log to generate a CAPA plan.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>
    </div>
  );
}
