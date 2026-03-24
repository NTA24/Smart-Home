import type { Dashboard, DashboardInfo, PageData, PageLink } from "../../shared/models/dashboard.models";

const jsonHeaders = { "Content-Type": "application/json" };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export const dashboardService = {
  getTenantDashboards(pageLink: PageLink): Promise<PageData<DashboardInfo>> {
    const query = new URLSearchParams({
      pageSize: String(pageLink.pageSize),
      page: String(pageLink.page),
      textSearch: pageLink.textSearch ?? "",
    });
    return fetchJson<PageData<DashboardInfo>>(`/api/tenant/dashboards?${query.toString()}`);
  },

  getDashboard(dashboardId: string): Promise<Dashboard> {
    return fetchJson<Dashboard>(`/api/dashboard/${dashboardId}`);
  },

  saveDashboard(dashboard: Dashboard): Promise<Dashboard> {
    return fetchJson<Dashboard>("/api/dashboard", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(dashboard),
    });
  },
};
