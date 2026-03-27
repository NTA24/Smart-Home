import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import type { Tenant, Campus, Building } from '@/services'

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted runs before vi.mock factory hoisting
// ---------------------------------------------------------------------------

const { mockNavigate, mockMessageError } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockMessageError: vi.fn(),
}))

vi.mock('react-router', () => ({ useNavigate: () => mockNavigate }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

vi.mock('antd', () => ({ message: { error: mockMessageError } }))

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>()
  return {
    ...actual,
    campusApi: { getListByTenantId: vi.fn() },
    buildingApi: { getListByCampusId: vi.fn() },
  }
})

import { campusApi, buildingApi } from '@/services'
import { useHomeNavigationStore } from '@/stores/useHomeNavigationStore'
import { useBuildingStore } from '@/stores/useBuildingStore'
import { useTabStore } from '@/stores/useTabStore'
import { useHomeSelectionFlow } from './useHomeSelectionFlow'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tenant: Tenant = { id: 't1', name: 'Tenant 1', status: 'ACTIVE', created_at: '2024-01-01' }
const campus: Campus = { id: 'c1', tenant_id: 't1', name: 'Campus 1', status: 'ACTIVE', created_at: '2024-01-01' }
const building: Building = {
  id: 'b1', campus_id: 'c1', code: 'B1', name: 'Building 1', status: 'ACTIVE',
  created_at: '2024-01-01',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderFlow() {
  const setLoading = vi.fn()
  const hook = renderHook(() => useHomeSelectionFlow(setLoading))
  return { hook, setLoading }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  useHomeNavigationStore.getState().reset()
  useBuildingStore.setState({ selectedBuilding: null })
  useTabStore.setState({ tabs: [{ key: '/dashboard', labelKey: 'menu.dashboard', closable: false }], activeKey: '/dashboard' })
})

describe('useHomeSelectionFlow', () => {
  describe('handleSelectTenant', () => {
    it('fetches campuses, navigates, and updates store on success', async () => {
      const apiCampuses = [{ ...campus, status: undefined as unknown as string }]
      vi.mocked(campusApi.getListByTenantId).mockResolvedValueOnce({ items: apiCampuses, total: 1 })

      const { hook, setLoading } = renderFlow()

      await act(() => hook.result.current.handleSelectTenant(tenant))

      expect(campusApi.getListByTenantId).toHaveBeenCalledWith('t1')
      expect(mockNavigate).toHaveBeenCalledWith('/home/campus')
      expect(setLoading).toHaveBeenCalledWith(true)
      expect(setLoading).toHaveBeenCalledWith(false)

      const state = useHomeNavigationStore.getState()
      expect(state.step).toBe('campuses')
      expect(state.selectedTenant).toEqual(tenant)
      expect(state.campuses).toHaveLength(1)
    })

    it('shows error message and stops loading on API failure', async () => {
      vi.mocked(campusApi.getListByTenantId).mockRejectedValueOnce(new Error('Network Error'))

      const { hook, setLoading } = renderFlow()

      await act(() => hook.result.current.handleSelectTenant(tenant))

      expect(mockMessageError).toHaveBeenCalledWith(expect.stringContaining('Network Error'))
      expect(setLoading).toHaveBeenLastCalledWith(false)
    })
  })

  describe('handleSelectCampus', () => {
    it('fetches buildings, navigates, and updates store on success', async () => {
      vi.mocked(buildingApi.getListByCampusId).mockResolvedValueOnce({ items: [building], total: 1 })

      const { hook, setLoading } = renderFlow()

      await act(() => hook.result.current.handleSelectCampus(campus))

      expect(buildingApi.getListByCampusId).toHaveBeenCalledWith('c1')
      expect(mockNavigate).toHaveBeenCalledWith('/home/building')
      expect(setLoading).toHaveBeenCalledWith(true)
      expect(setLoading).toHaveBeenCalledWith(false)

      const state = useHomeNavigationStore.getState()
      expect(state.step).toBe('buildings')
      expect(state.selectedCampus).toEqual(campus)
      expect(state.buildings).toHaveLength(1)
    })

    it('shows error message on API failure', async () => {
      vi.mocked(buildingApi.getListByCampusId).mockRejectedValueOnce(new Error('500'))

      const { hook } = renderFlow()

      await act(() => hook.result.current.handleSelectCampus(campus))

      expect(mockMessageError).toHaveBeenCalledWith(expect.stringContaining('500'))
    })
  })

  describe('handleSelectBuilding', () => {
    it('sets building in global store and navigates to dashboard', () => {
      const { hook } = renderFlow()

      act(() => hook.result.current.handleSelectBuilding(building))

      expect(useBuildingStore.getState().selectedBuilding).toMatchObject({ id: 'b1', name: 'Building 1' })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('adds dashboard tab', () => {
      const { hook } = renderFlow()

      act(() => hook.result.current.handleSelectBuilding(building))

      const tabs = useTabStore.getState().tabs
      expect(tabs.find(t => t.key === '/dashboard')).toBeDefined()
    })
  })

  describe('goBack', () => {
    it('goes from buildings to campuses', async () => {
      useHomeNavigationStore.setState({ step: 'buildings' })

      const { hook } = renderFlow()

      act(() => hook.result.current.goBack())

      expect(useHomeNavigationStore.getState().step).toBe('campuses')
      expect(mockNavigate).toHaveBeenCalledWith('/home/campus')
    })

    it('goes from campuses to tenants', () => {
      useHomeNavigationStore.setState({ step: 'campuses' })

      const { hook } = renderFlow()

      act(() => hook.result.current.goBack())

      expect(useHomeNavigationStore.getState().step).toBe('tenants')
      expect(mockNavigate).toHaveBeenCalledWith('/home/tenant')
    })

    it('does nothing when already at tenants step', () => {
      useHomeNavigationStore.setState({ step: 'tenants' })

      const { hook } = renderFlow()

      act(() => hook.result.current.goBack())

      expect(useHomeNavigationStore.getState().step).toBe('tenants')
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('navigateToTenantRoot', () => {
    it('resets to tenant step and clears selections', () => {
      useHomeNavigationStore.setState({
        step: 'buildings',
        campuses: [campus],
        buildings: [building],
        selectedTenant: tenant,
        selectedCampus: campus,
      })

      const { hook } = renderFlow()

      act(() => hook.result.current.navigateToTenantRoot())

      const state = useHomeNavigationStore.getState()
      expect(state.step).toBe('tenants')
      expect(state.campuses).toEqual([])
      expect(state.buildings).toEqual([])
      expect(state.selectedTenant).toBeNull()
      expect(state.selectedCampus).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/home/tenant')
    })
  })
})
