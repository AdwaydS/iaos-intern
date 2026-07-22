import { useState } from "react";
import "../styles/dataAnalytics.css";

import Dashboard from "../dashboard/Dashboard";
import DataIngestion from "../components/DataIngestion";
import DataQuality from "../components/DataQuality";
import ScriptLibrary from "../components/ScriptLibrary";
import Exceptions from "../components/Exceptions";
import Benford from "../components/Benford";
import DuplicateDetection from "../components/DuplicateDetection";
import Monitoring from "../components/Monitoring";
import Scheduler from "../components/Scheduler";
import Evidence from "../components/Evidence";
import GapSequence from "../components/GapSequence";
import OutlierModels from "../components/OutlierModels";
import TrendRatio from "../components/TrendRatio";
import TextNLP from "../components/TextNLP";
import NetworkAnalysis from "../components/NetworkAnalysis";
import VisualAnalytics from "../components/VisualAnalytics";
import ScenarioSandbox from "../components/ScenarioSandbox";
import ResultPipeline from "../components/ResultPipeline";
import ModelGovernance from "../components/ModelGovernance";
import ScheduledJobs from "../components/ScheduledJobs";
import ModuleDashboard from "../dashboard/ModuleDashboard";
import ScopeAuditUniverse from "../governance/ScopeAuditUniverse";
import RiskControlMatrix from "../governance/RiskControlMatrix";
import RuleLibrary from "../governance/RuleLibrary";
import DataSources from "../operations/DataSources";
import SamplingBuilder from "../operations/SamplingBuilder";
import ExceptionQueue from "../operations/ExceptionQueue";
import WorkingPapers from "../operations/WorkingPapers";
import FindingsLog from "../operations/FindingsLog";
import RemediationTracker from "../operations/RemediationTracker";

const tabs = [
  "Dashboard",
  "Data Ingestion",
  "Data Quality",
  "Script Library",
  "Exceptions",
  "Benford",
  "Duplicate Detection",
  "Monitoring",
  "Scheduler",
  "Evidence",
  "Gap & Sequence",
  "Outlier Models",
  "Trend & Ratio",
  "Text & NLP",
  "Network Analysis",
  "Visual Analytics",
  "Scenario Sandbox",
  "Result Pipeline",
  "Model Governance",
  "Scheduled Jobs",

  // Governance
  "Module Dashboard",
  "Scope & Audit Universe",
  "Risk & Control Matrix",
  "Rule Library",

  // Operations
  "Data Sources",
  "Sampling Builder",
  "Exception Queue",
  "Working Papers",
  "Findings Log",
  "Remediation Tracker",
];

export default function DataAnalyticsCaatPage() {
  const [active, setActive] = useState("Dashboard");

  function renderContent() {
    switch (active) {
      case "Dashboard":
        return <Dashboard />;

      case "Data Ingestion":
        return <DataIngestion />;

      case "Data Quality":
        return <DataQuality />;

      case "Script Library":
        return <ScriptLibrary />;

      case "Exceptions":
        return <Exceptions />;

      case "Benford":
        return <Benford />;

      case "Duplicate Detection":
        return <DuplicateDetection />;

      case "Monitoring":
        return <Monitoring />;

      case "Scheduler":
        return <Scheduler />;

      case "Evidence":
        return <Evidence />;

      case "Gap & Sequence":
        return <GapSequence />;  

      case "Outlier Models":
        return <OutlierModels />;  

      case "Trend & Ratio":
        return <TrendRatio />;  

      case "Text & NLP":
        return <TextNLP />;  

      case "Network Analysis":
        return <NetworkAnalysis />;  

      case "Visual Analytics":
        return <VisualAnalytics />;  

      case "Scenario Sandbox":
        return <ScenarioSandbox />;  

      case "Result Pipeline":
        return <ResultPipeline />;  

      case "Model Governance":
        return <ModelGovernance />;  

      case "Scheduled Jobs":
        return <ScheduledJobs />;  

      case "Module Dashboard":
        return <ModuleDashboard />;  
      
      case "Scope & Audit Universe":
        return <ScopeAuditUniverse />;  

      case "Risk & Control Matrix":
        return <RiskControlMatrix />;  

      case "Rule Library":
        return <RuleLibrary />; 
        
      case "Data Sources":
        return <DataSources />;  

      case "Sampling Builder":
        return <SamplingBuilder />;

      case "Exception Queue":
        return <ExceptionQueue />;

      case "Working Papers":
        return <WorkingPapers />;

      case "Findings Log":
        return <FindingsLog />;

      case "Remediation Tracker":
        return <RemediationTracker />;  

      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="caat-page">

      <h1>Data Analytics & CAAT Engine</h1>

      <p className="subtitle">
        Computer Assisted Audit Techniques
      </p>

      <div className="caat-tabs">

        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              active === tab
                ? "tab-btn active"
                : "tab-btn"
            }
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}

      </div>

      {renderContent()}

    </div>
  );
}