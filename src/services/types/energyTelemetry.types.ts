// ========================
// Energy Telemetry Types
// ========================

/**
 * Energy Telemetry — GET /api/energy/telemetry/energy response
 */
export interface EnergyTelemetry {
  id?: string
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
 * GET /api/energy/telemetry/energy — device_id, start, end required; limit (1–200000, default 10000)
 */
export interface EnergyTelemetryQueryParams {
  device_id: string
  start: string
  end: string
  limit?: number
}

/**
 * POST /api/energy/telemetry/energy/bulk — body: array of items
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
