import api from './api'
import type {
  HvacAsset,
  CreateHvacAssetPayload,
  UpdateHvacAssetPayload,
  HvacAssetListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// HVAC Asset API
// ========================

export const hvacAssetApi = {
  /**
   * Lấy danh sách HVAC Assets
   * GET /api/energy/hvac-assets/list
   */
  getList: (params?: HvacAssetListParams): Promise<ListResponse<HvacAsset>> =>
    api.get('/energy/hvac-assets/list', { params }),

  /**
   * Lấy chi tiết một HVAC Asset theo ID
   * GET /api/energy/hvac-assets/:id
   */
  getById: (id: string): Promise<HvacAsset> =>
    api.get(`/energy/hvac-assets/${id}`),

  /**
   * Tạo mới một HVAC Asset
   * POST /api/energy/hvac-assets
   */
  create: (payload: CreateHvacAssetPayload): Promise<HvacAsset> =>
    api.post('/energy/hvac-assets', payload),

  /**
   * Cập nhật thông tin HVAC Asset
   * PATCH /api/energy/hvac-assets/:id
   */
  update: (id: string, payload: UpdateHvacAssetPayload): Promise<HvacAsset> =>
    api.patch(`/energy/hvac-assets/${id}`, payload),

  /**
   * Xóa một HVAC Asset
   * DELETE /api/energy/hvac-assets/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/energy/hvac-assets/${id}`),
}
