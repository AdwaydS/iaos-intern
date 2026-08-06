import React, { useEffect, useState } from "react";
import { get, post, put, del } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

// Presets driven by subpage ID
const CHECKLIST_PRESETS: Record<string, { title: string; identifier: string; status: string; date_value: string }[]> = {
  applicability_mapping: [
    { title: "Factories Act, 1948", identifier: "Site A - Plant Operations", status: "Active", date_value: "2026-07-01" },
    { title: "Shops & Establishments Act", identifier: "Corporate Office", status: "Active", date_value: "2026-07-01" },
    { title: "Contract Labour (R&A) Act", identifier: "All Warehouses", status: "Active", date_value: "2026-07-01" },
    { title: "EPF & MP Act, 1952", identifier: "All Entities", status: "Active", date_value: "2026-07-01" },
    { title: "ESI Act, 1948", identifier: "Registered Branches", status: "Active", date_value: "2026-07-01" },
    { title: "Payment of Gratuity Act", identifier: "All Entities", status: "Active", date_value: "2026-07-01" },
    { title: "Minimum Wages Act", identifier: "All Locations", status: "Active", date_value: "2026-07-01" },
  ],
  statutory_register: [
    { title: "Form A - Employee Register", identifier: "HR Dept", status: "Compliant", date_value: "2026-06-30" },
    { title: "Form B - Wage Register", identifier: "Finance / Payroll", status: "Compliant", date_value: "2026-06-30" },
    { title: "Form C - Register of Loans/Recoveries", identifier: "Finance / Payroll", status: "Pending Audit", date_value: "2026-06-30" },
    { title: "Form D - Attendance Register", identifier: "Security Gate & Bio-metric", status: "Compliant", date_value: "2026-06-30" },
    { title: "Form E - Leave Register", identifier: "HR System", status: "Compliant", date_value: "2026-06-30" },
  ],
  licence_tracker: [
    { title: "Factory Licence - Site A", identifier: "FAC-3940293", status: "Active", date_value: "2027-03-31" },
    { title: "S&E Registration - Corp Office", identifier: "SE-9403920", status: "Active", date_value: "2028-12-31" },
    { title: "CLRA Principal Employer Registration", identifier: "CLRA-PE-940", status: "Active", date_value: "2027-06-30" },
    { title: "Fire Safety NOC", identifier: "FIRE-2026-A", status: "Pending Renewal", date_value: "2026-08-15" },
    { title: "Boiler License - Plant B", identifier: "BOIL-994", status: "Expired", date_value: "2026-05-10" },
  ],
  contract_labour: [
    { title: "Form V (Certificate of Principal Employer)", identifier: "Contractor ABC", status: "Issued", date_value: "2026-04-12" },
    { title: "Form VI-B (Notice of Commencement by Contractor)", identifier: "Contractor XYZ", status: "Filed", date_value: "2026-05-20" },
    { title: "CLRA Principal Employer Annual Return", identifier: "Form XXI", status: "Compliant", date_value: "2026-02-15" },
    { title: "Contractor Licence Verification", identifier: "Security Agency", status: "Active", date_value: "2027-01-10" },
  ],
  pf_esi_coverage: [
    { title: "EPF Monthly Contribution Filing (ECR)", identifier: "June 2026", status: "Compliant", date_value: "2026-07-15" },
    { title: "ESIC Monthly E-Challan Deposit", identifier: "June 2026", status: "Compliant", date_value: "2026-07-15" },
    { title: "Form 11 (PF Excluded Employee Declarations)", identifier: "FY 2026-27", status: "Audited", date_value: "2026-06-01" },
    { title: "Form 5/10 (Filing of Joiners/Exiters)", identifier: "Q1 filings", status: "Pending", date_value: "2026-07-25" },
  ],
  bonus_gratuity: [
    { title: "Form A - Register of Bonus Paid", identifier: "FY 2025-26", status: "Compliant", date_value: "2025-11-30" },
    { title: "Form B - Register of Set-on / Set-off", identifier: "Bonus Act", status: "Compliant", date_value: "2025-11-30" },
    { title: "Form C - Payment details to Inspector", identifier: "Filing", status: "Compliant", date_value: "2025-12-15" },
    { title: "Form F - Gratuity Nominations Collection", identifier: "All Employees", status: "Under Review", date_value: "2026-06-30" },
  ],
  working_hours_ot: [
    { title: "Form I - Register of Overtime (OT)", identifier: "All Sites", status: "Audited", date_value: "2026-06-30" },
    { title: "Double Employment Checks", identifier: "Attendance Sync", status: "Compliant", date_value: "2026-07-01" },
    { title: "Adult Worker Hours Limitation Map", identifier: "Factories Act", status: "Compliant", date_value: "2026-07-01" },
    { title: "Weekly Off Verification Logs", identifier: "Operations", status: "Action Required", date_value: "2026-07-10" },
  ],
  posh_compliance: [
    { title: "Internal Committee (IC) Constitution", identifier: "Corp Office & Plants", status: "Compliant", date_value: "2026-01-05" },
    { title: "POSH Employee Sensitization Training", identifier: "Annual Session", status: "Compliant", date_value: "2026-05-18" },
    { title: "POSH Annual Return Submission", identifier: "Form VII", status: "Filed", date_value: "2026-01-31" },
    { title: "IC Meeting Register & Case Log", identifier: "Q1 Logs", status: "Audited", date_value: "2026-04-10" },
  ],
  lwf_compliance: [
    { title: "LWF Deductions Verification", identifier: "Half-Yearly (June)", status: "Compliant", date_value: "2026-06-30" },
    { title: "LWF Contribution E-Challan Deposit", identifier: "LWF Board", status: "Filed", date_value: "2026-07-15" },
    { title: "Form A - Register of LWF Deductions", identifier: "Payroll", status: "Compliant", date_value: "2026-06-30" },
  ],
  return_filing: [
    { title: "Unified Annual Return (Central)", identifier: "Form III", status: "Filed", date_value: "2026-02-01" },
    { title: "PF Annual Return Filing", identifier: "Form 3A / 6A", status: "Filed", date_value: "2026-04-25" },
    { title: "ESIC Half-Yearly Return", identifier: "Form 5", status: "Filed", date_value: "2026-05-12" },
    { title: "Professional Tax Annual Return", identifier: "Form VIII", status: "Pending", date_value: "2026-07-31" },
  ],
  inspection_notice: [
    { title: "Factory Inspector Visit - Site A", identifier: "Notice No. 3940", status: "Under Review", date_value: "2026-06-12" },
    { title: "PF Inspector Audit Notice", identifier: "Notice No. 883A", status: "Action Required", date_value: "2026-07-02" },
    { title: "Labour Inspector Inspection Book Log", identifier: "Form 28 Entry", status: "Resolved", date_value: "2026-03-15" },
  ],
  wage_code_readiness: [
    { title: "Wage Restructuring Impact Study", identifier: "50% Allowance Rule", status: "Completed", date_value: "2026-05-01" },
    { title: "Basic Pay Compliance Adjustment Audit", identifier: "Wage Code", status: "Under Review", date_value: "2026-06-15" },
    { title: "Gratuity Liability Recalculation Projection", identifier: "Finance Projection", status: "Pending", date_value: "2026-08-30" },
  ],
  contract_worker_master: [
    { title: "KYC and Aadhar Verification Audits", identifier: "All Contractors", status: "Compliant", date_value: "2026-07-01" },
    { title: "Sub-Contractor License Checks", identifier: "CLRA Compliance", status: "Compliant", date_value: "2026-07-01" },
    { title: "PF/ESI Wage Cap Ceiling Assessments", identifier: "Eligibility Check", status: "Action Required", date_value: "2026-07-10" },
  ]
};

interface RegistryItem {
  id: number;
  registry_type: string;
  title: string;
  identifier: string;
  status: string;
  date_value: string;
  remarks: string;
}

interface ViewProps {
  subpage: string;
  title: string;
  description: string;
  registryType: "APPLICABILITY" | "LICENCE" | "REGISTERS" | "NOTICES";
  labels: {
    identifier: string;
    date: string;
    statusOptions: string[];
  };
}

export default function ComplianceRegistryView({ subpage, title, description, registryType, labels }: ViewProps) {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formIdentifier, setFormIdentifier] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formDateValue, setFormDateValue] = useState("");
  const [formRemarks, setFormRemarks] = useState("");

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await get<RegistryItem[]>(`/api/v1/labour-compliance/registry/${registryType}`);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    resetForm();
  }, [subpage]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormIdentifier("");
    setFormStatus(labels.statusOptions[0] || "Pending");
    setFormDateValue("");
    setFormRemarks("");
  };

  const handleEditClick = (item: RegistryItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormIdentifier(item.identifier);
    setFormStatus(item.status);
    setFormDateValue(item.date_value);
    setFormRemarks(item.remarks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle,
      identifier: formIdentifier,
      status: formStatus,
      date_value: formDateValue,
      remarks: formRemarks,
    };

    try {
      if (editingId !== null) {
        await put(`/api/v1/labour-compliance/registry/${registryType}/${editingId}`, payload);
      } else {
        await post(`/api/v1/labour-compliance/registry/${registryType}`, payload);
      }
      resetForm();
      refreshData();
    } catch (err) {
      alert("Error saving record: " + err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this compliance record?")) return;
    try {
      await del(`/api/v1/labour-compliance/registry/${registryType}/${id}`);
      refreshData();
    } catch (err) {
      alert("Error deleting record: " + err);
    }
  };

  const seedChecklist = async () => {
    const presets = CHECKLIST_PRESETS[subpage];
    if (!presets) return;
    setLoading(true);
    try {
      for (const preset of presets) {
        await post(`/api/v1/labour-compliance/registry/${registryType}`, {
          title: preset.title,
          identifier: preset.identifier,
          status: preset.status,
          date_value: preset.date_value,
          remarks: "",
        });
      }
      refreshData();
    } catch (err) {
      alert("Seeding failed: " + err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (it) =>
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (["active", "compliant", "resolved", "filed", "issued"].includes(s)) return "badge-success";
    if (["pending", "pending audit", "under review", "pending renewal"].includes(s)) return "badge-gold";
    if (["expired", "non-compliant", "action required", "critical"].includes(s)) return "badge-danger";
    return "badge-slate";
  };

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.75fr 1fr" }}>
      {/* Table Side */}
      <div className="card" style={{ display: "flex", flexDirection: "column", height: "fit-content" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 4 }}>{title}</h2>
              <p style={{ fontSize: 13.5, color: "var(--slate)" }}>{description}</p>
            </div>
            {items.length === 0 && !loading && (
              <button className="btn btn-gold" onClick={seedChecklist} style={{ padding: "8px 14px", fontSize: 13 }}>
                <Icon name="plus" size={15} /> Seed Defaults
              </button>
            )}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                className="input"
                style={{ paddingLeft: 34, fontSize: 14 }}
                placeholder="Search checklist items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span style={{ position: "absolute", left: 10, top: 12, color: "var(--slate-soft)" }}>🔍</span>
            </div>
            <button className="btn btn-ghost" onClick={refreshData} style={{ padding: "10px 14px" }} title="Reload">
              🔄
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>Loading registry checklist...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Compliance Item</th>
                  <th>{labels.identifier}</th>
                  <th>Status</th>
                  <th>{labels.date}</th>
                  <th>Remarks / Audit Evidence</th>
                  <th style={{ width: 100, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it) => (
                  <tr key={it.id}>
                    <td style={{ fontWeight: 600, color: "var(--navy)" }}>{it.title}</td>
                    <td>{it.identifier || "—"}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(it.status)}`}>{it.status}</span>
                    </td>
                    <td>{it.date_value || "—"}</td>
                    <td style={{ color: "var(--slate)", fontSize: 13 }}>{it.remarks || "—"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 8px", marginRight: 6, border: "none", background: "none" }}
                        onClick={() => handleEditClick(it)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 8px", color: "var(--danger)", border: "none", background: "none" }}
                        onClick={() => handleDelete(it.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--slate)" }}>
                      No compliance records found. Try seeding defaults or adding a new record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Side */}
      <form className="card" style={{ padding: 24, height: "fit-content", position: "sticky", top: 24 }} onSubmit={handleSubmit}>
        <h3 style={{ color: "var(--navy)", marginBottom: 18, fontSize: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
          {editingId !== null ? "Edit Compliance Item" : "Create Compliance Record"}
        </h3>
        
        <div className="field">
          <label>Title / Description</label>
          <input
            className="input"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Factories Act, 1948"
            required
          />
        </div>

        <div className="field">
          <label>{labels.identifier}</label>
          <input
            className="input"
            value={formIdentifier}
            onChange={(e) => setFormIdentifier(e.target.value)}
            placeholder={`e.g. ${labels.identifier === "Licence Number" ? "LIC-12345" : "All Locations"}`}
          />
        </div>

        <div className="field">
          <label>Filing / Audit Status</label>
          <select className="select" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
            {labels.statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{labels.date}</label>
          <input
            type="date"
            className="input"
            value={formDateValue}
            onChange={(e) => setFormDateValue(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Auditor Notes / Audit Remarks</label>
          <textarea
            className="input"
            rows={3}
            style={{ resize: "vertical" }}
            value={formRemarks}
            onChange={(e) => setFormRemarks(e.target.value)}
            placeholder="Document evidence reference, auditor tickmarks, or observations..."
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {editingId !== null ? "Update" : "Add Record"}
          </button>
          {editingId !== null && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
