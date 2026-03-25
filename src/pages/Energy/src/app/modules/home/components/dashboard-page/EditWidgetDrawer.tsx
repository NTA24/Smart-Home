import { useState } from "react";
import type { Widget } from "../../../../shared/models/dashboard.models";

interface Props {
  widget: Widget;
  onApply: (w: Widget) => void;
  onClose: () => void;
  onRemove: () => void;
}

export function EditWidgetDrawer({ widget, onApply, onClose, onRemove }: Props) {
  const [title, setTitle] = useState(widget.config?.title ?? "");
  const [typeFullFqn, setTypeFullFqn] = useState(widget.typeFullFqn ?? "");
  const [sizeX, setSizeX] = useState(String(widget.sizeX ?? 4));
  const [sizeY, setSizeY] = useState(String(widget.sizeY ?? 3));
  const [row, setRow] = useState(String(widget.row ?? 0));
  const [col, setCol] = useState(String(widget.col ?? 0));

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }} />
      </label>
      <label>
        typeFullFqn
        <input value={typeFullFqn} onChange={(e) => setTypeFullFqn(e.target.value)} style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }} />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label>
          sizeX
          <input value={sizeX} onChange={(e) => setSizeX(e.target.value)} />
        </label>
        <label>
          sizeY
          <input value={sizeY} onChange={(e) => setSizeY(e.target.value)} />
        </label>
        <label>
          row
          <input value={row} onChange={(e) => setRow(e.target.value)} />
        </label>
        <label>
          col
          <input value={col} onChange={(e) => setCol(e.target.value)} />
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() =>
            onApply({
              ...widget,
              typeFullFqn,
              sizeX: Number(sizeX) || 4,
              sizeY: Number(sizeY) || 3,
              row: Number(row) || 0,
              col: Number(col) || 0,
              config: { ...widget.config, title },
            })
          }
        >
          Apply
        </button>
        <button type="button" onClick={onRemove} style={{ color: "crimson" }}>
          Remove widget
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
