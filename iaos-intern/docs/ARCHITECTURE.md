# IAOS Architecture

## Goals

1. **Multi-tenant SaaS** — many organizations, isolated data, one deployment.
2. **80 independent modules built by 80 interns in parallel** with near-zero
   coordination and merge conflicts.

## System overview

```
┌──────────────┐      HTTPS/JSON      ┌────────────────────────┐
│  React (SPA) │  ─────────────────►  │  FastAPI (Python)      │
│  Vite :5173  │  ◄─────────────────  │  :8000                 │
└──────────────┘   JWT Bearer token   │                        │
      │                               │  ┌──────────────────┐  │
      │ import.meta.glob              │  │ module_loader.py │  │
      │ auto-discovers modules        │  │ pkgutil scan     │  │
      ▼                               │  └──────────────────┘  │
  src/modules/*                       │        modules/*       │
                                      └───────────┬────────────┘
                                                  │ SQLAlchemy
                                                  ▼
                                          ┌───────────────┐
                                          │   MySQL 8     │
                                          │ shared schema │
                                          └───────────────┘
```

## Multi-tenancy model

**Shared database, shared schema, row-level isolation** via a `tenant_id`
discriminator column.

- `tenants` — one row per organization.
- `users` — belong to a tenant (except `super_admin`, which is platform-wide
  and has `tenant_id = NULL`).
- Every tenant-owned table inherits `TenantMixin` (adds `tenant_id` + timestamps).
- Module queries go through `tenant_scoped(query, current_user)`, which appends
  `WHERE tenant_id = :current` so an auditor can only ever see their org's rows.

Why shared-DB row-level (vs schema-per-tenant or DB-per-tenant)? It's the
simplest model that supports **self-service signup** and 80 modules without
provisioning 80 × N schemas. It can be evolved later if a tenant needs
physical isolation.

## AuthN / AuthZ

- Passwords hashed with bcrypt (`passlib`).
- Login returns a **JWT** (`sub`, `tenant_id`, `role`, `exp`).
- `get_current_user` (in `api/deps.py`) decodes the token, loads the user, and
  injects it. Modules depend on `CurrentUser` — they never touch the token.
- Role guards: `require_super_admin`, `require_tenant_admin`.

## The module system (the important part)

### Backend discovery — `app/module_loader.py`
On startup we `pkgutil.iter_modules()` over `app/modules/`, import each
package's `models` (so tables register on `Base.metadata`) and `router` (an
`APIRouter`), and mount it at `/api/modules/<name>`. Folders starting with `_`
are skipped. **Nothing names a specific module**, so adding one requires no edit
to any shared file.

### Frontend discovery — `src/modules/registry.ts`
Vite's `import.meta.glob('./*/module.config.tsx', { eager: true })` collects
every module's config at build time. The sidebar, dashboard tiles, and
`/app/m/:slug` route all read from this list. Again, **no shared list to edit.**

### The isolation contract each module follows
1. Backend tables prefixed `mod_<slug>_` → no name collisions in the shared DB.
2. Tenant-owned models inherit `TenantMixin`.
3. Routes use `CurrentUser` + `tenant_scoped()` → automatic tenant isolation.
4. Frontend `slug` **must equal** the backend module folder name.

Because each module is confined to two folders it owns exclusively, two interns
never edit the same file — so their branches merge cleanly.

## Reserved module names
Don't name a module `registry` (collides with the module-registry endpoint) or
start a name with `_` (reserved for templates/helpers).

## Startup sequence (`main.py` lifespan)
1. Import platform models.
2. `load_modules()` — discover + mount all module routers, import their models.
3. `create_all_tables()` — now that every table is registered, create schema.
4. `ensure_super_admin()` — seed the Cap Corp super admin if absent.

## Production notes (not yet implemented — intentionally out of scope)
- Swap `create_all` for **Alembic** migrations once schemas stabilize.
- Add refresh tokens + rotation; move JWT secret to a secrets manager.
- Rate-limiting, audit logging, and per-tenant module enablement.
