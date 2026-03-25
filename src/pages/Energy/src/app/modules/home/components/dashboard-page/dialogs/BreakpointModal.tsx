import { useState } from "react";

export type DashboardBreakpointId = "default" | "lg" | "md" | "sm" | "xs";

interface Props {
  current: DashboardBreakpointId;
  onSave: (bp: DashboardBreakpointId) => void;
  onCancel: () => void;
}

const OPTIONS: { id: DashboardBreakpointId; label: string }[] = [
  { id: "default", label: "Default (≥0px)" },
  { id: "lg", label: "Large" },
  { id: "md", label: "Medium" },
  { id: "sm", label: "Small" },
  { id: "xs", label: "Extra small" },
];

export function BreakpointModal({ current, onSave, onCancel }: Props) {
  const [v, setV] = useState(current);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontSize: 13 }}>
        Select the responsive breakpoint to preview (maps to Angular <code>tb-select-dashboard-breakpoint</code>).
      </p>
      <select value={v} onChange={(e) => setV(e.target.value as DashboardBreakpointId)} style={{ padding: 8 }}>
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => onSave(v)}>
          OK
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
