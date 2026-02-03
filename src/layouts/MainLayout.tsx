import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Dropdown, Badge, Select } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
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
} from '@ant-design/icons'
import { TabBar } from '@/components'
import { useTabStore, routeToLabelKey } from '@/stores'
import type { Tab } from '@/stores'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [openKeys, setOpenKeys] = useState<string[]>(['home'])
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { addTab, activeKey } = useTabStore()
  const { t, i18n } = useTranslation()

  // Menu config with translations
  const menuConfig = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('menu.home'),
      children: [
        { key: '/dashboard', label: t('menu.dashboard') },
      ],
    },
    {
      key: 'parking',
      icon: <CarOutlined />,
      label: t('menu.parkingManagement'),
      children: [
        { key: '/parking', label: t('menu.parkingList') },
      ],
    },
    {
      key: 'data-statistics',
      icon: <BarChartOutlined />,
      label: t('menu.dataStatistics'),
      children: [
        { key: '/alarm-statistics', label: t('menu.alarmStatistics') },
        { key: '/energy-monitoring', label: t('menu.energyMonitoring') },
        { key: '/visitor-distribution', label: t('menu.visitorDistribution') },
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
      key: '/energy',
      icon: <ThunderboltOutlined />,
      label: t('menu.energyMonitor'),
    },
    {
      key: 'smart-building',
      icon: <BuildOutlined />,
      label: t('menu.smartBuilding'),
      children: [
        { key: '/smart-building', label: t('menu.smartBuildingOverview') },
        { key: '/smart-building/architecture', label: t('menu.architecture') },
        { key: '/smart-building/journeys', label: t('menu.journeys') },
        { key: '/smart-building/solutions', label: t('menu.solutions') },
        { key: '/smart-building/investment', label: t('menu.investment') },
        { key: '/smart-building/implementation', label: t('menu.implementation') },
        { key: '/smart-building/contact', label: t('menu.contact') },
      ],
    },
  ]

  // Convert to Ant Design menu items
  const menuItems: MenuProps['items'] = menuConfig.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children?.map((child) => ({
      key: child.key,
      label: child.label,
    })),
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
        }}
        width={260}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 16px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            S
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 16,
                fontWeight: 600,
                color: token.colorTextHeading,
              }}
            >
              Smart Home
            </span>
          )}
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
      </Layout>
    </Layout>
  )
}
