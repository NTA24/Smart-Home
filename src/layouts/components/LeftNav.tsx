import { useNavigate, useLocation } from 'react-router'
import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import viettelLogo from '@/assets/viettel-logo.png'
import newgenLogo from '@/assets/newgen-logo.png'
import BuildingSelector from './BuildingSelector.tsx'
import { DEFAULT_HOME_PATH, HOME_BUILDING_FLOW_PATHS } from '@/routes/routeConfig'

export const LEFT_NAV_WIDTH = 200
export const LEFT_NAV_WIDTH_COLLAPSED = 64

interface LeftNavProps {
  useNewgenLogo: boolean
  onLogoClick: () => void
  /** Gọi khi ở mobile drawer để đóng drawer sau khi điều hướng */
  onCloseDrawer?: () => void
  /** Thu gọn chỉ còn icon */
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function LeftNav({ useNewgenLogo, onLogoClick, onCloseDrawer, collapsed, onToggleCollapse }: LeftNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = HOME_BUILDING_FLOW_PATHS.some((p) => location.pathname === p)

  const currentLogo = useNewgenLogo ? newgenLogo : viettelLogo
  const width = collapsed ? LEFT_NAV_WIDTH_COLLAPSED : LEFT_NAV_WIDTH

  const goHome = () => {
    onCloseDrawer?.()
    navigate(DEFAULT_HOME_PATH)
  }

  return (
    <nav
      className={`left-nav ${collapsed ? 'left-nav--collapsed' : ''}`}
      style={{ width }}
      aria-label="Main navigation"
    >
      <div
        className="left-nav_logo"
        onClick={onLogoClick}
        onKeyDown={(e) => e.key === 'Enter' && onLogoClick()}
        role="button"
        tabIndex={0}
        title="Click to switch logo"
      >
        <img src={currentLogo} alt={useNewgenLogo ? 'Newgen Logo' : 'Viettel Logo'} />
      </div>
      <div className="left-nav_items">
        <div
          className={`left-nav_item ${isHome ? 'left-nav_item--active' : ''}`}
          onClick={goHome}
          onKeyDown={(e) => e.key === 'Enter' && goHome()}
          role="button"
          tabIndex={0}
          title="Home"
        >
          <div className="left-nav_item-icon">
            <HomeOutlined />
          </div>
          <span className="left-nav_item-label">Home</span>
        </div>
        <BuildingSelector onClose={onCloseDrawer} />
      </div>
      {onToggleCollapse && (
        <button
          type="button"
          className="left-nav_toggle"
          onClick={onToggleCollapse}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      )}
    </nav>
  )
}
