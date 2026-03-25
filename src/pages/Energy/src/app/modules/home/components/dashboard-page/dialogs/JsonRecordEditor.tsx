import { useState } from "react";

interface Props {
  title: string;
  value: Record<string, unknown>;
  onSave: (next: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function JsonRecordEditor({ title, value, onSave, onCancel }: Props) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);

  return (
    <div>
      <p style={{ fontSize: 13, opacity: 0.85 }}>{title}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
      />
      {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => {
            try {
              const parsed = JSON.parse(text) as Record<string, unknown>;
              if (typeof parsed !== "object" || parsed === null) {
                throw new Error("Root value must be a JSON object");
              }
              setErr(null);
              onSave(parsed);
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Invalid JSON");
            }
          }}
        >
          Apply
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
