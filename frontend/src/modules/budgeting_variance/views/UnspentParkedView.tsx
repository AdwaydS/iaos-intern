import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function UnspentParkedView() {
  return (
    <AnalysisPage
      endpoint="unspent-parked"
      exportFilename="unspent-parked"
      chartTitle="Quarterly Parked Budget Release Pattern"
      chartFootnote="Q4 December spike indicates spend-it-or-lose-it behaviour"
      columns={COLUMNS.unspent}
      searchKeys={["cost_center", "department"]}
    />
  );
}
