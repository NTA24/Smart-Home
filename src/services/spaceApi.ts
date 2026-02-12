import api from './api'

export interface SpaceItem {
  id?: string
  space_id?: string
  name?: string
  space_type?: string
  floor?: string
  building_id?: string
  campus_id?: string
  tenant_id?: string
  created_at?: string
  updated_at?: string
}

export interface SpaceListResponse {
  items: SpaceItem[]
  total: number
}

export const spaceApi = {
  /** GET /api/spaces/list — List spaces */
  getList: (params?: { limit?: number; offset?: number }): Promise<SpaceListResponse> =>
    api.get('/spaces/list', { params }),
}
