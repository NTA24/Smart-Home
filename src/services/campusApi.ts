import api from './api'
import type {
  Campus,
  CreateCampusPayload,
  UpdateCampusPayload,
  CampusListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// Campus API
// ========================

export const campusApi = {
  /**
   * Lấy danh sách Campuses
   * GET /api/campuses/list
   */
  getList: (params?: CampusListParams): Promise<ListResponse<Campus>> =>
    api.get('/campuses/list', { params }),

  /**
   * Lấy danh sách Campuses theo Tenant
   * GET /api/campuses/by-tenant?tenant_id=...
   */
  getListByTenantId: (tenantId: string): Promise<ListResponse<Campus>> =>
    api.get('/campuses/by-tenant', { params: { tenant_id: tenantId } }),

  /**
   * Lấy chi tiết một Campus theo ID
   * GET /api/campuses/:id
   */
  getById: (id: string): Promise<Campus> =>
    api.get(`/campuses/${id}`),

  /**
   * Tạo mới một Campus
   * POST /api/campuses
   */
  create: (payload: CreateCampusPayload): Promise<Campus> =>
    api.post('/campuses', payload),

  /**
   * Cập nhật thông tin Campus
   * PATCH /api/campuses/:id
   */
  update: (id: string, payload: UpdateCampusPayload): Promise<Campus> =>
    api.patch(`/campuses/${id}`, payload),

  /**
   * Xóa một Campus
   * DELETE /api/campuses/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/campuses/${id}`),
}
