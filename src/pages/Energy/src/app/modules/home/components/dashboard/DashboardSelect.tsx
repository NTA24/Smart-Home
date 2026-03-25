import { useEffect, useState } from "react";
import { dashboardService } from "../../../../core/http/dashboardService";
import type { DashboardInfo, PageData } from "../../../../shared/models/dashboard.models";

interface DashboardSelectProps {
  value?: string;
  onChange: (dashboardId: string) => void;
}

export function DashboardSelect({ value, onChange }: DashboardSelectProps) {
  const [dashboards, setDashboards] = useState<DashboardInfo[]>([]);

  useEffect(() => {
    dashboardService.getTenantDashboards({ page: 0, pageSize: 50 }).then((result: PageData<DashboardInfo>) => {
      setDashboards(result.data);
    }).catch(() => undefined);
  }, []);

  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select dashboard</option>
      {dashboards.map((dashboard) => (
        <option key={dashboard.id.id} value={dashboard.id.id}>
          {dashboard.title}
        </option>
      ))}
    </select>
  );
}
