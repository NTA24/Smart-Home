import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Dropdown, Badge, Select, Typography, Tag, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ApiOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  HomeOutlined,
  GlobalOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined as WebOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
  VideoCameraOutlined,
  CarOutlined,
  InboxOutlined,
  RobotOutlined,
  AppstoreOutlined,
  LaptopOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { TabBar } from '@/components'
import { useTabStore, routeToLabelKey, useBuildingStore } from '@/stores'
import type { Tab } from '@/stores'
import viettelLogo from '@/assets/viettel-logo.png'
import newgenLogo from '@/assets/newgen-logo.png'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>(['home'])
  const [useNewgenLogo, setUseNewgenLogo] = useState(false)
  
  // Current logo based on toggle state
  const currentLogo = useNewgenLogo ? newgenLogo : viettelLogo
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const { addTab, activeKey } = useTabStore()
  const { t, i18n } = useTranslation()
  
  // Building store
  const { buildings, selectedBuilding, selectBuildingById } = useBuildingStore()

  // Check if on home page (hide middle navbar)
  const isHomePage = location.pathname === '/home'
  
  // Left navbar items (main navigation)
  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false)
  const [middleDropdownOpen, setMiddleDropdownOpen] = useState(false)
  
  // Determine active left nav based on route
  const activeLeftNav = isHomePage ? 'home' : 'building-list'
  
  const leftNavItems = [
    { key: 'home', icon: <HomeOutlined />, label: t('menu.home') },
    { key: 'building-list', icon: <BankOutlined />, label: t('menu.buildingList'), hasDropdown: true },
  ]

  // Menu config with translations (supports nested children for Smart Building)
  type MenuChild = { key: string; label: string; children?: MenuChild[]; disabled?: boolean }
  const menuConfig: { key: string; icon: React.ReactNode; label: string; children?: MenuChild[]; disabled?: boolean }[] = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: t('menu.home'),
    },
    {
      key: 'security-camera',
      icon: <VideoCameraOutlined />,
      label: t('menu.securityCamera'),
      children: [
        { key: '/security-monitoring', label: t('menu.securityCenter') },
      ],
    },
    {
      key: 'vehicle-control',
      icon: <CarOutlined />,
      label: t('menu.vehicleControl'),
      children: [
        { key: '/parking', label: t('menu.parkingList') },
      ],
    },
    {
      key: 'people-control',
      icon: <TeamOutlined />,
      label: t('menu.peopleControl'),
      children: [
        { key: '/personnel-management', label: t('menu.personnelManagement') },
        { key: '/visitor-distribution', label: t('menu.visitorDistribution') },
      ],
    },
    {
      key: '/item-control',
      icon: <InboxOutlined />,
      label: t('menu.itemControl'),
    },
    {
      key: 'energy-management',
      icon: <ThunderboltOutlined />,
      label: t('menu.energyManagement'),
      children: [
        { key: '/alarm-statistics', label: t('menu.alarmStatistics') },
        { key: '/energy-monitoring', label: t('menu.energyMonitoring') },
        { key: '/energy-data-center', label: t('menu.energyDataCenter') },
      ],
    },
    {
      key: '/robot-management',
      icon: <RobotOutlined />,
      label: t('menu.robotManagement'),
    },
    {
      key: '/elevator-management',
      icon: <AppstoreOutlined />,
      label: t('menu.elevatorManagement'),
    },
    {
      key: 'smart-workspace',
      icon: <LaptopOutlined />,
      label: t('menu.smartWorkspace'),
      children: [
        {
          key: '/smart-workspace/workspace',
          label: t('menu.smartWorkspace'),
        },
      ],
    },
    {
      key: 'smart-meeting-room',
      icon: <CalendarOutlined />,
      label: t('menu.smartMeetingRoom'),
      children: [
        {
          key: '/smart-meeting-room/meeting-room',
          label: t('menu.smartMeetingRoom'),
        },
      ],
    },
    {
      key: 'others',
      icon: <SettingOutlined />,
      label: t('menu.others'),
      disabled: true,
      children: [
        {
          key: 'smart-building',
          label: t('menu.smartBuilding'),
          children: [
            {
              key: 'sb-management',
              label: t('menu.buildingManagement'),
              children: [
                { key: '/smart-building', label: t('menu.smartBuildingOverview') },
                { key: '/smart-building/architecture', label: t('menu.architecture') },
                { key: '/smart-building/journeys', label: t('menu.journeys') },
                { key: '/smart-building/solutions', label: t('menu.solutions') },
                { key: '/smart-building/investment', label: t('menu.investment') },
                { key: '/smart-building/implementation', label: t('menu.implementation') },
                { key: '/smart-building/contact', label: t('menu.contact') },
                { key: '/smart-building/elevator-control', label: t('menu.elevatorControl') },
              ],
            },
            {
              key: 'sb-security',
              label: t('menu.securityMonitoring'),
              children: [
                { key: '/elevator-by-area', label: t('menu.elevatorByArea') },
              ],
            },
            {
              key: 'sb-energy',
              label: t('menu.energyMonitor'),
              children: [
                { key: '/energy', label: t('menu.energyMonitor') },
                { key: '/energy-device-management', label: t('menu.energyDeviceManagement') },
              ],
            },
            { key: '/luggage-control', label: t('menu.luggage') },
          ],
        },
        {
          key: 'iot-device',
          label: t('menu.iotDevice'),
          children: [
            { key: '/devices', label: t('menu.deviceManagement') },
            { key: '/equipment-operation', label: t('menu.equipmentOperation') },
          ],
        },
        {
          key: 'robot',
          label: t('menu.robot'),
          children: [
            { key: '/robot-management', label: t('menu.robotManagement') },
          ],
        },
        {
          key: 'user-permission',
          label: t('menu.userPermission'),
          children: [
            { key: '/user-management', label: t('menu.userManagement') },
          ],
        },
      ],
    },
  ]

  // Convert to Ant Design menu items (support nested children)
  const mapChildren = (children: MenuChild[]): MenuProps['items'] =>
    children.map((child) =>
      child.children
        ? { key: child.key, label: child.label, children: mapChildren(child.children), disabled: child.disabled }
        : { key: child.key, label: child.label, disabled: child.disabled }
    )
  const menuItems: MenuProps['items'] = menuConfig.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    disabled: item.disabled,
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
      navigate('/home')
    }
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Use translation key from mapping
    const labelKey = routeToLabelKey[key]
    if (labelKey) {
      const tab: Tab = {
        key: key,
        labelKey: labelKey, // Store translation key instead of translated text
        closable: key !== '/dashboard',
      }
      addTab(tab)
      navigate(key)
    }
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const handleBuildingChange = (buildingId: number) => {
    selectBuildingById(buildingId)
    setBuildingDropdownOpen(false)
    setMiddleDropdownOpen(false)
    // Navigate to dashboard if on home page
    if (isHomePage) {
      navigate('/dashboard')
    }
  }

  // Calculate left margin based on both sidebars
  const leftNavWidth = 160
  const middleSiderWidth = isHomePage ? 0 : (collapsed ? 0 : 260)
  const totalLeftMargin = leftNavWidth + middleSiderWidth

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Left Navbar - Main navigation */}
      <div
        style={{
          width: leftNavWidth,
          background: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onClick={() => setUseNewgenLogo(!useNewgenLogo)}
          title="Click to switch logo"
        >
          <img
            src={currentLogo}
            alt={useNewgenLogo ? "Newgen Logo" : "Viettel Logo"}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '16px 0', overflow: 'auto' }}>
          {leftNavItems.map((item) => {
            const isActive = activeLeftNav === item.key
            const hasDropdown = (item as { hasDropdown?: boolean }).hasDropdown
            
            // Building list item with dropdown
            if (hasDropdown) {
              return (
                <Dropdown
                  key={item.key}
                  trigger={['click']}
                  placement="rightTop"
                  open={buildingDropdownOpen}
                  onOpenChange={setBuildingDropdownOpen}
                  dropdownRender={() => (
                    <div
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        padding: '12px 0',
                        minWidth: 240,
                        border: '1px solid #e8e8e8',
                      }}
                    >
                      {/* Header */}
                      <div style={{ padding: '8px 20px 16px', borderBottom: '1px solid #f0f0f0' }}>
                        <Text strong style={{ fontSize: 14, color: '#1a1a1a' }}>
                          {t('menu.buildingList')}
                        </Text>
                      </div>
                      
                      {/* Building list */}
                      <div style={{ padding: '8px 0' }}>
                        {buildings.map(b => (
                          <div
                            key={b.id}
                            onClick={() => handleBuildingChange(b.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '12px 20px',
                              cursor: 'pointer',
                              background: selectedBuilding?.id === b.id ? 'linear-gradient(90deg, #e0f2fe 0%, #f0f9ff 100%)' : 'transparent',
                              transition: 'all 0.2s ease',
                              borderLeft: selectedBuilding?.id === b.id ? '3px solid #0ea5e9' : '3px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedBuilding.id !== b.id) {
                                e.currentTarget.style.background = '#f8fafc'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedBuilding.id !== b.id) {
                                e.currentTarget.style.background = 'transparent'
                              }
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: selectedBuilding?.id === b.id ? '#0ea5e9' : '#cbd5e1',
                                boxShadow: selectedBuilding?.id === b.id ? '0 0 0 3px rgba(14, 165, 233, 0.2)' : 'none',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: selectedBuilding?.id === b.id ? 600 : 400,
                                color: selectedBuilding?.id === b.id ? '#0369a1' : '#334155',
                                fontSize: 13,
                              }}>
                                {b.name}
                              </div>
                            </div>
                            {selectedBuilding?.id === b.id && (
                              <Tag color="cyan" style={{ margin: 0, fontSize: 10, borderRadius: 4, border: 'none' }}>
                                Đang chọn
                              </Tag>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* View all link */}
                      <div
                        style={{
                          padding: '12px 20px 8px',
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        <a 
                          style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                          onClick={() => {
                            setBuildingDropdownOpen(false)
                            navigate('/home')
                          }}
                        >
                          Xem tất cả tòa nhà →
                        </a>
                      </div>
                    </div>
                  )}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      margin: '4px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        color: 'rgba(255,255,255,0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.75)',
                        flex: 1,
                        fontWeight: 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </Dropdown>
              )
            }
            
            return (
              <div
                key={item.key}
                onClick={() => handleLeftNavClick(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  margin: '4px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  background: isActive 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'transparent',
                  boxShadow: isActive 
                    ? '0 4px 12px rgba(99, 102, 241, 0.4)' 
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: 18,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                
                {/* Label */}
                <span
                  style={{
                    fontSize: 13,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                    flex: 1,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Middle Sidebar - Detailed navigation (hidden on home page) */}
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
        {/* Building Selector Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
          }}
        >
          <Dropdown
            trigger={['click']}
            open={middleDropdownOpen}
            onOpenChange={setMiddleDropdownOpen}
            dropdownRender={() => (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                  padding: '8px 0',
                  minWidth: 220,
                }}
              >
                {/* Header */}
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <Text strong>{t('menu.buildingList')}</Text>
                </div>
                
                {/* Building list */}
                {buildings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleBuildingChange(b.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: selectedBuilding?.id === b.id ? '#f0f5ff' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedBuilding.id !== b.id) {
                        e.currentTarget.style.background = '#fafafa'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBuilding.id !== b.id) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: selectedBuilding?.id === b.id ? '#1890ff' : '#d9d9d9',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: selectedBuilding?.id === b.id ? 600 : 400,
                        color: selectedBuilding?.id === b.id ? '#1890ff' : '#000',
                      }}>
                        {b.name}
                      </div>
                    </div>
                    {selectedBuilding?.id === b.id && (
                      <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>Đang chọn</Tag>
                    )}
                  </div>
                ))}
                
                {/* View all link */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid #f0f0f0',
                    marginTop: 4,
                  }}
                >
                  <a 
                    style={{ color: '#1890ff', fontSize: 13, cursor: 'pointer' }}
                    onClick={() => {
                      setMiddleDropdownOpen(false)
                      navigate('/home')
                    }}
                  >
                    Xem tất cả tòa nhà →
                  </a>
                </div>
              </div>
            )}
          >
            <div
              style={{
                cursor: 'pointer',
                padding: '12px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    VT
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedBuilding?.name || 'Chọn tòa nhà'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Tag color="green" style={{ margin: 0, fontSize: 10 }}>
                        {t('menu.active')}
                      </Tag>
                      <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>
                        DEMO
                      </Tag>
                    </div>
                  </div>
                </div>
                <DownOutlined style={{ fontSize: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BuildOutlined />
                  <span>{selectedBuilding?.floors || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ThunderboltOutlined />
                  <span>{selectedBuilding?.power || 0} kW</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TeamOutlined />
                  <span>{selectedBuilding?.people || 0} {t('menu.people')}</span>
                </div>
              </div>
            </div>
          </Dropdown>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', marginTop: 8 }}
        />
        </Sider>
      )}

      <Layout style={{ marginLeft: totalLeftMargin, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isHomePage && (
              collapsed ? (
                <MenuUnfoldOutlined
                  onClick={() => setCollapsed(false)}
                  style={{ fontSize: 18, cursor: 'pointer' }}
                />
              ) : (
                <MenuFoldOutlined
                  onClick={() => setCollapsed(true)}
                  style={{ fontSize: 18, cursor: 'pointer' }}
                />
              )
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
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

            <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              </Badge>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  height: 32,
                }}
              >
                <Avatar icon={<UserOutlined />} size={32} />
                <span style={{ lineHeight: '32px' }}>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {!isHomePage && <TabBar />}

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

        <Footer
          style={{
            background: 'linear-gradient(180deg, #001529 0%, #00213d 100%)',
            padding: '24px 32px',
            borderTop: '1px solid rgba(0, 150, 255, 0.3)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            {/* Logo & Company Info */}
            <div style={{ flex: '1 1 300px' }}>
              <div 
                style={{ 
                  marginBottom: 16, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setUseNewgenLogo(!useNewgenLogo)}
                title="Click to switch logo"
              >
                <img
                  src={currentLogo}
                  alt={useNewgenLogo ? "Newgen Logo" : "Viettel Logo"}
                  style={{
                    height: 50,
                    objectFit: 'contain',
                    filter: 'brightness(1.1)',
                    transition: 'opacity 0.3s ease',
                  }}
                />
              </div>
              <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Newgen Smart Home Solutions
              </p>
              <p style={{ color: '#8ecae6', fontSize: 12, lineHeight: 1.8 }}>
                {t('footer.companyDesc', 'Leading provider of smart home and building management solutions in Vietnam. We deliver innovative IoT technologies for modern living and sustainable energy management.')}
              </p>
            </div>

            {/* Contact Info */}
            <div style={{ flex: '1 1 250px' }}>
              <h3 style={{
                color: '#00d4ff',
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                borderBottom: '2px solid #00d4ff',
                paddingBottom: 8,
                display: 'inline-block',
              }}>
                {t('footer.contactInfo', 'Contact Information')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <EnvironmentOutlined style={{ color: '#00d4ff', fontSize: 14, marginTop: 2 }} />
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>
                    {t('footer.address', 'Viettel Tower, 285 Cach Mang Thang 8 Street, Ward 12, District 10, Ho Chi Minh City, Vietnam')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PhoneOutlined style={{ color: '#00d4ff', fontSize: 14 }} />
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>+84 (024) 123456789</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MailOutlined style={{ color: '#00d4ff', fontSize: 14 }} />
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>contact@newgen.vn</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <WebOutlined style={{ color: '#00d4ff', fontSize: 14 }} />
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>www.newgen.vn</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div style={{ flex: '1 1 200px' }}>
              <h3 style={{
                color: '#00d4ff',
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                borderBottom: '2px solid #00d4ff',
                paddingBottom: 8,
                display: 'inline-block',
              }}>
                {t('footer.workingHours', 'Working Hours')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>{t('footer.mondayFriday', 'Monday - Friday')}:</span>
                  <span style={{ color: '#ffffff', fontSize: 12 }}>8:00 - 17:30</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>{t('footer.saturday', 'Saturday')}:</span>
                  <span style={{ color: '#ffffff', fontSize: 12 }}>8:00 - 12:00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8ecae6', fontSize: 12 }}>{t('footer.sunday', 'Sunday')}:</span>
                  <span style={{ color: '#ff6b6b', fontSize: 12 }}>{t('footer.closed', 'Closed')}</span>
                </div>
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(0, 150, 255, 0.15)', borderRadius: 4 }}>
                  <span style={{ color: '#00ff88', fontSize: 11 }}>
                    🔧 {t('footer.support247', '24/7 Technical Support Hotline')}: 1800 8098
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid rgba(0, 150, 255, 0.2)',
            textAlign: 'center',
          }}>
            <p style={{ color: '#5a9fcf', fontSize: 11, margin: 0 }}>
              © 2026 Newgen Smart Home Solutions. All rights reserved.
            </p>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}
