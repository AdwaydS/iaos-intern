import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function RCMView() {
  return (
    <AnalysisPage
      endpoint="rcm"
      exportFilename="risk-control-matrix"
      chartTitle="Risk & Control Assertion Coverage"
      columns={COLUMNS.rcm}
      searchKeys={["risk_id", "financial_assertion", "control_description", "control_owner"]}
    />
  );
}
