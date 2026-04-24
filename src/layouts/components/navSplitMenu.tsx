import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  WarningOutlined,
  SnippetsOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CarOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LaptopOutlined,
  SettingOutlined,
  DollarOutlined,
  ToolOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons'

/** Leaf route as in `menuConfig` (e.g. `/camera-live`) or full paths for ops/gov placeholders. */
export interface FlowLeaf {
  route: string
  labelKey: string
  disabled?: boolean
}

export interface FlowGroup {
  key: string
  labelKey: string
  icon?: ReactNode
  children: FlowLeaf[]
}

/**
 * Canonical menu/tab path: tenant feature routes get `/system` prefix except a few roots.
 * Keep in sync with `MiddleSidebar` `toSystemPath` behavior.
 */
export function resolveSystemMenuKey(route: string): string {
  if (route.startsWith('/system/')) return route
  if (route === '/dashboard') return '/dashboard'
  if (route.startsWith('/operations/') || route.startsWith('/governance/')) return route
  if (route === '/user-management') return '/user-management'
  const p = route.startsWith('/') ? route : `/${route}`
  return `/system${p}`
}

export function collectRouteParentKeys(
  groups: FlowGroup[],
  resolveKey: (route: string) => string
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const g of groups) {
    for (const c of g.children) {
      out[resolveKey(c.route)] = g.key
    }
  }
  return out
}

export function buildFlowMenuItems(
  groups: FlowGroup[],
  t: TFunction,
  resolveKey: (route: string) => string
): MenuProps['items'] {
  return groups.map(g => ({
    key: g.key,
    icon: g.icon,
    label: t(g.labelKey),
    children: g.children.map(c => ({
      key: resolveKey(c.route),
      label: t(c.labelKey),
      disabled: c.disabled,
    })),
  }))
}

/** VẬN HÀNH — menu theo mockup MENU ĐIỀU HƯỚNG */
export const operationsNavFlow: FlowGroup[] = [
  {
    key: 'ops-overview',
    icon: <HomeOutlined />,
    labelKey: 'nav.ops.overview',
    children: [
      { route: '/dashboard', labelKey: 'menu.dashboard' },
      { route: '/operations/building-map', labelKey: 'menu.operationsBuildingMap' },
    ],
  },
  {
    key: 'ops-incidents',
    icon: <WarningOutlined />,
    labelKey: 'nav.ops.alertsIncidents',
    children: [
      { route: '/operations/incidents/open', labelKey: 'nav.ops.incidentsOpen' },
      { route: '/operations/incidents/resolved', labelKey: 'nav.ops.incidentsResolved' },
    ],
  },
  {
    key: 'ops-work',
    icon: <SnippetsOutlined />,
    labelKey: 'nav.ops.taskHandling',
    children: [
      { route: '/operations/work/todo', labelKey: 'nav.ops.workTodo' },
      { route: '/operations/work/in-progress', labelKey: 'nav.ops.workInProgress' },
    ],
  },
  {
    key: 'ops-security',
    icon: <VideoCameraOutlined />,
    labelKey: 'nav.ops.security',
    children: [
      { route: '/camera-live', labelKey: 'menu.cameraLive' },
      { route: '/camera-playback', labelKey: 'menu.cameraPlayback' },
      { route: '/fire-alarm-events', labelKey: 'nav.ops.securityEvents' },
    ],
  },
  {
    key: 'ops-access',
    icon: <TeamOutlined />,
    labelKey: 'nav.ops.accessControl',
    children: [
      { route: '/people-visitors', labelKey: 'nav.ops.visitorAccess' },
      { route: '/people-access-logs', labelKey: 'nav.ops.accessLog' },
      { route: '/people-alerts', labelKey: 'nav.ops.accessAlerts' },
    ],
  },
  {
    key: 'ops-energy',
    icon: <ThunderboltOutlined />,
    labelKey: 'nav.ops.energy',
    children: [
      { route: '/energy-monitoring', labelKey: 'menu.energyMonitoring' },
      { route: '/alarm-statistics', labelKey: 'menu.alarmStatistics' },
      { route: '/energy-telemetry', labelKey: 'nav.ops.energyData' },
    ],
  },
  {
    key: 'ops-vehicles',
    icon: <CarOutlined />,
    labelKey: 'nav.ops.vehicles',
    children: [
      { route: '/vehicle-access-control', labelKey: 'menu.vehicleAccessControl' },
      { route: '/parking', labelKey: 'nav.ops.parkingLot' },
      { route: '/parking-tickets', labelKey: 'nav.ops.vehicleAlerts' },
    ],
  },
  {
    key: 'ops-elevators',
    icon: <AppstoreOutlined />,
    labelKey: 'nav.ops.elevators',
    children: [
      { route: '/elevator-live', labelKey: 'menu.elevatorLive' },
      { route: '/elevator-alarms', labelKey: 'menu.elevatorAlarms' },
      { route: '/elevator-dashboard', labelKey: 'nav.ops.elevatorList' },
    ],
  },
  {
    key: 'ops-environment',
    icon: <EnvironmentOutlined />,
    labelKey: 'nav.ops.environment',
    children: [
      { route: '/iaq-telemetry', labelKey: 'nav.ops.airQuality' },
      { route: '/hvac-telemetry', labelKey: 'menu.hvacTelemetry' },
      { route: '/iaq-sensors', labelKey: 'nav.ops.environmentAlerts' },
    ],
  },
]

/** QUẢN TRỊ — menu theo mockup */
export const governanceNavFlow: FlowGroup[] = [
  {
    key: 'gov-users',
    icon: <UserOutlined />,
    labelKey: 'nav.gov.usersPermissions',
    children: [
      { route: '/user-management', labelKey: 'menu.userManagement' },
      { route: '/governance/users/roles', labelKey: 'nav.gov.roles' },
    ],
  },
  {
    key: 'gov-devices',
    icon: <LaptopOutlined />,
    labelKey: 'nav.gov.devices',
    children: [
      { route: '/devices', labelKey: 'menu.deviceManagement' },
      { route: '/governance/devices/connection', labelKey: 'nav.gov.connectionStatus' },
    ],
  },
  {
    key: 'gov-config',
    icon: <SettingOutlined />,
    labelKey: 'nav.gov.systemConfig',
    children: [
      { route: '/governance/config/modules', labelKey: 'nav.gov.moduleConfig' },
      { route: '/governance/config/thresholds', labelKey: 'nav.gov.alarmThresholds' },
    ],
  },
  {
    key: 'gov-services',
    icon: <DollarOutlined />,
    labelKey: 'nav.gov.servicesPayments',
    children: [
      { route: '/governance/services/pricing', labelKey: 'nav.gov.feeSchedule' },
      { route: '/governance/services/payment', labelKey: 'nav.gov.payment' },
    ],
  },
  {
    key: 'gov-maintenance',
    icon: <ToolOutlined />,
    labelKey: 'nav.gov.maintenance',
    children: [
      { route: '/governance/maintenance/schedule', labelKey: 'nav.gov.maintenanceSchedule' },
      { route: '/governance/maintenance/due', labelKey: 'nav.gov.devicesDue' },
    ],
  },
  {
    key: 'gov-reports',
    icon: <BarChartOutlined />,
    labelKey: 'nav.gov.reports',
    children: [
      { route: '/people-report-overview', labelKey: 'nav.gov.operationalReports' },
      { route: '/governance/reports/kpi', labelKey: 'nav.gov.kpi' },
    ],
  },
  {
    key: 'gov-logs',
    icon: <FileTextOutlined />,
    labelKey: 'nav.gov.systemLogs',
    children: [
      { route: '/people-admin-audit', labelKey: 'nav.gov.auditLog' },
      { route: '/governance/logs/activity', labelKey: 'nav.gov.operationHistory' },
    ],
  },
]
