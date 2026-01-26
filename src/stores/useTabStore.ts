import { create } from 'zustand'

export interface Tab {
  key: string
  labelKey?: string // Translation key for dynamic label
  label?: string // Fallback static label
  closable?: boolean
}

interface TabState {
  tabs: Tab[]
  activeKey: string
  addTab: (tab: Tab) => void
  removeTab: (key: string) => string | null
  setActiveKey: (key: string) => void
}

// Default tab - Dashboard không thể đóng
const defaultTab: Tab = {
  key: '/dashboard',
  labelKey: 'menu.dashboard', // Use translation key
  closable: false,
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [defaultTab],
  activeKey: '/dashboard',

  addTab: (tab) => {
    const { tabs } = get()
    const exists = tabs.find((t) => t.key === tab.key)
    
    if (!exists) {
      set({ 
        tabs: [...tabs, { ...tab, closable: tab.closable !== false }],
        activeKey: tab.key 
      })
    } else {
      set({ activeKey: tab.key })
    }
  },

  removeTab: (key) => {
    const { tabs, activeKey } = get()
    const targetIndex = tabs.findIndex((t) => t.key === key)
    const newTabs = tabs.filter((t) => t.key !== key)
    
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
}))

// Map route key to translation key
export const routeToLabelKey: Record<string, string> = {
  '/dashboard': 'menu.dashboard',
  '/parking': 'menu.parkingList',
  '/devices': 'menu.deviceManagement',
  '/energy': 'menu.energyMonitor',
  '/alarm-statistics': 'menu.alarmStatistics',
  '/energy-monitoring': 'menu.energyMonitoring',
  '/equipment-operation': 'menu.equipmentOperation',
  '/visitor-distribution': 'menu.visitorDistribution',
}
