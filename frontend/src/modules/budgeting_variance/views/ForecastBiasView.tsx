import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function ForecastBiasView() {
  return (
    <AnalysisPage
      endpoint="forecast-bias"
      exportFilename="forecast-bias"
      chartTitle="Forecast-to-Actual Bias by Period"
      chartType="spark"
      chartFootnote="Red bars = Actual > Forecast (under-forecast bias)"
      columns={COLUMNS.forecastBias}
      searchKeys={["period"]}
    />
  );
}
