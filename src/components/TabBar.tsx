import { theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CloseOutlined } from '@ant-design/icons'
import { useTabStore, routeToLabelKey } from '@/stores/useTabStore'

export default function TabBar() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { tabs, activeKey, removeTab, setActiveKey } = useTabStore()
  const activeKeyStr = String(activeKey ?? '')
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
    const key = String(tab?.key ?? '')
    if (tab?.labelKey) {
      const out = t(tab.labelKey)
      return typeof out === 'string' ? out : key
    }
    const mappedKey = routeToLabelKey[key]
    if (mappedKey) {
      const out = t(mappedKey)
      return typeof out === 'string' ? out : key
    }
    return (tab?.label != null ? String(tab.label) : '') || key
  }

  return (
    <div
      className="tabbar"
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {tabs.map((tab) => {
        const tabKey = String(tab?.key ?? '')
        return (
        <div
          key={tabKey}
          className={`tabbar_tab ${tabKey === activeKeyStr ? 'tabbar_tab--active' : 'tabbar_tab--inactive'} ${tabKey === '/dashboard' ? 'tabbar_tab--dashboard' : ''}`}
          onClick={() => handleTabClick(tabKey)}
        >
          <span>{getTabLabel(tab)}</span>
          {tab.closable !== false && (
            <CloseOutlined
              className="tabbar_close"
              onClick={(e) => handleClose(e, tabKey)}
            />
          )}
        </div>
        )
      })}
    </div>
  )
}
