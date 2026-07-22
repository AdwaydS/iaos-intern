import { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

const SLUG = "risk_register";

interface Risk {
  id: number;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  owner: string;
  notes: string;
  score: number;
}

const CATEGORIES = ["Operational", "Financial", "Compliance", "Strategic", "IT"];

function scoreColor(s: number) {
  if (s >= 15) return "badge-danger";
  if (s >= 8) return "badge-gold";
  return "badge-success";
}

export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "Operational",
    likelihood: 3,
    impact: 3,
    owner: "",
    notes: "",
  });

  const load = () => get<Risk[]>(`/api/modules/${SLUG}/risks`).then(setRisks);
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await post(`/api/modules/${SLUG}/risks`, form);
    setForm({ ...form, title: "", owner: "", notes: "" });
    load();
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        <table>
          <thead>
            <tr>
              <th>Risk</th>
              <th>Category</th>
              <th>L×I</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.title}</strong>
                  {r.owner && (
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>
                      Owner: {r.owner}
                    </div>
                  )}
                </td>
                <td>{r.category}</td>
                <td>
                  {r.likelihood} × {r.impact}
                </td>
                <td>
                  <span className={`badge ${scoreColor(r.score)}`}>{r.score}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "6px 12px" }}
                    onClick={async () => {
                      await del(`/api/modules/${SLUG}/risks/${r.id}`);
                      load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {risks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: "var(--slate)" }}>
                  No risks logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={add}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Log a risk</h3>
        <div className="field">
          <label>Risk title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label>Category</label>
          <select
            className="select"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Likelihood (1–5)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={form.likelihood}
              onChange={(e) =>
                setForm({ ...form, likelihood: Number(e.target.value) })
              }
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Impact (1–5)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={5}
              value={form.impact}
              onChange={(e) =>
                setForm({ ...form, impact: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div className="field">
          <label>Owner</label>
          <input
            className="input"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          />
        </div>
        <button className="btn btn-primary btn-block">Add risk</button>
      </form>
    </div>
  );
}
