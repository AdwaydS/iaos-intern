import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ActionTrackerView() {
  return (
    <AnalysisPage
      endpoint="action-tracker"
      exportFilename="action-tracker"
      columns={COLUMNS.actions}
      searchKeys={["action_id", "finding_ref", "description", "owner"]}
    />
  );
}
