export enum UserDashboardAction {
  VISIT = "visit",
  STAR = "star",
  UNSTAR = "unstar",
}

export const userSettingsService = {
  async reportUserDashboardAction(dashboardId: string, action: UserDashboardAction): Promise<void> {
    await fetch(`/api/user/dashboards/${dashboardId}/${action}`, { method: "GET" });
  },
};
