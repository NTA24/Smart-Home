import { useMemo } from "react";
import { useLocation, useParams } from "react-router";

export interface DashboardPageRouteInfo {
  /** Angular `singlePageMode` — route `/dashboard/:id` hoặc widget editor */
  singlePageMode: boolean;
  /** Angular `widgetEditMode` — route `/widget-editor` */
  widgetEditMode: boolean;
  embedded: boolean;
  readonly: boolean;
  dashboardId: string | undefined;
  customerId: string | undefined;
  edgeId: string | undefined;
}

/**
 * Map pathname + params tới flags giống `data` trên route Angular (`dashboard-pages.routing.module.ts`).
 */
export function useDashboardPageRoute(): DashboardPageRouteInfo {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const path = location.pathname;
    const search = new URLSearchParams(location.search);
    const widgetEditMode = path.endsWith("/widget-editor") || path.includes("/widget-editor");
    const singlePageMode =
      widgetEditMode || /^\/dashboard\/[^/]+/.test(path) || path === "/dashboard" || path.startsWith("/dashboard/");
    const embedded = search.get("embedded") === "true";
    const readonlyParam = search.get("readonly") === "true";

    const p = params as Record<string, string | undefined>;
    const dashboardId = p.dashboardId;
    const customerId = p.customerId;
    const edgeId = p.edgeId;

    const readonly = embedded || readonlyParam;

    return {
      singlePageMode,
      widgetEditMode,
      embedded,
      readonly,
      dashboardId,
      customerId,
      edgeId,
    };
  }, [location.pathname, location.search, params]);
}
