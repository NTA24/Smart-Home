import { useCallback } from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { campusApi, buildingApi } from '@/services'
import { HOME_PATH } from '@/routes/routeConfig'
import type { Tenant, Campus, Building } from '@/services'
import { useBuildingStore, useTabStore, useHomeNavigationStore } from '@/stores'
import type { Tab } from '@/stores'

type SetLoading = (v: boolean) => void

/**
 * Điều hướng giữa các bước tenant → campus → building và chọn building vào dashboard.
 */
export function useHomeSelectionFlow(setLoading: SetLoading) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setSelectedBuilding } = useBuildingStore()
  const { addTab } = useTabStore()

  const {
    step,
    setStep,
    setCampuses,
    setBuildings,
    setSelectedTenant: setSelectedTenantState,
    setSelectedCampus: setSelectedCampusState,
  } = useHomeNavigationStore(
    useShallow((s) => ({
      step: s.step,
      setStep: s.setStep,
      setCampuses: s.setCampuses,
      setBuildings: s.setBuildings,
      setSelectedTenant: s.setSelectedTenant,
      setSelectedCampus: s.setSelectedCampus,
    })),
  )

  const handleSelectTenant = useCallback(
    async (tenant: Tenant) => {
      setSelectedTenantState(tenant)
      setStep('campuses')
      navigate(HOME_PATH.campus)
      setCampuses([])
      setBuildings([])
      setSelectedCampusState(null)
      setLoading(true)
      try {
        const res = await campusApi.getListByTenantId(tenant.id)
        const list = Array.isArray(res) ? res : (res?.items ?? [])
        setCampuses(list.map((c) => ({ ...c, status: 'ACTIVE' })))
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    },
    [navigate, setStep, setCampuses, setBuildings, setSelectedCampusState, setSelectedTenantState, setLoading, t],
  )

  const handleSelectCampus = useCallback(
    async (campus: Campus) => {
      setSelectedCampusState(campus)
      setStep('buildings')
      navigate(HOME_PATH.building)
      setBuildings([])
      setLoading(true)
      try {
        const res = await buildingApi.getListByCampusId(campus.id)
        const list = Array.isArray(res) ? res : (res?.items ?? [])
        setBuildings(list.map((b) => ({ ...b, status: 'ACTIVE' })))
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    },
    [navigate, setStep, setBuildings, setSelectedCampusState, setLoading, t],
  )

  const handleSelectBuilding = useCallback(
    (building: Building) => {
      setSelectedBuilding({
        id: building.id,
        name: building.name,
        code: building.code,
        campus_id: building.campus_id,
        building_type: building.building_type,
        status: building.status ?? '',
        created_at: building.created_at,
        updated_at: building.updated_at,
      })
      const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
      addTab(tab)
      navigate('/dashboard')
    },
    [addTab, navigate, setSelectedBuilding],
  )

  const goBack = useCallback(() => {
    if (step === 'buildings') {
      setStep('campuses')
      navigate(HOME_PATH.campus)
      setBuildings([])
      setSelectedCampusState(null)
    } else if (step === 'campuses') {
      setStep('tenants')
      navigate(HOME_PATH.tenant)
      setCampuses([])
      setSelectedTenantState(null)
    }
  }, [
    step,
    navigate,
    setStep,
    setBuildings,
    setCampuses,
    setSelectedCampusState,
    setSelectedTenantState,
  ])

  const navigateToTenantRoot = useCallback(() => {
    setStep('tenants')
    navigate(HOME_PATH.tenant)
    setCampuses([])
    setBuildings([])
    setSelectedTenantState(null)
    setSelectedCampusState(null)
  }, [navigate, setStep, setCampuses, setBuildings, setSelectedTenantState, setSelectedCampusState])

  const navigateToCampusOnly = useCallback(() => {
    setStep('campuses')
    navigate(HOME_PATH.campus)
    setBuildings([])
    setSelectedCampusState(null)
  }, [navigate, setStep, setBuildings, setSelectedCampusState])

  return {
    step,
    handleSelectTenant,
    handleSelectCampus,
    handleSelectBuilding,
    goBack,
    navigateToTenantRoot,
    navigateToCampusOnly,
  }
}

export type HomeSelectionFlow = ReturnType<typeof useHomeSelectionFlow>
