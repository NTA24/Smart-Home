// ========================
// Tenant Types
// ========================

/**
 * Interface cho Tenant entity
 * Dựa theo response thực tế từ API: campus.iot-platform.io.vn
 */
export interface Tenant {
  id: string
  code: string
  name: string
  status: string // "ACTIVE", "INACTIVE", ...
  created_at: string
  updated_at?: string
}

/**
 * Payload khi tạo mới Tenant
 */
export interface CreateTenantPayload {
  code: string
  name: string
  status?: string
}

/**
 * Payload khi cập nhật Tenant (tất cả fields là optional)
 */
export interface UpdateTenantPayload {
  code?: string
  name?: string
  status?: string
}

/**
 * Params cho API lấy danh sách Tenant
 */
export interface TenantListParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
}
