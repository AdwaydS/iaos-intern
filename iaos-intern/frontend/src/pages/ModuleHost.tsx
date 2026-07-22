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
      <div className="page-head">
        <h1>Module not found</h1>
        <p>No module is registered for “{slug}”.</p>
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
