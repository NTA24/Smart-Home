// ========================
// Common types
// ========================

export interface ListResponse<T> {
  items: T[]
  total: number
}

export interface DeleteResponse {
  message?: string
  affected?: number
}

// ========================
// Tenant
// ========================

export interface Tenant {
  id: string
  name: string
  slug?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateTenantPayload {
  name: string
  slug?: string
  status?: string
}

export interface UpdateTenantPayload {
  name?: string
  slug?: string
  status?: string
}

export interface TenantListParams {
  limit?: number
  offset?: number
}

// ========================
// Campus
// ========================

export interface Campus {
  id: string
  tenant_id: string
  name: string
  address?: string
  timezone?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateCampusPayload {
  tenant_id: string
  name: string
  address?: string
  timezone?: string
  status?: string
}

export interface UpdateCampusPayload {
  name?: string
  address?: string
  timezone?: string
  status?: string
}

export interface CampusListParams {
  limit?: number
  offset?: number
  tenant_id?: string
}

// ========================
// Building
// ========================

export interface Building {
  id: string
  campus_id: string
  name: string
  code?: string
  building_type?: string
  address?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateBuildingPayload {
  campus_id: string
  name: string
  code?: string
  building_type?: string
  address?: string
  status?: string
}

export interface UpdateBuildingPayload {
  name?: string
  code?: string
  building_type?: string
  address?: string
  status?: string
}

export interface BuildingListParams {
  limit?: number
  offset?: number
  campus_id?: string
}

// ========================
// Energy Meter
// ========================

export interface EnergyMeter {
  id?: string
  device_id: string
  meter_type: string
  phase: string
  unit_default: string
  meta?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CreateEnergyMeterPayload {
  device_id: string
  meter_type: string
  phase: string
  unit_default: string
  meta?: Record<string, unknown>
}

export interface UpdateEnergyMeterPayload {
  meter_type?: string
  phase?: string
  unit_default?: string
  meta?: Record<string, unknown>
}

export interface EnergyMeterListParams {
  limit?: number
  offset?: number
}

// ========================
// HVAC Asset (Swagger: /api/energy/hvac-assets)
// ========================

export interface HvacAsset {
  id: string
  tenant_id: string
  device_id: string
  scope_type: string
  scope_id: string
  system_type: string
  role_type: string
  parent_id: string
  rated_kw: number
  meta?: Record<string, unknown>
  created_at?: string
}

export interface CreateHvacAssetPayload {
  tenant_id: string
  device_id: string
  scope_type: string
  scope_id: string
  system_type: string
  role_type: string
  parent_id: string
  rated_kw: number
  meta?: Record<string, unknown>
}

export interface UpdateHvacAssetPayload {
  device_id?: string
  scope_type?: string
  scope_id?: string
  system_type?: string
  role_type?: string
  parent_id?: string
  rated_kw?: number
  meta?: Record<string, unknown>
}

export interface HvacAssetListParams {
  limit?: number
  offset?: number
}

// ========================
// IAQ Sensor
// ========================

/** Swagger: GET /api/energy/iaq-sensors/list, GET /api/energy/iaq-sensors/{id} */
export interface IaqSensor {
  id?: string
  device_id: string
  sensor_type: string
  meta?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

/** POST /api/energy/iaq-sensors */
export interface CreateIaqSensorPayload {
  device_id: string
  sensor_type: string
  meta?: Record<string, unknown>
}

/** PATCH /api/energy/iaq-sensors/{id} */
export interface UpdateIaqSensorPayload {
  sensor_type?: string
  meta?: Record<string, unknown>
}

/** GET list — limit (1–500, default 50), offset (min 0, default 0) */
export interface IaqSensorListParams {
  limit?: number
  offset?: number
}

// ========================
// Energy Aggregate
// ========================

/** Swagger: GET /api/energy/aggregates-table/list, GET /api/energy/aggregates-table/{id} */
export interface EnergyAggregate {
  id: string
  scope_type: string
  scope_id: string
  bucket: string
  bucket_start: string
  kwh: number
  kw_avg: number
  kw_peak: number
  breakdown?: Record<string, unknown>
  created_at?: string
}

/** POST /api/energy/aggregates-table */
export interface CreateEnergyAggregatePayload {
  scope_type: string
  scope_id: string
  bucket: string
  bucket_start: string
  kwh: number
  kw_avg: number
  kw_peak: number
  breakdown?: Record<string, unknown>
}

/** PATCH /api/energy/aggregates-table/{id} */
export interface UpdateEnergyAggregatePayload {
  kwh?: number
  kw_avg?: number
  kw_peak?: number
  breakdown?: Record<string, unknown>
}

/** GET list — limit (1–500, default 50), offset (min 0, default 0) */
export interface EnergyAggregateListParams {
  limit?: number
  offset?: number
  scope_type?: string
  scope_id?: string
  bucket?: string
}

// ========================
// Energy Telemetry
// ========================

export interface EnergyTelemetry {
  id?: string
  meter_id: string
  ts: string
  kwh: number
  kw: number
  voltage: number
  current: number
  pf: number
  extra?: Record<string, unknown>
}

export interface EnergyTelemetryQueryParams {
  meter_id: string
  start: string
  end: string
  interval?: string
}

export interface EnergyTelemetryIngestItem {
  meter_id: string
  ts: string
  kwh: number
  kw: number
  voltage: number
  current: number
  pf: number
  extra?: Record<string, unknown>
}

// ========================
// IAQ Telemetry
// ========================

export interface IaqTelemetry {
  id?: string
  sensor_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra?: Record<string, unknown>
}

export interface IaqTelemetryQueryParams {
  sensor_id: string
  start: string
  end: string
  interval?: string
}

export interface IaqTelemetryIngestItem {
  sensor_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra?: Record<string, unknown>
}

// ========================
// HVAC Telemetry
// ========================

export interface HvacTelemetry {
  id?: string
  asset_id: string
  ts: string
  supply_temp: number
  return_temp: number
  flow: number
  kw: number
  eer: number
  state: string
  extra?: Record<string, unknown>
}

export interface HvacTelemetryQueryParams {
  asset_id: string
  start: string
  end: string
  interval?: string
}

export interface HvacTelemetryIngestItem {
  asset_id: string
  ts: string
  supply_temp: number
  return_temp: number
  flow: number
  kw: number
  eer: number
  state: string
  extra?: Record<string, unknown>
}
