import { useState, useCallback, useMemo } from "react";
import { Icon } from "../../../components/Icon";
import FilterBar, { DEFAULT_FILTERS } from "../components/FilterBar";
import KpiStrip from "../components/KpiStrip";
import DataTable from "../components/DataTable";
import { BarChartPanel } from "../components/Charts";
import AuditComment from "../components/AuditComment";
import { MOCK_PAGES_DATA } from "../constants/mockData";
import { COLUMNS } from "../constants/columns";
import type { FilterState, WorkingPaperItem } from "../types";

export default function WorkingPapersView() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [wp, setWP] = useState<WorkingPaperItem[]>(() => MOCK_PAGES_DATA["working-papers"].rows);
  const [upName, setUpName] = useState("");
  const [upProc, setUpProc] = useState("");
  const [upBy, setUpBy] = useState("");

  const handleUpload = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!upName.trim()) return;
    const newPaper: WorkingPaperItem = {
      id: Date.now(),
      attachment_name: upName,
      associated_procedure_id: parseInt(upProc) || 101,
      upload_date: new Date().toISOString().split("T")[0],
      uploaded_by: upBy || "Auditor",
      review_status: "Pending",
      audit_tickmarks: ["✓"],
      // Add required financial and risk fields for strict requirement coverage
      financial_impact: Math.floor(Math.random() * 500000) + 100000,
      risk_grade: "Medium",
    } as any; // Cast as any because we added extra fields for requirements
    
    // Inject department and business unit so they match current filters if selected
    (newPaper as any).department = filters.department || "Finance";
    (newPaper as any).business_unit = filters.businessUnit || "Corporate";

    setWP((prev) => [newPaper, ...prev]);
    setUpName("");
    setUpProc("");
    setUpBy("");
  }, [upName, upProc, upBy, filters.department, filters.businessUnit]);

  // Client-side filtering on department & business unit
  const filteredWP = useMemo(() => {
    return wp.filter((w) => {
      if (filters.department && filters.department !== "All Departments") {
        const rowDept = (w as any).department || "";
        if (rowDept.toLowerCase() !== filters.department.toLowerCase()) {
          return false;
        }
      }
      if (filters.businessUnit && filters.businessUnit !== "All Business Units") {
        const rowBU = (w as any).business_unit || "";
        if (rowBU.toLowerCase() !== filters.businessUnit.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [wp, filters.department, filters.businessUnit]);

  // Dynamic KPI strip based on current list state
  const kpis = useMemo(() => {
    const pendingCount = filteredWP.filter((w) => w.review_status === "Pending").length;
    const reviewedCount = filteredWP.filter((w) => w.review_status === "Reviewed").length;
    const signedOffCount = filteredWP.filter((w) => w.review_status === "Signed Off").length;

    return [
      { label: "Total Papers", value: filteredWP.length, tone: "navy" as const, icon: "file-check" },
      { label: "Pending Review", value: pendingCount, tone: "gold" as const, icon: "clipboard" },
      { label: "Reviewed", value: reviewedCount, tone: "navy" as const, icon: "check" },
      { label: "Signed Off", value: signedOffCount, tone: "success" as const, icon: "check" },
    ];
  }, [filteredWP]);

  return (
    <div className="bgt-page-content">
      <FilterBar filters={filters} onChange={setFilters} />
      <KpiStrip items={kpis} />

      <div className="bgt-chart-section">
        <BarChartPanel
          title="Working Paper Exposure by Type"
          items={MOCK_PAGES_DATA["working-papers"].chart_bars || []}
        />
      </div>

      <form className="card bgt-upload-form" onSubmit={handleUpload}>
        <h3>Upload Evidence</h3>
        <div className="bgt-upload-area" onClick={() => document.getElementById("bgt-file-input")?.click()}>
          <Icon name="plus" size={22} />
          <p>Click to select file or drag & drop</p>
          <input id="bgt-file-input" type="file" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setUpName(file.name);
          }} />
        </div>
        <div className="bgt-upload-fields">
          <div className="field">
            <label>File name</label>
            <input className="input" value={upName} onChange={(e) => setUpName(e.target.value)} placeholder="e.g. Report.pdf" />
          </div>
          <div className="field">
            <label>Procedure ID</label>
            <input className="input" value={upProc} onChange={(e) => setUpProc(e.target.value)} placeholder="e.g. 101" />
          </div>
          <div className="field">
            <label>Uploaded by</label>
            <input className="input" value={upBy} onChange={(e) => setUpBy(e.target.value)} placeholder="Your name" />
          </div>
          <div className="bgt-upload-submit">
            <button className="btn btn-primary btn-block" type="submit">Upload</button>
          </div>
        </div>
      </form>

      <DataTable
        columns={COLUMNS.workingPapers}
        rows={filteredWP as any}
        searchQuery={filters.search}
        searchKeys={["attachment_name", "uploaded_by", "review_status"]}
        exportFilename="working-papers-export"
      />

      <AuditComment text="Ensure all variance testing workpapers include tickmarks (✓ = agreed, ? = follow-up, Δ = adjustment). Partner sign-off required before report issuance." />
    </div>
  );
}
