import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ChronicOverspendView() {
  return (
    <AnalysisPage
      endpoint="chronic-overspend"
      exportFilename="chronic-overspend"
      chartTitle="Chronic Overspend by Cost Centre"
      chartFootnote="Heads exceeding budget by >5% for 3+ consecutive periods"
      columns={COLUMNS.chronicOverspend}
      searchKeys={["cost_center", "cost_head"]}
    />
  );
}
