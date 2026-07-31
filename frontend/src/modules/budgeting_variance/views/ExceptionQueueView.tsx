import { useState, useCallback, useMemo } from "react";
import { Icon } from "../../../components/Icon";
import FilterBar, { DEFAULT_FILTERS } from "../components/FilterBar";
import KpiStrip from "../components/KpiStrip";
import DataTable from "../components/DataTable";
import { BarChartPanel } from "../components/Charts";
import AuditComment from "../components/AuditComment";
import { MOCK_PAGES_DATA } from "../constants/mockData";
import { COLUMNS } from "../constants/columns";
import type { FilterState, ExceptionItem } from "../types";

export default function ExceptionQueueView() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(() => MOCK_PAGES_DATA["exceptions"].rows);
  const [flyout, setFlyout] = useState<ExceptionItem | null>(null);
  const [flyStatus, setFlyStatus] = useState("");
  const [flyNotes, setFlyNotes] = useState("");

  const openFlyout = useCallback((e: ExceptionItem) => {
    setFlyout(e);
    setFlyStatus(e.status);
    setFlyNotes(e.disposition_notes);
  }, []);

  const closeFlyout = useCallback(() => setFlyout(null), []);

  const saveFlyout = useCallback(() => {
    if (!flyout) return;
    const updated = { ...flyout, status: flyStatus, disposition_notes: flyNotes };
    setExceptions((prev) => prev.map((x) => (x.id === flyout.id ? updated : x)));
    setFlyout(updated);
  }, [flyout, flyStatus, flyNotes]);

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((e) => {
      if (filters.department && filters.department !== "All Departments") {
        const rowDept = (e as any).department || "";
        if (rowDept.toLowerCase() !== filters.department.toLowerCase()) {
          return false;
        }
      }
      if (filters.businessUnit && filters.businessUnit !== "All Business Units") {
        const rowBU = (e as any).business_unit || "";
        if (rowBU.toLowerCase() !== filters.businessUnit.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [exceptions, filters.department, filters.businessUnit]);

  const kpis = useMemo(() => {
    const total = filteredExceptions.length;
    const openCount = filteredExceptions.filter((e) => e.status === "Open").length;
    const criticalCount = filteredExceptions.filter((e) => e.risk_grade === "Critical").length;
    const resolvedCount = filteredExceptions.filter((e) => e.status === "Resolved").length;

    return [
      { label: "Total Exceptions", value: total, tone: "navy" as const, icon: "alert-triangle" },
      { label: "Open Exceptions", value: openCount, tone: "gold" as const, icon: "activity" },
      { label: "Critical Risk", value: criticalCount, tone: "danger" as const, icon: "shield" },
      { label: "Resolved", value: resolvedCount, tone: "success" as const, icon: "check" },
    ];
  }, [filteredExceptions]);

  const riskBadge = (g: string) =>
    g === "Critical" ? "badge-critical" :
    g === "High" ? "badge-high" : "badge-medium";

  return (
    <div className="bgt-page-content">
      <FilterBar filters={filters} onChange={setFilters} />
      <KpiStrip items={kpis} />

      <div className="bgt-chart-section">
        <BarChartPanel
          title="Exceptions Variance by Cost Center"
          items={MOCK_PAGES_DATA["exceptions"].chart_bars || []}
        />
      </div>

      <DataTable
        columns={COLUMNS.exceptions}
        rows={filteredExceptions as any}
        searchQuery={filters.search}
        searchKeys={["cost_center", "budget_owner", "source_procedure", "status"]}
        exportFilename="exceptions-export"
        onRowClick={openFlyout as any}
        rowClassName={(row: any) => (flyout?.id === row.id ? "selected" : "")}
      />

      <AuditComment text="Cross-reference exception hits with CAAT rule library. All Critical items require documented disposition within 5 business days." />

      {flyout && (
        <>
          <div className="bgt-flyout-overlay" onClick={closeFlyout} />
          <div className="bgt-flyout">
            <div className="bgt-flyout-head">
              <h3>{flyout.cost_center}</h3>
              <button type="button" className="bgt-flyout-close" onClick={closeFlyout}>
                <Icon name="logout" size={18} />
              </button>
            </div>
            <div className="bgt-flyout-body">
              <div className="bgt-flyout-field">
                <label>Budget Owner</label>
                <span className="value">{flyout.budget_owner}</span>
              </div>
              <div className="bgt-flyout-field">
                <label>Source Procedure</label>
                <span className="value">{flyout.source_procedure}</span>
              </div>
              <div className="bgt-flyout-field">
                <label>Variance Amount</label>
                <span className="value" style={{ color: "var(--danger)" }}>
                  ${flyout.variance_amount.toLocaleString()}
                </span>
              </div>
              <div className="bgt-flyout-field">
                <label>Risk Grade</label>
                <span className={riskBadge(flyout.risk_grade)} style={{ alignSelf: "flex-start" }}>{flyout.risk_grade}</span>
              </div>
              <div className="bgt-flyout-field">
                <label>Status</label>
                <select className="select" value={flyStatus} onChange={(e) => setFlyStatus(e.target.value)}>
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="bgt-flyout-field">
                <label>Disposition Notes</label>
                <textarea className="input" rows={4} value={flyNotes} onChange={(e) => setFlyNotes(e.target.value)}
                  placeholder="Add notes…" style={{ resize: "vertical" }} />
              </div>
              <div className="bgt-flyout-actions">
                <button type="button" className="btn btn-primary" onClick={saveFlyout}>Save Changes</button>
                <button type="button" className="btn btn-ghost" onClick={closeFlyout}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
