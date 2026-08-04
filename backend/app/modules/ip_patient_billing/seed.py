"""Demo seed data for Patient Billing & Revenue Cycle.

Rows are inserted per tenant on demand (POST /api/modules/ip_patient_billing/seed)
and only when that tenant's table is still empty. Values mirror a typical
mid-size hospital so the dashboard KPIs are meaningful on first load.
"""

SEED = {
    "charge_capture": [
        {"patient_no": "IPD-1001", "service_date": "2026-01-05", "department": "Surgery", "service_code": "SURG-OP-042", "service_desc": "Cholecystectomy - lap assisted", "qty": 1, "rate": 65000, "status": "Captured"},
        {"patient_no": "IPD-1002", "service_date": "2026-01-06", "department": "ICU", "service_code": "ICU-DAY-01", "service_desc": "ICU bed day with monitoring", "qty": 3, "rate": 18000, "status": "Captured"},
        {"patient_no": "OPD-2001", "service_date": "2026-01-07", "department": "Diagnostics", "service_code": "DIAG-MRI-BRAIN", "service_desc": "MRI Brain - plain", "qty": 1, "rate": 9500, "status": "Missed"},
        {"patient_no": "IPD-1003", "service_date": "2026-01-08", "department": "Pharmacy", "service_code": "PHM-INJ-003", "service_desc": "Injection - antibiotics course", "qty": 4, "rate": 1250, "status": "Captured"},
        {"patient_no": "IPD-1004", "service_date": "2026-01-09", "department": "Emergency", "service_code": "ER-PROC-011", "service_desc": "Emergency suturing - 8 stitches", "qty": 1, "rate": 2200, "status": "Partial"},
        {"patient_no": "IPD-1005", "service_date": "2026-01-10", "department": "OPD", "service_code": "OPD-CON-015", "service_desc": "Consultation - physician", "qty": 2, "rate": 800, "status": "Captured"},
    ],
    "tariff_package": [
        {"package_name": "Maternity - Normal Delivery", "package_code": "PKG-MAT-001", "department": "Maternity", "tariff_version": "v2.3", "effective_from": "2025-04-01", "effective_to": "2026-03-31", "approved_rate": 35000, "billed_rate": 35000},
        {"package_name": "Angioplasty Package", "package_code": "PKG-CRD-007", "department": "Cardiology", "tariff_version": "v1.4", "effective_from": "2025-06-01", "effective_to": "2026-05-31", "approved_rate": 145000, "billed_rate": 158000},
        {"package_name": "Cataract - Phaco with IOL", "package_code": "PKG-OPH-012", "department": "OPD", "tariff_version": "v3.1", "effective_from": "2025-04-01", "effective_to": "2026-03-31", "approved_rate": 28000, "billed_rate": 28000},
        {"package_name": "Knee Replacement - Unilateral", "package_code": "PKG-ORT-004", "department": "Orthopaedics", "tariff_version": "v1.0", "effective_from": "2025-01-01", "effective_to": "2025-12-31", "approved_rate": 185000, "billed_rate": 185000},
    ],
    "tpa_claim": [
        {"claim_no": "CLM-2026-0014", "patient_no": "IPD-1002", "tpa_name": "MediAssist", "policy_no": "POL-8891-2024", "billed_amount": 186000, "approved_amount": 162500, "submitted_date": "2026-01-12", "status": "Approved"},
        {"claim_no": "CLM-2026-0027", "patient_no": "IPD-1005", "tpa_name": "Paramount", "policy_no": "POL-2210-2023", "billed_amount": 94000, "approved_amount": 88000, "submitted_date": "2026-01-15", "status": "Realised"},
        {"claim_no": "CLM-2026-0031", "patient_no": "IPD-1003", "tpa_name": "Vidal Health", "policy_no": "POL-5523-2025", "billed_amount": 127500, "approved_amount": 0, "submitted_date": "2026-01-18", "status": "Rejected"},
        {"claim_no": "CLM-2026-0048", "patient_no": "IPD-1006", "tpa_name": "Star Health", "policy_no": "POL-9044-2024", "billed_amount": 210000, "approved_amount": 195000, "submitted_date": "2026-01-22", "status": "Partially Approved"},
        {"claim_no": "CLM-2026-0052", "patient_no": "IPD-1007", "tpa_name": "Family Health Plan", "policy_no": "POL-7788-2022", "billed_amount": 66000, "approved_amount": 66000, "submitted_date": "2026-01-25", "status": "Realised"},
    ],
    "claim_denial": [
        {"claim_no": "CLM-2026-0031", "denial_category": "Pre-auth Missing", "denial_reason": "No pre-authorization obtained for MRI investigation", "denied_amount": 127500, "denial_date": "2026-01-28", "resubmitted": False, "resubmission_status": "Not Resubmitted", "owner": "Billing - TPA Desk"},
        {"claim_no": "CLM-2026-0021", "denial_category": "Documentation", "denial_reason": "Discharge summary not attached", "denied_amount": 45500, "denial_date": "2026-01-19", "resubmitted": True, "resubmission_status": "Resubmitted", "owner": "Medical Records"},
        {"claim_no": "CLM-2026-0010", "denial_category": "Coding Error", "denial_reason": "CPT code mismatch - billed 2 units, notes support 1", "denied_amount": 12800, "denial_date": "2026-01-11", "resubmitted": True, "resubmission_status": "Approved", "owner": "Billing - TPA Desk"},
        {"claim_no": "CLM-2026-0055", "denial_category": "Policy Exclusion", "denial_reason": "Investigational procedure excluded under policy", "denied_amount": 72000, "denial_date": "2026-01-30", "resubmitted": False, "resubmission_status": "Open", "owner": "Billing - TPA Desk"},
    ],
    "concession": [
        {"bill_no": "BILL-2026-0311", "patient_no": "IPD-1004", "concession_type": "Employee", "amount": 8500, "authorized_by": "Accounts Manager", "waiver_ref": "EMP-0142", "within_authority": True},
        {"bill_no": "BILL-2026-0288", "patient_no": "IPD-1008", "concession_type": "Cash Discount", "amount": 12000, "authorized_by": "Billing Supervisor", "waiver_ref": "CASH-0777", "within_authority": True},
        {"bill_no": "BILL-2026-0254", "patient_no": "IPD-1009", "concession_type": "Charity / Free", "amount": 48000, "authorized_by": "", "waiver_ref": "", "within_authority": False},
        {"bill_no": "BILL-2026-0230", "patient_no": "OPD-2033", "concession_type": "Manual Override", "amount": 3500, "authorized_by": "Front Desk", "waiver_ref": "", "within_authority": False},
    ],
    "pharmacy_recon": [
        {"recon_date": "2026-01-05", "department": "In-house Pharmacy", "issued_amount": 148200, "billed_amount": 148200, "variance_reason": "None", "status": "Reconciled"},
        {"recon_date": "2026-01-12", "department": "IPD Dispensary", "issued_amount": 96500, "billed_amount": 88100, "variance_reason": "Missed Billing", "status": "Exception"},
        {"recon_date": "2026-01-19", "department": "Nursing Floor", "issued_amount": 34200, "billed_amount": 34200, "variance_reason": "None", "status": "Reconciled"},
        {"recon_date": "2026-01-26", "department": "Emergency", "issued_amount": 21100, "billed_amount": 18750, "variance_reason": "Floor Stock", "status": "Exception"},
    ],
    "investigation_bill": [
        {"investigation_code": "LAB-CBC-001", "investigation_name": "Complete Blood Count", "department": "Lab", "patient_no": "IPD-1001", "tariff_amount": 450, "billed_amount": 450, "status": "Billed Correctly"},
        {"investigation_code": "RAD-MRI-BRN", "investigation_name": "MRI Brain", "department": "Radiology", "patient_no": "OPD-2001", "tariff_amount": 9500, "billed_amount": 0, "status": "Not Billed"},
        {"investigation_code": "LAB-LFT-012", "investigation_name": "Liver Function Test", "department": "Lab", "patient_no": "IPD-1003", "tariff_amount": 1150, "billed_amount": 900, "status": "Under-billed"},
        {"investigation_code": "PAT-HPE-007", "investigation_name": "Histopathology - tissue", "department": "Pathology", "patient_no": "IPD-1002", "tariff_amount": 3600, "billed_amount": 3600, "status": "Billed Correctly"},
        {"investigation_code": "RAD-USG-ABD", "investigation_name": "Ultrasound Abdomen", "department": "Radiology", "patient_no": "IPD-1005", "tariff_amount": 2200, "billed_amount": 2450, "status": "Over-billed"},
    ],
    "bed_charge": [
        {"patient_no": "IPD-1001", "ward": "Semi-Private", "bed_no": "S-212", "admission_date": "2026-01-04", "discharge_date": "2026-01-10", "occupancy_days": 6, "room_rate_per_day": 3000, "billed_room_charge": 18000},
        {"patient_no": "IPD-1002", "ward": "ICU", "bed_no": "ICU-08", "admission_date": "2026-01-06", "discharge_date": "2026-01-12", "occupancy_days": 6, "room_rate_per_day": 18000, "billed_room_charge": 96000},
        {"patient_no": "IPD-1010", "ward": "General", "bed_no": "G-104", "admission_date": "2026-01-11", "discharge_date": "2026-01-15", "occupancy_days": 4, "room_rate_per_day": 1500, "billed_room_charge": 5250},
        {"patient_no": "IPD-1008", "ward": "Private", "bed_no": "P-301", "admission_date": "2026-01-13", "discharge_date": "2026-01-20", "occupancy_days": 7, "room_rate_per_day": 5500, "billed_room_charge": 38500},
    ],
    "doctor_fee": [
        {"doctor_name": "Dr. Mehta", "patient_no": "IPD-1001", "fee_type": "Surgery", "fee_amount": 45000, "collected_by": "Hospital", "referral_doctor": "Dr. Rao", "referral_pct": 10, "agreement_documented": True},
        {"doctor_name": "Dr. Iyer", "patient_no": "OPD-2001", "fee_type": "Consultation", "fee_amount": 800, "collected_by": "Doctor", "referral_doctor": "", "referral_pct": 0, "agreement_documented": True},
        {"doctor_name": "Dr. Khan", "patient_no": "IPD-1003", "fee_type": "Procedure", "fee_amount": 18000, "collected_by": "Shared", "referral_doctor": "Dr. Rao", "referral_pct": 15, "agreement_documented": True},
        {"doctor_name": "Dr. Bose", "patient_no": "IPD-1005", "fee_type": "Anaesthesia", "fee_amount": 12000, "collected_by": "Third Party", "referral_doctor": "", "referral_pct": 0, "agreement_documented": False},
    ],
    "payer_mix": [
        {"period": "2026-01", "payer_type": "Cash", "patient_count": 312, "revenue_amount": 2140000, "collection_pct": 98},
        {"period": "2026-01", "payer_type": "Insurance / TPA", "patient_count": 178, "revenue_amount": 2870000, "collection_pct": 74},
        {"period": "2026-01", "payer_type": "Corporate", "patient_count": 64, "revenue_amount": 890000, "collection_pct": 88},
        {"period": "2026-01", "payer_type": "Government Scheme", "patient_count": 41, "revenue_amount": 430000, "collection_pct": 61},
        {"period": "2026-01", "payer_type": "Other", "patient_count": 23, "revenue_amount": 145000, "collection_pct": 90},
    ],
    "patient_advance": [
        {"advance_no": "ADV-2026-0011", "patient_no": "IPD-1002", "received_date": "2026-01-05", "amount": 100000, "mode": "NEFT", "utilized_amount": 64000, "refunded_amount": 0, "status": "Open"},
        {"advance_no": "ADV-2026-0019", "patient_no": "IPD-1003", "received_date": "2026-01-08", "amount": 50000, "mode": "Card", "utilized_amount": 50000, "refunded_amount": 0, "status": "Utilized"},
        {"advance_no": "ADV-2026-0034", "patient_no": "OPD-2033", "received_date": "2026-01-14", "amount": 15000, "mode": "UPI", "utilized_amount": 5000, "refunded_amount": 10000, "status": "Refunded"},
        {"advance_no": "ADV-2026-0042", "patient_no": "IPD-1011", "received_date": "2026-01-20", "amount": 25000, "mode": "Cash", "utilized_amount": 0, "refunded_amount": 0, "status": "Open"},
    ],
    "scheme_bill": [
        {"scheme_name": "CGHS", "patient_no": "IPD-1004", "bill_no": "BILL-2026-0412", "billed_amount": 78500, "approved_amount": 71200, "claim_status": "Approved", "ratecard_linked": True},
        {"scheme_name": "ESI", "patient_no": "IPD-1012", "bill_no": "BILL-2026-0401", "billed_amount": 43200, "approved_amount": 0, "claim_status": "Pending", "ratecard_linked": True},
        {"scheme_name": "Corporate", "patient_no": "IPD-1003", "bill_no": "BILL-2026-0388", "billed_amount": 127500, "approved_amount": 127500, "claim_status": "Realised", "ratecard_linked": False},
        {"scheme_name": "State Scheme", "patient_no": "IPD-1013", "bill_no": "BILL-2026-0399", "billed_amount": 59000, "approved_amount": 56000, "claim_status": "Submitted", "ratecard_linked": True},
    ],
    "revenue_leakage": [
        {"leakage_type": "Unbilled Bed Day", "patient_no": "IPD-1010", "description": "4th bed day not billed in final invoice", "amount": 1500, "detection_date": "2026-01-16", "source": "Bed Audit", "status": "Open"},
        {"leakage_type": "Missed Charge", "patient_no": "OPD-2001", "description": "MRI not raised on bill - cash patient", "amount": 9500, "detection_date": "2026-01-17", "source": "CAAT Rule", "rule_ref": "RCC-R1", "status": "Investigating"},
        {"leakage_type": "Under-billing", "patient_no": "IPD-1003", "description": "LFT billed below tariff", "amount": 250, "detection_date": "2026-01-18", "source": "Manual Review", "status": "Recovered"},
        {"leakage_type": "Package Loss", "patient_no": "IPD-1008", "description": "Angioplasty billed above approved package", "amount": 13000, "detection_date": "2026-01-19", "source": "CAAT Rule", "rule_ref": "TAR-R2", "status": "Open"},
        {"leakage_type": "Unbilled Pharmacy", "patient_no": "IPD-1005", "description": "IPD drug issues not billed to patient", "amount": 8400, "detection_date": "2026-01-20", "source": "Pharmacy Recon", "status": "Investigating"},
        {"leakage_type": "Discount Override", "patient_no": "IPD-1009", "description": "Charity write-off without management approval", "amount": 48000, "detection_date": "2026-01-21", "source": "Manual Review", "status": "Open"},
    ],
    "refund_adjustment": [
        {"bill_no": "BILL-2026-0311", "patient_no": "IPD-1004", "refund_amount": 8500, "refund_date": "2026-01-18", "reason": "Discharge Adjustment", "approved_by": "Accounts Manager", "mode": "NEFT", "status": "Processed"},
        {"bill_no": "BILL-2026-0299", "patient_no": "OPD-2033", "refund_amount": 10000, "refund_date": "2026-01-19", "reason": "Deposit Refund", "approved_by": "Billing Supervisor", "mode": "UPI", "status": "Approved"},
        {"bill_no": "BILL-2026-0334", "patient_no": "IPD-1006", "refund_amount": 21000, "refund_date": "2026-01-21", "reason": "Duplicate Payment", "approved_by": "", "mode": "NEFT", "status": "Pending Approval"},
        {"bill_no": "BILL-2026-0302", "patient_no": "IPD-1014", "refund_amount": 4500, "refund_date": "2026-01-22", "reason": "Cancellation", "approved_by": "Billing Supervisor", "mode": "Cash", "status": "Rejected"},
    ],
    "credit_ageing": [
        {"patient_no": "IPD-1006", "tpa_name": "Star Health", "invoice_no": "INV-2026-0201", "invoice_date": "2025-11-12", "amount": 210000, "days_outstanding": 52, "status": "Open"},
        {"patient_no": "IPD-1015", "tpa_name": "MediAssist", "invoice_no": "INV-2026-0180", "invoice_date": "2025-09-30", "amount": 138000, "days_outstanding": 95, "status": "Under Dispute"},
        {"patient_no": "IPD-1016", "tpa_name": "Corporate - ABC Ltd", "invoice_no": "INV-2026-0222", "invoice_date": "2025-12-18", "amount": 66000, "days_outstanding": 18, "status": "Open"},
        {"patient_no": "IPD-1007", "tpa_name": "Family Health Plan", "invoice_no": "INV-2026-0170", "invoice_date": "2025-08-15", "amount": 82000, "days_outstanding": 140, "status": "Open"},
        {"patient_no": "IPD-1017", "tpa_name": "Vidal Health", "invoice_no": "INV-2026-0230", "invoice_date": "2026-01-08", "amount": 40500, "days_outstanding": 26, "status": "Partially Paid"},
    ],
    "audit_universe": [
        {"unit": "City Hospital - 250 bed", "entity_type": "Hospital", "process": "Full revenue cycle", "risk_rating": "Critical", "in_scope": True, "coverage_pct": 100, "notes": "Anchor unit for FY26 audit"},
        {"unit": "Diagnostic Centre - Main Road", "entity_type": "Diagnostics", "process": "Lab & radiology billing", "risk_rating": "High", "in_scope": True, "coverage_pct": 60},
        {"unit": "In-house Pharmacy", "entity_type": "Pharmacy", "process": "Drug issue to billing", "risk_rating": "High", "in_scope": True, "coverage_pct": 80},
        {"unit": "Satellite Clinic - Sector 14", "entity_type": "Specialty Clinic", "process": "OPD billing & advances", "risk_rating": "Medium", "in_scope": False, "coverage_pct": 0},
    ],
    "rcm_control": [
        {"risk_id": "R-01", "risk_desc": "Services rendered but not billed (charge leakage)", "assertion": "Completeness", "control_id": "C-01", "control_desc": "Daily charge-capture reconciliation by department vs ward register", "control_type": "Detective", "control_owner": "Billing Manager", "rating": "Partially Effective"},
        {"risk_id": "R-02", "risk_desc": "Billed rates deviate from approved tariff / package", "assertion": "Accuracy", "control_id": "C-02", "control_desc": "System lock on approved rate card with periodic price verification", "control_type": "Automated", "control_owner": "IT / Billing", "rating": "Effective"},
        {"risk_id": "R-03", "risk_desc": "Unauthorized discounts / concessions", "assertion": "Authorization", "control_id": "C-03", "control_desc": "Two-tier approval matrix for concessions above limits", "control_type": "Preventive", "control_owner": "Accounts Manager", "rating": "Ineffective"},
        {"risk_id": "R-04", "risk_desc": "TPA claims rejected or under-realised", "assertion": "Validity", "control_id": "C-04", "control_desc": "Pre-auth checklist and denial root-cause review", "control_type": "Detective", "control_owner": "TPA Desk", "rating": "Partially Effective"},
    ],
    "test_rule": [
        {"rule_code": "RCC-R1", "rule_name": "Missing diagnostic charges", "category": "Charge Capture", "threshold": "Any investigation in LIS without bill line", "severity": "High", "enabled": True, "script_sql": "SELECT l.patient_no FROM lis_investigations l LEFT JOIN bill_lines b ON ... WHERE b.id IS NULL", "last_triggered": "2026-01-17"},
        {"rule_code": "TAR-R2", "rule_name": "Billed rate vs approved rate card", "category": "Tariff", "threshold": "Variance > 0", "severity": "Critical", "enabled": True, "script_sql": "SELECT ... WHERE billed_rate <> approved_rate", "last_triggered": "2026-01-19"},
        {"rule_code": "TPA-R3", "rule_name": "Claims pending > 30 days", "category": "TPA Claims", "threshold": "> 30 days", "severity": "High", "enabled": True, "script_sql": "SELECT claim_no FROM claims WHERE status NOT IN ('Realised') AND DATEDIFF(NOW(), submitted) > 30", "last_triggered": "2026-01-25"},
        {"rule_code": "DIS-R4", "rule_name": "Concession outside authority", "category": "Discounts", "threshold": "Amount > limit OR approval missing", "severity": "Critical", "enabled": True, "script_sql": "SELECT ... WHERE within_authority = 0", "last_triggered": "2026-01-21"},
        {"rule_code": "AGE-R5", "rule_name": "Credit invoices > 90 days", "category": "Ageing", "threshold": "> 90 days", "severity": "Medium", "enabled": False, "script_sql": "SELECT ... WHERE days_outstanding > 90"},
    ],
    "data_source": [
        {"source_name": "HIS / EMR - HospitalWorks", "source_type": "HIS / EMR", "system": "HospitalWorks v9", "endpoint": "odbc://10.0.0.12/HW", "table_map": "admissions, bill_lines, charges, patients", "sync_status": "Connected", "last_sync": "2026-01-31"},
        {"source_name": "Pharmacy ERP - PharmaSuite", "source_type": "Pharmacy System", "system": "PharmaSuite", "endpoint": "api://pharmasuite.local/v1", "table_map": "issues, returns, stock_movement", "sync_status": "Connected", "last_sync": "2026-01-31"},
        {"source_name": "LIS - LabPlus", "source_type": "LIS", "system": "LabPlus", "endpoint": "odbc://10.0.0.21/LIS", "table_map": "investigations, reports", "sync_status": "Syncing", "last_sync": "2026-01-31"},
        {"source_name": "TPA Portal exports", "source_type": "Spreadsheet", "system": "Various", "endpoint": "", "table_map": "claim_status.xlsx", "sync_status": "Not Configured", "last_sync": ""},
    ],
    "sampling_batch": [
        {"sample_code": "SMP-CC-001", "method": "Stratified", "population_size": 1240, "sample_size": 100, "confidence": 95, "criteria": "Stratified by department, top 5 by revenue", "status": "Tested"},
        {"sample_code": "SMP-TAR-001", "method": "Judgemental", "population_size": 220, "sample_size": 40, "confidence": 90, "criteria": "High-value packages & tariff versions post change", "status": "Drawn"},
        {"sample_code": "SMP-TPA-002", "method": "Systematic", "population_size": 180, "sample_size": 30, "confidence": 95, "criteria": "Every 6th claim in submission order", "status": "Draft"},
    ],
    "exception_queue": [
        {"exception_id": "EXC-2026-0001", "rule_ref": "RCC-R1", "entity_type": "investigation_bill", "entity_ref": "OPD-2001", "severity": "High", "amount_at_risk": 9500, "raised_date": "2026-01-17", "disposition": "Confirmed", "notes": "MRI billed to deposit but not in bill lines"},
        {"exception_id": "EXC-2026-0002", "rule_ref": "TAR-R2", "entity_type": "tariff_package", "entity_ref": "PKG-CRD-007", "severity": "Critical", "amount_at_risk": 13000, "raised_date": "2026-01-19", "disposition": "Investigating", "notes": "Billed 158k vs approved 145k"},
        {"exception_id": "EXC-2026-0003", "rule_ref": "DIS-R4", "entity_type": "concession", "entity_ref": "BILL-2026-0254", "severity": "Critical", "amount_at_risk": 48000, "raised_date": "2026-01-21", "disposition": "New", "notes": "Charity write-off 48k, no approval"},
        {"exception_id": "EXC-2026-0004", "rule_ref": "RCC-R1", "entity_type": "charge_capture", "entity_ref": "IPD-1010", "severity": "Medium", "amount_at_risk": 1500, "raised_date": "2026-01-16", "disposition": "Confirmed", "notes": "Unbilled 4th bed day"},
        {"exception_id": "EXC-2026-0005", "rule_ref": "TPA-R3", "entity_type": "credit_ageing", "entity_ref": "INV-2026-0180", "severity": "High", "amount_at_risk": 138000, "raised_date": "2026-01-25", "disposition": "Investigating", "notes": "Under dispute > 90 days"},
        {"exception_id": "EXC-2026-0006", "rule_ref": "TAR-R2", "entity_type": "tariff_package", "entity_ref": "PKG-ORT-004", "severity": "Low", "amount_at_risk": 0, "raised_date": "2026-01-23", "disposition": "False Positive", "notes": "Version v1.0 expired - correctly applied"},
    ],
    "working_paper": [
        {"wp_no": "WP-PB-01", "title": "Charge-capture completeness", "sub_page": "Charge-Capture Completeness", "procedure_performed": "Traced 40 sampled IPD days from ward registers to bill lines", "evidence_ref": "Annexure A - sampling sheet", "tick_marks": "✓, #, C/E", "status": "In Review", "reviewed_by": "Lead Auditor"},
        {"wp_no": "WP-PB-02", "title": "Tariff & package verification", "sub_page": "Package / Tariff Integrity", "procedure_performed": "Recomputed billed rates vs approved rate card for 20 packages", "evidence_ref": "Annexure B", "tick_marks": "✓, x", "status": "Approved", "reviewed_by": "Lead Auditor"},
        {"wp_no": "WP-PB-03", "title": "TPA claim realisation", "sub_page": "TPA / Insurance Claim Review", "procedure_performed": "Agreed approved amounts to TPA portal & bank receipts", "evidence_ref": "Annexure C", "tick_marks": "✓", "status": "Draft", "reviewed_by": ""},
        {"wp_no": "WP-PB-04", "title": "Concession authority check", "sub_page": "Discount & Concession Control", "procedure_performed": "Verified 100% of concessions against approval matrix", "evidence_ref": "Annexure D", "tick_marks": "E", "status": "In Review", "reviewed_by": ""},
    ],
    "finding_log": [
        {"finding_ref": "F-2026-014", "title": "Diagnostic charges missed on patient bills", "category": "Revenue Leakage", "severity": "High", "assertion": "Completeness", "impact_amount": 9500, "root_cause": "No automatic link between LIS results and billing", "status": "Open"},
        {"finding_ref": "F-2026-015", "title": "Package billed above approved tariff", "category": "Revenue Leakage", "severity": "High", "assertion": "Accuracy", "impact_amount": 13000, "root_cause": "Rate card not locked in system after revision", "status": "In Remediation"},
        {"finding_ref": "F-2026-016", "title": "Charity concession without approval", "category": "Control Gap", "severity": "Critical", "assertion": "Authorization", "impact_amount": 48000, "root_cause": "Override capability not restricted by user role", "status": "Open"},
        {"finding_ref": "F-2026-017", "title": "ICU billing rate mismatch", "category": "Process", "severity": "Medium", "assertion": "Accuracy", "impact_amount": 6000, "root_cause": "Manual rate entry instead of tariff lookup", "status": "Accepted"},
        {"finding_ref": "F-2026-018", "title": "TPA claims not resubmitted post-denial", "category": "Compliance", "severity": "Medium", "assertion": "Existence", "impact_amount": 173000, "root_cause": "No ageing alert on denied claims", "status": "Closed"},
    ],
    "remediation_action": [
        {"action_no": "CAPA-2026-001", "finding_ref": "F-2026-015", "description": "Lock rate card in HIS and add override log", "owner": "IT / Billing", "due_date": "2026-02-28", "priority": "High", "status": "Implemented", "retest_result": "Override log verified - no further deviations"},
        {"action_no": "CAPA-2026-002", "finding_ref": "F-2026-016", "description": "Restrict concession override to Accounts Manager role", "owner": "IT - Access Admin", "due_date": "2026-03-15", "priority": "Critical", "status": "In Progress", "retest_result": ""},
        {"action_no": "CAPA-2026-003", "finding_ref": "F-2026-014", "description": "Build LIS-to-billing auto-post interface", "owner": "IT / Lab", "due_date": "2026-04-30", "priority": "High", "status": "Open", "retest_result": ""},
        {"action_no": "CAPA-2026-004", "finding_ref": "F-2026-018", "description": "Add denial-ageing dashboard for TPA desk", "owner": "Billing Manager", "due_date": "2026-03-01", "priority": "Medium", "status": "Overdue", "retest_result": ""},
    ],
}
