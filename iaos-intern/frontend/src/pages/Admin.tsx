import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { get, patch, post } from "../lib/api";
import type { TenantStats, User } from "../lib/types";

export default function Admin() {
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";
  const [tab, setTab] = useState<"tenants" | "users">(
    isSuper ? "tenants" : "users"
  );

  return (
    <div>
      <div className="page-head">
        <h1>{isSuper ? "Platform Administration" : "Team Administration"}</h1>
        <p>
          {isSuper
            ? "Monitor tenants and manage every account across Cap Corporate."
            : "Add and manage users in your organization."}
        </p>
      </div>

      {isSuper && (
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <button
            className={`btn ${tab === "tenants" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("tenants")}
          >
            Tenants
          </button>
          <button
            className={`btn ${tab === "users" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("users")}
          >
            All Users
          </button>
        </div>
      )}

      {tab === "tenants" && isSuper ? <TenantsPanel /> : <UsersPanel isSuper={isSuper} />}
    </div>
  );
}

/* ─────────────────────────── Tenants (super) ─────────────────────────── */
function TenantsPanel() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [form, setForm] = useState({
    name: "",
    admin_full_name: "",
    admin_email: "",
    admin_password: "",
  });
  const [err, setErr] = useState("");

  const load = () =>
    get<TenantStats[]>("/api/admin/tenants").then(setTenants);
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await post("/api/admin/tenants", form);
      setForm({ name: "", admin_full_name: "", admin_email: "", admin_password: "" });
      load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function toggle(id: number) {
    await patch(`/api/admin/tenants/${id}/toggle`);
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.4fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Users</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.name}</strong>
                  <div style={{ color: "var(--slate)", fontSize: 12 }}>
                    /{t.slug}
                  </div>
                </td>
                <td>{t.user_count}</td>
                <td>
                  <span
                    className={`badge ${t.is_active ? "badge-success" : "badge-danger"}`}
                  >
                    {t.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px" }}
                    onClick={() => toggle(t.id)}
                  >
                    {t.is_active ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--slate)" }}>
                  No tenants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={create}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>
          Provision a tenant
        </h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <div className="field">
          <label>Organization name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Admin name</label>
          <input
            className="input"
            value={form.admin_full_name}
            onChange={(e) =>
              setForm({ ...form, admin_full_name: e.target.value })
            }
            required
          />
        </div>
        <div className="field">
          <label>Admin email</label>
          <input
            className="input"
            type="email"
            value={form.admin_email}
            onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Temp password</label>
          <input
            className="input"
            value={form.admin_password}
            onChange={(e) =>
              setForm({ ...form, admin_password: e.target.value })
            }
            required
          />
        </div>
        <button className="btn btn-primary btn-block">Create tenant</button>
      </form>
    </div>
  );
}

/* ──────────────────────────────── Users ──────────────────────────────── */
function UsersPanel({ isSuper }: { isSuper: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "auditor",
    tenant_id: "",
  });
  const [err, setErr] = useState("");

  const load = () => get<User[]>("/api/admin/users").then(setUsers);
  useEffect(() => {
    load();
    if (isSuper) get<TenantStats[]>("/api/admin/tenants").then(setTenants);
  }, [isSuper]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const payload: any = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (isSuper && form.role !== "super_admin") {
        payload.tenant_id = form.tenant_id ? Number(form.tenant_id) : null;
      }
      await post("/api/admin/users", payload);
      setForm({ full_name: "", email: "", password: "", role: "auditor", tenant_id: "" });
      load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function toggleActive(u: User) {
    await patch(`/api/admin/users/${u.id}`, { is_active: !u.is_active });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.4fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td style={{ color: "var(--slate)" }}>{u.email}</td>
                <td>
                  <span className="badge badge-slate">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}
                  >
                    {u.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px" }}
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={create}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add a user</h3>
        {err && <div className="alert alert-danger">{err}</div>}
        <div className="field">
          <label>Full name</label>
          <input
            className="input"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Temp password</label>
          <input
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Role</label>
          <select
            className="select"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="auditor">Auditor</option>
            <option value="tenant_admin">Tenant Admin</option>
            {isSuper && <option value="super_admin">Super Admin</option>}
          </select>
        </div>
        {isSuper && form.role !== "super_admin" && (
          <div className="field">
            <label>Assign to tenant</label>
            <select
              className="select"
              value={form.tenant_id}
              onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
              required
            >
              <option value="">Select tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="btn btn-primary btn-block">Create user</button>
      </form>
    </div>
  );
}
