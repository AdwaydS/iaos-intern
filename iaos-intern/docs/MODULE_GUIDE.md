# Module Guide — for interns

Welcome. You own **one module**. You'll work in exactly **two folders** and
never touch anyone else's code. Here's everything you need.

## 1. Scaffold your module

Pick a `slug` (lowercase, underscores) — e.g. `control_testing`. From the repo
root:

```bash
python scripts/new_module.py control_testing "Control Testing" "✅" "your-name"
```

This creates:
- `backend/app/modules/control_testing/`
- `frontend/src/modules/control_testing/`

## 2. Branch

```bash
git checkout -b module/control_testing
```

One branch per module. See [BRANCHING.md](BRANCHING.md).

## 3. What's in your backend folder

```
backend/app/modules/control_testing/
├── __init__.py
├── models.py     # your DB tables — prefix every table `mod_control_testing_`
├── schemas.py    # Pydantic request/response models
└── router.py     # your API — mounted at /api/modules/control_testing
```

### Rules (these keep 80 modules from colliding)
- **Table names** must start with `mod_<your_slug>_`. The scaffolder does the
  first one; follow the pattern for new tables.
- **Tenant data**: inherit `TenantMixin` and set `tenant_id=current_user.tenant_id`
  on create; read via `tenant_scoped(db.query(Model), current_user)`.
- **Auth**: add `current_user: CurrentUser` and `db: DbSession` params to routes.
- Import shared pieces from the platform, never reach into another module:
  ```python
  from app.api.deps import CurrentUser, DbSession
  from app.core.tenancy import tenant_scoped
  ```

### Minimal backend route example
```python
@router.get("/items", response_model=list[ItemOut])
def list_items(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Item), current_user)
    return [ItemOut.model_validate(i) for i in q.all()]
```

## 4. What's in your frontend folder

```
frontend/src/modules/control_testing/
├── module.config.tsx        # manifest: slug, title, icon, component
└── ControlTestingPage.tsx   # your UI
```

- `slug` in `module.config.tsx` **must equal** your backend folder name.
- Call your API with the helpers from `src/lib/api.ts`:
  ```ts
  import { get, post, del } from "../../lib/api";
  const rows = await get(`/api/modules/control_testing/items`);
  ```
- Optional: restrict visibility with `roles: ["auditor", "tenant_admin"]` in
  the config.

## 5. Run it

```bash
# backend (from /backend, venv active)
uvicorn app.main:app --reload
# frontend (from /frontend)
npm run dev
```

Log in → your module appears in the sidebar and as a dashboard tile,
automatically. No registration step.

## 6. Definition of done
- [ ] Tables prefixed `mod_<slug>_` and tenant-scoped.
- [ ] All routes require `CurrentUser`.
- [ ] Frontend `slug` matches backend folder name.
- [ ] You edited **only** your two module folders.
- [ ] `npm run build` passes and the backend starts cleanly.

## FAQ
**Can I add npm/pip packages?** Prefer not to. If you must, discuss with the
maintainer — shared `package.json` / `requirements.txt` edits are the one place
branches can conflict (see BRANCHING.md for how we handle it).

**Do modules depend on each other?** No — modules are independent by design.
Keep it that way.

**Where's the shared UI?** `frontend/src/theme/theme.css` gives you `.btn`,
`.card`, `.input`, `.badge`, tables, etc. Use them for a consistent look.
