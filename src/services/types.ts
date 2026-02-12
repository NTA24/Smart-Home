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
// HVAC Asset
// ========================

export interface HvacAsset {
  id?: string
  device_id: string
  tenant_id?: string
  space_id?: string
  asset_type?: string
  system_type?: string
  zone?: string
  rated_kw: number
  meta?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CreateHvacAssetPayload {
  device_id: string
  asset_type: string
  zone: string
  rated_kw: number
  meta?: Record<string, unknown>
}

export interface UpdateHvacAssetPayload {
  asset_type?: string
  zone?: string
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

export interface IaqSensor {
  id?: string
  device_id: string
  sensor_model?: string
  sensor_type?: string
  location?: string
  params_supported?: string[]
  meta?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CreateIaqSensorPayload {
  device_id: string
  sensor_model: string
  location: string
  params_supported: string[]
  meta?: Record<string, unknown>
}

export interface UpdateIaqSensorPayload {
  sensor_model?: string
  location?: string
  params_supported?: string[]
  meta?: Record<string, unknown>
}

export interface IaqSensorListParams {
  limit?: number
  offset?: number
}

// ========================
// Energy Aggregate
// ========================

export interface EnergyAggregate {
  id?: string
  meter_id?: string
  scope_type: string
  scope_id: string
  bucket: string
  bucket_start: string
  kwh: number
  kw_avg: number
  kw_peak: number
  breakdown?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

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

export interface UpdateEnergyAggregatePayload {
  kwh?: number
  kw_avg?: number
  kw_peak?: number
  breakdown?: Record<string, unknown>
}

export interface EnergyAggregateListParams {
  limit?: number
  offset?: number
  meter_id?: string
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
