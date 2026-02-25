// ========================
// Energy Aggregate Types
// ========================

/**
 * Interface cho Energy Aggregate entity
 * Dựa theo Swagger: campus.iot-platform.io.vn
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
  updated_at?: string
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
 * Params cho API lấy danh sách Energy Aggregate
 */
export interface EnergyAggregateListParams {
  limit?: number
  offset?: number
  search?: string
  scope_type?: string
  scope_id?: string
  bucket?: string
}
