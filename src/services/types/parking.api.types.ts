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
