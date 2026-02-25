import api from './api'
import type {
  EnergyAggregate,
  CreateEnergyAggregatePayload,
  UpdateEnergyAggregatePayload,
  EnergyAggregateListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// Energy Aggregate API
// ========================

export const energyAggregateApi = {
  /**
   * Lấy danh sách Energy Aggregates
   * GET /api/energy/aggregates-table/list
   */
  getList: (params?: EnergyAggregateListParams): Promise<ListResponse<EnergyAggregate>> =>
    api.get('/energy/aggregates-table/list', { params }),

  /**
   * Lấy chi tiết một Energy Aggregate theo ID
   * GET /api/energy/aggregates-table/:id
   */
  getById: (id: string): Promise<EnergyAggregate> =>
    api.get(`/energy/aggregates-table/${id}`),

  /**
   * Tạo mới một Energy Aggregate
   * POST /api/energy/aggregates-table
   */
  create: (payload: CreateEnergyAggregatePayload): Promise<EnergyAggregate> =>
    api.post('/energy/aggregates-table', payload),

  /**
   * Cập nhật thông tin Energy Aggregate
   * PATCH /api/energy/aggregates-table/:id
   */
  update: (id: string, payload: UpdateEnergyAggregatePayload): Promise<EnergyAggregate> =>
    api.patch(`/energy/aggregates-table/${id}`, payload),

  /**
   * Xóa một Energy Aggregate
   * DELETE /api/energy/aggregates-table/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/energy/aggregates-table/${id}`),
}
