import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function BudgetVsActualView() {
  return (
    <AnalysisPage
      endpoint="budget-vs-actual"
      exportFilename="budget-vs-actual"
      chartTitle="Budget vs Actual by Cost Head"
      columns={COLUMNS.budgetVsActual}
      searchKeys={["cost_head", "department", "business_unit"]}
    />
  );
}
