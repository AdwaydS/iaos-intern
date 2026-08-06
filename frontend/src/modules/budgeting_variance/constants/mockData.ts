import type { PagePayload } from "../types";

/* ------------------------------------------------------------------ */
/*  Shared lookup tables used to build rows                           */
/* ------------------------------------------------------------------ */
const DEPTS  = ["Finance","Operations","Marketing","IT","HR","Sales"] as const;
const BUS    = ["North America","EMEA","APAC","Corporate"] as const;
const OWNERS = ["Alice Chen","Bob Marley","Carol Diaz","Dave Park","Eve Torres","Frank Liu","Grace Kim","Hiro Tanaka","Isabel Ruiz","James O'Brien","Karen Patel","Leo Nguyen","Maria Santos","Nate Johnson","Olivia Brown","Paul Fischer","Quinn Adams","Rachel Lee","Sam Wilson","Tara Gupta"];

const pick = <T,>(arr: readonly T[], i: number): T => arr[i % arr.length];

/* ------------------------------------------------------------------ */
/*  PAGE DATA — every page has 20+ rows, kpis, chart, audit_comment   */
/* ------------------------------------------------------------------ */
export const MOCK_PAGES_DATA: Record<string, PagePayload<any>> = {

  /* ============================================================== */
  /*  PAGE 2 — Budget vs Actual by Head                             */
  /* ============================================================== */
  "budget-vs-actual": {
    kpis: [
      { label: "Total Budget", value: "$48,750,000", tone: "navy", icon: "wallet", sublabel: "FY 2026 YTD" },
      { label: "Total Actual", value: "$50,120,000", tone: "gold", icon: "activity", sublabel: "+2.8% over budget" },
      { label: "Net Variance", value: "$1,370,000", tone: "danger", icon: "alert-triangle", sublabel: "Adverse" },
      { label: "Heads Over Budget", value: 8, tone: "danger", icon: "trending-up", sublabel: "of 20 cost heads" },
    ],
    chart_bars: [
      { label: "Salaries", budget: 12000000, actual: 11800000 },
      { label: "Marketing", budget: 8000000, actual: 9200000, negative: true },
      { label: "IT Infra", budget: 6000000, actual: 5500000 },
      { label: "Travel", budget: 3000000, actual: 3400000, negative: true },
      { label: "Consulting", budget: 4500000, actual: 5100000, negative: true },
      { label: "Utilities", budget: 1800000, actual: 1750000 },
    ],
    rows: [
      { cost_head: "Salaries & Wages", department: "HR", business_unit: "Corporate", budget: 12000000, actual: 11800000, variance_pct: -1.7, status: "Favourable" },
      { cost_head: "Marketing & Advertising", department: "Marketing", business_unit: "North America", budget: 8000000, actual: 9200000, variance_pct: 15.0, status: "Adverse" },
      { cost_head: "IT Infrastructure", department: "IT", business_unit: "Corporate", budget: 6000000, actual: 5500000, variance_pct: -8.3, status: "Favourable" },
      { cost_head: "Travel & Entertainment", department: "Sales", business_unit: "EMEA", budget: 3000000, actual: 3400000, variance_pct: 13.3, status: "Adverse" },
      { cost_head: "Office Supplies", department: "Operations", business_unit: "APAC", budget: 2000000, actual: 1800000, variance_pct: -10.0, status: "Favourable" },
      { cost_head: "Professional Fees", department: "Finance", business_unit: "Corporate", budget: 4500000, actual: 5100000, variance_pct: 13.3, status: "Adverse" },
      { cost_head: "Utilities", department: "Operations", business_unit: "North America", budget: 1800000, actual: 1750000, variance_pct: -2.8, status: "Favourable" },
      { cost_head: "Training & Development", department: "HR", business_unit: "EMEA", budget: 1200000, actual: 980000, variance_pct: -18.3, status: "Favourable" },
      { cost_head: "Software Licences", department: "IT", business_unit: "North America", budget: 2200000, actual: 2450000, variance_pct: 11.4, status: "Adverse" },
      { cost_head: "Facilities Maintenance", department: "Operations", business_unit: "Corporate", budget: 1500000, actual: 1420000, variance_pct: -5.3, status: "Favourable" },
      { cost_head: "Insurance Premiums", department: "Finance", business_unit: "EMEA", budget: 900000, actual: 920000, variance_pct: 2.2, status: "Adverse" },
      { cost_head: "Recruitment Costs", department: "HR", business_unit: "APAC", budget: 750000, actual: 680000, variance_pct: -9.3, status: "Favourable" },
      { cost_head: "Cloud Services", department: "IT", business_unit: "APAC", budget: 1800000, actual: 2100000, variance_pct: 16.7, status: "Adverse" },
      { cost_head: "Legal Fees", department: "Finance", business_unit: "North America", budget: 600000, actual: 580000, variance_pct: -3.3, status: "Favourable" },
      { cost_head: "Sales Commissions", department: "Sales", business_unit: "North America", budget: 3200000, actual: 3500000, variance_pct: 9.4, status: "Adverse" },
      { cost_head: "R&D Materials", department: "Operations", business_unit: "EMEA", budget: 1100000, actual: 950000, variance_pct: -13.6, status: "Favourable" },
      { cost_head: "Telecommunications", department: "IT", business_unit: "Corporate", budget: 450000, actual: 470000, variance_pct: 4.4, status: "Adverse" },
      { cost_head: "Printing & Stationery", department: "Operations", business_unit: "APAC", budget: 180000, actual: 160000, variance_pct: -11.1, status: "Favourable" },
      { cost_head: "Vehicle Fleet", department: "Sales", business_unit: "EMEA", budget: 680000, actual: 720000, variance_pct: 5.9, status: "Adverse" },
      { cost_head: "Employee Benefits", department: "HR", business_unit: "North America", budget: 2400000, actual: 2350000, variance_pct: -2.1, status: "Favourable" },
      { cost_head: "Security Services", department: "Operations", business_unit: "Corporate", budget: 320000, actual: 310000, variance_pct: -3.1, status: "Favourable" },
      { cost_head: "Consulting – Strategy", department: "Finance", business_unit: "APAC", budget: 500000, actual: 620000, variance_pct: 24.0, status: "Adverse" },
    ],
    audit_comment: "Marketing and Cloud Services show adverse variances exceeding the 10% tolerance. Recommend walkthrough with department heads and review of accrual completeness.",
  },

  /* ============================================================== */
  /*  PAGE 3 — Pre-Approval Timing                                  */
  /* ============================================================== */
  "pre-approval-timing": {
    kpis: [
      { label: "Cost Centres Assessed", value: 22, tone: "navy", icon: "clipboard" },
      { label: "Compliant", value: 14, tone: "success", icon: "check", sublabel: "64% compliance" },
      { label: "Non-Compliant", value: 6, tone: "danger", icon: "alert-triangle" },
      { label: "Missing Approval", value: 2, tone: "gold", icon: "activity" },
    ],
    chart_bars: [
      { label: "CC-1001", budget: 100, actual: 100 },
      { label: "CC-1002", budget: 100, actual: 87, negative: true },
      { label: "CC-1003", budget: 100, actual: 112, negative: true },
      { label: "CC-1004", budget: 100, actual: 94 },
      { label: "CC-1005", budget: 100, actual: 0, negative: true },
      { label: "CC-1006", budget: 100, actual: 100 },
    ],
    rows: [
      { cost_center: "CC-1001", department: "Finance", business_unit: "Corporate", owner: "Alice Chen", approval_date: "2025-12-28", period_start: "2026-01-01", days_before: 4, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1002", department: "Marketing", business_unit: "North America", owner: "Bob Marley", approval_date: "2026-01-15", period_start: "2026-01-01", days_before: -14, pct_approved: 87, status: "Non-Compliant" },
      { cost_center: "CC-1003", department: "Operations", business_unit: "EMEA", owner: "Carol Diaz", approval_date: "2026-02-01", period_start: "2026-01-01", days_before: -31, pct_approved: 112, status: "Non-Compliant" },
      { cost_center: "CC-1004", department: "IT", business_unit: "Corporate", owner: "Dave Park", approval_date: "2025-12-20", period_start: "2026-01-01", days_before: 12, pct_approved: 94, status: "Compliant" },
      { cost_center: "CC-1005", department: "Sales", business_unit: "EMEA", owner: "Eve Torres", approval_date: "—", period_start: "2026-01-01", days_before: 0, pct_approved: 0, status: "Missing" },
      { cost_center: "CC-1006", department: "HR", business_unit: "North America", owner: "Frank Liu", approval_date: "2025-11-30", period_start: "2026-01-01", days_before: 32, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1007", department: "Finance", business_unit: "APAC", owner: "Grace Kim", approval_date: "2025-12-25", period_start: "2026-01-01", days_before: 7, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1008", department: "IT", business_unit: "EMEA", owner: "Hiro Tanaka", approval_date: "2026-01-08", period_start: "2026-01-01", days_before: -7, pct_approved: 92, status: "Non-Compliant" },
      { cost_center: "CC-1009", department: "Operations", business_unit: "Corporate", owner: "Isabel Ruiz", approval_date: "2025-12-15", period_start: "2026-01-01", days_before: 17, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1010", department: "Sales", business_unit: "North America", owner: "James O'Brien", approval_date: "2025-12-30", period_start: "2026-01-01", days_before: 2, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1011", department: "Marketing", business_unit: "APAC", owner: "Karen Patel", approval_date: "2026-01-20", period_start: "2026-01-01", days_before: -19, pct_approved: 78, status: "Non-Compliant" },
      { cost_center: "CC-1012", department: "HR", business_unit: "Corporate", owner: "Leo Nguyen", approval_date: "2025-12-22", period_start: "2026-01-01", days_before: 10, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1013", department: "Finance", business_unit: "EMEA", owner: "Maria Santos", approval_date: "2025-12-18", period_start: "2026-01-01", days_before: 14, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1014", department: "Operations", business_unit: "APAC", owner: "Nate Johnson", approval_date: "2025-12-29", period_start: "2026-01-01", days_before: 3, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1015", department: "IT", business_unit: "North America", owner: "Olivia Brown", approval_date: "—", period_start: "2026-01-01", days_before: 0, pct_approved: 0, status: "Missing" },
      { cost_center: "CC-1016", department: "Sales", business_unit: "Corporate", owner: "Paul Fischer", approval_date: "2026-01-12", period_start: "2026-01-01", days_before: -11, pct_approved: 85, status: "Non-Compliant" },
      { cost_center: "CC-1017", department: "Marketing", business_unit: "EMEA", owner: "Quinn Adams", approval_date: "2025-12-27", period_start: "2026-01-01", days_before: 5, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1018", department: "HR", business_unit: "APAC", owner: "Rachel Lee", approval_date: "2025-12-10", period_start: "2026-01-01", days_before: 22, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1019", department: "Finance", business_unit: "North America", owner: "Sam Wilson", approval_date: "2025-12-31", period_start: "2026-01-01", days_before: 1, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1020", department: "Operations", business_unit: "EMEA", owner: "Tara Gupta", approval_date: "2026-01-25", period_start: "2026-01-01", days_before: -24, pct_approved: 65, status: "Non-Compliant" },
      { cost_center: "CC-1021", department: "IT", business_unit: "APAC", owner: "Alice Chen", approval_date: "2025-12-19", period_start: "2026-01-01", days_before: 13, pct_approved: 100, status: "Compliant" },
      { cost_center: "CC-1022", department: "Sales", business_unit: "Corporate", owner: "Bob Marley", approval_date: "2025-12-26", period_start: "2026-01-01", days_before: 6, pct_approved: 100, status: "Compliant" },
    ],
    audit_comment: "CC-1002, CC-1003, CC-1008, CC-1011, CC-1016, CC-1020 budgets were approved after period start, violating the pre-approval policy. CC-1005 and CC-1015 have no recorded approval — escalate to management.",
  },

  /* ============================================================== */
  /*  PAGE 4 — Chronic Overspend                                    */
  /* ============================================================== */
  "chronic-overspend": {
    kpis: [
      { label: "Chronic Heads", value: 20, tone: "danger", icon: "alert-triangle", sublabel: ">5% for 3+ periods" },
      { label: "Total Overspend", value: "$4,850,000", tone: "danger", icon: "wallet" },
      { label: "Critical Risk", value: 5, tone: "danger", icon: "shield" },
      { label: "Avg Overspend %", value: "12.4%", tone: "gold", icon: "trending-up" },
    ],
    chart_bars: [
      { label: "CC-1001", budget: 100, actual: 121, negative: true },
      { label: "CC-1003", budget: 100, actual: 115, negative: true },
      { label: "CC-1002", budget: 100, actual: 109, negative: true },
      { label: "CC-1007", budget: 100, actual: 108, negative: true },
      { label: "CC-1012", budget: 100, actual: 118, negative: true },
    ],
    rows: [
      { cost_center: "CC-1001", cost_head: "Salaries", department: "HR", business_unit: "Corporate", periods_exceeded: 6, avg_overspend_pct: 12.1, total_variance: 580000, risk: "Critical" },
      { cost_center: "CC-1003", cost_head: "Marketing Spend", department: "Marketing", business_unit: "North America", periods_exceeded: 5, avg_overspend_pct: 15.0, total_variance: 420000, risk: "Critical" },
      { cost_center: "CC-1002", cost_head: "Travel", department: "Sales", business_unit: "EMEA", periods_exceeded: 4, avg_overspend_pct: 9.0, total_variance: 185000, risk: "High" },
      { cost_center: "CC-1007", cost_head: "Consulting", department: "Finance", business_unit: "Corporate", periods_exceeded: 3, avg_overspend_pct: 7.5, total_variance: 95000, risk: "Medium" },
      { cost_center: "CC-1004", cost_head: "Cloud Hosting", department: "IT", business_unit: "APAC", periods_exceeded: 5, avg_overspend_pct: 18.2, total_variance: 650000, risk: "Critical" },
      { cost_center: "CC-1005", cost_head: "Logistics", department: "Operations", business_unit: "EMEA", periods_exceeded: 4, avg_overspend_pct: 11.3, total_variance: 310000, risk: "High" },
      { cost_center: "CC-1006", cost_head: "Recruitment Ads", department: "HR", business_unit: "North America", periods_exceeded: 3, avg_overspend_pct: 8.7, total_variance: 120000, risk: "Medium" },
      { cost_center: "CC-1008", cost_head: "Software Licences", department: "IT", business_unit: "Corporate", periods_exceeded: 6, avg_overspend_pct: 14.5, total_variance: 480000, risk: "Critical" },
      { cost_center: "CC-1009", cost_head: "Office Rent", department: "Operations", business_unit: "North America", periods_exceeded: 3, avg_overspend_pct: 6.2, total_variance: 85000, risk: "Medium" },
      { cost_center: "CC-1010", cost_head: "Commission Payouts", department: "Sales", business_unit: "APAC", periods_exceeded: 4, avg_overspend_pct: 10.8, total_variance: 275000, risk: "High" },
      { cost_center: "CC-1011", cost_head: "Digital Ads", department: "Marketing", business_unit: "EMEA", periods_exceeded: 5, avg_overspend_pct: 16.4, total_variance: 390000, risk: "Critical" },
      { cost_center: "CC-1012", cost_head: "Subcontractors", department: "Operations", business_unit: "Corporate", periods_exceeded: 4, avg_overspend_pct: 13.1, total_variance: 345000, risk: "High" },
      { cost_center: "CC-1013", cost_head: "Training Events", department: "HR", business_unit: "APAC", periods_exceeded: 3, avg_overspend_pct: 7.9, total_variance: 68000, risk: "Medium" },
      { cost_center: "CC-1014", cost_head: "Audit Fees", department: "Finance", business_unit: "EMEA", periods_exceeded: 3, avg_overspend_pct: 5.8, total_variance: 42000, risk: "Medium" },
      { cost_center: "CC-1015", cost_head: "Network Equipment", department: "IT", business_unit: "North America", periods_exceeded: 4, avg_overspend_pct: 11.0, total_variance: 195000, risk: "High" },
      { cost_center: "CC-1016", cost_head: "Client Entertainment", department: "Sales", business_unit: "Corporate", periods_exceeded: 3, avg_overspend_pct: 9.4, total_variance: 78000, risk: "Medium" },
      { cost_center: "CC-1017", cost_head: "PR & Events", department: "Marketing", business_unit: "APAC", periods_exceeded: 4, avg_overspend_pct: 12.7, total_variance: 210000, risk: "High" },
      { cost_center: "CC-1018", cost_head: "Cleaning Services", department: "Operations", business_unit: "EMEA", periods_exceeded: 3, avg_overspend_pct: 6.5, total_variance: 32000, risk: "Medium" },
      { cost_center: "CC-1019", cost_head: "Tax Advisory", department: "Finance", business_unit: "North America", periods_exceeded: 3, avg_overspend_pct: 8.1, total_variance: 55000, risk: "Medium" },
      { cost_center: "CC-1020", cost_head: "Data Centre", department: "IT", business_unit: "EMEA", periods_exceeded: 5, avg_overspend_pct: 19.5, total_variance: 730000, risk: "Critical" },
    ],
    audit_comment: "CC-1020 Data Centre has exceeded budget by 19.5% average across 5 consecutive periods. Root cause analysis and management action plan required.",
  },

  /* ============================================================== */
  /*  PAGE 5 — Rebudget / Revision History                          */
  /* ============================================================== */
  "rebudget-revision": {
    kpis: [
      { label: "Revisions YTD", value: 22, tone: "navy", icon: "layers" },
      { label: "Net Budget Change", value: "+$6,400,000", tone: "gold", icon: "wallet" },
      { label: "Pending Approval", value: 4, tone: "gold", icon: "clipboard" },
      { label: "Avg Change %", value: "15.2%", tone: "danger", icon: "trending-up" },
    ],
    chart_bars: [
      { label: "REV-001", budget: 5000000, actual: 5800000 },
      { label: "REV-003", budget: 1500000, actual: 2100000, negative: true },
      { label: "REV-005", budget: 2200000, actual: 2800000, negative: true },
      { label: "REV-008", budget: 3500000, actual: 3100000 },
      { label: "REV-012", budget: 1200000, actual: 1650000, negative: true },
    ],
    rows: (() => {
      const reasons = ["Headcount expansion","Campaign deferral","Cloud migration","Market conditions","Regulatory mandate","Scope increase","Currency impact","Vendor renegotiation","Project delay","Cost savings initiative"];
      const statuses = ["Approved","Approved","Approved","Approved","Pending","Approved","Approved","Pending","Approved","Approved","Approved","Approved","Pending","Approved","Approved","Approved","Approved","Approved","Pending","Approved","Approved","Approved"];
      return Array.from({ length: 22 }, (_, i) => ({
        revision_id: `REV-2026-${String(i+1).padStart(3,"0")}`,
        cost_center: `CC-${1001 + (i % 15)}`,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        original_budget: 1000000 + i * 350000,
        revised_budget: 1000000 + i * 350000 + (i % 3 === 0 ? -150000 : 200000 + i * 25000),
        change_pct: parseFloat(((i % 3 === 0 ? -150000 : 200000 + i * 25000) / (1000000 + i * 350000) * 100).toFixed(1)),
        approver: i % 5 === 0 ? "CFO Office" : i % 3 === 0 ? "VP Finance" : pick(OWNERS, i + 5),
        approval_date: statuses[i] === "Pending" ? "—" : `2026-${String(2 + Math.floor(i / 5)).padStart(2,"0")}-${String(5 + (i % 20)).padStart(2,"0")}`,
        reason: reasons[i % reasons.length],
        status: statuses[i],
      }));
    })(),
    audit_comment: "4 revisions pending approval including 40% increase for cloud migration. Verify business case documentation and board notification requirements.",
  },

  /* ============================================================== */
  /*  PAGE 6 — Assumption Reasonableness                            */
  /* ============================================================== */
  "assumption-reasonableness": {
    kpis: [
      { label: "Assumptions Tested", value: 20, tone: "navy", icon: "file-check" },
      { label: "Reasonable", value: 11, tone: "success", icon: "check" },
      { label: "Questionable", value: 5, tone: "gold", icon: "alert-triangle" },
      { label: "Aggressive", value: 4, tone: "danger", icon: "trending-up" },
    ],
    chart_bars: [
      { label: "Rev Growth", budget: 8.5, actual: 6.2 },
      { label: "Inflation", budget: 3.0, actual: 2.8 },
      { label: "FX Rate", budget: 9.2, actual: 9.4 },
      { label: "Headcount", budget: 12.0, actual: 5.0, negative: true },
      { label: "Attrition", budget: 8.0, actual: 10.2, negative: true },
    ],
    rows: (() => {
      const categories = ["Revenue Growth","Inflation Rate","FX Rate (USD/EUR)","Headcount Growth","Attrition Rate","Energy Costs","Raw Material Index","Wage Inflation","Cloud Spend Growth","Capex Intensity","Rent Escalation","Insurance Premium","Freight Costs","Interest Rate","Tax Rate","Marketing ROI","Sales Volume","Productivity Gain","Outsourcing Cost","Debt Service Ratio"];
      const outcomes: ("Reasonable"|"Questionable"|"Aggressive")[] = ["Questionable","Reasonable","Reasonable","Aggressive","Reasonable","Questionable","Reasonable","Reasonable","Aggressive","Reasonable","Reasonable","Questionable","Reasonable","Reasonable","Aggressive","Questionable","Reasonable","Reasonable","Aggressive","Questionable"];
      return categories.map((cat, i) => ({
        assumption_id: `ASM-${String(i+1).padStart(2,"0")}`,
        category: cat,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        budget_assumption: `${(3 + i * 0.8).toFixed(1)}%`,
        historical_avg: `${(2.5 + i * 0.6).toFixed(1)}%`,
        benchmark: `${(2.8 + i * 0.7).toFixed(1)}%`,
        variance: `${i % 3 === 0 ? "+" : "-"}${(0.5 + i * 0.2).toFixed(1)}pp`,
        reasonableness: outcomes[i],
      }));
    })(),
    audit_comment: "Revenue growth assumption of 8.5% exceeds historical average by 2.3pp. Headcount growth of 12% appears aggressive relative to 5% historical trend.",
  },

  /* ============================================================== */
  /*  PAGE 7 — Flash vs Final                                       */
  /* ============================================================== */
  "flash-vs-final": {
    kpis: [
      { label: "Periods Analysed", value: 20, tone: "navy", icon: "activity" },
      { label: "Avg Late Adj.", value: "$22,150", tone: "gold", icon: "wallet" },
      { label: "Max Adjustment", value: "41.9%", tone: "danger", icon: "alert-triangle", sublabel: "Apr CC-1001" },
      { label: "Material Adjustments", value: 7, tone: "danger", icon: "trending-up" },
    ],
    chart_bars: [
      { label: "Jan CC-1001", budget: 120000, actual: 145000, negative: true },
      { label: "Feb CC-1002", budget: 45000, actual: 42000 },
      { label: "Mar CC-1003", budget: 78000, actual: 95000, negative: true },
      { label: "Apr CC-1001", budget: 62000, actual: 88000, negative: true },
      { label: "May CC-1004", budget: 55000, actual: 48000 },
      { label: "Jun CC-1005", budget: 92000, actual: 110000, negative: true },
    ],
    rows: (() => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];
      const centers = ["CC-1001","CC-1002","CC-1003","CC-1004","CC-1005"];
      return Array.from({ length: 20 }, (_, i) => {
        const flash = 40000 + i * 12000 + (i % 3) * 8000;
        const final_v = flash + (i % 4 === 0 ? 25000 : i % 3 === 0 ? -5000 : 15000);
        const adj = final_v - flash;
        return {
          period: `${months[Math.floor(i / 2)]} 2026`,
          cost_center: centers[i % centers.length],
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          flash_variance: flash,
          final_variance: final_v,
          late_adjustment: adj,
          adjustment_pct: parseFloat((adj / flash * 100).toFixed(1)),
        };
      });
    })(),
    audit_comment: "April flash-to-final adjustment of 41.9% on CC-1001 suggests incomplete accruals at flash close. Review close process timing and cut-off controls.",
  },

  /* ============================================================== */
  /*  PAGE 8 — Rolling Forecast                                     */
  /* ============================================================== */
  "rolling-forecast": {
    kpis: [
      { label: "Departments", value: 20, tone: "navy", icon: "users" },
      { label: "Avg Accuracy", value: "85.9%", tone: "gold", icon: "activity" },
      { label: "Overdue Updates", value: 4, tone: "danger", icon: "alert-triangle" },
      { label: "At Risk", value: 5, tone: "gold", icon: "shield" },
    ],
    chart_bars: [
      { label: "Finance", budget: 95, actual: 94.2 },
      { label: "Marketing", budget: 85, actual: 72.5, negative: true },
      { label: "Operations", budget: 90, actual: 91 },
      { label: "IT", budget: 85, actual: 76.3, negative: true },
      { label: "HR", budget: 90, actual: 88.1 },
      { label: "Sales", budget: 85, actual: 80.4, negative: true },
    ],
    rows: (() => {
      const statuses = ["On Track","At Risk","On Track","Overdue","On Track","At Risk","On Track","On Track","Overdue","At Risk","On Track","On Track","On Track","Overdue","At Risk","On Track","On Track","On Track","At Risk","Overdue"];
      const cadences = ["Monthly","Quarterly","Monthly","Quarterly","Monthly","Monthly","Quarterly","Monthly","Quarterly","Monthly","Monthly","Quarterly","Monthly","Quarterly","Monthly","Monthly","Monthly","Quarterly","Monthly","Quarterly"];
      return Array.from({ length: 20 }, (_, i) => ({
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        last_update: `2026-${String(4 + Math.floor(i / 5)).padStart(2,"0")}-${String(5 + (i % 25)).padStart(2,"0")}`,
        forecast_accuracy: parseFloat((72 + Math.random() * 26).toFixed(1)),
        update_cadence: cadences[i],
        variance_to_actual: parseFloat((-5 + Math.random() * 18).toFixed(1)),
        status: statuses[i],
      }));
    })(),
    audit_comment: "4 departments overdue on forecast updates. Marketing quarterly cadence may be insufficient given high variance profile.",
  },

  /* ============================================================== */
  /*  PAGE 9 — Zero-Based Budget                                    */
  /* ============================================================== */
  "zero-based-budget": {
    kpis: [
      { label: "Packages Reviewed", value: 22, tone: "navy", icon: "grid" },
      { label: "Total Requested", value: "$18,500,000", tone: "navy", icon: "wallet" },
      { label: "Total Approved", value: "$15,200,000", tone: "success", icon: "check", sublabel: "82% approval rate" },
      { label: "Reduced Packages", value: 8, tone: "gold", icon: "alert-triangle" },
    ],
    chart_bars: [
      { label: "Digital Campaigns", budget: 2400000, actual: 2200000 },
      { label: "Legacy Maint.", budget: 800000, actual: 400000, negative: true },
      { label: "Leadership Dev", budget: 350000, actual: 350000 },
      { label: "Cloud Migration", budget: 1800000, actual: 1500000, negative: true },
      { label: "Sales Tools", budget: 650000, actual: 650000 },
    ],
    rows: (() => {
      const activities = ["Digital Campaigns","Legacy System Maintenance","Leadership Training","Cloud Migration","CRM Upgrade","Compliance Training","Warehouse Automation","Fleet Management","Data Analytics Platform","Customer Support Centre","Brand Refresh","ERP Module Add-on","Security Audit","Market Research","Employee Wellness","Office Renovation","Supply Chain Optimisation","Sales Enablement Tools","Tax Compliance System","R&D Lab Equipment","Cybersecurity Tooling","Sustainability Reporting"];
      return activities.map((act, i) => {
        const requested = 200000 + i * 120000 + (i % 3) * 80000;
        const approved = i % 3 === 1 ? Math.round(requested * 0.6) : requested;
        return {
          package_id: `ZBB-${String(i+1).padStart(3,"0")}`,
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          activity: act,
          justification_score: parseFloat((3 + Math.random() * 7).toFixed(1)),
          rank: i + 1,
          requested,
          approved,
          status: approved < requested ? "Reduced" as const : "Approved" as const,
        };
      });
    })(),
    audit_comment: "Legacy System Maintenance package reduced by 50% — verify decommission timeline and risk of service disruption.",
  },

  /* ============================================================== */
  /*  PAGE 10 — Capex Utilisation                                   */
  /* ============================================================== */
  "capex-utilisation": {
    kpis: [
      { label: "Active Projects", value: 20, tone: "navy", icon: "building" },
      { label: "Total Capex Budget", value: "$78,500,000", tone: "navy", icon: "wallet" },
      { label: "Avg Utilisation", value: "64.2%", tone: "gold", icon: "activity" },
      { label: "Delayed Projects", value: 6, tone: "danger", icon: "alert-triangle" },
    ],
    chart_bars: [
      { label: "ERP Mod", budget: 8500000, actual: 5800000 },
      { label: "Warehouse", budget: 4200000, actual: 3900000 },
      { label: "Office Fit", budget: 1800000, actual: 450000, negative: true },
      { label: "Data Centre", budget: 5500000, actual: 4200000 },
      { label: "Fleet EV", budget: 3200000, actual: 2800000 },
    ],
    rows: (() => {
      const projects = ["ERP Modernisation","Warehouse Automation","Office Fit-out","Data Centre Upgrade","Fleet EV Conversion","Solar Panel Installation","Manufacturing Line 4","R&D Lab Expansion","Network Infrastructure","Security System Upgrade","Parking Structure","HVAC Replacement","Server Farm Expansion","Retail Store Remodel","Distribution Hub","Call Centre Build","Testing Facility","Water Treatment Plant","Fiber Optic Deployment","Emergency Generator"];
      const statuses = ["In Progress","On Track","Delayed","In Progress","On Track","Delayed","On Track","In Progress","On Track","Delayed","On Track","In Progress","On Track","Delayed","In Progress","On Track","Delayed","On Track","In Progress","Delayed"];
      return projects.map((proj, i) => {
        const budget = 1500000 + i * 450000;
        const committed = Math.round(budget * (0.6 + Math.random() * 0.35));
        const spent = Math.round(committed * (0.4 + Math.random() * 0.55));
        return {
          project_id: `CPX-${101 + i}`,
          project_name: proj,
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          approved_budget: budget,
          committed,
          spent,
          utilisation_pct: parseFloat((spent / budget * 100).toFixed(1)),
          slippage_months: statuses[i] === "Delayed" ? 2 + (i % 5) : 0,
          status: statuses[i],
        };
      });
    })(),
    audit_comment: "6 projects showing delays with combined slippage. Review project governance and capital allocation re-prioritisation.",
  },

  /* ============================================================== */
  /*  PAGE 11 — Departmental Scorecard                              */
  /* ============================================================== */
  "departmental-scorecard": {
    kpis: [
      { label: "Departments Scored", value: 20, tone: "navy", icon: "users" },
      { label: "Avg Composite", value: 84, tone: "success", icon: "activity" },
      { label: "A-Rated", value: 6, tone: "success", icon: "check" },
      { label: "C-Rated", value: 4, tone: "danger", icon: "alert-triangle" },
    ],
    chart_bars: [
      { label: "Finance", budget: 90, actual: 95 },
      { label: "Marketing", budget: 90, actual: 72, negative: true },
      { label: "Operations", budget: 90, actual: 91 },
      { label: "IT", budget: 90, actual: 83 },
      { label: "HR", budget: 90, actual: 88 },
      { label: "Sales", budget: 90, actual: 79, negative: true },
    ],
    rows: (() => {
      return Array.from({ length: 20 }, (_, i) => {
        const ba = 70 + Math.floor(Math.random() * 28);
        const fa = 68 + Math.floor(Math.random() * 30);
        const cs = 75 + Math.floor(Math.random() * 24);
        const vm = 65 + Math.floor(Math.random() * 30);
        const comp = Math.round((ba + fa + cs + vm) / 4);
        return {
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          budget_accuracy: ba,
          forecast_accuracy: fa,
          compliance_score: cs,
          variance_mgmt: vm,
          composite_score: comp,
          rating: comp >= 90 ? "A" : comp >= 80 ? "B" : "C",
        };
      });
    })(),
    audit_comment: "4 departments rated C driven by budget accuracy and variance management deficiencies. Recommend targeted remediation.",
  },

  /* ============================================================== */
  /*  PAGE 12 — Unspent / Parked Budget                             */
  /* ============================================================== */
  "unspent-parked": {
    kpis: [
      { label: "Parked Budget", value: "$8,250,000", tone: "navy", icon: "wallet" },
      { label: "Dec Release Spike", value: "44%", tone: "danger", icon: "alert-triangle", sublabel: "CC-1001" },
      { label: "Flagged CCs", value: 9, tone: "danger", icon: "activity" },
      { label: "Normal Pattern", value: 11, tone: "success", icon: "check" },
    ],
    chart_bars: [
      { label: "Q1", budget: 100, actual: 8 },
      { label: "Q2", budget: 100, actual: 6 },
      { label: "Q3", budget: 100, actual: 9 },
      { label: "Q4 Oct", budget: 100, actual: 15, negative: true },
      { label: "Q4 Nov", budget: 100, actual: 28, negative: true },
      { label: "Q4 Dec", budget: 100, actual: 44, negative: true },
    ],
    rows: (() => {
      return Array.from({ length: 20 }, (_, i) => {
        const isSpike = i % 3 !== 2;
        return {
          cost_center: `CC-${1001 + i}`,
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          parked_amount: 150000 + i * 50000,
          q1_release_pct: 5 + Math.floor(Math.random() * 20),
          q2_release_pct: 4 + Math.floor(Math.random() * 22),
          q3_release_pct: 6 + Math.floor(Math.random() * 24),
          q4_dec_release_pct: isSpike ? 30 + Math.floor(Math.random() * 20) : 12 + Math.floor(Math.random() * 10),
          flag: isSpike ? "Year-End Spike" : "Normal",
        };
      });
    })(),
    audit_comment: "44% of CC-1001 parked budget released in December indicates spend-it-or-lose-it behaviour. Test sample of December POs for business justification.",
  },

  /* ============================================================== */
  /*  PAGE 13 — Cost Driver Trend                                   */
  /* ============================================================== */
  "cost-driver-trend": {
    kpis: [
      { label: "Drivers Analysed", value: 20, tone: "navy", icon: "activity" },
      { label: "Volume Impact", value: "+$1,820,000", tone: "danger", icon: "trending-up" },
      { label: "Price Savings", value: "-$640,000", tone: "success", icon: "wallet" },
      { label: "Productivity Gain", value: "-$950,000", tone: "success", icon: "check" },
    ],
    chart_bars: [
      { label: "Volume", budget: 100, actual: 108, negative: true },
      { label: "Price", budget: 100, actual: 96 },
      { label: "Mix", budget: 100, actual: 102, negative: true },
      { label: "Exchange", budget: 100, actual: 98 },
      { label: "Productivity", budget: 100, actual: 95 },
    ],
    rows: (() => {
      const drivers = ["Volume","Price","Mix","Exchange Rate","Productivity","Labour Rate","Material Cost","Energy Price","Freight","Depreciation","Outsourcing Rate","Overhead Absorption","Waste Factor","Downtime","Yield","Capacity Utilisation","Quality Defects","Inventory Carry","Distribution","Technology"];
      return drivers.map((d, i) => ({
        driver: d,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        budget_index: 100,
        actual_index: 92 + Math.floor(Math.random() * 18),
        variance_pct: parseFloat((-8 + Math.random() * 16).toFixed(1)),
        impact_amount: Math.round((-400000 + Math.random() * 800000) / 1000) * 1000,
        direction: i % 3 === 0 ? "Unfavourable" as const : "Favourable" as const,
      }));
    })(),
    audit_comment: "Volume-driven unfavourable variance partially offset by productivity gains. Validate volume assumptions against production data.",
  },

  /* ============================================================== */
  /*  PAGE 14 — Contingency Reserve                                 */
  /* ============================================================== */
  "contingency-reserve": {
    kpis: [
      { label: "Total Reserves", value: "$22,000,000", tone: "navy", icon: "shield" },
      { label: "Total Drawn", value: "$14,350,000", tone: "gold", icon: "wallet", sublabel: "65.2% utilisation" },
      { label: "Policy Breach", value: 3, tone: "danger", icon: "alert-triangle" },
      { label: "Near Limit", value: 5, tone: "gold", icon: "activity" },
    ],
    chart_bars: [
      { label: "RES-001", budget: 2000000, actual: 850000 },
      { label: "RES-002", budget: 1500000, actual: 1200000 },
      { label: "RES-003", budget: 500000, actual: 520000, negative: true },
      { label: "RES-005", budget: 1800000, actual: 1750000 },
      { label: "RES-008", budget: 900000, actual: 945000, negative: true },
    ],
    rows: (() => {
      const types = ["Contingency","Management Reserve","Project Contingency","Operational Reserve","Strategic Reserve"];
      const statuses = ["Within Policy","Near Limit","Breached","Within Policy","Near Limit","Within Policy","Within Policy","Breached","Near Limit","Within Policy","Within Policy","Near Limit","Within Policy","Within Policy","Breached","Within Policy","Near Limit","Within Policy","Within Policy","Within Policy"];
      return Array.from({ length: 20 }, (_, i) => {
        const alloc = 400000 + i * 120000;
        const drawn = Math.round(alloc * (0.3 + Math.random() * 0.75));
        return {
          reserve_id: `RES-${String(i+1).padStart(3,"0")}`,
          type: types[i % types.length],
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          original_allocation: alloc,
          drawn_amount: drawn,
          remaining: alloc - drawn,
          drawdown_pct: parseFloat((drawn / alloc * 100).toFixed(1)),
          last_draw_date: `2026-${String(3 + Math.floor(i / 4)).padStart(2,"0")}-${String(5 + (i % 25)).padStart(2,"0")}`,
          approver: pick(OWNERS, i + 2),
          status: statuses[i],
        };
      });
    })(),
    audit_comment: "3 reserves breached policy limits. Verify whether additional board approval was obtained per reserve policy Section 4.2.",
  },

  /* ============================================================== */
  /*  PAGE 15 — Forecast Bias                                       */
  /* ============================================================== */
  "forecast-bias": {
    kpis: [
      { label: "Periods Analysed", value: 20, tone: "navy", icon: "activity" },
      { label: "Under-Forecast", value: 13, tone: "danger", icon: "alert-triangle", sublabel: "Systematic bias" },
      { label: "Avg Bias", value: "+4.2%", tone: "danger", icon: "trending-up" },
      { label: "Max Bias", value: "+12.8%", tone: "danger", icon: "wallet" },
    ],
    chart_spark: (() => {
      return Array.from({ length: 20 }, (_, i) => ({
        label: `Period ${i + 1}`,
        value: parseFloat((-6 + Math.random() * 18).toFixed(1)),
        direction: (i % 3 === 1 ? "under" : "over") as "over" | "under",
      }));
    })(),
    rows: (() => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return Array.from({ length: 20 }, (_, i) => {
        const forecast_val = 3800000 + i * 100000;
        const bias = parseFloat((-6 + Math.random() * 18).toFixed(1));
        const actual_val = Math.round(forecast_val * (1 + bias / 100));
        return {
          period: `${months[i % 12]} ${2026 - Math.floor(i / 12)}`,
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          forecast: forecast_val,
          actual: actual_val,
          bias_pct: bias,
          direction: bias > 0 ? "Under-forecast" as const : "Over-forecast" as const,
        };
      });
    })(),
    audit_comment: "Systematic under-forecasting bias of +4.2% average suggests optimistic budget setting. Recommend calibration workshop with FP&A.",
  },

  /* ============================================================== */
  /*  PAGE 16 — Approval Audit Trail                                */
  /* ============================================================== */
  "approval-audit-trail": {
    kpis: [
      { label: "Events Logged", value: 22, tone: "navy", icon: "clipboard" },
      { label: "Approvals", value: 10, tone: "success", icon: "check" },
      { label: "Late Submissions", value: 4, tone: "danger", icon: "alert-triangle" },
      { label: "Revisions", value: 5, tone: "gold", icon: "layers" },
    ],
    chart_bars: [
      { label: "Submissions", budget: 10, actual: 8 },
      { label: "Approvals", budget: 10, actual: 10 },
      { label: "Revisions", budget: 5, actual: 5 },
      { label: "Late", budget: 0, actual: 4, negative: true },
      { label: "Rejections", budget: 0, actual: 1, negative: true },
    ],
    rows: (() => {
      const actions = ["Budget Submitted","Approved","Budget Submitted (Late)","Revision Approved","Budget Submitted","Approved","Rejected","Budget Submitted","Approved","Revision Approved","Budget Submitted (Late)","Approved","Budget Submitted","Approved","Revision Approved","Budget Submitted","Approved","Budget Submitted (Late)","Approved","Budget Submitted","Revision Approved","Budget Submitted (Late)"];
      const steps = ["Submission","Final Sign-off","Submission","Revision Approval","Submission","Final Sign-off","Review","Submission","Final Sign-off","Revision Approval","Submission","Final Sign-off","Submission","Final Sign-off","Revision Approval","Submission","Final Sign-off","Submission","Final Sign-off","Submission","Revision Approval","Submission"];
      return Array.from({ length: 22 }, (_, i) => ({
        event_id: `EVT-${9001 + i}`,
        timestamp: `2026-${String(1 + Math.floor(i / 4)).padStart(2,"0")}-${String(5 + (i % 25)).padStart(2,"0")} ${String(8 + (i % 10)).padStart(2,"0")}:${String(10 + i * 3).padStart(2,"0").slice(0,2)}:00`,
        actor: pick(OWNERS, i),
        action: actions[i],
        entity: `CC-${1001 + (i % 15)} FY26`,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        workflow_step: steps[i],
        ip_address: `10.0.${1 + (i % 4)}.${10 + i * 3}`,
      }));
    })(),
    audit_comment: "Audit trail confirms 4 late submissions. Immutable log integrity verified — no tampering detected.",
  },

  /* ============================================================== */
  /*  PAGE 17 — Scope & Universe                                    */
  /* ============================================================== */
  "scope-universe": {
    kpis: [
      { label: "Entities in Scope", value: 16, tone: "navy", icon: "layers" },
      { label: "Universe Coverage", value: "80%", tone: "success", icon: "check" },
      { label: "High Risk", value: 4, tone: "danger", icon: "alert-triangle" },
      { label: "Out of Scope", value: 4, tone: "gold", icon: "activity" },
    ],
    chart_bars: [
      { label: "North America", budget: 100, actual: 100 },
      { label: "EMEA", budget: 100, actual: 85, negative: true },
      { label: "APAC", budget: 100, actual: 100 },
      { label: "JV Alpha", budget: 100, actual: 0, negative: true },
      { label: "LatAm", budget: 100, actual: 75, negative: true },
    ],
    rows: (() => {
      const entities = ["North America BU","EMEA BU","APAC BU","Joint Venture Alpha","Latin America BU","Middle East BU","Shared Services Centre","Group Treasury","Tax Operations","Internal Audit","Procurement Hub","Digital Division","Supply Chain","R&D Centre","Customer Service Centre","Payroll Operations","Risk & Compliance","Real Estate Ops","Corporate Strategy","Innovation Lab"];
      const risks = ["Medium","High","Low","Low","High","Medium","Low","Medium","Low","Low","Medium","High","Medium","Low","Medium","High","Low","Medium","Low","Low"];
      return entities.map((ent, i) => ({
        entity_id: `ENT-${String(i+1).padStart(2,"0")}`,
        entity_name: ent,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        in_scope: i < 16,
        materiality_threshold: i < 16 ? 150000 + i * 30000 : 0,
        last_audit: i < 16 ? `2025-Q${1 + (i % 4)}` : "—",
        risk_rating: risks[i],
        coverage_pct: i < 16 ? 75 + Math.floor(Math.random() * 26) : 0,
      }));
    })(),
    audit_comment: "4 entities out of scope. EMEA BU coverage at 85% due to partial year inclusion. Joint Venture Alpha excluded — confirm materiality assessment documentation.",
  },

  /* ============================================================== */
  /*  PAGE 18 — Risk & Control Matrix (RCM)                         */
  /* ============================================================== */
  "rcm": {
    kpis: [
      { label: "Total Controls", value: 22, tone: "navy", icon: "shield" },
      { label: "Automated", value: 9, tone: "success", icon: "server" },
      { label: "Manual", value: 13, tone: "gold", icon: "clipboard" },
      { label: "Critical Risk", value: 4, tone: "danger", icon: "alert-triangle" },
    ],
    chart_bars: [
      { label: "Accuracy", budget: 8, actual: 8 },
      { label: "Completeness", budget: 7, actual: 5, negative: true },
      { label: "Occurrence", budget: 4, actual: 4 },
      { label: "Valuation", budget: 3, actual: 2, negative: true },
    ],
    rows: (() => {
      const assertions = ["Accuracy","Completeness","Occurrence","Valuation","Accuracy","Completeness","Occurrence","Accuracy","Completeness","Occurrence","Valuation","Accuracy","Completeness","Occurrence","Accuracy","Completeness","Occurrence","Valuation","Accuracy","Completeness","Occurrence","Accuracy"];
      const descriptions = ["Automated tolerance check on PO vs budget","Monthly budget-vs-actual reconciliation","Pre-approval workflow for non-routine spend","System block on PO exceeding budget by 20%","Quarterly forecast vs actual variance review","Three-way match on vendor invoices","Manager approval for journal entries","Automated duplicate payment detection","Budget vs forecast reconciliation","Purchase order approval workflow","Asset impairment testing","Payroll to GL reconciliation","Vendor master data review","Expense report approval chain","Bank reconciliation automation","Accounts payable ageing review","Revenue recognition testing","Inventory valuation controls","Intercompany elimination checks","Tax provision reconciliation","Capital project authorisation","Cash flow forecasting review"];
      const owners = ["IT Systems","Finance Controller","Dept Heads","ERP Admin","FP&A Team","AP Manager","GL Manager","IT Systems","FP&A Team","Procurement","Asset Manager","Payroll Lead","Vendor Manager","Compliance","Treasury","AP Lead","Revenue Team","Inventory Mgr","Group Reporting","Tax Manager","PMO Director","Treasury Lead"];
      const types = ["Automated","Manual","Manual","Automated","Manual","Automated","Manual","Automated","Manual","Manual","Manual","Automated","Manual","Manual","Automated","Manual","Manual","Manual","Automated","Manual","Manual","Manual"];
      const grades = ["Low","High","Medium","Low","High","Medium","Low","Critical","High","Medium","High","Low","Critical","Medium","Low","High","Medium","Critical","Low","High","Medium","Critical"];
      return Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        risk_id: `R-${String(i+1).padStart(3,"0")}`,
        financial_assertion: assertions[i],
        control_description: descriptions[i],
        control_owner: owners[i],
        control_type: types[i],
        risk_grade: grades[i],
        associated_financials: 500000 + i * 450000,
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
      }));
    })(),
    audit_comment: "Verify design effectiveness of automated tolerance checks and test manual reconciliation controls for FY26 budget cycle.",
  },

  /* ============================================================== */
  /*  PAGE 19 — Rule Library                                        */
  /* ============================================================== */
  "rule-library": {
    kpis: [
      { label: "Active Rules", value: 20, tone: "navy", icon: "grid" },
      { label: "Total Hits YTD", value: 87, tone: "gold", icon: "alert-triangle" },
      { label: "Last Run", value: "Today", tone: "success", icon: "check" },
      { label: "Categories", value: 8, tone: "navy", icon: "layers" },
    ],
    chart_bars: [
      { label: "Overspend", budget: 10, actual: 8, negative: true },
      { label: "Timing", budget: 10, actual: 5 },
      { label: "Spend Spike", budget: 10, actual: 6, negative: true },
      { label: "Forecast Bias", budget: 10, actual: 12, negative: true },
      { label: "Capex Slip", budget: 10, actual: 3 },
    ],
    rows: (() => {
      const names = ["Chronic Overspend Detection","Pre-Approval Timing Check","Year-End Spend Spike","Forecast Bias Monitor","Capex Slippage Alert","Budget Revision Threshold","Duplicate PO Detection","Vendor Concentration Risk","Unreconciled Items","Journal Entry Review","Ghost Employee Check","Dormant Account Activity","Segregation of Duties","Round Dollar Transactions","Benford's Law Anomaly","Weekend Processing Alert","Threshold Split Detection","Late Invoice Payment","Unauthorised Commitments","Exchange Rate Deviation"];
      const categories = ["Variance","Compliance","Anomaly","Analytics","Capex","Variance","Fraud","Risk","Reconciliation","Journal","Fraud","Anomaly","Compliance","Analytics","Analytics","Anomaly","Fraud","Compliance","Compliance","Analytics"];
      const frequencies = ["Monthly","Quarterly","Monthly","Monthly","Weekly","Monthly","Daily","Quarterly","Monthly","Daily","Monthly","Weekly","Quarterly","Monthly","Monthly","Weekly","Monthly","Monthly","Weekly","Daily"];
      const riskRatings = ["Critical","High","High","Medium","High","Medium","Critical","High","Medium","High","Critical","Medium","High","Medium","Low","Medium","High","Medium","High","Medium"];
      return Array.from({ length: 20 }, (_, i) => ({
        rule_id: `RULE-BV-${String(i+1).padStart(3,"0")}`,
        name: names[i],
        category: categories[i],
        frequency: frequencies[i],
        last_run: `2026-07-${String(1 + (i % 28)).padStart(2,"0")}`,
        hits: Math.floor(Math.random() * 12) + 1,
        status: "Active",
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        financial_exposure: 50000 + i * 85000,
        risk_rating: riskRatings[i],
      }));
    })(),
    audit_comment: "All CAAT rules synchronised and active. Chronic Overspend rule generated highest hits — cross-reference with exception queue.",
  },

  /* ============================================================== */
  /*  PAGE 20 — Data Sources                                        */
  /* ============================================================== */
  "data-sources": {
    kpis: [
      { label: "Connectors", value: 20, tone: "navy", icon: "server" },
      { label: "Healthy", value: 15, tone: "success", icon: "check" },
      { label: "Degraded", value: 5, tone: "gold", icon: "alert-triangle" },
      { label: "Records Synced", value: "28.4M", tone: "navy", icon: "activity" },
    ],
    chart_bars: [
      { label: "SAP ERP", budget: 1500000, actual: 1245000 },
      { label: "Anaplan", budget: 100000, actual: 89000 },
      { label: "Snowflake", budget: 5000000, actual: 4500000 },
      { label: "Workday", budget: 20000, actual: 12500, negative: true },
      { label: "Salesforce", budget: 800000, actual: 780000 },
    ],
    rows: (() => {
      const connectors = ["SAP S/4HANA","Anaplan FP&A","Snowflake DWH","Workday HCM","Salesforce CRM","Oracle NetSuite","Coupa Procurement","Concur Expenses","ADP Payroll","ServiceNow ITSM","Tableau Server","Power BI Dataset","Jira Project Data","Confluence Docs","Slack Audit Log","Azure AD","AWS Cost Explorer","Google Analytics","Stripe Payments","HubSpot Marketing"];
      const types = ["ERP","FP&A","Data Warehouse","HRIS","CRM","ERP","Procurement","Expense","Payroll","ITSM","BI","BI","Project","Docs","Audit","IAM","Cloud","Analytics","Payments","Marketing"];
      return connectors.map((name, i) => ({
        connector_id: `DS-${String(i+1).padStart(3,"0")}`,
        name,
        type: types[i],
        status: i % 4 === 3 ? "Degraded" : "Connected",
        last_sync: `2026-07-${String(20 + (i % 8)).padStart(2,"0")} ${String(4 + (i % 12)).padStart(2,"0")}:${String(i * 7 % 60).padStart(2,"0")}`,
        records_synced: 10000 + i * 150000,
        health: i % 4 === 3 ? "Warning" : "Healthy",
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        financial_cost: 15000 + i * 12000,
        risk_grade: i % 4 === 3 ? "High" : i % 3 === 0 ? "Medium" : "Low",
      }));
    })(),
    audit_comment: "5 connectors showing degraded status. Workday HCM connector 30 hours stale — headcount data may be unreliable.",
  },

  /* ============================================================== */
  /*  PAGE 21 — Sampling Builder                                    */
  /* ============================================================== */
  "sampling-builder": {
    kpis: [
      { label: "Samples Built", value: 20, tone: "navy", icon: "file-check" },
      { label: "Total Items Tested", value: 485, tone: "gold", icon: "activity" },
      { label: "Complete", value: 14, tone: "success", icon: "check" },
      { label: "In Progress", value: 6, tone: "gold", icon: "clipboard" },
    ],
    chart_bars: [
      { label: "SMP-001", budget: 47, actual: 12 },
      { label: "SMP-002", budget: 156, actual: 25 },
      { label: "SMP-003", budget: 23, actual: 23 },
      { label: "SMP-005", budget: 200, actual: 30 },
      { label: "SMP-010", budget: 85, actual: 85 },
    ],
    rows: (() => {
      const populations = ["Budget Revisions FY26","Capex POs > $100K","Contingency Drawdowns","Late Budget Submissions","Vendor Payments > $50K","Journal Entries > $25K","Employee Expense Claims","Intercompany Transfers","Tax Adjustments","Purchase Requisitions","Payroll Transactions","Fixed Asset Additions","Accounts Receivable","Credit Notes Issued","Inventory Write-offs","Lease Modifications","Foreign Currency Txns","Revenue Accruals","Warranty Claims","Insurance Claims"];
      const methods = ["MUS","Random","100%","Systematic","MUS","Random","Stratified","MUS","100%","Random","Systematic","MUS","Random","100%","MUS","Random","Stratified","MUS","Random","100%"];
      const confidences = ["95%","90%","100%","95%","90%","95%","90%","95%","100%","90%","95%","90%","95%","100%","95%","90%","95%","90%","95%","100%"];
      const statuses = ["Complete","In Progress","Complete","Complete","In Progress","Complete","Complete","Complete","Complete","In Progress","Complete","Complete","In Progress","Complete","Complete","In Progress","Complete","Complete","In Progress","Complete"];
      return Array.from({ length: 20 }, (_, i) => {
        const popSize = 20 + i * 15;
        const sampleSize = methods[i] === "100%" ? popSize : Math.min(popSize, 10 + Math.floor(popSize * 0.2));
        return {
          sample_id: `SMP-${String(i+1).padStart(3,"0")}`,
          population: populations[i],
          department: pick(DEPTS, i),
          business_unit: pick(BUS, i),
          population_size: popSize,
          sample_size: sampleSize,
          method: methods[i],
          confidence: confidences[i],
          created_by: pick(OWNERS, i + 3),
          status: statuses[i],
          financial_value: 200000 + i * 280000,
          risk_grade: i % 3 === 0 ? "High" : i % 3 === 1 ? "Medium" : "Low",
        };
      });
    })(),
    audit_comment: "MUS sample methodology provides 95% confidence. Contingency drawdowns tested at 100% given small population.",
  },

  /* ============================================================== */
  /*  PAGE 22 — Exception Queue                                     */
  /* ============================================================== */
  "exceptions": {
    kpis: [
      { label: "Total Exceptions", value: 22, tone: "navy", icon: "alert-triangle" },
      { label: "Open Exceptions", value: 10, tone: "gold", icon: "activity" },
      { label: "Critical Risk", value: 5, tone: "danger", icon: "shield" },
      { label: "Resolved", value: 6, tone: "success", icon: "check" },
    ],
    chart_bars: [
      { label: "CC-1001", budget: 100000, actual: 145000, negative: true },
      { label: "CC-1002", budget: 50000, actual: 32000 },
      { label: "CC-1003", budget: 80000, actual: 87000, negative: true },
      { label: "CC-1005", budget: 150000, actual: 210000, negative: true },
      { label: "CC-1008", budget: 120000, actual: 155000, negative: true },
    ],
    rows: (() => {
      const procedures = ["Chronic Overspend","Pre-Approval Timing","Forecast Bias","Parked Budget","Budget Revision","Capex Slippage","Vendor Concentration","Duplicate PO","Threshold Split","Year-End Spike"];
      const riskGrades = ["Critical","High","High","Critical","Medium","High","Medium","Critical","High","Medium","High","Critical","Medium","High","Critical","Medium","High","Medium","High","Medium","Critical","Medium"];
      const statuses = ["Open","In Review","Open","Open","Resolved","Open","In Review","Open","Resolved","Open","In Review","Open","Resolved","Open","Open","Resolved","In Review","Open","Resolved","In Review","Open","Resolved"];
      return Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        cost_center: `CC-${1001 + (i % 15)}`,
        budget_owner: pick(OWNERS, i),
        source_procedure: procedures[i % procedures.length],
        variance_amount: 12000 + i * 15000 + (i % 3) * 20000,
        risk_grade: riskGrades[i],
        status: statuses[i],
        disposition_notes: statuses[i] === "Resolved" ? "Investigated and closed." : statuses[i] === "In Review" ? "Under review by management." : "",
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
      }));
    })(),
    audit_comment: "Cross-reference exception hits with CAAT rule library. All Critical items require documented disposition within 5 business days.",
  },

  /* ============================================================== */
  /*  PAGE 23 — Working Papers                                      */
  /* ============================================================== */
  "working-papers": {
    kpis: [
      { label: "Total Papers", value: 22, tone: "navy", icon: "file-check" },
      { label: "Pending Review", value: 7, tone: "gold", icon: "clipboard" },
      { label: "Reviewed", value: 8, tone: "navy", icon: "check" },
      { label: "Signed Off", value: 7, tone: "success", icon: "check" },
    ],
    chart_bars: [
      { label: "B-v-A", budget: 100, actual: 100 },
      { label: "Bias", budget: 100, actual: 50, negative: true },
      { label: "Overspend", budget: 100, actual: 100 },
      { label: "Control Test", budget: 100, actual: 75, negative: true },
      { label: "Parked", budget: 100, actual: 25, negative: true },
      { label: "Timing", budget: 100, actual: 100 },
    ],
    rows: (() => {
      const names = ["Q1_Budget_vs_Actual.xlsx","Forecast_Bias_Analysis.pdf","Overspend_CC-1001_Evidence.pdf","RCM_Control_Test_Results.csv","Parked_Budget_Spike_Analysis.pptx","Pre_Approval_Timing_Log.xlsx","Q2_Budget_Reconciliation.xlsx","Capex_Utilisation_Summary.pdf","ZBB_Package_Review_Notes.docx","Rolling_Forecast_Accuracy.xlsx","Contingency_Reserve_Report.pdf","Flash_Final_Comparison.xlsx","Cost_Driver_Analysis.pdf","Approval_Trail_Evidence.xlsx","Scope_Universe_Mapping.docx","Sampling_Results_Summary.xlsx","Exception_Testing_Report.pdf","Finding_Draft_Notes.docx","Action_Plan_Evidence.xlsx","Departmental_Scorecard.pdf","Vendor_Concentration_Review.xlsx","Duplicate_PO_Testing.csv"];
      const reviewStatuses = ["Reviewed","Pending","Signed Off","Reviewed","Pending","Signed Off","Reviewed","Pending","Signed Off","Reviewed","Pending","Signed Off","Reviewed","Pending","Signed Off","Reviewed","Pending","Reviewed","Reviewed","Signed Off","Pending","Signed Off"];
      const tickmarkSets: string[][] = [["✓","?"],["✓"],["✓","✓","Δ"],["✓"],[],["✓","✓","✓"],["✓","?"],["✓","Δ"],["✓","✓"],[],["✓"],["✓","✓"],["✓","?","Δ"],["✓"],[],["✓","✓"],["✓"],["✓","✓","✓"],["✓"],["✓","?"],["✓","Δ"],["✓","✓","✓"]];
      const riskGrades = ["Medium","High","Critical","Low","Critical","High","Medium","High","Low","Medium","High","Medium","Critical","Low","High","Medium","Critical","High","Medium","Low","High","Medium"];
      return Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        attachment_name: names[i],
        associated_procedure_id: 101 + i,
        upload_date: `2026-${String(1 + Math.floor(i / 4)).padStart(2,"0")}-${String(5 + (i % 25)).padStart(2,"0")}`,
        uploaded_by: pick(OWNERS, i),
        review_status: reviewStatuses[i],
        audit_tickmarks: tickmarkSets[i],
        financial_impact: 80000 + i * 120000,
        risk_grade: riskGrades[i],
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
      }));
    })(),
    audit_comment: "Ensure all variance testing workpapers include tickmarks (✓ = agreed, ? = follow-up, Δ = adjustment). Partner sign-off required.",
  },

  /* ============================================================== */
  /*  PAGE 24 — Finding Log                                         */
  /* ============================================================== */
  "findings": {
    kpis: [
      { label: "Total Findings", value: 20, tone: "navy", icon: "clipboard" },
      { label: "Open Findings", value: 7, tone: "danger", icon: "alert-triangle" },
      { label: "Critical/High", value: 10, tone: "danger", icon: "shield" },
      { label: "Draft Findings", value: 5, tone: "gold", icon: "activity" },
    ],
    chart_bars: [
      { label: "Critical", budget: 5, actual: 4 },
      { label: "High", budget: 8, actual: 6 },
      { label: "Medium", budget: 10, actual: 10 },
      { label: "Open", budget: 0, actual: 7, negative: true },
      { label: "In Review", budget: 0, actual: 8, negative: true },
    ],
    rows: (() => {
      const titles = ["Late budget approval for CC-1002","Contingency reserve breached on CPX-103","Systematic under-forecasting in Q1-Q2","Year-end spend spike in CC-1005","Missing pre-approval documentation","Chronic overspend in IT cloud services","Unapproved budget revision REV-003","Forecast accuracy below threshold","Vendor concentration exceeds 40%","Duplicate purchase orders detected","Segregation of duties violation","Unauthorised journal entries","Stale data from Workday HCM","Capex project delayed 6 months","Budget assumption not benchmarked","Tax provision estimate deviation","Inventory valuation discrepancy","Intercompany elimination error","Revenue recognition timing issue","Expense claim policy violation"];
      const severities = ["High","Critical","Medium","High","Critical","High","Medium","High","Critical","Medium","High","Critical","Medium","High","Medium","Critical","High","Medium","Critical","Medium"];
      const statuses = ["Open","In Review","Draft","Open","In Review","Open","Draft","In Review","Open","Draft","In Review","Open","In Review","Open","Draft","In Review","Open","Draft","In Review","Open"];
      return titles.map((title, i) => ({
        finding_id: `FND-27-${String(i+1).padStart(3,"0")}`,
        title,
        severity: severities[i],
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        observation_date: `2026-${String(2 + Math.floor(i / 4)).padStart(2,"0")}-${String(5 + (i % 25)).padStart(2,"0")}`,
        status: statuses[i],
        owner: pick(OWNERS, i),
        financial_exposure: 50000 + i * 45000,
      }));
    })(),
    audit_comment: "7 open findings requiring immediate management attention. Draft findings pending partner review before issuance.",
  },

  /* ============================================================== */
  /*  PAGE 25 — Action Tracker                                      */
  /* ============================================================== */
  "action-tracker": {
    kpis: [
      { label: "Open Actions", value: 10, tone: "navy", icon: "check" },
      { label: "In Progress", value: 10, tone: "gold", icon: "activity" },
      { label: "Overdue", value: 3, tone: "danger", icon: "alert-triangle" },
      { label: "Avg Completion", value: "38.5%", tone: "gold", icon: "trending-up" },
    ],
    chart_bars: [
      { label: "Open", budget: 10, actual: 10 },
      { label: "In Prog.", budget: 10, actual: 10 },
      { label: "Overdue", budget: 0, actual: 3, negative: true },
      { label: "On Track", budget: 20, actual: 17 },
    ],
    rows: (() => {
      const descriptions = ["Implement mandatory pre-period budget lock","Revise contingency drawdown approval matrix","Retrain FP&A on forecast bias calibration","Add workflow SLA alerts for late submissions","Update vendor concentration policy","Enhance duplicate PO detection rules","Implement segregation of duties controls","Automate bank reconciliation process","Deploy real-time budget monitoring dashboard","Establish monthly variance review cadence","Upgrade Workday HCM connector","Review capex project governance framework","Benchmark all budget assumptions annually","Strengthen tax provision review controls","Implement inventory cycle count programme","Automate intercompany eliminations","Enhance revenue recognition controls","Tighten expense claim approval thresholds","Deploy fraud analytics dashboard","Update data retention policies"];
      const statuses = ["In Progress","Open","Open","In Progress","Open","In Progress","Open","In Progress","Open","In Progress","Open","In Progress","Open","In Progress","Open","In Progress","In Progress","Open","In Progress","Open"];
      return Array.from({ length: 20 }, (_, i) => ({
        action_id: `ACT-27-${String(i+1).padStart(3,"0")}`,
        finding_ref: `FND-27-${String(1 + (i % 15)).padStart(3,"0")}`,
        description: descriptions[i],
        owner: pick(OWNERS, i),
        department: pick(DEPTS, i),
        business_unit: pick(BUS, i),
        due_date: `2026-${String(8 + Math.floor(i / 5)).padStart(2,"0")}-${String(10 + (i % 20)).padStart(2,"0")}`,
        status: statuses[i],
        completion_pct: statuses[i] === "In Progress" ? 10 + Math.floor(Math.random() * 70) : 0,
        estimated_cost: 5000 + i * 3500,
        risk_grade: i % 3 === 0 ? "Critical" : i % 3 === 1 ? "High" : "Medium",
      }));
    })(),
    audit_comment: "3 actions overdue. Escalate ACT-27-002 (contingency matrix revision) due 2026-08-15.",
  },
};
