export type Authority = "SYS_ADMIN" | "TENANT_ADMIN" | "CUSTOMER_USER";

export interface EntityId {
  id: string;
}

export interface DashboardInfo {
  id: EntityId;
  title: string;
  createdTime: number;
  dashboardIsPublic?: boolean;
  customersTitle?: string;
}

/** Timewindow tối thiểu cho tb-timewindow (ThingsBoard). */
export interface DashboardTimewindowValue {
  selectedTab?: number;
  realtime?: { interval?: number; timewindowMs?: number };
  history?: {
    historyType?: number;
    fixedTimewindow?: { startTimeMs?: number; endTimeMs?: number };
  };
}

export interface WidgetConfig {
  title?: string;
  [key: string]: unknown;
}

/** Widget trên dashboard (rút gọn từ Angular). */
export interface Widget {
  id?: string;
  typeFullFqn?: string;
  type?: string;
  config?: WidgetConfig;
  row?: number;
  col?: number;
  sizeX?: number;
  sizeY?: number;
}

/** Vị trí widget trên lưới (ThingsBoard `WidgetLayout`). */
export interface WidgetGridLayout {
  sizeX?: number;
  sizeY?: number;
  col?: number;
  row?: number;
  resizable?: boolean;
  desktopHide?: boolean;
  mobileHide?: boolean;
}

export type DashboardLayoutId = "main" | "right";

export interface DashboardLayoutModel {
  widgets?: Record<string, WidgetGridLayout>;
  gridSettings?: Record<string, unknown>;
}

export interface DashboardStateModel {
  name?: string;
  root?: boolean;
  layouts?: Partial<Record<DashboardLayoutId, DashboardLayoutModel>>;
}

/** Mirrors subset of Angular `DashboardConfiguration` used by dashboard-page UI. */
export interface DashboardSettings {
  titleColor?: string;
  showTitle?: boolean;
  showDashboardExport?: boolean;
  showUpdateDashboardImage?: boolean;
  showDashboardTimewindow?: boolean;
  showDashboardsSelect?: boolean;
  showEntitiesSelect?: boolean;
  showFilters?: boolean;
  toolbarAlwaysOpen?: boolean;
  hideToolbar?: boolean;
  stateControllerId?: string;
  showDashboardLogo?: boolean;
}

export interface DashboardConfiguration {
  settings?: DashboardSettings;
  states?: Record<string, DashboardStateModel>;
  timewindow?: DashboardTimewindowValue | null;
  entityAliases?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  widgets?: Record<string, Widget>;
}

export interface Dashboard extends DashboardInfo {
  configuration?: DashboardConfiguration;
  version?: number;
  image?: string;
  name?: string;
  externalId?: EntityId;
}

export interface PageData<T> {
  data: T[];
  totalElements: number;
  hasNext: boolean;
}

export interface PageLink {
  page: number;
  pageSize: number;
  textSearch?: string;
}

export function createEmptyDashboardConfiguration(): DashboardConfiguration {
  return {
    settings: {
      showTitle: false,
      showDashboardExport: true,
      showUpdateDashboardImage: true,
      showDashboardTimewindow: true,
      showDashboardsSelect: true,
      showEntitiesSelect: true,
      showFilters: true,
      toolbarAlwaysOpen: true,
    },
    states: {
      default: {
        name: "default",
        root: true,
        layouts: {
          main: { widgets: {} },
          right: { widgets: {} },
        },
      },
    },
    timewindow: {
      selectedTab: 0,
      realtime: { timewindowMs: 60000 },
    },
    entityAliases: {},
    filters: {},
    widgets: {},
  };
}

export function generateWidgetId(): string {
  return `w_${Math.random().toString(36).slice(2, 11)}`;
}
