interface StatesComponentProps {
  states: string[];
  currentState: string;
  onChange: (state: string) => void;
}

export function StatesComponent({ states, currentState, onChange }: StatesComponentProps) {
  return (
    <select value={currentState} onChange={(e) => onChange(e.target.value)}>
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
}
