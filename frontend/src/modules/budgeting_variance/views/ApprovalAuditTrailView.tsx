import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ApprovalAuditTrailView() {
  return (
    <AnalysisPage
      endpoint="approval-audit-trail"
      exportFilename="approval-audit-trail"
      columns={COLUMNS.approvalTrail}
      searchKeys={["event_id", "actor", "entity", "action"]}
    />
  );
}
