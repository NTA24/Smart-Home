/**
 * Static menu paths aligned with Angular `menuSectionMap` in
 * `ui-ngx/src/app/core/services/menu.models.ts`.
 * Used to generate placeholder React routes for migration coverage.
 */
export interface MenuRouteEntry {
  path: string;
  title: string;
}

export const MENU_ROUTE_ENTRIES: MenuRouteEntry[] = [
  { path: "home", title: "Home" },
  { path: "tenants", title: "Tenants" },
  { path: "tenantProfiles", title: "Tenant profiles" },
  { path: "resources", title: "Resources" },
  { path: "resources/widgets-library", title: "Widget library" },
  { path: "resources/widgets-library/widget-types", title: "Widget types" },
  { path: "resources/widgets-library/widgets-bundles", title: "Widget bundles" },
  { path: "resources/images", title: "Images" },
  { path: "resources/scada-symbols", title: "SCADA symbols" },
  { path: "resources/resources-library", title: "Resources library" },
  { path: "resources/javascript-library", title: "JavaScript library" },
  { path: "notification", title: "Notifications" },
  { path: "notification/inbox", title: "Inbox" },
  { path: "notification/sent", title: "Sent" },
  { path: "notification/recipients", title: "Recipients" },
  { path: "notification/templates", title: "Templates" },
  { path: "notification/rules", title: "Rules" },
  { path: "settings/ai-models", title: "AI models" },
  { path: "mobile-center", title: "Mobile center" },
  { path: "mobile-center/applications", title: "Mobile applications" },
  { path: "mobile-center/bundles", title: "Mobile bundles" },
  { path: "mobile-center/qr-code-widget", title: "QR code widget" },
  { path: "settings", title: "Settings" },
  { path: "settings/general", title: "General" },
  { path: "settings/outgoing-mail", title: "Outgoing mail" },
  { path: "settings/home", title: "Home settings" },
  { path: "settings/notifications", title: "Notification settings" },
  { path: "settings/repository", title: "Repository" },
  { path: "settings/auto-commit", title: "Auto commit" },
  { path: "settings/queues", title: "Queues" },
  { path: "security-settings", title: "Security" },
  { path: "security-settings/general", title: "Security general" },
  { path: "security-settings/2fa", title: "2FA" },
  { path: "security-settings/oauth2", title: "OAuth2" },
  { path: "security-settings/oauth2/domains", title: "OAuth2 domains" },
  { path: "security-settings/oauth2/clients", title: "OAuth2 clients" },
  { path: "security-settings/auditLogs", title: "Audit logs" },
  { path: "alarms", title: "Alarms" },
  { path: "alarms/alarms", title: "Alarm list" },
  { path: "alarms/alarm-rules", title: "Alarm rules" },
  { path: "entities", title: "Entities" },
  { path: "entities/gateways", title: "Gateways" },
  { path: "profiles", title: "Profiles" },
  { path: "profiles/deviceProfiles", title: "Device profiles" },
  { path: "profiles/assetProfiles", title: "Asset profiles" },
  { path: "customers", title: "Customers" },
  { path: "calculatedFields", title: "Calculated fields" },
  { path: "ruleChains", title: "Rule chains" },
  { path: "edgeManagement", title: "Edge management" },
  { path: "edgeManagement/instances", title: "Edge instances" },
  { path: "edgeManagement/ruleChains", title: "Edge rule chain templates" },
  { path: "features", title: "Features" },
  { path: "features/otaUpdates", title: "OTA updates" },
  { path: "features/vc", title: "Version control" },
  { path: "usage", title: "API usage" },
  { path: "settings/trendz", title: "Trendz" },
];

/** Routes that have a dedicated React page implementation (not placeholder). */
export const IMPLEMENTED_ROUTE_PATHS = new Set([
  "home",
  "dashboards",
  "entities/devices",
  "entities/assets",
  "entities/entityViews",
]);
