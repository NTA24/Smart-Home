import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "../layout/AppLayout";
import { DashboardPage } from "../modules/home/components/dashboard-page/DashboardPage";
import { DashboardListPage } from "../modules/home/pages/dashboard/DashboardListPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { EntityDetailsPage } from "../pages/entity/EntityDetailsPage";
import { EntityListPage } from "../pages/entity/EntityListPage";
import { EntityType } from "../shared/models/entity-type.models";
import { IMPLEMENTED_ROUTE_PATHS, MENU_ROUTE_ENTRIES } from "./menuRoutes.data";

const placeholderRoutes = MENU_ROUTE_ENTRIES.filter((entry) => !IMPLEMENTED_ROUTE_PATHS.has(entry.path)).map(
  (entry) => ({
    path: entry.path,
    element: <PlaceholderPage title={entry.title} />,
  })
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <HomePage /> },
      { path: "dashboards", element: <DashboardListPage /> },
      { path: "dashboards/:dashboardId", element: <DashboardPage /> },
      /** Single-page dashboard (Angular `dashboard-pages.routing` — `singlePageMode: true`) */
      { path: "dashboard/:dashboardId", element: <DashboardPage /> },
      /** Widget editor shell (Angular `widget-editor` route) */
      { path: "widget-editor", element: <DashboardPage /> },
      { path: "customers/:customerId/dashboards/:dashboardId", element: <DashboardPage /> },
      { path: "edgeInstances/:edgeId/dashboards/:dashboardId", element: <DashboardPage /> },
      { path: "entities/devices", element: <EntityListPage entityType={EntityType.DEVICE} /> },
      { path: "entities/devices/:entityId", element: <EntityDetailsPage entityType={EntityType.DEVICE} /> },
      { path: "entities/assets", element: <EntityListPage entityType={EntityType.ASSET} /> },
      { path: "entities/assets/:entityId", element: <EntityDetailsPage entityType={EntityType.ASSET} /> },
      { path: "entities/entityViews", element: <EntityListPage entityType={EntityType.ENTITY_VIEW} /> },
      { path: "entities/entityViews/:entityId", element: <EntityDetailsPage entityType={EntityType.ENTITY_VIEW} /> },
      ...placeholderRoutes,
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
