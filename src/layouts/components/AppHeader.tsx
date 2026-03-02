import { Layout, Select, Badge, Avatar, Dropdown, theme } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useHomeNavigationStore, useUserStore, useBuildingStore } from '@/stores'
import type { UserRole } from '@/stores'

const { Header } = Layout

interface AppHeaderProps {
  isHomePage: boolean
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function AppHeader({ isHomePage, collapsed, onToggleCollapse }: AppHeaderProps) {
  const { t, i18n } = useTranslation()
  const { token } = theme.useToken()
  const _navigate = useNavigate()
  void _navigate

  const navStore = useHomeNavigationStore()
  const { selectedBuilding } = useBuildingStore()
  const { currentUser, switchUser } = useUserStore()

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('header.profile') },
    { key: 'settings', icon: <SettingOutlined />, label: t('header.settings') },
    { type: 'divider' },
    {
      key: 'switch-user',
      label: t('header.switchUser', 'Chuyển tài khoản'),
      children: [
        {
          key: 'switch-admin',
          label: t('header.accountAdmin', 'Viettel Telecom'),
          disabled: currentUser === 'admin',
        },
        {
          key: 'switch-admin1',
          label: t('header.accountAdmin1', 'Smart Building'),
          disabled: currentUser === 'admin1',
        },
      ],
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout') },
  ]

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'switch-admin') switchUser('admin' as UserRole)
    else if (key === 'switch-admin1') switchUser('admin1' as UserRole)
  }

  return (
    <Header
      className="main-header"
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {/* ── Left: collapse toggle + breadcrumb ── */}
      <div className="main-header_left">
        {!isHomePage && (
          collapsed ? (
            <MenuUnfoldOutlined
              className="main-header_toggle"
              onClick={onToggleCollapse}
            />
          ) : (
            <MenuFoldOutlined
              className="main-header_toggle"
              onClick={onToggleCollapse}
            />
          )
        )}

        {!isHomePage && (navStore.selectedTenant || selectedBuilding) && (
          <Breadcrumb />
        )}
      </div>

      {/* ── Right: language, bell, user ── */}
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

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
        >
          <div className="header-action_user">
            <Avatar icon={<UserOutlined />} size={32} />
            <span className="header-action_username">
              {currentUser === 'admin1'
                ? t('header.accountAdmin1', 'Smart Building')
                : t('header.accountAdmin', 'Viettel Telecom')}
            </span>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}

// ─── Breadcrumb (internal) ────────────────────────────────────────────────────
// Tách nhỏ vào đây vì chỉ dùng trong AppHeader, không cần file riêng

function Breadcrumb() {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const navStore = useHomeNavigationStore()
  const { selectedBuilding } = useBuildingStore()

  const linkStyle = { color: token.colorTextSecondary }
  const hoverIn = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.currentTarget.style.color = token.colorPrimary
  }
  const hoverOut = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.currentTarget.style.color = token.colorTextSecondary
  }

  return (
    <div className="breadcrumb">
      {navStore.selectedTenant && (
        <span
          className="breadcrumb_link"
          style={linkStyle}
          onClick={() => { navStore.reset(); navigate('/home/tenant') }}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
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
            style={linkStyle}
            onClick={() => { navStore.setStep('campuses'); navigate('/home/campus') }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
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
  )
}
