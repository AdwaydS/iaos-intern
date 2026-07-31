import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function FindingLogView() {
  return (
    <AnalysisPage
      endpoint="findings"
      exportFilename="findings"
      columns={COLUMNS.findings}
      searchKeys={["finding_id", "title", "department", "owner"]}
    />
  );
}
