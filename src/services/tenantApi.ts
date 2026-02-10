import api from './api'
import type {
  Tenant,
  CreateTenantPayload,
  UpdateTenantPayload,
  TenantListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// Tenant API
// ========================

export const tenantApi = {
  /**
   * Lấy danh sách Tenants
   * GET /api/tenants/list
   */
  getList: (params?: TenantListParams): Promise<ListResponse<Tenant>> =>
    api.get('/tenants/list', { params }),

  /**
   * Lấy chi tiết một Tenant theo ID
   * GET /api/tenants/:id
   */
  getById: (id: string): Promise<Tenant> =>
    api.get(`/tenants/${id}`),

  /**
   * Tạo mới một Tenant
   * POST /api/tenants
   */
  create: (payload: CreateTenantPayload): Promise<Tenant> =>
    api.post('/tenants', payload),

  /**
   * Cập nhật thông tin Tenant
   * PATCH /api/tenants/:id
   */
  update: (id: string, payload: UpdateTenantPayload): Promise<Tenant> =>
    api.patch(`/tenants/${id}`, payload),

  /**
   * Xóa một Tenant
   * DELETE /api/tenants/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/tenants/${id}`),
}
