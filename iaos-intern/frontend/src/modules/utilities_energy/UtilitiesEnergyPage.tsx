import { useEffect, useState } from "react";
import { del, get, patch, post } from "../../lib/api";
import { Icon } from "../../components/Icon";

const SLUG = "utilities_energy";

// ---------------------------------------------------------------------------
// Types (mirror backend schemas.py)
// ---------------------------------------------------------------------------

interface UtilityRecord {
  id: number;
  site: string;
  cost_centre: string;
  period_start: string;
  period_end: string;
  energy_consumed_kwh: number;
  output_units: number;
  sanctioned_load_kva: number;
  contract_demand_kva: number;
  actual_demand_kva: number;
  power_factor: number;
  fuel_type: string;
  fuel_consumed_litres: number;
  fuel_norm_litres_per_unit: number;
  fuel_opening_stock: number;
  fuel_purchased: number;
  fuel_closing_stock: number;
  billed_units_kwh: number;
  meter_reading_units_kwh: number;
  tariff_rate: number;
  section: string;
  submeter_units_kwh: number;
  transmission_input_units: number;
  transmission_output_units: number;
  renewable_units_kwh: number;
  open_access_savings: number;
  water_consumed_kl: number;
  effluent_charges: number;
  equipment_id: string;
  running_hours: number;
  production_hours: number;
  peak_units_kwh: number;
  offpeak_units_kwh: number;
  emission_factor_kgco2_per_kwh: number;
  notes: string;
}

interface CheckMeta {
  key: string;
  label: string;
  description: string;
}

interface CheckRun {
  id: number;
  check_key: string;
  run_at: string;
  records_scanned: number;
  exceptions_found: number;
}

interface GenericException {
  id: number;
  module_key: string;
  check_key: string;
  description: string;
  status: "open" | "under_review" | "cleared" | "confirmed";
  metric_value: number;
  threshold_value: number;
}

interface ModuleSummary {
  module_key: string;
  risk_score: number | null;
  open_exceptions: number;
  total_exceptions: number;
  coverage_pct: number | null;
  trend: string;
}

// ---------------------------------------------------------------------------
// Record form field groups — mirrors the backend model's own grouping
// comments, so the form isn't just 30 flat inputs.
// ---------------------------------------------------------------------------

type FieldKind = "text" | "number" | "date";
interface FieldDef {
  name: keyof UtilityRecordForm;
  label: string;
  kind: FieldKind;
}

type UtilityRecordForm = Omit<UtilityRecord, "id">;

const EMPTY_FORM: UtilityRecordForm = {
  site: "",
  cost_centre: "",
  period_start: "",
  period_end: "",
  energy_consumed_kwh: 0,
  output_units: 0,
  sanctioned_load_kva: 0,
  contract_demand_kva: 0,
  actual_demand_kva: 0,
  power_factor: 0,
  fuel_type: "",
  fuel_consumed_litres: 0,
  fuel_norm_litres_per_unit: 0,
  fuel_opening_stock: 0,
  fuel_purchased: 0,
  fuel_closing_stock: 0,
  billed_units_kwh: 0,
  meter_reading_units_kwh: 0,
  tariff_rate: 0,
  section: "",
  submeter_units_kwh: 0,
  transmission_input_units: 0,
  transmission_output_units: 0,
  renewable_units_kwh: 0,
  open_access_savings: 0,
  water_consumed_kl: 0,
  effluent_charges: 0,
  equipment_id: "",
  running_hours: 0,
  production_hours: 0,
  peak_units_kwh: 0,
  offpeak_units_kwh: 0,
  emission_factor_kgco2_per_kwh: 0,
  notes: "",
};

const FIELD_GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Basic",
    fields: [
      { name: "site", label: "Site", kind: "text" },
      { name: "cost_centre", label: "Cost Centre", kind: "text" },
      { name: "period_start", label: "Period Start", kind: "date" },
      { name: "period_end", label: "Period End", kind: "date" },
      { name: "section", label: "Section", kind: "text" },
      { name: "equipment_id", label: "Equipment ID", kind: "text" },
    ],
  },
  {
    title: "Energy & Demand",
    fields: [
      { name: "energy_consumed_kwh", label: "Energy Consumed (kWh)", kind: "number" },
      { name: "output_units", label: "Output Units", kind: "number" },
      { name: "sanctioned_load_kva", label: "Sanctioned Load (kVA)", kind: "number" },
      { name: "contract_demand_kva", label: "Contract Demand (kVA)", kind: "number" },
      { name: "actual_demand_kva", label: "Actual Demand (kVA)", kind: "number" },
      { name: "power_factor", label: "Power Factor", kind: "number" },
    ],
  },
  {
    title: "Fuel",
    fields: [
      { name: "fuel_type", label: "Fuel Type", kind: "text" },
      { name: "fuel_consumed_litres", label: "Fuel Consumed (l)", kind: "number" },
      { name: "fuel_norm_litres_per_unit", label: "Fuel Norm (l/unit)", kind: "number" },
      { name: "fuel_opening_stock", label: "Fuel Opening Stock", kind: "number" },
      { name: "fuel_purchased", label: "Fuel Purchased", kind: "number" },
      { name: "fuel_closing_stock", label: "Fuel Closing Stock", kind: "number" },
    ],
  },
  {
    title: "Billing & Metering",
    fields: [
      { name: "billed_units_kwh", label: "Billed Units (kWh)", kind: "number" },
      { name: "meter_reading_units_kwh", label: "Meter Reading (kWh)", kind: "number" },
      { name: "tariff_rate", label: "Tariff Rate", kind: "number" },
      { name: "submeter_units_kwh", label: "Sub-Meter Units (kWh)", kind: "number" },
    ],
  },
  {
    title: "Loss, Renewables & Water",
    fields: [
      { name: "transmission_input_units", label: "Transmission Input Units", kind: "number" },
      { name: "transmission_output_units", label: "Transmission Output Units", kind: "number" },
      { name: "renewable_units_kwh", label: "Renewable Units (kWh)", kind: "number" },
      { name: "open_access_savings", label: "Open-Access Savings", kind: "number" },
      { name: "water_consumed_kl", label: "Water Consumed (kL)", kind: "number" },
      { name: "effluent_charges", label: "Effluent Charges", kind: "number" },
    ],
  },
  {
    title: "Load Profile",
    fields: [
      { name: "running_hours", label: "Running Hours", kind: "number" },
      { name: "production_hours", label: "Production Hours", kind: "number" },
      { name: "peak_units_kwh", label: "Peak Units (kWh)", kind: "number" },
      { name: "offpeak_units_kwh", label: "Off-Peak Units (kWh)", kind: "number" },
    ],
  },
  {
    title: "Emissions & Notes",
    fields: [
      { name: "emission_factor_kgco2_per_kwh", label: "Emission Factor (kgCO2/kWh)", kind: "number" },
      { name: "notes", label: "Notes", kind: "text" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UtilitiesEnergyPage() {
  const [summary, setSummary] = useState<ModuleSummary | null>(null);
  const [records, setRecords] = useState<UtilityRecord[]>([]);
  const [checks, setChecks] = useState<CheckMeta[]>([]);
  const [runs, setRuns] = useState<CheckRun[]>([]);
  const [exceptions, setExceptions] = useState<GenericException[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UtilityRecordForm>(EMPTY_FORM);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [lastRunMessage, setLastRunMessage] = useState<string | null>(null);

  async function refreshAll() {
    const [summaryRes, recordsRes, checksRes, runsRes, exceptionsRes] = await Promise.all([
      get<ModuleSummary>(`/api/framework/dashboard/${SLUG}`),
      get<UtilityRecord[]>(`/api/modules/${SLUG}/records`),
      get<CheckMeta[]>(`/api/modules/${SLUG}/checks`),
      get<CheckRun[]>(`/api/modules/${SLUG}/runs`),
      get<GenericException[]>(`/api/framework/exceptions/${SLUG}`),
    ]);
    setSummary(summaryRes);
    setRecords(recordsRes);
    setChecks(checksRes);
    setRuns(runsRes);
    setExceptions(exceptionsRes);
    setLoading(false);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  function updateField(name: keyof UtilityRecordForm, value: string) {
    const isNumber = typeof EMPTY_FORM[name] === "number";
    setForm((prev) => ({
      ...prev,
      [name]: isNumber ? Number(value || 0) : value,
    }));
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!form.site.trim() || !form.period_start || !form.period_end) return;
    await post(`/api/modules/${SLUG}/records`, form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    refreshAll();
  }

  async function removeRecord(id: number) {
    await del(`/api/modules/${SLUG}/records/${id}`);
    refreshAll();
  }

  async function runCheck(key: string) {
    setRunningKey(key);
    setLastRunMessage(null);
    try {
      const result = await post<CheckRun>(`/api/modules/${SLUG}/checks/${key}/run`, {});
      setLastRunMessage(
        `Scanned ${result.records_scanned} record${result.records_scanned === 1 ? "" : "s"}, ` +
          `found ${result.exceptions_found} exception${result.exceptions_found === 1 ? "" : "s"}.`
      );
      await refreshAll();
    } finally {
      setRunningKey(null);
    }
  }

  async function updateException(id: number, status: GenericException["status"]) {
    await patch(`/api/modules/${SLUG}/exceptions/${id}`, { status });
    refreshAll();
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <p style={{ color: "var(--slate)", marginBottom: 20 }}>
        Assurance over power, fuel and utility costs — consumption vs output, tariff/contract-demand
        optimisation, and loss/leakage analytics. Data below is tenant-isolated automatically.
      </p>

      {/* --- Dashboard summary --- */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <SummaryCard label="Open Exceptions" value={String(summary.open_exceptions)} />
          <SummaryCard label="Total Exceptions" value={String(summary.total_exceptions)} />
          <SummaryCard
            label="Check Coverage"
            value={summary.coverage_pct !== null ? `${summary.coverage_pct}%` : "—"}
          />
          <SummaryCard label="Risk Score" value={summary.risk_score !== null ? String(summary.risk_score) : "—"} />
        </div>
      )}

      {/* --- Add record --- */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Utility Records</strong>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Icon name="plus" size={16} style={{ marginRight: 6 }} />
            {showForm ? "Cancel" : "Add Record"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={addRecord} style={{ marginTop: 16 }}>
            {FIELD_GROUPS.map((group) => (
              <fieldset
                key={group.title}
                style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 12 }}
              >
                <legend style={{ padding: "0 6px", color: "var(--slate)", fontSize: 13 }}>{group.title}</legend>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {group.fields.map((f) => (
                    <div className="field" key={f.name}>
                      <label>{f.label}</label>
                      <input
                        className="input"
                        type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : "text"}
                        step={f.kind === "number" ? "any" : undefined}
                        value={String(form[f.name] ?? "")}
                        onChange={(e) => updateField(f.name, e.target.value)}
                        required={f.name === "site" || f.name === "period_start" || f.name === "period_end"}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="btn btn-primary">Save Record</button>
          </form>
        )}

        {records.length === 0 ? (
          <p style={{ color: "var(--slate)", marginTop: 12 }}>No records yet.</p>
        ) : (
          <table style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Site</th>
                <th>Period</th>
                <th>Energy (kWh)</th>
                <th>Power Factor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.site}</td>
                  <td>
                    {r.period_start} → {r.period_end}
                  </td>
                  <td>{r.energy_consumed_kwh}</td>
                  <td>{r.power_factor}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => removeRecord(r.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Signature checks --- */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <strong>Signature Checks</strong>
        {lastRunMessage && (
          <p style={{ color: "var(--slate)", marginTop: 8, marginBottom: 0 }}>{lastRunMessage}</p>
        )}
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Check</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.key}>
                <td>{c.label}</td>
                <td style={{ color: "var(--slate)" }}>{c.description}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "6px 12px" }}
                    disabled={runningKey === c.key}
                    onClick={() => runCheck(c.key)}
                  >
                    {runningKey === c.key ? "Running…" : "Run"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Run history --- */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <strong>Run History</strong>
        {runs.length === 0 ? (
          <p style={{ color: "var(--slate)", marginTop: 12 }}>No checks run yet.</p>
        ) : (
          <table style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Check</th>
                <th>Run At</th>
                <th>Records Scanned</th>
                <th>Exceptions Found</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td>{checks.find((c) => c.key === r.check_key)?.label ?? r.check_key}</td>
                  <td>{new Date(r.run_at).toLocaleString()}</td>
                  <td>{r.records_scanned}</td>
                  <td>{r.exceptions_found}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Exception queue --- */}
      <div className="card" style={{ padding: 20 }}>
        <strong>
          <Icon name="alert-triangle" size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} />
          Exception Queue
        </strong>
        {exceptions.length === 0 ? (
          <p style={{ color: "var(--slate)", marginTop: 12 }}>No exceptions raised.</p>
        ) : (
          <table style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Check</th>
                <th>Description</th>
                <th>Metric</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((ex) => (
                <tr key={ex.id}>
                  <td>{checks.find((c) => c.key === ex.check_key)?.label ?? ex.check_key}</td>
                  <td style={{ color: "var(--slate)" }}>{ex.description}</td>
                  <td>{ex.metric_value}</td>
                  <td>{ex.threshold_value}</td>
                  <td>
                    <select
                      className="input"
                      value={ex.status}
                      onChange={(e) => updateException(ex.id, e.target.value as GenericException["status"])}
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="cleared">Cleared</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ color: "var(--slate)", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}