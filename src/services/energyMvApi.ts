import api from '@/lib/http/client'

// ========================
// Energy Materialized Views API
// ========================

/** GET /api/energy/mv/device/day — all required */
export interface MvDeviceDayParams {
  device_id: string
  start_day: string
  end_day: string
}

/** GET /api/energy/mv/building/day — all required */
export interface MvBuildingDayParams {
  building_id: string
  start_day: string
  end_day: string
}

export interface MvDeviceDayResponse {
  device_id: string
  day: string
  kwh: number
  kw_avg: number
  kw_peak: number
}

export interface MvBuildingDayResponse {
  building_id: string
  day: string
  kwh: number
  kw_avg: number
  kw_peak: number
}

export const energyMvApi = {
  /**
   * Refresh Materialized Views
   * POST /api/energy/refresh-mv
   */
  refreshMv: (): Promise<unknown> =>
    api.post('/energy/refresh-mv'),

  /**
   * Mv Energy Device Day
   * GET /api/energy/mv/device/day — params: device_id, start_day, end_day (required)
   */
  getDeviceDay: (params: MvDeviceDayParams): Promise<MvDeviceDayResponse | MvDeviceDayResponse[]> =>
    api.get('/energy/mv/device/day', { params }),

  /**
   * Mv Energy Building Day
   * GET /api/energy/mv/building/day — params: building_id, start_day, end_day (required)
   */
  getBuildingDay: (params: MvBuildingDayParams): Promise<MvBuildingDayResponse | MvBuildingDayResponse[]> =>
    api.get('/energy/mv/building/day', { params }),
}
