import type { Dashboard, DashboardInfo, PageData, PageLink } from "../../shared/models/dashboard.models";
import { thingsBoardApi } from "@/services";

export const dashboardService = {
  async getTenantDashboards(pageLink: PageLink): Promise<PageData<DashboardInfo>> {
    const res = await thingsBoardApi.get<{
      data?: DashboardInfo[];
      totalElements?: number;
      hasNext?: boolean;
    }>("/api/tenant/dashboards", {
      pageSize: pageLink.pageSize,
      page: pageLink.page,
      textSearch: pageLink.textSearch ?? "",
      sortProperty: "createdTime",
      sortOrder: "DESC",
    });
    return {
      data: res?.data ?? [],
      totalElements: res?.totalElements ?? 0,
      hasNext: !!res?.hasNext,
    };
  },

  getDashboard(dashboardId: string): Promise<Dashboard> {
    return thingsBoardApi.get<Dashboard>(`/api/dashboard/${dashboardId}`);
  },

  saveDashboard(dashboard: Dashboard): Promise<Dashboard> {
    return thingsBoardApi.post<Dashboard>("/api/dashboard", dashboard);
  },
};
