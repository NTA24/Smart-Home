// ========================
// HVAC Telemetry Types
// ========================

export interface HvacTelemetry {
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

export interface HvacTelemetryQueryParams {
  asset_id: string
  start: string
  end: string
  limit?: number
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
