import { create } from 'zustand'
import type { Tenant, Campus, Building } from '@/services'

export type HomeStep = 'tenants' | 'campuses' | 'buildings'

interface HomeNavigationState {
  step: HomeStep
  tenants: Tenant[]
  campuses: Campus[]
  buildings: Building[]
  selectedTenant: Tenant | null
  selectedCampus: Campus | null

  setStep: (step: HomeStep) => void
  setTenants: (tenants: Tenant[]) => void
  setCampuses: (campuses: Campus[]) => void
  setBuildings: (buildings: Building[]) => void
  setSelectedTenant: (tenant: Tenant | null) => void
  setSelectedCampus: (campus: Campus | null) => void

  /** Reset to initial state */
  reset: () => void
}

export const useHomeNavigationStore = create<HomeNavigationState>()((set) => ({
  step: 'tenants',
  tenants: [],
  campuses: [],
  buildings: [],
  selectedTenant: null,
  selectedCampus: null,

  setStep: (step) => set({ step }),
  setTenants: (tenants) => set({ tenants }),
  setCampuses: (campuses) => set({ campuses }),
  setBuildings: (buildings) => set({ buildings }),
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
  setSelectedCampus: (campus) => set({ selectedCampus: campus }),

  reset: () =>
    set({
      step: 'tenants',
      tenants: [],
      campuses: [],
      buildings: [],
      selectedTenant: null,
      selectedCampus: null,
    }),
}))
