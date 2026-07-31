import { Icon } from "../../../components/Icon";
import type { IconName } from "../../../components/Icon";
import type { KpiItem } from "../types";

interface KpiStripProps {
  items: KpiItem[];
}

const TONE_CLASS: Record<string, string> = {
  navy: "tone-navy",
  gold: "tone-gold",
  success: "tone-success",
  danger: "tone-danger",
};

export default function KpiStrip({ items }: KpiStripProps) {
  return (
    <div className="bgt-kpi-strip">
      {items.map((kpi) => (
        <div key={kpi.label} className="card bgt-kpi">
          <span className={`bgt-kpi-icon ${TONE_CLASS[kpi.tone ?? "navy"]}`}>
            <Icon name={(kpi.icon ?? "activity") as IconName} size={20} />
          </span>
          <div className="bgt-kpi-body">
            <span className="bgt-kpi-value">{kpi.value}</span>
            <span className="bgt-kpi-label">{kpi.label}</span>
            {kpi.sublabel && (
              <span className="bgt-kpi-sublabel">{kpi.sublabel}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
