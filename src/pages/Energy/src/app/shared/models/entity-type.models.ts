/**
 * Mirrors Angular `ui-ngx/src/app/shared/models/entity-type.models.ts`
 * `baseDetailsPageByEntityType` — list path; detail is `${base}/:entityId`.
 */
export enum EntityType {
  DEVICE = "DEVICE",
  ASSET = "ASSET",
  DASHBOARD = "DASHBOARD",
  ENTITY_VIEW = "ENTITY_VIEW",
  CUSTOMER = "CUSTOMER",
}

/** Base path for the entity list + detail segment (detail = base + `/${entityId}`). */
export const baseDetailsPageByEntityType = new Map<EntityType, string>([
  [EntityType.DASHBOARD, "/dashboards"],
  [EntityType.DEVICE, "/entities/devices"],
  [EntityType.ASSET, "/entities/assets"],
  [EntityType.ENTITY_VIEW, "/entities/entityViews"],
  [EntityType.CUSTOMER, "/customers"],
]);

export function getEntityDetailsPath(entityType: EntityType, entityId: string): string {
  const base = baseDetailsPageByEntityType.get(entityType);
  if (!base) {
    throw new Error(`No base path for entity type ${entityType}`);
  }
  return `${base}/${entityId}`;
}

export function getEntityListPath(entityType: EntityType): string {
  const base = baseDetailsPageByEntityType.get(entityType);
  if (!base) {
    throw new Error(`No base path for entity type ${entityType}`);
  }
  return base;
}
