import type {
  DashboardConfiguration,
  DashboardLayoutId,
  Widget,
  WidgetGridLayout,
} from "./dashboard.models";

/** Widget đầy đủ theo từng vùng main/right (theo state hiện tại). */
export function getWidgetsByLayoutForState(
  configuration: DashboardConfiguration | undefined,
  stateId: string
): Record<DashboardLayoutId, Record<string, Widget>> {
  const all = configuration?.widgets ?? {};
  const state = configuration?.states?.[stateId];
  const layouts = state?.layouts;

  if (!layouts || (!layouts.main && !layouts.right)) {
    return { main: { ...all }, right: {} };
  }

  const mainIds = Object.keys(layouts.main?.widgets ?? {});
  const rightIds = Object.keys(layouts.right?.widgets ?? {});

  const pick = (ids: string[]) => {
    const out: Record<string, Widget> = {};
    for (const id of ids) {
      const w = all[id];
      if (w) {
        out[id] = w;
      }
    }
    return out;
  };

  if (mainIds.length === 0 && rightIds.length === 0 && Object.keys(all).length > 0) {
    return { main: { ...all }, right: {} };
  }

  const main = pick(mainIds);
  const right = pick(rightIds);
  const assigned = new Set([...mainIds, ...rightIds]);
  for (const id of Object.keys(all)) {
    if (!assigned.has(id)) {
      main[id] = all[id];
    }
  }
  return { main, right };
}

export function widgetToGridLayout(w: Widget): WidgetGridLayout {
  return {
    col: w.col,
    row: w.row,
    sizeX: w.sizeX,
    sizeY: w.sizeY,
  };
}

/** Insert `dragId` before `targetId` in a list (HTML5 drag-drop reorder). */
export function reorderIdList(ids: string[], dragId: string, targetId: string): string[] {
  if (dragId === targetId) {
    return ids;
  }
  const filtered = ids.filter((x) => x !== dragId);
  const tIdx = filtered.indexOf(targetId);
  if (tIdx < 0) {
    return ids;
  }
  const out = [...filtered];
  out.splice(tIdx, 0, dragId);
  return out;
}
