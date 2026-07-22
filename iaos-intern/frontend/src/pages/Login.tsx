import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { ApiError } from "../lib/api";
import "./auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-brandside">
        <Logo size={38} />
        <div className="auth-brandcopy">
          <h2>Welcome back to your audit workspace.</h2>
          <p>
            Secure, multi-tenant, and built for the way modern assurance teams
            work.
          </p>
          <ul className="auth-points">
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Isolated workspace per organization
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Role-based access and governance
            </li>
            <li>
              <span className="auth-check">
                <Icon name="check" size={14} />
              </span>
              Modular audit disciplines
            </li>
          </ul>
        </div>
        <span className="auth-brand-foot">© Cap Corporate</span>
      </div>

      <div className="auth-formside">
        <form className="auth-card" onSubmit={submit}>
          <h1>Sign in</h1>
          <p className="auth-lead">Access your IAOS workspace.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="field">
            <label>Work email</label>
            <div className="input-wrap">
              <span className="input-icon">
                <Icon name="mail" size={17} />
              </span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <Icon name="lock" size={17} />
              </span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p className="auth-alt">
            New to IAOS? <Link to="/signup">Create a workspace</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
