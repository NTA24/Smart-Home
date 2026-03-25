import type { DashboardTimewindowValue } from "../../../../../shared/models/dashboard.models";

interface Props {
  value: DashboardTimewindowValue | null | undefined;
  isEdit: boolean;
  onChange: (next: DashboardTimewindowValue | null) => void;
  onSaveAsDefault?: () => void;
  showSaveAsDefault?: boolean;
}

const PRESETS_MS = [
  { label: "1 min", ms: 60_000 },
  { label: "1 hour", ms: 3_600_000 },
  { label: "24 hours", ms: 86_400_000 },
  { label: "7 days", ms: 604_800_000 },
];

export function DashboardTimewindow({
  value,
  isEdit,
  onChange,
  onSaveAsDefault,
  showSaveAsDefault,
}: Props) {
  const tw = value ?? { selectedTab: 0, realtime: { timewindowMs: 60_000 } };
  const ms = tw.realtime?.timewindowMs ?? 60_000;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
      <span style={{ fontWeight: 600, opacity: 0.85 }}>Timewindow</span>
      <select
        value={ms}
        disabled={!isEdit}
        onChange={(e) =>
          onChange({
            ...tw,
            selectedTab: 0,
            realtime: { timewindowMs: Number(e.target.value) },
          })
        }
      >
        {PRESETS_MS.map((p) => (
          <option key={p.ms} value={p.ms}>
            {p.label}
          </option>
        ))}
      </select>
      {!isEdit && showSaveAsDefault && onSaveAsDefault && (
        <button type="button" onClick={onSaveAsDefault}>
          Save as default
        </button>
      )}
    </div>
  );
}
