import { useState } from "react";

export default function ExceptionQueueView() {
  const [exceptions] = useState([
    { code: "EX-POS-01", anomaly: "POS sales mismatch with bank credit for Downtown Store on 15-Mar", store: "Downtown Store", date: "15-Mar-2026", severity: "Critical", status: "New" },
    { code: "EX-POS-02", anomaly: "Cash till shortage of 1,200 detected at Uptown Store end-of-day count", store: "Uptown Store", date: "14-Mar-2026", severity: "Major", status: "Under Review" },
    { code: "EX-POS-03", anomaly: "Discount override of 35% without tier-2 approval at Mall Store", store: "Mall Store", date: "13-Mar-2026", severity: "Major", status: "Under Review" },
    { code: "EX-POS-04", anomaly: "Loyalty points accrual anomaly for customer LOY-00987 — 18% accrual rate", store: "Downtown Store", date: "12-Mar-2026", severity: "Minor", status: "Resolved" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Exception Queue</h3>
        <p style={{ color: "var(--slate)" }}>
          CAAT-flagged exceptions and anomalies requiring investigation and resolution.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Exception ID</th>
              <th>Anomaly Description</th>
              <th>Store</th>
              <th>Date</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((e) => (
              <tr key={e.code}>
                <td><strong>{e.code}</strong></td>
                <td>{e.anomaly}</td>
                <td>{e.store}</td>
                <td>{e.date}</td>
                <td>
                  <span className={`badge ${e.severity === "Critical" ? "badge-danger" : e.severity === "Major" ? "badge-gold" : "badge-success"}`}>
                    {e.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${e.status === "New" ? "badge-danger" : e.status === "Under Review" ? "badge-gold" : "badge-success"}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
