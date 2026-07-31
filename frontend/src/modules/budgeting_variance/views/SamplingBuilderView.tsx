import AnalysisPage from "../components/AnalysisPage";
import { COLUMNS } from "../constants/columns";

export default function SamplingBuilderView() {
  return (
    <AnalysisPage
      endpoint="sampling-builder"
      exportFilename="sampling-builder"
      columns={COLUMNS.sampling}
      searchKeys={["sample_id", "population"]}
    />
  );
}
