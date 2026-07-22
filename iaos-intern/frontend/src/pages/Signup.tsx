import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { ApiError } from "../lib/api";
import "./auth.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: "",
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-brandside">
        <Logo size={38} />
        <div className="auth-brandcopy">
          <h2>Stand up your audit organization in minutes.</h2>
          <p>
            Self-service onboarding. You become the tenant admin and invite your
            team — no IT tickets required.
          </p>
          <ul className="auth-points">
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Your own isolated workspace
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Invite and manage your team
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Access every audit module
            </li>
          </ul>
        </div>
        <span className="auth-brand-foot">© Cap Corporate</span>
      </div>

      <div className="auth-formside">
        <form className="auth-card" onSubmit={submit}>
          <h1>Create your workspace</h1>
          <p className="auth-lead">Start your organization on IAOS.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="field">
            <label>Organization name</label>
            <input
              className="input"
              value={form.organization_name}
              onChange={set("organization_name")}
              placeholder="Acme Holdings"
              required
            />
          </div>
          <div className="field">
            <label>Your name</label>
            <input
              className="input"
              value={form.full_name}
              onChange={set("full_name")}
              placeholder="Jordan Lee"
              required
            />
          </div>
          <div className="field">
            <label>Work email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Choose a strong password"
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Creating…" : "Create workspace"}
          </button>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
