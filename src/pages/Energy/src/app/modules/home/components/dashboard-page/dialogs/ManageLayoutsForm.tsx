import { useState } from "react";

interface Props {
  showMain: boolean;
  showRight: boolean;
  onSave: (main: boolean, right: boolean) => void;
  onCancel: () => void;
}

export function ManageLayoutsForm({ showMain, showRight, onSave, onCancel }: Props) {
  const [main, setMain] = useState(showMain);
  const [right, setRight] = useState(showRight);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontSize: 13 }}>Show or hide the main and right dashboard columns (simplified vs full Angular dialog).</p>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={main} onChange={(e) => setMain(e.target.checked)} />
        Main layout
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={right} onChange={(e) => setRight(e.target.checked)} />
        Right layout
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => onSave(main, right)}>
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
