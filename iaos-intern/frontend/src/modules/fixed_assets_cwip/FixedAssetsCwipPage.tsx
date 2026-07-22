/**
 * Fixed Assets & CWIP — Main Module Page (Module 18)
 * ====================================================
 *
 * This is the primary entry-point component for the Fixed Assets & CWIP module.
 * It renders a tab-based navigation sidebar with all 25 features (15 signature
 * + 10 common audit shell) and a dynamic content area that shows the selected
 * feature's view.
 *
 * Architecture:
 * - Each feature is defined in the FEATURES array with metadata (id, label,
 *   group, description, endpoint, table columns).
 * - The FeatureView component renders a generic CRUD table + add-record form
 *   for the 15 signature features and a JSON/KPI display for the 10 shell
 *   features.
 * - All API calls go through the shared `lib/api` module which handles JWT
 *   injection and tenant scoping automatically.
 *
 * To extend a feature:
 *   1. Add columns to the backend model + schema
 *   2. Update the FEATURES entry below (columns array, form fields)
 *   3. The generic FeatureView will pick up the changes automatically
 *
 * @module FixedAssetsCwipPage
 */

import { useEffect, useState, useCallback } from "react";
import { del, get, post, patch } from "../../lib/api";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** API base path — matches the backend router mount point */
const API_BASE = "/api/modules/fixed_assets_cwip";

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Column definition for feature data tables.
 * `key` maps to the JSON field from the API.
 * `label` is the human-readable column header.
 * `type` controls rendering (text, date, number, boolean, status).
 */
interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "boolean" | "status";
}

/**
 * Form field definition for the add-record form.
 * `key` maps to the JSON field in the POST body.
 * `inputType` controls the HTML input type.
 * `required` marks the field as mandatory.
 * `options` provides a dropdown select for enum-like fields.
 */
interface FormFieldDef {
  key: string;
  label: string;
  inputType?: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

/**
 * Complete feature definition.
 * `type` determines how the view is rendered:
 *   - "crud"  → data table with add/delete (signature features)
 *   - "shell" → JSON/KPI display (common audit shell features)
 */
interface FeatureDef {
  id: string;
  label: string;
  group: "Signature" | "Audit Shell";
  description: string;
  endpoint: string;
  type: "crud" | "shell";
  columns?: ColumnDef[];
  formFields?: FormFieldDef[];
}

/**
 * Master list of all 25 features.
 *
 * IMPORTANT: The `endpoint` must match the backend router path exactly.
 * The `id` is used as a React key and for local state management.
 */
const FEATURES: FeatureDef[] = [
  // ─── SIGNATURE FEATURES (1-15) ───────────────────────────────────────
  {
    id: "physical-verification",
    label: "Physical Verification",
    group: "Signature",
    description: "Scan-verify physical assets against the register using Tag/QR codes.",
    endpoint: `${API_BASE}/physical-verification`,
    type: "crud",
    columns: [
      { key: "asset_tag", label: "Asset Tag" },
      { key: "asset_description", label: "Description" },
      { key: "location", label: "Location" },
      { key: "register_location", label: "Register Location" },
      { key: "verified_by", label: "Verified By" },
      { key: "verification_date", label: "Date", type: "date" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_tag", label: "Asset Tag", required: true, placeholder: "e.g. QR-FA-001" },
      { key: "asset_description", label: "Description", required: true, placeholder: "e.g. CNC Machine — Bay 3" },
      { key: "location", label: "Actual Location", required: true, placeholder: "e.g. Factory Floor, Bay 3" },
      { key: "register_location", label: "Register Location", required: true, placeholder: "e.g. Factory Floor, Bay 2" },
      { key: "verified_by", label: "Verified By", required: true, placeholder: "e.g. Rajesh Kumar" },
      { key: "verification_date", label: "Verification Date", inputType: "date", required: true },
      { key: "status", label: "Status", inputType: "select", options: ["pending", "verified", "missing", "mismatch"], defaultValue: "pending" },
      { key: "remarks", label: "Remarks", inputType: "textarea" },
    ],
  },
  {
    id: "depreciation",
    label: "Depreciation Recomputation",
    group: "Signature",
    description: "Independently recompute depreciation and compare against ERP/book values.",
    endpoint: `${API_BASE}/depreciation`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "original_cost", label: "Cost", type: "number" },
      { key: "method", label: "Method" },
      { key: "erp_accumulated_dep", label: "ERP Dep.", type: "number" },
      { key: "recomputed_dep", label: "Recomputed", type: "number" },
      { key: "variance", label: "Variance", type: "number" },
      { key: "is_material", label: "Material?", type: "boolean" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true, placeholder: "e.g. FA-001" },
      { key: "asset_description", label: "Description", required: true },
      { key: "original_cost", label: "Original Cost", inputType: "number", required: true },
      { key: "useful_life_years", label: "Useful Life (yrs)", inputType: "number", required: true },
      { key: "residual_value", label: "Residual Value", inputType: "number", defaultValue: 0 },
      { key: "method", label: "Depreciation Method", inputType: "select", options: ["SLM", "WDV", "UOP"], defaultValue: "SLM" },
      { key: "date_placed_in_service", label: "Date Placed in Service", inputType: "date", required: true },
      { key: "erp_accumulated_dep", label: "ERP Accumulated Dep.", inputType: "number", required: true },
      { key: "recomputed_dep", label: "Recomputed Dep.", inputType: "number", required: true },
      { key: "variance", label: "Variance", inputType: "number", required: true },
      { key: "is_material", label: "Material Variance?", inputType: "checkbox" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "cwip-ageing",
    label: "CWIP Ageing & Capitalisation",
    group: "Signature",
    description: "Flag CWIP items stuck beyond the expected capitalisation timeline.",
    endpoint: `${API_BASE}/cwip-ageing`,
    type: "crud",
    columns: [
      { key: "project_code", label: "Project Code" },
      { key: "project_name", label: "Project" },
      { key: "cwip_amount", label: "CWIP Amount", type: "number" },
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "ageing_days", label: "Ageing (days)", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "project_code", label: "Project Code", required: true, placeholder: "e.g. PROJ-2024-01" },
      { key: "project_name", label: "Project Name", required: true },
      { key: "cwip_amount", label: "CWIP Amount", inputType: "number", required: true },
      { key: "start_date", label: "Start Date", inputType: "date", required: true },
      { key: "expected_capitalisation_date", label: "Expected Capitalisation", inputType: "date" },
      { key: "ageing_days", label: "Ageing (days)", inputType: "number", defaultValue: 0 },
      { key: "status", label: "Status", inputType: "select", options: ["in_progress", "capitalised", "delayed", "written_off"], defaultValue: "in_progress" },
      { key: "reason_for_delay", label: "Reason for Delay", inputType: "textarea" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "disposal",
    label: "Disposal & Retirement Review",
    group: "Signature",
    description: "Review asset disposals/retirements for proper approvals and gain/loss accounting.",
    endpoint: `${API_BASE}/disposal`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "disposal_date", label: "Date", type: "date" },
      { key: "disposal_method", label: "Method" },
      { key: "wdv_at_disposal", label: "WDV", type: "number" },
      { key: "sale_proceeds", label: "Proceeds", type: "number" },
      { key: "gain_loss", label: "Gain/Loss", type: "number" },
      { key: "approval_status", label: "Approval", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "disposal_date", label: "Disposal Date", inputType: "date", required: true },
      { key: "disposal_method", label: "Method", inputType: "select", options: ["sale", "scrap", "donation", "write_off"], required: true },
      { key: "wdv_at_disposal", label: "WDV at Disposal", inputType: "number", required: true },
      { key: "sale_proceeds", label: "Sale Proceeds", inputType: "number", defaultValue: 0 },
      { key: "gain_loss", label: "Gain/Loss", inputType: "number", required: true },
      { key: "approval_status", label: "Approval Status", inputType: "select", options: ["pending", "approved", "rejected"], defaultValue: "pending" },
      { key: "approved_by", label: "Approved By" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "capex-additions",
    label: "Additions to Capex Approval",
    group: "Signature",
    description: "Reconcile capex additions to AFE and purchase invoices.",
    endpoint: `${API_BASE}/capex-additions`,
    type: "crud",
    columns: [
      { key: "afe_number", label: "AFE No." },
      { key: "asset_code", label: "Asset Code" },
      { key: "invoice_number", label: "Invoice No." },
      { key: "invoice_amount", label: "Invoice Amt", type: "number" },
      { key: "capitalised_amount", label: "Capitalised", type: "number" },
      { key: "variance", label: "Variance", type: "number" },
      { key: "reconciliation_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "afe_number", label: "AFE Number", required: true },
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "description", label: "Description", required: true },
      { key: "invoice_number", label: "Invoice Number", required: true },
      { key: "invoice_amount", label: "Invoice Amount", inputType: "number", required: true },
      { key: "capitalised_amount", label: "Capitalised Amount", inputType: "number", required: true },
      { key: "variance", label: "Variance", inputType: "number", required: true },
      { key: "afe_budget", label: "AFE Budget", inputType: "number", defaultValue: 0 },
      { key: "addition_date", label: "Addition Date", inputType: "date", required: true },
      { key: "reconciliation_status", label: "Status", inputType: "select", options: ["pending", "reconciled", "exception"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "register-completeness",
    label: "Asset Register Completeness",
    group: "Signature",
    description: "Detect ghost assets (in register, not physical) and missing assets (physical, not in register).",
    endpoint: `${API_BASE}/register-completeness`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "description", label: "Description" },
      { key: "issue_type", label: "Issue Type", type: "status" },
      { key: "ledger_value", label: "Ledger Value", type: "number" },
      { key: "physical_verified", label: "Verified?", type: "boolean" },
      { key: "resolution_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "description", label: "Description", required: true },
      { key: "issue_type", label: "Issue Type", inputType: "select", options: ["ghost", "missing", "duplicate", "data_gap"], required: true },
      { key: "ledger_value", label: "Ledger Value", inputType: "number", defaultValue: 0 },
      { key: "physical_verified", label: "Physically Verified?", inputType: "checkbox" },
      { key: "resolution_status", label: "Status", inputType: "select", options: ["open", "resolved", "escalated"], defaultValue: "open" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "componentisation",
    label: "Componentisation & Useful Life",
    group: "Signature",
    description: "Test Ind AS component depreciation — verify significant components are depreciated separately.",
    endpoint: `${API_BASE}/componentisation`,
    type: "crud",
    columns: [
      { key: "parent_asset_code", label: "Parent Asset" },
      { key: "component_name", label: "Component" },
      { key: "component_cost", label: "Cost", type: "number" },
      { key: "useful_life_years", label: "Useful Life", type: "number" },
      { key: "schedule_ii_life", label: "Sch II Life", type: "number" },
      { key: "deviation", label: "Deviation", type: "number" },
      { key: "review_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "parent_asset_code", label: "Parent Asset Code", required: true },
      { key: "component_name", label: "Component Name", required: true },
      { key: "component_cost", label: "Component Cost", inputType: "number", required: true },
      { key: "useful_life_years", label: "Useful Life (yrs)", inputType: "number", required: true },
      { key: "schedule_ii_life", label: "Schedule II Life (yrs)", inputType: "number" },
      { key: "deviation", label: "Deviation (yrs)", inputType: "number" },
      { key: "justification", label: "Justification", inputType: "textarea" },
      { key: "review_status", label: "Status", inputType: "select", options: ["pending", "compliant", "non_compliant"], defaultValue: "pending" },
    ],
  },
  {
    id: "idle-assets",
    label: "Idle / Under-utilised Assets",
    group: "Signature",
    description: "Detect non-productive assets for impairment review, disposal, or redeployment.",
    endpoint: `${API_BASE}/idle-assets`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "location", label: "Location" },
      { key: "book_value", label: "Book Value", type: "number" },
      { key: "idle_days", label: "Idle Days", type: "number" },
      { key: "recommended_action", label: "Action", type: "status" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "location", label: "Location", required: true },
      { key: "book_value", label: "Book Value", inputType: "number", required: true },
      { key: "idle_since", label: "Idle Since", inputType: "date" },
      { key: "idle_days", label: "Idle Days", inputType: "number", defaultValue: 0 },
      { key: "reason", label: "Reason", inputType: "textarea" },
      { key: "recommended_action", label: "Recommended Action", inputType: "select", options: ["review", "redeploy", "dispose", "impair"], defaultValue: "review" },
      { key: "status", label: "Status", inputType: "select", options: ["open", "action_taken", "closed"], defaultValue: "open" },
    ],
  },
  {
    id: "impairment",
    label: "Impairment Indicators",
    group: "Signature",
    description: "Screen for impairment triggers under Ind AS 36.",
    endpoint: `${API_BASE}/impairment`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "indicator_type", label: "Indicator", type: "status" },
      { key: "book_value", label: "Book Value", type: "number" },
      { key: "estimated_recoverable", label: "Recoverable", type: "number" },
      { key: "impairment_loss", label: "Loss", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "indicator_type", label: "Indicator Type", inputType: "select", options: ["market_decline", "obsolescence", "legal_change", "physical_damage", "idle", "other"], required: true },
      { key: "book_value", label: "Book Value", inputType: "number", required: true },
      { key: "estimated_recoverable", label: "Est. Recoverable Amount", inputType: "number" },
      { key: "impairment_loss", label: "Impairment Loss", inputType: "number" },
      { key: "assessment_date", label: "Assessment Date", inputType: "date", required: true },
      { key: "assessed_by", label: "Assessed By", required: true },
      { key: "status", label: "Status", inputType: "select", options: ["identified", "tested", "impaired", "no_impairment"], defaultValue: "identified" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "insurance-mapping",
    label: "Insurance-to-Asset Mapping",
    group: "Signature",
    description: "Ensure key assets are covered by appropriate insurance policies.",
    endpoint: `${API_BASE}/insurance-mapping`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "asset_value", label: "Asset Value", type: "number" },
      { key: "policy_number", label: "Policy No." },
      { key: "coverage_amount", label: "Coverage", type: "number" },
      { key: "coverage_gap", label: "Gap", type: "number" },
      { key: "is_adequately_insured", label: "Adequate?", type: "boolean" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "asset_value", label: "Asset Value", inputType: "number", required: true },
      { key: "policy_number", label: "Policy Number" },
      { key: "insurer", label: "Insurer" },
      { key: "coverage_amount", label: "Coverage Amount", inputType: "number", defaultValue: 0 },
      { key: "coverage_gap", label: "Coverage Gap", inputType: "number", defaultValue: 0 },
      { key: "policy_expiry", label: "Policy Expiry", inputType: "date" },
      { key: "is_adequately_insured", label: "Adequately Insured?", inputType: "checkbox" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "capex-opex",
    label: "Capex vs Opex Classification",
    group: "Signature",
    description: "Test for expenditure wrongly classified as capex or opex.",
    endpoint: `${API_BASE}/capex-opex`,
    type: "crud",
    columns: [
      { key: "voucher_number", label: "Voucher No." },
      { key: "description", label: "Description" },
      { key: "amount", label: "Amount", type: "number" },
      { key: "gl_account", label: "GL Account" },
      { key: "booked_as", label: "Booked As", type: "status" },
      { key: "should_be", label: "Should Be", type: "status" },
      { key: "is_misclassified", label: "Misclassified?", type: "boolean" },
      { key: "review_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "voucher_number", label: "Voucher Number", required: true },
      { key: "description", label: "Description", required: true },
      { key: "amount", label: "Amount", inputType: "number", required: true },
      { key: "gl_account", label: "GL Account", required: true },
      { key: "booked_as", label: "Booked As", inputType: "select", options: ["capex", "opex"], required: true },
      { key: "should_be", label: "Should Be", inputType: "select", options: ["capex", "opex"], required: true },
      { key: "is_misclassified", label: "Misclassified?", inputType: "checkbox" },
      { key: "transaction_date", label: "Transaction Date", inputType: "date", required: true },
      { key: "review_status", label: "Review Status", inputType: "select", options: ["pending", "confirmed", "reclassified"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "lease-vs-own",
    label: "Lease vs Own (Ind AS 116)",
    group: "Signature",
    description: "Right-of-use (ROU) asset recognition under Ind AS 116.",
    endpoint: `${API_BASE}/lease-vs-own`,
    type: "crud",
    columns: [
      { key: "lease_id", label: "Lease ID" },
      { key: "asset_description", label: "Description" },
      { key: "lessor", label: "Lessor" },
      { key: "lease_term_months", label: "Term (mo.)", type: "number" },
      { key: "annual_lease_payment", label: "Annual Payment", type: "number" },
      { key: "rou_asset_recognised", label: "ROU?", type: "boolean" },
      { key: "review_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "lease_id", label: "Lease ID", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "lessor", label: "Lessor", required: true },
      { key: "lease_start", label: "Lease Start", inputType: "date", required: true },
      { key: "lease_end", label: "Lease End", inputType: "date", required: true },
      { key: "lease_term_months", label: "Term (months)", inputType: "number", required: true },
      { key: "annual_lease_payment", label: "Annual Payment", inputType: "number", required: true },
      { key: "rou_asset_recognised", label: "ROU Recognised?", inputType: "checkbox" },
      { key: "rou_value", label: "ROU Value", inputType: "number", defaultValue: 0 },
      { key: "lease_liability", label: "Lease Liability", inputType: "number", defaultValue: 0 },
      { key: "is_short_term_exempt", label: "Short-term Exempt?", inputType: "checkbox" },
      { key: "review_status", label: "Status", inputType: "select", options: ["pending", "compliant", "non_compliant"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "transfers",
    label: "Asset Transfer & Location Move",
    group: "Signature",
    description: "Track inter-unit/inter-location asset transfers and controls.",
    endpoint: `${API_BASE}/transfers`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "from_location", label: "From" },
      { key: "to_location", label: "To" },
      { key: "transfer_date", label: "Date", type: "date" },
      { key: "transfer_value", label: "Value", type: "number" },
      { key: "documentation_complete", label: "Docs?", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "from_location", label: "From Location", required: true },
      { key: "to_location", label: "To Location", required: true },
      { key: "transfer_date", label: "Transfer Date", inputType: "date", required: true },
      { key: "transfer_value", label: "Transfer Value", inputType: "number", required: true },
      { key: "authorised_by", label: "Authorised By", required: true },
      { key: "documentation_complete", label: "Documentation Complete?", inputType: "checkbox" },
      { key: "register_updated", label: "Register Updated?", inputType: "checkbox" },
      { key: "status", label: "Status", inputType: "select", options: ["pending", "completed", "rejected"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "scrap-salvage",
    label: "Scrap & Salvage Realisation",
    group: "Signature",
    description: "Track scrap/salvage proceeds against written-down values.",
    endpoint: `${API_BASE}/scrap-salvage`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "scrap_date", label: "Date", type: "date" },
      { key: "wdv_at_scrap", label: "WDV", type: "number" },
      { key: "expected_salvage", label: "Expected", type: "number" },
      { key: "actual_realisation", label: "Actual", type: "number" },
      { key: "variance", label: "Variance", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "scrap_date", label: "Scrap Date", inputType: "date", required: true },
      { key: "wdv_at_scrap", label: "WDV at Scrap", inputType: "number", required: true },
      { key: "expected_salvage", label: "Expected Salvage", inputType: "number", defaultValue: 0 },
      { key: "actual_realisation", label: "Actual Realisation", inputType: "number", defaultValue: 0 },
      { key: "variance", label: "Variance", inputType: "number", required: true },
      { key: "scrap_buyer", label: "Scrap Buyer" },
      { key: "receipt_reference", label: "Receipt Reference" },
      { key: "status", label: "Status", inputType: "select", options: ["pending", "realised", "written_off"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },
  {
    id: "revaluation",
    label: "Revaluation & Fair-Value Review",
    group: "Signature",
    description: "Test the basis and adequacy of asset revaluations under Ind AS 16.",
    endpoint: `${API_BASE}/revaluation`,
    type: "crud",
    columns: [
      { key: "asset_code", label: "Asset Code" },
      { key: "asset_description", label: "Description" },
      { key: "revaluation_date", label: "Date", type: "date" },
      { key: "book_value_before", label: "Book Value", type: "number" },
      { key: "revalued_amount", label: "Revalued", type: "number" },
      { key: "revaluation_surplus", label: "Surplus", type: "number" },
      { key: "valuation_method", label: "Method" },
      { key: "review_status", label: "Status", type: "status" },
    ],
    formFields: [
      { key: "asset_code", label: "Asset Code", required: true },
      { key: "asset_description", label: "Description", required: true },
      { key: "revaluation_date", label: "Revaluation Date", inputType: "date", required: true },
      { key: "book_value_before", label: "Book Value Before", inputType: "number", required: true },
      { key: "revalued_amount", label: "Revalued Amount", inputType: "number", required: true },
      { key: "revaluation_surplus", label: "Revaluation Surplus", inputType: "number", required: true },
      { key: "valuer_name", label: "Valuer Name" },
      { key: "valuation_method", label: "Valuation Method", required: true, placeholder: "e.g. market_approach" },
      { key: "is_independent_valuer", label: "Independent Valuer?", inputType: "checkbox" },
      { key: "review_status", label: "Status", inputType: "select", options: ["pending", "adequate", "inadequate"], defaultValue: "pending" },
      { key: "notes", label: "Notes", inputType: "textarea" },
    ],
  },

  // ─── COMMON AUDIT SHELL FEATURES (16-25) ─────────────────────────────
  {
    id: "dashboard",
    label: "Module Dashboard & KPIs",
    group: "Audit Shell",
    description: "Live risk score, open exceptions, coverage % and trend for this domain.",
    endpoint: `${API_BASE}/dashboard`,
    type: "shell",
  },
  {
    id: "scope",
    label: "Scope & Audit Universe",
    group: "Audit Shell",
    description: "Define auditable units/entities/processes in scope for this module.",
    endpoint: `${API_BASE}/scope`,
    type: "shell",
  },
  {
    id: "rcm",
    label: "Risk & Control Matrix (RCM)",
    group: "Audit Shell",
    description: "Catalogue risks, controls, assertions and control owners for the domain.",
    endpoint: `${API_BASE}/rcm`,
    type: "shell",
  },
  {
    id: "test-rules",
    label: "Test & Analytics Rule Library",
    group: "Audit Shell",
    description: "Configure automated red-flag rules, thresholds and CAAT scripts.",
    endpoint: `${API_BASE}/test-rules`,
    type: "shell",
  },
  {
    id: "data-sources",
    label: "Data Source & Connector Setup",
    group: "Audit Shell",
    description: "Map ERP tables/APIs/uploads that feed this module's analytics.",
    endpoint: `${API_BASE}/data-sources`,
    type: "shell",
  },
  {
    id: "sampling",
    label: "Sampling & Population Builder",
    group: "Audit Shell",
    description: "Draw statistical or judgemental samples from the full population.",
    endpoint: `${API_BASE}/sampling`,
    type: "shell",
  },
  {
    id: "exceptions",
    label: "Exception & Red-Flag Queue",
    group: "Audit Shell",
    description: "Triage system-generated exceptions with disposition and notes.",
    endpoint: `${API_BASE}/exceptions`,
    type: "shell",
  },
  {
    id: "working-papers",
    label: "Working Papers & Evidence",
    group: "Audit Shell",
    description: "Attach evidence, tick-marks, screenshots and reviewer sign-off.",
    endpoint: `${API_BASE}/working-papers`,
    type: "shell",
  },
  {
    id: "findings",
    label: "Observation & Finding Log",
    group: "Audit Shell",
    description: "Raise, grade, and route findings specific to this domain.",
    endpoint: `${API_BASE}/findings`,
    type: "shell",
  },
  {
    id: "remediation",
    label: "Remediation / Action Tracker",
    group: "Audit Shell",
    description: "Track CAPA items, owners, due dates and re-testing status.",
    endpoint: `${API_BASE}/remediation`,
    type: "shell",
  },
];


// ═══════════════════════════════════════════════════════════════════════════
// INLINE STYLES
// ═══════════════════════════════════════════════════════════════════════════
// Using inline styles to keep this module self-contained (no external CSS
// dependency beyond the shared theme.css).  This can be refactored into
// a CSS module or styled-components in future.

const styles = {
  /** Root layout: sidebar + content */
  root: {
    display: "flex",
    gap: 0,
    minHeight: "calc(100vh - 120px)",
  } as React.CSSProperties,

  /** Left navigation sidebar */
  sidebar: {
    width: 280,
    minWidth: 280,
    background: "var(--surface)",
    borderRight: "1px solid var(--line)",
    borderRadius: "var(--radius) 0 0 var(--radius)",
    overflow: "auto",
    maxHeight: "calc(100vh - 120px)",
  } as React.CSSProperties,

  sidebarHeader: {
    padding: "18px 16px 12px",
    borderBottom: "1px solid var(--line)",
    position: "sticky" as const,
    top: 0,
    background: "var(--surface)",
    zIndex: 2,
  } as React.CSSProperties,

  sidebarTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--navy)",
    margin: 0,
  } as React.CSSProperties,

  sidebarSubtitle: {
    fontSize: 12,
    color: "var(--slate-soft)",
    marginTop: 2,
  } as React.CSSProperties,

  groupLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "var(--slate-soft)",
    padding: "14px 16px 6px",
  } as React.CSSProperties,

  navItem: (active: boolean) => ({
    display: "block",
    width: "100%",
    padding: "9px 16px",
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--navy)" : "var(--slate)",
    background: active ? "var(--navy-tint)" : "transparent",
    borderLeft: active ? "3px solid var(--gold)" : "3px solid transparent",
    cursor: "pointer",
    transition: "all 0.12s ease",
    textAlign: "left" as const,
    border: "none",
    fontFamily: "inherit",
    lineHeight: 1.4,
  }) as React.CSSProperties,

  /** Right content area */
  content: {
    flex: 1,
    padding: "24px 28px",
    overflow: "auto",
    maxHeight: "calc(100vh - 120px)",
  } as React.CSSProperties,

  contentHeader: {
    marginBottom: 20,
  } as React.CSSProperties,

  contentTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--navy)",
    margin: 0,
  } as React.CSSProperties,

  contentDesc: {
    fontSize: 14,
    color: "var(--slate)",
    marginTop: 4,
  } as React.CSSProperties,

  /** Feature badge */
  featureBadge: (group: string) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 10,
    background: group === "Signature" ? "var(--gold-tint)" : "var(--navy-tint)",
    color: group === "Signature" ? "var(--gold-strong)" : "var(--slate)",
  }) as React.CSSProperties,

  /** Form layout */
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 16px",
  } as React.CSSProperties,

  formFullWidth: {
    gridColumn: "1 / -1",
  } as React.CSSProperties,

  /** Status pill */
  statusPill: (value: string) => {
    const colorMap: Record<string, { bg: string; fg: string }> = {
      verified: { bg: "var(--success-tint)", fg: "var(--success)" },
      approved: { bg: "var(--success-tint)", fg: "var(--success)" },
      compliant: { bg: "var(--success-tint)", fg: "var(--success)" },
      reconciled: { bg: "var(--success-tint)", fg: "var(--success)" },
      completed: { bg: "var(--success-tint)", fg: "var(--success)" },
      capitalised: { bg: "var(--success-tint)", fg: "var(--success)" },
      realised: { bg: "var(--success-tint)", fg: "var(--success)" },
      adequate: { bg: "var(--success-tint)", fg: "var(--success)" },
      closed: { bg: "var(--success-tint)", fg: "var(--success)" },
      no_impairment: { bg: "var(--success-tint)", fg: "var(--success)" },
      reclassified: { bg: "var(--success-tint)", fg: "var(--success)" },
      resolved: { bg: "var(--success-tint)", fg: "var(--success)" },
      action_taken: { bg: "var(--success-tint)", fg: "var(--success)" },
      pending: { bg: "var(--gold-tint)", fg: "var(--gold-strong)" },
      in_progress: { bg: "var(--gold-tint)", fg: "var(--gold-strong)" },
      identified: { bg: "var(--gold-tint)", fg: "var(--gold-strong)" },
      review: { bg: "var(--gold-tint)", fg: "var(--gold-strong)" },
      open: { bg: "var(--gold-tint)", fg: "var(--gold-strong)" },
      tested: { bg: "var(--navy-tint)", fg: "var(--slate)" },
      missing: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      mismatch: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      rejected: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      non_compliant: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      exception: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      delayed: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      impaired: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      inadequate: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      written_off: { bg: "var(--danger-tint)", fg: "var(--danger)" },
      escalated: { bg: "var(--danger-tint)", fg: "var(--danger)" },
    };
    const c = colorMap[value] || { bg: "var(--navy-tint)", fg: "var(--slate)" };
    return {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: c.bg,
      color: c.fg,
    } as React.CSSProperties;
  },

  /** KPI card for shell features */
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 14,
    marginTop: 16,
  } as React.CSSProperties,

  kpiCard: {
    padding: "16px 18px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--line)",
    background: "var(--surface)",
  } as React.CSSProperties,

  kpiLabel: {
    fontSize: 11.5,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    color: "var(--slate-soft)",
    marginBottom: 4,
  } as React.CSSProperties,

  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--navy)",
  } as React.CSSProperties,

  /** Shell feature — data table for arrays */
  shellTable: {
    marginTop: 16,
  } as React.CSSProperties,

  /** Empty state */
  emptyState: {
    padding: "40px 20px",
    textAlign: "center" as const,
    color: "var(--slate-soft)",
    fontSize: 14,
  } as React.CSSProperties,
};


// ═══════════════════════════════════════════════════════════════════════════
// CELL RENDERER — Renders a single table cell based on column type
// ═══════════════════════════════════════════════════════════════════════════

function renderCell(value: unknown, col: ColumnDef): React.ReactNode {
  if (value === null || value === undefined) return "—";

  switch (col.type) {
    case "boolean":
      return value ? "✔" : "✘";
    case "number":
      return typeof value === "number"
        ? value.toLocaleString("en-IN", { maximumFractionDigits: 2 })
        : String(value);
    case "date":
      return String(value);
    case "status":
      return <span style={styles.statusPill(String(value))}>{String(value).replace(/_/g, " ")}</span>;
    default:
      return String(value);
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// CRUD FEATURE VIEW — Data table + add form for signature features
// ═══════════════════════════════════════════════════════════════════════════

function CrudFeatureView({ feature }: { feature: FeatureDef }) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialise form defaults when the feature changes
  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    feature.formFields?.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
    });
    setFormData(defaults);
  }, [feature.id]);

  // Fetch data from the API
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<Record<string, unknown>[]>(feature.endpoint);
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [feature.endpoint]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handle form field changes
  const handleFieldChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Submit the add form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await post(feature.endpoint, formData);
      // Reset form
      const defaults: Record<string, unknown> = {};
      feature.formFields?.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
      });
      setFormData(defaults);
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error("Failed to create record:", err);
    }
    setSubmitting(false);
  };

  // Delete a record
  const handleDelete = async (id: number) => {
    await del(`${feature.endpoint}/${id}`);
    refresh();
  };

  const columns = feature.columns || [];

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Record"}
        </button>
        <button className="btn btn-ghost" onClick={refresh}>
          ↻ Refresh
        </button>
      </div>

      {/* Add record form */}
      {showForm && feature.formFields && (
        <form
          className="card"
          style={{ padding: 22, marginBottom: 20 }}
          onSubmit={handleSubmit}
        >
          <h3 style={{ color: "var(--navy)", marginBottom: 14, fontSize: 15 }}>
            Add New Record
          </h3>
          <div style={styles.formGrid}>
            {feature.formFields.map((field) => {
              const inputType = field.inputType || "text";
              const isFullWidth = inputType === "textarea";

              return (
                <div
                  key={field.key}
                  className="field"
                  style={isFullWidth ? styles.formFullWidth : undefined}
                >
                  <label>{field.label}{field.required ? " *" : ""}</label>
                  {inputType === "select" ? (
                    <select
                      className="select"
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      required={field.required}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  ) : inputType === "textarea" ? (
                    <textarea
                      className="input"
                      rows={3}
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={{ resize: "vertical" }}
                    />
                  ) : inputType === "checkbox" ? (
                    <div style={{ paddingTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={!!formData[field.key]}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                        style={{ width: 18, height: 18 }}
                      />
                    </div>
                  ) : (
                    <input
                      className="input"
                      type={inputType}
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) =>
                        handleFieldChange(
                          field.key,
                          inputType === "number"
                            ? e.target.value === "" ? "" : Number(e.target.value)
                            : e.target.value
                        )
                      }
                      required={field.required}
                      placeholder={field.placeholder}
                      step={inputType === "number" ? "any" : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-gold"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? "Saving…" : "Save Record"}
          </button>
        </form>
      )}

      {/* Data table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18, color: "var(--slate)" }}>Loading…</p>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No records yet.</p>
            <p style={{ marginTop: 6, fontSize: 13 }}>
              Click <strong>+ Add Record</strong> to create your first entry.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id as number}>
                    {columns.map((col) => (
                      <td key={col.key}>{renderCell(item[col.key], col)}</td>
                    ))}
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "5px 10px", fontSize: 13 }}
                        onClick={() => handleDelete(item.id as number)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SHELL FEATURE VIEW — KPI/JSON display for common audit shell features
// ═══════════════════════════════════════════════════════════════════════════

function ShellFeatureView({ feature }: { feature: FeatureDef }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await get<Record<string, unknown>>(feature.endpoint);
        setData(result);
      } catch {
        setData(null);
      }
      setLoading(false);
    })();
  }, [feature.endpoint]);

  if (loading) return <p style={{ color: "var(--slate)" }}>Loading…</p>;
  if (!data) return <p style={{ color: "var(--danger)" }}>Failed to load data.</p>;

  // Render KPI cards for summary/kpis objects
  const renderKPIs = (obj: Record<string, unknown>, title: string) => (
    <div>
      <h4 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 4 }}>{title}</h4>
      <div style={styles.kpiGrid}>
        {Object.entries(obj).map(([k, v]) => (
          <div key={k} style={styles.kpiCard}>
            <div style={styles.kpiLabel}>{k.replace(/_/g, " ")}</div>
            <div style={styles.kpiValue}>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render array data as a table
  const renderArrayTable = (arr: Record<string, unknown>[], title: string) => {
    if (arr.length === 0)
      return (
        <div style={styles.shellTable}>
          <h4 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 4 }}>{title}</h4>
          <p style={{ color: "var(--slate-soft)", fontSize: 13 }}>No data available yet.</p>
        </div>
      );
    const keys = Object.keys(arr[0]);
    return (
      <div style={styles.shellTable}>
        <h4 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 8 }}>{title}</h4>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {keys.map((k) => (
                    <th key={k}>{k.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {arr.map((row, i) => (
                  <tr key={i}>
                    {keys.map((k) => (
                      <td key={k}>
                        {typeof row[k] === "boolean"
                          ? row[k] ? "✔" : "✘"
                          : String(row[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Status banner */}
      {!!data.status && (
        <div className="alert" style={{
          background: "var(--gold-tint)",
          color: "var(--gold-strong)",
          border: "1px solid rgba(184, 134, 43, 0.2)",
          fontSize: 13,
        }}>
          ⚠ {String(data.status)}
        </div>
      )}

      {/* Render each key in the response */}
      {Object.entries(data).map(([key, value]) => {
        if (key === "module" || key === "status") return null;

        // Object with nested values → render as KPI cards
        if (value && typeof value === "object" && !Array.isArray(value)) {
          return (
            <div key={key} style={{ marginBottom: 20 }}>
              {renderKPIs(value as Record<string, unknown>, key.replace(/_/g, " ").toUpperCase())}
            </div>
          );
        }

        // Array → render as table
        if (Array.isArray(value)) {
          return (
            <div key={key} style={{ marginBottom: 20 }}>
              {renderArrayTable(
                value as Record<string, unknown>[],
                key.replace(/_/g, " ").toUpperCase()
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function FixedAssetsCwipPage() {
  // Default to the first feature (Physical Verification)
  const [activeFeatureId, setActiveFeatureId] = useState(FEATURES[0].id);

  const activeFeature = FEATURES.find((f) => f.id === activeFeatureId) || FEATURES[0];

  // Group features by their group for sidebar rendering
  const signatureFeatures = FEATURES.filter((f) => f.group === "Signature");
  const shellFeatures = FEATURES.filter((f) => f.group === "Audit Shell");

  return (
    <div style={styles.root}>
      {/* ── Sidebar Navigation ── */}
      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>Fixed Assets & CWIP</h3>
          <div style={styles.sidebarSubtitle}>Module 18 • 25 Features</div>
        </div>

        {/* Signature Features */}
        <div style={styles.groupLabel}>
          Signature Features ({signatureFeatures.length})
        </div>
        {signatureFeatures.map((f) => (
          <button
            key={f.id}
            style={styles.navItem(activeFeatureId === f.id)}
            onClick={() => setActiveFeatureId(f.id)}
            onMouseEnter={(e) => {
              if (activeFeatureId !== f.id) {
                (e.target as HTMLElement).style.background = "var(--canvas)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeFeatureId !== f.id) {
                (e.target as HTMLElement).style.background = "transparent";
              }
            }}
          >
            {f.label}
          </button>
        ))}

        {/* Audit Shell Features */}
        <div style={styles.groupLabel}>
          Common Audit Shell ({shellFeatures.length})
        </div>
        {shellFeatures.map((f) => (
          <button
            key={f.id}
            style={styles.navItem(activeFeatureId === f.id)}
            onClick={() => setActiveFeatureId(f.id)}
            onMouseEnter={(e) => {
              if (activeFeatureId !== f.id) {
                (e.target as HTMLElement).style.background = "var(--canvas)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeFeatureId !== f.id) {
                (e.target as HTMLElement).style.background = "transparent";
              }
            }}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* ── Content Area ── */}
      <main style={styles.content}>
        <div style={styles.contentHeader}>
          <span style={styles.featureBadge(activeFeature.group)}>
            {activeFeature.group === "Signature" ? "Signature Feature" : "Audit Shell"}
          </span>
          <h2 style={styles.contentTitle}>{activeFeature.label}</h2>
          <p style={styles.contentDesc}>{activeFeature.description}</p>
        </div>

        {/* Render the appropriate view based on feature type */}
        {activeFeature.type === "crud" ? (
          <CrudFeatureView key={activeFeature.id} feature={activeFeature} />
        ) : (
          <ShellFeatureView key={activeFeature.id} feature={activeFeature} />
        )}
      </main>
    </div>
  );
}
