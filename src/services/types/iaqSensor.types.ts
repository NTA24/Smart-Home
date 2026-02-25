// ========================
// IAQ Sensor Types
// ========================

/**
 * Interface cho IAQ Sensor entity
 * Dựa theo Swagger: campus.iot-platform.io.vn
 */
export interface IaqSensor {
  id: string
  device_id: string
  sensor_type: string // "IAQ", ...
  meta: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

/**
 * Payload khi tạo mới IAQ Sensor
 * Theo Swagger: POST /api/energy/iaq-sensors
 */
export interface CreateIaqSensorPayload {
  device_id: string
  sensor_type: string
  meta?: Record<string, unknown>
}

/**
 * Payload khi cập nhật IAQ Sensor
 * Theo Swagger: PATCH /api/energy/iaq-sensors/{id}
 */
export interface UpdateIaqSensorPayload {
  sensor_type?: string
  meta?: Record<string, unknown>
}

/**
 * Params cho API lấy danh sách IAQ Sensor
 */
export interface IaqSensorListParams {
  limit?: number
  offset?: number
  search?: string
  device_id?: string
  sensor_type?: string
}
