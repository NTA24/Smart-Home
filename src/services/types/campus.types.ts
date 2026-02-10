// ========================
// Campus Types
// ========================

/**
 * Interface cho Campus entity
 * Dựa theo response thực tế từ API: campus.iot-platform.io.vn
 */
export interface Campus {
  id: string
  code: string
  name: string
  status: string // "ACTIVE", "INACTIVE", ...
  tenant_id?: string
  address?: string
  timezone?: string
  latitude?: number
  longitude?: number
  description?: string
  created_at: string
  updated_at?: string
}

/**
 * Payload khi tạo mới Campus
 * Theo Swagger: POST /api/campuses
 */
export interface CreateCampusPayload {
  tenant_id: string
  code: string
  name: string
  address?: string
  timezone?: string
  status?: string
}

/**
 * Payload khi cập nhật Campus (tất cả fields là optional)
 */
/**
 * Payload khi cập nhật Campus
 * Theo Swagger: PATCH /api/campuses/{id}
 */
export interface UpdateCampusPayload {
  name?: string
  address?: string
  timezone?: string
  status?: string
}

/**
 * Params cho API lấy danh sách Campus
 */
export interface CampusListParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  tenant_id?: string
  status?: string
}
