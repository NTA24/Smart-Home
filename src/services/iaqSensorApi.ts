import api from './api'
import type {
  IaqSensor,
  CreateIaqSensorPayload,
  UpdateIaqSensorPayload,
  IaqSensorListParams,
  ListResponse,
  DeleteResponse,
} from './types'

// ========================
// IAQ Sensor API
// ========================

export const iaqSensorApi = {
  /**
   * Lấy danh sách IAQ Sensors
   * GET /api/energy/iaq-sensors/list
   */
  getList: (params?: IaqSensorListParams): Promise<ListResponse<IaqSensor>> =>
    api.get('/energy/iaq-sensors/list', { params }),

  /**
   * Lấy chi tiết một IAQ Sensor theo ID
   * GET /api/energy/iaq-sensors/:id
   */
  getById: (id: string): Promise<IaqSensor> =>
    api.get(`/energy/iaq-sensors/${id}`),

  /**
   * Tạo mới một IAQ Sensor
   * POST /api/energy/iaq-sensors
   */
  create: (payload: CreateIaqSensorPayload): Promise<IaqSensor> =>
    api.post('/energy/iaq-sensors', payload),

  /**
   * Cập nhật thông tin IAQ Sensor
   * PATCH /api/energy/iaq-sensors/:id
   */
  update: (id: string, payload: UpdateIaqSensorPayload): Promise<IaqSensor> =>
    api.patch(`/energy/iaq-sensors/${id}`, payload),

  /**
   * Xóa một IAQ Sensor
   * DELETE /api/energy/iaq-sensors/:id
   */
  delete: (id: string): Promise<DeleteResponse> =>
    api.delete(`/energy/iaq-sensors/${id}`),
}
