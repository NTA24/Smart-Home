// ========================
// Building Types
// ========================

/**
 * Interface cho Building entity
 * Dựa theo response thực tế từ API: campus.iot-platform.io.vn
 */
export interface Building {
  id: string
  campus_id: string
  code: string
  name: string
  building_type?: string
  status: string // "ACTIVE", "INACTIVE", ...
  created_at: string
  updated_at?: string
}

/**
 * Payload khi tạo mới Building
 * Theo Swagger: POST /api/buildings
 */
export interface CreateBuildingPayload {
  campus_id: string
  code: string
  name: string
  building_type?: string
  status?: string
}

/**
 * Payload khi cập nhật Building
 * Theo Swagger: PATCH /api/buildings/{id}
 */
export interface UpdateBuildingPayload {
  name?: string
  building_type?: string
  status?: string
}

/**
 * Params cho API lấy danh sách Building
 */
export interface BuildingListParams {
  limit?: number
  offset?: number
  search?: string
  campus_id?: string
  status?: string
}
