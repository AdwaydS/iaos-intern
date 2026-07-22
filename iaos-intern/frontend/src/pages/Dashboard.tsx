import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { get } from "../lib/api";
import type { PlatformStats } from "../lib/types";
import { groupModules, modulesForRole } from "../modules/registry";
import { Icon, type IconName } from "../components/Icon";
import "./dashboard.css";

export default function Dashboard() {
  const { user, tenant } = useAuth();
  if (!user) return null;

  if (user.role === "super_admin") return <PlatformOverview name={user.full_name} />;

  const modules = modulesForRole(user.role);
  const groups = groupModules(modules);
  return (
    <div>
      <div className="page-head">
        <h1>Welcome, {user.full_name.split(" ")[0]}.</h1>
        <p>
          Your {tenant?.name ?? "organization"} audit workspace ·{" "}
          {modules.length} modules across {groups.length} suites.
        </p>
      </div>

      {modules.length === 0 && (
        <div className="card empty-card">
          <h3>No modules yet</h3>
          <p>Modules appear here as they are shipped.</p>
        </div>
      )}

      <div className="group-sections">
        {groups.map((g) => (
          <section key={g.name} className="card group-card">
            <div className="group-card-head">
              <span className="group-card-icon">
                <Icon name={g.icon} size={19} />
              </span>
              <h3>{g.name}</h3>
              <span className="group-card-count">{g.modules.length}</span>
            </div>
            <div className="group-card-links">
              {g.modules.map((m) => (
                <Link
                  key={m.slug}
                  to={`/app/m/${m.slug}`}
                  className="module-chip"
                >
                  {m.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Super admin overview (stats) ─────────────────────── */
const STAT_CARDS: {
  key: keyof PlatformStats;
  label: string;
  icon: IconName;
  tone: string;
}[] = [
  { key: "total_tenants", label: "Organizations", icon: "building", tone: "navy" },
  { key: "active_tenants", label: "Active tenants", icon: "check", tone: "success" },
  { key: "total_users", label: "Total users", icon: "users", tone: "gold" },
  { key: "active_users", label: "Active users", icon: "user-check", tone: "success" },
];

function PlatformOverview({ name }: { name: string }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get<PlatformStats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="page-head">
        <h1>Platform overview</h1>
        <p>Monitor every organization and account across Cap Corporate.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stat-grid">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className="card stat-card">
            <div className={`stat-icon tone-${c.tone}`}>
              <Icon name={c.icon} size={20} />
            </div>
            <div className="stat-body">
              <span className="stat-value">
                {stats ? (stats[c.key] as number) : "—"}
              </span>
              <span className="stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-cols">
        <div className="card">
          <div className="card-head">
            <h3>Recent organizations</h3>
            <Link to="/app/admin" className="card-link">
              Manage <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Users</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_tenants.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.name}</strong>
                    <div className="muted-sub">/{t.slug}</div>
                  </td>
                  <td>{t.user_count}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.is_active ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {t.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                </tr>
              ))}
              {stats && stats.recent_tenants.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted-sub">
                    No organizations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card breakdown">
          <div className="card-head">
            <h3>User breakdown</h3>
          </div>
          <div className="breakdown-rows">
            <BreakdownRow
              icon="settings"
              label="Tenant admins"
              value={stats?.tenant_admins}
            />
            <BreakdownRow
              icon="briefcase"
              label="Auditors"
              value={stats?.auditors}
            />
            <BreakdownRow
              icon="building"
              label="Suspended tenants"
              value={stats?.suspended_tenants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value?: number;
}) {
  return (
    <div className="breakdown-row">
      <span className="breakdown-icon">
        <Icon name={icon} size={17} />
      </span>
      <span className="breakdown-label">{label}</span>
      <span className="breakdown-value">{value ?? "—"}</span>
    </div>
  );
}
