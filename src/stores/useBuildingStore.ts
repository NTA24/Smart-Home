import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildingApi } from '@/services'
import type { Building as ApiBuilding } from '@/services'

export interface Building {
  id: string
  name: string
  code?: string
  campus_id?: string
  building_type?: string
  status: string
  created_at?: string
  updated_at?: string
}

/**
 * Convert API Building to store Building
 */
function toStoreBuilding(b: ApiBuilding): Building {
  return {
    id: b.id,
    name: b.name,
    code: b.code,
    campus_id: b.campus_id,
    building_type: b.building_type,
    status: b.status,
    created_at: b.created_at,
    updated_at: b.updated_at,
  }
}

interface BuildingState {
  selectedBuilding: Building | null
  buildings: Building[]
  loading: boolean
  setSelectedBuilding: (building: Building) => void
  setBuildings: (buildings: Building[]) => void
  selectBuildingById: (id: string) => void
  fetchBuildings: () => Promise<void>
}

export const useBuildingStore = create<BuildingState>()(
  persist(
    (set, get) => ({
      selectedBuilding: null,
      buildings: [],
      loading: false,
      
      setSelectedBuilding: (building) => {
        set({ selectedBuilding: building })
      },

      setBuildings: (buildings) => {
        set({ buildings })
      },
      
      selectBuildingById: (id) => {
        const building = get().buildings.find(b => b.id === id)
        if (building) {
          set({ selectedBuilding: building })
        }
      },

      fetchBuildings: async () => {
        set({ loading: true })
        try {
          const res = await buildingApi.getList({ limit: 100, offset: 0 })
          const buildings = (res?.items || []).map(toStoreBuilding)
          set({ buildings, loading: false })
        } catch {
          set({ loading: false })
        }
      },
    }),
    {
      name: 'building-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
      partialize: (state) => ({
        selectedBuilding: state.selectedBuilding,
      }),
    }
  )
)
