import api from '@/lib/http/client'

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: () => api.get('/dashboard/charts'),
}

export const parkingApi = {
  getStatus: () => api.get('/parking/status'),
  getVehicles: () => api.get('/parking/vehicles'),
  getHistory: (params: { page: number; limit: number }) =>
    api.get('/parking/history', { params }),
}

export const deviceApi = {
  /** GET /api/devices/list — List Items */
  getList: (params?: { limit?: number; offset?: number }) =>
    api.get('/devices/list', { params }),
  getDevices: (params?: { status?: string; type?: string }) =>
    api.get('/devices', { params }),
  getDeviceDetail: (id: string) => api.get(`/devices/${id}`),
  restartDevice: (id: string) => api.post(`/devices/${id}/restart`),
}

export const energyApi = {
  getCurrentPower: () => api.get('/energy/current'),
  getConsumption: (params: { startDate: string; endDate: string }) =>
    api.get('/energy/consumption', { params }),
  getComparison: (year: number) => api.get(`/energy/comparison/${year}`),
}
