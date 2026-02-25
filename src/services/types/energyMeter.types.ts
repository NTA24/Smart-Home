// ========================
// Energy Meter Types
// ========================

/**
 * Interface cho Energy Meter entity
 * Dựa theo Swagger: campus.iot-platform.io.vn
 */
export interface EnergyMeter {
  id: string
  device_id: string
  meter_type: string // "sub", "main", ...
  phase: string
  unit_default: string // "kwh", ...
  meta: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

/**
 * Payload khi tạo mới Energy Meter
 * Theo Swagger: POST /api/energy/meters
 */
export interface CreateEnergyMeterPayload {
  device_id: string
  meter_type: string
  phase: string
  unit_default: string
  meta?: Record<string, unknown>
}

/**
 * Payload khi cập nhật Energy Meter
 * Theo Swagger: PATCH /api/energy/meters/{id}
 */
export interface UpdateEnergyMeterPayload {
  meter_type?: string
  phase?: string
  unit_default?: string
  meta?: Record<string, unknown>
}

/**
 * Params cho API lấy danh sách Energy Meter
 */
export interface EnergyMeterListParams {
  limit?: number
  offset?: number
  search?: string
  device_id?: string
  meter_type?: string
}
