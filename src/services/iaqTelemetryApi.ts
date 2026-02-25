import api from './api'
import type {
  IaqTelemetry,
  IaqTelemetryQueryParams,
  IaqTelemetryIngestItem,
} from './types'

export const iaqTelemetryApi = {
  query: (params: IaqTelemetryQueryParams): Promise<IaqTelemetry[]> =>
    api.get('/energy/telemetry/iaq', { params }),

  ingestBulk: (data: IaqTelemetryIngestItem[]): Promise<unknown> =>
    api.post('/energy/telemetry/iaq/bulk', data),
}
