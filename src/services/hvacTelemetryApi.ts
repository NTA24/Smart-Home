import api from './api'
import type {
  HvacTelemetry,
  HvacTelemetryQueryParams,
  HvacTelemetryIngestItem,
} from './types'

export const hvacTelemetryApi = {
  query: (params: HvacTelemetryQueryParams): Promise<HvacTelemetry[]> =>
    api.get('/energy/telemetry/hvac', { params }),

  ingestBulk: (data: HvacTelemetryIngestItem[]): Promise<unknown> =>
    api.post('/energy/telemetry/hvac/bulk', data),
}
