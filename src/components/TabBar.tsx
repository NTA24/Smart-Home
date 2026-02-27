import { theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CloseOutlined } from '@ant-design/icons'
import { useTabStore, routeToLabelKey } from '@/stores/useTabStore'

export default function TabBar() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { tabs, activeKey, removeTab, setActiveKey } = useTabStore()
  const { t } = useTranslation()

  const handleTabClick = (key: string) => {
    setActiveKey(key)
    navigate(key)
  }

  const handleClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation()
    const newActiveKey = removeTab(key)
    if (newActiveKey) {
      navigate(newActiveKey)
    }
  }

  const getTabLabel = (tab: { key: string; labelKey?: string; label?: string }) => {
    if (tab.labelKey) {
      return t(tab.labelKey)
    }
    const mappedKey = routeToLabelKey[tab.key]
    if (mappedKey) {
      return t(mappedKey)
    }
    return tab.label || tab.key
  }

  return (
    <div
      className="tabbar"
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`tabbar_tab ${tab.key === activeKey ? 'tabbar_tab--active' : 'tabbar_tab--inactive'} ${tab.key === '/dashboard' ? 'tabbar_tab--dashboard' : ''}`}
          onClick={() => handleTabClick(tab.key)}
        >
          <span>{getTabLabel(tab)}</span>
          {tab.closable !== false && (
            <CloseOutlined
              className="tabbar_close"
              onClick={(e) => handleClose(e, tab.key)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
