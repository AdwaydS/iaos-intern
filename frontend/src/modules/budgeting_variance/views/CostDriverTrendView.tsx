import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function CostDriverTrendView() {
  return (
    <AnalysisPage
      endpoint="cost-driver-trend"
      exportFilename="cost-driver-trend"
      chartTitle="Cost Driver Decomposition"
      columns={COLUMNS.costDriver}
      searchKeys={["driver"]}
    />
  );
}
