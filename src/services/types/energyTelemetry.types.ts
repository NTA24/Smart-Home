// ========================
// Energy Telemetry Types
// ========================

/**
 * Interface cho Energy Telemetry record
 */
export interface EnergyTelemetry {
  device_id: string
  ts: string
  kwh_delta: number
  kw: number
  voltage: number
  current: number
  pf: number
  extra: Record<string, unknown>
}

/**
 * Params cho API query Energy Telemetry
 * GET /api/energy/telemetry/energy
 */
export interface EnergyTelemetryQueryParams {
  device_id: string
  start: string
  end: string
  limit?: number // max 200000, min 1, default 10000
}

/**
 * Payload khi ingest Energy Telemetry (bulk)
 * POST /api/energy/telemetry/energy/bulk
 * Body is an array of EnergyTelemetryIngestItem
 */
export interface EnergyTelemetryIngestItem {
  device_id: string
  ts: string
  kwh_delta: number
  kw: number
  voltage: number
  current: number
  pf: number
  extra?: Record<string, unknown>
}
