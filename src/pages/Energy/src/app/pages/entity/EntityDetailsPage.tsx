import { useNavigate, useParams } from "react-router";
import { EntityType, getEntityListPath } from "../../shared/models/entity-type.models";

const TITLES: Record<EntityType, string> = {
  [EntityType.DEVICE]: "Device",
  [EntityType.ASSET]: "Asset",
  [EntityType.ENTITY_VIEW]: "Entity view",
  [EntityType.DASHBOARD]: "Dashboard",
  [EntityType.CUSTOMER]: "Customer",
};

export function EntityDetailsPage({ entityType }: { entityType: EntityType }) {
  const { entityId = "" } = useParams();
  const navigate = useNavigate();
  const listPath = getEntityListPath(entityType);
  const label = TITLES[entityType];

  return (
    <section style={{ padding: 16 }}>
      <button type="button" onClick={() => navigate(listPath)}>
        ← Back to {label} list
      </button>
      <h2 style={{ marginTop: 16 }}>
        {label} details
      </h2>
      <p>
        <strong>entityId:</strong> <code>{entityId}</code>
      </p>
      <p style={{ opacity: 0.85 }}>
        Đây là route chi tiết riêng — khác URL với trang danh sách <code>{listPath}</code>.
      </p>
    </section>
  );
}
