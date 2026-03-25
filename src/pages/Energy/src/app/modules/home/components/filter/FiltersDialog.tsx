interface FiltersDialogProps {
  onClose: () => void;
}

export function FiltersDialog({ onClose }: FiltersDialogProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h4>Dashboard filters</h4>
      <p>Filter editor placeholder.</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
