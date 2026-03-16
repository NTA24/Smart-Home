import type { ReactNode } from 'react'
import {
  HomeOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  CarOutlined,
  TeamOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  RobotOutlined,
  LaptopOutlined,
  UserOutlined,
} from '@ant-design/icons'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MenuLeaf {
  key: string
  labelKey: string
  disabled?: boolean
}

export interface MenuGroup {
  key: string
  icon: ReactNode
  labelKey: string
  /** Route mặc định khi click vào tên group (không phải arrow expand) */
  defaultRoute: string
  children: MenuLeaf[]
}

export type MenuEntry = { type: 'item'; key: string; icon: ReactNode; labelKey: string } | MenuGroup

// ─── Menu config ───────────────────────────────────────────────────────────────

/**
 * Cấu trúc menu sidebar.
 * Chỉ chứa keys và labelKeys — việc dịch ngôn ngữ do MiddleSidebar xử lý.
 */
export const menuConfig: MenuEntry[] = [
  {
    type: 'item',
    key: '/dashboard',
    icon: <HomeOutlined />,
    labelKey: 'menu.home',
  },
  {
    key: 'fire-alarm',
    icon: <SafetyCertificateOutlined />,
    labelKey: 'menu.fireAlarmManagement',
    defaultRoute: '/fire-alarm-dashboard',
    children: [
      { key: '/fire-alarm-dashboard', labelKey: 'fireAlarm.tab1' },
      { key: '/fire-alarm-events', labelKey: 'fireAlarm.tab2' },
      { key: '/fire-alarm-devices', labelKey: 'fireAlarm.tab3' },
      { key: '/fire-alarm-roles', labelKey: 'fireAlarm.tab4' },
      { key: '/fire-alarm-reports', labelKey: 'fireAlarm.tab5' },
      { key: '/fire-alarm-notifications', labelKey: 'fireAlarm.tab6' },
      { key: '/fire-alarm-maintenance', labelKey: 'fireAlarm.tab7' },
    ],
  },

  // ── Security ──────────────────────────────────────────────────────────────
  {
    key: 'security-camera',
    icon: <VideoCameraOutlined />,
    labelKey: 'menu.securityCamera',
    defaultRoute: '/security-monitoring',
    children: [
      { key: '/security-monitoring', labelKey: 'menu.securityCenter' },
      { key: '/camera-live', labelKey: 'menu.cameraLive' },
      { key: '/camera-playback', labelKey: 'menu.cameraPlayback' },
      { key: '/camera-config', labelKey: 'menu.cameraConfig' },
    ],
  },

  // ── Vehicle ───────────────────────────────────────────────────────────────
  {
    key: 'vehicle-control',
    icon: <CarOutlined />,
    labelKey: 'menu.vehicleControl',
    defaultRoute: '/parking',
    children: [
      { key: '/parking', labelKey: 'menu.parkingList' },
      { key: '/vehicle-access-control', labelKey: 'menu.vehicleAccessControl' },
      { key: '/parking-map', labelKey: 'menu.parkingMap' },
      { key: '/parking-tickets', labelKey: 'menu.parkingTickets' },
      { key: '/parking-subscription', labelKey: 'menu.parkingSubscription' },
      { key: '/parking-devices', labelKey: 'menu.parkingDevices' },
      { key: '/vehicle-config', labelKey: 'menu.vehicleConfig' },
    ],
  },

  // ── People ────────────────────────────────────────────────────────────────
  {
    key: 'people-control',
    icon: <TeamOutlined />,
    labelKey: 'menu.peopleControl',
    defaultRoute: '/people-report-overview',
    children: [
      { key: '/people-report-overview', labelKey: 'menu.peopleReportOverview' },
      { key: '/people-visitors', labelKey: 'menu.peopleVisitors' },
      { key: '/people-access-logs', labelKey: 'menu.peopleAccessLogs' },
      { key: '/people-alerts', labelKey: 'menu.peopleAlerts' },
      { key: '/people-admin-audit', labelKey: 'menu.peopleAdminAudit' },
    ],
  },

  // ── Elevator ──────────────────────────────────────────────────────────────
  {
    key: 'elevator-management',
    icon: <AppstoreOutlined />,
    labelKey: 'menu.elevatorManagement',
    defaultRoute: '/elevator-dashboard',
    children: [
      { key: '/elevator-dashboard', labelKey: 'menu.elevatorDashboard' },
      { key: '/elevator-live', labelKey: 'menu.elevatorLive' },
      { key: '/elevator-detail', labelKey: 'menu.elevatorDetail' },
      { key: '/elevator-alarms', labelKey: 'menu.elevatorAlarms' },
      { key: '/elevator-access', labelKey: 'menu.elevatorAccess' },
      { key: '/elevator-maintenance', labelKey: 'menu.elevatorMaintenance' },
    ],
  },

  // ── Item / Locker ─────────────────────────────────────────────────────────
  {
    key: 'item-control',
    icon: <InboxOutlined />,
    labelKey: 'menu.itemControl',
    defaultRoute: '/item-control',
    children: [
      { key: '/item-control', labelKey: 'menu.itemControlDashboard' },
      { key: '/locker-map', labelKey: 'menu.lockerMap' },
    ],
  },

  // ── Energy ────────────────────────────────────────────────────────────────
  {
    key: 'energy-management',
    icon: <ThunderboltOutlined />,
    labelKey: 'menu.energyManagement',
    defaultRoute: '/energy-monitoring',
    children: [
      { key: '/energy-device-dashboard', labelKey: 'menu.deviceDashboard' },
      { key: '/energy-data-center', labelKey: 'menu.energyDataCenter' },
      { key: '/alarm-statistics', labelKey: 'menu.alarmStatistics' },
      { key: '/energy-monitoring', labelKey: 'menu.energyMonitoring' },
      { key: '/energy-device-management', labelKey: 'menu.energyDeviceManagement' },
    ],
  },

  // ── Remote Monitoring ─────────────────────────────────────────────────────
  {
    key: 'remote-monitoring',
    icon: <EnvironmentOutlined />,
    labelKey: 'menu.remoteMonitoring',
    defaultRoute: '/energy-telemetry',
    children: [
      { key: '/energy-telemetry', labelKey: 'menu.energyTelemetry' },
      { key: '/iaq-telemetry', labelKey: 'menu.iaqTelemetry' },
      { key: '/hvac-telemetry', labelKey: 'menu.hvacTelemetry' },
    ],
  },

  // ── Robot ─────────────────────────────────────────────────────────────────
  {
    key: 'robot-management',
    icon: <RobotOutlined />,
    labelKey: 'menu.robotManagement',
    defaultRoute: '/robot-dashboard',
    children: [
      { key: '/robot-dashboard', labelKey: 'menu.robotDashboard' },
      { key: '/robot-live-fleet', labelKey: 'menu.robotLiveFleet' },
      { key: '/robot-detail', labelKey: 'menu.robotDetail' },
      { key: '/robot-create-mission', labelKey: 'menu.robotCreateMission' },
      { key: '/robot-alerts', labelKey: 'menu.robotAlerts' },
      { key: '/robot-maintenance', labelKey: 'menu.robotMaintenance' },
    ],
  },

  // ── Smart Workspace ───────────────────────────────────────────────────────
  {
    key: 'smart-workspace',
    icon: <LaptopOutlined />,
    labelKey: 'menu.smartWorkspace',
    defaultRoute: '/smart-workspace/dashboard',
    children: [
      { key: '/smart-workspace/dashboard', labelKey: 'menu.dashboard' },
      { key: '/smart-workspace/workspace', labelKey: 'menu.workspaceRoomList' },
      { key: '/smart-workspace/room-detail', labelKey: 'menu.roomDetail' },
      { key: '/smart-workspace/booking-calendar', labelKey: 'menu.bookingCalendar' },
      { key: '/smart-workspace/create-booking', labelKey: 'menu.createBooking' },
      { key: '/smart-workspace/kiosk', labelKey: 'menu.kiosk' },
      { key: '/smart-workspace/report-issue', labelKey: 'menu.reportIssue' },
      { key: '/smart-workspace/issue-tickets', labelKey: 'menu.issueTickets' },
    ],
  },

  // ── Smart Meeting Room ────────────────────────────────────────────────────
  {
    key: 'smart-meeting-room',
    icon: <TeamOutlined />,
    labelKey: 'menu.smartMeetingRoom',
    defaultRoute: '/smart-meeting-room/dashboard',
    children: [
      { key: '/smart-meeting-room/dashboard', labelKey: 'menu.dashboard' },
      { key: '/smart-meeting-room/meeting-room', labelKey: 'menu.meetingRoomList' },
      { key: '/smart-meeting-room/room-detail', labelKey: 'menu.roomDetail' },
      { key: '/smart-meeting-room/booking-calendar', labelKey: 'menu.bookingCalendar' },
      { key: '/smart-meeting-room/create-booking', labelKey: 'menu.createBooking' },
      { key: '/smart-meeting-room/kiosk', labelKey: 'menu.kiosk' },
      { key: '/smart-meeting-room/report-issue', labelKey: 'menu.reportIssue' },
      { key: '/smart-meeting-room/issue-tickets', labelKey: 'menu.issueTickets' },
    ],
  },
]

/** Groups bị ẩn với role admin1 (user Smart Building) */
export const ADMIN1_HIDDEN_GROUP_KEYS = new Set([
  'item-control',
  'robot-management',
  'smart-workspace',
  'smart-meeting-room',
])

/** Sidebar khi đang ở /account-settings: chỉ 2 mục — Quản lý tài khoản, Quản lý phân quyền */
export const accountSidebarConfig: MenuEntry[] = [
  { type: 'item', key: '/account-settings', icon: <UserOutlined />, labelKey: 'menu.accountManagement' },
  { type: 'item', key: '/user-management', icon: <SafetyCertificateOutlined />, labelKey: 'menu.permissionManagement' },
]
