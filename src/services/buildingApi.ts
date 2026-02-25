import api from './api'
import type {
  Building,
  CreateBuildingPayload,
  UpdateBuildingPayload,
  BuildingListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// Building API
// ========================

export const buildingApi = {
  /**
   * Lấy danh sách Buildings
   * GET /api/buildings/list
   */
  getList: (params?: BuildingListParams): Promise<ListResponse<Building>> =>
    api.get('/buildings/list', { params }),

  /**
   * Lấy danh sách Buildings theo Campus
   * GET /api/buildings/by-campus?campus_id=...
   */
  getListByCampusId: (campusId: string): Promise<ListResponse<Building>> =>
    api.get('/buildings/by-campus', { params: { campus_id: campusId } }),

  /**
   * Lấy chi tiết một Building theo ID
   * GET /api/buildings/:id
   */
  getById: (id: string): Promise<Building> =>
    api.get(`/buildings/${id}`),

  /**
   * Tạo mới một Building
   * POST /api/buildings
   */
  create: (payload: CreateBuildingPayload): Promise<Building> =>
    api.post('/buildings', payload),

  /**
   * Cập nhật thông tin Building
   * PATCH /api/buildings/:id
   */
  update: (id: string, payload: UpdateBuildingPayload): Promise<Building> =>
    api.patch(`/buildings/${id}`, payload),

  /**
   * Xóa một Building
   * DELETE /api/buildings/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/buildings/${id}`),
}
