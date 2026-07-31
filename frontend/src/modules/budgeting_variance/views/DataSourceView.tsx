import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function DataSourceView() {
  return (
    <AnalysisPage
      endpoint="data-sources"
      exportFilename="data-sources"
      columns={COLUMNS.dataSources}
      searchKeys={["connector_id", "name", "type"]}
    />
  );
}
