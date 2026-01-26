import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Example API functions
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
