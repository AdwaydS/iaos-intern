import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ZeroBasedBudgetView() {
  return (
    <AnalysisPage
      endpoint="zero-based-budget"
      exportFilename="zero-based-budget"
      columns={COLUMNS.zbb}
      searchKeys={["package_id", "activity", "department"]}
    />
  );
}
