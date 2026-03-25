import type { Dashboard, DashboardConfiguration } from "../../shared/models/dashboard.models";
import { createEmptyDashboardConfiguration } from "../../shared/models/dashboard.models";
import { widgetToGridLayout } from "../../shared/models/dashboardLayoutUtils";
import { deepClone } from "../../shared/utils/clone";

const DEFAULT_STATE_ID = "default";

export const dashboardUtilsService = {
  validateAndUpdateDashboard(dashboard: Dashboard): Dashboard {
    if (!dashboard.configuration || Object.keys(dashboard.configuration).length === 0) {
      return { ...dashboard, configuration: createEmptyDashboardConfiguration() };
    }
    const next = deepClone(dashboard);
    const cfg = next.configuration!;
    ensureStatesAndLayouts(cfg);
    syncDefaultStateLayoutKeysFromWidgetsIfBothEmpty(cfg);
    return next;
  },
};

function ensureStatesAndLayouts(cfg: DashboardConfiguration): void {
  const template = createEmptyDashboardConfiguration();
  if (!cfg.states || Object.keys(cfg.states).length === 0) {
    cfg.states = deepClone(template.states);
    return;
  }
  if (!cfg.states[DEFAULT_STATE_ID]) {
    cfg.states[DEFAULT_STATE_ID] = deepClone(template.states![DEFAULT_STATE_ID]);
  }
  for (const id of Object.keys(cfg.states)) {
    const st = cfg.states[id];
    if (!st.layouts) {
      st.layouts = { main: { widgets: {} }, right: { widgets: {} } };
    } else {
      if (!st.layouts.main) {
        st.layouts.main = { widgets: {} };
      }
      if (!st.layouts.right) {
        st.layouts.right = { widgets: {} };
      }
    }
  }
}

/** When API returns flat `widgets` but empty layout maps, register all on main (editable parity). */
function syncDefaultStateLayoutKeysFromWidgetsIfBothEmpty(cfg: DashboardConfiguration): void {
  const all = cfg.widgets ?? {};
  if (Object.keys(all).length === 0) {
    return;
  }
  const st = cfg.states?.[DEFAULT_STATE_ID];
  if (!st?.layouts?.main || !st.layouts.right) {
    return;
  }
  const mainKeys = Object.keys(st.layouts.main.widgets ?? {});
  const rightKeys = Object.keys(st.layouts.right.widgets ?? {});
  if (mainKeys.length + rightKeys.length > 0) {
    return;
  }
  for (const wid of Object.keys(all)) {
    const w = all[wid];
    if (w) {
      st.layouts.main.widgets = { ...st.layouts.main.widgets, [wid]: widgetToGridLayout(w) };
    }
  }
}
