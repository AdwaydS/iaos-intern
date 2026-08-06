#!/usr/bin/env python3
"""Scaffold a new IAOS module (backend + frontend) in one command.

Usage:
    python scripts/new_module.py <slug> "<Title>" "<icon-name>" "<owner>"

`icon-name` is a name from the shared SVG icon set (frontend/src/components/
Icon.tsx) — e.g. file-check, shield, briefcase, layers. No emojis.

Example:
    python scripts/new_module.py control_testing "Control Testing" "file-check" "intern-14"

This copies the _template folders on BOTH sides and rewrites the identifiers.
Because module discovery is automatic, that's all you need — no shared file to
edit, so your branch won't conflict with the other 79.
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BE = ROOT / "backend" / "app" / "modules"
FE = ROOT / "frontend" / "src" / "modules"


def pascal(slug: str) -> str:
    return "".join(p.capitalize() for p in re.split(r"[_\-]", slug))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    slug = sys.argv[1].strip().lower()
    title = sys.argv[2]
    icon = sys.argv[3] if len(sys.argv) > 3 else "layers"
    owner = sys.argv[4] if len(sys.argv) > 4 else "unassigned"

    if not re.fullmatch(r"[a-z][a-z0-9_]*", slug):
        sys.exit(f"Invalid slug '{slug}'. Use lowercase letters, digits, underscores.")

    be_dst = BE / slug
    fe_dst = FE / slug
    if be_dst.exists() or fe_dst.exists():
        sys.exit(f"Module '{slug}' already exists.")

    # ── Backend ──────────────────────────────────────────────
    shutil.copytree(BE / "_template", be_dst)
    router = be_dst / "router.py"
    text = router.read_text()
    text = text.replace('"name": "_template"', f'"name": "{slug}"')
    text = text.replace('"title": "Template Module"', f'"title": "{title}"')
    text = text.replace('"icon": "clipboard"', f'"icon": "{icon}"')
    text = text.replace('"owner": "unassigned"', f'"owner": "{owner}"')
    text = text.replace("Mounted automatically at /api/modules/_template",
                        f"Mounted automatically at /api/modules/{slug}")
    router.write_text(text)

    models = be_dst / "models.py"
    models.write_text(
        models.read_text().replace("mod_template_items", f"mod_{slug}_items")
    )

    # ── Frontend ─────────────────────────────────────────────
    shutil.copytree(FE / "_template", fe_dst)
    page_old = fe_dst / "TemplatePage.tsx"
    page_new = fe_dst / f"{pascal(slug)}Page.tsx"
    page_old.rename(page_new)
    page_new.write_text(page_new.read_text().replace('const SLUG = "_template"',
                                                      f'const SLUG = "{slug}"'))

    cfg = fe_dst / "module.config.tsx"
    ctext = cfg.read_text()
    ctext = ctext.replace("import TemplatePage from \"./TemplatePage\"",
                          f'import {pascal(slug)}Page from "./{pascal(slug)}Page"')
    ctext = ctext.replace('slug: "_template"', f'slug: "{slug}"')
    ctext = ctext.replace('title: "Template Module"', f'title: "{title}"')
    ctext = ctext.replace('icon: "clipboard"', f'icon: "{icon}"')
    ctext = ctext.replace("component: TemplatePage",
                          f"component: {pascal(slug)}Page")
    cfg.write_text(ctext)

    print(f"""
✅ Created module '{slug}'
   backend : backend/app/modules/{slug}/
   frontend: frontend/src/modules/{slug}/

Next:
   1. git checkout -b module/{slug}
   2. Build your feature in those two folders only.
   3. Restart backend + frontend — your module auto-appears in the sidebar.
""")


if __name__ == "__main__":
    main()
