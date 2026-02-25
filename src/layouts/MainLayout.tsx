import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Dropdown, Badge, Select, Typography, Tag } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  GlobalOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined as WebOutlined,
  TeamOutlined,
  BankOutlined,
  DownOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
  CarOutlined,
  InboxOutlined,
  RobotOutlined,
  AppstoreOutlined,
  LaptopOutlined,
} from '@ant-design/icons'
import { useTabStore, routeToLabelKey, useBuildingStore, useHomeNavigationStore } from '@/stores'
import type { Tab } from '@/stores'
import { tenantApi, campusApi, buildingApi } from '@/services'
import viettelLogo from '@/assets/viettel-logo.png'
import newgenLogo from '@/assets/newgen-logo.png'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = sessionStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })
  const routeToParentKey: Record<string, string> = {
    '/security-monitoring': 'security-camera', '/camera-live': 'security-camera', '/camera-playback': 'security-camera', '/camera-config': 'security-camera',
    '/parking': 'vehicle-control', '/vehicle-access-control': 'vehicle-control', '/live-entrance': 'vehicle-control', '/live-exit': 'vehicle-control', '/parking-map': 'vehicle-control', '/parking-tickets': 'vehicle-control', '/parking-subscription': 'vehicle-control', '/parking-devices': 'vehicle-control', '/vehicle-config': 'vehicle-control',
    '/personnel-management': 'people-control', '/visitor-distribution': 'people-control',
    '/item-control': 'item-control', '/locker-map': 'item-control',
    '/alarm-statistics': 'energy-management', '/energy-monitoring': 'energy-management', '/energy-data-center': 'energy-management', '/energy-meters': 'energy-management', '/hvac-assets': 'energy-management', '/iaq-sensors': 'energy-management', '/energy-aggregates': 'energy-management', '/energy-telemetry': 'remote-monitoring', '/iaq-telemetry': 'remote-monitoring', '/hvac-telemetry': 'remote-monitoring',
    '/robot-dashboard': 'robot-management', '/robot-live-fleet': 'robot-management', '/robot-detail': 'robot-management', '/robot-create-mission': 'robot-management', '/robot-alerts': 'robot-management', '/robot-maintenance': 'robot-management',
    '/smart-workspace/dashboard': 'smart-workspace', '/smart-workspace/workspace': 'smart-workspace', '/smart-workspace/room-detail': 'smart-workspace', '/smart-workspace/booking-calendar': 'smart-workspace', '/smart-workspace/create-booking': 'smart-workspace', '/smart-workspace/kiosk': 'smart-workspace', '/smart-workspace/report-issue': 'smart-workspace', '/smart-workspace/issue-tickets': 'smart-workspace',
    '/smart-meeting-room/meeting-room': 'smart-meeting-room', '/smart-meeting-room/dashboard': 'smart-meeting-room', '/smart-meeting-room/room-detail': 'smart-meeting-room', '/smart-meeting-room/booking-calendar': 'smart-meeting-room', '/smart-meeting-room/create-booking': 'smart-meeting-room', '/smart-meeting-room/kiosk': 'smart-meeting-room', '/smart-meeting-room/report-issue': 'smart-meeting-room', '/smart-meeting-room/issue-tickets': 'smart-meeting-room',
  }
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('menu-open-keys')
    if (saved) return JSON.parse(saved)
    return ['home']
  })

  const [useNewgenLogo, setUseNewgenLogo] = useState(() => {
    const saved = sessionStorage.getItem('use-newgen-logo')
    return saved ? JSON.parse(saved) : false
  })

  const currentLogo = useNewgenLogo ? newgenLogo : viettelLogo
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const { addTab } = useTabStore()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const parentKey = routeToParentKey[location.pathname]
    if (parentKey && !openKeys.includes(parentKey)) {
      const newKeys = [...openKeys, parentKey]
      setOpenKeys(newKeys)
      sessionStorage.setItem('menu-open-keys', JSON.stringify(newKeys))
    }
  }, [location.pathname])

  const { selectedBuilding, selectBuildingById, setSelectedBuilding: setBuildingStoreSelected } = useBuildingStore()
  const navStore = useHomeNavigationStore()

  useEffect(() => {
    if (navStore.tenants.length === 0) {
      tenantApi.getList({ limit: 50, offset: 0 }).then(res => {
        navStore.setTenants(res?.items || [])
      }).catch(() => {})
    }
  }, [])

  const isHomePage = location.pathname === '/home'
  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false)
  const [middleDropdownOpen, setMiddleDropdownOpen] = useState(false)
  const activeLeftNav = isHomePage ? 'home' : 'nav-list'

  const navListConfig = {
    tenants: { icon: <TeamOutlined />, label: t('menu.tenantList') },
    campuses: { icon: <EnvironmentOutlined />, label: t('menu.campusList') },
    buildings: { icon: <BankOutlined />, label: t('menu.buildingList') },
  }
  const currentNavConfig = navListConfig[navStore.step]

  const leftNavItems = [
    { key: 'home', icon: <HomeOutlined />, label: t('menu.home') },
    { key: 'nav-list', icon: currentNavConfig.icon, label: currentNavConfig.label, hasDropdown: true },
  ]

  const currentGroupKey = routeToParentKey[location.pathname] || ''

  const groupLabel = (groupKey: string, defaultRoute: string, text: string) => (
    <span onClick={(e) => {
      e.stopPropagation()
      if (currentGroupKey !== groupKey) navigate(defaultRoute)
    }}>{text}</span>
  )

  type MenuChild = { key: string; label: React.ReactNode; children?: MenuChild[]; disabled?: boolean }
  const menuConfig: { key: string; icon: React.ReactNode; label: React.ReactNode; children?: MenuChild[]; disabled?: boolean }[] = [
    { key: '/dashboard', icon: <HomeOutlined />, label: t('menu.home') },
    {
      key: 'security-camera', icon: <VideoCameraOutlined />,
      label: groupLabel('security-camera', '/security-monitoring', t('menu.securityCamera')),
      children: [
        { key: '/security-monitoring', label: t('menu.securityCenter') },
        { key: '/camera-live', label: t('menu.cameraLive') },
        { key: '/camera-playback', label: t('menu.cameraPlayback') },
        { key: '/camera-config', label: t('menu.cameraConfig', 'Cấu hình') },
      ],
    },
    {
      key: 'vehicle-control', icon: <CarOutlined />,
      label: groupLabel('vehicle-control', '/parking', t('menu.vehicleControl')),
      children: [
        { key: '/parking', label: t('menu.parkingList') },
        { key: '/vehicle-access-control', label: t('menu.vehicleAccessControl', 'Kiểm soát phương tiện ra vào') },
        { key: '/parking-map', label: t('menu.parkingMap') },
        { key: '/parking-tickets', label: t('menu.parkingTickets') },
        { key: '/parking-subscription', label: t('menu.parkingSubscription') },
        { key: '/parking-devices', label: t('menu.parkingDevices') },
        { key: '/vehicle-config', label: t('menu.vehicleConfig', 'Cấu hình') },
      ],
    },
    {
      key: 'people-control', icon: <TeamOutlined />,
      label: groupLabel('people-control', '/personnel-management', t('menu.peopleControl')),
      children: [
        { key: '/personnel-management', label: t('menu.personnelManagement') },
        { key: '/visitor-distribution', label: t('menu.visitorDistribution') },
      ],
    },
    {
      key: 'item-control', icon: <InboxOutlined />,
      label: groupLabel('item-control', '/item-control', t('menu.itemControl')),
      children: [
        { key: '/item-control', label: t('menu.itemControlDashboard') },
        { key: '/locker-map', label: t('menu.lockerMap') },
      ],
    },
    {
      key: 'energy-management', icon: <ThunderboltOutlined />,
      label: groupLabel('energy-management', '/energy-meters', t('menu.energyManagement')),
      children: [
        { key: '/alarm-statistics', label: t('menu.alarmStatistics') },
        { key: '/energy-monitoring', label: t('menu.energyMonitoring') },
        { key: '/energy-data-center', label: t('menu.energyDataCenter') },
        { key: '/energy-meters', label: t('menu.energyMeters') },
        { key: '/hvac-assets', label: t('menu.hvacAssets') },
        { key: '/iaq-sensors', label: t('menu.iaqSensors') },
        { key: '/energy-aggregates', label: t('menu.energyAggregates') },
      ],
    },
    {
      key: 'remote-monitoring',
      icon: <ThunderboltOutlined />,
      label: groupLabel('remote-monitoring', '/energy-telemetry', t('menu.remoteMonitoring')),
      children: [
        { key: '/energy-telemetry', label: t('menu.energyTelemetry') },
        { key: '/iaq-telemetry', label: t('menu.iaqTelemetry') },
        { key: '/hvac-telemetry', label: t('menu.hvacTelemetry') },
      ],
    },
    {
      key: 'robot-management', icon: <RobotOutlined />,
      label: groupLabel('robot-management', '/robot-dashboard', t('menu.robotManagement')),
      children: [
        { key: '/robot-dashboard', label: t('menu.robotDashboard') },
        { key: '/robot-live-fleet', label: t('menu.robotLiveFleet') },
        { key: '/robot-detail', label: t('menu.robotDetail') },
        { key: '/robot-create-mission', label: t('menu.robotCreateMission') },
        { key: '/robot-alerts', label: t('menu.robotAlerts') },
        { key: '/robot-maintenance', label: t('menu.robotMaintenance') },
      ],
    },
    {
      key: 'smart-workspace', icon: <LaptopOutlined />,
      label: groupLabel('smart-workspace', '/smart-workspace/dashboard', t('menu.smartWorkspace')),
      children: [
        { key: '/smart-workspace/dashboard', label: t('menu.dashboard') },
        { key: '/smart-workspace/workspace', label: t('menu.workspaceRoomList') },
        { key: '/smart-workspace/room-detail', label: t('menu.roomDetail') },
        { key: '/smart-workspace/booking-calendar', label: t('menu.bookingCalendar') },
        { key: '/smart-workspace/create-booking', label: t('menu.createBooking') },
        { key: '/smart-workspace/kiosk', label: t('menu.kiosk') },
        { key: '/smart-workspace/report-issue', label: t('menu.reportIssue') },
        { key: '/smart-workspace/issue-tickets', label: t('menu.issueTickets', 'Issue Tickets') },
      ],
    },
    {
      key: 'smart-meeting-room', icon: <TeamOutlined />,
      label: groupLabel('smart-meeting-room', '/smart-meeting-room/dashboard', t('menu.smartMeetingRoom')),
      children: [
        { key: '/smart-meeting-room/dashboard', label: t('menu.dashboard') },
        { key: '/smart-meeting-room/meeting-room', label: t('menu.meetingRoomList') },
        { key: '/smart-meeting-room/room-detail', label: t('menu.roomDetail') },
        { key: '/smart-meeting-room/booking-calendar', label: t('menu.bookingCalendar') },
        { key: '/smart-meeting-room/create-booking', label: t('menu.createBooking') },
        { key: '/smart-meeting-room/kiosk', label: t('menu.kiosk') },
        { key: '/smart-meeting-room/report-issue', label: t('menu.reportIssue') },
        { key: '/smart-meeting-room/issue-tickets', label: t('menu.issueTickets', 'Issue Tickets') },
      ],
    },
    {
      key: 'elevator-management',
      icon: <AppstoreOutlined />,
      label: groupLabel('elevator-management', '/elevator-dashboard', t('menu.elevatorManagement')),
      children: [
        { key: '/elevator-dashboard', label: t('menu.elevatorDashboard') },
        { key: '/elevator-live', label: t('menu.elevatorLive') },
        { key: '/elevator-detail', label: t('menu.elevatorDetail') },
        { key: '/elevator-alarms', label: t('menu.elevatorAlarms') },
        { key: '/elevator-access', label: t('menu.elevatorAccess') },
        { key: '/elevator-maintenance', label: t('menu.elevatorMaintenance') },
        { key: '/elevator-by-area', label: t('menu.elevatorByArea') },
      ],
    },
  ]

  const mapChildren = (children: MenuChild[]): MenuProps['items'] =>
    children.map((child) =>
      child.children
        ? { key: child.key, label: child.label, children: mapChildren(child.children), disabled: child.disabled }
        : { key: child.key, label: child.label, disabled: child.disabled }
    )
  const menuItems: MenuProps['items'] = menuConfig.map((item) => ({
    key: item.key, icon: item.icon, label: item.label, disabled: item.disabled,
    children: item.children ? mapChildren(item.children) : undefined,
  }))

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('header.profile') },
    { key: 'settings', icon: <SettingOutlined />, label: t('header.settings') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout') },
  ]

  const handleLeftNavClick = (key: string) => {
    if (key === 'home') {
      navStore.setStep('tenants')
      navStore.setCampuses([])
      navStore.setBuildings([])
      navStore.setSelectedTenant(null)
      navStore.setSelectedCampus(null)
      navigate('/home')
    }
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const labelKey = routeToLabelKey[key]
    if (labelKey) {
      const tab: Tab = { key, labelKey, closable: key !== '/dashboard' }
      addTab(tab)
      navigate(key)
    }
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
    sessionStorage.setItem('menu-open-keys', JSON.stringify(keys))
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const toggleLogo = () => {
    const next = !useNewgenLogo
    setUseNewgenLogo(next)
    sessionStorage.setItem('use-newgen-logo', JSON.stringify(next))
  }

  const handleDropdownItemClick = async (id: string) => {
    setBuildingDropdownOpen(false)
    setMiddleDropdownOpen(false)

    if (navStore.step === 'tenants') {
      const tenant = navStore.tenants.find(t => t.id === id)
      if (tenant) {
        navStore.setSelectedTenant(tenant)
        navStore.setStep('campuses')
        try {
          const res = await campusApi.getList({ limit: 50, offset: 0 })
          navStore.setCampuses(res?.items || [])
        } catch { /* ignore */ }
      }
      navigate('/home')
    } else if (navStore.step === 'campuses') {
      const campus = navStore.campuses.find(c => c.id === id)
      if (campus) {
        navStore.setSelectedCampus(campus)
        navStore.setStep('buildings')
        try {
          const res = await buildingApi.getList({ limit: 50, offset: 0 })
          navStore.setBuildings(res?.items || [])
        } catch { /* ignore */ }
      }
      navigate('/home')
    } else {
      const building = navStore.buildings.find(b => b.id === id)
      if (building) {
        setBuildingStoreSelected({
          id: building.id, name: building.name, code: building.code,
          campus_id: building.campus_id, building_type: building.building_type,
          status: building.status, created_at: building.created_at, updated_at: building.updated_at,
        })
        selectBuildingById(building.id)
      }
      const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
      addTab(tab)
      navigate('/dashboard')
    }
  }

  const handleBuildingChange = (buildingId: string) => {
    const building = navStore.buildings.find(b => b.id === buildingId)
    if (building) {
      setBuildingStoreSelected({
        id: building.id, name: building.name, code: building.code,
        campus_id: building.campus_id, building_type: building.building_type,
        status: building.status, created_at: building.created_at, updated_at: building.updated_at,
      })
    }
    setBuildingDropdownOpen(false)
    setMiddleDropdownOpen(false)
    const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
    addTab(tab)
    navigate('/dashboard')
  }

  const leftNavWidth = 160
  const middleSiderWidth = isHomePage ? 0 : (collapsed ? 0 : 260)
  const totalLeftMargin = leftNavWidth + middleSiderWidth

  // Dropdown items for the current navigation step
  const dropdownItems = navStore.step === 'tenants'
    ? navStore.tenants.map(t => ({ id: t.id, name: t.name, status: t.status }))
    : navStore.step === 'campuses'
      ? navStore.campuses.map(c => ({ id: c.id, name: c.name, status: c.status }))
      : navStore.buildings.map(b => ({ id: b.id, name: b.name, status: b.status }))

  const selectedItemId = navStore.step === 'tenants'
    ? navStore.selectedTenant?.id
    : navStore.step === 'campuses'
      ? navStore.selectedCampus?.id
      : selectedBuilding?.id

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Left Navbar ── */}
      <div className="left-nav" style={{ width: leftNavWidth }}>
        <div className="left-nav_logo" onClick={toggleLogo} title="Click to switch logo">
          <img src={currentLogo} alt={useNewgenLogo ? 'Newgen Logo' : 'Viettel Logo'} />
        </div>

        <div className="left-nav_items">
          {leftNavItems.map((item) => {
            const isActive = activeLeftNav === item.key
            const hasDropdown = (item as { hasDropdown?: boolean }).hasDropdown

            if (hasDropdown) {
              return (
                <Dropdown
                  key={item.key}
                  trigger={['click']}
                  placement="topRight"
                  open={buildingDropdownOpen}
                  onOpenChange={setBuildingDropdownOpen}
                  dropdownRender={() => (
                    <div className="nav-dropdown">
                      <div className="nav-dropdown_header">
                        <Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>{currentNavConfig.label}</Text>
                      </div>
                      <div className="nav-dropdown_list">
                        {dropdownItems.length === 0 ? (
                          <div className="nav-dropdown_empty">{t('common.noData')}</div>
                        ) : dropdownItems.map(di => {
                          const isSelected = selectedItemId === di.id
                          return (
                            <div
                              key={di.id}
                              className={`nav-dropdown_item ${isSelected ? 'nav-dropdown_item--selected' : ''}`}
                              onClick={() => handleDropdownItemClick(di.id)}
                            >
                              <div className="nav-dropdown_dot" />
                              <div className="flex-1">
                                <div className="nav-dropdown_item-name">{di.name}</div>
                              </div>
                              {di.status && (
                                <Tag color={di.status === 'ACTIVE' ? 'green' : 'red'} className="tag--xs-rounded">
                                  {di.status}
                                </Tag>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="nav-dropdown_footer">
                        <a className="nav-dropdown_link" onClick={() => { setBuildingDropdownOpen(false); navigate('/home') }}>
                          {t('menu.viewAll')} →
                        </a>
                      </div>
                    </div>
                  )}
                >
                  <div className="left-nav_item">
                    <div className="left-nav_item-icon">{item.icon}</div>
                    <span className="left-nav_item-label">{item.label}</span>
                  </div>
                </Dropdown>
              )
            }

            return (
              <div
                key={item.key}
                className={`left-nav_item ${isActive ? 'left-nav_item--active' : ''}`}
                onClick={() => handleLeftNavClick(item.key)}
              >
                <div className="left-nav_item-icon">{item.icon}</div>
                <span className="left-nav_item-label">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Middle Sidebar ── */}
      {!isHomePage && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={0}
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
          width={260}
        >
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer }}>
            <Dropdown
              trigger={['click']}
              open={middleDropdownOpen}
              onOpenChange={setMiddleDropdownOpen}
              dropdownRender={() => (
                <div className="mid-dropdown">
                  <div className="mid-dropdown_header">
                    <Text strong>{t('menu.buildingList')}</Text>
                  </div>
                  <div className="mid-dropdown_list">
                    {navStore.buildings.length === 0 ? (
                      <div className="mid-dropdown_empty">{t('common.noData')}</div>
                    ) : navStore.buildings.map(b => {
                      const isSelected = selectedBuilding?.id === b.id
                      return (
                        <div
                          key={b.id}
                          className={`mid-dropdown_item ${isSelected ? 'mid-dropdown_item--selected' : ''}`}
                          onClick={() => handleBuildingChange(b.id)}
                        >
                          <div className="mid-dropdown_dot" />
                          <div className="mid-dropdown_item-name">{b.name}</div>
                          {isSelected && (
                            <Tag color="blue" className="tag--no-margin tag--sm">{t('common.selected')}</Tag>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mid-dropdown_footer">
                    <a className="mid-dropdown_link" onClick={() => { setMiddleDropdownOpen(false); navigate('/home') }}>
                      {t('menu.viewAll')} →
                    </a>
                  </div>
                </div>
              )}
            >
              <div className="building-selector">
                <div className="flex-between">
                  <div className="flex items-center gap-8">
                    <div className="building-selector_avatar">VT</div>
                    <div>
                      <div className="building-selector_name">{selectedBuilding?.name || 'Chọn tòa nhà'}</div>
                      <div className="flex items-center gap-6" style={{ marginTop: 2 }}>
                        <Tag color="green" className="tag--no-margin tag--sm">{t('menu.active')}</Tag>
                        <Tag color="orange" className="tag--no-margin tag--sm">DEMO</Tag>
                      </div>
                    </div>
                  </div>
                  <DownOutlined style={{ fontSize: 12 }} />
                </div>
                <div className="building-selector_meta">
                  {selectedBuilding?.code && (
                    <div className="building-selector_meta-item"><BuildOutlined /><span>{selectedBuilding.code}</span></div>
                  )}
                  {selectedBuilding?.building_type && (
                    <div className="building-selector_meta-item"><AppstoreOutlined /><span>{selectedBuilding.building_type}</span></div>
                  )}
                  {selectedBuilding?.status && (
                    <Tag color={selectedBuilding.status === 'ACTIVE' ? 'green' : 'red'} style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>
                      {selectedBuilding.status}
                    </Tag>
                  )}
                </div>
              </div>
            </Dropdown>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', marginTop: 8 }}
          />
        </Sider>
      )}

      {/* ── Main Content Area ── */}
      <Layout style={{ marginLeft: totalLeftMargin, transition: 'margin-left 0.2s' }}>
        <Header
          className="main-header"
          style={{ background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <div className="main-header_left">
            {!isHomePage && (
              collapsed ? (
                <MenuUnfoldOutlined
                  className="main-header_toggle"
                  onClick={() => { setCollapsed(false); sessionStorage.setItem('sidebar-collapsed', 'false') }}
                />
              ) : (
                <MenuFoldOutlined
                  className="main-header_toggle"
                  onClick={() => { setCollapsed(true); sessionStorage.setItem('sidebar-collapsed', 'true') }}
                />
              )
            )}
            {!isHomePage && (navStore.selectedTenant || selectedBuilding) && (
              <div className="breadcrumb">
                {navStore.selectedTenant && (
                  <span
                    className="breadcrumb_link"
                    style={{ color: token.colorTextSecondary }}
                    onClick={() => { navStore.reset(); navigate('/home') }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = token.colorPrimary }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = token.colorTextSecondary }}
                  >
                    <TeamOutlined className="breadcrumb_icon" />
                    {navStore.selectedTenant.name}
                  </span>
                )}
                {navStore.selectedCampus && (
                  <>
                    <span className="breadcrumb_sep" style={{ color: token.colorTextQuaternary }}>/</span>
                    <span
                      className="breadcrumb_link"
                      style={{ color: token.colorTextSecondary }}
                      onClick={() => { navStore.setStep('campuses'); navigate('/home') }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = token.colorPrimary }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = token.colorTextSecondary }}
                    >
                      <EnvironmentOutlined className="breadcrumb_icon" />
                      {navStore.selectedCampus.name}
                    </span>
                  </>
                )}
                {selectedBuilding && (
                  <>
                    <span className="breadcrumb_sep" style={{ color: token.colorTextQuaternary }}>/</span>
                    <span className="breadcrumb_current" style={{ color: token.colorText }}>
                      <BankOutlined className="breadcrumb_icon" />
                      {selectedBuilding.name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="main-header_right">
            <div className="header-action">
              <Select
                value={i18n.language}
                onChange={handleLanguageChange}
                style={{ width: 120 }}
                suffixIcon={<GlobalOutlined />}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'vi', label: 'Tiếng Việt' },
                ]}
              />
            </div>
            <div className="header-action">
              <Badge count={5} size="small">
                <BellOutlined className="main-header_toggle" />
              </Badge>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="header-action_user">
                <Avatar icon={<UserOutlined />} size={32} />
                <span className="header-action_username">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: isHomePage ? 0 : 16,
            padding: isHomePage ? 0 : 16,
            background: isHomePage ? '#f5f7fa' : token.colorBgContainer,
            borderRadius: isHomePage ? 0 : token.borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>

        <Footer className="main-footer">
          <div className="footer_grid">
            <div className="footer_col--wide">
              <div className="footer_logo" onClick={toggleLogo} title="Click to switch logo">
                <img src={currentLogo} alt={useNewgenLogo ? 'Newgen Logo' : 'Viettel Logo'} />
              </div>
              <p className="footer_text--name">Newgen Smart Home Solutions</p>
              <p className="footer_text--desc">
                {t('footer.companyDesc', 'Leading provider of smart home and building management solutions in Vietnam. We deliver innovative IoT technologies for modern living and sustainable energy management.')}
              </p>
            </div>

            <div className="footer_col--contact">
              <h3 className="footer_heading">{t('footer.contactInfo', 'Contact Information')}</h3>
              <div className="footer_contact-list">
                <div className="footer_contact-item footer_contact-item--top">
                  <EnvironmentOutlined className="footer_contact-icon footer_contact-icon--top" />
                  <span className="footer_text">
                    {t('footer.address', 'Viettel Tower, 285 Cach Mang Thang 8 Street, Ward 12, District 10, Ho Chi Minh City, Vietnam')}
                  </span>
                </div>
                <div className="footer_contact-item">
                  <PhoneOutlined className="footer_contact-icon" />
                  <span className="footer_text">+84 (024) 123456789</span>
                </div>
                <div className="footer_contact-item">
                  <MailOutlined className="footer_contact-icon" />
                  <span className="footer_text">contact@newgen.vn</span>
                </div>
                <div className="footer_contact-item">
                  <WebOutlined className="footer_contact-icon" />
                  <span className="footer_text">www.newgen.vn</span>
                </div>
              </div>
            </div>

            <div className="footer_col">
              <h3 className="footer_heading">{t('footer.workingHours', 'Working Hours')}</h3>
              <div className="footer_hours-list">
                <div className="footer_hours-row">
                  <span className="footer_text">{t('footer.mondayFriday', 'Monday - Friday')}:</span>
                  <span className="footer_text--white">8:00 - 17:30</span>
                </div>
                <div className="footer_hours-row">
                  <span className="footer_text">{t('footer.saturday', 'Saturday')}:</span>
                  <span className="footer_text--white">8:00 - 12:00</span>
                </div>
                <div className="footer_hours-row">
                  <span className="footer_text">{t('footer.sunday', 'Sunday')}:</span>
                  <span style={{ color: '#ff6b6b', fontSize: 12 }}>{t('footer.closed', 'Closed')}</span>
                </div>
                <div className="footer_support-box">
                  <span className="footer_support-text">
                    🔧 {t('footer.support247', '24/7 Technical Support Hotline')}: 1800 8098
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer_copyright">
            <p className="footer_copyright-text">
              © 2026 Newgen Smart Home Solutions. All rights reserved.
            </p>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}
