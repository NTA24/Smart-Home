import { theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CloseOutlined } from '@ant-design/icons'
import { useTabStore, routeToLabelKey } from '@/stores/useTabStore'
import type { CSSProperties } from 'react'

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

  // Get label for tab - use translation if available
  const getTabLabel = (tab: { key: string; labelKey?: string; label?: string }) => {
    // First try labelKey
    if (tab.labelKey) {
      return t(tab.labelKey)
    }
    // Then try route mapping
    const mappedKey = routeToLabelKey[tab.key]
    if (mappedKey) {
      return t(mappedKey)
    }
    // Fallback to static label
    return tab.label || tab.key
  }

  const tabStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    marginRight: 4,
    cursor: 'pointer',
    fontSize: 13,
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  const activeStyle: CSSProperties = {
    ...tabStyle,
    background: '#e6f7ff',
    color: '#1890ff',
    borderBottom: '2px solid #1890ff',
  }

  const inactiveStyle: CSSProperties = {
    ...tabStyle,
    background: 'transparent',
    color: token.colorTextSecondary,
    borderBottom: '2px solid transparent',
  }

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: '8px 12px 0',
        display: 'flex',
        alignItems: 'flex-end',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
          style={tab.key === activeKey ? activeStyle : inactiveStyle}
          onMouseEnter={(e) => {
            if (tab.key !== activeKey) {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
            }
          }}
          onMouseLeave={(e) => {
            if (tab.key !== activeKey) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span>{getTabLabel(tab)}</span>
          {tab.closable !== false && (
            <CloseOutlined
              onClick={(e) => handleClose(e, tab.key)}
              style={{
                marginLeft: 8,
                fontSize: 10,
                color: '#999',
                padding: 2,
                borderRadius: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ff4d4f'
                e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#999'
                e.currentTarget.style.background = 'transparent'
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
