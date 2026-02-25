// ========================
// IAQ Telemetry Types
// ========================

export interface IaqTelemetry {
  device_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra: Record<string, unknown>
}

export interface IaqTelemetryQueryParams {
  device_id: string
  start: string
  end: string
  limit?: number
}

export interface IaqTelemetryIngestItem {
  device_id: string
  ts: string
  temp_c: number
  humidity: number
  co2_ppm: number
  pm25: number
  extra?: Record<string, unknown>
}
