interface DashboardWidgetSelectProps {
  onSelect: (widgetType: string) => void;
}

export function DashboardWidgetSelect({ onSelect }: DashboardWidgetSelectProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => onSelect("timeseries")}>Timeseries</button>
      <button onClick={() => onSelect("latest-values")}>Latest values</button>
      <button onClick={() => onSelect("alarm-table")}>Alarm table</button>
    </div>
  );
}
