// ========================
// HVAC Asset Types
// ========================

/**
 * Interface cho HVAC Asset entity
 * Dựa theo Swagger: campus.iot-platform.io.vn
 */
export interface HvacAsset {
  id: string
  tenant_id: string
  device_id: string
  space_id: string
  system_type: string
  rated_kw: number
  meta: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

/**
 * Payload khi tạo mới HVAC Asset
 * Theo Swagger: POST /api/energy/hvac-assets
 */
export interface CreateHvacAssetPayload {
  tenant_id: string
  device_id: string
  space_id: string
  system_type: string
  rated_kw: number
  meta?: Record<string, unknown>
}

/**
 * Payload khi cập nhật HVAC Asset
 * Theo Swagger: PATCH /api/energy/hvac-assets/{id}
 */
export interface UpdateHvacAssetPayload {
  system_type?: string
  rated_kw?: number
  meta?: Record<string, unknown>
}

/**
 * Params cho API lấy danh sách HVAC Asset
 */
export interface HvacAssetListParams {
  limit?: number
  offset?: number
  search?: string
  tenant_id?: string
  device_id?: string
  system_type?: string
}
