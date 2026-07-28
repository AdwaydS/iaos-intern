import { useParams } from "react-router-dom";
import { findModule } from "../modules/registry";
import { Icon } from "../components/Icon";
import "./module-host.css";

/** Renders the module whose slug is in the URL. */
export default function ModuleHost() {
  const { slug } = useParams();
  const mod = slug ? findModule(slug) : undefined;

  if (!mod) {
    return (
      <div className="page-head" style={{ padding: "30px", textAlign: "center" }}>
        <h1>Module not found</h1>
        <p style={{ marginTop: "8px", color: "var(--slate)" }}>
          No module is registered for “{slug}”.
        </p>
        <div style={{ marginTop: "20px" }}>
          <a href="/app" className="btn btn-primary btn-sm" style={{ textDecoration: "none", display: "inline-block" }}>
            Return to Main Dashboard
          </a>
        </div>
      </div>
    );
  }

  const Component = mod.component;
  return (
    <div>
      <div className="page-head module-head">
        <div className="module-head-icon">
          <Icon name={mod.icon} size={22} />
        </div>
        <div>
          <h1>{mod.title}</h1>
          <p>{mod.description}</p>
        </div>
      </div>
      <Component />
    </div>
  );
}
