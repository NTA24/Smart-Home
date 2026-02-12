import api from './api'
import type {
  EnergyMeter,
  CreateEnergyMeterPayload,
  UpdateEnergyMeterPayload,
  EnergyMeterListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// Energy Meter API
// ========================

export const energyMeterApi = {
  /**
   * Lấy danh sách Energy Meters
   * GET /api/energy/meters/list
   */
  getList: (params?: EnergyMeterListParams): Promise<ListResponse<EnergyMeter>> =>
    api.get('/energy/meters/list', { params }),

  /**
   * Lấy chi tiết một Energy Meter theo ID
   * GET /api/energy/meters/:id
   */
  getById: (id: string): Promise<EnergyMeter> =>
    api.get(`/energy/meters/${id}`),

  /**
   * Tạo mới một Energy Meter
   * POST /api/energy/meters
   */
  create: (payload: CreateEnergyMeterPayload): Promise<EnergyMeter> =>
    api.post('/energy/meters', payload),

  /**
   * Cập nhật thông tin Energy Meter
   * PATCH /api/energy/meters/:id
   */
  update: (id: string, payload: UpdateEnergyMeterPayload): Promise<EnergyMeter> =>
    api.patch(`/energy/meters/${id}`, payload),

  /**
   * Xóa một Energy Meter
   * DELETE /api/energy/meters/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/energy/meters/${id}`),
}
