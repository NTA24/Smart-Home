import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'tab-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
    }
  )
)

// Map route key to translation key
export const routeToLabelKey: Record<string, string> = {
  '/dashboard': 'menu.dashboard',
  '/parking': 'menu.parkingList',
  '/live-entrance': 'menu.liveEntrance',
  '/live-exit': 'menu.liveExit',
  '/parking-map': 'menu.parkingMap',
  '/parking-tickets': 'menu.parkingTickets',
  '/parking-subscription': 'menu.parkingSubscription',
  '/parking-devices': 'menu.parkingDevices',
  '/devices': 'menu.deviceManagement',
  '/energy': 'menu.energyMonitor',
  '/alarm-statistics': 'menu.alarmStatistics',
  '/energy-monitoring': 'menu.energyMonitoring',
  '/equipment-operation': 'menu.equipmentOperation',
  '/visitor-distribution': 'menu.visitorDistribution',
  '/smart-building': 'menu.smartBuildingOverview',
  '/smart-building/architecture': 'menu.architecture',
  '/smart-building/journeys': 'menu.journeys',
  '/smart-building/solutions': 'menu.solutions',
  '/smart-building/investment': 'menu.investment',
  '/smart-building/implementation': 'menu.implementation',
  '/smart-building/contact': 'menu.contact',
  '/energy-data-center': 'menu.energyDataCenter',
  '/energy-meters': 'menu.energyMeters',
  '/hvac-assets': 'menu.hvacAssets',
  '/iaq-sensors': 'menu.iaqSensors',
  '/energy-aggregates': 'menu.energyAggregates',
  '/energy-telemetry': 'menu.energyTelemetry',
  '/iaq-telemetry': 'menu.iaqTelemetry',
  '/hvac-telemetry': 'menu.hvacTelemetry',
  '/security-monitoring': 'menu.securityCenter',
  '/camera-live': 'menu.cameraLive',
  '/camera-playback': 'menu.cameraPlayback',
  '/personnel-management': 'menu.personnelManagement',
  '/robot-management': 'menu.robotManagement',
  '/luggage-control': 'menu.luggageControl',
  '/item-control': 'menu.itemControlDashboard',
  '/locker-map': 'menu.lockerMap',
  '/user-management': 'menu.userManagement',
  '/smart-building/elevator-control': 'menu.elevatorControl',
  '/elevator-by-area': 'menu.elevatorByArea',
  '/elevator-dashboard': 'menu.elevatorDashboard',
  '/elevator-live': 'menu.elevatorLive',
  '/elevator-detail': 'menu.elevatorDetail',
  '/elevator-alarms': 'menu.elevatorAlarms',
  '/elevator-access': 'menu.elevatorAccess',
  '/elevator-maintenance': 'menu.elevatorMaintenance',
  '/robot-dashboard': 'menu.robotDashboard',
  '/robot-live-fleet': 'menu.robotLiveFleet',
  '/robot-detail': 'menu.robotDetail',
  '/robot-create-mission': 'menu.robotCreateMission',
  '/robot-alerts': 'menu.robotAlerts',
  '/robot-maintenance': 'menu.robotMaintenance',
  '/energy-device-management': 'menu.energyDeviceManagement',
  '/smart-meeting-room/meeting-room': 'menu.smartMeetingRoom',
  '/smart-workspace/workspace': 'menu.smartWorkspace',
  '/test-api': 'menu.apiTest',
}
