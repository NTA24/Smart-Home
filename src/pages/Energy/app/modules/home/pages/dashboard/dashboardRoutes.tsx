import type { RouteObject } from "react-router";
import { DashboardListPage } from "./DashboardListPage";
import { DashboardPage } from "../../components/dashboard-page/DashboardPage";

export const dashboardRoutes: RouteObject[] = [
  {
    path: "dashboards",
    children: [
      { index: true, element: <DashboardListPage /> },
      { path: ":dashboardId", element: <DashboardPage /> },
    ],
  },
];
