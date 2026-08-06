# Branching & Collaboration — 80 interns, 80 modules

The architecture is built so parallel work almost never conflicts. This doc is
the workflow that keeps it that way.

## Branch model

```
main                      ← always deployable; protected
  └── module/<slug>       ← one branch per intern per module
```

- **One module = one branch = one owner.** Branch name: `module/<slug>`
  (e.g. `module/control_testing`).
- Branch off the latest `main`.

```bash
git checkout main && git pull
git checkout -b module/control_testing
```

## Why conflicts are rare by design

Each intern edits **only their two folders**:
- `backend/app/modules/<slug>/`
- `frontend/src/modules/<slug>/`

There is **no shared registry, route table, or nav list** to edit — discovery
is automatic (see ARCHITECTURE.md). Two people touching different folders =
clean merges.

## The only shared files (handle with care)

These are the rare places two branches *could* both change:

| File | When you'd touch it | Rule |
|---|---|---|
| `frontend/package.json` | adding an npm dep | Avoid. If needed, rebase before PR; resolve the dep list, keep both entries. |
| `backend/requirements.txt` | adding a pip dep | Same as above. |
| `frontend/package-lock.json` | follows the above | Regenerate with `npm install`, don't hand-merge. |
| `app/core/*`, `app/api/*`, `src/pages/*`, `src/theme/*` | platform changes | **Off-limits to module work.** Propose to the maintainer via an issue. |

Because these lists are append-only, git usually auto-merges them. If not, the
resolution is trivial (keep both new lines).

## Pull request flow

1. Push your branch: `git push -u origin module/<slug>`.
2. Open a PR into `main`. Title: `Module: <Title>`.
3. CI must pass: backend starts, `npm run build` succeeds.
4. One reviewer (maintainer or a peer) approves.
5. **Squash-merge** into `main`.

Keep PRs scoped to your module. A PR that changes files outside your two
folders will be sent back.

## Keeping up to date

Rebase onto `main` regularly so your branch stays fresh:

```bash
git fetch origin
git rebase origin/main
# your module folders won't conflict; only shared dep files might — resolve & continue
```

## Roles for the program

- **Maintainer (you):** owns `main`, the platform core, and shared deps. Reviews
  and merges module PRs.
- **Interns:** own one module branch each.

## Cheat sheet

```bash
# start a module
python scripts/new_module.py <slug> "<Title>" "<icon>" "<name>"
git checkout -b module/<slug>

# daily
git fetch origin && git rebase origin/main
git add . && git commit -m "feat(<slug>): ..."
git push

# open PR into main when done
```

## Anti-patterns (will cause conflicts or breakage)

- ❌ Editing another module's folder.
- ❌ Editing `app/core`, `app/api`, `src/pages`, or `src/theme` for module needs.
- ❌ Importing from another module (`app.modules.other...`). Modules are independent.
- ❌ Reusing another module's table prefix.
- ❌ Long-lived branches that never rebase.
