import type { Widget } from "../../../../shared/models/dashboard.models";

function norm(w: Widget): string {
  return `${w.typeFullFqn ?? ""} ${w.type ?? ""}`.toLowerCase();
}

/** Lightweight visual hint for widget type (not real TB widget runtime). */
export function WidgetTilePreview({ widget }: { widget: Widget }) {
  const t = norm(widget);
  if (t.includes("map") || t.includes("openstreetmap") || t.includes("image")) {
    return (
      <div
        style={{
          height: 44,
          marginTop: 6,
          borderRadius: 4,
          background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "#006064",
          fontWeight: 600,
        }}
      >
        Map / image
      </div>
    );
  }
  if (
    t.includes("timeseries") ||
    t.includes("chart") ||
    t.includes("bar") ||
    t.includes("line") ||
    t.includes("latest")
  ) {
    return (
      <svg
        width="100%"
        height={44}
        viewBox="0 0 120 44"
        style={{ marginTop: 6, display: "block" }}
        aria-hidden
      >
        <rect x={0} y={0} width={120} height={44} fill="#f5f5f5" rx={4} />
        <polyline
          fill="none"
          stroke="#1976d2"
          strokeWidth={1.5}
          points="4,36 20,28 36,32 52,18 68,24 84,12 100,20 116,8"
        />
        <line x1={4} y1={38} x2={116} y2={38} stroke="#bdbdbd" strokeWidth={1} />
      </svg>
    );
  }
  if (t.includes("alarm") || t.includes("notification")) {
    return (
      <div
        style={{
          height: 44,
          marginTop: 6,
          borderRadius: 4,
          background: "#fff3e0",
          border: "1px dashed #ff9800",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          color: "#e65100",
        }}
      >
        Alarms
      </div>
    );
  }
  return (
    <div
      style={{
        height: 36,
        marginTop: 6,
        borderRadius: 4,
        background: "#eceff1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        color: "#78909c",
      }}
    >
      Widget
    </div>
  );
}
