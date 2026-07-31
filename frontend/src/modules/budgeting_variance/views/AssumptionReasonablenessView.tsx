import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function AssumptionReasonablenessView() {
  return (
    <AnalysisPage
      endpoint="assumption-reasonableness"
      exportFilename="assumption-reasonableness"
      columns={COLUMNS.assumption}
      searchKeys={["assumption_id", "category"]}
    />
  );
}
