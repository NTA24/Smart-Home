import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Tag, Typography, theme } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
import {
  DownOutlined,
  BuildOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import {
  useTabStore,
  useBuildingStore,
  useUserStore,
  useHomeNavigationStore,
} from '@/stores'
import type { Tab } from '@/stores'
import { routeToParentKey, routeToLabelKey } from '@/routes/routeConfig'
import { menuConfig, ADMIN1_HIDDEN_GROUP_KEYS } from './menuConfig'
import type { MenuGroup } from './menuConfig'

const { Sider } = Layout
const { Text } = Typography

export const MIDDLE_SIDEBAR_WIDTH = 260

interface MiddleSidebarProps {
  collapsed: boolean
  leftNavWidth: number
}

export default function MiddleSidebar({ collapsed, leftNavWidth }: MiddleSidebarProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()

  const { addTab } = useTabStore()
  const { selectedBuilding, setSelectedBuilding, selectBuildingById } = useBuildingStore()
  const { currentUser } = useUserStore()
  const navStore = useHomeNavigationStore()

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('menu-open-keys')
    return saved ? JSON.parse(saved) : ['home']
  })

  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false)

  // Auto-expand group cha khi navigate tới trang con
  useEffect(() => {
    const parentKey = routeToParentKey[location.pathname]
    if (parentKey && !openKeys.includes(parentKey)) {
      const next = [...openKeys, parentKey]
      setOpenKeys(next)
      sessionStorage.setItem('menu-open-keys', JSON.stringify(next))
    }
  }, [location.pathname])

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
    sessionStorage.setItem('menu-open-keys', JSON.stringify(keys))
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const labelKey = routeToLabelKey[key]
    if (labelKey) {
      const tab: Tab = { key, labelKey, closable: key !== '/dashboard' }
      addTab(tab)
      navigate(key)
    }
  }

  // Chuyển menuConfig → Ant Design menu items, có dịch ngôn ngữ
  const visibleConfig = currentUser === 'admin1'
    ? menuConfig.filter(item => !ADMIN1_HIDDEN_GROUP_KEYS.has(item.key))
    : menuConfig

  const menuItems: MenuProps['items'] = visibleConfig.map(entry => {
    if ('type' in entry && entry.type === 'item') {
      const isDashboard = entry.key === '/dashboard'
      return {
        key: entry.key,
        icon: entry.icon,
        label: isDashboard ? (
          <span className="middle-sidebar-menu_dashboard-label">{t(entry.labelKey)}</span>
        ) : (
          t(entry.labelKey)
        ),
      }
    }

    // Group với children
    const group = entry as MenuGroup
    const groupLabel = (
      <span
        onClick={e => {
          e.stopPropagation()
          const currentGroupKey = routeToParentKey[location.pathname]
          if (currentGroupKey !== group.key) navigate(group.defaultRoute)
        }}
      >
        {t(group.labelKey)}
      </span>
    )

    return {
      key: group.key,
      icon: group.icon,
      label: groupLabel,
      children: group.children.map(child => ({
        key: child.key,
        label: t(child.labelKey),
        disabled: child.disabled,
      })),
    }
  })

  const handleBuildingSelect = (buildingId: string) => {
    const sid = String(buildingId ?? '')
    const building = navStore.buildings.find(b => String(b?.id ?? '') === sid)
    if (building) {
      setSelectedBuilding({
        id: String(building.id ?? sid),
        name: String(building.name ?? ''),
        code: building.code != null ? String(building.code) : undefined,
        campus_id: building.campus_id != null ? String(building.campus_id) : undefined,
        building_type: building.building_type != null ? String(building.building_type) : undefined,
        status: building.status != null ? String(building.status) : '',
        created_at: building.created_at,
        updated_at: building.updated_at,
      })
      selectBuildingById(String(building.id ?? sid))
    }
    setBuildingDropdownOpen(false)
    const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
    addTab(tab)
    navigate('/dashboard')
  }

  // Building dropdown content
  const buildingDropdownContent = (
    <div className="mid-dropdown">
      <div className="mid-dropdown_header">
        <Text strong>{t('menu.buildingList')}</Text>
      </div>
      <div className="mid-dropdown_list">
        {navStore.buildings.length === 0 ? (
          <div className="mid-dropdown_empty">{t('common.noData')}</div>
        ) : (
          navStore.buildings.map(b => {
            const bid = String(b?.id ?? '')
            const bname = String(b?.name ?? '')
            const selId = selectedBuilding?.id != null ? String(selectedBuilding.id) : undefined
            return (
              <div
                key={bid}
                className={`mid-dropdown_item ${selId === bid ? 'mid-dropdown_item--selected' : ''}`}
                onClick={() => handleBuildingSelect(bid)}
              >
                <div className="mid-dropdown_dot" />
                <div className="mid-dropdown_item-name">{bname}</div>
                {selId === bid && (
                  <Tag color="blue" className="tag--no-margin tag--sm">{t('common.selected')}</Tag>
                )}
              </div>
            )
          })
        )}
      </div>
      <div className="mid-dropdown_footer">
        <a
          className="mid-dropdown_link"
          onClick={() => { setBuildingDropdownOpen(false); navigate('/home/tenant') }}
        >
          {t('menu.viewAll')} →
        </a>
      </div>
    </div>
  )

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={0}
      width={MIDDLE_SIDEBAR_WIDTH}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: leftNavWidth,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Building selector header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <Dropdown
          trigger={['click']}
          open={buildingDropdownOpen}
          onOpenChange={setBuildingDropdownOpen}
          popupRender={() => buildingDropdownContent}
        >
          <div className="building-selector">
            <div className="flex-between">
              <div className="flex items-center gap-8">
                <div className="building-selector_avatar">VT</div>
                <div>
                  <div className="building-selector_name">
                    {selectedBuilding?.name || t('menu.selectBuilding', 'Chọn tòa nhà')}
                  </div>
                  <div className="flex items-center gap-6" style={{ marginTop: 2 }}>
                    <Tag color="green" className="tag--no-margin tag--sm">{t('menu.active')}</Tag>
                    <Tag color="orange" className="tag--no-margin tag--sm">DEMO</Tag>
                  </div>
                </div>
              </div>
              <DownOutlined style={{ fontSize: 12 }} />
            </div>

            {/* Building meta info */}
            <div className="building-selector_meta">
              {selectedBuilding?.code && (
                <div className="building-selector_meta-item">
                  <BuildOutlined />
                  <span>{selectedBuilding.code}</span>
                </div>
              )}
              {selectedBuilding?.building_type && (
                <div className="building-selector_meta-item">
                  <AppstoreOutlined />
                  <span>{selectedBuilding.building_type}</span>
                </div>
              )}
              {selectedBuilding?.status && (
                <Tag
                  color={selectedBuilding.status === 'ACTIVE' ? 'green' : 'red'}
                  style={{ margin: 0, fontSize: 10, borderRadius: 4 }}
                >
                  {selectedBuilding.status}
                </Tag>
              )}
            </div>
          </div>
        </Dropdown>
      </div>

      {/* Navigation menu */}
      <Menu
        className="middle-sidebar-menu"
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={handleOpenChange}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', marginTop: 8 }}
      />
    </Sider>
  )
}
