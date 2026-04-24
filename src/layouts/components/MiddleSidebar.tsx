import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Tag, Typography, theme, Button } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router'
import {
  DownOutlined,
  BuildOutlined,
  AppstoreOutlined,
  HomeOutlined,
  SlidersOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons'
import {
  useTabStore,
  useBuildingStore,
  useHomeNavigationStore,
} from '@/stores'
import type { Tab } from '@/stores'
import { routeToParentKey, routeToLabelKey, HOME_PATH } from '@/routes/routeConfig'
import { accountSidebarConfig } from './menuConfig'
import {
  operationsNavFlow,
  governanceNavFlow,
  buildFlowMenuItems,
  resolveSystemMenuKey,
} from './navSplitMenu'

const { Sider } = Layout
const { Text } = Typography

export const MIDDLE_SIDEBAR_WIDTH = 260

function toSystemPath(path: string): string {
  return resolveSystemMenuKey(path.startsWith('/') ? path : `/${path}`)
}

interface MiddleSidebarProps {
  collapsed: boolean
  leftNavWidth: number
  /** Render bên trong mobile drawer (không fixed) */
  inDrawer?: boolean
  /** Gọi khi ở mobile để đóng drawer sau khi chọn menu/building */
  onCloseDrawer?: () => void
}

export default function MiddleSidebar({ collapsed, leftNavWidth, inDrawer, onCloseDrawer }: MiddleSidebarProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const location = useLocation()

  const { addTab } = useTabStore()
  const { selectedBuilding, setSelectedBuilding, selectBuildingById } = useBuildingStore()
  const navStore = useHomeNavigationStore()

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('menu-flow-open-keys')
    return saved ? JSON.parse(saved) : []
  })

  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false)

  // Auto-expand group cha khi navigate tới trang con
  useEffect(() => {
    const parentKey = routeToParentKey[location.pathname]
    if (parentKey && !openKeys.includes(parentKey)) {
      const next = [...openKeys, parentKey]
      setOpenKeys(next)
      sessionStorage.setItem('menu-flow-open-keys', JSON.stringify(next))
    }
  }, [location.pathname])

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
    sessionStorage.setItem('menu-flow-open-keys', JSON.stringify(keys))
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const labelKey = routeToLabelKey[key]
    if (labelKey) {
      onCloseDrawer?.()
      const tab: Tab = {
        key,
        labelKey,
        closable: key !== '/dashboard' && key !== '/system/dashboard',
      }
      addTab(tab)
      navigate(key)
    }
  }

  // Khi ở trang tài khoản hoặc phân quyền (kể cả customer users): dùng sidebar riêng
  const isAccountSection =
    location.pathname === '/account-settings' ||
    location.pathname === '/user-management' ||
    location.pathname.startsWith('/account-settings/')
  const accountMenuItems: MenuProps['items'] = accountSidebarConfig.map(entry => {
    if ('type' in entry && entry.type === 'item') {
      return {
        key: entry.key,
        icon: entry.icon,
        label: t(entry.labelKey),
      }
    }
    return null
  }).filter(Boolean) as MenuProps['items']

  const operationMenuItems: MenuProps['items'] = buildFlowMenuItems(operationsNavFlow, t, toSystemPath)
  const governanceMenuItems: MenuProps['items'] = buildFlowMenuItems(governanceNavFlow, t, toSystemPath)

  const handleBuildingSelect = (buildingId: string) => {
    onCloseDrawer?.()
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
          onClick={() => { setBuildingDropdownOpen(false); navigate(HOME_PATH.tenant) }}
        >
          {t('menu.viewAll')} →
        </a>
      </div>
    </div>
  )

  const siderStyle: React.CSSProperties = inDrawer
    ? {
        background: token.colorBgContainer,
        borderRight: 'none',
        overflow: 'auto',
        height: '100%',
      }
    : {
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: leftNavWidth,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={inDrawer ? false : collapsed}
      collapsedWidth={0}
      width={MIDDLE_SIDEBAR_WIDTH}
      style={siderStyle}
    >
      {/* Building selector header */}
      <div
        className="building-selector-wrap"
        style={{
          padding: '12px 14px',
          borderBottom: 'none',
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
      {!isAccountSection && (
        <div className="middle-sidebar-nav-block middle-sidebar-nav-block--operations">
          <div className="middle-sidebar-section-title middle-sidebar-section-title--first middle-sidebar-section-title--operations">
            <span className="middle-sidebar-section-title__icon" aria-hidden>
              <SlidersOutlined />
            </span>
            <span className="middle-sidebar-section-title__text">{t('menu.operations', 'Vận hành')}</span>
          </div>
          <Menu
            className="middle-sidebar-menu middle-sidebar-menu--operations"
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            items={operationMenuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', marginTop: 4 }}
          />
        </div>
      )}
      {isAccountSection && (
        <Menu
          className="middle-sidebar-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={accountMenuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', marginTop: 8 }}
        />
      )}
      {!isAccountSection && (
        <div className="middle-sidebar-nav-block middle-sidebar-nav-block--governance">
          <div className="middle-sidebar-section-title middle-sidebar-section-title--governance">
            <span className="middle-sidebar-section-title__icon" aria-hidden>
              <SecurityScanOutlined />
            </span>
            <span className="middle-sidebar-section-title__text">{t('menu.governance', 'Quản trị')}</span>
          </div>
          <Menu
            className="middle-sidebar-menu middle-sidebar-menu--governance"
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            items={governanceMenuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', marginTop: 4 }}
          />
        </div>
      )}

      {/* Khi ở trang tài khoản: nút quay lại bảng điều khiển */}
      {isAccountSection && (
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Button
            type="default"
            block
            icon={<HomeOutlined />}
            onClick={() => {
              onCloseDrawer?.()
              addTab({ key: '/dashboard', labelKey: 'menu.home', closable: false })
              navigate('/dashboard')
            }}
          >
            {t('menu.backToDashboard', 'Quay lại bảng điều khiển')}
          </Button>
        </div>
      )}
    </Sider>
  )
}
