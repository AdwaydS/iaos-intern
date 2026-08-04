"""Patient Billing & Revenue Cycle — sub-page catalogue.

Single source of truth for the module's 25 sub-pages. Each signature / shell
sub-page describes the auditable records it captures (columns + derived fields).
The dynamic model / schema builders and the generic CRUD + analytics router all
consume this file, so adding a sub-page later is just adding one dict here.
"""


def C(name: str, label: str, typ: str = "text", **kw) -> dict:
    """Column shorthand — everything else is optional metadata."""
    d = {"name": name, "label": label, "type": typ}
    d.update(kw)
    return d


def _num(v):
    try:
        return float(v) if v not in (None, "") else 0.0
    except (TypeError, ValueError):
        return 0.0


# ── Derivation hooks (computed fields, re-run on create + update) ────────────

def _dc_charge(d):
    if d.get("billed_amount") in (None, ""):
        d["billed_amount"] = round(_num(d.get("qty")) * _num(d.get("rate")), 2)


def _dc_tariff(d):
    d["rate_variance"] = round(_num(d.get("billed_rate")) - _num(d.get("approved_rate")), 2)


def _dc_tpa(d):
    billed = _num(d.get("billed_amount"))
    d["realisation_pct"] = round(_num(d.get("approved_amount")) / billed * 100, 1) if billed else 0.0


def _dc_pharmacy(d):
    d["variance"] = round(_num(d.get("billed_amount")) - _num(d.get("issued_amount")), 2)


def _dc_investigation(d):
    d["variance"] = round(_num(d.get("billed_amount")) - _num(d.get("tariff_amount")), 2)


def _dc_bed(d):
    expected = round(_num(d.get("occupancy_days")) * _num(d.get("room_rate_per_day")), 2)
    d["expected_charge"] = expected
    d["variance"] = round(_num(d.get("billed_room_charge")) - expected, 2)


def _dc_doctor(d):
    d["referral_payable"] = round(_num(d.get("fee_amount")) * _num(d.get("referral_pct")) / 100, 2)


def _dc_payermix(d):
    count = _num(d.get("patient_count"))
    d["avg_bill_value"] = round(_num(d.get("revenue_amount")) / count, 2) if count else 0.0


def _dc_advance(d):
    d["balance"] = round(
        _num(d.get("amount")) - _num(d.get("utilized_amount")) - _num(d.get("refunded_amount")), 2
    )


def _dc_ageing(d):
    days = int(_num(d.get("days_outstanding")))
    d["bucket"] = "0-30" if days <= 30 else "31-60" if days <= 60 else "61-90" if days <= 90 else "90+"


SUBPAGES = [
    # ── Signature procedures (1–15) ───────────────────────────────────────────
    {
        "no": 1,
        "key": "charge_capture",
        "model": "ChargeCapture",
        "title": "Charge-Capture Completeness",
        "type": "signature",
        "purpose": "Services rendered vs billed",
        "derive": _dc_charge,
        "columns": [
            C("patient_no", "Patient / IPD No", "text", required=True),
            C("service_date", "Service Date", "text", help="YYYY-MM-DD"),
            C("department", "Department", "select", options=["OPD", "IPD", "Surgery", "ICU", "Emergency", "Pharmacy", "Diagnostics", "Recovery"]),
            C("service_code", "Service Code"),
            C("service_desc", "Service Description", "textarea"),
            C("qty", "Qty", "int", default=1),
            C("rate", "Rate (₹)", "float", money=True),
            C("billed_amount", "Billed Amount (₹)", "float", money=True, help="Auto = qty × rate if blank"),
            C("status", "Capture Status", "select", options=["Captured", "Partial", "Missed"], default="Captured"),
            C("remarks", "Remarks", "textarea"),
        ],
    },
    {
        "no": 2,
        "key": "tariff_package",
        "model": "TariffPackage",
        "title": "Package / Tariff Integrity",
        "type": "signature",
        "purpose": "Rate-card and package accuracy",
        "derive": _dc_tariff,
        "columns": [
            C("package_name", "Package Name", required=True),
            C("package_code", "Package Code"),
            C("department", "Department", "select", options=["General", "Maternity", "Orthopaedics", "Cardiology", "Oncology", "Paediatrics", "Surgery", "OPD"]),
            C("tariff_version", "Tariff Version", default="v1.0"),
            C("effective_from", "Effective From", help="YYYY-MM-DD"),
            C("effective_to", "Effective To", help="YYYY-MM-DD"),
            C("approved_rate", "Approved Rate (₹)", "float", money=True),
            C("billed_rate", "Billed Rate (₹)", "float", money=True),
            C("rate_variance", "Rate Variance (₹)", "float", money=True, derived=True),
            C("notes", "Notes", "textarea"),
        ],
    },
    {
        "no": 3,
        "key": "tpa_claim",
        "model": "TpaClaim",
        "title": "TPA / Insurance Claim Review",
        "type": "signature",
        "purpose": "Claim submission and realisation",
        "derive": _dc_tpa,
        "columns": [
            C("claim_no", "Claim No", required=True),
            C("patient_no", "Patient / IPD No"),
            C("tpa_name", "TPA / Insurer", "select", options=["MediAssist", "Paramount", "Vidal Health", "Family Health Plan", "Star Health", "HDFC ERGO", "Other"]),
            C("policy_no", "Policy No"),
            C("billed_amount", "Billed Amount (₹)", "float", money=True),
            C("approved_amount", "Approved Amount (₹)", "float", money=True),
            C("realisation_pct", "Realisation %", "float", pct=True, derived=True),
            C("submitted_date", "Submitted Date", help="YYYY-MM-DD"),
            C("status", "Claim Status", "select", options=["Drafted", "Submitted", "Under Review", "Approved", "Partially Approved", "Rejected", "Realised"], default="Submitted"),
            C("remarks", "Remarks", "textarea"),
        ],
    },
    {
        "no": 4,
        "key": "claim_denial",
        "model": "ClaimDenial",
        "title": "Claim-Denial Analytics",
        "type": "signature",
        "purpose": "Rejection root-cause",
        "columns": [
            C("claim_no", "Claim No", required=True),
            C("denial_category", "Denial Category", "select", options=["Documentation", "Pre-auth Missing", "Policy Exclusion", "Coding Error", "Duplicate Claim", "Timely Filing", "Co-pay Clause", "Other"]),
            C("denial_reason", "Denial Reason", "textarea"),
            C("denied_amount", "Denied Amount (₹)", "float", money=True),
            C("denial_date", "Denial Date", help="YYYY-MM-DD"),
            C("resubmitted", "Resubmitted", "bool", default=False),
            C("resubmission_status", "Resubmission Status", "select", options=["Not Resubmitted", "Resubmitted", "Approved", "Rejected", "Open"], default="Open"),
            C("owner", "Recovery Owner"),
        ],
    },
    {
        "no": 5,
        "key": "concession",
        "model": "Concession",
        "title": "Discount & Concession Control",
        "type": "signature",
        "purpose": "Waiver-authority compliance",
        "columns": [
            C("bill_no", "Bill No", required=True),
            C("patient_no", "Patient / IPD No"),
            C("concession_type", "Concession Type", "select", options=["Cash Discount", "Corporate", "Employee", "Charity / Free", "Senior Citizen", "Insurance Adjustment", "Manual Override"]),
            C("amount", "Concession Amount (₹)", "float", money=True),
            C("authorized_by", "Authorized By"),
            C("waiver_ref", "Waiver / Approval Ref"),
            C("within_authority", "Within Authority", "bool", default=True),
            C("remarks", "Remarks", "textarea"),
        ],
    },
    {
        "no": 6,
        "key": "pharmacy_recon",
        "model": "PharmacyRecon",
        "title": "Pharmacy-Billing Reconciliation",
        "type": "signature",
        "purpose": "Drug-charge capture",
        "derive": _dc_pharmacy,
        "columns": [
            C("recon_date", "Reconciliation Date", required=True, help="YYYY-MM-DD"),
            C("department", "Department", "select", options=["In-house Pharmacy", "IPD Dispensary", "OPD Dispensary", "Emergency", "Nursing Floor"]),
            C("issued_amount", "Drugs Issued (₹)", "float", money=True),
            C("billed_amount", "Billed to Patients (₹)", "float", money=True),
            C("variance", "Variance (₹)", "float", money=True, derived=True),
            C("variance_reason", "Variance Reason", "select", options=["None", "Expired Stock", "Floor Stock", "Pilferage", "Missed Billing", "Price Not Updated", "Other"], default="None"),
            C("status", "Recon Status", "select", options=["Reconciled", "Pending", "Exception"], default="Pending"),
        ],
    },
    {
        "no": 7,
        "key": "investigation_bill",
        "model": "InvestigationBill",
        "title": "Investigation / Diagnostic Billing",
        "type": "signature",
        "purpose": "Lab/radiology charge capture",
        "derive": _dc_investigation,
        "columns": [
            C("investigation_code", "Investigation Code", required=True),
            C("investigation_name", "Investigation Name"),
            C("department", "Department", "select", options=["Lab", "Radiology", "Pathology", "Cardiology", "Endoscopy", "Other Diagnostics"]),
            C("patient_no", "Patient / IPD No"),
            C("tariff_amount", "Tariff Amount (₹)", "float", money=True),
            C("billed_amount", "Billed Amount (₹)", "float", money=True),
            C("variance", "Variance (₹)", "float", money=True, derived=True),
            C("status", "Billing Status", "select", options=["Billed Correctly", "Under-billed", "Over-billed", "Not Billed"], default="Billed Correctly"),
        ],
    },
    {
        "no": 8,
        "key": "bed_charge",
        "model": "BedCharge",
        "title": "Bed / Room-Charge Accuracy",
        "type": "signature",
        "purpose": "Occupancy-to-billing match",
        "derive": _dc_bed,
        "columns": [
            C("patient_no", "Patient / IPD No", required=True),
            C("ward", "Ward / Category", "select", options=["General", "Semi-Private", "Private", "Deluxe", "ICU", "NICU", "HDU"]),
            C("bed_no", "Bed No"),
            C("admission_date", "Admission Date", help="YYYY-MM-DD"),
            C("discharge_date", "Discharge Date", help="YYYY-MM-DD"),
            C("occupancy_days", "Occupancy Days", "int"),
            C("room_rate_per_day", "Room Rate / Day (₹)", "float", money=True),
            C("expected_charge", "Expected Charge (₹)", "float", money=True, derived=True),
            C("billed_room_charge", "Billed Room Charge (₹)", "float", money=True),
            C("variance", "Variance (₹)", "float", money=True, derived=True),
        ],
    },
    {
        "no": 9,
        "key": "doctor_fee",
        "model": "DoctorFee",
        "title": "Doctor-Fee & Referral",
        "type": "signature",
        "purpose": "Fee-share and referral controls",
        "derive": _dc_doctor,
        "columns": [
            C("doctor_name", "Doctor Name", required=True),
            C("patient_no", "Patient / IPD No"),
            C("fee_type", "Fee Type", "select", options=["Consultation", "Surgery", "Procedure", "Anaesthesia", "Specialist Visit"]),
            C("fee_amount", "Fee Amount (₹)", "float", money=True),
            C("collected_by", "Collected By", "select", options=["Hospital", "Doctor", "Shared", "Third Party"]),
            C("referral_doctor", "Referral Doctor"),
            C("referral_pct", "Referral %", "float", pct=True, default=0),
            C("referral_payable", "Referral Payable (₹)", "float", money=True, derived=True),
            C("agreement_documented", "Agreement Documented", "bool", default=True),
        ],
    },
    {
        "no": 10,
        "key": "payer_mix",
        "model": "PayerMix",
        "title": "Cash vs Credit-Patient Mix",
        "type": "signature",
        "purpose": "Payer-mix analytics",
        "derive": _dc_payermix,
        "columns": [
            C("period", "Period (YYYY-MM)", required=True),
            C("payer_type", "Payer Type", "select", options=["Cash", "Insurance / TPA", "Corporate", "Government Scheme", "Other"]),
            C("patient_count", "Patient Count", "int"),
            C("revenue_amount", "Revenue (₹)", "float", money=True),
            C("avg_bill_value", "Avg Bill Value (₹)", "float", money=True, derived=True),
            C("collection_pct", "Collection %", "float", pct=True),
            C("notes", "Notes", "textarea"),
        ],
    },
    {
        "no": 11,
        "key": "patient_advance",
        "model": "PatientAdvance",
        "title": "Advance & Deposit Management",
        "type": "signature",
        "purpose": "Patient-advance tracking",
        "derive": _dc_advance,
        "columns": [
            C("advance_no", "Advance / Receipt No", required=True),
            C("patient_no", "Patient / IPD No"),
            C("received_date", "Received Date", help="YYYY-MM-DD"),
            C("amount", "Advance Amount (₹)", "float", money=True),
            C("mode", "Payment Mode", "select", options=["Cash", "UPI", "Card", "NEFT", "Cheque", "Wallet"]),
            C("utilized_amount", "Utilized (₹)", "float", money=True, default=0),
            C("refunded_amount", "Refunded (₹)", "float", money=True, default=0),
            C("balance", "Balance (₹)", "float", money=True, derived=True),
            C("status", "Status", "select", options=["Open", "Utilized", "Refunded", "Lapsed"], default="Open"),
        ],
    },
    {
        "no": 12,
        "key": "scheme_bill",
        "model": "SchemeBill",
        "title": "Corporate / Scheme Billing",
        "type": "signature",
        "purpose": "CGHS/ESI/scheme compliance",
        "columns": [
            C("scheme_name", "Scheme", "select", options=["CGHS", "ESI", "State Scheme", "Corporate", "EHS", "Other"], required=True),
            C("patient_no", "Patient / IPD No"),
            C("bill_no", "Bill No"),
            C("billed_amount", "Billed Amount (₹)", "float", money=True),
            C("approved_amount", "Approved Amount (₹)", "float", money=True),
            C("claim_status", "Claim Status", "select", options=["Pending", "Submitted", "Approved", "Rejected", "Realised"], default="Pending"),
            C("ratecard_linked", "Rate Card Linked", "bool", default=True),
            C("compliance_notes", "Compliance Notes", "textarea"),
        ],
    },
    {
        "no": 13,
        "key": "revenue_leakage",
        "model": "RevenueLeakage",
        "title": "Revenue-Leakage Detection",
        "type": "signature",
        "purpose": "Missed-charge analytics",
        "columns": [
            C("leakage_type", "Leakage Type", "select", options=["Missed Charge", "Under-billing", "Discount Override", "Package Loss", "Unbilled Bed Day", "Unbilled Pharmacy", "Free Treatment", "Tariff Not Applied"]),
            C("patient_no", "Patient / IPD No"),
            C("description", "Description", "textarea"),
            C("amount", "Amount at Risk (₹)", "float", money=True),
            C("detection_date", "Detection Date", help="YYYY-MM-DD"),
            C("source", "Detection Source", "select", options=["CAAT Rule", "Manual Review", "Pharmacy Recon", "Bed Audit", "TPA Recon"]),
            C("rule_ref", "Rule Ref"),
            C("status", "Status", "select", options=["Open", "Investigating", "Recovered", "Write-off"], default="Open"),
        ],
    },
    {
        "no": 14,
        "key": "refund_adjustment",
        "model": "RefundAdjustment",
        "title": "Refund & Adjustment Review",
        "type": "signature",
        "purpose": "Post-discharge adjustments",
        "columns": [
            C("bill_no", "Bill No", required=True),
            C("patient_no", "Patient / IPD No"),
            C("refund_amount", "Refund Amount (₹)", "float", money=True),
            C("refund_date", "Refund Date", help="YYYY-MM-DD"),
            C("reason", "Reason", "select", options=["Duplicate Payment", "Cancellation", "Over-billing", "Discharge Adjustment", "Deposit Refund"]),
            C("approved_by", "Approved By"),
            C("mode", "Refund Mode", "select", options=["Cash", "UPI", "Card", "NEFT", "Cheque"]),
            C("status", "Status", "select", options=["Pending Approval", "Approved", "Rejected", "Processed"], default="Pending Approval"),
        ],
    },
    {
        "no": 15,
        "key": "credit_ageing",
        "model": "CreditAgeing",
        "title": "Credit-Patient Ageing",
        "type": "signature",
        "purpose": "TPA-receivable recovery",
        "derive": _dc_ageing,
        "columns": [
            C("patient_no", "Patient / IPD No", required=True),
            C("tpa_name", "TPA / Payer"),
            C("invoice_no", "Invoice No"),
            C("invoice_date", "Invoice Date", help="YYYY-MM-DD"),
            C("amount", "Outstanding Amount (₹)", "float", money=True),
            C("days_outstanding", "Days Outstanding", "int"),
            C("bucket", "Ageing Bucket", "select", options=["0-30", "31-60", "61-90", "90+"], derived=True),
            C("status", "Status", "select", options=["Open", "Partially Paid", "Under Dispute", "Closed"], default="Open"),
        ],
    },
    # ── Workspace shell (16–25) ───────────────────────────────────────────────
    {
        "no": 16,
        "key": "dashboard",
        "model": None,
        "title": "Module Dashboard & KPIs",
        "type": "shell",
        "purpose": "Live risk score, open exceptions, coverage % and trend for this domain",
        "columns": [],
    },
    {
        "no": 17,
        "key": "audit_universe",
        "model": "AuditUniverse",
        "title": "Scope & Audit Universe",
        "type": "shell",
        "purpose": "Define the auditable units/entities/processes in scope for this module",
        "columns": [
            C("unit", "Audit Unit / Location", required=True),
            C("entity_type", "Entity Type", "select", options=["Hospital", "Diagnostics", "Pharmacy", "Specialty Clinic", "Ambulance", "Homecare"]),
            C("process", "Process / Cycle"),
            C("risk_rating", "Risk Rating", "select", options=["Low", "Medium", "High", "Critical"], default="Medium"),
            C("in_scope", "In Scope", "bool", default=True),
            C("coverage_pct", "Coverage %", "float", pct=True),
            C("notes", "Notes", "textarea"),
        ],
    },
    {
        "no": 18,
        "key": "rcm_control",
        "model": "RcmControl",
        "title": "Risk & Control Matrix (RCM)",
        "type": "shell",
        "purpose": "Catalogue risks, controls, assertions and control owners for the domain",
        "columns": [
            C("risk_id", "Risk ID", required=True),
            C("risk_desc", "Risk Description", "textarea"),
            C("assertion", "Assertion", "select", options=["Completeness", "Accuracy", "Validity", "Authorization", "Existence", "Cut-off", "Rights"]),
            C("control_id", "Control ID"),
            C("control_desc", "Control Description", "textarea"),
            C("control_type", "Control Type", "select", options=["Preventive", "Detective", "Manual", "Automated"], default="Detective"),
            C("control_owner", "Control Owner"),
            C("rating", "Test Rating", "select", options=["Effective", "Partially Effective", "Ineffective", "Not Tested"], default="Not Tested"),
        ],
    },
    {
        "no": 19,
        "key": "test_rule",
        "model": "TestRule",
        "title": "Test & Analytics Rule Library",
        "type": "shell",
        "purpose": "Configure automated red-flag rules, thresholds and CAAT scripts",
        "columns": [
            C("rule_code", "Rule Code", required=True),
            C("rule_name", "Rule Name"),
            C("category", "Category", "select", options=["Charge Capture", "Tariff", "TPA Claims", "Denials", "Discounts", "Leakage", "Ageing", "Reconciliation"]),
            C("threshold", "Threshold"),
            C("severity", "Severity", "select", options=["Low", "Medium", "High", "Critical"], default="Medium"),
            C("enabled", "Enabled", "bool", default=True),
            C("script_sql", "CAAT Script / SQL", "textarea"),
            C("last_triggered", "Last Triggered", help="YYYY-MM-DD"),
        ],
    },
    {
        "no": 20,
        "key": "data_source",
        "model": "DataSource",
        "title": "Data Source & Connector Setup",
        "type": "shell",
        "purpose": "Map ERP tables/APIs/uploads that feed this module's analytics",
        "columns": [
            C("source_name", "Source Name", required=True),
            C("source_type", "Source Type", "select", options=["ERP", "HIS / EMR", "Pharmacy System", "LIS", "PACS", "API", "Spreadsheet"]),
            C("system", "Source System"),
            C("endpoint", "Endpoint / Connection"),
            C("table_map", "Table / Field Map", "textarea"),
            C("sync_status", "Sync Status", "select", options=["Not Configured", "Connected", "Syncing", "Failed", "Disconnected"], default="Not Configured"),
            C("last_sync", "Last Sync", help="YYYY-MM-DD"),
            C("notes", "Notes", "textarea"),
        ],
    },
    {
        "no": 21,
        "key": "sampling_batch",
        "model": "SamplingBatch",
        "title": "Sampling & Population Builder",
        "type": "shell",
        "purpose": "Draw statistical or judgemental samples from the full population",
        "columns": [
            C("sample_code", "Sample Code", required=True),
            C("method", "Method", "select", options=["Random", "Stratified", "Judgemental", "Systematic", "Block"], default="Random"),
            C("population_size", "Population Size", "int"),
            C("sample_size", "Sample Size", "int"),
            C("confidence", "Confidence %", "float", pct=True, default=95),
            C("criteria", "Selection Criteria", "textarea"),
            C("status", "Status", "select", options=["Draft", "Drawn", "Tested", "Complete"], default="Draft"),
        ],
    },
    {
        "no": 22,
        "key": "exception_queue",
        "model": "ExceptionQueue",
        "title": "Exception & Red-Flag Queue",
        "type": "shell",
        "purpose": "Triage system-generated exceptions with disposition and notes",
        "columns": [
            C("exception_id", "Exception ID", required=True),
            C("rule_ref", "Rule Ref"),
            C("entity_type", "Entity / Sub-page"),
            C("entity_ref", "Entity Reference"),
            C("severity", "Severity", "select", options=["Low", "Medium", "High", "Critical"], default="Medium"),
            C("amount_at_risk", "Amount at Risk (₹)", "float", money=True),
            C("raised_date", "Raised Date", help="YYYY-MM-DD"),
            C("disposition", "Disposition", "select", options=["New", "Investigating", "Confirmed", "False Positive", "Resolved"], default="New"),
            C("notes", "Notes", "textarea"),
        ],
    },
    {
        "no": 23,
        "key": "working_paper",
        "model": "WorkingPaper",
        "title": "Working Papers & Evidence",
        "type": "shell",
        "purpose": "Attach evidence, tick-marks, screenshots and reviewer sign-off",
        "columns": [
            C("wp_no", "WP No", required=True),
            C("title", "Title"),
            C("sub_page", "Linked Sub-page", "select", options=["Charge-Capture Completeness", "Package / Tariff Integrity", "TPA / Insurance Claim Review", "Claim-Denial Analytics", "Discount & Concession Control", "Pharmacy-Billing Reconciliation", "Investigation / Diagnostic Billing", "Bed / Room-Charge Accuracy", "Doctor-Fee & Referral", "Cash vs Credit-Patient Mix", "Advance & Deposit Management", "Corporate / Scheme Billing", "Revenue-Leakage Detection", "Refund & Adjustment Review", "Credit-Patient Ageing"]),
            C("procedure_performed", "Procedure Performed", "textarea"),
            C("evidence_ref", "Evidence / Annexure Ref"),
            C("tick_marks", "Tick-Marks", "textarea"),
            C("status", "Status", "select", options=["Draft", "In Review", "Approved", "Overtaken"], default="Draft"),
            C("reviewed_by", "Reviewed By"),
        ],
    },
    {
        "no": 24,
        "key": "finding_log",
        "model": "FindingLog",
        "title": "Observation & Finding Log",
        "type": "shell",
        "purpose": "Raise, grade, and route findings specific to this domain",
        "columns": [
            C("finding_ref", "Finding Ref", required=True),
            C("title", "Finding Title"),
            C("category", "Category", "select", options=["Revenue Leakage", "Control Gap", "Compliance", "Process", "Data Quality", "Fraud Indicator"]),
            C("severity", "Severity", "select", options=["Low", "Medium", "High", "Critical"], default="Medium"),
            C("assertion", "Assertion", "select", options=["Completeness", "Accuracy", "Validity", "Authorization", "Existence", "Cut-off", "Rights"]),
            C("impact_amount", "Impact Amount (₹)", "float", money=True),
            C("root_cause", "Root Cause", "textarea"),
            C("status", "Status", "select", options=["Open", "Accepted", "In Remediation", "Closed"], default="Open"),
        ],
    },
    {
        "no": 25,
        "key": "remediation_action",
        "model": "RemediationAction",
        "title": "Remediation / Action Tracker",
        "type": "shell",
        "purpose": "Track CAPA items, owners, due dates and re-testing status",
        "columns": [
            C("action_no", "Action No", required=True),
            C("finding_ref", "Finding Ref"),
            C("description", "Action Description", "textarea"),
            C("owner", "Owner"),
            C("due_date", "Due Date", help="YYYY-MM-DD"),
            C("priority", "Priority", "select", options=["Low", "Medium", "High", "Critical"], default="Medium"),
            C("status", "Status", "select", options=["Open", "In Progress", "Implemented", "Re-tested", "Closed", "Overdue"], default="Open"),
            C("retest_result", "Re-Test Result", "textarea"),
        ],
    },
]

SUB_BY_KEY = {sp["key"]: sp for sp in SUBPAGES}
SIGNATURE_KEYS = [sp["key"] for sp in SUBPAGES if sp["type"] == "signature"]
SHELL_KEYS = [sp["key"] for sp in SUBPAGES if sp["type"] == "shell"]
