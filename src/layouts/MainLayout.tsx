import { useState, useEffect } from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { AppFooter, AppHeader, LeftNav, MiddleSidebar, LEFT_NAV_WIDTH, MIDDLE_SIDEBAR_WIDTH } from './components'
import { useHomeNavigationStore } from '@/stores'

const { Content } = Layout

const HOME_PATHS = ['/home/tenant', '/home/campus', '/home/building'] as const

export default function MainLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const setStep = useHomeNavigationStore((s) => s.setStep)
  const isHomePage = location.pathname === '/home' || HOME_PATHS.some((p) => location.pathname === p)

  // Đồng bộ step với URL: /home/tenant -> tenants, /home/campus -> campuses, /home/building -> buildings
  useEffect(() => {
    if (location.pathname === '/home/tenant') setStep('tenants')
    else if (location.pathname === '/home/campus') setStep('campuses')
    else if (location.pathname === '/home/building') setStep('buildings')
  }, [location.pathname, setStep])

  // ── Logo state ──────────────────────────────────────────────────────────────
  const [useNewgenLogo, setUseNewgenLogo] = useState(() => {
    const saved = sessionStorage.getItem('use-newgen-logo')
    return saved ? JSON.parse(saved) : false
  })

  const handleLogoClick = () => {
    const next = !useNewgenLogo
    setUseNewgenLogo(next)
    sessionStorage.setItem('use-newgen-logo', JSON.stringify(next))
  }

  // ── Sidebar collapse state ──────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(() => {
    const saved = sessionStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })

  const handleToggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    sessionStorage.setItem('sidebar-collapsed', JSON.stringify(next))
  }

  // ── Layout math ─────────────────────────────────────────────────────────────
  const middleSiderWidth = isHomePage ? 0 : (collapsed ? 0 : MIDDLE_SIDEBAR_WIDTH)
  const totalLeftMargin = LEFT_NAV_WIDTH + middleSiderWidth

  return (
    <Layout className="main-layout-root">
      {/* ── Cột trái cố định: logo + Home + BuildingSelector ── */}
      <LeftNav
        useNewgenLogo={useNewgenLogo}
        onLogoClick={handleLogoClick}
      />

      {/* ── Sidebar giữa: menu navigation ── */}
      {!isHomePage && (
        <MiddleSidebar
          collapsed={collapsed}
          leftNavWidth={LEFT_NAV_WIDTH}
        />
      )}

      {/* ── Vùng nội dung chính ── */}
      <Layout className="main-layout-inner" style={{ marginLeft: totalLeftMargin }}>
        <AppHeader
          isHomePage={isHomePage}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        <Content
          className="main-layout-content"
          style={{
            margin: isHomePage ? 0 : 16,
            padding: isHomePage ? 0 : 16,
            background: isHomePage ? '#f5f7fa' : token.colorBgContainer,
            borderRadius: isHomePage ? 0 : token.borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>

        <AppFooter
          useNewgenLogo={useNewgenLogo}
          onLogoClick={handleLogoClick}
        />
      </Layout>
    </Layout>
  )
}
