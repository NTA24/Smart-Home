import { useState, useEffect } from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useLocation } from 'react-router'
import { AiChatFab, AppFooter, AppHeader, LeftNav, MiddleSidebar, LEFT_NAV_WIDTH, MIDDLE_SIDEBAR_WIDTH } from './components'
import { useHomeNavigationStore } from '@/stores'
import { useMediaQuery, MOBILE_BREAKPOINT } from '@/hooks'

const { Content } = Layout

const HOME_PATHS = ['/home/tenant', '/home/campus', '/home/building'] as const

export default function MainLayout() {
  const { token } = theme.useToken()
  const location = useLocation()
  const setStep = useHomeNavigationStore((s) => s.setStep)
  const isHomePage = location.pathname === '/home' || HOME_PATHS.some((p) => location.pathname === p)
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

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

  // ── Sidebar collapse state (desktop) ─────────────────────────────────────────
  const [collapsed, setCollapsed] = useState(() => {
    const saved = sessionStorage.getItem('sidebar-collapsed')
    return saved ? JSON.parse(saved) : false
  })

  const handleToggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    sessionStorage.setItem('sidebar-collapsed', JSON.stringify(next))
  }

  // ── Mobile drawer state ────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const closeMobileDrawer = () => setMobileMenuOpen(false)
  const toggleMobileDrawer = () => setMobileMenuOpen((prev) => !prev)

  // ── Layout math ─────────────────────────────────────────────────────────────
  const middleSiderWidth = isHomePage ? 0 : (collapsed ? 0 : MIDDLE_SIDEBAR_WIDTH)
  const totalLeftMargin = isMobile ? 0 : LEFT_NAV_WIDTH + middleSiderWidth

  const headerToggle = isMobile ? toggleMobileDrawer : handleToggleCollapse

  return (
    <Layout className="main-layout-root">
      {/* ── Desktop: cột trái cố định ── */}
      {!isMobile && (
        <LeftNav
          useNewgenLogo={useNewgenLogo}
          onLogoClick={handleLogoClick}
        />
      )}

      {/* ── Desktop: sidebar giữa ── */}
      {!isMobile && !isHomePage && (
        <MiddleSidebar
          collapsed={collapsed}
          leftNavWidth={LEFT_NAV_WIDTH}
        />
      )}

      {/* ── Mobile: drawer (backdrop + panel) ── */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={closeMobileDrawer}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            onKeyDown={(e) => e.key === 'Enter' && closeMobileDrawer()}
          />
          <div className="mobile-drawer-panel">
            <LeftNav
              useNewgenLogo={useNewgenLogo}
              onLogoClick={handleLogoClick}
              onCloseDrawer={closeMobileDrawer}
            />
            <div className="middle-sidebar-wrap">
              {!isHomePage && (
                <MiddleSidebar
                  collapsed={false}
                  leftNavWidth={0}
                  inDrawer
                  onCloseDrawer={closeMobileDrawer}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Spacer chiếm chỗ sidebar (desktop) để khối nội dung bên phải không bị co 0 */}
      {!isMobile && totalLeftMargin > 0 && (
        <div style={{ width: totalLeftMargin, flexShrink: 0 }} aria-hidden />
      )}
      {/* ── Vùng nội dung chính ── */}
      <Layout className="main-layout-inner">
        <AppHeader
          isHomePage={isHomePage}
          collapsed={collapsed}
          onToggleCollapse={headerToggle}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
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
      <AiChatFab />
    </Layout>
  )
}
