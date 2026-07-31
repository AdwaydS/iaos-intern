import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function DepartmentalScorecardView() {
  return (
    <AnalysisPage
      endpoint="departmental-scorecard"
      exportFilename="departmental-scorecard"
      columns={COLUMNS.scorecard}
      searchKeys={["department"]}
    />
  );
}
