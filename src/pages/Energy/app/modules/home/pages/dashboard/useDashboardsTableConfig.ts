import { useMemo } from "react";
import { useNavigate } from "react-router";
import { dashboardService } from "../../../../core/http/dashboardService";
import type { DashboardInfo } from "../../../../shared/models/dashboard.models";
import type { EntityTableConfig } from "../../components/entity/EntitiesTable";

export function useDashboardsTableConfig(): EntityTableConfig<DashboardInfo> {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      tableTitle: "Dashboards",
      columns: [
        {
          key: "createdTime",
          title: "Created",
          width: 180,
          render: (entity) => new Date(entity.createdTime).toLocaleString(),
        },
        { key: "title", title: "Title" },
        {
          key: "dashboardIsPublic",
          title: "Public",
          width: 90,
          render: (entity) => (entity.dashboardIsPublic ? "Yes" : "No"),
        },
      ],
      fetchPage: async (page, pageSize, textSearch) => {
        const result = await dashboardService.getTenantDashboards({ page, pageSize, textSearch });
        return { data: result.data, totalElements: result.totalElements };
      },
      onRowClick: (entity) => {
        navigate(`/energy-device-dashboard/${entity.id.id}`);
      },
    }),
    [navigate]
  );
}
