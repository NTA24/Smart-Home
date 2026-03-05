// ========================
// Energy Aggregate Types
// ========================

/**
 * Energy Aggregate — GET /api/energy/aggregates-table/list, GET /api/energy/aggregates-table/{id}
 * Response: id, scope_type, scope_id, bucket, bucket_start, kwh, kw_avg, kw_peak, breakdown, created_at
 */
export interface EnergyAggregate {
  id: string
  scope_type: string
  scope_id: string
  bucket: string
  bucket_start: string
  kwh: number
  kw_avg: number
  kw_peak: number
  breakdown: Record<string, unknown>
  created_at?: string
}

/**
 * Payload khi tạo mới Energy Aggregate
 * Theo Swagger: POST /api/energy/aggregates-table
 */
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

/**
 * Payload khi cập nhật Energy Aggregate
 * Theo Swagger: PATCH /api/energy/aggregates-table/{id}
 */
export interface UpdateEnergyAggregatePayload {
  kwh?: number
  kw_avg?: number
  kw_peak?: number
  breakdown?: Record<string, unknown>
}

/**
 * GET /api/energy/aggregates-table/list — limit (1–500, default 50), offset (min 0, default 0)
 */
export interface EnergyAggregateListParams {
  limit?: number
  offset?: number
  search?: string
  scope_type?: string
  scope_id?: string
  bucket?: string
}
