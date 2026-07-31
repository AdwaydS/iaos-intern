import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function FlashVsFinalView() {
  return (
    <AnalysisPage
      endpoint="flash-vs-final"
      exportFilename="flash-vs-final"
      columns={COLUMNS.flashFinal}
      searchKeys={["period", "cost_center"]}
    />
  );
}
