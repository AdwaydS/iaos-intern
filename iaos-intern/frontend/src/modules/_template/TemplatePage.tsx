import { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

/**
 * A complete, working module page: lists + creates + deletes items scoped to
 * the logged-in tenant. Talks to /api/modules/_template/items on the backend.
 * Copy and rename `SLUG` to your module folder name.
 */
const SLUG = "_template";

interface Item {
  id: number;
  title: string;
  notes: string;
}

export default function TemplatePage() {
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

  async function remove(id: number) {
    await del(`/api/modules/${SLUG}/items/${id}`);
    refresh();
  }

  return (
    <div>
      <p style={{ color: "var(--slate)", marginBottom: 20 }}>
        This is the reference module. Everything here is tenant-isolated
        automatically — you only see your organization's data.
      </p>

      <form
        onSubmit={add}
        className="card"
        style={{ padding: 20, marginBottom: 24, maxWidth: 560 }}
      >
        <div className="field">
          <label>Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review Q3 access controls"
          />
        </div>
        <div className="field">
          <label>Notes</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <button className="btn btn-primary">Add item</button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--slate)" }}>No items yet.</p>
      ) : (
        <div className="card" style={{ overflow: "hidden", maxWidth: 720 }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
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
                      onClick={() => remove(it.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
