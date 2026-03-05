// ========================
// HVAC Telemetry Types — GET /api/energy/telemetry/hvac, POST .../hvac/bulk
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
  extra: Record<string, unknown>
}

/** GET query — asset_id, start, end required; limit (1–200000, default 10000) */
export interface HvacTelemetryQueryParams {
  asset_id: string
  start: string
  end: string
  limit?: number
}

/** POST bulk body — array of items */
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
