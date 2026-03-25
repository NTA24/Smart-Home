import { useNavigate } from "react-router";
import {
  EntityType,
  getEntityDetailsPath,
  getEntityListPath,
} from "../../shared/models/entity-type.models";

const MOCK_ROWS: Record<EntityType, { id: string; name: string }[]> = {
  [EntityType.DEVICE]: [
    { id: "demo-device-1", name: "Demo device 1" },
    { id: "demo-device-2", name: "Demo device 2" },
  ],
  [EntityType.ASSET]: [
    { id: "demo-asset-1", name: "Demo asset 1" },
  ],
  [EntityType.ENTITY_VIEW]: [
    { id: "demo-entity-view-1", name: "Demo entity view 1" },
  ],
  [EntityType.DASHBOARD]: [],
  [EntityType.CUSTOMER]: [],
};

const TITLES: Record<EntityType, string> = {
  [EntityType.DEVICE]: "Devices",
  [EntityType.ASSET]: "Assets",
  [EntityType.ENTITY_VIEW]: "Entity views",
  [EntityType.DASHBOARD]: "Dashboards",
  [EntityType.CUSTOMER]: "Customers",
};

export function EntityListPage({ entityType }: { entityType: EntityType }) {
  const navigate = useNavigate();
  const rows = MOCK_ROWS[entityType] ?? [];
  const title = TITLES[entityType];
  const listPath = getEntityListPath(entityType);

  return (
    <section style={{ padding: 16 }}>
      <h2>{title}</h2>
      <p style={{ opacity: 0.85 }}>
        List route: <code>{listPath}</code> — click row để mở trang chi tiết (URL khác), giống Angular{" "}
        <code>EntityDetailsPageComponent</code>.
      </p>
      <table width="100%" cellPadding={8}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              style={{ cursor: "pointer", borderTop: "1px solid #eee" }}
              onClick={() => navigate(getEntityDetailsPath(entityType, row.id))}
            >
              <td>{row.name}</td>
              <td>{row.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
