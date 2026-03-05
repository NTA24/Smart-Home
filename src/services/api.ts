import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const CHAT_WITH_AI_URL =
  (import.meta.env.VITE_CHAT_AI_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://campus.iot-platform.io.vn'

const CAMPUS_API_BASE = CHAT_WITH_AI_URL

const campusApiClient = axios.create({
  baseURL: CAMPUS_API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})
campusApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
campusApiClient.interceptors.response.use((r) => r.data, (e) => Promise.reject(e))

export interface ParkingDashboardStats {
  total_spots: number
  used_spots: number
  available_spots: number
  usage_rate: number
  zones: Array<{ name: string; total: number; used: number; color: string | null }>
}

export interface ParkingDashboardTraffic {
  period: string
  in_count: number
  out_count: number
  hourly: number[]
}

export interface ParkingDashboardRevenue {
  period: string
  total: number
  series: number[]
}

export interface ParkingZone {
  id: string
  name?: string
  code?: string | null
  building_id?: string | null
  [key: string]: unknown
}

export interface ParkingZonesListResponse {
  items: ParkingZone[]
  total?: number
}

export interface ParkingSpotMeta {
  occupied?: boolean
  plate_no?: string | null
  entry_time?: string | null
  [key: string]: unknown
}

export interface ParkingSpot {
  id: string
  parking_zone_id?: string | null
  spot_code?: string | null
  spot_type?: string | null
  status?: string | null
  meta?: ParkingSpotMeta | null
  [key: string]: unknown
}

export interface ParkingSpotsListResponse {
  items: ParkingSpot[]
  total?: number
}

export interface ParkingVehicleMeta {
  brand?: string | null
  color?: string | null
  [key: string]: unknown
}

export interface ParkingVehicle {
  id: string
  plate_no?: string | null
  vehicle_type?: string | null
  meta?: ParkingVehicleMeta | null
  [key: string]: unknown
}

export interface ParkingVehiclesListResponse {
  items: ParkingVehicle[]
  total?: number
}

export const parkingDashboardApi = {
  getStats: (params?: { building_id?: string | null; parking_zone_id?: string | null }) =>
    campusApiClient.get('/api/parking/dashboard/stats', { params }).then((r: unknown) => r as ParkingDashboardStats),
  getTraffic: (params?: { building_id?: string | null; parking_zone_id?: string | null; period?: string }) =>
    campusApiClient.get('/api/parking/dashboard/traffic', { params: { period: 'day', ...params } }).then((r: unknown) => r as ParkingDashboardTraffic),
  getRevenue: (params?: { building_id?: string | null; parking_zone_id?: string | null; period?: string }) =>
    campusApiClient.get('/api/parking/dashboard/revenue', { params: { period: 'day', ...params } }).then((r: unknown) => r as ParkingDashboardRevenue),
  /** GET /api/parking/zones/list — List parking zones (optional filter by building_id, code; pagination: limit, offset) */
  getZonesList: (params?: { building_id?: string | null; code?: string | null; limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/zones/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingZone[], total: (r as ParkingZone[]).length }
        return r as ParkingZonesListResponse
      }),
  /** GET /api/parking/spots/list — List parking spots (limit/offset) */
  getSpotsList: (params?: { limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/spots/list', { params: { limit: 50, offset: 0, ...(params ?? {}) } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingSpot[], total: (r as ParkingSpot[]).length }
        return r as ParkingSpotsListResponse
      }),
  /** GET /api/parking/spots/{id} — Get single parking spot detail */
  getSpotDetail: (id: string) =>
    campusApiClient.get(`/api/parking/spots/${id}`).then((r: unknown) => r as ParkingSpot),
  /** GET /api/parking/vehicles/list — List vehicles */
  getVehiclesList: (params?: { limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/vehicles/list', { params: { limit: 50, offset: 0, ...(params ?? {}) } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingVehicle[], total: (r as ParkingVehicle[]).length }
        return r as ParkingVehiclesListResponse
      }),
}

// --- Parking Subscriptions (campus.iot-platform.io.vn) ---
export interface ParkingSubscriptionItem {
  id: string
  tenant_id: string
  plate_no?: string | null
  owner_name?: string | null
  phone?: string | null
  vehicle_type?: string | null
  plan_type?: string | null
  valid_from?: string | null
  valid_to?: string | null
  status?: string | null
  auto_renew?: boolean
  zone?: string | null
  rules?: unknown[]
  created_at?: string | null
  [key: string]: unknown
}

export interface ParkingSubscriptionsListResponse {
  items: ParkingSubscriptionItem[]
  total?: number
  limit?: number
  offset?: number
}

export interface ParkingSubscriptionCheckResponse {
  active: boolean
  reason?: string | null
  subscription?: ParkingSubscriptionItem | null
}

export interface ParkingSubscriptionCreateBody {
  tenant_id: string
  plate_no?: string | null
  owner_name?: string | null
  phone?: string | null
  vehicle_type?: string | null
  plan_type?: string | null
  valid_from?: string | null
  valid_to?: string | null
  status?: string | null
  auto_renew?: boolean
  zone?: string | null
  rules?: Record<string, unknown> | unknown[]
}

export const parkingSubscriptionApi = {
  /** GET /api/parking/subscriptions/list — List subscriptions (tenant_id required) */
  getList: (params: {
    tenant_id: string
    search?: string | null
    status?: string | null
    plan?: string | null
    vehicle_type?: string | null
    zone?: string | null
    valid_from?: string | null
    valid_to?: string | null
    limit?: number
    offset?: number
  }) =>
    campusApiClient
      .get('/api/parking/subscriptions/list', {
        params: { limit: 50, offset: 0, ...params },
      })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingSubscriptionItem[], total: (r as ParkingSubscriptionItem[]).length }
        return r as ParkingSubscriptionsListResponse
      }),
  /** GET /api/parking/subscriptions/check — Check subscription by plate + vehicle_type */
  check: (params: {
    tenant_id: string
    plate_number: string
    vehicle_type: string
    at?: string | null
  }) =>
    campusApiClient
      .get('/api/parking/subscriptions/check', { params })
      .then((r: unknown) => r as ParkingSubscriptionCheckResponse),
  /** GET /api/parking/subscriptions/{subscription_id} */
  getOne: (subscription_id: string) =>
    campusApiClient
      .get(`/api/parking/subscriptions/${subscription_id}`)
      .then((r: unknown) => r as ParkingSubscriptionItem),
  /** PATCH /api/parking/subscriptions/{subscription_id} */
  update: (subscription_id: string, body: Partial<ParkingSubscriptionCreateBody>) =>
    campusApiClient
      .patch(`/api/parking/subscriptions/${subscription_id}`, body)
      .then((r: unknown) => r as ParkingSubscriptionItem),
  /** DELETE /api/parking/subscriptions/{subscription_id} */
  delete: (subscription_id: string) =>
    campusApiClient.delete(`/api/parking/subscriptions/${subscription_id}`),
  /** POST /api/parking/subscriptions — Create subscription */
  create: (body: ParkingSubscriptionCreateBody) =>
    campusApiClient
      .post('/api/parking/subscriptions', body)
      .then((r: unknown) => r as ParkingSubscriptionItem),
}

// --- Parking Events (campus.iot-platform.io.vn) ---
export interface ParkingEventItem {
  id: string
  parking_zone_id?: string | null
  ts?: string | null
  plate_no?: string | null
  vehicle_id?: string | null
  direction?: string | null
  gate_id?: string | null
  camera_device_id?: string | null
  status?: string | null
  reason?: string | null
  extra?: Record<string, unknown> | null
  [key: string]: unknown
}

export interface ParkingEventsListResponse {
  items: ParkingEventItem[]
  total?: number
  limit?: number
  offset?: number
}

const eventsListParams = {
  parking_zone_id: undefined as string | undefined,
  gate_id: undefined as string | undefined,
  plate: undefined as string | undefined,
  status: undefined as string | undefined,
  from: undefined as string | undefined,
  to: undefined as string | undefined,
  limit: 50,
  offset: 0,
}

export interface ParkingEventBulkItem {
  parking_zone_id: string
  ts: string
  plate_no: string
  vehicle_id?: string | null
  direction?: string | null
  gate_id?: string | null
  camera_device_id?: string | null
  status?: string | null
  reason?: string | null
  extra?: Record<string, unknown> | null
}

export interface ParkingEventBulkResponse {
  inserted?: number
  duplicated?: number
  failed?: number
  results?: Array<{ row_index: number; accepted: boolean; reason?: string; event_id?: string }>
}

export interface ConfirmEntranceBody {
  parking_zone_id: string
  plate_no: string
  vehicle_type?: string | null
  gate_id?: string | null
  camera_device_id?: string | null
  spot_id?: string | null
  operator?: string | null
  ts?: string | null
  note?: string | null
}

export interface ConfirmExitPaymentBody {
  parking_zone_id: string
  plate_no: string
  vehicle_type?: string | null
  gate_id?: string | null
  payment_method?: string | null
  fee?: number
  operator?: string | null
  ts?: string | null
}

export interface AllowExitBySubscriptionBody {
  tenant_id: string
  parking_zone_id: string
  plate_no: string
  vehicle_type?: string | null
  gate_id?: string | null
  operator?: string | null
  ts?: string | null
}

export interface AdminForceExitBody {
  plate_no: string
  reason?: string | null
  operator?: string | null
  ts?: string | null
}

export const parkingEventsApi = {
  /** POST /api/parking/events/bulk — Ingest parking events (body: array of events) */
  bulk: (events: ParkingEventBulkItem[]) =>
    campusApiClient
      .post('/api/parking/events/bulk', events)
      .then((r: unknown) => r as ParkingEventBulkResponse),
  /** GET /api/parking/events/entrance/list */
  getEntranceList: (params?: Partial<typeof eventsListParams>) =>
    campusApiClient
      .get('/api/parking/events/entrance/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingEventItem[], total: (r as ParkingEventItem[]).length }
        return r as ParkingEventsListResponse
      }),
  /** GET /api/parking/events/exit/list */
  getExitList: (params?: Partial<typeof eventsListParams>) =>
    campusApiClient
      .get('/api/parking/events/exit/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingEventItem[], total: (r as ParkingEventItem[]).length }
        return r as ParkingEventsListResponse
      }),
  /** POST /api/parking/events/entrance/confirm */
  confirmEntrance: (body: ConfirmEntranceBody) =>
    campusApiClient.post('/api/parking/events/entrance/confirm', body).then((r: unknown) => r as ParkingEventItem),
  /** POST /api/parking/events/exit/confirm-payment */
  confirmExitPayment: (body: ConfirmExitPaymentBody) =>
    campusApiClient.post('/api/parking/events/exit/confirm-payment', body).then((r: unknown) => r as ParkingEventItem),
  /** POST /api/parking/events/exit/allow-subscription */
  allowExitBySubscription: (body: AllowExitBySubscriptionBody) =>
    campusApiClient.post('/api/parking/events/exit/allow-subscription', body).then((r: unknown) => r as ParkingEventItem),
  /** POST /api/parking/admin/force-exit */
  adminForceExit: (body: AdminForceExitBody) =>
    campusApiClient.post('/api/parking/admin/force-exit', body).then((r: unknown) => r as ParkingEventItem),
}

// --- Parking Access Control (campus.iot-platform.io.vn) ---
export interface AccessControlRecentItem {
  id?: string
  occurred_at?: string | null
  direction?: string | null
  plate_no?: string | null
  vehicle_type?: string | null
  status?: string | null
  operator?: string | null
  fee?: number
  gate_id?: string | null
  [key: string]: unknown
}

export const parkingAccessControlApi = {
  /** GET /api/parking/access-control/recent */
  getRecent: (params?: { direction?: string | null; plate?: string | null; from?: string | null; to?: string | null; limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/access-control/recent', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => (Array.isArray(r) ? { items: r as AccessControlRecentItem[] } : r as { items: AccessControlRecentItem[] })),
}

// --- Parking Tickets (campus.iot-platform.io.vn) ---
export interface ParkingTicketItem {
  id?: string
  ticket_id?: string
  plate_no?: string | null
  vehicle_type?: string | null
  entry_time?: string | null
  exit_time?: string | null
  fee?: number
  paid?: boolean
  payment_method?: string | null
  status?: string | null
  gate_id?: string | null
  owner_name?: string | null
  phone?: string | null
  [key: string]: unknown
}

export interface ParkingTicketsListResponse {
  items: ParkingTicketItem[]
  total?: number
  limit?: number
  offset?: number
  total_fee?: number
  active_count?: number
  closed_count?: number
  exception_count?: number
}

export const parkingTicketsApi = {
  /** GET /api/parking/tickets/list */
  getList: (params?: {
    search?: string | null
    status?: string | null
    gate_id?: string | null
    zone?: string | null
    payment_method?: string | null
    paid?: boolean | null
    entry_from?: string | null
    entry_to?: string | null
    limit?: number
    offset?: number
  }) =>
    campusApiClient
      .get('/api/parking/tickets/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingTicketItem[], total: (r as ParkingTicketItem[]).length }
        return r as ParkingTicketsListResponse
      }),
  /** GET /api/parking/tickets/{ticket_id} */
  getDetail: (ticket_id: string) =>
    campusApiClient
      .get(`/api/parking/tickets/${ticket_id}`)
      .then((r: unknown) => r as ParkingTicketItem),
}

// --- Parking Config (campus.iot-platform.io.vn) ---
export interface ParkingConfigItem {
  id?: string
  tenant_id?: string | null
  auto_open_barrier_after_paid?: boolean
  free_exit_minutes?: number
  max_plate_retries?: number
  default_entry_gate?: string | null
  default_exit_gate?: string | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

export interface ParkingConfigUpdateBody {
  tenant_id: string
  auto_open_barrier_after_paid?: boolean
  free_exit_minutes?: number
  max_plate_retries?: number
  default_entry_gate?: string | null
  default_exit_gate?: string | null
}

export const parkingConfigApi = {
  /** GET /api/parking/config?tenant_id= */
  get: (tenant_id: string) =>
    campusApiClient.get('/api/parking/config', { params: { tenant_id } }).then((r: unknown) => r as ParkingConfigItem),
  /** PATCH /api/parking/config */
  update: (body: ParkingConfigUpdateBody) =>
    campusApiClient.patch('/api/parking/config', body).then((r: unknown) => r as ParkingConfigItem),
  /** GET /api/parking/config/read?tenant_id= */
  read: (tenant_id: string) =>
    campusApiClient.get('/api/parking/config/read', { params: { tenant_id } }).then((r: unknown) => r as ParkingConfigItem),
  /** POST /api/parking/config/reset?tenant_id= */
  reset: (tenant_id: string) =>
    campusApiClient.post('/api/parking/config/reset', null, { params: { tenant_id } }).then((r: unknown) => r as ParkingConfigItem),
}

// --- Parking Pricing (campus.iot-platform.io.vn) ---
export interface ParkingPricingItem {
  id?: string
  tenant_id?: string | null
  vehicle_type?: string | null
  hourly_rate?: number
  daily_rate?: number
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

export interface ParkingPricingUpsertItem {
  vehicle_type: string
  hourly_rate?: number
  daily_rate?: number
}

export interface ParkingPricingUpsertBody {
  tenant_id: string
  items: ParkingPricingUpsertItem[]
}

export interface ParkingPricingListResponse {
  items: ParkingPricingItem[]
  total?: number
  limit?: number
  offset?: number
}

export const parkingPricingApi = {
  /** GET /api/parking/pricing/list */
  getList: (params: { tenant_id: string; vehicle_type?: string | null; limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/pricing/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingPricingItem[], total: (r as ParkingPricingItem[]).length }
        return r as ParkingPricingListResponse
      }),
  /** PUT /api/parking/pricing — Upsert pricing */
  upsert: (body: ParkingPricingUpsertBody) =>
    campusApiClient.put('/api/parking/pricing', body).then((r: unknown) => r as ParkingPricingListResponse),
}

// Example API functions
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: () => api.get('/dashboard/charts'),
}

export const parkingApi = {
  getStatus: () => api.get('/parking/status'),
  getVehicles: () => api.get('/parking/vehicles'),
  getHistory: (params: { page: number; limit: number }) =>
    api.get('/parking/history', { params }),
}

export const deviceApi = {
  /** GET /api/devices/list — List Items */
  getList: (params?: { limit?: number; offset?: number }) =>
    api.get('/devices/list', { params }),
  getDevices: (params?: { status?: string; type?: string }) =>
    api.get('/devices', { params }),
  getDeviceDetail: (id: string) => api.get(`/devices/${id}`),
  restartDevice: (id: string) => api.post(`/devices/${id}/restart`),
}

export const energyApi = {
  getCurrentPower: () => api.get('/energy/current'),
  getConsumption: (params: { startDate: string; endDate: string }) =>
    api.get('/energy/consumption', { params }),
  getComparison: (year: number) => api.get(`/energy/comparison/${year}`),
}
