// ========================
// IAQ Telemetry Types — GET /api/energy/telemetry/iaq, POST .../iaq/bulk
// ========================

export interface IaqTelemetry {
  id?: string
  device_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra: Record<string, unknown>
}

/** GET query — device_id, start, end required; limit (1–200000, default 10000) */
export interface IaqTelemetryQueryParams {
  device_id: string
  start: string
  end: string
  limit?: number
}

/** POST bulk body — array of items */
export interface IaqTelemetryIngestItem {
  device_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra?: Record<string, unknown>
}
