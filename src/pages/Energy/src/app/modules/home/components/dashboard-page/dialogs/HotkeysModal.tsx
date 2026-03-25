export function HotkeysModalContent() {
  const rows = [
    ["M + C", "Copy widget"],
    ["M + V", "Paste widget"],
    ["M + X", "Remove widget"],
    ["M + R", "Copy widget reference"],
    ["M + I", "Paste reference"],
    ["Esc", "Close dialog"],
  ];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Shortcut</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={{ padding: "6px 0", fontFamily: "monospace" }}>{k}</td>
            <td style={{ padding: "6px 0" }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
