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

function toStr(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return String(v)
}

function normalizeTab(t: Tab): Tab {
  return { ...t, key: toStr(t.key), labelKey: t.labelKey != null ? toStr(t.labelKey) : undefined, label: t.label != null ? toStr(t.label) : undefined }
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [defaultTab],
      activeKey: '/dashboard',

      addTab: (tab) => {
        const normalized = normalizeTab(tab)
        const key = normalized.key
        const { tabs } = get()
        const normalizedTabs = tabs.map(normalizeTab)
        const exists = normalizedTabs.find(t => t.key === key)
        if (!exists) {
          set({ tabs: [...normalizedTabs, { ...normalized, closable: normalized.closable !== false }], activeKey: key })
        } else {
          set({ activeKey: key })
        }
      },

      removeTab: (key) => {
        const sk = toStr(key)
        const { tabs, activeKey } = get()
        const normalizedTabs = tabs.map(normalizeTab)
        const targetIndex = normalizedTabs.findIndex(t => t.key === sk)
        const newTabs = normalizedTabs.filter(t => t.key !== sk)
        let newActiveKey: string | null = null
        if (sk === toStr(activeKey) && newTabs.length > 0) {
          const newIndex = targetIndex >= newTabs.length ? newTabs.length - 1 : targetIndex
          newActiveKey = newTabs[newIndex].key
          set({ tabs: newTabs, activeKey: newActiveKey })
        } else {
          set({ tabs: newTabs })
        }
        return newActiveKey
      },

      setActiveKey: (key) => set({ activeKey: toStr(key) }),
    }),
    {
      name: 'tab-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          if (!str) return null
          try {
            const data = JSON.parse(str)
            if (data?.state?.tabs) {
              data.state.tabs = data.state.tabs.map((t: Tab) => ({ ...t, key: toStr(t?.key), labelKey: t?.labelKey != null ? toStr(t.labelKey) : undefined, label: t?.label != null ? toStr(t.label) : undefined }))
            }
            if (data?.state?.activeKey != null) data.state.activeKey = toStr(data.state.activeKey)
            return data
          } catch {
            return null
          }
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
