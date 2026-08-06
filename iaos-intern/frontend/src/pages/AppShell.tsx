import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { groupModules, modulesForRole } from "../modules/registry";
import "./shell.css";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  tenant_admin: "Tenant Admin",
  auditor: "Auditor",
};

export default function AppShell() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const isSuper = user.role === "super_admin";
  const isAdmin = isSuper || user.role === "tenant_admin";
  const modules = isSuper ? [] : modulesForRole(user.role);
  const groups = useMemo(() => groupModules(modules), [modules]);

  // Which module is open right now → expand its group by default.
  const activeSlug = location.pathname.startsWith("/app/m/")
    ? location.pathname.split("/app/m/")[1]
    : null;
  const activeGroup = modules.find((m) => m.slug === activeSlug)?.group ?? null;

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (name: string) =>
    open[name] ?? (name === activeGroup);
  const toggle = (name: string) =>
    setOpen((o) => ({ ...o, [name]: !isOpen(name) }));

  return (
    <div className="shell">
      <aside className="shell-side">
        <div className="shell-logo">
          <Logo size={30} />
        </div>

        <div className="shell-context">
          <span className="shell-context-label">
            {isSuper ? "Platform" : "Workspace"}
          </span>
          <strong>{tenant?.name ?? "Cap Corporate"}</strong>
        </div>

        <nav className="shell-nav">
          <NavLink to="/app" end className="shell-link">
            <Icon name={isSuper ? "trending-up" : "dashboard"} size={19} />
            {isSuper ? "Overview" : "Dashboard"}
          </NavLink>

          {isAdmin && (
            <NavLink to="/app/admin" className="shell-link">
              <Icon name="users" size={19} />
              {isSuper ? "User Management" : "Team & Users"}
            </NavLink>
          )}

          {!isSuper && (
            <>
              <div className="shell-nav-heading">Modules</div>
              {groups.length === 0 && (
                <span className="shell-empty">No modules installed yet</span>
              )}
              {groups.map((g) => (
                <div key={g.name} className="shell-group">
                  <button
                    className="shell-group-head"
                    onClick={() => toggle(g.name)}
                    aria-expanded={isOpen(g.name)}
                  >
                    <Icon name={g.icon} size={18} />
                    <span className="shell-group-name">{g.name}</span>
                    <span className="shell-group-count">{g.modules.length}</span>
                    <Icon
                      name="chevron-right"
                      size={15}
                      className={`shell-chevron ${
                        isOpen(g.name) ? "is-open" : ""
                      }`}
                    />
                  </button>

                  {isOpen(g.name) && (
                    <div className="shell-group-body">
                      {g.name === "Industry Packs"
                        ? renderIndustry(g.modules)
                        : g.modules.map((m) => (
                            <NavLink
                              key={m.slug}
                              to={`/app/m/${m.slug}`}
                              className="shell-sublink"
                            >
                              {m.title}
                            </NavLink>
                          ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="shell-user">
          <div className="shell-avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="shell-user-meta">
            <strong>{user.full_name}</strong>
            <span>{ROLE_LABEL[user.role]}</span>
          </div>
          <button
            className="shell-logout"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}

/** Industry Packs → grouped by industry sub-header. */
function renderIndustry(mods: { slug: string; title: string; industry?: string }[]) {
  const byInd = new Map<string, typeof mods>();
  for (const m of mods) {
    const k = m.industry ?? "General";
    (byInd.get(k) ?? byInd.set(k, []).get(k)!).push(m);
  }
  return [...byInd.entries()].map(([ind, list]) => (
    <div key={ind} className="shell-ind">
      <div className="shell-ind-head">{ind}</div>
      {list.map((m) => (
        <NavLink
          key={m.slug}
          to={`/app/m/${m.slug}`}
          className="shell-sublink"
        >
          {m.title}
        </NavLink>
      ))}
    </div>
  ));
}
