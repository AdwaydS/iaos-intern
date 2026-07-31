import { Icon } from "../../../components/Icon";
import type { FilterState } from "../types";

const DEPARTMENTS = ["All Departments", "Finance", "Operations", "Marketing", "IT", "HR", "Sales"];
const BUSINESS_UNITS = ["All Business Units", "North America", "EMEA", "APAC", "Corporate"];

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onApply?: () => void;
}

export default function FilterBar({ filters, onChange, onApply }: FilterBarProps) {
  return (
    <div className="card bgt-filter-bar">
      <div className="bgt-filter-grid">
        <div className="field bgt-filter-field">
          <label>Department</label>
          <select
            className="select"
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="field bgt-filter-field">
          <label>Business Unit</label>
          <select
            className="select"
            value={filters.businessUnit}
            onChange={(e) => onChange({ ...filters, businessUnit: e.target.value })}
          >
            {BUSINESS_UNITS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field bgt-filter-field">
          <label>Date From</label>
          <input
            className="input"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        <div className="field bgt-filter-field">
          <label>Date To</label>
          <input
            className="input"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
        <div className="field bgt-filter-field bgt-filter-search">
          <label>Search</label>
          <div className="bgt-search-wrap">
            <Icon name="dashboard" size={16} />
            <input
              className="input"
              placeholder="Search records…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        {onApply && (
          <div className="bgt-filter-actions">
            <button type="button" className="btn btn-primary" onClick={onApply}>
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const DEFAULT_FILTERS: FilterState = {
  department: "All Departments",
  businessUnit: "All Business Units",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  search: "",
};
