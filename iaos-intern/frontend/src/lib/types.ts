export type Role = "super_admin" | "tenant_admin" | "auditor";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  tenant_id: number | null;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Session {
  token: { access_token: string; token_type: string };
  user: User;
  tenant: Tenant | null;
}

export interface TenantStats extends Tenant {
  user_count: number;
}

export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  active_users: number;
  tenant_admins: number;
  auditors: number;
  recent_tenants: TenantStats[];
}

/** Module manifest returned by GET /api/modules/registry */
export interface ModuleManifest {
  name: string;
  title: string;
  description: string;
  icon: string;
  version: string;
  owner: string;
}
