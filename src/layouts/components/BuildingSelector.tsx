import { useState } from 'react'
import { Dropdown, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  TeamOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useHomeNavigationStore, useBuildingStore, useTabStore } from '@/stores'
import type { Tab } from '@/stores'
import { tenantApi, campusApi, buildingApi } from '@/services'

const { Text } = Typography

// Icon tương ứng với từng bước điều hướng
const STEP_CONFIG = {
  tenants: { icon: <TeamOutlined />, labelKey: 'menu.tenantList' },
  campuses: { icon: <EnvironmentOutlined />, labelKey: 'menu.campusList' },
  buildings: { icon: <BankOutlined />, labelKey: 'menu.buildingList' },
} as const

interface BuildingSelectorProps {
  /** Class CSS cho trigger button bên ngoài */
  triggerClassName?: string
  /** Callback sau khi chọn xong building — dùng để đóng dropdown cha (LeftNav) */
  onClose?: () => void
}

export default function BuildingSelector({ triggerClassName, onClose }: BuildingSelectorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const navStore = useHomeNavigationStore()
  const { setSelectedBuilding: setBuildingStoreSelected, selectBuildingById } = useBuildingStore()
  const { addTab } = useTabStore()

  const stepConfig = STEP_CONFIG[navStore.step]

  // Danh sách items hiện tại theo step
  const dropdownItems =
    navStore.step === 'tenants'
      ? navStore.tenants.map(t => ({ id: t.id, name: t.name, status: t.status }))
      : navStore.step === 'campuses'
        ? navStore.campuses.map(c => ({ id: c.id, name: c.name, status: c.status }))
        : navStore.buildings.map(b => ({ id: b.id, name: b.name, status: b.status }))

  const selectedId =
    navStore.step === 'tenants'
      ? navStore.selectedTenant?.id
      : navStore.step === 'campuses'
        ? navStore.selectedCampus?.id
        : useBuildingStore.getState().selectedBuilding?.id

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const handleItemClick = async (id: string) => {
    handleClose()

    if (navStore.step === 'tenants') {
      const tenant = navStore.tenants.find(t => t.id === id)
      if (!tenant) return
      navStore.setSelectedTenant(tenant)
      navStore.setStep('campuses')
      try {
        const res = await tenantApi.getList({ limit: 50, offset: 0 })
        const campuses = await campusApi.getListByTenantId(tenant.id)
        const list = Array.isArray(campuses) ? campuses : (campuses?.items ?? [])
        navStore.setCampuses(list)
        void res // suppress unused
      } catch { /* ignore */ }
      navigate('/home/campus')

    } else if (navStore.step === 'campuses') {
      const campus = navStore.campuses.find(c => c.id === id)
      if (!campus) return
      navStore.setSelectedCampus(campus)
      navStore.setStep('buildings')
      try {
        const res = await buildingApi.getListByCampusId(campus.id)
        const list = Array.isArray(res) ? res : (res?.items ?? [])
        navStore.setBuildings(list)
      } catch { /* ignore */ }
      navigate('/home/building')

    } else {
      // Chọn building → điều hướng vào dashboard
      const building = navStore.buildings.find(b => b.id === id)
      if (!building) return
      setBuildingStoreSelected({
        id: building.id,
        name: building.name,
        code: building.code,
        campus_id: building.campus_id,
        building_type: building.building_type,
        status: building.status ?? '',
        created_at: building.created_at,
        updated_at: building.updated_at,
      })
      selectBuildingById(building.id)

      const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
      addTab(tab)
      navigate('/dashboard')
    }
  }

  const dropdownContent = (
    <div className="nav-dropdown">
      <div className="nav-dropdown_header">
        <Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>
          {t(stepConfig.labelKey)}
        </Text>
      </div>

      <div className="nav-dropdown_list">
        {dropdownItems.length === 0 ? (
          <div className="nav-dropdown_empty">{t('common.noData')}</div>
        ) : (
          dropdownItems.map(item => (
            <div
              key={item.id}
              className={`nav-dropdown_item ${selectedId === item.id ? 'nav-dropdown_item--selected' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="nav-dropdown_dot" />
              <div className="flex-1">
                <div className="nav-dropdown_item-name">{item.name}</div>
              </div>
              {item.status && (
                <Tag
                  color={item.status === 'ACTIVE' ? 'green' : 'red'}
                  className="tag--xs-rounded"
                >
                  {item.status}
                </Tag>
              )}
            </div>
          ))
        )}
      </div>

      <div className="nav-dropdown_footer">
        <a
          className="nav-dropdown_link"
          onClick={() => { handleClose(); navigate('/home/tenant') }}
        >
          {t('menu.viewAll')} →
        </a>
      </div>
    </div>
  )

  return (
    <Dropdown
      trigger={['click']}
      placement="topRight"
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
    >
      <div className={triggerClassName ?? 'left-nav_item'}>
        <div className="left-nav_item-icon">{stepConfig.icon}</div>
        <span className="left-nav_item-label">{t(stepConfig.labelKey)}</span>
      </div>
    </Dropdown>
  )
}
