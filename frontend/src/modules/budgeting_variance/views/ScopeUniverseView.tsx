import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ScopeUniverseView() {
  return (
    <AnalysisPage
      endpoint="scope-universe"
      exportFilename="scope-universe"
      columns={COLUMNS.scope}
      searchKeys={["entity_id", "entity_name"]}
    />
  );
}
