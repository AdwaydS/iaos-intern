import { useMemo, useState } from "react";
import ExportButtons from "./ExportButtons";

export interface DataTableColumn<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
  searchQuery?: string;
  searchKeys?: (keyof T & string)[];
  pageSize?: number;
  exportFilename?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  onAddRecord?: () => void;
  onEditRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
}

type SortDir = "asc" | "desc";

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchQuery = "",
  searchKeys,
  pageSize = 10,
  exportFilename = "export",
  emptyMessage = "No records match the current filters.",
  onRowClick,
  rowClassName,
  onAddRecord,
  onEditRow,
  onDeleteRow,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let data = rows;
    if (q) {
      data = data.filter((row) =>
        keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av ?? "").localeCompare(String(bv ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, searchQuery, keys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const exportCols = columns.map((c) => ({ key: c.key, label: c.label }));

  const hasRowActions = Boolean(onEditRow || onDeleteRow);

  return (
    <div className="card bgt-table-card">
      <div className="bgt-table-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="bgt-table-count">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
          {onAddRecord && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAddRecord}
              style={{ fontSize: "12.5px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              + Add Record
            </button>
          )}
        </div>
        <ExportButtons filename={exportFilename} rows={paged as Record<string, unknown>[]} columns={exportCols} />
      </div>
      <div className="bgt-table-wrap">
        <table className="bgt-data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    col.align ? `align-${col.align}` : "",
                    col.sortable ? "sortable" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => toggleSort(col.key, col.sortable)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="bgt-sort-ind">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
              ))}
              {hasRowActions && <th className="align-center" style={{ width: "90px" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={i}
                className={[
                  rowClassName ? rowClassName(row) : "",
                  onRowClick ? "clickable" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => onRowClick?.(row)}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.align ? `align-${col.align}` : ""}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
                {hasRowActions && (
                  <td className="align-center" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      {onEditRow && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          title="Edit Record"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => onEditRow(row)}
                        >
                          ✎
                        </button>
                      )}
                      {onDeleteRow && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          title="Delete Record"
                          style={{ padding: "4px 8px", fontSize: "12px", color: "var(--danger)" }}
                          onClick={() => onDeleteRow(row)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + (hasRowActions ? 1 : 0)} className="bgt-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="bgt-pagination">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="bgt-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
