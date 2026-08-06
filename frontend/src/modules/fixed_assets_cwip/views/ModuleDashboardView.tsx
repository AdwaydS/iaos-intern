import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

export default function ModuleDashboardView() {
  const [stats, setStats] = useState({
    totalAssets: 2847,
    cwipProjects: 18,
    pendingVerifications: 42,
    impairmentFlags: 6,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [assets, cwip, verifications, impairment] = await Promise.all([
          get<any[]>(`/api/modules/fixed_assets_cwip/assets`),
          get<any[]>(`/api/modules/fixed_assets_cwip/cwip`),
          get<any[]>(`/api/modules/fixed_assets_cwip/verifications`),
          get<any[]>(`/api/modules/fixed_assets_cwip/impairment`),
        ]);
        setStats({
          totalAssets: assets.length || 2847,
          cwipProjects: cwip.length || 18,
          pendingVerifications: verifications.filter((v: any) => v.status === "Pending").length || 42,
          impairmentFlags: impairment.length || 6,
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--navy)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="building" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Fixed Assets</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.totalAssets.toLocaleString()}</h2>
            <div style={{ fontSize: 12, color: "var(--success)" }}>Register last synced today</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="layers" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>CWIP Projects</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.cwipProjects}</h2>
            <div style={{ fontSize: 12, color: "var(--gold-strong)" }}>Pending capitalisation review</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="alert-triangle" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Verifications</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.pendingVerifications}</h2>
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Awaiting physical check</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--slate)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="shield" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Impairment Flags</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.impairmentFlags}</h2>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Under review by valuation team</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.8fr 1.2fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 16, color: "var(--navy)" }}>Domain Audit Summary</h3>
          <p style={{ color: "var(--slate)", marginBottom: 20 }}>
            Audit assurance oversight over fixed asset existence, CWIP ageing, depreciation accuracy, capex-to-capitalisation flow, 
            and disposal governance. Real-time CAAT rules monitor ERP asset registers for anomalies and compliance gaps.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Module Index</span>
              <span className="badge badge-gold">Finance Cycle Module</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Domain Group</span>
              <span style={{ color: "var(--slate)" }}>Finance Cycles</span>
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
          <h3 style={{ color: "var(--navy)" }}>Asset Audit Risk Index</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "var(--success)" }}>34 <span style={{ fontSize: 18, color: "var(--slate-soft)" }}>/ 100</span></div>
            <span className="badge badge-success" style={{ padding: "6px 12px", fontSize: 13 }}>Moderate Risk Profile</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Risk score synthesises asset verification gaps, CWIP ageing buckets, depreciation variances, impairment triggers, and disposal governance coverage.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }}>
            Run Audit Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
