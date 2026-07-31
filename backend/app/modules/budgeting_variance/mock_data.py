"""Centralised mock / seed data for Budgeting & Variance Analysis sub-pages."""

from __future__ import annotations

from typing import Any


def _fmt_currency(n: float) -> str:
    return f"${n:,.0f}"


# ── Shared row builders ───────────────────────────────────────────────────────

BUDGET_VS_ACTUAL_ROWS = [
    {"cost_head": "Salaries & Wages", "department": "HR", "business_unit": "Corporate", "budget": 12000000, "actual": 11800000, "variance_pct": -1.7, "status": "Favourable"},
    {"cost_head": "Marketing & Advertising", "department": "Marketing", "business_unit": "North America", "budget": 8000000, "actual": 9200000, "variance_pct": 15.0, "status": "Adverse"},
    {"cost_head": "IT Infrastructure", "department": "IT", "business_unit": "Corporate", "budget": 6000000, "actual": 5500000, "variance_pct": -8.3, "status": "Favourable"},
    {"cost_head": "Travel & Entertainment", "department": "Sales", "business_unit": "EMEA", "budget": 3000000, "actual": 3400000, "variance_pct": 13.3, "status": "Adverse"},
    {"cost_head": "Office Supplies", "department": "Operations", "business_unit": "APAC", "budget": 2000000, "actual": 1800000, "variance_pct": -10.0, "status": "Favourable"},
    {"cost_head": "Professional Fees", "department": "Finance", "business_unit": "Corporate", "budget": 4500000, "actual": 5100000, "variance_pct": 13.3, "status": "Adverse"},
    {"cost_head": "Utilities", "department": "Operations", "business_unit": "North America", "budget": 1800000, "actual": 1750000, "variance_pct": -2.8, "status": "Favourable"},
    {"cost_head": "Training & Development", "department": "HR", "business_unit": "EMEA", "budget": 1200000, "actual": 980000, "variance_pct": -18.3, "status": "Favourable"},
]

PRE_APPROVAL_ROWS = [
    {"cost_center": "CC-1001", "department": "Finance", "owner": "Alice Chen", "approval_date": "2025-12-28", "period_start": "2026-01-01", "days_before": 4, "pct_approved": 100, "status": "Compliant"},
    {"cost_center": "CC-1002", "department": "Marketing", "owner": "Bob Marley", "approval_date": "2026-01-15", "period_start": "2026-01-01", "days_before": -14, "pct_approved": 87, "status": "Non-Compliant"},
    {"cost_center": "CC-1003", "department": "Operations", "owner": "Carol Diaz", "approval_date": "2026-02-01", "period_start": "2026-01-01", "days_before": -31, "pct_approved": 112, "status": "Non-Compliant"},
    {"cost_center": "CC-1004", "department": "IT", "owner": "Dave Park", "approval_date": "2025-12-20", "period_start": "2026-01-01", "days_before": 12, "pct_approved": 94, "status": "Compliant"},
    {"cost_center": "CC-1005", "department": "Sales", "owner": "Eve Torres", "approval_date": "", "period_start": "2026-01-01", "days_before": 0, "pct_approved": 0, "status": "Missing"},
    {"cost_center": "CC-1006", "department": "HR", "owner": "Frank Liu", "approval_date": "2025-11-30", "period_start": "2026-01-01", "days_before": 32, "pct_approved": 100, "status": "Compliant"},
]

CHRONIC_OVERSPEND_ROWS = [
    {"cost_center": "CC-1001", "cost_head": "Salaries", "periods_exceeded": 4, "avg_overspend_pct": 12.1, "total_variance": 580000, "risk": "Critical"},
    {"cost_center": "CC-1003", "cost_head": "Marketing", "periods_exceeded": 3, "avg_overspend_pct": 15.0, "total_variance": 420000, "risk": "High"},
    {"cost_center": "CC-1002", "cost_head": "Travel", "periods_exceeded": 3, "avg_overspend_pct": 9.0, "total_variance": 185000, "risk": "High"},
    {"cost_center": "CC-1007", "cost_head": "Consulting", "periods_exceeded": 2, "avg_overspend_pct": 7.5, "total_variance": 95000, "risk": "Medium"},
]

REBUDGET_ROWS = [
    {"revision_id": "REV-2026-001", "cost_center": "CC-1001", "original_budget": 5000000, "revised_budget": 5800000, "change_pct": 16.0, "approver": "CFO", "approval_date": "2026-03-15", "reason": "Headcount expansion", "status": "Approved"},
    {"revision_id": "REV-2026-002", "cost_center": "CC-1003", "original_budget": 3200000, "revised_budget": 2800000, "change_pct": -12.5, "approver": "VP Marketing", "approval_date": "2026-04-02", "reason": "Campaign deferral", "status": "Approved"},
    {"revision_id": "REV-2026-003", "cost_center": "CC-1008", "original_budget": 1500000, "revised_budget": 2100000, "change_pct": 40.0, "approver": "Pending", "approval_date": "", "reason": "Cloud migration", "status": "Pending"},
]

ASSUMPTION_ROWS = [
    {"assumption_id": "ASM-01", "category": "Revenue Growth", "budget_assumption": "8.5%", "historical_avg": "6.2%", "benchmark": "7.0%", "variance": "+2.3pp", "reasonableness": "Questionable"},
    {"assumption_id": "ASM-02", "category": "Inflation Rate", "budget_assumption": "3.0%", "historical_avg": "2.8%", "benchmark": "3.1%", "variance": "-0.1pp", "reasonableness": "Reasonable"},
    {"assumption_id": "ASM-03", "category": "FX Rate (USD/EUR)", "budget_assumption": "0.92", "historical_avg": "0.94", "benchmark": "0.93", "variance": "-0.02", "reasonableness": "Reasonable"},
    {"assumption_id": "ASM-04", "category": "Headcount Growth", "budget_assumption": "12%", "historical_avg": "5%", "benchmark": "6%", "variance": "+6pp", "reasonableness": "Aggressive"},
]

FLASH_FINAL_ROWS = [
    {"period": "Jan 2026", "cost_center": "CC-1001", "flash_variance": 120000, "final_variance": 145000, "late_adjustment": 25000, "adjustment_pct": 20.8},
    {"period": "Feb 2026", "cost_center": "CC-1002", "flash_variance": 45000, "final_variance": 42000, "late_adjustment": -3000, "adjustment_pct": -6.7},
    {"period": "Mar 2026", "cost_center": "CC-1003", "flash_variance": 78000, "final_variance": 95000, "late_adjustment": 17000, "adjustment_pct": 21.8},
    {"period": "Apr 2026", "cost_center": "CC-1001", "flash_variance": 62000, "final_variance": 88000, "late_adjustment": 26000, "adjustment_pct": 41.9},
]

ROLLING_FORECAST_ROWS = [
    {"department": "Finance", "last_update": "2026-06-15", "forecast_accuracy": 94.2, "update_cadence": "Monthly", "variance_to_actual": -2.1, "status": "On Track"},
    {"department": "Marketing", "last_update": "2026-05-28", "forecast_accuracy": 82.5, "update_cadence": "Quarterly", "variance_to_actual": 8.4, "status": "At Risk"},
    {"department": "Operations", "last_update": "2026-06-20", "forecast_accuracy": 91.0, "update_cadence": "Monthly", "variance_to_actual": -1.2, "status": "On Track"},
    {"department": "IT", "last_update": "2026-04-10", "forecast_accuracy": 76.3, "update_cadence": "Quarterly", "variance_to_actual": 12.1, "status": "Overdue"},
]

ZBB_ROWS = [
    {"package_id": "ZBB-001", "department": "Marketing", "activity": "Digital Campaigns", "justification_score": 8.2, "rank": 1, "requested": 2400000, "approved": 2200000, "status": "Approved"},
    {"package_id": "ZBB-002", "department": "IT", "activity": "Legacy System Maintenance", "justification_score": 4.1, "rank": 8, "requested": 800000, "approved": 400000, "status": "Reduced"},
    {"package_id": "ZBB-003", "department": "HR", "activity": "Leadership Training", "justification_score": 6.5, "rank": 4, "requested": 350000, "approved": 350000, "status": "Approved"},
]

CAPEX_ROWS = [
    {"project_id": "CPX-101", "project_name": "ERP Modernisation", "approved_budget": 8500000, "committed": 7200000, "spent": 5800000, "utilisation_pct": 68.2, "slippage_months": 2, "status": "In Progress"},
    {"project_id": "CPX-102", "project_name": "Warehouse Automation", "approved_budget": 4200000, "committed": 4100000, "spent": 3900000, "utilisation_pct": 92.9, "slippage_months": 0, "status": "On Track"},
    {"project_id": "CPX-103", "project_name": "Office Fit-out", "approved_budget": 1800000, "committed": 900000, "spent": 450000, "utilisation_pct": 25.0, "slippage_months": 4, "status": "Delayed"},
]

SCORECARD_ROWS = [
    {"department": "Finance", "budget_accuracy": 96, "forecast_accuracy": 94, "compliance_score": 98, "variance_mgmt": 92, "composite_score": 95, "rating": "A"},
    {"department": "Marketing", "budget_accuracy": 78, "forecast_accuracy": 82, "compliance_score": 85, "variance_mgmt": 70, "composite_score": 79, "rating": "C"},
    {"department": "Operations", "budget_accuracy": 91, "forecast_accuracy": 89, "compliance_score": 94, "variance_mgmt": 88, "composite_score": 91, "rating": "B"},
    {"department": "IT", "budget_accuracy": 84, "forecast_accuracy": 76, "compliance_score": 90, "variance_mgmt": 80, "composite_score": 83, "rating": "B"},
]

UNSPENT_ROWS = [
    {"cost_center": "CC-1001", "department": "Finance", "parked_amount": 420000, "q1_release_pct": 8, "q2_release_pct": 6, "q3_release_pct": 9, "q4_dec_release_pct": 44, "flag": "Year-End Spike"},
    {"cost_center": "CC-1005", "department": "Sales", "parked_amount": 680000, "q1_release_pct": 5, "q2_release_pct": 4, "q3_release_pct": 7, "q4_dec_release_pct": 38, "flag": "Year-End Spike"},
    {"cost_center": "CC-1009", "department": "Operations", "parked_amount": 210000, "q1_release_pct": 22, "q2_release_pct": 25, "q3_release_pct": 28, "q4_dec_release_pct": 18, "flag": "Normal"},
]

COST_DRIVER_ROWS = [
    {"driver": "Volume", "budget_index": 100, "actual_index": 108, "variance_pct": 8.0, "impact_amount": 320000, "direction": "Unfavourable"},
    {"driver": "Price", "budget_index": 100, "actual_index": 96, "variance_pct": -4.0, "impact_amount": -160000, "direction": "Favourable"},
    {"driver": "Mix", "budget_index": 100, "actual_index": 102, "variance_pct": 2.0, "impact_amount": 80000, "direction": "Unfavourable"},
    {"driver": "Exchange Rate", "budget_index": 100, "actual_index": 98, "variance_pct": -2.0, "impact_amount": -40000, "direction": "Favourable"},
    {"driver": "Productivity", "budget_index": 100, "actual_index": 95, "variance_pct": -5.0, "impact_amount": -200000, "direction": "Favourable"},
]

CONTINGENCY_ROWS = [
    {"reserve_id": "RES-001", "type": "Contingency", "original_allocation": 2000000, "drawn_amount": 850000, "remaining": 1150000, "drawdown_pct": 42.5, "last_draw_date": "2026-05-12", "approver": "CFO", "status": "Within Policy"},
    {"reserve_id": "RES-002", "type": "Management Reserve", "original_allocation": 1500000, "drawn_amount": 1200000, "remaining": 300000, "drawdown_pct": 80.0, "last_draw_date": "2026-06-28", "approver": "CEO", "status": "Near Limit"},
    {"reserve_id": "RES-003", "type": "Project Contingency", "original_allocation": 500000, "drawn_amount": 520000, "remaining": -20000, "drawdown_pct": 104.0, "last_draw_date": "2026-07-01", "approver": "PMO", "status": "Breached"},
]

FORECAST_BIAS_ROWS = [
    {"period": "Jan 2026", "forecast": 4200000, "actual": 4536000, "bias_pct": 8.0, "direction": "Under-forecast"},
    {"period": "Feb 2026", "forecast": 4100000, "actual": 3895000, "bias_pct": -5.0, "direction": "Over-forecast"},
    {"period": "Mar 2026", "forecast": 4300000, "actual": 4558000, "bias_pct": 6.0, "direction": "Under-forecast"},
    {"period": "Apr 2026", "forecast": 4400000, "actual": 4840000, "bias_pct": 10.0, "direction": "Under-forecast"},
    {"period": "May 2026", "forecast": 4250000, "actual": 4122500, "bias_pct": -3.0, "direction": "Over-forecast"},
    {"period": "Jun 2026", "forecast": 4500000, "actual": 4815000, "bias_pct": 7.0, "direction": "Under-forecast"},
]

APPROVAL_TRAIL_ROWS = [
    {"event_id": "EVT-9001", "timestamp": "2025-12-28 14:32:00", "actor": "Alice Chen", "action": "Budget Submitted", "entity": "CC-1001 FY26", "workflow_step": "Submission", "ip_address": "10.0.1.45"},
    {"event_id": "EVT-9002", "timestamp": "2025-12-29 09:15:00", "actor": "CFO Office", "action": "Approved", "entity": "CC-1001 FY26", "workflow_step": "Final Sign-off", "ip_address": "10.0.1.12"},
    {"event_id": "EVT-9003", "timestamp": "2026-01-15 16:48:00", "actor": "Bob Marley", "action": "Budget Submitted (Late)", "entity": "CC-1002 FY26", "workflow_step": "Submission", "ip_address": "10.0.2.88"},
    {"event_id": "EVT-9004", "timestamp": "2026-03-15 11:20:00", "actor": "CFO Office", "action": "Revision Approved", "entity": "REV-2026-001", "workflow_step": "Revision Approval", "ip_address": "10.0.1.12"},
]

SCOPE_ROWS = [
    {"entity_id": "ENT-01", "entity_name": "North America BU", "in_scope": True, "materiality_threshold": 500000, "last_audit": "2025-Q4", "risk_rating": "Medium", "coverage_pct": 100},
    {"entity_id": "ENT-02", "entity_name": "EMEA BU", "in_scope": True, "materiality_threshold": 350000, "last_audit": "2025-Q3", "risk_rating": "High", "coverage_pct": 85},
    {"entity_id": "ENT-03", "entity_name": "APAC BU", "in_scope": True, "materiality_threshold": 250000, "last_audit": "2026-Q1", "risk_rating": "Low", "coverage_pct": 100},
    {"entity_id": "ENT-04", "entity_name": "Joint Venture Alpha", "in_scope": False, "materiality_threshold": 0, "last_audit": "N/A", "risk_rating": "N/A", "coverage_pct": 0},
]

RULE_LIBRARY_ROWS = [
    {"rule_id": "RULE-BV-001", "name": "Chronic Overspend Detection", "category": "Variance", "frequency": "Monthly", "last_run": "2026-07-01", "hits": 3, "status": "Active"},
    {"rule_id": "RULE-BV-002", "name": "Pre-Approval Timing Check", "category": "Compliance", "frequency": "Quarterly", "last_run": "2026-07-01", "hits": 2, "status": "Active"},
    {"rule_id": "RULE-BV-003", "name": "Year-End Spend Spike", "category": "Anomaly", "frequency": "Monthly", "last_run": "2026-07-01", "hits": 2, "status": "Active"},
    {"rule_id": "RULE-BV-004", "name": "Forecast Bias Monitor", "category": "Analytics", "frequency": "Monthly", "last_run": "2026-06-28", "hits": 5, "status": "Active"},
    {"rule_id": "RULE-BV-005", "name": "Capex Slippage Alert", "category": "Capex", "frequency": "Weekly", "last_run": "2026-07-14", "hits": 1, "status": "Active"},
]

DATA_SOURCE_ROWS = [
    {"connector_id": "DS-ERP-01", "name": "SAP S/4HANA", "type": "ERP", "status": "Connected", "last_sync": "2026-07-23 06:00", "records_synced": 1245000, "health": "Healthy"},
    {"connector_id": "DS-FPA-01", "name": "Anaplan FP&A", "type": "FP&A", "status": "Connected", "last_sync": "2026-07-23 05:30", "records_synced": 89000, "health": "Healthy"},
    {"connector_id": "DS-DWH-01", "name": "Snowflake DWH", "type": "Data Warehouse", "status": "Connected", "last_sync": "2026-07-23 04:00", "records_synced": 4500000, "health": "Healthy"},
    {"connector_id": "DS-HR-01", "name": "Workday HCM", "type": "HRIS", "status": "Degraded", "last_sync": "2026-07-22 18:00", "records_synced": 12500, "health": "Warning"},
]

SAMPLING_ROWS = [
    {"sample_id": "SMP-001", "population": "Budget Revisions FY26", "population_size": 47, "sample_size": 12, "method": "MUS", "confidence": "95%", "created_by": "Audit Team", "status": "Complete"},
    {"sample_id": "SMP-002", "population": "Capex POs > $100K", "population_size": 156, "sample_size": 25, "method": "Random", "confidence": "90%", "created_by": "Audit Team", "status": "In Progress"},
    {"sample_id": "SMP-003", "population": "Contingency Drawdowns", "population_size": 23, "sample_size": 23, "method": "100%", "confidence": "100%", "created_by": "Audit Team", "status": "Complete"},
]

FINDING_ROWS = [
    {"finding_id": "FND-27-001", "title": "Late budget approval for CC-1002", "severity": "High", "department": "Marketing", "observation_date": "2026-03-15", "status": "Open", "owner": "Bob Marley"},
    {"finding_id": "FND-27-002", "title": "Contingency reserve breached on CPX-103", "severity": "Critical", "department": "Operations", "observation_date": "2026-06-20", "status": "In Review", "owner": "Carol Diaz"},
    {"finding_id": "FND-27-003", "title": "Systematic under-forecasting in Q1-Q2", "severity": "Medium", "department": "Finance", "observation_date": "2026-05-01", "status": "Draft", "owner": "Alice Chen"},
]

ACTION_ROWS = [
    {"action_id": "ACT-27-001", "finding_ref": "FND-27-001", "description": "Implement mandatory pre-period budget lock", "owner": "CFO Office", "due_date": "2026-09-30", "status": "In Progress", "completion_pct": 45},
    {"action_id": "ACT-27-002", "finding_ref": "FND-27-002", "description": "Revise contingency drawdown approval matrix", "owner": "PMO", "due_date": "2026-08-15", "status": "Open", "completion_pct": 0},
    {"action_id": "ACT-27-003", "finding_ref": "FND-27-003", "description": "Retrain FP&A on forecast bias calibration", "owner": "FP&A Lead", "due_date": "2026-10-31", "status": "Open", "completion_pct": 10},
    {"action_id": "ACT-27-004", "finding_ref": "FND-27-001", "description": "Add workflow SLA alerts for late submissions", "owner": "IT Systems", "due_date": "2026-08-30", "status": "In Progress", "completion_pct": 60},
]


def _page_payload(
    kpis: list[dict],
    rows: list[dict],
    chart_bars: list[dict] | None = None,
    chart_spark: list[dict] | None = None,
    audit_comment: str = "",
) -> dict[str, Any]:
    return {
        "kpis": kpis,
        "rows": rows,
        "chart_bars": chart_bars or [],
        "chart_spark": chart_spark or [],
        "audit_comment": audit_comment,
    }


PAGE_DATA: dict[str, dict[str, Any]] = {
    "budget-vs-actual": _page_payload(
        kpis=[
            {"label": "Total Budget", "value": "$45.5M", "tone": "navy", "icon": "wallet", "sublabel": "FY 2026 YTD"},
            {"label": "Total Actual", "value": "$46.8M", "tone": "gold", "icon": "activity", "sublabel": "+2.9% vs budget"},
            {"label": "Net Variance", "value": "$1.3M", "tone": "danger", "icon": "alert-triangle", "sublabel": "Adverse"},
            {"label": "Heads Over Budget", "value": 3, "tone": "danger", "icon": "trending-up", "sublabel": "of 8 cost heads"},
        ],
        chart_bars=[
            {"label": "Salaries", "budget": 120, "actual": 118},
            {"label": "Marketing", "budget": 80, "actual": 92, "negative": True},
            {"label": "IT Infra", "budget": 60, "actual": 55},
            {"label": "Travel", "budget": 30, "actual": 34, "negative": True},
            {"label": "Supplies", "budget": 20, "actual": 18},
        ],
        rows=BUDGET_VS_ACTUAL_ROWS,
        audit_comment="Marketing and Travel show adverse variances exceeding the 10% tolerance. Recommend walkthrough with department heads and review of accrual completeness.",
    ),
    "pre-approval-timing": _page_payload(
        kpis=[
            {"label": "Target Compliance", "value": "100%", "tone": "navy", "icon": "clipboard"},
            {"label": "Compliant CCs", "value": 3, "tone": "success", "icon": "check", "sublabel": "of 6 cost centres"},
            {"label": "Non-Compliant", "value": 2, "tone": "danger", "icon": "alert-triangle"},
            {"label": "Missing Approval", "value": 1, "tone": "gold", "icon": "activity"},
        ],
        chart_bars=[
            {"label": "CC-1001", "budget": 100, "actual": 100},
            {"label": "CC-1002", "budget": 100, "actual": 87, "negative": True},
            {"label": "CC-1003", "budget": 100, "actual": 112, "negative": True},
            {"label": "CC-1004", "budget": 100, "actual": 94},
            {"label": "CC-1005", "budget": 100, "actual": 0, "negative": True},
        ],
        rows=PRE_APPROVAL_ROWS,
        audit_comment="CC-1002 and CC-1003 budgets were approved after period start, violating the pre-approval policy. CC-1005 has no recorded approval — escalate to management.",
    ),
    "chronic-overspend": _page_payload(
        kpis=[
            {"label": "Chronic Heads", "value": 4, "tone": "danger", "icon": "alert-triangle", "sublabel": ">5% for 3+ periods"},
            {"label": "Total Overspend", "value": "$1.28M", "tone": "danger", "icon": "wallet"},
            {"label": "Critical Risk", "value": 1, "tone": "danger", "icon": "shield"},
            {"label": "Avg Overspend %", "value": "10.9%", "tone": "gold", "icon": "trending-up"},
        ],
        chart_bars=[
            {"label": "CC-1001", "budget": 100, "actual": 121, "negative": True},
            {"label": "CC-1003", "budget": 100, "actual": 115, "negative": True},
            {"label": "CC-1002", "budget": 100, "actual": 109, "negative": True},
            {"label": "CC-1007", "budget": 100, "actual": 108, "negative": True},
        ],
        rows=CHRONIC_OVERSPEND_ROWS,
        audit_comment="CC-1001 Salaries has exceeded budget for 4 consecutive periods. Root cause analysis and management action plan required per IIA Standard 2600.",
    ),
    "rebudget-revision": _page_payload(
        kpis=[
            {"label": "Revisions YTD", "value": 3, "tone": "navy", "icon": "layers"},
            {"label": "Net Budget Change", "value": "+$1.1M", "tone": "gold", "icon": "wallet"},
            {"label": "Pending Approval", "value": 1, "tone": "gold", "icon": "clipboard"},
            {"label": "Avg Change %", "value": "14.5%", "tone": "danger", "icon": "trending-up"},
        ],
        rows=REBUDGET_ROWS,
        audit_comment="REV-2026-003 shows a 40% budget increase pending approval. Verify business case documentation and board notification requirements.",
    ),
    "assumption-reasonableness": _page_payload(
        kpis=[
            {"label": "Assumptions Tested", "value": 4, "tone": "navy", "icon": "file-check"},
            {"label": "Reasonable", "value": 2, "tone": "success", "icon": "check"},
            {"label": "Questionable", "value": 1, "tone": "gold", "icon": "alert-triangle"},
            {"label": "Aggressive", "value": 1, "tone": "danger", "icon": "trending-up"},
        ],
        rows=ASSUMPTION_ROWS,
        audit_comment="Revenue growth assumption of 8.5% exceeds historical average by 2.3pp. Headcount growth of 12% appears aggressive relative to 5% historical trend.",
    ),
    "flash-vs-final": _page_payload(
        kpis=[
            {"label": "Periods Analysed", "value": 4, "tone": "navy", "icon": "activity"},
            {"label": "Avg Late Adj.", "value": "$18.8K", "tone": "gold", "icon": "wallet"},
            {"label": "Max Adjustment", "value": "41.9%", "tone": "danger", "icon": "alert-triangle", "sublabel": "Apr CC-1001"},
            {"label": "Material Adjustments", "value": 2, "tone": "danger", "icon": "trending-up"},
        ],
        rows=FLASH_FINAL_ROWS,
        audit_comment="April flash-to-final adjustment of 41.9% on CC-1001 suggests incomplete accruals at flash close. Review close process timing and cut-off controls.",
    ),
    "rolling-forecast": _page_payload(
        kpis=[
            {"label": "Departments", "value": 4, "tone": "navy", "icon": "users"},
            {"label": "Avg Accuracy", "value": "85.9%", "tone": "gold", "icon": "activity"},
            {"label": "Overdue Updates", "value": 1, "tone": "danger", "icon": "alert-triangle", "sublabel": "IT — last Apr 10"},
            {"label": "At Risk", "value": 1, "tone": "gold", "icon": "shield"},
        ],
        rows=ROLLING_FORECAST_ROWS,
        audit_comment="IT department forecast has not been updated since April. Marketing quarterly cadence may be insufficient given high variance profile.",
    ),
    "zero-based-budget": _page_payload(
        kpis=[
            {"label": "Packages Reviewed", "value": 3, "tone": "navy", "icon": "grid"},
            {"label": "Total Requested", "value": "$3.55M", "tone": "navy", "icon": "wallet"},
            {"label": "Total Approved", "value": "$2.95M", "tone": "success", "icon": "check", "sublabel": "83% approval rate"},
            {"label": "Reduced Packages", "value": 1, "tone": "gold", "icon": "alert-triangle"},
        ],
        rows=ZBB_ROWS,
        audit_comment="Legacy System Maintenance package reduced by 50% — verify decommission timeline and risk of service disruption.",
    ),
    "capex-utilisation": _page_payload(
        kpis=[
            {"label": "Active Projects", "value": 3, "tone": "navy", "icon": "building"},
            {"label": "Total Capex Budget", "value": "$14.5M", "tone": "navy", "icon": "wallet"},
            {"label": "Avg Utilisation", "value": "62.0%", "tone": "gold", "icon": "activity"},
            {"label": "Delayed Projects", "value": 1, "tone": "danger", "icon": "alert-triangle"},
        ],
        chart_bars=[
            {"label": "ERP Mod", "budget": 100, "actual": 68},
            {"label": "Warehouse", "budget": 100, "actual": 93},
            {"label": "Office Fit-out", "budget": 100, "actual": 25, "negative": True},
        ],
        rows=CAPEX_ROWS,
        audit_comment="Office Fit-out project at 25% utilisation with 4-month slippage. Review project governance and capital allocation re-prioritisation.",
    ),
    "departmental-scorecard": _page_payload(
        kpis=[
            {"label": "Departments Scored", "value": 4, "tone": "navy", "icon": "users"},
            {"label": "Avg Composite", "value": 87, "tone": "success", "icon": "activity"},
            {"label": "A-Rated", "value": 1, "tone": "success", "icon": "check"},
            {"label": "C-Rated", "value": 1, "tone": "danger", "icon": "alert-triangle", "sublabel": "Marketing"},
        ],
        rows=SCORECARD_ROWS,
        audit_comment="Marketing department composite score of 79 (C-rated) driven by budget accuracy of 78% and variance management of 70%. Recommend targeted remediation.",
    ),
    "unspent-parked": _page_payload(
        kpis=[
            {"label": "Parked Budget", "value": "$1.31M", "tone": "navy", "icon": "wallet"},
            {"label": "Dec Release Spike", "value": "44%", "tone": "danger", "icon": "alert-triangle", "sublabel": "CC-1001"},
            {"label": "Flagged CCs", "value": 2, "tone": "danger", "icon": "activity"},
            {"label": "Normal Pattern", "value": 1, "tone": "success", "icon": "check"},
        ],
        chart_bars=[
            {"label": "Q1", "budget": 100, "actual": 8},
            {"label": "Q2", "budget": 100, "actual": 6},
            {"label": "Q3", "budget": 100, "actual": 9},
            {"label": "Q4 Oct", "budget": 100, "actual": 15, "negative": True},
            {"label": "Q4 Nov", "budget": 100, "actual": 28, "negative": True},
            {"label": "Q4 Dec", "budget": 100, "actual": 44, "negative": True},
        ],
        rows=UNSPENT_ROWS,
        audit_comment="44% of CC-1001 parked budget released in December indicates spend-it-or-lose-it behaviour. Test sample of December POs for business justification.",
    ),
    "cost-driver-trend": _page_payload(
        kpis=[
            {"label": "Net Variance", "value": "$0", "tone": "navy", "icon": "activity", "sublabel": "Drivers net to zero"},
            {"label": "Volume Impact", "value": "+$320K", "tone": "danger", "icon": "trending-up"},
            {"label": "Price Impact", "value": "-$160K", "tone": "success", "icon": "wallet"},
            {"label": "Productivity Gain", "value": "-$200K", "tone": "success", "icon": "check"},
        ],
        chart_bars=[
            {"label": "Volume", "budget": 100, "actual": 108, "negative": True},
            {"label": "Price", "budget": 100, "actual": 96},
            {"label": "Mix", "budget": 100, "actual": 102, "negative": True},
            {"label": "Exchange", "budget": 100, "actual": 98},
            {"label": "Productivity", "budget": 100, "actual": 95},
        ],
        rows=COST_DRIVER_ROWS,
        audit_comment="Volume-driven unfavourable variance of $320K partially offset by productivity gains. Validate volume assumptions against production data.",
    ),
    "contingency-reserve": _page_payload(
        kpis=[
            {"label": "Total Reserves", "value": "$4.0M", "tone": "navy", "icon": "shield"},
            {"label": "Total Drawn", "value": "$2.57M", "tone": "gold", "icon": "wallet", "sublabel": "64.3% utilisation"},
            {"label": "Policy Breach", "value": 1, "tone": "danger", "icon": "alert-triangle"},
            {"label": "Near Limit", "value": 1, "tone": "gold", "icon": "activity"},
        ],
        rows=CONTINGENCY_ROWS,
        audit_comment="RES-003 project contingency breached by $20K. Verify whether additional board approval was obtained per reserve policy Section 4.2.",
    ),
    "forecast-bias": _page_payload(
        kpis=[
            {"label": "Periods Analysed", "value": 6, "tone": "navy", "icon": "activity"},
            {"label": "Under-Forecast", "value": 4, "tone": "danger", "icon": "alert-triangle", "sublabel": "Systematic bias"},
            {"label": "Avg Bias", "value": "+3.8%", "tone": "danger", "icon": "trending-up"},
            {"label": "Max Bias", "value": "+10%", "tone": "danger", "icon": "wallet", "sublabel": "Apr 2026"},
        ],
        chart_spark=[
            {"label": "Jan", "value": 8, "direction": "over"},
            {"label": "Feb", "value": -5, "direction": "under"},
            {"label": "Mar", "value": 6, "direction": "over"},
            {"label": "Apr", "value": 10, "direction": "over"},
            {"label": "May", "value": -3, "direction": "under"},
            {"label": "Jun", "value": 7, "direction": "over"},
        ],
        rows=FORECAST_BIAS_ROWS,
        audit_comment="Systematic under-forecasting bias of +3.8% average suggests optimistic budget setting. Recommend calibration workshop with FP&A.",
    ),
    "approval-audit-trail": _page_payload(
        kpis=[
            {"label": "Events Logged", "value": 4, "tone": "navy", "icon": "clipboard"},
            {"label": "Approvals", "value": 2, "tone": "success", "icon": "check"},
            {"label": "Late Submissions", "value": 1, "tone": "danger", "icon": "alert-triangle"},
            {"label": "Revisions", "value": 1, "tone": "gold", "icon": "layers"},
        ],
        rows=APPROVAL_TRAIL_ROWS,
        audit_comment="Audit trail confirms CC-1002 budget submitted 14 days after period start. Immutable log integrity verified — no tampering detected.",
    ),
    "scope-universe": _page_payload(
        kpis=[
            {"label": "Entities in Scope", "value": 3, "tone": "navy", "icon": "layers"},
            {"label": "Universe Coverage", "value": "95%", "tone": "success", "icon": "check"},
            {"label": "High Risk", "value": 1, "tone": "danger", "icon": "alert-triangle", "sublabel": "EMEA BU"},
            {"label": "Out of Scope", "value": 1, "tone": "gold", "icon": "activity"},
        ],
        rows=SCOPE_ROWS,
        audit_comment="EMEA BU coverage at 85% due to partial year inclusion. Joint Venture Alpha excluded — confirm materiality assessment documentation.",
    ),
    "rule-library": _page_payload(
        kpis=[
            {"label": "Active Rules", "value": 5, "tone": "navy", "icon": "grid"},
            {"label": "Total Hits YTD", "value": 13, "tone": "gold", "icon": "alert-triangle"},
            {"label": "Last Run", "value": "Today", "tone": "success", "icon": "check"},
            {"label": "Categories", "value": 5, "tone": "navy", "icon": "layers"},
        ],
        rows=RULE_LIBRARY_ROWS,
        audit_comment="All CAAT rules synchronised and active. Chronic Overspend rule generated 3 hits this month — cross-reference with exception queue.",
    ),
    "data-sources": _page_payload(
        kpis=[
            {"label": "Connectors", "value": 4, "tone": "navy", "icon": "server"},
            {"label": "Healthy", "value": 3, "tone": "success", "icon": "check"},
            {"label": "Degraded", "value": 1, "tone": "gold", "icon": "alert-triangle", "sublabel": "Workday HCM"},
            {"label": "Records Synced", "value": "5.8M", "tone": "navy", "icon": "activity"},
        ],
        rows=DATA_SOURCE_ROWS,
        audit_comment="Workday HCM connector showing degraded status — last sync 30 hours ago. Headcount data used in budget assumption testing may be stale.",
    ),
    "sampling-builder": _page_payload(
        kpis=[
            {"label": "Samples Built", "value": 3, "tone": "navy", "icon": "file-check"},
            {"label": "Total Items Tested", "value": 60, "tone": "gold", "icon": "activity"},
            {"label": "Complete", "value": 2, "tone": "success", "icon": "check"},
            {"label": "In Progress", "value": 1, "tone": "gold", "icon": "clipboard"},
        ],
        rows=SAMPLING_ROWS,
        audit_comment="MUS sample of 12 budget revisions from population of 47 provides 95% confidence. Contingency drawdowns tested at 100% given small population.",
    ),
    "findings": _page_payload(
        kpis=[
            {"label": "Total Findings", "value": 3, "tone": "navy", "icon": "clipboard"},
            {"label": "Open", "value": 1, "tone": "danger", "icon": "alert-triangle"},
            {"label": "Critical/High", "value": 2, "tone": "danger", "icon": "shield"},
            {"label": "Draft", "value": 1, "tone": "gold", "icon": "activity"},
        ],
        rows=FINDING_ROWS,
        audit_comment="FND-27-002 (Critical) requires immediate management attention. Draft finding FND-27-003 pending partner review before issuance.",
    ),
    "action-tracker": _page_payload(
        kpis=[
            {"label": "Open Actions", "value": 4, "tone": "navy", "icon": "check"},
            {"label": "In Progress", "value": 2, "tone": "gold", "icon": "activity"},
            {"label": "Overdue", "value": 0, "tone": "success", "icon": "check"},
            {"label": "Avg Completion", "value": "28.8%", "tone": "gold", "icon": "trending-up"},
        ],
        rows=ACTION_ROWS,
        audit_comment="Action closure rate at 28.8% is below the 64.3% module target. Escalate ACT-27-002 (contingency matrix revision) due 2026-08-15.",
    ),
}
