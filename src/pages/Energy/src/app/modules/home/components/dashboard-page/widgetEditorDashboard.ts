import type { Dashboard } from "../../../../shared/models/dashboard.models";
import { createEmptyDashboardConfiguration, generateWidgetId } from "../../../../shared/models/dashboard.models";
import { widgetToGridLayout } from "../../../../shared/models/dashboardLayoutUtils";

/** Tương đương `WidgetEditorDashboardResolver` (Angular) — một widget mẫu để chỉnh. */
export function createWidgetEditorDashboard(): Dashboard {
  const wid = generateWidgetId();
  const cfg = createEmptyDashboardConfiguration();
  const sample = {
    id: wid,
    typeFullFqn: "system.timeseries",
    type: "timeseries",
    sizeX: 8,
    sizeY: 5,
    row: 0,
    col: 0,
    config: { title: "Sample widget" },
  };
  cfg.widgets = { [wid]: sample };
  const def = cfg.states?.default;
  if (def?.layouts?.main) {
    def.layouts.main.widgets = { [wid]: widgetToGridLayout(sample) };
  }
  return {
    id: { id: "widget-editor" },
    title: "Widget editor",
    createdTime: Date.now(),
    configuration: cfg,
  };
}
