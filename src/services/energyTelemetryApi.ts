import api from './api'
import type {
  EnergyTelemetry,
  EnergyTelemetryQueryParams,
  EnergyTelemetryIngestItem,
} from './types'

// ========================
// Energy Telemetry API
// ========================

export const energyTelemetryApi = {
  /**
   * Query Energy Telemetry
   * GET /api/energy/telemetry/energy
   */
  query: (params: EnergyTelemetryQueryParams): Promise<EnergyTelemetry[]> =>
    api.get('/energy/telemetry/energy', { params }),

  /**
   * Ingest Energy Telemetry (bulk)
   * POST /api/energy/telemetry/energy/bulk
   */
  ingestBulk: (data: EnergyTelemetryIngestItem[]): Promise<unknown> =>
    api.post('/energy/telemetry/energy/bulk', data),
}
