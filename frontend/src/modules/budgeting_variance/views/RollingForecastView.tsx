import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function RollingForecastView() {
  return (
    <AnalysisPage
      endpoint="rolling-forecast"
      exportFilename="rolling-forecast"
      columns={COLUMNS.rollingForecast}
      searchKeys={["department"]}
    />
  );
}
