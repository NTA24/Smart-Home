import { EntitiesTable } from "../../components/entity/EntitiesTable";
import { useDashboardsTableConfig } from "./useDashboardsTableConfig";

export function DashboardListPage() {
  const config = useDashboardsTableConfig();
  return <EntitiesTable config={config} />;
}
