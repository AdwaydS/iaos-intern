import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ContingencyReserveView() {
  return (
    <AnalysisPage
      endpoint="contingency-reserve"
      exportFilename="contingency-reserve"
      columns={COLUMNS.contingency}
      searchKeys={["reserve_id", "type", "approver"]}
    />
  );
}
