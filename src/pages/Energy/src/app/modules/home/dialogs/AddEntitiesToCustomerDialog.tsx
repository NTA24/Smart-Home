interface AddEntitiesToCustomerDialogProps {
  customerId: string;
  onClose: (updated: boolean) => void;
}

export function AddEntitiesToCustomerDialog({ customerId, onClose }: AddEntitiesToCustomerDialogProps) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h4>Assign dashboards to customer</h4>
      <p>Customer: {customerId}</p>
      <button onClick={() => onClose(true)}>Assign</button>
      <button onClick={() => onClose(false)}>Cancel</button>
    </div>
  );
}
