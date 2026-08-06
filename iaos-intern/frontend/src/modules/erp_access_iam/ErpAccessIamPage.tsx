import { useCallback, useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

const SLUG = "erp_access_iam";

/* ──────────────────────────────────────────────────────────────────────────
   Tab definitions — maps to the 25 sub-pages.
   ────────────────────────────────────────────────────────────────────────── */
interface TabDef {
  key: string;
  label: string;
  endpoint: string;
  columns: { key: string; header: string; w?: number }[];
  fields: FieldDef[];
  section: "sig" | "mgmt";
}

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "select" | "number" | "check" | "textarea";
  options?: string[];
  req?: boolean;
}

const TABS: TabDef[] = [
  // ── Signature Checks (1-15) ────────────────────────────────────────────
  {
    key: "role-design",
    label: "1. Role Design",
    endpoint: "roles",
    section: "sig",
    columns: [
      { key: "role_name", header: "Role", w: 160 },
      { key: "risk_level", header: "Risk", w: 80 },
      { key: "entitlement_count", header: "Entitlements", w: 100 },
      { key: "owner", header: "Owner", w: 130 },
      { key: "review_status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "role_name", label: "Role Name", req: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "risk_level", label: "Risk Level", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "entitlement_count", label: "# Entitlements", type: "number" },
      { key: "owner", label: "Owner" },
      { key: "review_status", label: "Review Status", type: "select", options: ["Pending", "Reviewed", "Approved", "Rejected"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "lifecycle",
    label: "2. Joiner-Mover-Leaver",
    endpoint: "lifecycle",
    section: "sig",
    columns: [
      { key: "employee_name", header: "Employee", w: 160 },
      { key: "event_type", header: "Event", w: 100 },
      { key: "event_date", header: "Date", w: 110 },
      { key: "department", header: "Dept", w: 120 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "employee_id", label: "Employee ID", req: true },
      { key: "employee_name", label: "Employee Name", req: true },
      { key: "event_type", label: "Event Type", type: "select", options: ["Joiner", "Mover", "Leaver"], req: true },
      { key: "event_date", label: "Event Date", req: true },
      { key: "department", label: "Department" },
      { key: "role_affected", label: "Role Affected" },
      { key: "access_granted", label: "Access Granted" },
      { key: "access_revoked", label: "Access Revoked" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed", "Overdue"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "dormant",
    label: "3. Dormant Accounts",
    endpoint: "dormant",
    section: "sig",
    columns: [
      { key: "username", header: "Username", w: 150 },
      { key: "full_name", header: "Full Name", w: 160 },
      { key: "last_login", header: "Last Login", w: 120 },
      { key: "days_inactive", header: "Days Inactive", w: 110 },
      { key: "risk_rating", header: "Risk", w: 80 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "user_id", label: "User ID", req: true },
      { key: "username", label: "Username", req: true },
      { key: "full_name", label: "Full Name" },
      { key: "last_login", label: "Last Login Date" },
      { key: "days_inactive", label: "Days Inactive", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Dormant", "Disabled", "Removed"] },
      { key: "risk_rating", label: "Risk Rating", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "action_taken", label: "Action Taken", type: "select", options: ["None", "Warned", "Disabled", "Removed", "Re-certified"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "terminated",
    label: "4. Terminated-User Access",
    endpoint: "lifecycle",
    section: "sig",
    columns: [
      { key: "employee_name", header: "Employee", w: 160 },
      { key: "event_date", header: "Term. Date", w: 120 },
      { key: "access_revoked", header: "Revoked", w: 160 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "employee_id", label: "Employee ID", req: true },
      { key: "employee_name", label: "Employee Name", req: true },
      { key: "event_type", label: "Event Type", type: "select", options: ["Terminated", "Resigned", "Retired"], req: true },
      { key: "event_date", label: "Termination Date", req: true },
      { key: "department", label: "Department" },
      { key: "access_revoked", label: "Access Revoked" },
      { key: "days_pending", label: "Days Pending", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed", "Overdue"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "sod",
    label: "5. Transaction-Level SoD",
    endpoint: "sod",
    section: "sig",
    columns: [
      { key: "conflict_id", header: "Conflict ID", w: 110 },
      { key: "transaction_a", header: "Transaction A", w: 160 },
      { key: "transaction_b", header: "Transaction B", w: 160 },
      { key: "risk_rating", header: "Risk", w: 80 },
      { key: "affected_users", header: "Users", w: 70 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "conflict_id", label: "Conflict ID", req: true },
      { key: "transaction_a", label: "Transaction A", req: true },
      { key: "transaction_b", label: "Transaction B", req: true },
      { key: "risk_rating", label: "Risk Rating", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "affected_users", label: "Affected Users", type: "number" },
      { key: "affected_roles", label: "Affected Roles" },
      { key: "mitigation", label: "Mitigation", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Open", "Mitigated", "Accepted", "Closed"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "privileged",
    label: "6. Privileged / Super-User",
    endpoint: "privileged",
    section: "sig",
    columns: [
      { key: "username", header: "User", w: 150 },
      { key: "access_type", header: "Access Type", w: 140 },
      { key: "profile", header: "Profile", w: 140 },
      { key: "last_used", header: "Last Used", w: 120 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "user_id", label: "User ID", req: true },
      { key: "username", label: "Username", req: true },
      { key: "access_type", label: "Access Type", type: "select", options: ["SAP_ALL", "SAP_NEW", "Admin", "Debug", "Custom"], req: true },
      { key: "profile", label: "Profile" },
      { key: "assigned_date", label: "Assigned Date" },
      { key: "last_used", label: "Last Used" },
      { key: "usage_count", label: "Usage Count", type: "number" },
      { key: "justification", label: "Justification", type: "textarea" },
      { key: "approved_by", label: "Approved By" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Suspended", "Revoked", "Under Review"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "recert",
    label: "7. Access Recertification",
    endpoint: "recert",
    section: "sig",
    columns: [
      { key: "campaign_name", header: "Campaign", w: 180 },
      { key: "period", header: "Period", w: 120 },
      { key: "completion_pct", header: "% Complete", w: 100 },
      { key: "exceptions_found", header: "Exceptions", w: 100 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "campaign_name", label: "Campaign Name", req: true },
      { key: "period", label: "Period", req: true },
      { key: "total_users", label: "Total Users", type: "number" },
      { key: "reviewed_count", label: "Reviewed Count", type: "number" },
      { key: "exceptions_found", label: "Exceptions Found", type: "number" },
      { key: "start_date", label: "Start Date" },
      { key: "end_date", label: "End Date" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Active", "Completed", "Closed"] },
      { key: "completion_pct", label: "Completion %", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "shared",
    label: "8. Generic / Shared IDs",
    endpoint: "shared",
    section: "sig",
    columns: [
      { key: "account_name", header: "Account", w: 160 },
      { key: "purpose", header: "Purpose", w: 200 },
      { key: "owner", header: "Owner", w: 130 },
      { key: "risk_rating", header: "Risk", w: 80 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "account_name", label: "Account Name", req: true },
      { key: "purpose", label: "Purpose", type: "textarea" },
      { key: "shared_with", label: "Shared With", type: "textarea" },
      { key: "owner", label: "Owner" },
      { key: "last_activity", label: "Last Activity" },
      { key: "password_last_changed", label: "Password Last Changed" },
      { key: "risk_rating", label: "Risk Rating", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "status", label: "Status", type: "select", options: ["Active", "Disabled", "Under Review"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "sensitive",
    label: "9. Sensitive-Transaction Access",
    endpoint: "sensitive",
    section: "sig",
    columns: [
      { key: "transaction_code", header: "Txn Code", w: 120 },
      { key: "description", header: "Description", w: 200 },
      { key: "module", header: "Module", w: 120 },
      { key: "criticality", header: "Criticality", w: 100 },
      { key: "excess_count", header: "Excess", w: 70 },
    ],
    fields: [
      { key: "transaction_code", label: "Transaction Code", req: true },
      { key: "description", label: "Description", req: true },
      { key: "module", label: "Module" },
      { key: "criticality", label: "Criticality", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "users_with_access", label: "Users w/ Access", type: "number" },
      { key: "authorized_users", label: "Authorized Users", type: "number" },
      { key: "excess_count", label: "Excess Count", type: "number" },
      { key: "last_reviewed", label: "Last Reviewed" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "role-fit",
    label: "10. Access vs Job-Role Fit",
    endpoint: "role-fit",
    section: "sig",
    columns: [
      { key: "employee_name", header: "Employee", w: 160 },
      { key: "job_title", header: "Job Title", w: 160 },
      { key: "excess_privileges", header: "Excess", w: 80 },
      { key: "unused_roles", header: "Unused", w: 80 },
      { key: "fit_status", header: "Fit Status", w: 120 },
    ],
    fields: [
      { key: "employee_id", label: "Employee ID", req: true },
      { key: "employee_name", label: "Employee Name", req: true },
      { key: "job_title", label: "Job Title" },
      { key: "department", label: "Department" },
      { key: "assigned_roles", label: "Assigned Roles", type: "textarea" },
      { key: "excess_privileges", label: "Excess Privileges", type: "number" },
      { key: "unused_roles", label: "Unused Roles", type: "number" },
      { key: "risk_score", label: "Risk Score", type: "number" },
      { key: "fit_status", label: "Fit Status", type: "select", options: ["Aligned", "Under Review", "Excess Detected", "Remediation Required"] },
      { key: "recommendation", label: "Recommendation", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "emergency",
    label: "11. Emergency-Access (Firefighter)",
    endpoint: "privileged",
    section: "sig",
    columns: [
      { key: "username", header: "User", w: 150 },
      { key: "access_type", header: "Type", w: 140 },
      { key: "justification", header: "Justification", w: 200 },
      { key: "usage_count", header: "Uses", w: 70 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "user_id", label: "User ID", req: true },
      { key: "username", label: "Username", req: true },
      { key: "access_type", label: "Access Type", type: "select", options: ["Firefighter ID", "Emergency Access", "Break-Glass"], req: true },
      { key: "assigned_date", label: "Assigned Date" },
      { key: "justification", label: "Justification", type: "textarea", req: true },
      { key: "approved_by", label: "Approved By" },
      { key: "usage_count", label: "Usage Count", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Expired", "Revoked", "Under Review"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "seg-sim",
    label: "12. Segregation Simulation",
    endpoint: "sod",
    section: "sig",
    columns: [
      { key: "conflict_id", header: "Sim ID", w: 110 },
      { key: "transaction_a", header: "Role A / Txn", w: 160 },
      { key: "transaction_b", header: "Role B / Txn", w: 160 },
      { key: "risk_rating", header: "Risk", w: 80 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "conflict_id", label: "Simulation ID", req: true },
      { key: "transaction_a", label: "Role / Txn A", req: true },
      { key: "transaction_b", label: "Role / Txn B", req: true },
      { key: "risk_rating", label: "Risk Rating", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "affected_roles", label: "Affected Roles" },
      { key: "mitigation", label: "Proposed Mitigation", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Simulated", "Conflict Found", "No Conflict", "Mitigated"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "logins",
    label: "13. Login & Failed-Attempt Analytics",
    endpoint: "logins",
    section: "sig",
    columns: [
      { key: "username", header: "User", w: 150 },
      { key: "login_time", header: "Time", w: 160 },
      { key: "ip_address", header: "IP", w: 130 },
      { key: "success", header: "OK?", w: 60 },
      { key: "consecutive_failures", header: "Fails", w: 70 },
      { key: "risk_flag", header: "Flag", w: 90 },
    ],
    fields: [
      { key: "user_id", label: "User ID", req: true },
      { key: "username", label: "Username", req: true },
      { key: "login_time", label: "Login Time", req: true },
      { key: "ip_address", label: "IP Address" },
      { key: "location", label: "Location" },
      { key: "success", label: "Success", type: "check" },
      { key: "failure_reason", label: "Failure Reason" },
      { key: "consecutive_failures", label: "Consecutive Failures", type: "number" },
      { key: "risk_flag", label: "Risk Flag", type: "select", options: ["None", "Suspicious", "Brute Force", "Anomaly"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "external",
    label: "14. External / Portal Access",
    endpoint: "external",
    section: "sig",
    columns: [
      { key: "portal_user", header: "Portal User", w: 160 },
      { key: "organization", header: "Organization", w: 160 },
      { key: "access_type", header: "Type", w: 120 },
      { key: "mfa_enabled", header: "MFA", w: 60 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "portal_user", label: "Portal User", req: true },
      { key: "organization", label: "Organization" },
      { key: "access_type", label: "Access Type", type: "select", options: ["Vendor Portal", "Customer Portal", "Supplier Portal", "Partner Portal", "Other"] },
      { key: "modules_granted", label: "Modules Granted", type: "textarea" },
      { key: "granted_date", label: "Granted Date" },
      { key: "expiry_date", label: "Expiry Date" },
      { key: "last_active", label: "Last Active" },
      { key: "mfa_enabled", label: "MFA Enabled", type: "check" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Suspended", "Expired", "Disabled"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "requests",
    label: "15. Access-Request Workflow",
    endpoint: "requests",
    section: "sig",
    columns: [
      { key: "request_id", header: "Req ID", w: 100 },
      { key: "requester", header: "Requester", w: 140 },
      { key: "role_requested", header: "Role", w: 160 },
      { key: "status", header: "Status", w: 100 },
      { key: "submitted_date", header: "Submitted", w: 120 },
    ],
    fields: [
      { key: "request_id", label: "Request ID", req: true },
      { key: "requester", label: "Requester", req: true },
      { key: "requested_for", label: "Requested For" },
      { key: "access_type", label: "Access Type" },
      { key: "role_requested", label: "Role Requested" },
      { key: "business_justification", label: "Business Justification", type: "textarea" },
      { key: "submitted_date", label: "Submitted Date" },
      { key: "approver", label: "Approver" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected", "Implemented", "Cancelled"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  // ── Module Management (16-25) ──────────────────────────────────────────
  {
    key: "dashboard",
    label: "16. Dashboard & KPIs",
    endpoint: "__dashboard__",
    section: "mgmt",
    columns: [],
    fields: [],
  },
  {
    key: "scope",
    label: "17. Scope & Audit Universe",
    endpoint: "scope",
    section: "mgmt",
    columns: [
      { key: "entity_name", header: "Entity", w: 200 },
      { key: "entity_type", header: "Type", w: 120 },
      { key: "in_scope", header: "In Scope", w: 90 },
      { key: "owner", header: "Owner", w: 140 },
      { key: "risk_rating", header: "Risk", w: 80 },
    ],
    fields: [
      { key: "entity_name", label: "Entity Name", req: true },
      { key: "entity_type", label: "Entity Type", type: "select", options: ["System", "Module", "Process", "Report", "Interface"], req: true },
      { key: "in_scope", label: "In Scope", type: "check" },
      { key: "owner", label: "Owner" },
      { key: "last_audited", label: "Last Audited" },
      { key: "risk_rating", label: "Risk Rating", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "rcm",
    label: "18. Risk & Control Matrix",
    endpoint: "rcm",
    section: "mgmt",
    columns: [
      { key: "risk_id", header: "Risk ID", w: 100 },
      { key: "risk_description", header: "Risk", w: 220 },
      { key: "control_id", header: "Control", w: 100 },
      { key: "control_type", header: "Type", w: 100 },
      { key: "frequency", header: "Frequency", w: 100 },
    ],
    fields: [
      { key: "risk_id", label: "Risk ID", req: true },
      { key: "risk_description", label: "Risk Description", type: "textarea", req: true },
      { key: "control_id", label: "Control ID" },
      { key: "control_description", label: "Control Description", type: "textarea" },
      { key: "control_type", label: "Control Type", type: "select", options: ["Preventive", "Detective", "Corrective", "Compensating"] },
      { key: "frequency", label: "Frequency", type: "select", options: ["Continuous", "Daily", "Weekly", "Monthly", "Quarterly", "Annually"] },
      { key: "owner", label: "Owner" },
      { key: "assertion", label: "Assertion" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Under Design"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "rules",
    label: "19. Test & Analytics Rule Library",
    endpoint: "rules",
    section: "mgmt",
    columns: [
      { key: "rule_code", header: "Code", w: 100 },
      { key: "rule_name", header: "Rule Name", w: 200 },
      { key: "category", header: "Category", w: 130 },
      { key: "frequency", header: "Frequency", w: 100 },
      { key: "enabled", header: "On", w: 60 },
    ],
    fields: [
      { key: "rule_code", label: "Rule Code", req: true },
      { key: "rule_name", label: "Rule Name", req: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ["Access Review", "SoD", "Dormant", "Privileged", "Login", "Sensitive Txn", "Custom"] },
      { key: "threshold", label: "Threshold" },
      { key: "frequency", label: "Frequency", type: "select", options: ["Real-Time", "Daily", "Weekly", "Monthly", "Quarterly"] },
      { key: "enabled", label: "Enabled", type: "check" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "datasrc",
    label: "20. Data Source & Connector Setup",
    endpoint: "datasrc",
    section: "mgmt",
    columns: [
      { key: "source_name", header: "Source", w: 180 },
      { key: "source_type", header: "Type", w: 120 },
      { key: "refresh_frequency", header: "Refresh", w: 100 },
      { key: "last_synced", header: "Last Sync", w: 140 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "source_name", label: "Source Name", req: true },
      { key: "source_type", label: "Source Type", type: "select", options: ["ERP Table", "API", "Flat File", "Database View", "BW Query", "Custom"] },
      { key: "connection_string", label: "Connection / Endpoint", type: "textarea" },
      { key: "tables_api", label: "Tables / APIs", type: "textarea" },
      { key: "refresh_frequency", label: "Refresh Frequency", type: "select", options: ["Real-Time", "Hourly", "Daily", "Weekly", "Monthly"] },
      { key: "last_synced", label: "Last Synced" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Error", "Disabled", "Under Setup"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "sampling",
    label: "21. Sampling & Population Builder",
    endpoint: "sampling",
    section: "mgmt",
    columns: [
      { key: "set_name", header: "Set Name", w: 180 },
      { key: "population", header: "Population", w: 160 },
      { key: "population_size", header: "Pop. Size", w: 100 },
      { key: "sample_size", header: "Sample", w: 80 },
      { key: "method", header: "Method", w: 100 },
    ],
    fields: [
      { key: "set_name", label: "Set Name", req: true },
      { key: "population", label: "Population" },
      { key: "population_size", label: "Population Size", type: "number" },
      { key: "sample_size", label: "Sample Size", type: "number" },
      { key: "method", label: "Method", type: "select", options: ["Random", "Stratified", "Systematic", "Judgemental", "Monetary Unit"] },
      { key: "confidence_level", label: "Confidence Level", type: "select", options: ["90%", "95%", "99%"] },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Finalized", "Used"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "exceptions",
    label: "22. Exception & Red-Flag Queue",
    endpoint: "exceptions",
    section: "mgmt",
    columns: [
      { key: "exception_id", header: "ID", w: 100 },
      { key: "title", header: "Title", w: 220 },
      { key: "category", header: "Category", w: 130 },
      { key: "severity", header: "Severity", w: 90 },
      { key: "disposition", header: "Disposition", w: 110 },
    ],
    fields: [
      { key: "exception_id", label: "Exception ID", req: true },
      { key: "title", label: "Title", req: true },
      { key: "category", label: "Category", type: "select", options: ["Access Violation", "SoD Breach", "Dormant Account", "Privileged Misuse", "Policy Deviation", "Other"] },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "source_rule", label: "Source Rule" },
      { key: "affected_user", label: "Affected User" },
      { key: "detected_date", label: "Detected Date" },
      { key: "disposition", label: "Disposition", type: "select", options: ["Open", "Investigating", "Remediated", "Accepted", "False Positive"] },
      { key: "assigned_to", label: "Assigned To" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "papers",
    label: "23. Working Papers & Evidence",
    endpoint: "papers",
    section: "mgmt",
    columns: [
      { key: "paper_id", header: "Paper ID", w: 100 },
      { key: "title", header: "Title", w: 220 },
      { key: "section", header: "Section", w: 140 },
      { key: "prepared_by", header: "Prepared By", w: 130 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "paper_id", label: "Paper ID", req: true },
      { key: "title", label: "Title", req: true },
      { key: "section", label: "Section" },
      { key: "prepared_by", label: "Prepared By" },
      { key: "reviewed_by", label: "Reviewed By" },
      { key: "prepared_date", label: "Prepared Date" },
      { key: "review_date", label: "Review Date" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Under Review", "Reviewed", "Signed Off"] },
      { key: "evidence_refs", label: "Evidence Refs", type: "textarea" },
      { key: "conclusion", label: "Conclusion", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "findings",
    label: "24. Observation & Finding Log",
    endpoint: "findings",
    section: "mgmt",
    columns: [
      { key: "finding_id", header: "Finding ID", w: 110 },
      { key: "title", header: "Title", w: 220 },
      { key: "category", header: "Category", w: 130 },
      { key: "severity", header: "Severity", w: 90 },
      { key: "owner", header: "Owner", w: 130 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "finding_id", label: "Finding ID", req: true },
      { key: "title", label: "Title", req: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ["Access Control", "SoD", "Privileged Access", "Monitoring", "Policy", "Process Gap", "Other"] },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "root_cause", label: "Root Cause", type: "textarea" },
      { key: "recommendation", label: "Recommendation", type: "textarea" },
      { key: "owner", label: "Owner" },
      { key: "raised_date", label: "Raised Date" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Remediated", "Closed", "Accepted"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    key: "remediation",
    label: "25. Remediation / Action Tracker",
    endpoint: "remediation",
    section: "mgmt",
    columns: [
      { key: "action_id", header: "Action ID", w: 110 },
      { key: "title", header: "Title", w: 220 },
      { key: "linked_finding", header: "Finding", w: 130 },
      { key: "owner", header: "Owner", w: 130 },
      { key: "due_date", header: "Due Date", w: 110 },
      { key: "status", header: "Status", w: 100 },
    ],
    fields: [
      { key: "action_id", label: "Action ID", req: true },
      { key: "title", label: "Title", req: true },
      { key: "linked_finding", label: "Linked Finding" },
      { key: "action_type", label: "Action Type", type: "select", options: ["CAPA", "Remediation", "Improvement", "Process Change", "Training"] },
      { key: "owner", label: "Owner" },
      { key: "due_date", label: "Due Date" },
      { key: "assigned_date", label: "Assigned Date" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed", "Overdue", "Deferred"] },
      { key: "retest_date", label: "Retest Date" },
      { key: "retest_result", label: "Retest Result", type: "select", options: ["", "Passed", "Failed", "Partial"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   Re-usable CRUD table+form component for a single sub-page.
   ────────────────────────────────────────────────────────────────────────── */
interface Row {
  id: number;
  [k: string]: unknown;
}

function CrudTab({ tab }: { tab: TabDef }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await get<Row[]>(`/api/modules/${SLUG}/${tab.endpoint}`);
    setRows(data);
    setLoading(false);
  }, [tab.endpoint]);

  useEffect(() => { refresh(); }, [refresh]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await post(`/api/modules/${SLUG}/${tab.endpoint}`, form);
    setForm({});
    setShowForm(false);
    refresh();
  }

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/${tab.endpoint}/${id}`);
    refresh();
  }

  function severityBadge(val: unknown) {
    const v = String(val).toLowerCase();
    if (v === "critical" || v === "high") return "badge-danger";
    if (v === "medium" || v === "open" || v === "overdue") return "badge-gold";
    if (v === "low" || v === "completed" || v === "closed" || v === "active" || v === "passed")
      return "badge-success";
    return "badge-slate";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "var(--slate)", fontSize: 13 }}>
          {rows.length} record{rows.length !== 1 && "s"}
        </span>
        <button className="btn btn-primary" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 20, marginBottom: 18 }} onSubmit={create}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {tab.fields.map((f) => (
              <div key={f.key} className="field" style={f.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
                <label>{f.label}{f.req && " *"}</label>
                {f.type === "select" ? (
                  <select
                    className="select"
                    value={String(form[f.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.req}
                  >
                    <option value="">Select…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === "check" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                    />
                    <span style={{ fontSize: 13 }}>Yes</span>
                  </label>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={2}
                    value={String(form[f.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="input"
                    type={f.type === "number" ? "number" : "text"}
                    value={String(form[f.key] ?? "")}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.req}
                  />
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }}>Save</button>
        </form>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 18, color: "var(--slate)" }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                {tab.columns.map((c) => (
                  <th key={c.key} style={c.w ? { width: c.w } : undefined}>{c.header}</th>
                ))}
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {tab.columns.map((c) => {
                    const val = r[c.key];
                    const isBool = typeof val === "boolean";
                    const isBadge = ["risk_level", "risk_rating", "severity", "criticality", "status", "risk_flag", "disposition", "fit_status", "review_status", "retest_result"].includes(c.key);
                    return (
                      <td key={c.key}>
                        {isBool ? (val ? "Yes" : "No") :
                         isBadge ? <span className={`badge ${severityBadge(val)}`}>{String(val ?? "—")}</span> :
                         String(val ?? "—")}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => remove(r.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={tab.columns.length + 1} style={{ color: "var(--slate)" }}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Dashboard tab — KPI tiles.
   ────────────────────────────────────────────────────────────────────────── */
interface DashboardData {
  roles: number;
  lifecycle_events: number;
  dormant_accounts: number;
  sod_violations: number;
  privileged_accounts: number;
  recert_campaigns: number;
  shared_accounts: number;
  sensitive_txns: number;
  role_fit_records: number;
  login_logs: number;
  external_users: number;
  access_requests: number;
  scope_entries: number;
  rcm_entries: number;
  analytics_rules: number;
  data_sources: number;
  sampling_sets: number;
  exceptions: number;
  working_papers: number;
  findings: number;
  remediation_items: number;
}

const KPI_TILES: { label: string; key: keyof DashboardData; color: string }[] = [
  { label: "Role Definitions", key: "roles", color: "var(--navy)" },
  { label: "Lifecycle Events", key: "lifecycle_events", color: "#2563eb" },
  { label: "Dormant Accounts", key: "dormant_accounts", color: "#dc2626" },
  { label: "SoD Violations", key: "sod_violations", color: "#dc2626" },
  { label: "Privileged Accounts", key: "privileged_accounts", color: "#b8862b" },
  { label: "Recert Campaigns", key: "recert_campaigns", color: "#2563eb" },
  { label: "Shared Accounts", key: "shared_accounts", color: "#b8862b" },
  { label: "Sensitive Txns", key: "sensitive_txns", color: "#dc2626" },
  { label: "Role-Fit Reviews", key: "role_fit_records", color: "#2563eb" },
  { label: "Login Logs", key: "login_logs", color: "#64748b" },
  { label: "External Users", key: "external_users", color: "#b8862b" },
  { label: "Access Requests", key: "access_requests", color: "#2563eb" },
  { label: "Scope Entries", key: "scope_entries", color: "#64748b" },
  { label: "RCM Entries", key: "rcm_entries", color: "#64748b" },
  { label: "Analytics Rules", key: "analytics_rules", color: "#059669" },
  { label: "Data Sources", key: "data_sources", color: "#64748b" },
  { label: "Sampling Sets", key: "sampling_sets", color: "#64748b" },
  { label: "Exceptions", key: "exceptions", color: "#dc2626" },
  { label: "Working Papers", key: "working_papers", color: "#2563eb" },
  { label: "Findings", key: "findings", color: "#dc2626" },
  { label: "Remediation Items", key: "remediation_items", color: "#b8862b" },
];

function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    get<DashboardData>(`/api/modules/${SLUG}/dashboard`).then(setData);
  }, []);

  if (!data) return <p style={{ color: "var(--slate)" }}>Loading dashboard…</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
      {KPI_TILES.map((t) => (
        <div key={t.key} className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: t.color, fontFamily: "var(--font-head)" }}>
            {data[t.key] ?? 0}
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main page component with 25-tab navigation.
   ────────────────────────────────────────────────────────────────────────── */
export default function ErpAccessIamPage() {
  const [active, setActive] = useState("dashboard");

  const sigTabs = TABS.filter((t) => t.section === "sig");
  const mgmtTabs = TABS.filter((t) => t.section === "mgmt");

  const activeTab = TABS.find((t) => t.key === active);

  return (
    <div style={{ display: "flex", gap: 20, minHeight: "calc(100vh - 140px)" }}>
      {/* ── Tab sidebar ──────────────────────────────────────────────── */}
      <nav
        style={{
          width: 260,
          flexShrink: 0,
          overflowY: "auto",
          maxHeight: "calc(100vh - 140px)",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--slate)", padding: "0 10px 6px" }}>
            Signature Checks
          </div>
          {sigTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "7px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: active === t.key ? "var(--navy)" : "transparent",
                color: active === t.key ? "#fff" : "var(--ink)",
                cursor: "pointer",
                marginBottom: 2,
                fontWeight: active === t.key ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--slate)", padding: "8px 10px 6px" }}>
            Module Management
          </div>
          {mgmtTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "7px 10px",
                fontSize: 13,
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: active === t.key ? "var(--navy)" : "transparent",
                color: active === t.key ? "#fff" : "var(--ink)",
                cursor: "pointer",
                marginBottom: 2,
                fontWeight: active === t.key ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {active === "dashboard" ? (
          <DashboardTab />
        ) : activeTab && activeTab.endpoint !== "__dashboard__" ? (
          <CrudTab tab={activeTab} />
        ) : (
          <p style={{ color: "var(--slate)" }}>This sub-page is under development.</p>
        )}
      </div>
    </div>
  );
}
