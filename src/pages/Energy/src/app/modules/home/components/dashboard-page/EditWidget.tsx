interface EditWidgetProps {
  widgetTitle: string;
}

export function EditWidget({ widgetTitle }: EditWidgetProps) {
  return (
    <aside style={{ borderLeft: "1px solid #ddd", paddingLeft: 12 }}>
      <h4>Edit widget</h4>
      <div>{widgetTitle}</div>
    </aside>
  );
}
