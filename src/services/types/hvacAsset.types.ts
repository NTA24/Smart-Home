// ========================
// HVAC Asset Types
// ========================

/**
 * Interface cho HVAC Asset entity
 * Dựa theo Swagger: GET /api/energy/hvac-assets/{id}, list items
 */
export interface HvacAsset {
  id: string
  tenant_id: string
  device_id: string
  scope_type: string
  scope_id: string
  system_type: string
  role_type: string
  parent_id: string
  rated_kw: number
  meta: Record<string, unknown>
  created_at?: string
}

/**
 * Payload khi tạo mới HVAC Asset
 * POST /api/energy/hvac-assets
 */
export interface CreateHvacAssetPayload {
  tenant_id: string
  device_id: string
  scope_type: string
  scope_id: string
  system_type: string
  role_type: string
  parent_id: string
  rated_kw: number
  meta?: Record<string, unknown>
}

/**
 * Payload khi cập nhật HVAC Asset
 * PATCH /api/energy/hvac-assets/{id}
 */
export interface UpdateHvacAssetPayload {
  device_id?: string
  scope_type?: string
  scope_id?: string
  system_type?: string
  role_type?: string
  parent_id?: string
  rated_kw?: number
  meta?: Record<string, unknown>
}

/**
 * Params cho API lấy danh sách HVAC Asset
 * GET /api/energy/hvac-assets/list — limit (1–500, default 50), offset (min 0, default 0)
 */
export interface HvacAssetListParams {
  limit?: number
  offset?: number
  search?: string
  tenant_id?: string
  device_id?: string
  system_type?: string
}
