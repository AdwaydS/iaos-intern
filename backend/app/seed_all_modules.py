"""Platform-Wide Audit Data Loader for IAOS — Seeds domain-rich audit data across all 86 modules."""
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session

from app.models.tenant import Tenant
import importlib
import pkgutil
from app import modules as modules_pkg


MODULE_SEED_DATA: Dict[str, List[Tuple[str, str]]] = {
    "annual_planning": [
        ("Audit Risk Assessment 2026", "High priority entities identified: Bhiwadi Plant, Central Supply Chain Hub."),
        ("Audit Universe & Entity Scoping", "86 operational and financial modules mapped across 12 plants and 48 depots."),
        ("Audit Resource Allocation Plan", "Allocated 4,500 auditor hours for Q1-Q4 fieldwork across high-risk units."),
    ],
    "audit_reporting": [
        ("Executive Audit Committee Summary Q1", "High-severity findings summarized: Scheme leakage ₹24.5M, Procurement SOD gaps."),
        ("Draft Fieldwork Observation Log", "14 observations communicated to management for initial responses."),
        ("Management Response & CAPA Tracker", "8 open action plans tracked for executive review."),
    ],
    "board_committee_reporting": [
        ("Audit Committee Charter Annual Review", "Charter compliance verified against SEBI LODR Clause 18 & Companies Act."),
        ("Quarterly Risk Matrix Presentation", "Presented top 10 enterprise risks to Board Audit Committee."),
        ("Internal Audit Effectiveness Scorecard", "Overall internal audit quality assurance score: 94.2%."),
    ],
    "borrowings_covenants": [
        ("Term Loan Covenant Compliance Certificate", "Financial leverage ratio 1.8x (well within 2.5x covenant cap)."),
        ("Interest Rate Hedging Review", "Mark-to-market audit of floating-to-fixed interest rate swaps."),
        ("Debenture Redemption Reserve Audit", "DRR adequacy verified against statutory debenture obligations."),
    ],
    "budgeting_variance": [
        ("Opex Variance Analysis Report - Q1", "FMCG Marketing spend exceeded budget by 12.4% due to summer launch."),
        ("Capex Budget Overrun Threshold Audit", "Project Delta cost variance flagged at +₹8.2M."),
        ("Zero-Based Budgeting Adherence Check", "Verified department-level cost justification packages."),
    ],
    "business_continuity_dr": [
        ("Disaster Recovery Drill Log - Primary DC", "Failover time measured at 18 minutes (RTO target: 30 minutes)."),
        ("BCP Impact Assessment - Supply Chain", "Alternate vendor sourcing readiness audited for critical raw materials."),
        ("Database Backup Restoration Verification", "Quarterly data restoration audit completed without corruption."),
    ],
    "capex_projects": [
        ("Bhiwadi Plant Expansion Project Audit", "CWIP capitalization cut-off audit verified for FY26 Q1."),
        ("Contractor Variation Claim Review", "Flagged ₹4.2M unapproved variation order claims."),
        ("Equipment Import Customs Duty Audit", "EPCG duty-free import obligation compliance verified."),
    ],
    "cash_petty_cash": [
        ("Surprise Petty Cash Verification - Depot A", "Physical cash count matched book balance; no unvouched IOUs."),
        ("Imprest Account Reconciliation Audit", "Verified 24 branch imprest accounts across North Region."),
        ("High-Value Cash Disbursement Audit", "Audited non-routine cash payments above ₹20,000 threshold."),
    ],
    "compliance_calendar": [
        ("GST Monthly Return Filing Track (GSTR-3B)", "All 18 GSTIN registrations filed prior to 20th due date."),
        ("PF & ESI Statutory Compliance Register", "Verified employee provident fund deposit receipts."),
        ("ROC Annual Filing Check (MGT-7 & AOC-4)", "Secretarial compliance calendar updated for Q1."),
    ],
    "continuous_monitoring": [
        ("Duplicate Invoice Payment Rule Run #104", "Detected 2 potential duplicate vendor invoices totaling ₹380,000."),
        ("Unapproved Vendor Master Change Alert", "Flagged bank account modification without secondary approval."),
        ("Weekend Journal Entry Spike Detection", "Identified 8 manual JEs posted on Sunday night."),
    ],
    "contract_lifecycle": [
        ("Vendor SLA Non-Compliance Penalty Audit", "Recovered ₹1.2M SLA penalties from logistics service providers."),
        ("Master Service Agreement Expiry Track", "Reviewed 34 contracts expiring in next 60 days."),
        ("IP Rights & NDA Protection Audit", "Verified NDA execution for 100% of third-party software vendors."),
    ],
    "cost_audit_overheads": [
        ("Utility Overhead Allocation Audit", "Power & fuel cost allocation audited across 4 product lines."),
        ("Direct Labor Rate Variance Audit", "Standard vs actual labor cost per unit analyzed."),
        ("Machine Hour Rate Calculation Verification", "Audited machine downtime impact on overhead absorption."),
    ],
    "csr": [
        ("Section 135 CSR Spending Audit", "Total CSR obligation ₹18.5M; 100% allocated to approved projects."),
        ("NGO Partner Due Diligence Report", "Verified FCRA registration and 80G tax certificates for 4 NGOs."),
        ("CSR Project Utilization Certificate Audit", "Physical verification of community water purification plants."),
    ],
    "customer_master_credit": [
        ("Customer Credit Limit Over-riding Audit", "Flagged 12 sales orders released despite credit hold block."),
        ("Duplicate Customer GSTIN Audit", "Identified 3 customer master profiles sharing same GSTIN."),
        ("Dormant Customer Reactivation Audit", "Audited 15 accounts reactivated after 180+ idle days."),
    ],
    "cybersecurity": [
        ("SOC2 Type II Control Testing Log", "Verified logical access controls, encryption, and audit logging."),
        ("Privileged Access Management (PAM) Audit", "Audited root/admin account access logs across production servers."),
        ("Phishing Simulation Vulnerability Score", "Employee click-rate reduced from 8.5% to 1.2% following training."),
    ],
    "data_analytics_caat": [
        ("Benford Law Analysis on Accounts Payable", "First-digit distribution anomaly flagged on invoice values."),
        ("Outlier Transaction Analytics Run #22", "Extracted top 0.5% unusual high-value credit notes."),
        ("Fuzzy Matching Vendor vs Employee Addresses", "Identified 1 potential employee-vendor address match."),
    ],
    "data_privacy_dpdp": [
        ("DPDP Act Personal Data Inventory", "Mapped customer PII data flows across CRM, ERP, and payment gateways."),
        ("Data Principal Consent Log Audit", "Verified consent withdrawal mechanism compliance."),
        ("Cross-Border Data Transfer Assessment", "Audited cloud storage server location compliance."),
    ],
    "doa_sod": [
        ("Delegation of Authority Breach Log", "Flagged 2 PO approvals exceeding Manager financial limit."),
        ("Conflict of Interest SOD Matrix Audit", "Audited user roles combining PO Creation and Goods Receipt entry."),
        ("System Override Dual Custody Review", "Verified dual authorization requirement for master data updates."),
    ],
    "engagement_fieldwork": [
        ("Procure-to-Pay Engagement Audit Notes", "Completed 3-way matching testing for 150 sample POs."),
        ("Inventory Physical Verification Sheet", "Physical stock count conducted at Bhiwandi depot."),
        ("Bank Branch Audit Sampling Log", "Audited 25 high-value outward RTGS payment vouchers."),
    ],
    "erp_access_iam": [
        ("Terminated Employee Access Revocation Audit", "Flagged 2 accounts active 48 hrs post-resignation."),
        ("Generic System Account Audit", "Reviewed shared service account passwords and usage logs."),
        ("Superuser Access Log Review", "Audited SAP SAP* / DDIC activity logs."),
    ],
    "esg_sustainability": [
        ("Scope 1 & Scope 2 Carbon Emission Audit", "Audited diesel generator fuel logs and grid electricity bills."),
        ("E-Waste Disposal Compliance Audit", "Verified pollution control board disposal certificates."),
        ("Water Recycling & Zero Liquid Discharge Track", "Audited effluent treatment plant operational logs."),
    ],
    "expense_cost_controls": [
        ("Corporate Card Out-of-Policy Spend Audit", "Flagged ₹145,000 personal expenses charged to company card."),
        ("Marketing Event Expense Verification", "Audited venue and agency invoices for product launch."),
        ("Consulting Fee Voucher Audit", "Verified deliverable sign-offs prior to professional fee release."),
    ],
    "findings_tracking": [
        ("High Risk Finding #101 - Procurement SOD", "Status: In Progress. Target completion date: 2026-08-15."),
        ("Medium Risk Finding #104 - Asset Tagging", "Status: Closed. Verified physical barcode application."),
        ("Finding #108 - Unclaimed GST Credit", "Status: In Progress. Recovery of ₹2.4M tax credit ongoing."),
    ],
    "fixed_assets_cwip": [
        ("Fixed Asset Physical Verification & Tagging", "Verified 1,420 plant machinery assets; 98.6% barcode match."),
        ("Depreciation Calculation Audit", "Verified Useful Life compliance under Companies Act Schedule II."),
        ("Asset Disposal Proceeds Verification", "Audited scrap auction proceeds for decommissioned boiler."),
    ],
    "forex_hedging": [
        ("Forward Contract Mark-to-Market Audit", "Verified MTM valuation reports from counterparty banks."),
        ("Export Receivable Forex Exposure Track", "Unhedged USD exposure maintained within 15% risk threshold."),
        ("Hedging Policy Threshold Compliance", "Audited derivative transaction authorization logs."),
    ],
    "fraud_forensic": [
        ("Whistleblower Hotline Allegation #402", "Investigated anonymous complaint regarding vendor kickbacks."),
        ("FCPA Vendor Bribery Risk Screening", "Audited high-risk third-party agent commission payments."),
        ("Expense Claim Fraud Detection Analysis", "Flagged duplicate taxi fare receipts submitted by sales team."),
    ],
    "grants_subsidies": [
        ("Government Export Subsidy Claim Audit", "Verified RODTEP claim documents and bank realization certificates."),
        ("State Industrial Incentive Utilization Audit", "Capital subsidy disbursement compliance verified."),
        ("Grant Fund End-Use Certificate Review", "Audited R&D grant expenditure utilization."),
    ],
    "gst": [
        ("GSTR-2B vs Books Input Tax Credit Recon", "Reconciled ₹142M ITC; identified ₹3.1M ineligible credit."),
        ("E-Way Bill Distance Variance Audit", "Flagged 14 e-way bills with route distance discrepancies."),
        ("GST LUT Export Compliance Audit", "Verified Letter of Undertaking validity for zero-rated exports."),
    ],
    "ifc_icfr_testing": [
        ("Financial Close ICFR Control Test #12", "Tested journal entry approval controls; 100% effective."),
        ("Revenue Cut-off Control Walkthrough", "Audited period-end dispatch vs invoice date matching."),
        ("Inventory Valuation Control Design Audit", "Tested automated SAP cost roll-up calculations."),
    ],
    "insurance": [
        ("Industrial All Risk Policy Coverage Audit", "Sum insured ₹4.5B verified against replacement value asset register."),
        ("Transit Insurance Claim Recovery Track", "Audited 8 open marine cargo damage claims totaling ₹1.8M."),
        ("Directors & Officers (D&O) Policy Review", "Verified policy terms and indemnity limits."),
    ],
    "inter_company_consolidation": [
        ("Inter-Company Balance Reconciliation Audit", "Eliminated ₹85M inter-company sales and purchase balances."),
        ("Transfer Pricing Arm's Length Audit", "Verified cost-plus margin compliance for overseas subsidiary."),
        ("Inter-Company Loan Interest Calculation", "Audited interest calculation at RBI benchmark rates."),
    ],
    "inventory_stores": [
        ("Slow-Moving & Obsolete Stock Provision Audit", "Audited ₹12.4M inventory provision for 180+ day stock."),
        ("NRV Valuation Assessment", "Net realizable value tested against recent selling prices."),
        ("Scrap Material Sales Audit", "Verified scrap weighbridge slips and tender pricing."),
    ],
    "investments": [
        ("Mutual Fund Investment Valuation Audit", "Verified daily NAV valuations for ₹650M liquid fund portfolio."),
        ("Treasury Yield Optimization Audit", "Audited short-term commercial paper investment returns."),
        ("Subsidiary Equity Investment Review", "Impairment testing completed for subsidiary carrying value."),
    ],
    "journal_entries_r2r": [
        ("Manual Journal Entry Threshold Audit", "Audited 42 manual JEs above ₹1.0M threshold."),
        ("Back-Dated Journal Entry Alert Log", "Flagged 3 JEs posted after period-end soft close."),
        ("Unusual Account Combination Audit", "Audited debit entries to revenue accounts."),
    ],
    "logistics_freight": [
        ("Freight Rate Card Over-billing Audit", "Recovered ₹840,000 freight overcharges against contract rates."),
        ("Detention & Demurrage Charge Audit", "Audited container detention charges at Nhava Sheva port."),
        ("Route Transshipment Theft Audit", "Investigated transit shortage claims on Delhi-Mumbai corridor."),
    ],
    "order_to_cash": [
        ("Credit Hold Override Billing Audit", "Audited system release of orders for accounts on credit block."),
        ("Price Master vs Invoice Variance Audit", "Verified invoice line prices against approved price lists."),
        ("Unapplied Cash Receipts Audit", "Reviewed customer advance payments unallocated > 60 days."),
    ],
    "payroll_hr": [
        ("Ghost Employee Payroll Audit", "Physical attendance verification conducted for 850 factory workers."),
        ("Overtime Hours Authorization Audit", "Audited supervisor OT approvals against bio-metric punch data."),
        ("Employee Bonus Eligibility Calculation", "Verified PLI bonus calculations against KPI scorecards."),
    ],
    "procure_to_pay": [
        ("Three-Way Matching Exception Audit", "Audited PO, Goods Receipt, and Vendor Invoice mismatches."),
        ("Purchase Order Split Threshold Audit", "Flagged 4 POs split below ₹500,000 approval limit."),
        ("Vendor Early Payment Discount Audit", "Verified cash discount capture on early invoice settlement."),
    ],
    "production": [
        ("Standard vs Actual Scrap Generation Audit", "Actual scrap rate 2.4% vs standard tolerance of 1.5%."),
        ("Production Order Variance Analysis", "Audited material yield variance on Batch #PR-882."),
        ("Subcontracting Processing Loss Audit", "Verified raw material weight reconciliation at job worker."),
    ],
    "quality_control": [
        ("Raw Material Rejection Rate Audit", "Incoming chemical batch rejection rate 1.8%."),
        ("Finished Goods Certificate of Analysis Log", "Verified COA issuance for 100% of dispatched batches."),
        ("Customer Quality Complaint Analysis", "Audited root cause corrective actions for packaging defects."),
    ],
    "risk_register": [
        ("Enterprise Risk Register Update Q1", "Updated 42 operational, financial, and strategic risks."),
        ("Risk Mitigation Control Owner Assignment", "Assigned control owners for top 5 key risks."),
        ("Residual Risk Rating Review", "Audited post-control risk scores across business units."),
    ],
    "vendor_master": [
        ("Vendor Bank Account Change Audit", "Verified 100% callback confirmation for bank detail changes."),
        ("Inactive Vendor Master Deactivation", "Deactivated 210 vendor profiles with zero activity in 2 years."),
        ("MSME Vendor Classification Verification", "Audited MSME registration certificates and 45-day payment SLA."),
    ],
    "warehouse_movement": [
        ("Inter-Depot Stock Transfer Loss Audit", "Stock loss in transit maintained below 0.1% threshold."),
        ("Warehouse FIFO Movement Verification", "Audited batch expiry rotation in central warehouse."),
        ("Damaged Stock Segregation Audit", "Physical count of damaged goods quarantine area."),
    ],
}


def seed_all_module_items(db: Session, tenant_id: int):
    """Loop through all modules and seed domain-specific audit data if empty."""
    for _, name, is_pkg in pkgutil.iter_modules(modules_pkg.__path__):
        if not is_pkg or name.startswith("_"):
            continue

        pkg = f"app.modules.{name}"
        try:
            mod_models = importlib.import_module(f"{pkg}.models")
        except ModuleNotFoundError:
            continue

        # Look for the primary Item model class (e.g. AnnualPlanningItem, ProcureToPayItem, etc.)
        model_cls = None
        for attr_name in dir(mod_models):
            if attr_name.endswith("Item") and attr_name != "TenantMixin":
                model_cls = getattr(mod_models, attr_name)
                break

        if not model_cls:
            continue

        # Check if table already has records for this tenant
        try:
            existing = db.query(model_cls).filter(getattr(model_cls, "tenant_id") == tenant_id).first()
            if existing:
                continue

            # Fetch custom seed data or generate default domain records
            records_data = MODULE_SEED_DATA.get(name, [
                (f"{name.replace('_', ' ').title()} Audit Record #1", f"Verified operational compliance for {name.replace('_', ' ')}."),
                (f"{name.replace('_', ' ').title()} Assurance Review", f"Control testing completed with satisfactory results."),
                (f"{name.replace('_', ' ').title()} Key Finding", f"Follow-up action item logged for management review."),
            ])

            items_to_add = []
            for title, notes in records_data:
                item_inst = model_cls(title=title, notes=notes, tenant_id=tenant_id)
                items_to_add.append(item_inst)

            db.add_all(items_to_add)
            db.commit()
            print(f"[seed_all_modules] Seeded {len(items_to_add)} audit records into '{name}' for tenant {tenant_id}")
        except Exception as e:
            db.rollback()
            print(f"[seed_all_modules] Skipped '{name}': {e}")
