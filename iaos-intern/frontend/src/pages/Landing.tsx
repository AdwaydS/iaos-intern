import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Icon, type IconName } from "../components/Icon";
import "./landing.css";

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "building",
    title: "Multi-tenant by design",
    body: "Every organization gets an isolated workspace. Data never crosses tenant boundaries — enforced at the query layer.",
  },
  {
    icon: "layers",
    title: "80+ modular workspaces",
    body: "Risk registers, control testing, issue tracking, working papers — each an independent, plug-in module.",
  },
  {
    icon: "shield",
    title: "Role-based governance",
    body: "Super admins oversee the platform, tenant admins run self-service user management, auditors get to work.",
  },
  {
    icon: "activity",
    title: "Self-service onboarding",
    body: "Stand up your organization in seconds. No procurement queues, no IT tickets — just sign up and audit.",
  },
];

const STATS = [
  { n: "80+", l: "Audit modules" },
  { n: "100%", l: "Tenant isolation" },
  { n: "SOC-ready", l: "Access controls" },
  { n: "24/7", l: "Availability" },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="lp-nav">
        <Logo size={34} />
        <nav className="lp-nav-links">
          <a href="#features">Platform</a>
          <a href="#why">Why IAOS</a>
          <Link to="/login" className="lp-nav-login">
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-inner">
          <span className="lp-eyebrow">
            <span className="lp-eyebrow-dot" /> Cap Corporate · Internal Audit OS
          </span>
          <h1>
            The operating system for{" "}
            <span className="hl">modern internal audit</span>.
          </h1>
          <p className="lp-sub">
            IAOS unifies risk, controls, and assurance across every entity you
            oversee — in one secure, multi-tenant platform built for scale.
          </p>
          <div className="lp-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start free
              <Icon name="chevron-right" size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign in to your workspace
            </Link>
          </div>
          <div className="lp-stats">
            {STATS.map((s) => (
              <div key={s.l} className="lp-stat">
                <strong>{s.n}</strong>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <h2>One platform, every audit discipline</h2>
        <p className="lp-section-sub">
          Built as independent modules so teams move fast without stepping on
          each other.
        </p>
        <div className="lp-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature card">
              <div className="lp-feature-icon">
                <Icon name={f.icon} size={22} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-band" id="why">
        <div className="lp-band-inner">
          <h2>Assurance you can trust, architecture you can scale.</h2>
          <p>
            From a single audit team to an enterprise with dozens of entities,
            IAOS grows with you — every tenant isolated, every module composable.
          </p>
          <Link to="/signup" className="btn btn-gold btn-lg">
            Create your workspace
            <Icon name="chevron-right" size={18} />
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <Logo size={28} />
        <span>
          © {new Date().getFullYear()} Cap Corporate. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
