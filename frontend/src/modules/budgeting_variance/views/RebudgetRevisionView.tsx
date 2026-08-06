import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function RebudgetRevisionView() {
  return (
    <AnalysisPage
      endpoint="rebudget-revision"
      exportFilename="rebudget-revision"
      columns={COLUMNS.rebudget}
      searchKeys={["revision_id", "cost_center", "reason"]}
    />
  );
}
