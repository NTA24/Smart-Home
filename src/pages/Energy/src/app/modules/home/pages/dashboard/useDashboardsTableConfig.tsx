import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Typography } from "antd";
import { dashboardService } from "../../../../core/http/dashboardService";
import { customerService } from "../../../../core/http/customerService";
import { edgeService } from "../../../../core/http/edgeService";
import type { DashboardInfo } from "../../../../shared/models/dashboard.models";
import type { EntityTableConfig } from "../../components/entity/EntitiesTable";

const { Text } = Typography;

type DashboardScope = "tenant" | "customer" | "edge";

interface UseDashboardsTableConfigParams {
  scope?: DashboardScope;
  customerId?: string;
  edgeId?: string;
}

export function useDashboardsTableConfig(params?: UseDashboardsTableConfigParams): EntityTableConfig<DashboardInfo> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scope = params?.scope ?? "tenant";

  return useMemo(
    () => ({
      tableTitle:
        scope === "customer"
          ? t("energyDeviceDashboard.customerDashboards")
          : scope === "edge"
            ? t("energyDeviceDashboard.edgeDashboards")
            : "",
      columns: [
        {
          key: "createdTime",
          title: t("energyDeviceDashboard.createdTime"),
          width: 200,
          render: (entity) => new Date(entity.createdTime).toLocaleString(),
        },
        { key: "title", title: t("energyDeviceDashboard.titleColumn") },
        {
          key: "dashboardIsPublic",
          title: t("energyDeviceDashboard.public"),
          width: 100,
          render: (entity) => (entity.dashboardIsPublic ? t("common.yes") : t("common.no")),
        },
      ],
      fetchPage: async (page, pageSize, textSearch) => {
        if (scope === "customer" && params?.customerId) {
          await customerService.getCustomer(params.customerId).catch(() => undefined);
        }
        if (scope === "edge" && params?.edgeId) {
          await edgeService.getEdge(params.edgeId).catch(() => undefined);
        }
        const result = await dashboardService.getTenantDashboards({ page, pageSize, textSearch });
        return { data: result.data, totalElements: result.totalElements };
      },
      onRowClick: (entity) => {
        if (scope === "customer" && params?.customerId) {
          navigate(`/customers/${params.customerId}/dashboards/${entity.id.id}`);
        } else if (scope === "edge" && params?.edgeId) {
          navigate(`/edgeInstances/${params.edgeId}/dashboards/${entity.id.id}`);
        } else {
          navigate(`/energy-device-dashboard/${entity.id.id}`);
        }
      },
      detailsPanelTitle: t("energyDeviceDashboard.dashboardDetails"),
      renderDetailsPanel: (entity) => (
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            <Text type="secondary">{t("energyDeviceDashboard.titleColumn")}</Text>
            <div>{entity.title}</div>
          </div>
          <div>
            <Text type="secondary">ID</Text>
            <div>{entity.id.id}</div>
          </div>
          <div>
            <Text type="secondary">{t("energyDeviceDashboard.createdTime")}</Text>
            <div>{new Date(entity.createdTime).toLocaleString()}</div>
          </div>
          <div>
            <Text type="secondary">{t("energyDeviceDashboard.public")}</Text>
            <div>{entity.dashboardIsPublic ? t("common.yes") : t("common.no")}</div>
          </div>
        </div>
      ),
    }),
    [navigate, params?.customerId, params?.edgeId, scope, t]
  );
}
