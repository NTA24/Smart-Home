interface AddEntitiesToEdgeDialogProps {
  edgeId: string;
  onClose: (updated: boolean) => void;
}

export function AddEntitiesToEdgeDialog({ edgeId, onClose }: AddEntitiesToEdgeDialogProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h4>Assign dashboards to edge</h4>
      <p>Edge: {edgeId}</p>
      <button onClick={() => onClose(true)}>Assign</button>
      <button onClick={() => onClose(false)}>Cancel</button>
    </div>
  );
}
