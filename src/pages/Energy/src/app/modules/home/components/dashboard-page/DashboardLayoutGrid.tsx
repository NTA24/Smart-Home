import { useState } from "react";
import type { Widget } from "../../../../shared/models/dashboard.models";
import { reorderIdList } from "../../../../shared/models/dashboardLayoutUtils";
import { WidgetTilePreview } from "./WidgetTilePreview";

interface Props {
  layoutId: "main" | "right";
  widgets: Record<string, Widget>;
  isEdit: boolean;
  onWidgetClick: (widgetId: string, widget: Widget) => void;
  /** Move widget to the other column (edit mode). */
  onMoveWidgetToLayout?: (widgetId: string, targetLayout: "main" | "right") => void;
  /** Reorder within this column (edit mode, HTML5 drag). */
  onReorderWidgets?: (orderedIds: string[]) => void;
}

const DND_MIME = "application/x-thingsboard-widget-id";

export function DashboardLayoutGrid({
  layoutId,
  widgets,
  isEdit,
  onWidgetClick,
  onMoveWidgetToLayout,
  onReorderWidgets,
}: Props) {
  const list = Object.entries(widgets);
  const otherLayout: "main" | "right" = layoutId === "main" ? "right" : "main";
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: 140,
        border: "1px solid #cfd8dc",
        borderRadius: 8,
        padding: 10,
        background: "linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#546e7a", marginBottom: 8, letterSpacing: 0.3 }}>
        Layout: {layoutId} · {list.length} widget{list.length === 1 ? "" : "s"}
        {isEdit && onReorderWidgets && list.length > 1 && (
          <span style={{ fontWeight: 400, color: "#90a4ae", marginLeft: 8 }}>— drag ⋮⋮ to reorder</span>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {list.map(([id, w]) => (
          <div
            key={id}
            onDragOver={(e) => {
              if (!isEdit || !onReorderWidgets) {
                return;
              }
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              if (!onReorderWidgets) {
                return;
              }
              e.preventDefault();
              const dragId = e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain");
              if (!dragId) {
                return;
              }
              const ids = list.map(([x]) => x);
              const next = reorderIdList(ids, dragId, id);
              onReorderWidgets(next);
              setDraggingId(null);
            }}
            style={{
              border: "1px solid #b0bec5",
              borderRadius: 6,
              background: "#fff",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 96,
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              opacity: draggingId === id ? 0.55 : 1,
            }}
          >
            <div style={{ display: "flex", height: 28, alignItems: "stretch" }}>
              {isEdit && onReorderWidgets && (
                <div
                  draggable
                  title="Drag to reorder"
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DND_MIME, id);
                    e.dataTransfer.setData("text/plain", id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  style={{
                    width: 28,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "grab",
                    background: "#eceff1",
                    fontSize: 12,
                    color: "#607d8b",
                    userSelect: "none",
                  }}
                >
                  ⋮⋮
                </div>
              )}
              <div
                style={{
                  flex: 1,
                  minHeight: 6,
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => onWidgetClick(id, w)}
              style={{
                flex: 1,
                textAlign: "left",
                padding: "8px 10px",
                border: "none",
                background: isEdit ? "#fff8e1" : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: "#263238", lineHeight: 1.3 }}>
                {String(w.config?.title ?? id)}
              </div>
              <div style={{ fontSize: 11, color: "#607d8b", marginTop: 4, fontFamily: "monospace" }}>
                {w.typeFullFqn ?? w.type ?? "widget"}
              </div>
              <WidgetTilePreview widget={w} />
              <div style={{ fontSize: 10, color: "#90a4ae", marginTop: 6 }}>
                grid {w.col ?? 0},{w.row ?? 0} · {w.sizeX ?? "?"}×{w.sizeY ?? "?"}
              </div>
            </button>
            {isEdit && onMoveWidgetToLayout && (
              <div style={{ padding: "0 8px 8px" }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveWidgetToLayout(id, otherLayout);
                  }}
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "6px 8px",
                    borderRadius: 4,
                    border: "1px solid #90caf9",
                    background: "#e3f2fd",
                    cursor: "pointer",
                  }}
                >
                  Move to {otherLayout}
                </button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ fontSize: 13, color: "#78909c", padding: 12, gridColumn: "1 / -1" }}>
            No widgets in this column. Turn on <strong>Edit</strong> and use <strong>Add widget</strong>, or move a widget from the other column.
          </div>
        )}
      </div>
    </div>
  );
}
