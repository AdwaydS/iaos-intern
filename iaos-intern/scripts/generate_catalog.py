#!/usr/bin/env python3
"""Generate the full IAOS module catalog (backend + frontend).

Creates a working, tenant-scoped stub module for every entry in CATALOG —
each in its own folder, ready for an intern to flesh out. Idempotent: existing
modules are skipped. Run from the repo root:

    python scripts/generate_catalog.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BE = ROOT / "backend" / "app" / "modules"
FE = ROOT / "frontend" / "src" / "modules"

# ── The catalog ──────────────────────────────────────────────────────────────
# group -> {icon, modules: [title, ...]}  (industry packs carry (industry, title))
CATALOG = [
    ("Audit Command Center", "file-check", [
        "Risk Assessment & Universe", "Annual Planning", "Engagement & Fieldwork",
        "Working Papers & Evidence", "Findings Tracking", "Audit Reporting",
        "Board/Committee Reporting", "Continuous Monitoring", "Data Analytics & CAAT",
    ]),
    ("Controls, Risk & Fraud", "shield", [
        "RCM Library", "IFC/ICFR Testing", "DOA & SoD", "Policy & SOP",
        "Fraud & Forensic", "Whistleblower & Grievance", "Third-Party Risk",
        "ESG & Sustainability",
    ]),
    ("Finance & Close", "wallet", [
        "Journal Entries & R2R", "Expense & Cost Controls", "Budgeting & Variance",
        "Related-Party Transactions", "Inter-Company & Consolidation",
        "Cost Audit & Overheads", "Payroll & HR",
    ]),
    ("Treasury, Assets & Capital", "building", [
        "Treasury & Banking", "Cash & Petty Cash", "Borrowings & Covenants",
        "Investments", "Forex & Hedging", "Insurance", "Fixed Assets & CWIP",
        "Capex & Projects",
    ]),
    ("Procurement & Spend", "cart", [
        "Procure-to-Pay", "Vendor Master", "Tendering & Bidding",
        "Contract Lifecycle", "Travel & Expense",
    ]),
    ("Revenue & Customers", "trending-up", [
        "Order-to-Cash", "Revenue Recognition & Cut-off", "Customer Master & Credit",
        "Sales & Distribution",
    ]),
    ("Supply Chain & Operations", "truck", [
        "Inventory & Stores", "Warehouse & Movement", "Logistics & Freight",
        "Production", "Quality Control", "Maintenance & Spares",
        "Utilities & Energy", "Item & Material Master",
    ]),
    ("Tax, Legal & Compliance", "scale", [
        "Compliance Calendar", "GST", "TDS/TCS & Direct Tax", "Statutory Dues",
        "Secretarial & ROC", "Labour Law & PF/ESI", "Litigation Tracking", "CSR",
        "Grants & Subsidies", "Data Privacy (DPDP)",
    ]),
    ("Technology & Resilience", "server", [
        "ITGC", "ERP Access (IAM)", "Cybersecurity", "Business Continuity & DR",
        "Master Data Change Governance",
    ]),
]

# Industry Packs — (industry, title); all share one nav group, filtered by industry.
INDUSTRY_PACKS = [
    ("BFSI", "Loan Origination"), ("BFSI", "NPA/IRAC"), ("BFSI", "KYC-AML"),
    ("BFSI", "Branch Ops"),
    ("Manufacturing", "BOM & Yield"), ("Manufacturing", "OEE"),
    ("Retail/FMCG", "POS"), ("Retail/FMCG", "Trade Schemes"),
    ("Retail/FMCG", "Shrinkage"),
    ("IT/Services", "Project Billing"), ("IT/Services", "SaaS Spend"),
    ("IT/Services", "Utilization"),
    ("Real Estate/Infra", "RERA"), ("Real Estate/Infra", "RA Bills"),
    ("Healthcare/Pharma", "Patient Billing"), ("Healthcare/Pharma", "Drug/GMP"),
    ("Hospitality", "Hospitality Ops"), ("Fleet", "Fleet Management"),
    ("Metering", "Metering & Billing"), ("E-commerce", "E-commerce Ops"),
    ("Agri", "Agri Operations"),
]

# ── Helpers ──────────────────────────────────────────────────────────────────
def slugify(title: str, prefix: str = "") -> str:
    s = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
    s = f"{prefix}{s}" if prefix else s
    if not re.match(r"[a-z]", s):
        s = "m_" + s
    return s


def pascal(slug: str) -> str:
    return "".join(p.capitalize() for p in slug.split("_"))


def esc(text: str) -> str:
    return text.replace('"', '\\"')


# ── File templates ───────────────────────────────────────────────────────────
def be_models(slug, cls):
    return f'''from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class {cls}(Base, TenantMixin):
    __tablename__ = "mod_{slug}_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")
'''


BE_SCHEMAS = '''from pydantic import BaseModel


class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str

    model_config = {"from_attributes": True}
'''


def be_router(slug, title, cls, icon, group, industry):
    return f'''"""Auto-generated stub for the "{esc(title)}" module.

Tenant-isolated CRUD scaffold — replace with the real workflow.
Mounted at /api/modules/{slug}.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import {cls}
from .schemas import ItemCreate, ItemOut

MANIFEST = {{
    "name": "{slug}",
    "title": "{esc(title)}",
    "description": "{esc(title)} — audit module.",
    "icon": "{icon}",
    "group": "{esc(group)}",
    "industry": "{esc(industry)}",
    "version": "0.1.0",
    "owner": "unassigned",
}}

router = APIRouter()


@router.get("/items", response_model=list[ItemOut])
def list_items(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query({cls}), current_user)
    return [ItemOut.model_validate(i) for i in q.order_by({cls}.id.desc()).all()]


@router.post("/items", response_model=ItemOut, status_code=201)
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    item = {cls}(title=body.title, notes=body.notes, tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemOut.model_validate(item)


@router.delete("/items/{{item_id}}", status_code=204)
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query({cls}).filter({cls}.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
'''


def fe_config(slug, title, icon, group, industry, page_cls):
    industry_line = f'\n  industry: "{esc(industry)}",' if industry else ""
    return f'''import type {{ ModuleConfig }} from "../registry";
import {page_cls} from "./{page_cls}";

const config: ModuleConfig = {{
  slug: "{slug}",
  title: "{esc(title)}",
  description: "{esc(title)} — audit module.",
  icon: "{icon}",
  group: "{esc(group)}",{industry_line}
  component: {page_cls},
}};

export default config;
'''


def fe_page(slug, title, page_cls):
    return f'''import {{ useEffect, useState }} from "react";
import {{ del, get, post }} from "../../lib/api";

// Auto-generated stub for "{esc(title)}". Tenant-scoped CRUD — build on it.
const SLUG = "{slug}";

interface Item {{
  id: number;
  title: string;
  notes: string;
}}

export default function {page_cls}() {{
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {{
    setItems(await get<Item[]>(`/api/modules/${{SLUG}}/items`));
    setLoading(false);
  }}
  useEffect(() => {{
    refresh();
  }}, []);

  async function add(e: React.FormEvent) {{
    e.preventDefault();
    if (!title.trim()) return;
    await post(`/api/modules/${{SLUG}}/items`, {{ title, notes }});
    setTitle("");
    setNotes("");
    refresh();
  }}

  return (
    <div style={{{{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}}}>
      <div className="card" style={{{{ overflow: "hidden", height: "fit-content" }}}}>
        {{loading ? (
          <p style={{{{ padding: 18 }}}}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {{items.map((it) => (
                <tr key={{it.id}}>
                  <td>{{it.title}}</td>
                  <td style={{{{ color: "var(--slate)" }}}}>{{it.notes || "—"}}</td>
                  <td style={{{{ textAlign: "right" }}}}>
                    <button
                      className="btn btn-ghost"
                      style={{{{ padding: "6px 12px" }}}}
                      onClick={{async () => {{
                        await del(`/api/modules/${{SLUG}}/items/${{it.id}}`);
                        refresh();
                      }}}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}}
              {{items.length === 0 && (
                <tr>
                  <td colSpan={{3}} style={{{{ color: "var(--slate)" }}}}>
                    No records yet.
                  </td>
                </tr>
              )}}
            </tbody>
          </table>
        )}}
      </div>

      <form className="card" style={{{{ padding: 22 }}}} onSubmit={{add}}>
        <h3 style={{{{ color: "var(--navy)", marginBottom: 14 }}}}>Add record</h3>
        <div className="field">
          <label>Title</label>
          <input
            className="input"
            value={{title}}
            onChange={{(e) => setTitle(e.target.value)}}
            required
          />
        </div>
        <div className="field">
          <label>Notes</label>
          <input
            className="input"
            value={{notes}}
            onChange={{(e) => setNotes(e.target.value)}}
          />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}}
'''


# ── Generation ───────────────────────────────────────────────────────────────
def build_flat():
    """Return list of (slug, title, icon, group, industry)."""
    out = []
    seen = set()

    def add(title, icon, group, industry, prefix=""):
        slug = slugify(title, prefix)
        base, n = slug, 1
        while slug in seen:
            n += 1
            slug = f"{base}_{n}"
        seen.add(slug)
        out.append((slug, title, icon, group, industry))

    for group, icon, titles in CATALOG:
        for t in titles:
            add(t, icon, group, "")

    for industry, title in INDUSTRY_PACKS:
        add(title, "grid", "Industry Packs", industry, prefix="ip_")

    return out


def write_module(slug, title, icon, group, industry):
    cls = pascal(slug) + "Item"
    page_cls = pascal(slug) + "Page"

    be_dir = BE / slug
    fe_dir = FE / slug
    if be_dir.exists() and fe_dir.exists():
        return False

    be_dir.mkdir(parents=True, exist_ok=True)
    (be_dir / "__init__.py").write_text(f'"""{title} module."""\n')
    (be_dir / "models.py").write_text(be_models(slug, cls))
    (be_dir / "schemas.py").write_text(BE_SCHEMAS)
    (be_dir / "router.py").write_text(
        be_router(slug, title, cls, icon, group, industry)
    )

    fe_dir.mkdir(parents=True, exist_ok=True)
    (fe_dir / "module.config.tsx").write_text(
        fe_config(slug, title, icon, group, industry, page_cls)
    )
    (fe_dir / f"{page_cls}.tsx").write_text(fe_page(slug, title, page_cls))
    return True


def main():
    modules = build_flat()
    created = skipped = 0
    for slug, title, icon, group, industry in modules:
        if write_module(slug, title, icon, group, industry):
            created += 1
        else:
            skipped += 1

    print(f"Catalog: {len(modules)} modules — {created} created, {skipped} skipped.")
    by_group = {}
    for _, _, _, g, _ in modules:
        by_group[g] = by_group.get(g, 0) + 1
    for g, c in by_group.items():
        print(f"  {c:>3}  {g}")


if __name__ == "__main__":
    main()
