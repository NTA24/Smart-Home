import type { Dashboard, DashboardConfiguration, Widget, WidgetGridLayout } from "../../shared/models/dashboard.models";
import { createEmptyDashboardConfiguration, generateWidgetId } from "../../shared/models/dashboard.models";
import { widgetToGridLayout } from "../../shared/models/dashboardLayoutUtils";
import { deepClone } from "../../shared/utils/clone";

export const dashboardConfigService = {
  patchConfiguration(dashboard: Dashboard, patch: Partial<DashboardConfiguration>): Dashboard {
    const next = deepClone(dashboard);
    const base = createConfig(dashboard);
    const merged: DashboardConfiguration = {
      ...base,
      settings: { ...base.settings, ...patch.settings },
    };
    if (patch.states !== undefined) {
      merged.states = patch.states;
    }
    if (patch.timewindow !== undefined) {
      merged.timewindow = patch.timewindow;
    }
    if (patch.entityAliases !== undefined) {
      merged.entityAliases = patch.entityAliases;
    }
    if (patch.filters !== undefined) {
      merged.filters = patch.filters;
    }
    if (patch.widgets !== undefined) {
      merged.widgets = patch.widgets;
    }
    next.configuration = merged;
    return next;
  },

  addWidget(
    dashboard: Dashboard,
    widget: Omit<Widget, "id"> & { id?: string },
    options?: { stateId?: string; layoutId?: "main" | "right" }
  ): Dashboard {
    const id = widget.id ?? generateWidgetId();
    const stateId = options?.stateId ?? "default";
    const layoutId = options?.layoutId ?? "main";
    const next = deepClone(dashboard);
    const cfg = createConfig(next);
    const merged: Widget = { ...widget, id };
    cfg.widgets = { ...cfg.widgets, [id]: merged };
    placeWidgetInStateLayout(cfg, stateId, layoutId, id, merged);
    next.configuration = cfg;
    return next;
  },

  updateWidget(dashboard: Dashboard, widgetId: string, updates: Partial<Widget>): Dashboard {
    const next = deepClone(dashboard);
    const cfg = createConfig(next);
    const w = cfg.widgets?.[widgetId];
    if (!w) {
      return dashboard;
    }
    const mergedWidget = { ...w, ...updates };
    cfg.widgets = { ...cfg.widgets, [widgetId]: mergedWidget };
    syncWidgetInLayouts(cfg, widgetId, mergedWidget);
    next.configuration = cfg;
    return next;
  },

  removeWidget(dashboard: Dashboard, widgetId: string): Dashboard {
    const next = deepClone(dashboard);
    const cfg = createConfig(next);
    if (cfg.widgets && cfg.widgets[widgetId]) {
      const { [widgetId]: _, ...rest } = cfg.widgets;
      cfg.widgets = rest;
    }
    removeWidgetFromAllLayouts(cfg, widgetId);
    next.configuration = cfg;
    return next;
  },

  /** Move widget between main/right for one state (ThingsBoard layout ids). */
  moveWidgetToLayout(
    dashboard: Dashboard,
    stateId: string,
    widgetId: string,
    targetLayout: "main" | "right"
  ): Dashboard {
    const w = dashboard.configuration?.widgets?.[widgetId];
    if (!w) {
      return dashboard;
    }
    const next = deepClone(dashboard);
    const cfg = createConfig(next);
    removeWidgetFromStateLayouts(cfg, stateId, widgetId);
    placeWidgetInStateLayout(cfg, stateId, targetLayout, widgetId, { ...w, id: widgetId });
    next.configuration = cfg;
    return next;
  },

  /** Reorder widgets within one layout column; updates `row` on widgets and layout maps. */
  reorderWidgetsInLayout(
    dashboard: Dashboard,
    stateId: string,
    layoutId: "main" | "right",
    orderedWidgetIds: string[]
  ): Dashboard {
    const next = deepClone(dashboard);
    const cfg = createConfig(next);
    const st = cfg.states?.[stateId];
    const L = st?.layouts?.[layoutId];
    if (!st?.layouts || !L?.widgets) {
      return dashboard;
    }
    const keys = Object.keys(L.widgets);
    if (
      orderedWidgetIds.length !== keys.length ||
      !orderedWidgetIds.every((id) => keys.includes(id))
    ) {
      return dashboard;
    }
    const oldMap = L.widgets;
    const newMap: Record<string, WidgetGridLayout> = {};
    for (let i = 0; i < orderedWidgetIds.length; i++) {
      const wid = orderedWidgetIds[i];
      const prevLayout = oldMap[wid];
      const w = cfg.widgets?.[wid];
      if (!w) {
        continue;
      }
      newMap[wid] = { ...(prevLayout ?? widgetToGridLayout(w)), row: i };
      cfg.widgets = { ...cfg.widgets, [wid]: { ...w, row: i } };
    }
    st.layouts[layoutId] = { ...L, widgets: newMap };
    next.configuration = cfg;
    return next;
  },
};

function placeWidgetInStateLayout(
  cfg: DashboardConfiguration,
  stateId: string,
  layoutId: "main" | "right",
  widgetId: string,
  w: Widget
): void {
  if (!cfg.states) {
    cfg.states = {};
  }
  const prev = cfg.states[stateId];
  const layouts = { ...prev?.layouts };
  const target = layouts[layoutId] ?? { widgets: {} };
  layouts[layoutId] = {
    ...target,
    widgets: { ...(target.widgets ?? {}), [widgetId]: widgetToGridLayout(w) },
  };
  cfg.states[stateId] = {
    ...prev,
    name: prev?.name ?? stateId,
    root: prev?.root ?? stateId === "default",
    layouts,
  };
}

function syncWidgetInLayouts(cfg: DashboardConfiguration, widgetId: string, w: Widget): void {
  if (!cfg.states) {
    return;
  }
  for (const st of Object.values(cfg.states)) {
    const layouts = st.layouts;
    if (!layouts) {
      continue;
    }
    for (const lid of ["main", "right"] as const) {
      const L = layouts[lid];
      if (L?.widgets && widgetId in L.widgets) {
        layouts[lid] = {
          ...L,
          widgets: { ...L.widgets, [widgetId]: widgetToGridLayout(w) },
        };
      }
    }
  }
}

function removeWidgetFromStateLayouts(cfg: DashboardConfiguration, stateId: string, widgetId: string): void {
  const st = cfg.states?.[stateId];
  if (!st?.layouts) {
    return;
  }
  for (const lid of ["main", "right"] as const) {
    const L = st.layouts[lid];
    if (!L?.widgets?.[widgetId]) {
      continue;
    }
    const { [widgetId]: _, ...rest } = L.widgets;
    st.layouts[lid] = { ...L, widgets: rest };
  }
}

function removeWidgetFromAllLayouts(cfg: DashboardConfiguration, widgetId: string): void {
  if (!cfg.states) {
    return;
  }
  for (const sid of Object.keys(cfg.states)) {
    const st = cfg.states[sid];
    const layouts = st.layouts;
    if (!layouts) {
      continue;
    }
    for (const lid of ["main", "right"] as const) {
      const L = layouts[lid];
      if (!L?.widgets?.[widgetId]) {
        continue;
      }
      const { [widgetId]: _, ...rest } = L.widgets;
      layouts[lid] = { ...L, widgets: rest };
    }
  }
}

function createConfig(dashboard: Dashboard): DashboardConfiguration {
  return dashboard.configuration
    ? deepClone(dashboard.configuration)
    : createEmptyDashboardConfiguration();
}
