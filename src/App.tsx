import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'
import MainLayout from './layouts/MainLayout'

// Dashboard
import { Home, Dashboard } from './pages/Dashboard'

// Security
import { SecurityMonitoring, CameraLiveView, CameraPlayback, CameraConfig } from './pages/Security'

// Vehicle / Parking
import {
  ParkingManagement, VehicleAccessControl,
  ParkingMap, ParkingTickets, ParkingSubscription, ParkingDevices, VehicleConfig,
} from './pages/Vehicle'

// People
import { PersonnelManagement, VisitorDistribution } from './pages/People'

// Item / Locker
import { ItemControl, LockerMap, LuggageControl } from './pages/Item'

// Energy
import {
  AlarmStatistics, EnergyMonitoring, EnergyDataCenter,
  EnergyMeterPage, HvacAssetPage, IaqSensorPage, EnergyAggregatePage,
  EnergyTelemetryPage, IaqTelemetryPage, HvacTelemetryPage,
  EnergyDeviceManagement,
} from './pages/Energy'

// Elevator
import {
  ElevatorDashboard, ElevatorLive, ElevatorDetail,
  ElevatorAlarms, ElevatorAccessControl, ElevatorMaintenance, ElevatorByArea,
} from './pages/Elevator'

// Robot
import {
  RobotDashboard, RobotLiveFleet, RobotDetail,
  RobotCreateMission, RobotAlerts, RobotMaintenance, RobotManagement,
} from './pages/Robot'

// Workspace
import {
  WorkspaceDashboard, SmartWorkspace, WorkspaceRoomDetail, WorkspaceBookingCalendar,
  WorkspaceCreateBooking, WorkspaceKiosk, WorkspaceReportIssue,
  SmartMeetingRoom, MeetingRoomDashboard, MeetingRoomDetail,
  MeetingRoomBookingCalendar, MeetingRoomCreateBooking, MeetingRoomKiosk, MeetingRoomReportIssue, IssueTickets,
} from './pages/Workspace'

// Admin
import { UserManagement, DeviceManagement } from './pages/Admin'

// Other
import { EquipmentOperation, EnergyMonitor } from './pages/Other'

// Test
import { ApiTest, CampusTest, BuildingTest } from './pages/Test'


const locales = {
  en: enUS,
  vi: viVN,
}

function App() {
  const { i18n } = useTranslation()
  const currentLocale = locales[i18n.language as keyof typeof locales] || enUS

  return (
    <ConfigProvider
      locale={currentLocale}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="parking" element={<ParkingManagement />} />
            <Route path="vehicle-access-control" element={<VehicleAccessControl />} />
            <Route path="live-entrance" element={<Navigate to="/vehicle-access-control" replace />} />
            <Route path="live-exit" element={<Navigate to="/vehicle-access-control" replace />} />
            <Route path="parking-map" element={<ParkingMap />} />
            <Route path="parking-tickets" element={<ParkingTickets />} />
            <Route path="parking-subscription" element={<ParkingSubscription />} />
            <Route path="parking-devices" element={<ParkingDevices />} />
            <Route path="vehicle-config" element={<VehicleConfig />} />
            <Route path="devices" element={<DeviceManagement />} />
            <Route path="energy" element={<EnergyMonitor />} />
            {/* Detail pages from Dashboard */}
            <Route path="alarm-statistics" element={<AlarmStatistics />} />
            <Route path="energy-monitoring" element={<EnergyMonitoring />} />
            <Route path="energy-data-center" element={<EnergyDataCenter />} />
            <Route path="energy-meters" element={<EnergyMeterPage />} />
            <Route path="hvac-assets" element={<HvacAssetPage />} />
            <Route path="iaq-sensors" element={<IaqSensorPage />} />
            <Route path="energy-aggregates" element={<EnergyAggregatePage />} />
            <Route path="energy-telemetry" element={<EnergyTelemetryPage />} />
            <Route path="iaq-telemetry" element={<IaqTelemetryPage />} />
            <Route path="hvac-telemetry" element={<HvacTelemetryPage />} />
            <Route path="security-monitoring" element={<SecurityMonitoring />} />
            <Route path="camera-live" element={<CameraLiveView />} />
            <Route path="camera-playback" element={<CameraPlayback />} />
            <Route path="camera-config" element={<CameraConfig />} />
            <Route path="equipment-operation" element={<EquipmentOperation />} />
            <Route path="visitor-distribution" element={<VisitorDistribution />} />

            <Route path="elevator-by-area" element={<ElevatorByArea />} />
            <Route path="elevator-dashboard" element={<ElevatorDashboard />} />
            <Route path="elevator-live" element={<ElevatorLive />} />
            <Route path="elevator-detail" element={<ElevatorDetail />} />
            <Route path="elevator-alarms" element={<ElevatorAlarms />} />
            <Route path="elevator-access" element={<ElevatorAccessControl />} />
            <Route path="elevator-maintenance" element={<ElevatorMaintenance />} />
            <Route path="robot-dashboard" element={<RobotDashboard />} />
            <Route path="robot-live-fleet" element={<RobotLiveFleet />} />
            <Route path="robot-detail" element={<RobotDetail />} />
            <Route path="robot-create-mission" element={<RobotCreateMission />} />
            <Route path="robot-alerts" element={<RobotAlerts />} />
            <Route path="robot-maintenance" element={<RobotMaintenance />} />
            <Route path="energy-device-management" element={<EnergyDeviceManagement />} />
            {/* Management */}
            <Route path="personnel-management" element={<PersonnelManagement />} />
            <Route path="robot-management" element={<RobotManagement />} />
            <Route path="luggage-control" element={<LuggageControl />} />
            <Route path="item-control" element={<ItemControl />} />
            <Route path="locker-map" element={<LockerMap />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="smart-meeting-room/dashboard" element={<MeetingRoomDashboard />} />
            <Route path="smart-meeting-room/meeting-room" element={<SmartMeetingRoom />} />
            <Route path="smart-meeting-room/room-detail" element={<MeetingRoomDetail />} />
            <Route path="smart-meeting-room/booking-calendar" element={<MeetingRoomBookingCalendar />} />
            <Route path="smart-meeting-room/create-booking" element={<MeetingRoomCreateBooking />} />
            <Route path="smart-meeting-room/kiosk" element={<MeetingRoomKiosk />} />
            <Route path="smart-meeting-room/report-issue" element={<MeetingRoomReportIssue />} />
            <Route path="smart-meeting-room/issue-tickets" element={<IssueTickets defaultSource="meeting" />} />
            <Route path="smart-workspace/dashboard" element={<WorkspaceDashboard />} />
            <Route path="smart-workspace/workspace" element={<SmartWorkspace />} />
            <Route path="smart-workspace/room-detail" element={<WorkspaceRoomDetail />} />
            <Route path="smart-workspace/booking-calendar" element={<WorkspaceBookingCalendar />} />
            <Route path="smart-workspace/create-booking" element={<WorkspaceCreateBooking />} />
            <Route path="smart-workspace/kiosk" element={<WorkspaceKiosk />} />
            <Route path="smart-workspace/report-issue" element={<WorkspaceReportIssue />} />
            <Route path="smart-workspace/issue-tickets" element={<IssueTickets defaultSource="workspace" />} />
            {/* API Testing */}
            <Route path="api-test" element={<Navigate to="/test-api" replace />} />
            <Route path="test-api" element={<ApiTest />} />
            <Route path="test-api/campuses/:tenantId" element={<CampusTest />} />
            <Route path="test-api/buildings/:campusId" element={<BuildingTest />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
