import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function RuleLibraryView() {
  return (
    <AnalysisPage
      endpoint="rule-library"
      exportFilename="rule-library"
      columns={COLUMNS.rules}
      searchKeys={["rule_id", "name", "category"]}
    />
  );
}
