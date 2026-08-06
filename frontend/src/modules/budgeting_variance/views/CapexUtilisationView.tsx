import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function CapexUtilisationView() {
  return (
    <AnalysisPage
      endpoint="capex-utilisation"
      exportFilename="capex-utilisation"
      chartTitle="Capex Utilisation by Project"
      columns={COLUMNS.capex}
      searchKeys={["project_id", "project_name"]}
    />
  );
}
