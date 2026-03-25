import { useState } from "react";

interface Props {
  currentImage?: string;
  onSave: (dataUrl: string | null) => void;
  onCancel: () => void;
}

export function DashboardImageForm({ currentImage, onSave, onCancel }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            return;
          }
          const reader = new FileReader();
          reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
          reader.readAsDataURL(file);
        }}
      />
      {preview && (
        <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => onSave(preview)}>
          Save
        </button>
        <button type="button" onClick={() => onSave(null)}>
          Clear image
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
