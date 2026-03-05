import { useNavigate, useLocation } from 'react-router'
import { HomeOutlined } from '@ant-design/icons'
import viettelLogo from '@/assets/viettel-logo.png'
import newgenLogo from '@/assets/newgen-logo.png'
import BuildingSelector from './BuildingSelector.tsx'

export const LEFT_NAV_WIDTH = 240

interface LeftNavProps {
  useNewgenLogo: boolean
  onLogoClick: () => void
  /** Gọi khi ở mobile drawer để đóng drawer sau khi điều hướng */
  onCloseDrawer?: () => void
}

export default function LeftNav({ useNewgenLogo, onLogoClick, onCloseDrawer }: LeftNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/home/tenant' || location.pathname === '/home/campus' || location.pathname === '/home/building'

  const currentLogo = useNewgenLogo ? newgenLogo : viettelLogo

  const goHome = () => {
    onCloseDrawer?.()
    navigate('/home/tenant')
  }

  return (
    <nav
      className="left-nav"
      style={{ width: LEFT_NAV_WIDTH }}
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
        >
          <div className="left-nav_item-icon">
            <HomeOutlined />
          </div>
          <span className="left-nav_item-label">Home</span>
        </div>
        <BuildingSelector onClose={onCloseDrawer} />
      </div>
    </nav>
  )
}
