import { useCallback, useEffect, useState } from "react";
import type { FilterState, PagePayload } from "../types";
import FilterBar, { DEFAULT_FILTERS } from "./FilterBar";
import KpiStrip from "./KpiStrip";
import DataTable, { type DataTableColumn } from "./DataTable";
import { BarChartPanel, SparkChartPanel } from "./Charts";
import AuditComment from "./AuditComment";
import { LoadingState, EmptyState, ErrorState } from "./StateViews";
import { MOCK_PAGES_DATA } from "../constants/mockData";

const SLUG = "budgeting_variance";

interface AnalysisPageProps<T extends Record<string, unknown>> {
  endpoint: string;
  exportFilename: string;
  chartTitle?: string;
  chartType?: "bar" | "spark";
  chartFootnote?: string;
  columns: DataTableColumn<T>[];
  searchKeys?: (keyof T & string)[];
}

export default function AnalysisPage<T extends Record<string, unknown>>({
  endpoint,
  exportFilename,
  chartTitle,
  chartType = "bar",
  chartFootnote,
  columns,
  searchKeys,
}: AnalysisPageProps<T>) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [allRows, setAllRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Flyout states for Method C (interactive insertion & editing)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const storageKey = `bgt_data_${endpoint}`;

  // Initial load: try localStorage first, fall back to mock data
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 60));
      const mockResult = MOCK_PAGES_DATA[endpoint];
      if (!mockResult) {
        throw new Error("Page data not found in mock database");
      }

      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllRows(parsed as T[]);
            setLoading(false);
            return;
          }
        } catch {
          // fallback to mock
        }
      }
      setAllRows((mockResult.rows || []) as T[]);
    } catch {
      setError("Failed to load page data.");
    } finally {
      setLoading(false);
    }
  }, [endpoint, storageKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Persist allRows to localStorage whenever modified
  const updateRows = useCallback((newRows: T[]) => {
    setAllRows(newRows);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newRows));
    } catch {
      // localStorage error fallback
    }
  }, [storageKey]);

  // Open Flyout for adding a new record
  const handleOpenAddModal = () => {
    const initial: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.key === "department") initial[col.key] = filters.department !== "All Departments" ? filters.department : "Finance";
      else if (col.key === "business_unit") initial[col.key] = filters.businessUnit !== "All Business Units" ? filters.businessUnit : "Corporate";
      else if (col.key === "status") initial[col.key] = "Approved";
      else if (col.key === "risk" || col.key === "risk_rating" || col.key === "risk_grade") initial[col.key] = "Medium";
      else initial[col.key] = "";
    });
    setFormData(initial);
    setEditingRow(null);
    setIsModalOpen(true);
  };

  // Open Flyout for editing an existing record
  const handleOpenEditModal = (row: T) => {
    setEditingRow(row);
    setFormData({ ...row });
    setIsModalOpen(true);
  };

  // Delete a record
  const handleDeleteRow = (targetRow: T) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const nextRows = allRows.filter((r) => r !== targetRow);
      updateRows(nextRows);
      showNotice("Record deleted successfully.");
    }
  };

  // Submit form for Add or Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      // Update existing
      const nextRows = allRows.map((r) => (r === editingRow ? ({ ...r, ...formData } as T) : r));
      updateRows(nextRows);
      showNotice("Record updated successfully!");
    } else {
      // Insert new
      const newRecord = { ...formData } as T;
      const nextRows = [newRecord, ...allRows];
      updateRows(nextRows);
      showNotice("New record added successfully!");
    }
    setIsModalOpen(false);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Apply active department & business unit filters
  const filteredRows = useCallback(() => {
    let result = [...allRows];
    if (filters.department && filters.department !== "All Departments") {
      result = result.filter((r) =>
        String(r.department || r.dept || "").toLowerCase() === filters.department.toLowerCase()
      );
    }
    if (filters.businessUnit && filters.businessUnit !== "All Business Units") {
      result = result.filter((r) =>
        String(r.business_unit || r.bu || "").toLowerCase() === filters.businessUnit.toLowerCase()
      );
    }
    return result;
  }, [allRows, filters.department, filters.businessUnit])();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const mockPayload = MOCK_PAGES_DATA[endpoint];
  const hasChart = (mockPayload?.chart_bars?.length ?? 0) > 0 || (mockPayload?.chart_spark?.length ?? 0) > 0;

  return (
    <div className="bgt-page-content">
      {notification && (
        <div className="bgt-audit-comment" style={{ borderColor: "var(--success)", background: "var(--success-tint)", padding: "10px 16px" }}>
          <strong style={{ color: "var(--success)" }}>✔ {notification}</strong>
        </div>
      )}

      <FilterBar filters={filters} onChange={setFilters} onApply={load} />
      <KpiStrip items={mockPayload?.kpis || []} />
      {hasChart && (
        <div className="bgt-chart-section">
          {chartType === "spark" && mockPayload?.chart_spark ? (
            <SparkChartPanel
              title={chartTitle ?? "Trend Analysis"}
              items={mockPayload.chart_spark}
              footnote={chartFootnote}
            />
          ) : mockPayload?.chart_bars ? (
            <BarChartPanel
              title={chartTitle ?? "Variance Analysis"}
              items={mockPayload.chart_bars}
              footnote={chartFootnote}
            />
          ) : null}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filteredRows}
        searchQuery={filters.search}
        searchKeys={searchKeys}
        exportFilename={exportFilename}
        onAddRecord={handleOpenAddModal}
        onEditRow={handleOpenEditModal}
        onDeleteRow={handleDeleteRow}
      />

      {mockPayload?.audit_comment && <AuditComment text={mockPayload.audit_comment} />}

      {/* Interactive Method C Modal / Flyout Form */}
      {isModalOpen && (
        <>
          <div className="bgt-flyout-overlay" onClick={() => setIsModalOpen(false)} />
          <div className="bgt-flyout">
            <div className="bgt-flyout-head">
              <h3>{editingRow ? "Edit Record" : "Add New Record"}</h3>
              <button type="button" className="bgt-flyout-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="bgt-flyout-body" onSubmit={handleSaveForm}>
              {columns.map((col) => (
                <div key={col.key} className="bgt-flyout-field">
                  <label>{col.label}</label>
                  {col.key === "department" ? (
                    <select
                      className="select"
                      value={formData[col.key] || "Finance"}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                    >
                      {["Finance", "Operations", "Marketing", "IT", "HR", "Sales"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : col.key === "business_unit" ? (
                    <select
                      className="select"
                      value={formData[col.key] || "Corporate"}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                    >
                      {["North America", "EMEA", "APAC", "Corporate"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={typeof formData[col.key] === "number" ? "number" : "text"}
                      value={formData[col.key] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          [col.key]: col.key.includes("pct") || col.key.includes("budget") || col.key.includes("actual") || col.key.includes("variance") || col.key.includes("amount")
                            ? Number(val) || val
                            : val,
                        });
                      }}
                      required
                    />
                  )}
                </div>
              ))}
              <div className="bgt-flyout-actions" style={{ marginTop: "16px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingRow ? "Update Record" : "Create Record"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
