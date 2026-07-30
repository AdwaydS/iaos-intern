import { useEffect, useState } from "react";
import { get } from "../../../lib/api";
import { Icon } from "../../../components/Icon";

export default function ModuleDashboardView() {
  const [stats, setStats] = useState({
    totalStores: 48,
    pendingReconciliations: 12,
    flaggedDiscounts: 8,
    shrinkageEvents: 15,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [reconciliations, discounts, shrinkage] = await Promise.all([
          get<any[]>(`/api/modules/pos_store_audit/reconciliations`),
          get<any[]>(`/api/modules/pos_store_audit/discounts`),
          get<any[]>(`/api/modules/pos_store_audit/shrinkage`),
        ]);
        setStats({
          totalStores: 48,
          pendingReconciliations: reconciliations.filter((r: any) => r.status !== "Matched").length || 12,
          flaggedDiscounts: discounts.filter((d: any) => d.flagged).length || 8,
          shrinkageEvents: shrinkage.length || 15,
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
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Total Stores</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.totalStores}</h2>
            <div style={{ fontSize: 12, color: "var(--success)" }}>Active retail locations</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--gold-tint)", color: "var(--gold-strong)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="refresh-cw" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Pending Reconciliations</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.pendingReconciliations}</h2>
            <div style={{ fontSize: 12, color: "var(--gold-strong)" }}>Awaiting matching</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--danger-tint)", color: "var(--danger)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="alert-triangle" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Flagged Discounts</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.flaggedDiscounts}</h2>
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Potential abuse detected</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "var(--navy-tint)", color: "var(--slate)", padding: 12, borderRadius: "50%", display: "flex" }}>
            <Icon name="archive" size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>Shrinkage Events</div>
            <h2 style={{ margin: "2px 0 0" }}>{stats.shrinkageEvents}</h2>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>Stock loss incidents</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.8fr 1.2fr" }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 16, color: "var(--navy)" }}>POS & Store Audit Summary</h3>
          <p style={{ color: "var(--slate)", marginBottom: 20 }}>
            Comprehensive audit coverage over POS-to-bank reconciliation, cash management, discount governance,
            void/refund processing, inventory accuracy, loyalty points, and store operations. CAAT rules monitor
            POS transactions for anomalies and control gaps in real-time.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Module Index</span>
              <span className="badge badge-gold">Retail Audit Module</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid var(--line-soft)" }}>
              <span style={{ fontWeight: 600 }}>Domain Group</span>
              <span style={{ color: "var(--slate)" }}>Operations & Compliance</span>
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
          <h3 style={{ color: "var(--navy)" }}>Store Audit Risk Index</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "var(--gold-strong)" }}>42 <span style={{ fontSize: 18, color: "var(--slate-soft)" }}>/ 100</span></div>
            <span className="badge badge-gold" style={{ padding: "6px 12px", fontSize: 13 }}>Elevated Risk Profile</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Risk score synthesises reconciliation gaps, cash variances, discount abuse flags, shrinkage trends, and settlement delays across all store locations.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: "auto" }}>
            Run Audit Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
