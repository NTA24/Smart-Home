import { useState } from "react";

interface Props {
  stateIds: string[];
  onSave: (ids: string[]) => void;
  onCancel: () => void;
}

export function ManageStatesForm({ stateIds, onSave, onCancel }: Props) {
  const [ids, setIds] = useState(stateIds.join("\n"));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ fontSize: 13 }}>
        One state id per line (must include <code>default</code>).
      </p>
      <textarea value={ids} onChange={(e) => setIds(e.target.value)} rows={8} style={{ width: "100%", fontFamily: "monospace" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            const next = ids
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            if (!next.includes("default")) {
              next.unshift("default");
            }
            onSave(next);
          }}
        >
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
