import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Dropdown, Badge, Select } from 'antd'
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
} from '@ant-design/icons'
import { TabBar } from '@/components'
import { useTabStore, routeToLabelKey } from '@/stores'
import type { Tab } from '@/stores'
import logoImage from '@/assets/viettel-logo.png'

const { Header, Sider, Content, Footer } = Layout

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>(['home'])
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { addTab, activeKey } = useTabStore()
  const { t, i18n } = useTranslation()

  // Menu config with translations (supports nested children for Smart Building)
  type MenuChild = { key: string; label: string; children?: MenuChild[] }
  const menuConfig: { key: string; icon: React.ReactNode; label: string; children?: MenuChild[] }[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('menu.home'),
      children: [
        { key: '/dashboard', label: t('menu.dashboard') },
      ],
    },
    {
      key: 'smart-building',
      icon: <BuildOutlined />,
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
        { key: '/parking', label: t('menu.parkingList') },
        {
          key: 'sb-security',
          label: t('menu.securityMonitoring'),
          children: [
            { key: '/security-monitoring', label: t('menu.securityCenter') },
            { key: '/elevator-by-area', label: t('menu.elevatorByArea') },
          ],
        },
        {
          key: 'sb-energy',
          label: t('menu.energyMonitor'),
          children: [
            { key: '/energy', label: t('menu.energyMonitor') },
            { key: '/energy-data-center', label: t('menu.energyDataCenter') },
            { key: '/energy-device-management', label: t('menu.energyDeviceManagement') },
          ],
        },
        { key: '/luggage-control', label: t('menu.luggage') },
      ],
    },
    {
      key: 'iot-device',
      icon: <ApiOutlined />,
      label: t('menu.iotDevice'),
      children: [
        { key: '/devices', label: t('menu.deviceManagement') },
        { key: '/equipment-operation', label: t('menu.equipmentOperation') },
      ],
    },
    {
      key: 'data-statistics',
      icon: <BarChartOutlined />,
      label: t('menu.dataStatistics'),
      children: [
        { key: '/alarm-statistics', label: t('menu.alarmStatistics') },
        { key: '/energy-monitoring', label: t('menu.energyMonitoring') },
      ],
    },
    {
      key: 'robot',
      icon: <ApiOutlined />,
      label: t('menu.robot'),
      children: [
        { key: '/robot-management', label: t('menu.robotManagement') },
      ],
    },
    {
      key: 'personnel',
      icon: <TeamOutlined />,
      label: t('menu.personnel'),
      children: [
        { key: '/personnel-management', label: t('menu.personnelManagement') },
        { key: '/visitor-distribution', label: t('menu.visitorDistribution') },
      ],
    },
    {
      key: 'user-permission',
      icon: <SafetyCertificateOutlined />,
      label: t('menu.userPermission'),
      children: [
        { key: '/user-management', label: t('menu.userManagement') },
      ],
    },
  ]

  // Convert to Ant Design menu items (support nested children)
  const mapChildren = (children: MenuChild[]): MenuProps['items'] =>
    children.map((child) =>
      child.children
        ? { key: child.key, label: child.label, children: mapChildren(child.children) }
        : { key: child.key, label: child.label }
    )
  const menuItems: MenuProps['items'] = menuConfig.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children ? mapChildren(item.children) : undefined,
  }))

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('header.profile') },
    { key: 'settings', icon: <SettingOutlined />, label: t('header.settings') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout') },
  ]

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        width={260}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            borderBottom: 'none',
            background: '#0a2744',
            overflow: 'hidden',
          }}
        >
          <img
            src={logoImage}
            alt="Viettel Logo"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              transition: 'all 0.2s ease',
            }}
          />
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

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
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
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 18, cursor: 'pointer' }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 18, cursor: 'pointer' }}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Language Switcher */}
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

            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span>Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <TabBar />

        <Content
          style={{
            margin: 16,
            padding: 16,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
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
              <div style={{ marginBottom: 16 }}>
                <img
                  src={logoImage}
                  alt="Viettel Logo"
                  style={{
                    height: 50,
                    objectFit: 'contain',
                    filter: 'brightness(1.1)',
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
