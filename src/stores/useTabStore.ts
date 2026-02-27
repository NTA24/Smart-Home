import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
  key: string
  labelKey?: string  // i18n key
  label?: string     // fallback static label
  closable?: boolean
}

interface TabState {
  tabs: Tab[]
  activeKey: string
  addTab: (tab: Tab) => void
  removeTab: (key: string) => string | null
  setActiveKey: (key: string) => void
}

const defaultTab: Tab = {
  key: '/dashboard',
  labelKey: 'menu.dashboard',
  closable: false,
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [defaultTab],
      activeKey: '/dashboard',

      addTab: (tab) => {
        const { tabs } = get()
        const exists = tabs.find(t => t.key === tab.key)
        if (!exists) {
          set({ tabs: [...tabs, { ...tab, closable: tab.closable !== false }], activeKey: tab.key })
        } else {
          set({ activeKey: tab.key })
        }
      },

      removeTab: (key) => {
        const { tabs, activeKey } = get()
        const targetIndex = tabs.findIndex(t => t.key === key)
        const newTabs = tabs.filter(t => t.key !== key)
        let newActiveKey: string | null = null
        if (key === activeKey && newTabs.length > 0) {
          const newIndex = targetIndex >= newTabs.length ? newTabs.length - 1 : targetIndex
          newActiveKey = newTabs[newIndex].key
          set({ tabs: newTabs, activeKey: newActiveKey })
        } else {
          set({ tabs: newTabs })
        }
        return newActiveKey
      },

      setActiveKey: (key) => set({ activeKey: key }),
    }),
    {
      name: 'tab-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
)

/**
 * @deprecated Import từ '@/routes/routeConfig' thay thế.
 * Re-export để tránh break các file đang dùng import cũ.
 */
export { routeToLabelKey } from '@/routes/routeConfig'
