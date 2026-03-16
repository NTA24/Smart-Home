/**
 * Service gọi API ThingsBoard tại https://things.iot-platform.io.vn/
 * Docs: https://thingsboard.io/docs/reference/rest-api/
 * Auth: API Key (X-Authorization: ApiKey <key>) hoặc JWT (X-Authorization: Bearer <token>)
 */

import axios, { type AxiosInstance } from 'axios'

const THINGSBOARD_BASE_URL =
  (import.meta.env.VITE_THINGSBOARD_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://things.iot-platform.io.vn'

const TOKEN_STORAGE_KEY = 'thingsboard_token'
const REFRESH_TOKEN_STORAGE_KEY = 'thingsboard_refresh_token'
const API_KEY_STORAGE_KEY = 'thingsboard_api_key'

/** API Key mặc định (fallback khi chưa set .env). Ưu tiên: .env > localStorage > default. */
const DEFAULT_THINGSBOARD_API_KEY = 'tb_D77pvSxqVNDwV-OpNoULfhBb318X-u-EnazZd2XcO-l6YkPRo77LIHsJ3pXzCYVuFr8sc-2JzOxisUByuK01dw'

/** API Key từ env (ưu tiên) > localStorage > default. Đặt trong .env: VITE_THINGSBOARD_API_KEY=tb_xxx */
function getApiKey(): string | null {
  const fromEnv = import.meta.env.VITE_THINGSBOARD_API_KEY as string | undefined
  if (fromEnv && fromEnv.trim()) return fromEnv.trim()
  const fromStorage = localStorage.getItem(API_KEY_STORAGE_KEY)
  if (fromStorage && fromStorage.trim()) return fromStorage.trim()
  return DEFAULT_THINGSBOARD_API_KEY
}

const client: AxiosInstance = axios.create({
  baseURL: THINGSBOARD_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

client.interceptors.request.use(
  (config) => {
    const apiKey = getApiKey()
    if (apiKey) {
      config.headers['X-Authorization'] = `ApiKey ${apiKey}`
    } else {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (token) {
        config.headers['X-Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

// --- Auth ---
export interface ThingsBoardLoginRequest {
  username: string
  password: string
}

export interface ThingsBoardLoginResponse {
  token: string
  refreshToken: string
}

export function setThingsBoardToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function setThingsBoardRefreshToken(refreshToken: string): void {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export function getThingsBoardToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearThingsBoardAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

/** Lưu API Key (dùng cho X-Authorization: ApiKey xxx). Ưu tiên thấp hơn VITE_THINGSBOARD_API_KEY trong .env */
export function setThingsBoardApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
}

export function getThingsBoardApiKey(): string | null {
  return getApiKey()
}

/**
 * Đăng nhập ThingsBoard, lưu token và refreshToken vào localStorage.
 */
export async function thingsBoardLogin(
  username: string,
  password: string
): Promise<ThingsBoardLoginResponse> {
  const raw = await axios.post<ThingsBoardLoginResponse>(
    `${THINGSBOARD_BASE_URL}/api/auth/login`,
    { username, password },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  )
  const data = raw.data
  if (data.token) setThingsBoardToken(data.token)
  if (data.refreshToken) setThingsBoardRefreshToken(data.refreshToken)
  return data
}

/**
 * Gọi API với token hiện tại (dùng client đã gắn interceptor).
 * Trả về response.data từ axios.
 */
export async function thingsBoardRequest<T = unknown>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  params?: Record<string, unknown>,
  data?: unknown
): Promise<T> {
  const config: { method: 'get' | 'post' | 'put' | 'delete' | 'patch'; url: string; params?: Record<string, unknown>; data?: unknown } = { method, url }
  if (params && Object.keys(params).length > 0) config.params = params
  if (data !== undefined) config.data = data
  const result = await client.request(config)
  return result.data as T
}

// --- Device Infos (tenant) ---
export interface ThingsBoardDeviceInfo {
  id?: { id: string }
  createdTime?: number
  name?: string
  type?: string
  label?: string
  deviceProfileId?: { id: string }
  deviceProfileName?: string
  customerId?: { id: string }
  customerTitle?: string
  customerIsPublic?: boolean
  active?: boolean
  gateway?: boolean
  [key: string]: unknown
}

export interface ThingsBoardDeviceInfosResponse {
  data?: ThingsBoardDeviceInfo[]
  totalPages?: number
  totalElements?: number
  hasNext?: boolean
}

/** Payload for POST /api/device — Create Or Update Device (saveDevice) */
export interface SaveDeviceBody {
  id?: { id: string; entityType: 'DEVICE' }
  name: string
  type?: string
  label?: string
  deviceProfileId?: { id: string; entityType: 'DEVICE_PROFILE' }
  firmwareId?: { id: string; entityType: 'OTA_PACKAGE' }
  softwareId?: { id: string; entityType: 'OTA_PACKAGE' }
  version?: number
  additionalInfo?: Record<string, unknown>
  deviceData?: {
    configuration?: Record<string, unknown>
    transportConfiguration?: Record<string, unknown>
  }
  [key: string]: unknown
}

/** Payload for POST /api/entitiesQuery/find — Find Entity Data by Query */
export interface EntitiesQueryFindBody {
  entityFilter: {
    type: string
    customerId?: { id: string; entityType: string }
    singleEntity?: { entityType: string; id: string; type?: string }
  }
  keyFilters?: Array<{
    key: { type: string; key: string }
    valueType: string
    predicate: { type: string; operation: string; value: { defaultValue?: unknown; userValue?: unknown; dynamicValue?: unknown } }
  }>
  pageLink: {
    pageSize: number
    page: number
    textSearch?: string
    sortOrder?: { key: { type: string; key: string }; direction: 'ASC' | 'DESC' }
    dynamic?: boolean
  }
  entityFields?: Array<{ type: string; key: string }>
  latestValues?: Array<{ type: string; key: string }>
}

/** Build find payload for one device by id (singleEntity). */
export function buildEntitiesQueryFindPayload(deviceId: string): EntitiesQueryFindBody {
  return {
    entityFilter: {
      type: 'singleEntity',
      singleEntity: { entityType: 'DEVICE', id: deviceId, type: 'singleEntity' },
    },
    pageLink: { pageSize: 1, page: 0, sortOrder: { key: { type: 'ENTITY_FIELD', key: 'createdTime' }, direction: 'DESC' } },
    entityFields: [
      { type: 'ENTITY_FIELD', key: 'name' },
      { type: 'ENTITY_FIELD', key: 'label' },
      { type: 'ENTITY_FIELD', key: 'additionalInfo' },
    ],
  }
}

// --- Asset Infos (tenant) ---
export interface ThingsBoardAssetInfo {
  id?: { id: string; entityType?: string }
  createdTime?: number
  name?: string
  type?: string
  label?: string
  assetProfileId?: { id: string; entityType?: string }
  assetProfileName?: string
  customerId?: { id: string }
  customerTitle?: string
  customerIsPublic?: boolean
  version?: number
  additionalInfo?: Record<string, unknown>
  [key: string]: unknown
}

export interface ThingsBoardAssetInfosResponse {
  data?: ThingsBoardAssetInfo[]
  totalPages?: number
  totalElements?: number
  hasNext?: boolean
}

export interface ThingsBoardAssetProfileInfoItem {
  id?: { id?: string }
  name?: string
}

export interface ThingsBoardAssetProfileInfosResponse {
  data?: ThingsBoardAssetProfileInfoItem[]
  totalElements?: number
}

export interface ThingsBoardEntityViewInfo {
  id?: { id?: string; entityType?: string }
  createdTime?: number
  name?: string
  type?: string
  customerId?: { id?: string }
  customerTitle?: string
  customerIsPublic?: boolean
  [key: string]: unknown
}

export interface ThingsBoardEntityViewInfosResponse {
  data?: ThingsBoardEntityViewInfo[]
  totalPages?: number
  totalElements?: number
  hasNext?: boolean
}

// --- API helpers (ThingsBoard REST API) ---

export const thingsBoardApi = {
  /** POST /api/auth/login */
  login: (username: string, password: string) =>
    thingsBoardLogin(username, password),

  /** GET /api/auth/user */
  getCurrentUser: () =>
    thingsBoardRequest<{ id: string; email?: string; authority?: string; [key: string]: unknown }>('get', '/api/auth/user'),

  /** GET /api/tenants?pageSize=10&page=0 */
  getTenants: (params?: { pageSize?: number; page?: number; textSearch?: string }) =>
    thingsBoardRequest<{ data: unknown[]; totalPages: number; totalElements: number }>('get', '/api/tenants', params as Record<string, unknown>),

  /** GET /api/customer/{customerId} */
  getCustomer: (customerId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/customer/${customerId}`),

  /** DELETE /api/customer/{customerId} — xóa customer và tất cả customer users; dashboards/assets/devices bị unassign, không xóa */
  deleteCustomer: (customerId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/${customerId}`),

  /** GET /api/customer/{customerId}/users?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC */
  getCustomerUsers: (
    customerId: string,
    params?: {
      pageSize?: number
      page?: number
      sortProperty?: string
      sortOrder?: 'ASC' | 'DESC'
      textSearch?: string
    }
  ) =>
    thingsBoardRequest<{ data: unknown[]; totalPages: number; totalElements: number }>(
      'get',
      `/api/customer/${customerId}/users`,
      params as Record<string, unknown>
    ),

  /**
   * POST /api/customer — tạo customer mới.
   * Body theo ThingsBoard: title, country, state, city, address, address2, zip, phone, email, version: 0, additionalInfo.
   * Query: nameConflictPolicy (FAIL | UNIQUIFY), uniquifySeparator, uniquifyStrategy (RANDOM | INCREMENTAL).
   */
  createCustomer: (
    body: {
      title: string
      email?: string
      country?: string
      state?: string
      city?: string
      address?: string
      address2?: string
      zip?: string
      phone?: string
      additionalInfo?: Record<string, unknown>
    },
    params?: {
      nameConflictPolicy?: 'FAIL' | 'UNIQUIFY'
      uniquifySeparator?: string
      uniquifyStrategy?: 'RANDOM' | 'INCREMENTAL'
    }
  ) => {
    const payload = {
      title: body.title,
      email: body.email ?? undefined,
      country: body.country ?? undefined,
      state: body.state ?? undefined,
      city: body.city ?? undefined,
      address: body.address ?? undefined,
      address2: body.address2 ?? undefined,
      zip: body.zip ?? undefined,
      phone: body.phone ?? undefined,
      version: 0,
      additionalInfo: body.additionalInfo ?? {},
    }
    return thingsBoardRequest<Record<string, unknown>>(
      'post',
      '/api/customer',
      params as Record<string, unknown>,
      payload
    )
  },

  /** GET /api/customers?pageSize=10&page=0&sortProperty=createdTime&sortOrder=DESC */
  getCustomers: (params?: {
    pageSize?: number
    page?: number
    textSearch?: string
    sortProperty?: string
    sortOrder?: 'ASC' | 'DESC'
  }) =>
    thingsBoardRequest<{ data: unknown[]; totalPages: number; totalElements: number }>('get', '/api/customers', params as Record<string, unknown>),

  /** GET /api/devices?pageSize=10&page=0 */
  getDevices: (params?: { pageSize?: number; page?: number; type?: string; textSearch?: string }) =>
    thingsBoardRequest<{ data: unknown[]; totalPages: number; totalElements: number }>('get', '/api/devices', params as Record<string, unknown>),

  /** GET /api/device/{deviceId} */
  getDevice: (deviceId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/device/${deviceId}`),

  /** DELETE /api/device/{deviceId} — xóa thiết bị (gateway) */
  deleteDevice: (deviceId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/device/${deviceId}`),

  /** GET /api/deviceProfile/{deviceProfileId} */
  getDeviceProfile: (deviceProfileId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/deviceProfile/${deviceProfileId}`),

  /** GET /api/deviceProfileInfo/{deviceProfileId} */
  getDeviceProfileInfo: (deviceProfileId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/deviceProfileInfo/${deviceProfileId}`),

  /** GET /api/deviceProfile/names?activeOnly=false — list device profile names for dropdown */
  getDeviceProfileNames: (activeOnly = false) =>
    thingsBoardRequest<Array<{ id?: { id?: string }; name?: string } | string>>('get', '/api/deviceProfile/names', { activeOnly }),

  /** POST /api/deviceProfile — Create Or Update Device Profile (saveDeviceProfile) */
  saveDeviceProfile: (body: Record<string, unknown>) =>
    thingsBoardRequest<Record<string, unknown>>('post', '/api/deviceProfile', undefined, body),

  /** GET /api/ruleChains — type: CORE | EDGE */
  getRuleChains: (params: { pageSize?: number; page?: number; sortProperty?: string; sortOrder?: string; type: 'CORE' | 'EDGE' }) =>
    thingsBoardRequest<{ data?: Array<{ id?: { id?: string }; name?: string }>; totalElements?: number }>('get', '/api/ruleChains', params as Record<string, unknown>),

  /** GET /api/tenant/dashboards */
  getTenantDashboards: (params?: { pageSize?: number; page?: number; sortProperty?: string; sortOrder?: string }) =>
    thingsBoardRequest<{ data?: Array<{ id?: { id?: string }; title?: string; createdTime?: number; customerId?: { id?: string }; customerTitle?: string; customerIsPublic?: boolean }>; totalElements?: number }>('get', '/api/tenant/dashboards', params as Record<string, unknown>),

  /** GET /api/customer/{customerId}/dashboards — danh sách dashboard của customer */
  getCustomerDashboards: (
    customerId: string,
    params?: {
      pageSize?: number
      page?: number
      sortProperty?: string
      sortOrder?: 'ASC' | 'DESC'
      textSearch?: string
    }
  ) =>
    thingsBoardRequest<{
      data?: Array<{ id?: { id?: string }; title?: string; createdTime?: number }>
      totalElements?: number
    }>('get', `/api/customer/${customerId}/dashboards`, params as Record<string, unknown>),

  /** POST /api/customer/public/dashboard/{dashboardId} — make dashboard public */
  makeDashboardPublic: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/public/dashboard/${dashboardId}`),

  /** DELETE /api/customer/public/dashboard/{dashboardId} — make dashboard private (same URL as make public) */
  makeDashboardPrivate: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/public/dashboard/${dashboardId}`),

  /** POST /api/customer/{customerId}/dashboard/{dashboardId} — assign dashboard to customer */
  assignDashboardToCustomer: (customerId: string, dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/${customerId}/dashboard/${dashboardId}`),

  /** DELETE /api/dashboard/{dashboardId} — delete dashboard */
  deleteDashboard: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/dashboard/${dashboardId}`),

  /** GET /api/dashboard/{dashboardId} — get dashboard by id */
  getDashboard: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/dashboard/${dashboardId}`),

  /** GET /api/user/dashboards/{dashboardId}/{action} — report user action: "VISIT" | "star" | "unstar" */
  visitDashboard: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/user/dashboards/${dashboardId}/VISIT`),

  /** GET /api/user/dashboards/{dashboardId}/star — star dashboard */
  starDashboard: (dashboardId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/user/dashboards/${dashboardId}/star`),

  /** POST /api/entitiesQuery/find — Find Entity Data by Query. Body: entityFilter, keyFilters?, pageLink, entityFields?, latestValues? */
  entitiesQueryFind: (body: EntitiesQueryFindBody) =>
    thingsBoardRequest<unknown>('post', '/api/entitiesQuery/find', undefined, body),

  /** GET /api/dashboard/serverTime — server time (ms) for gateway/realtime display; may return number or { serverTime: number } */
  getServerTime: () =>
    thingsBoardRequest<number | { serverTime?: number }>('get', '/api/dashboard/serverTime'),

  /** Trả về URL đầy đủ cho ảnh ThingsBoard (vd. /api/images/system/...) — dùng cho background hoặc img src */
  getImageUrl: (path: string) =>
    `${THINGSBOARD_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,

  /** GET /api/dashboard/home — tổng quan dashboard home */
  getDashboardHome: () =>
    thingsBoardRequest<Record<string, unknown>>('get', '/api/dashboard/home'),

  /** GET /api/user/dashboards — danh sách dashboard của user */
  getUserDashboards: () =>
    thingsBoardRequest<{ data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>(
      'get',
      '/api/user/dashboards'
    ),

  /** GET /api/usage — thống kê usage */
  getUsage: () => thingsBoardRequest<Record<string, unknown>>('get', '/api/usage'),

  /** GET /api/user/settings/{key} — QUICK_LINKS, DOC_LINKS, GETTING_STARTED */
  getUserSettings: (key: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/user/settings/${key}`),

  /** GET /api/mobile/qr/settings */
  getMobileQrSettings: () =>
    thingsBoardRequest<Record<string, unknown>>('get', '/api/mobile/qr/settings'),

  /** GET /api/mobile/qr/deepLink */
  getMobileQrDeepLink: () =>
    thingsBoardRequest<Record<string, unknown>>('get', '/api/mobile/qr/deepLink'),

  /** GET /api/queues */
  getQueues: (params?: { pageSize?: number; page?: number; sortProperty?: string; sortOrder?: string; serviceType?: string }) =>
    thingsBoardRequest<{ data?: Array<{ id?: { id?: string }; name?: string }>; totalElements?: number }>('get', '/api/queues', params as Record<string, unknown>),

  /** GET /api/otaPackages/{id}/FIRMWARE | SOFTWARE */
  getOtaPackages: (id: string, type: 'FIRMWARE' | 'SOFTWARE', params?: { pageSize?: number; page?: number; sortProperty?: string; sortOrder?: string }) =>
    thingsBoardRequest<{ data?: Array<{ id?: { id?: string }; title?: string; name?: string }>; totalElements?: number }>('get', `/api/otaPackages/${id}/${type}`, params as Record<string, unknown>),

  /** POST /api/device — Create Or Update Device (saveDevice). Use full payload with id for update, without id for create. */
  saveDevice: (body: SaveDeviceBody) =>
    thingsBoardRequest<Record<string, unknown>>('post', '/api/device', undefined, body),

  /** Build and POST /api/device for create (no id). Kept for backward compatibility; prefer saveDevice with full payload. */
  createDevice: (body: { name: string; deviceProfileId?: { id: string }; label?: string; description?: string; gateway?: boolean; [key: string]: unknown }) =>
    thingsBoardRequest<Record<string, unknown>>('post', '/api/device', undefined, body),

  /** POST /api/customer/public/device/{deviceId} — chuyển thiết bị sang public */
  makeDevicePublic: (deviceId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/public/device/${deviceId}`),

  /** DELETE /api/customer/device/{deviceId} — chuyển thiết bị sang private (bỏ public) */
  makeDevicePrivate: (deviceId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/device/${deviceId}`),

  /** DELETE /api/customer/device/{deviceId} — unassign device from customer */
  unassignDeviceFromCustomer: (deviceId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/device/${deviceId}`),

  /** GET /api/customer/{customerId}/deviceInfos — danh sách device của customer */
  getCustomerDeviceInfos: (
    customerId: string,
    params?: {
      pageSize?: number
      page?: number
      sortProperty?: string
      sortOrder?: 'ASC' | 'DESC'
      textSearch?: string
      deviceProfileId?: string
    }
  ) =>
    thingsBoardRequest<ThingsBoardDeviceInfosResponse>(
      'get',
      `/api/customer/${customerId}/deviceInfos`,
      params as Record<string, unknown>
    ),

  /** GET /api/edge/types — danh sách edge types cho filter */
  getEdgeTypes: () =>
    thingsBoardRequest<string[] | { types?: string[] }>('get', '/api/edge/types'),

  /** GET /api/customer/{customerId}/edgeInfos — danh sách edge của customer */
  getCustomerEdgeInfos: (
    customerId: string,
    params?: {
      pageSize?: number
      page?: number
      sortProperty?: string
      sortOrder?: 'ASC' | 'DESC'
      textSearch?: string
      type?: string
    }
  ) =>
    thingsBoardRequest<{
      data?: Array<{
        id?: { id?: string }
        name?: string
        type?: string
        label?: string
        createdTime?: number
      }>
      totalElements?: number
    }>('get', `/api/customer/${customerId}/edgeInfos`, params as Record<string, unknown>),

  /** GET /api/tenant/deviceInfos — danh sách thiết bị (phân trang, sắp xếp) */
  getDeviceInfos: (params?: {
    pageSize?: number
    page?: number
    sortProperty?: string
    sortOrder?: 'ASC' | 'DESC'
    textSearch?: string
    active?: boolean
    deviceProfileId?: string
  }) =>
    thingsBoardRequest<ThingsBoardDeviceInfosResponse>(
      'get',
      '/api/tenant/deviceInfos',
      params as Record<string, unknown>
    ),

  /** GET /api/customer/{customerId}/assetInfos — danh sách asset của customer */
  getCustomerAssetInfos: (
    customerId: string,
    params?: {
      pageSize?: number
      page?: number
      sortProperty?: string
      sortOrder?: 'ASC' | 'DESC'
      assetProfileId?: string
      textSearch?: string
    }
  ) =>
    thingsBoardRequest<ThingsBoardAssetInfosResponse>(
      'get',
      `/api/customer/${customerId}/assetInfos`,
      params as Record<string, unknown>
    ),

  /** GET /api/tenant/assetInfos — danh sách asset (phân trang, sắp xếp) */
  getAssetInfos: (params?: {
    pageSize?: number
    page?: number
    sortProperty?: string
    sortOrder?: 'ASC' | 'DESC'
    type?: string
    assetProfileId?: string
    textSearch?: string
  }) =>
    thingsBoardRequest<ThingsBoardAssetInfosResponse>(
      'get',
      '/api/tenant/assetInfos',
      params as Record<string, unknown>
    ),

  /** GET /api/assetProfileInfo/{profileNameOrId} — thông tin 1 asset profile (vd: default) */
  getAssetProfileInfo: (profileNameOrId: string) =>
    thingsBoardRequest<Record<string, unknown>>('get', `/api/assetProfileInfo/${profileNameOrId}`),

  /** GET /api/assetProfileInfos — danh sách asset profile (phân trang, tìm kiếm) */
  getAssetProfileInfos: (params?: {
    pageSize?: number
    page?: number
    textSearch?: string
    sortProperty?: string
    sortOrder?: 'ASC' | 'DESC'
  }) =>
    thingsBoardRequest<ThingsBoardAssetProfileInfosResponse>(
      'get',
      '/api/assetProfileInfos',
      params as Record<string, unknown>
    ),

  /** POST /api/asset — tạo asset mới */
  createAsset: (body: {
    name: string
    type?: string
    label?: string
    assetProfileId?: { id: string; entityType?: string }
    version?: number
    additionalInfo?: Record<string, unknown>
    customerId?: { id: string; entityType?: string }
    [key: string]: unknown
  }) =>
    thingsBoardRequest<Record<string, unknown>>('post', '/api/asset', undefined, body),

  /** GET /api/asset/info/{assetId} — thông tin chi tiết asset (bao gồm customerTitle, assetProfileName) */
  getAssetInfo: (assetId: string) =>
    thingsBoardRequest<ThingsBoardAssetInfo>('get', `/api/asset/info/${assetId}`),

  /** POST /api/customer/public/asset/{assetId} — make asset public */
  makeAssetPublic: (assetId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/public/asset/${assetId}`),

  /** DELETE /api/customer/asset/{assetId} — unassign / make asset private */
  unassignAssetFromCustomer: (assetId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/asset/${assetId}`),

  /** DELETE /api/asset/{assetId} — delete asset */
  deleteAsset: (assetId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/asset/${assetId}`),

  /** POST /api/customer/{customerId}/asset/{assetId} — assign asset to customer */
  assignAssetToCustomer: (customerId: string, assetId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/${customerId}/asset/${assetId}`),

  /** GET /api/tenant/entityViewInfos — danh sách entity view (phân trang, lọc theo type) */
  getEntityViewInfos: (params?: {
    pageSize?: number
    page?: number
    type?: string
    textSearch?: string
    sortProperty?: string
    sortOrder?: 'ASC' | 'DESC'
  }) =>
    thingsBoardRequest<ThingsBoardEntityViewInfosResponse>(
      'get',
      '/api/tenant/entityViewInfos',
      params as Record<string, unknown>
    ),

  /** GET /api/entityView/types — danh sách entity view type (cho dropdown filter) */
  getEntityViewTypes: () =>
    thingsBoardRequest<string[] | { data?: string[] }>('get', '/api/entityView/types'),

  /** POST /api/entityView — tạo entity view mới */
  createEntityView: (body: {
    name: string
    type: string
    entityId: { id: string; entityType: 'DEVICE' | 'ASSET' }
    keys?: { timeseries?: string[]; attributes?: { cs?: string[]; ss?: string[]; sh?: string[] } }
    startTimeMs?: number
    endTimeMs?: number
    version?: number
    additionalInfo?: Record<string, unknown>
    [key: string]: unknown
  }) =>
    thingsBoardRequest<ThingsBoardEntityViewInfo>('post', '/api/entityView', undefined, body),

  /** POST /api/customer/public/entityView/{entityViewId} — make entity view public */
  makeEntityViewPublic: (entityViewId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/public/entityView/${entityViewId}`),

  /** DELETE /api/customer/entityView/{entityViewId} — unassign / make entity view private */
  unassignEntityViewFromCustomer: (entityViewId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/customer/entityView/${entityViewId}`),

  /** DELETE /api/entityView/{entityViewId} — delete entity view */
  deleteEntityView: (entityViewId: string) =>
    thingsBoardRequest<Record<string, unknown>>('delete', `/api/entityView/${entityViewId}`),

  /** POST /api/customer/{customerId}/entityView/{entityViewId} — assign entity view to customer */
  assignEntityViewToCustomer: (customerId: string, entityViewId: string) =>
    thingsBoardRequest<Record<string, unknown>>('post', `/api/customer/${customerId}/entityView/${entityViewId}`),

  /** GET /api/plugins/telemetry/DEVICE/{deviceId}/values/timeseries (keys, startTs, endTs) */
  getDeviceTelemetry: (
    deviceId: string,
    params?: { keys?: string; startTs?: number; endTs?: number; limit?: number }
  ) =>
    thingsBoardRequest<Record<string, Array<{ ts: number; value: string | number | boolean }>>>(
      'get',
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`,
      params as Record<string, unknown>
    ),

  /** GET /api/plugins/telemetry/DEVICE/{deviceId}/values/attributes */
  getDeviceAttributes: (deviceId: string, params?: { keys?: string }) =>
    thingsBoardRequest<Record<string, string | number | boolean>>(
      'get',
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes`,
      params as Record<string, unknown>
    ),

  /** GET /api/plugins/telemetry/DEVICE/{deviceId}/values/attributes/{scope}?key=... — attributes by scope (SHARED_SCOPE, SERVER_SCOPE, CLIENT_SCOPE) */
  getDeviceAttributesByScope: (
    deviceId: string,
    scope: 'SHARED_SCOPE' | 'SERVER_SCOPE' | 'CLIENT_SCOPE',
    params?: { key?: string }
  ) =>
    thingsBoardRequest<Record<string, string | number | boolean> | string | number | boolean>(
      'get',
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes/${scope}`,
      params as Record<string, unknown>
    ),

  /** POST /api/plugins/telemetry/DEVICE/{deviceId}/values/attributes/{scope} — save attributes by scope */
  saveDeviceAttributesByScope: (
    deviceId: string,
    scope: 'SHARED_SCOPE' | 'SERVER_SCOPE' | 'CLIENT_SCOPE',
    body: Record<string, string | number | boolean | unknown>
  ) =>
    thingsBoardRequest<Record<string, unknown>>(
      'post',
      `/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes/${scope}`,
      undefined,
      body
    ),

  /** POST /api/plugins/telemetry/{entityType}/{entityId}/{scope} — Save entity attributes (saveEntityAttributesV1). Scope: SERVER_SCOPE | SHARED_SCOPE. Body: key-value attributes (e.g. { power: true }). */
  saveEntityAttributes: (
    entityType: string,
    entityId: string,
    scope: 'SERVER_SCOPE' | 'SHARED_SCOPE',
    body: Record<string, string | number | boolean | unknown>
  ) =>
    thingsBoardRequest<Record<string, unknown>>(
      'post',
      `/api/plugins/telemetry/${entityType}/${entityId}/${scope}`,
      undefined,
      body
    ),

  /** Ghi attribute SHARED_SCOPE cho device (onClick Power) — gọi saveEntityAttributes('DEVICE', deviceId, 'SHARED_SCOPE', body). */
  postDeviceSharedScope: (deviceId: string, body: Record<string, string | number | boolean | unknown>) =>
    thingsBoardRequest<Record<string, unknown>>(
      'post',
      `/api/plugins/telemetry/DEVICE/${deviceId}/SHARED_SCOPE`,
      undefined,
      body
    ),

  /** Generic GET (path bắt đầu bằng /api/...) */
  get: <T = unknown>(path: string, params?: Record<string, unknown>) =>
    thingsBoardRequest<T>('get', path.startsWith('/') ? path : `/${path}`, params),

  /** Generic POST */
  post: <T = unknown>(path: string, data?: unknown, params?: Record<string, unknown>) =>
    thingsBoardRequest<T>('post', path.startsWith('/') ? path : `/${path}`, params, data),

  /** Generic PUT */
  put: <T = unknown>(path: string, data?: unknown, params?: Record<string, unknown>) =>
    thingsBoardRequest<T>('put', path.startsWith('/') ? path : `/${path}`, params, data),

  /** Generic DELETE */
  delete: <T = unknown>(path: string, params?: Record<string, unknown>) =>
    thingsBoardRequest<T>('delete', path.startsWith('/') ? path : `/${path}`, params),
}

export default thingsBoardApi
