"""Module data models — all 25 sub-pages of Module 22 (Cash & Petty Cash).

RULES followed (same as every other module in this repo):
  1. Every table is prefixed `mod_cash_petty_cash_` so it can't collide with
     another intern's table in the shared MySQL database.
  2. Every table inherits `TenantMixin` (tenant_id + created_at/updated_at)
     and is read/written only through `tenant_scoped()` in router.py.

Rather than hand-writing 24 near-identical SQLAlchemy classes, each
sub-page is declared once as a (number, slug, title, fields) row below and
built into a real mapped class by `_make_model()`. This keeps the 25-page
spec (from the module catalogue) authoritative and file size sane, while
every generated class is still a normal `Base` subclass with its own table.

Page 16 ("Module Dashboard & KPIs") has no table of its own — it's a
computed summary over the other 24 tables, served by router.py.
"""
from sqlalchemy import Column, Float, Integer, String, Text

from app.core.database import Base
from app.core.tenancy import TenantMixin

# ---------------------------------------------------------------------------
# 1-15: signature pages — the module-specific audit checks.
# ---------------------------------------------------------------------------
SIGNATURE_CHECKS = [
    (1, "imprest_limit_replenishment", "Imprest Limit & Replenishment"),
    (2, "voucher_support_approval", "Voucher Support & Approval"),
    (3, "surprise_cash_count", "Surprise Cash Count"),
    (4, "sec40a3_limit_breach", "Sec 40A(3) Limit Breach"),
    (5, "backdated_out_of_sequence_voucher", "Backdated / Out-of-Sequence Voucher"),
    (6, "cash_denomination_analysis", "Cash Denomination Analysis"),
    (7, "cash_in_hand_ageing", "Cash-in-Hand Ageing"),
    (8, "multi_location_cash_view", "Multi-Location Cash View"),
    (9, "cash_sales_skimming", "Cash Sales Skimming"),
    (10, "custodian_handover_log", "Custodian Handover Log"),
    (11, "cash_to_bank_deposit_timeliness", "Cash-to-Bank Deposit Timeliness"),
    (12, "expense_category_split", "Expense Category Split"),
    (13, "duplicate_voucher_detection", "Duplicate Voucher Detection"),
    (14, "petty_cash_reconciliation", "Petty-Cash Reconciliation"),
    (15, "insurance_of_cash", "Insurance of Cash"),
]

# ---------------------------------------------------------------------------
# 16-25: shell pages — standard scaffolding every module gets.
# ---------------------------------------------------------------------------
SHELL_PAGES = [
    (16, "module_dashboard_kpis", "Module Dashboard & KPIs"),
    (17, "scope_audit_universe", "Scope & Audit Universe"),
    (18, "risk_control_matrix", "Risk & Control Matrix (RCM)"),
    (19, "test_analytics_rule_library", "Test & Analytics Rule Library"),
    (20, "data_source_connector_setup", "Data Source & Connector Setup"),
    (21, "sampling_population_builder", "Sampling & Population Builder"),
    (22, "exception_red_flag_queue", "Exception & Red-Flag Queue"),
    (23, "working_papers_evidence", "Working Papers & Evidence"),
    (24, "observation_finding_log", "Observation & Finding Log"),
    (25, "remediation_action_tracker", "Remediation / Action Tracker"),
]

ALL_PAGES = SIGNATURE_CHECKS + SHELL_PAGES

# Field spec: (column_name, kind, default). kind is "str" | "num" | "text".
# All 15 signature checks share one practical checklist shape (they differ
# in title/description, not in what an auditor logs against them).
_CHECK_FIELDS = [
    ("reference_no", "str", ""),
    ("subject", "str", ""),
    ("location", "str", ""),
    ("amount", "num", 0.0),
    ("status", "str", "Open"),
    ("checked_by", "str", ""),
    ("check_date", "str", ""),
    ("notes", "text", ""),
]

# Shell pages 17-25 each have a purpose-built shape. Page 16 (dashboard) is
# computed, so it has no entry here.
PAGE_FIELDS: dict[str, list[tuple[str, str, object]]] = {
    slug: _CHECK_FIELDS for _, slug, _ in SIGNATURE_CHECKS
}
PAGE_FIELDS.update(
    {
        "scope_audit_universe": [
            ("entity_name", "str", ""),
            ("location", "str", ""),
            ("in_scope", "str", "Yes"),
            ("risk_rating", "str", "Medium"),
            ("notes", "text", ""),
        ],
        "risk_control_matrix": [
            ("risk_description", "text", ""),
            ("control_description", "text", ""),
            ("control_type", "str", "Preventive"),
            ("control_owner", "str", ""),
            ("risk_rating", "str", "Medium"),
        ],
        "test_analytics_rule_library": [
            ("rule_name", "str", ""),
            ("description", "text", ""),
            ("rule_type", "str", "Threshold"),
            ("threshold_value", "num", 0.0),
            ("is_active", "str", "Yes"),
        ],
        "data_source_connector_setup": [
            ("source_name", "str", ""),
            ("source_type", "str", "ERP Export"),
            ("connection_ref", "str", ""),
            ("status", "str", "Configured"),
        ],
        "sampling_population_builder": [
            ("population_desc", "str", ""),
            ("population_size", "num", 0.0),
            ("sample_size", "num", 0.0),
            ("method", "str", "Random"),
            ("notes", "text", ""),
        ],
        "exception_red_flag_queue": [
            ("description", "text", ""),
            ("severity", "str", "Medium"),
            ("source_check", "str", ""),
            ("status", "str", "Open"),
            ("assigned_to", "str", ""),
        ],
        "working_papers_evidence": [
            ("title", "str", ""),
            ("doc_type", "str", "Evidence"),
            ("reference_no", "str", ""),
            ("prepared_by", "str", ""),
            ("reviewed_by", "str", ""),
            ("status", "str", "Draft"),
        ],
        "observation_finding_log": [
            ("title", "str", ""),
            ("severity", "str", "Medium"),
            ("root_cause", "text", ""),
            ("recommendation", "text", ""),
            ("status", "str", "Open"),
        ],
        "remediation_action_tracker": [
            ("finding_ref", "str", ""),
            ("action", "text", ""),
            ("owner", "str", ""),
            ("due_date", "str", ""),
            ("status", "str", "Pending"),
        ],
    }
)


def _pascal(slug: str) -> str:
    return "".join(part.capitalize() for part in slug.split("_"))


def _make_model(slug: str, fields: list[tuple[str, str, object]]):
    """Build a tenant-scoped SQLAlchemy model for one sub-page."""
    attrs = {
        "__tablename__": f"mod_cash_petty_cash_{slug}",
        "id": Column(Integer, primary_key=True),
    }
    for name, kind, default in fields:
        if kind == "num":
            attrs[name] = Column(Float, default=default)
        elif kind == "text":
            attrs[name] = Column(Text, default=default)
        else:
            attrs[name] = Column(String(255), default=default)
    return type(f"{_pascal(slug)}Record", (Base, TenantMixin), attrs)


# slug -> mapped model class, for every page that has a table (24 of 25;
# module_dashboard_kpis is computed and intentionally excluded).
MODELS: dict[str, type] = {
    slug: _make_model(slug, PAGE_FIELDS[slug])
    for _, slug, _ in ALL_PAGES
    if slug in PAGE_FIELDS
}

# Expose each generated class at module level too (mod.<ClassName>) so it
# behaves like an ordinary hand-written model for tooling/imports.
globals().update({model.__name__: model for model in MODELS.values()})
