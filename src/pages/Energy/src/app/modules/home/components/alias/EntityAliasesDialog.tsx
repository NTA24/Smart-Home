interface EntityAliasesDialogProps {
  onClose: () => void;
}

export function EntityAliasesDialog({ onClose }: EntityAliasesDialogProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h4>Entity aliases</h4>
      <p>Alias editor placeholder.</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
