import { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

// Auto-generated stub for "Data Privacy (DPDP)". Tenant-scoped CRUD — build on it.
const SLUG = "data_privacy_dpdp";

interface Item {
  id: number;
  title: string;
  notes: string;
}

export default function DataPrivacyDpdpPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setItems(await get<Item[]>(`/api/modules/${SLUG}/items`));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await post(`/api/modules/${SLUG}/items`, { title, notes });
    setTitle("");
    setNotes("");
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
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
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.title}</td>
                  <td style={{ color: "var(--slate)" }}>{it.notes || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px" }}
                      onClick={async () => {
                        await del(`/api/modules/${SLUG}/items/${it.id}`);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: "var(--slate)" }}>
                    No records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Add record</h3>
        <div className="field">
          <label>Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Notes</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </div>
  );
}
