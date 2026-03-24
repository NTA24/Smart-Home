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

export interface Dashboard extends DashboardInfo {
  configuration?: Record<string, unknown>;
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
