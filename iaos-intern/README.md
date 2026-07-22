# IAOS — Internal Audit OS

**Cap Corporate's multi-tenant Internal Audit Operating System.**

A landing page, self-service auth, super-admin platform console, and a
**plug-in module architecture** designed so **80 interns can each build a module
on their own branch and merge without conflicts.**

- **Frontend:** React 18 + TypeScript + Vite + React Router
- **Backend:** Python + FastAPI + SQLAlchemy 2.0
- **Database:** MySQL 8 (shared DB, row-level multi-tenancy)

---

## Why this scales to 80 modules / 80 interns

There is **no central registry file** anyone has to edit to add a module.
Both the backend and the frontend **auto-discover** modules by scanning a
folder. An intern adds one folder on each side and their module appears.

| Concern | How it's solved |
|---|---|
| Merge conflicts on a shared list | Eliminated — discovery is by folder scan, not a list |
| Table-name collisions in one DB | Each module prefixes tables `mod_<name>_…` |
| Tenant data leaking across orgs | `TenantMixin` + `tenant_scoped()` enforce isolation everywhere |
| Boilerplate per module | `python scripts/new_module.py` scaffolds both sides |

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**,
**[docs/MODULE_GUIDE.md](docs/MODULE_GUIDE.md)**, and
**[docs/BRANCHING.md](docs/BRANCHING.md)**.

---

## Quick start

### Option A — Docker (DB + backend)

```bash
cp backend/.env.example backend/.env      # optional; compose sets its own env
docker compose up --build                 # MySQL + FastAPI on :8000
cd frontend && npm install && npm run dev # React on :5173
```

### Option B — Local

```bash
# 1. MySQL — create the database + user
#    CREATE DATABASE iaos;
#    CREATE USER 'iaos'@'%' IDENTIFIED BY 'iaos_password';
#    GRANT ALL ON iaos.* TO 'iaos'@'%';

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL + SECRET_KEY
uvicorn app.main:app --reload # http://localhost:8000  (docs at /docs)

# 3. Frontend
cd ../frontend
npm install
npm run dev                   # http://localhost:5173
```

Tables are created automatically on first backend start, and a super admin is
seeded from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`.

**Default super admin:** `admin@capcorp.com` / `ChangeMe123!` — change these.

---

## Roles

| Role | Can do |
|---|---|
| **Super Admin** (Cap Corp) | See/monitor all tenants, provision tenants, manage any user |
| **Tenant Admin** | Self-service user management within their own organization |
| **Auditor** | Use the audit modules within their tenant |

Two ways an organization comes to life:
1. **Self-service** — anyone signs up at `/signup`, which creates a tenant +
   makes them its Tenant Admin.
2. **Provisioned** — the Super Admin creates a tenant from the Platform Admin
   console.

---

## Create a new module (30 seconds)

```bash
python scripts/new_module.py control_testing "Control Testing" "✅" "intern-14"
git checkout -b module/control_testing
# build in backend/app/modules/control_testing + frontend/src/modules/control_testing
```

Restart both servers — the module shows up in the sidebar automatically.

---

## Repository layout

```
IAOS/
├── backend/                 FastAPI app
│   └── app/
│       ├── core/            config, db, security, tenancy
│       ├── models/          platform models (tenant, user)
│       ├── api/             auth, admin, modules, deps
│       ├── modules/         ← one folder per intern module (auto-loaded)
│       │   ├── _template/   copy me
│       │   └── risk_register/  working demo module
│       ├── module_loader.py auto-discovery
│       └── main.py
├── frontend/                React app
│   └── src/
│       ├── pages/           Landing, Login, Signup, Dashboard, Admin, shell
│       ├── modules/         ← one folder per intern module (auto-loaded)
│       │   ├── _template/   copy me
│       │   └── risk_register/  working demo module
│       └── modules/registry.ts  auto-discovery
├── scripts/new_module.py    scaffolds a module on both sides
├── docs/                    ARCHITECTURE, MODULE_GUIDE, BRANCHING
└── docker-compose.yml
```
