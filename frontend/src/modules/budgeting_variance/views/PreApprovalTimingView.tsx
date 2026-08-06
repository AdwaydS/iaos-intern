import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function PreApprovalTimingView() {
  return (
    <AnalysisPage
      endpoint="pre-approval-timing"
      exportFilename="pre-approval-timing"
      chartTitle="Pre-Approval Compliance by Cost Centre"
      chartFootnote="% approved before period start (target 100%)"
      columns={COLUMNS.preApproval}
      searchKeys={["cost_center", "owner", "department"]}
    />
  );
}
