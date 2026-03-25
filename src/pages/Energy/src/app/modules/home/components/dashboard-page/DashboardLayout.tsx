interface DashboardLayoutProps {
  name: "main" | "right";
  isEdit: boolean;
}

export function DashboardLayout({ name, isEdit }: DashboardLayoutProps) {
  return (
    <section style={{ border: "1px solid #ddd", padding: 12, minHeight: 180 }}>
      <strong>{name.toUpperCase()} layout</strong>
      <div style={{ marginTop: 8, opacity: 0.8 }}>
        {isEdit ? "Widget drag/resize area (edit mode)." : "Widget render area (view mode)."}
      </div>
    </section>
  );
}
