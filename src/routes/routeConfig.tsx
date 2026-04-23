import { lazy } from 'react'
import { devRoutes, devRedirects } from './devRoutes'

// ─── Lazy imports ────────────────────────────────────────────────────────────

// Dashboard
const Home = lazy(() => import('@/pages/Dashboard/Home'))
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const FireAlarmDashboard = lazy(() => import('@/pages/FireAlarm/FireAlarmDashboard'))
const FireAlarmEvents = lazy(() => import('@/pages/FireAlarm/FireAlarmEvents'))
const FireAlarmDevices = lazy(() => import('@/pages/FireAlarm/FireAlarmDevices'))
const FireAlarmRoles = lazy(() => import('@/pages/FireAlarm/FireAlarmRoles'))
const FireAlarmReports = lazy(() => import('@/pages/FireAlarm/FireAlarmReports'))
const FireAlarmNotifications = lazy(() => import('@/pages/FireAlarm/FireAlarmNotifications'))
const FireAlarmMaintenance = lazy(() => import('@/pages/FireAlarm/FireAlarmMaintenance'))

// Security
const SecurityMonitoring = lazy(() => import('@/pages/Security/SecurityMonitoring'))
const CameraLiveView = lazy(() => import('@/pages/Security/CameraLiveView'))
const CameraPlayback = lazy(() => import('@/pages/Security/CameraPlayback'))
const CameraConfig = lazy(() => import('@/pages/Security/CameraConfig.tsx'))

// Vehicle / Parking
const ParkingManagement = lazy(() => import('@/pages/Vehicle/ParkingManagement'))
const VehicleAccessControl = lazy(() => import('@/pages/Vehicle/VehicleAccessControl'))
const ParkingMap = lazy(() => import('@/pages/Vehicle/ParkingMap'))
const ParkingTickets = lazy(() => import('@/pages/Vehicle/ParkingTickets'))
const ParkingSubscription = lazy(() => import('@/pages/Vehicle/ParkingSubscription'))
const ParkingDevices = lazy(() => import('@/pages/Vehicle/ParkingDevices'))
const VehicleConfig = lazy(() => import('@/pages/Vehicle/VehicleConfig'))

// People
const PeopleDirectory = lazy(() => import('@/pages/People/PeopleDirectory'))
const VisitorManagement = lazy(() => import('@/pages/People/VisitorManagement'))
const AccessLogs = lazy(() => import('@/pages/People/AccessLogs'))
const AlertsPage = lazy(() => import('@/pages/People/AlertsPage'))
const AdminAudit = lazy(() => import('@/pages/People/AdminAudit'))
const PersonnelManagement = lazy(() => import('@/pages/People/PersonnelManagement'))
const VisitorDistribution = lazy(() => import('@/pages/People/VisitorDistribution'))
const PeopleReportOverview = lazy(() => import('@/pages/People/PeopleReportOverview'))

// Item / Locker
const ItemControl = lazy(() => import('@/pages/Item/ItemControl'))
const LockerMap = lazy(() => import('@/pages/Item/LockerMap'))
const LuggageControl = lazy(() => import('@/pages/Item/LuggageControl'))

// Energy
const AlarmStatistics = lazy(() => import('@/pages/Energy/AlarmStatistics'))
const EnergyMonitoring = lazy(() => import('@/pages/Energy/EnergyMonitoring'))
const EnergyDataCenter = lazy(() => import('@/pages/Energy/EnergyDataCenter'))
const EnergyMeterPage = lazy(() => import('@/pages/Energy/EnergyMeterPage'))
const HvacAssetPage = lazy(() => import('@/pages/Energy/HvacAssetPage'))
const IaqSensorPage = lazy(() => import('@/pages/Energy/IaqSensorPage'))
const EnergyAggregatePage = lazy(() => import('@/pages/Energy/EnergyAggregatePage'))
const EnergyTelemetryPage = lazy(() => import('@/pages/Energy/EnergyTelemetryPage'))
const IaqTelemetryPage = lazy(() => import('@/pages/Energy/IaqTelemetryPage'))
const HvacTelemetryPage = lazy(() => import('@/pages/Energy/HvacTelemetryPage'))
const EnergyMvPage = lazy(() => import('@/pages/Energy/EnergyMvPage'))
const EnergyDeviceManagement = lazy(() => import('@/pages/Energy/EnergyDeviceManagement'))
const EnergyDeviceDashboardPage = lazy(() => import('@/pages/Energy/EnergyDeviceDashboardPage'))
const EnergyDeviceDashboardViewPage = lazy(() => import('@/pages/Energy/EnergyDeviceDashboardViewPage'))

// Elevator
const ElevatorDashboard = lazy(() => import('@/pages/Elevator/ElevatorDashboard'))
const ElevatorLive = lazy(() => import('@/pages/Elevator/ElevatorLive'))
const ElevatorDetail = lazy(() => import('@/pages/Elevator/ElevatorDetail'))
const ElevatorAlarms = lazy(() => import('@/pages/Elevator/ElevatorAlarms'))
const ElevatorAccessControl = lazy(() => import('@/pages/Elevator/ElevatorAccessControl'))
const ElevatorMaintenance = lazy(() => import('@/pages/Elevator/ElevatorMaintenance'))
const ElevatorByArea = lazy(() => import('@/pages/Elevator/ElevatorByArea'))

// Robot
const RobotDashboard = lazy(() => import('@/pages/Robot/RobotDashboard'))
const RobotLiveFleet = lazy(() => import('@/pages/Robot/RobotLiveFleet'))
const RobotDetail = lazy(() => import('@/pages/Robot/RobotDetail'))
const RobotCreateMission = lazy(() => import('@/pages/Robot/RobotCreateMission'))
const RobotAlerts = lazy(() => import('@/pages/Robot/RobotAlerts'))
const RobotMaintenance = lazy(() => import('@/pages/Robot/RobotMaintenance'))
const RobotManagement = lazy(() => import('@/pages/Robot/RobotManagement'))

// Workspace
const WorkspaceDashboard = lazy(() => import('@/pages/Workspace/WorkspaceDashboard'))
const SmartWorkspace = lazy(() => import('@/pages/Workspace/SmartWorkspace'))
const WorkspaceRoomDetail = lazy(() => import('@/pages/Workspace/WorkspaceRoomDetail'))
const WorkspaceBookingCalendar = lazy(() => import('@/pages/Workspace/WorkspaceBookingCalendar'))
const WorkspaceCreateBooking = lazy(() => import('@/pages/Workspace/WorkspaceCreateBooking'))
const WorkspaceKiosk = lazy(() => import('@/pages/Workspace/WorkspaceKiosk'))
const WorkspaceReportIssue = lazy(() => import('@/pages/Workspace/WorkspaceReportIssue'))
const WorkspaceIssueTickets = lazy(() => import('@/pages/Workspace/IssueTickets'))

// Meeting Room
const MeetingRoomDashboard = lazy(() => import('@/pages/Workspace/MeetingRoomDashboard'))
const SmartMeetingRoom = lazy(() => import('@/pages/Workspace/SmartMeetingRoom'))
const MeetingRoomDetail = lazy(() => import('@/pages/Workspace/MeetingRoomDetail'))
const MeetingRoomBookingCalendar = lazy(() => import('@/pages/Workspace/MeetingRoomBookingCalendar'))
const MeetingRoomCreateBooking = lazy(() => import('@/pages/Workspace/MeetingRoomCreateBooking'))
const MeetingRoomKiosk = lazy(() => import('@/pages/Workspace/MeetingRoomKiosk'))
const MeetingRoomReportIssue = lazy(() => import('@/pages/Workspace/MeetingRoomReportIssue'))
const MeetingIssueTickets = lazy(() => import('@/pages/Workspace/IssueTickets'))

// Admin
const UserManagement = lazy(() => import('@/pages/Admin/UserManagement'))
const DeviceManagement = lazy(() => import('@/pages/Admin/DeviceManagement'))
const AccountSettings = lazy(() => import('@/pages/Admin/AccountSettings'))
const CustomerUsersPage = lazy(() => import('@/pages/Admin/CustomerUsersPage'))
const CustomerAssetsPage = lazy(() => import('@/pages/Admin/CustomerAssetsPage'))
const CustomerDevicesPage = lazy(() => import('@/pages/Admin/CustomerDevicesPage'))
const CustomerDashboardsPage = lazy(() => import('@/pages/Admin/CustomerDashboardsPage'))
const CustomerEdgesPage = lazy(() => import('@/pages/Admin/CustomerEdgesPage'))

// Other
const EquipmentOperation = lazy(() => import('@/pages/Other/EquipmentOperation'))
const EnergyMonitor = lazy(() => import('@/pages/Other/EnergyMonitor'))
const SectionPlaceholderPage = lazy(() => import('@/pages/Common/SectionPlaceholderPage'))

// ─── Home wizard (tenant → campus → building): cùng component, khác URL ─────

/**
 * Các segment route cho flow chọn tòa nhà. Giữ đồng bộ với các entry `routes` bên dưới.
 */
export const HOME_BUILDING_FLOW_SEGMENTS = ['home/tenant', 'home/campus', 'home/building'] as const

/** Path đầy đủ tương ứng, ví dụ `/home/tenant` */
export const HOME_BUILDING_FLOW_PATHS = HOME_BUILDING_FLOW_SEGMENTS.map((s) => `/${s}`) as readonly string[]

/** Đích mặc định cho `/` và redirect alias `home` */
export const DEFAULT_HOME_PATH = HOME_BUILDING_FLOW_PATHS[0]

/** Từng bước URL của flow Home — thay cho chuỗi `/home/tenant` … rải rác trong code */
export const HOME_PATH = {
  tenant: HOME_BUILDING_FLOW_PATHS[0],
  campus: HOME_BUILDING_FLOW_PATHS[1],
  building: HOME_BUILDING_FLOW_PATHS[2],
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RouteConfig {
  /** Path segment (không có dấu `/` đầu), ví dụ: 'dashboard', 'smart-workspace/kiosk' */
  path: string
  /** i18n key để hiển thị tên tab */
  labelKey: string
  /** Key của menu group cha — dùng để highlight và expand đúng menu khi vào trang */
  parentKey?: string
  /** Component lazy-loaded */
  element: React.ReactNode
}

// ─── Route definitions ────────────────────────────────────────────────────────

/**
 * SINGLE SOURCE OF TRUTH cho toàn bộ routes của app.
 *
 * Khi thêm route mới, chỉ cần thêm vào đây — App.tsx chỉ bọc Suspense và đọc
 * `routes` + `redirects` + `DEFAULT_HOME_PATH` (không hardcode thêm path).
 *
 * Dev/test routes nằm riêng trong `devRoutes.tsx`, được merge có điều kiện
 * qua `import.meta.env.DEV` — không xuất hiện trong production build.
 *
 * **Đăng nhập:** `/login` không nằm trong `routes` này; được khai báo trong `App.tsx`
 * (cùng cấp `MainLayout` dưới `AuthNavigationRoot`). Đường dẫn chuẩn: `LOGIN_PATH` từ `@/lib/auth/paths`.
 *
 * Flow Home (tenant / campus / building): dùng `HOME_BUILDING_FLOW_SEGMENTS` + các
 * entry được spread vào `routes` bên dưới.
 *
 * Các derived maps (routeToLabelKey, routeToParentKey) được tạo tự động bên dưới.
 */
export const routes: RouteConfig[] = [
  // ── Home & Dashboard ──────────────────────────────────────────────────────
  ...HOME_BUILDING_FLOW_SEGMENTS.map((path) => ({
    path,
    labelKey: 'menu.home',
    element: <Home />,
  })),
  {
    path: 'dashboard',
    labelKey: 'menu.dashboard',
    element: <Dashboard />,
  },
  {
    path: 'fire-alarm-dashboard',
    labelKey: 'fireAlarm.tab1',
    parentKey: 'fire-alarm',
    element: <FireAlarmDashboard />,
  },
  {
    path: 'fire-alarm-events',
    labelKey: 'fireAlarm.tab2',
    parentKey: 'fire-alarm',
    element: <FireAlarmEvents />,
  },
  {
    path: 'fire-alarm-devices',
    labelKey: 'fireAlarm.tab3',
    parentKey: 'fire-alarm',
    element: <FireAlarmDevices />,
  },
  {
    path: 'fire-alarm-roles',
    labelKey: 'fireAlarm.tab4',
    parentKey: 'fire-alarm',
    element: <FireAlarmRoles />,
  },
  {
    path: 'fire-alarm-reports',
    labelKey: 'fireAlarm.tab5',
    parentKey: 'fire-alarm',
    element: <FireAlarmReports />,
  },
  {
    path: 'fire-alarm-notifications',
    labelKey: 'fireAlarm.tab6',
    parentKey: 'fire-alarm',
    element: <FireAlarmNotifications />,
  },
  {
    path: 'fire-alarm-maintenance',
    labelKey: 'fireAlarm.tab7',
    parentKey: 'fire-alarm',
    element: <FireAlarmMaintenance />,
  },

  // ── Security / Camera ─────────────────────────────────────────────────────
  {
    path: 'security-monitoring',
    labelKey: 'menu.securityCenter',
    parentKey: 'security-camera',
    element: <SecurityMonitoring />,
  },
  {
    path: 'camera-live',
    labelKey: 'menu.cameraLive',
    parentKey: 'security-camera',
    element: <CameraLiveView />,
  },
  {
    path: 'camera-playback',
    labelKey: 'menu.cameraPlayback',
    parentKey: 'security-camera',
    element: <CameraPlayback />,
  },
  {
    path: 'camera-config',
    labelKey: 'menu.cameraConfig',
    parentKey: 'security-camera',
    element: <CameraConfig />,
  },

  // ── Vehicle / Parking ─────────────────────────────────────────────────────
  {
    path: 'parking',
    labelKey: 'menu.parkingList',
    parentKey: 'vehicle-control',
    element: <ParkingManagement />,
  },
  {
    path: 'vehicle-access-control',
    labelKey: 'menu.vehicleAccessControl',
    parentKey: 'vehicle-control',
    element: <VehicleAccessControl />,
  },
  {
    path: 'parking-map',
    labelKey: 'menu.parkingMap',
    parentKey: 'vehicle-control',
    element: <ParkingMap />,
  },
  {
    path: 'parking-tickets',
    labelKey: 'menu.parkingTickets',
    parentKey: 'vehicle-control',
    element: <ParkingTickets />,
  },
  {
    path: 'parking-subscription',
    labelKey: 'menu.parkingSubscription',
    parentKey: 'vehicle-control',
    element: <ParkingSubscription />,
  },
  {
    path: 'parking-devices',
    labelKey: 'menu.parkingDevices',
    parentKey: 'vehicle-control',
    element: <ParkingDevices />,
  },
  {
    path: 'vehicle-config',
    labelKey: 'menu.vehicleConfig',
    parentKey: 'vehicle-control',
    element: <VehicleConfig />,
  },

  // ── People ────────────────────────────────────────────────────────────────
  {
    path: 'people-report-overview',
    labelKey: 'menu.peopleReportOverview',
    parentKey: 'people-control',
    element: <PeopleReportOverview />,
  },
  {
    path: 'people-visitors',
    labelKey: 'menu.peopleVisitors',
    parentKey: 'people-control',
    element: <VisitorManagement />,
  },
  {
    path: 'people-access-logs',
    labelKey: 'menu.peopleAccessLogs',
    parentKey: 'people-control',
    element: <AccessLogs />,
  },
  {
    path: 'people-alerts',
    labelKey: 'menu.peopleAlerts',
    parentKey: 'people-control',
    element: <AlertsPage />,
  },
  {
    path: 'people-admin-audit',
    labelKey: 'menu.peopleAdminAudit',
    parentKey: 'people-control',
    element: <AdminAudit />,
  },
  {
    path: 'people-directory',
    labelKey: 'menu.peopleDirectory',
    parentKey: 'people-control',
    element: <PeopleDirectory />,
  },
  {
    path: 'visitor-distribution',
    labelKey: 'menu.visitorDistribution',
    parentKey: 'people-control',
    element: <VisitorDistribution />,
  },
  {
    path: 'personnel-management',
    labelKey: 'menu.personnelManagement',
    parentKey: 'people-control',
    element: <PersonnelManagement />,
  },

  // ── Item / Locker ─────────────────────────────────────────────────────────
  {
    path: 'item-control',
    labelKey: 'menu.itemControlDashboard',
    parentKey: 'item-control',
    element: <ItemControl />,
  },
  {
    path: 'locker-map',
    labelKey: 'menu.lockerMap',
    parentKey: 'item-control',
    element: <LockerMap />,
  },
  {
    path: 'luggage-control',
    labelKey: 'menu.luggageControl',
    parentKey: 'item-control',
    element: <LuggageControl />,
  },

  // ── Energy ────────────────────────────────────────────────────────────────
  {
    path: 'energy-data-center',
    labelKey: 'menu.energyDataCenter',
    parentKey: 'energy-management',
    element: <EnergyDataCenter />,
  },
  {
    path: 'alarm-statistics',
    labelKey: 'menu.alarmStatistics',
    parentKey: 'energy-management',
    element: <AlarmStatistics />,
  },
  {
    path: 'energy-monitoring',
    labelKey: 'menu.energyMonitoring',
    parentKey: 'energy-management',
    element: <EnergyMonitoring />,
  },
  {
    path: 'energy-meters',
    labelKey: 'menu.energyMeters',
    parentKey: 'energy-management',
    element: <EnergyMeterPage />,
  },
  {
    path: 'energy-device-management',
    labelKey: 'menu.energyDeviceManagement',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/energy-meters',
    labelKey: 'menu.energyMeters',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/hvac-assets',
    labelKey: 'menu.hvacAssets',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/iaq-sensors',
    labelKey: 'menu.iaqSensors',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/energy-aggregates',
    labelKey: 'menu.energyAggregates',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/energy-mv',
    labelKey: 'menu.energyMv',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-management/device-config',
    labelKey: 'energyDeviceManagement.configTitle',
    parentKey: 'energy-management',
    element: <EnergyDeviceManagement />,
  },
  {
    path: 'energy-device-dashboard',
    labelKey: 'menu.deviceDashboard',
    parentKey: 'energy-management',
    element: <EnergyDeviceDashboardPage />,
  },
  {
    path: 'energy-device-dashboard/:dashboardId',
    labelKey: 'menu.deviceDashboard',
    parentKey: 'energy-management',
    element: <EnergyDeviceDashboardViewPage />,
  },

  // ── Remote Monitoring ─────────────────────────────────────────────────────
  {
    path: 'hvac-assets',
    labelKey: 'menu.hvacAssets',
    parentKey: 'remote-monitoring',
    element: <HvacAssetPage />,
  },
  {
    path: 'iaq-sensors',
    labelKey: 'menu.iaqSensors',
    parentKey: 'remote-monitoring',
    element: <IaqSensorPage />,
  },
  {
    path: 'energy-aggregates',
    labelKey: 'menu.energyAggregates',
    parentKey: 'remote-monitoring',
    element: <EnergyAggregatePage />,
  },
  {
    path: 'energy-telemetry',
    labelKey: 'menu.energyTelemetry',
    parentKey: 'remote-monitoring',
    element: <EnergyTelemetryPage />,
  },
  {
    path: 'iaq-telemetry',
    labelKey: 'menu.iaqTelemetry',
    parentKey: 'remote-monitoring',
    element: <IaqTelemetryPage />,
  },
  {
    path: 'hvac-telemetry',
    labelKey: 'menu.hvacTelemetry',
    parentKey: 'remote-monitoring',
    element: <HvacTelemetryPage />,
  },
  {
    path: 'energy-mv',
    labelKey: 'menu.energyMv',
    parentKey: 'remote-monitoring',
    element: <EnergyMvPage />,
  },

  // ── Elevator ──────────────────────────────────────────────────────────────
  {
    path: 'elevator-dashboard',
    labelKey: 'menu.elevatorDashboard',
    parentKey: 'elevator-management',
    element: <ElevatorDashboard />,
  },
  {
    path: 'elevator-live',
    labelKey: 'menu.elevatorLive',
    parentKey: 'elevator-management',
    element: <ElevatorLive />,
  },
  {
    path: 'elevator-detail',
    labelKey: 'menu.elevatorDetail',
    parentKey: 'elevator-management',
    element: <ElevatorDetail />,
  },
  {
    path: 'elevator-alarms',
    labelKey: 'menu.elevatorAlarms',
    parentKey: 'elevator-management',
    element: <ElevatorAlarms />,
  },
  {
    path: 'elevator-access',
    labelKey: 'menu.elevatorAccess',
    parentKey: 'elevator-management',
    element: <ElevatorAccessControl />,
  },
  {
    path: 'elevator-maintenance',
    labelKey: 'menu.elevatorMaintenance',
    parentKey: 'elevator-management',
    element: <ElevatorMaintenance />,
  },
  {
    path: 'elevator-by-area',
    labelKey: 'menu.elevatorByArea',
    parentKey: 'elevator-management',
    element: <ElevatorByArea />,
  },

  // ── Robot ─────────────────────────────────────────────────────────────────
  {
    path: 'robot-dashboard',
    labelKey: 'menu.robotDashboard',
    parentKey: 'robot-management',
    element: <RobotDashboard />,
  },
  {
    path: 'robot-live-fleet',
    labelKey: 'menu.robotLiveFleet',
    parentKey: 'robot-management',
    element: <RobotLiveFleet />,
  },
  {
    path: 'robot-detail',
    labelKey: 'menu.robotDetail',
    parentKey: 'robot-management',
    element: <RobotDetail />,
  },
  {
    path: 'robot-create-mission',
    labelKey: 'menu.robotCreateMission',
    parentKey: 'robot-management',
    element: <RobotCreateMission />,
  },
  {
    path: 'robot-alerts',
    labelKey: 'menu.robotAlerts',
    parentKey: 'robot-management',
    element: <RobotAlerts />,
  },
  {
    path: 'robot-maintenance',
    labelKey: 'menu.robotMaintenance',
    parentKey: 'robot-management',
    element: <RobotMaintenance />,
  },
  {
    path: 'robot-management',
    labelKey: 'menu.robotManagement',
    parentKey: 'robot-management',
    element: <RobotManagement />,
  },

  // ── Smart Workspace ───────────────────────────────────────────────────────
  {
    path: 'smart-workspace/dashboard',
    labelKey: 'menu.dashboard',
    parentKey: 'smart-workspace',
    element: <WorkspaceDashboard />,
  },
  {
    path: 'smart-workspace/workspace',
    labelKey: 'menu.workspaceRoomList',
    parentKey: 'smart-workspace',
    element: <SmartWorkspace />,
  },
  {
    path: 'smart-workspace/room-detail',
    labelKey: 'menu.roomDetail',
    parentKey: 'smart-workspace',
    element: <WorkspaceRoomDetail />,
  },
  {
    path: 'smart-workspace/booking-calendar',
    labelKey: 'menu.bookingCalendar',
    parentKey: 'smart-workspace',
    element: <WorkspaceBookingCalendar />,
  },
  {
    path: 'smart-workspace/create-booking',
    labelKey: 'menu.createBooking',
    parentKey: 'smart-workspace',
    element: <WorkspaceCreateBooking />,
  },
  {
    path: 'smart-workspace/kiosk',
    labelKey: 'menu.kiosk',
    parentKey: 'smart-workspace',
    element: <WorkspaceKiosk />,
  },
  {
    path: 'smart-workspace/report-issue',
    labelKey: 'menu.reportIssue',
    parentKey: 'smart-workspace',
    element: <WorkspaceReportIssue />,
  },
  {
    path: 'smart-workspace/issue-tickets',
    labelKey: 'menu.issueTickets',
    parentKey: 'smart-workspace',
    // IssueTickets nhận prop — wrap lại để không cần truyền prop từ route config
    element: <WorkspaceIssueTickets defaultSource="workspace" />,
  },

  // ── Smart Meeting Room ────────────────────────────────────────────────────
  {
    path: 'smart-meeting-room/dashboard',
    labelKey: 'menu.dashboard',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomDashboard />,
  },
  {
    path: 'smart-meeting-room/meeting-room',
    labelKey: 'menu.meetingRoomList',
    parentKey: 'smart-meeting-room',
    element: <SmartMeetingRoom />,
  },
  {
    path: 'smart-meeting-room/room-detail',
    labelKey: 'menu.roomDetail',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomDetail />,
  },
  {
    path: 'smart-meeting-room/booking-calendar',
    labelKey: 'menu.bookingCalendar',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomBookingCalendar />,
  },
  {
    path: 'smart-meeting-room/create-booking',
    labelKey: 'menu.createBooking',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomCreateBooking />,
  },
  {
    path: 'smart-meeting-room/kiosk',
    labelKey: 'menu.kiosk',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomKiosk />,
  },
  {
    path: 'smart-meeting-room/report-issue',
    labelKey: 'menu.reportIssue',
    parentKey: 'smart-meeting-room',
    element: <MeetingRoomReportIssue />,
  },
  {
    path: 'smart-meeting-room/issue-tickets',
    labelKey: 'menu.issueTickets',
    parentKey: 'smart-meeting-room',
    element: <MeetingIssueTickets defaultSource="meeting" />,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'user-management',
    labelKey: 'menu.userManagement',
    element: <UserManagement />,
  },
  {
    path: 'devices',
    labelKey: 'menu.deviceManagement',
    element: <DeviceManagement />,
  },
  {
    path: 'account-settings',
    labelKey: 'header.settings',
    element: <AccountSettings />,
  },
  {
    path: 'account-settings/customer/:customerId/users',
    labelKey: 'account.customerUsers',
    element: <CustomerUsersPage />,
  },
  {
    path: 'account-settings/customer/:customerId/assets',
    labelKey: 'account.assets',
    element: <CustomerAssetsPage />,
  },
  {
    path: 'account-settings/customer/:customerId/devices',
    labelKey: 'account.devices',
    element: <CustomerDevicesPage />,
  },
  {
    path: 'account-settings/customer/:customerId/dashboards',
    labelKey: 'account.dashboards',
    element: <CustomerDashboardsPage />,
  },
  {
    path: 'account-settings/customer/:customerId/edges',
    labelKey: 'account.edges',
    element: <CustomerEdgesPage />,
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  {
    path: 'equipment-operation',
    labelKey: 'menu.equipmentOperation',
    element: <EquipmentOperation />,
  },
  {
    path: 'operations/center',
    labelKey: 'menu.operationsCenter',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'operations/alerts',
    labelKey: 'menu.operationsAlerts',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'operations/tasks',
    labelKey: 'menu.operationsTasks',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'operations/building-map',
    labelKey: 'menu.operationsBuildingMap',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'operations/logbook',
    labelKey: 'menu.operationsLogbook',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'operations/shift-handover',
    labelKey: 'menu.operationsShiftHandover',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'governance/reports',
    labelKey: 'menu.governanceReports',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'governance/system-log',
    labelKey: 'menu.governanceSystemLog',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'governance/users-permissions',
    labelKey: 'menu.governanceUsersPermissions',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'governance/system-config',
    labelKey: 'menu.governanceSystemConfig',
    element: <SectionPlaceholderPage />,
  },
  {
    path: 'energy',
    labelKey: 'menu.energyMonitor',
    element: <EnergyMonitor />,
  },

  // ── Dev / Test (merged conditionally from devRoutes.tsx) ──────────────────
  ...(import.meta.env.DEV ? devRoutes : []),
]

function shouldCreateSystemAlias(path: string): boolean {
  return (
    !path.startsWith('system/') &&
    !path.startsWith('operations/') &&
    !path.startsWith('governance/') &&
    !path.startsWith('home/') &&
    !path.startsWith('account-settings/') &&
    path !== 'account-settings' &&
    path !== 'user-management' &&
    !path.startsWith('test-api')
  )
}

// ─── Derived maps (tự động từ routes — không cần cập nhật thủ công) ──────────

/**
 * Map từ pathname → i18n labelKey.
 * Dùng trong useTabStore để hiển thị tên tab.
 * Ví dụ: '/camera-live' → 'menu.cameraLive'
 */
export const routeToLabelKey: Record<string, string> = Object.fromEntries(
  routes.flatMap((r) => {
    const entries: Array<[string, string]> = [[`/${r.path}`, r.labelKey]]
    if (shouldCreateSystemAlias(r.path)) {
      entries.push([`/system/${r.path}`, r.labelKey])
    }
    return entries
  })
)

/**
 * Map từ pathname → parentKey của menu group cha.
 * Dùng trong MiddleSidebar để auto-expand đúng menu khi navigate đến một trang.
 * Ví dụ: '/camera-live' → 'security-camera'
 */
export const routeToParentKey: Record<string, string> = Object.fromEntries(
  routes
    .filter(r => r.parentKey)
    .flatMap((r) => {
      const entries: Array<[string, string]> = [[`/${r.path}`, r.parentKey!]]
      if (shouldCreateSystemAlias(r.path)) {
        entries.push([`/system/${r.path}`, r.parentKey!])
      }
      return entries
    })
)

// ─── Redirect aliases ─────────────────────────────────────────────────────────

/**
 * Các route cũ / alias redirect sang route chính.
 * Tách riêng khỏi routes để không bị đưa vào routeToLabelKey.
 */
export const redirects: Array<{ from: string; to: string }> = [
  { from: 'home', to: DEFAULT_HOME_PATH },
  { from: 'fire-alarm', to: '/fire-alarm-dashboard' },
  { from: 'live-entrance', to: '/vehicle-access-control' },
  { from: 'live-exit', to: '/vehicle-access-control' },
  ...(import.meta.env.DEV ? devRedirects : []),
]

/** Re-export — canonical definition in `@/lib/auth/paths` (must match `App.tsx` `path="login"`). */
export { LOGIN_PATH } from '@/lib/auth/paths'
