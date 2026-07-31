export interface FilterState {
  department: string;
  businessUnit: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export interface KpiItem {
  label: string;
  value: string | number;
  tone?: "navy" | "gold" | "success" | "danger";
  sublabel?: string;
  icon?: string;
}

export interface ChartBarItem {
  label: string;
  budget: number;
  actual: number;
  negative?: boolean;
}

export interface ChartSparkItem {
  label: string;
  value: number;
  direction: "over" | "under";
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
}

export interface PagePayload<T = Record<string, unknown>> {
  kpis: KpiItem[];
  chart_bars?: ChartBarItem[];
  chart_spark?: ChartSparkItem[];
  rows: T[];
  audit_comment?: string;
}

export interface ExceptionItem {
  id: number;
  cost_center: string;
  budget_owner: string;
  source_procedure: string;
  variance_amount: number;
  risk_grade: string;
  status: string;
  disposition_notes: string;
}

export interface RCMItem {
  id: number;
  risk_id: string;
  financial_assertion: string;
  control_description: string;
  control_owner: string;
  control_type: string;
}

export interface WorkingPaperItem {
  id: number;
  attachment_name: string;
  associated_procedure_id: number;
  upload_date: string;
  uploaded_by: string;
  review_status: string;
  audit_tickmarks: string[];
}

export interface KPISummary {
  live_risk_score: number;
  open_exceptions_count: number;
  testing_coverage_pct: number;
  action_tracker_rate: number;
}
