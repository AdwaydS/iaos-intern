import { useEffect, useMemo, useState } from "react";
import { del, get, post } from "../../lib/api";

// Module 22 — Cash & Petty Cash. All 25 sub-pages (15 signature checks +
// 10 shell pages) are driven from one generic table+form UI, using the
// field/page metadata the backend already knows (`GET /pages`) so this
// file never has to hard-code 25 separate forms.
const SLUG = "cash_petty_cash";

interface FieldMeta {
  name: string;
  kind: "text" | "number" | "textarea";
  label: string;
}

interface PageMeta {
  no: number;
  slug: string;
  title: string;
  group: "signature" | "shell";
  has_table: boolean;
  fields: FieldMeta[];
}

interface Dashboard {
  total_records: number;
  pages_with_data: number;
  by_page: Record<string, number>;
}

type Row = Record<string, unknown> & { id: number };

function emptyForm(fields: FieldMeta[]): Record<string, string> {
  const f: Record<string, string> = {};
  for (const field of fields) f[field.name] = "";
  return f;
}

export default function CashPettyCashPage() {
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>("module_dashboard_kpis");
  const [rows, setRows] = useState<Row[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    get<PageMeta[]>(`/api/modules/${SLUG}/pages`).then((p) => {
      setPages(p);
      setLoading(false);
    });
  }, []);

  const active = useMemo(
    () => pages.find((p) => p.slug === activeSlug),
    [pages, activeSlug]
  );
  const signaturePages = useMemo(
    () => pages.filter((p) => p.group === "signature"),
    [pages]
  );
  const shellPages = useMemo(() => pages.filter((p) => p.group === "shell"), [pages]);

  async function loadActive() {
    if (!active) return;
    if (!active.has_table) {
      setDashboard(await get<Dashboard>(`/api/modules/${SLUG}/dashboard`));
      return;
    }
    setRows(await get<Row[]>(`/api/modules/${SLUG}/pages/${active.slug}/records`));
    setForm(emptyForm(active.fields));
  }

  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !active.has_table) return;
    setBusy(true);
    try {
      const payload: Record<string, string | number> = {};
      for (const field of active.fields) {
        const v = form[field.name] ?? "";
        payload[field.name] = field.kind === "number" ? Number(v || 0) : v;
      }
      await post(`/api/modules/${SLUG}/pages/${active.slug}/records`, payload);
      setForm(emptyForm(active.fields));
      await loadActive();
    } finally {
      setBusy(false);
    }
  }

  async function removeRecord(id: number) {
    if (!active) return;
    await del(`/api/modules/${SLUG}/pages/${active.slug}/records/${id}`);
    loadActive();
  }

  function NavGroup({ title, items }: { title: string; items: PageMeta[] }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--slate)",
            padding: "0 10px 6px",
          }}
        >
          {title}
        </div>
        {items.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActiveSlug(p.slug)}
            className="btn btn-ghost"
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 8,
              marginBottom: 2,
              background: p.slug === activeSlug ? "var(--navy-tint)" : "transparent",
              color: p.slug === activeSlug ? "var(--navy)" : "var(--ink)",
              fontWeight: p.slug === activeSlug ? 700 : 500,
            }}
          >
            {p.no}. {p.title}
          </button>
        ))}
      </div>
    );
  }

  if (loading) return <p style={{ padding: 18 }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "280px 1fr" }}>
      <div className="card" style={{ padding: 14, height: "fit-content", maxHeight: "80vh", overflowY: "auto" }}>
        <NavGroup title="Signature checks (1–15)" items={signaturePages} />
        <NavGroup title="Shell pages (16–25)" items={shellPages} />
      </div>

      <div>
        {active && !active.has_table && (
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ color: "var(--navy)", marginBottom: 4 }}>{active.title}</h3>
            <p style={{ color: "var(--slate)", marginBottom: 18 }}>
              Live counts across all 24 data-bearing sub-pages in this module.
            </p>
            {dashboard && (
              <>
                <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Total records</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
                      {dashboard.total_records}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Pages with data</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
                      {dashboard.pages_with_data} / 24
                    </div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>Sub-pages</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>25</div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Sub-page</th>
                      <th>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages
                      .filter((p) => p.has_table)
                      .map((p) => (
                        <tr key={p.slug}>
                          <td>
                            {p.no}. {p.title}
                          </td>
                          <td>
                            <span className={dashboard.by_page[p.slug] ? "badge badge-success" : "badge badge-slate"}>
                              {dashboard.by_page[p.slug] ?? 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {active && active.has_table && (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
            {/* overflow: "auto" (not "hidden") + sticky last column so Delete
                is never clipped off, no matter how many fields a sub-page has */}
            <div className="card" style={{ overflow: "auto", height: "fit-content" }}>
              <div style={{ padding: "16px 18px 0" }}>
                <h3 style={{ color: "var(--navy)" }}>
                  {active.no}. {active.title}
                </h3>
              </div>
              <table style={{ minWidth: "max-content" }}>
                <thead>
                  <tr>
                    {active.fields.map((f) => (
                      <th key={f.name}>{f.label}</th>
                    ))}
                    <th
                      style={{
                        position: "sticky",
                        right: 0,
                        background: "var(--surface, #fff)",
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      {active.fields.map((f) => (
                        <td key={f.name} style={{ color: f.kind === "textarea" ? "var(--slate)" : undefined }}>
                          {String(r[f.name] ?? "") || "—"}
                        </td>
                      ))}
                      <td
                        style={{
                          textAlign: "right",
                          position: "sticky",
                          right: 0,
                          background: "var(--surface, #fff)",
                        }}
                      >
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "6px 12px" }}
                          onClick={() => removeRecord(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={active.fields.length + 1} style={{ color: "var(--slate)" }}>
                        No records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <form className="card" style={{ padding: 22 }} onSubmit={addRecord}>
              <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add record</h3>
              {active.fields.map((f) => (
                <div className="field" key={f.name}>
                  <label>{f.label}</label>
                  {f.kind === "textarea" ? (
                    <textarea
                      className="input"
                      rows={3}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="input"
                      type={f.kind === "number" ? "number" : "text"}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <button className="btn btn-primary btn-block" disabled={busy}>
                {busy ? "Saving…" : "Add"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
