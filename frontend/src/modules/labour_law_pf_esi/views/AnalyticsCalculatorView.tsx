import React, { useState } from "react";
import { post } from "../../../lib/api";

interface Props {
  subpage: string;
  title: string;
  description: string;
}

export default function AnalyticsCalculatorView({ subpage, title, description }: Props) {
  // Minimum Wages State
  const [wageSite, setWageSite] = useState("Site A - Manufacturing");
  const [employeeCategory, setEmployeeCategory] = useState("Unskilled");
  const [notifiedMinimum, setNotifiedMinimum] = useState(482.0); // Daily rate
  const [actualPaid, setActualPaid] = useState(450.0);
  const [employeeCount, setEmployeeCount] = useState(120);

  // Contractor Verification State
  const [contractorName, setContractorName] = useState("ProShield Security Services");
  const [headcount, setHeadcount] = useState(45);
  const [averageWage, setAverageWage] = useState(15000); // Monthly wage ceiling
  const [actualChallanAmount, setActualChallanAmount] = useState(72900); // 45 * 15000 * 12% = 81000 expected PF
  
  // Success / Status messages
  const [successMessage, setSuccessMessage] = useState("");

  // Common Exception logging function
  const logException = async (ruleViolated: string, severity: string, notes: string) => {
    try {
      await post("/api/v1/labour-compliance/exceptions", {
        sub_page: subpage === "minimum_wages" ? "Minimum Wages Compliance" : "Contractor ESIC/PF Verification",
        rule_violated: ruleViolated,
        severity: severity,
        status: "Open",
        notes: notes,
      });
      setSuccessMessage(`Successfully logged red-flag exception: "${ruleViolated}" to the audit queue!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      alert("Failed to log exception: " + err);
    }
  };

  // Calculations for Minimum Wage
  const wageExpectedTotal = notifiedMinimum * employeeCount;
  const wageActualTotal = actualPaid * employeeCount;
  const wageVariance = wageActualTotal - wageExpectedTotal;
  const wageIsDeficit = actualPaid < notifiedMinimum;
  const wageDeficitTotal = wageIsDeficit ? (notifiedMinimum - actualPaid) * employeeCount : 0;

  // Calculations for Contractor PF
  // Expected PF is 12% of wage (up to wage ceiling)
  const expectedPFPerWorker = averageWage * 0.12;
  const expectedTotalPF = expectedPFPerWorker * headcount;
  const pfVariance = actualChallanAmount - expectedTotalPF;
  const pfIsShortfall = actualChallanAmount < expectedTotalPF;

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.25fr" }}>
      {/* Input Form Column */}
      <div className="card" style={{ padding: 24, height: "fit-content" }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)", marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 20 }}>{description}</p>

        {subpage === "minimum_wages" ? (
          <div>
            <h3 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Audit Configuration
            </h3>
            
            <div className="field">
              <label>Location / Plant Site</label>
              <select className="select" value={wageSite} onChange={(e) => setWageSite(e.target.value)}>
                <option value="Site A - Manufacturing">Site A - Manufacturing</option>
                <option value="Site B - Warehousing">Site B - Warehousing</option>
                <option value="Corp HQ - Services">Corp HQ - Services</option>
              </select>
            </div>

            <div className="field">
              <label>Skill Category</label>
              <select className="select" value={employeeCategory} onChange={(e) => setEmployeeCategory(e.target.value)}>
                <option value="Unskilled">Unskilled Workers</option>
                <option value="Semi-skilled">Semi-Skilled Workers</option>
                <option value="Skilled">Skilled Operations</option>
                <option value="Highly-Skilled">Highly Skilled Technical</option>
              </select>
            </div>

            <div className="field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label>Notified Minimum Wage (Daily)</label>
                <input
                  type="number"
                  className="input"
                  value={notifiedMinimum}
                  onChange={(e) => setNotifiedMinimum(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label>Actual Paid Wage (Daily)</label>
                <input
                  type="number"
                  className="input"
                  value={actualPaid}
                  onChange={(e) => setActualPaid(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="field">
              <label>Audited Employee Count</label>
              <input
                type="number"
                className="input"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 14, color: "var(--navy)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Sub-contractor Challan Upload
            </h3>

            <div className="field">
              <label>Contractor Entity</label>
              <select className="select" value={contractorName} onChange={(e) => setContractorName(e.target.value)}>
                <option value="ProShield Security Services">ProShield Security Services</option>
                <option value="A1 Facility Management">A1 Facility Management</option>
                <option value="QuickLogistics Warehousing">QuickLogistics Warehousing</option>
              </select>
            </div>

            <div className="field">
              <label>Mapped Headcount (Audited Month)</label>
              <input
                type="number"
                className="input"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="field">
              <label>Average Monthly PF-Eligible Wage (Ceiling: 15,000)</label>
              <input
                type="number"
                className="input"
                value={averageWage}
                max={15000}
                onChange={(e) => setAverageWage(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field">
              <label>Actual Challan Deposit Amount (PF/ESIC Proof)</label>
              <input
                type="number"
                className="input"
                value={actualChallanAmount}
                onChange={(e) => setActualChallanAmount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="field" style={{ margin: "20px 0 10px 0" }}>
              <label>Upload Challan Receipt & ECR Sheet</label>
              <div style={{
                border: "2px dashed var(--line)",
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                textAlign: "center",
                background: "var(--canvas)",
                fontSize: 13,
                color: "var(--slate)",
                cursor: "pointer"
              }}>
                📂 Drag & drop or <span style={{ color: "var(--gold)", fontWeight: 600 }}>browse files</span> to upload (.pdf, .xlsx)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Results Column */}
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, color: "var(--navy)", marginBottom: 4 }}>Audit Analytics & Reconciliation</h3>
          <p style={{ fontSize: 13, color: "var(--slate)" }}>Automated rules checking and discrepancy identification.</p>
        </div>

        {successMessage && (
          <div className="alert alert-success" style={{
            background: "var(--success-tint)",
            color: "var(--success)",
            border: "1px solid rgba(18, 128, 92, 0.18)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13.5,
            fontWeight: 600
          }}>
            ✓ {successMessage}
          </div>
        )}

        {subpage === "minimum_wages" ? (
          <>
            {/* Wages Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "var(--navy-tint)", padding: 16, borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 12, color: "var(--slate)", textTransform: "uppercase", fontWeight: 600 }}>Expected Daily Wage</span>
                <h4 style={{ fontSize: 24, color: "var(--navy)", marginTop: 4 }}>₹{notifiedMinimum.toFixed(2)}</h4>
                <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Notified under Wage Code</span>
              </div>
              <div style={{ background: wageIsDeficit ? "var(--danger-tint)" : "var(--success-tint)", padding: 16, borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 12, color: wageIsDeficit ? "var(--danger)" : "var(--success)", textTransform: "uppercase", fontWeight: 600 }}>
                  Actual Paid Wage
                </span>
                <h4 style={{ fontSize: 24, color: wageIsDeficit ? "var(--danger)" : "var(--success)", marginTop: 4 }}>₹{actualPaid.toFixed(2)}</h4>
                <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Payroll average</span>
              </div>
            </div>

            {/* Reconciliation table */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
              <h4 style={{ color: "var(--navy)", fontSize: 14, marginBottom: 12 }}>Detailed Discrepancy Reconciliation</h4>
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Total Audited Employee Headcount</span>
                <strong style={{ fontSize: 14 }}>{employeeCount}</strong>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Expected Total Payroll (Daily)</span>
                <strong style={{ fontSize: 14 }}>₹{wageExpectedTotal.toLocaleString("en-IN")}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Actual Total Payroll Paid (Daily)</span>
                <strong style={{ fontSize: 14 }}>₹{wageActualTotal.toLocaleString("en-IN")}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", color: wageIsDeficit ? "var(--danger)" : "var(--success)" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Daily Variance Deficit</span>
                <strong style={{ fontSize: 15 }}>₹{wageVariance.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Exception Trigger Action */}
            {wageIsDeficit ? (
              <div className="card" style={{ borderColor: "rgba(180, 35, 24, 0.25)", background: "var(--danger-tint)", padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24 }}>🚨</span>
                  <div>
                    <h4 style={{ color: "var(--danger)", fontSize: 14.5, marginBottom: 4 }}>Audit Rule Alert: Minimum Wage Violation</h4>
                    <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 12 }}>
                      The paid wage of <strong>₹{actualPaid}</strong> is lower than the notified statutory minimum of <strong>₹{notifiedMinimum}</strong>. 
                      Estimated daily underpayment risk across {employeeCount} workers is <strong>₹{wageDeficitTotal.toLocaleString("en-IN")}</strong>.
                    </p>
                    <button 
                      className="btn" 
                      onClick={() => logException(
                        "Underpayment of Statutory Minimum Wages", 
                        "High", 
                        `Site: ${wageSite}, Category: ${employeeCategory}. Paid rate ₹${actualPaid} vs Statutory rate ₹${notifiedMinimum}. Est daily deficit: ₹${wageDeficitTotal}.`
                      )}
                      style={{ background: "var(--danger)", color: "#fff", padding: "8px 14px", fontSize: 12.5 }}
                    >
                      Log High-Risk Exception to Queue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ borderColor: "rgba(18, 128, 92, 0.25)", background: "var(--success-tint)", padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>✓</span>
                  <div>
                    <h4 style={{ color: "var(--success)", fontSize: 14.5, marginBottom: 2 }}>Wages Compliance Check Passed</h4>
                    <p style={{ color: "var(--slate)", fontSize: 13 }}>
                      Paid wage rates equal or exceed the statutory minimums for {employeeCategory} workers at {wageSite}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Contractor PF Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "var(--navy-tint)", padding: 16, borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 12, color: "var(--slate)", textTransform: "uppercase", fontWeight: 600 }}>Expected PF Challan (12%)</span>
                <h4 style={{ fontSize: 24, color: "var(--navy)", marginTop: 4 }}>₹{expectedTotalPF.toLocaleString("en-IN")}</h4>
                <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Calculated on {headcount} workers</span>
              </div>
              <div style={{ background: pfIsShortfall ? "var(--danger-tint)" : "var(--success-tint)", padding: 16, borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 12, color: pfIsShortfall ? "var(--danger)" : "var(--success)", textTransform: "uppercase", fontWeight: 600 }}>
                  Actual Deposited Challan
                </span>
                <h4 style={{ fontSize: 24, color: pfIsShortfall ? "var(--danger)" : "var(--success)", marginTop: 4 }}>₹{actualChallanAmount.toLocaleString("en-IN")}</h4>
                <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>From uploaded receipt proof</span>
              </div>
            </div>

            {/* Reconciliation table */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
              <h4 style={{ color: "var(--navy)", fontSize: 14, marginBottom: 12 }}>Challan Remittance Audit Details</h4>
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Audited Subcontractor Agency</span>
                <strong style={{ fontSize: 14 }}>{contractorName}</strong>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Reported Contractor Headcount</span>
                <strong style={{ fontSize: 14 }}>{headcount} workers</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span style={{ color: "var(--slate)", fontSize: 13.5 }}>Expected Remittance (PF and Admin charges)</span>
                <strong style={{ fontSize: 14 }}>₹{expectedTotalPF.toLocaleString("en-IN")}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", color: pfIsShortfall ? "var(--danger)" : "var(--success)" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Remittance Variance</span>
                <strong style={{ fontSize: 15 }}>₹{pfVariance.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Exception Trigger Action */}
            {pfIsShortfall ? (
              <div className="card" style={{ borderColor: "rgba(180, 35, 24, 0.25)", background: "var(--danger-tint)", padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24 }}>🚨</span>
                  <div>
                    <h4 style={{ color: "var(--danger)", fontSize: 14.5, marginBottom: 4 }}>Audit Rule Alert: ECR Remittance Shortfall</h4>
                    <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 12 }}>
                      The actual challan deposit of <strong>₹{actualChallanAmount.toLocaleString("en-IN")}</strong> is lower than the expected contribution of <strong>₹{expectedTotalPF.toLocaleString("en-IN")}</strong> for {headcount} workers. 
                      Remittance deficit of <strong>₹{Math.abs(pfVariance).toLocaleString("en-IN")}</strong> detected.
                    </p>
                    <button 
                      className="btn" 
                      onClick={() => logException(
                        "Contractor Social Security Under-deposit", 
                        "Medium", 
                        `Contractor: ${contractorName}, Mapped Headcount: ${headcount}. Challan ₹${actualChallanAmount} vs Expected ₹${expectedTotalPF}. Deficit: ₹${Math.abs(pfVariance)}.`
                      )}
                      style={{ background: "var(--danger)", color: "#fff", padding: "8px 14px", fontSize: 12.5 }}
                    >
                      Log Under-Deposit Exception to Queue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ borderColor: "rgba(18, 128, 92, 0.25)", background: "var(--success-tint)", padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>✓</span>
                  <div>
                    <h4 style={{ color: "var(--success)", fontSize: 14.5, marginBottom: 2 }}>Remittance Audit Passed</h4>
                    <p style={{ color: "var(--slate)", fontSize: 13 }}>
                      Challan deposit amount meets or exceeds expected contribution requirements for {contractorName}'s workers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
