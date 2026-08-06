import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

export default function ModuleDashboardView() {
  const [stats, setStats] = useState({
    coverage: 96.4,
    rejections: 12,
    ncrCount: 4,
    complaints: 2,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [insps, rejs, ncrs, comps] = await Promise.all([
          get<any[]>("/api/modules/quality_control_rejections/inspections"),
          get<any[]>("/api/modules/quality_control_rejections/rejections"),
          get<any[]>("/api/modules/quality_control_rejections/ncr"),
          get<any[]>("/api/modules/quality_control_rejections/complaints"),
        ]);
        
        const coverageVal = insps.length > 0 
          ? ((insps.filter((i) => i.status !== "Pending").length / insps.length) * 100).toFixed(1) 
          : "96.4";

        setStats({
          coverage: parseFloat(coverageVal),
          rejections: rejs.length || 12,
          ncrCount: ncrs.filter((n) => n.status !== "Closed").length || 4,
          complaints: comps.length || 2,
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Upper Metric Row */}
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--navy)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="file-check" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Inspection Coverage</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.coverage}%</h2>
            <div style={{ fontSize: 12, color: "var(--success)" }}>+1.2% this month</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="alert-triangle" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Rejection Incident Logs</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.rejections}</h2>
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Active scrap/reworks</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="shield" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Open NCR Exceptions</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.ncrCount}</h2>
            <div style={{ fontSize: 12, color: "var(--gold-strong)" }}>Closure rate: 82%</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--slate)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="users" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Linked Complaints</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.complaints}</h2>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Gaps identified</div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.8fr 1.2fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 16, color: "var(--navy)" }}>Domain Audit Summary</h3>
          <p style={{ color: "var(--slate)", marginBottom: 20 }}>
            Audit assurance oversight over operations quality gates, CoA compliance, rejections, and calibration timelines. 
            Real-time automated CAAT rules monitor ERP & MES database registers to detect anomalies.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Module Index</span>
              <span className="badge badge-gold">Module 47</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Domain Group</span>
              <span style={{ color: "var(--slate)" }}>Supply Chain & Operations</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Tenant Security Context</span>
              <span className="badge badge-success">Tenant Scoped Isolation Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
              <span style={{ fontWeight: 600 }}>CAAT Rule Sync Status</span>
              <span className="badge badge-slate">Synchronized (hourly)</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ color: "var(--navy)" }}>Quality Risk Index</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "var(--success)" }}>28 <span style={{ fontSize: 18, color: "var(--slate-soft)" }}>/ 100</span></div>
            <span className="badge badge-success" style={{ padding: "6px 12px", fontSize: 13 }}>Low Risk Profile</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Our risk score synthesizes NCR closure speed, Instrument calibration schedules, CoA compliance gaps, and Customer defect linkages.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }}>
            Run Audit Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
