interface VersionControlPanelProps {
  dashboardId: string;
}

export function VersionControlPanel({ dashboardId }: VersionControlPanelProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <strong>Version control</strong>
      <p style={{ marginBottom: 0 }}>History panel placeholder for dashboard: {dashboardId}</p>
    </div>
  );
}
