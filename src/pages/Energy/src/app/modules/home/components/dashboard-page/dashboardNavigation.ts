/**
 * Chọn URL khi đổi dashboard trong tb-dashboard-select (giống `currentDashboardIdChanged` Angular).
 */
export function getDashboardPagePathForId(
  dashboardId: string,
  opts: {
    singlePageMode: boolean;
    customerId?: string;
    edgeId?: string;
  }
): string {
  if (opts.customerId) {
    return `/customers/${opts.customerId}/dashboards/${dashboardId}`;
  }
  if (opts.edgeId) {
    return `/edgeInstances/${opts.edgeId}/dashboards/${dashboardId}`;
  }
  if (opts.singlePageMode) {
    return `/dashboard/${dashboardId}`;
  }
  return `/dashboards/${dashboardId}`;
}
