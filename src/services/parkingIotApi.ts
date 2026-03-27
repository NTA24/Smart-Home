import { campusApiClient } from '@/lib/http/campusClient'
import type {
  AccessControlRecentItem,
  AdminForceExitBody,
  AllowExitBySubscriptionBody,
  ConfirmEntranceBody,
  ConfirmExitPaymentBody,
  ParkingConfigItem,
  ParkingConfigUpdateBody,
  ParkingDashboardRevenue,
  ParkingDashboardStats,
  ParkingDashboardTraffic,
  ParkingEventBulkItem,
  ParkingEventBulkResponse,
  ParkingEventItem,
  ParkingEventsListResponse,
  ParkingPricingItem,
  ParkingPricingListResponse,
  ParkingPricingUpsertBody,
  ParkingSpot,
  ParkingSpotsListResponse,
  ParkingSubscriptionCheckResponse,
  ParkingSubscriptionCreateBody,
  ParkingSubscriptionItem,
  ParkingSubscriptionsListResponse,
  ParkingTicketItem,
  ParkingTicketsListResponse,
  ParkingVehicle,
  ParkingVehiclesListResponse,
  ParkingZone,
  ParkingZonesListResponse,
} from './types/parking.api.types'

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

type ParkingEventsListParams = {
  parking_zone_id?: string
  gate_id?: string
  plate?: string
  status?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export const parkingEventsApi = {
  /** POST /api/parking/events/bulk — Ingest parking events (body: array of events) */
  bulk: (events: ParkingEventBulkItem[]) =>
    campusApiClient
      .post('/api/parking/events/bulk', events)
      .then((r: unknown) => r as ParkingEventBulkResponse),
  /** GET /api/parking/events/entrance/list */
  getEntranceList: (params?: Partial<ParkingEventsListParams>) =>
    campusApiClient
      .get('/api/parking/events/entrance/list', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => {
        if (Array.isArray(r)) return { items: r as ParkingEventItem[], total: (r as ParkingEventItem[]).length }
        return r as ParkingEventsListResponse
      }),
  /** GET /api/parking/events/exit/list */
  getExitList: (params?: Partial<ParkingEventsListParams>) =>
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

export const parkingAccessControlApi = {
  /** GET /api/parking/access-control/recent */
  getRecent: (params?: { direction?: string | null; plate?: string | null; from?: string | null; to?: string | null; limit?: number; offset?: number }) =>
    campusApiClient
      .get('/api/parking/access-control/recent', { params: { limit: 50, offset: 0, ...params } })
      .then((r: unknown) => (Array.isArray(r) ? { items: r as AccessControlRecentItem[] } : r as { items: AccessControlRecentItem[] })),
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
