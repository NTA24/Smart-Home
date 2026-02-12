import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ParkingManagement from './pages/ParkingManagement'
import DeviceManagement from './pages/DeviceManagement'
import EnergyMonitor from './pages/EnergyMonitor'
import AlarmStatistics from './pages/AlarmStatistics'
import EnergyMonitoring from './pages/EnergyMonitoring'
import EnergyDataCenter from './pages/EnergyDataCenter'
import SecurityMonitoring from './pages/SecurityMonitoring'
import CameraLiveView from './pages/CameraLiveView'
import CameraPlayback from './pages/CameraPlayback'
import EquipmentOperation from './pages/EquipmentOperation'
import VisitorDistribution from './pages/VisitorDistribution'
import PersonnelManagement from './pages/PersonnelManagement'
import RobotManagement from './pages/RobotManagement'
import LuggageControl from './pages/LuggageControl'
import ItemControl from './pages/ItemControl'
import LockerMap from './pages/LockerMap'
import UserManagement from './pages/UserManagement'
import SmartMeetingRoom from './pages/SmartMeetingRoom'
import SmartWorkspace from './pages/SmartWorkspace'
import ElevatorByArea from './pages/ElevatorByArea'
import ElevatorDashboard from './pages/ElevatorDashboard'
import ElevatorLive from './pages/ElevatorLive'
import ElevatorDetail from './pages/ElevatorDetail'
import ElevatorAlarms from './pages/ElevatorAlarms'
import ElevatorAccessControl from './pages/ElevatorAccessControl'
import ElevatorMaintenance from './pages/ElevatorMaintenance'
import RobotDashboard from './pages/RobotDashboard'
import RobotLiveFleet from './pages/RobotLiveFleet'
import RobotDetail from './pages/RobotDetail'
import RobotCreateMission from './pages/RobotCreateMission'
import RobotAlerts from './pages/RobotAlerts'
import RobotMaintenance from './pages/RobotMaintenance'
import EnergyDeviceManagement from './pages/EnergyDeviceManagement'
import ApiTest from './pages/ApiTest'
import CampusTest from './pages/CampusTest'
import BuildingTest from './pages/BuildingTest'
import LiveEntrance from './pages/LiveEntrance'
import LiveExit from './pages/LiveExit'
import EnergyMeterPage from './pages/EnergyMeterPage'
import HvacAssetPage from './pages/HvacAssetPage'
import IaqSensorPage from './pages/IaqSensorPage'
import EnergyAggregatePage from './pages/EnergyAggregatePage'
import EnergyTelemetryPage from './pages/EnergyTelemetryPage'
import IaqTelemetryPage from './pages/IaqTelemetryPage'
import HvacTelemetryPage from './pages/HvacTelemetryPage'
import ParkingMap from './pages/ParkingMap'
import ParkingTickets from './pages/ParkingTickets'
import ParkingSubscription from './pages/ParkingSubscription'
import ParkingDevices from './pages/ParkingDevices'
import {
  SmartBuildingLanding,
  Architecture,
  Journeys,
  Solutions,
  SolutionDetail,
  Investment,
  Implementation,
  Contact,
  ElevatorControl,
} from './pages/smart-building'

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
            <Route path="live-entrance" element={<LiveEntrance />} />
            <Route path="live-exit" element={<LiveExit />} />
            <Route path="parking-map" element={<ParkingMap />} />
            <Route path="parking-tickets" element={<ParkingTickets />} />
            <Route path="parking-subscription" element={<ParkingSubscription />} />
            <Route path="parking-devices" element={<ParkingDevices />} />
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
            <Route path="equipment-operation" element={<EquipmentOperation />} />
            <Route path="visitor-distribution" element={<VisitorDistribution />} />
            {/* Smart Building Management */}
            <Route path="smart-building" element={<SmartBuildingLanding />} />
            <Route path="smart-building/architecture" element={<Architecture />} />
            <Route path="smart-building/journeys" element={<Journeys />} />
            <Route path="smart-building/solutions" element={<Solutions />} />
            <Route path="smart-building/solutions/:slug" element={<SolutionDetail />} />
            <Route path="smart-building/investment" element={<Investment />} />
            <Route path="smart-building/implementation" element={<Implementation />} />
            <Route path="smart-building/contact" element={<Contact />} />
            <Route path="smart-building/elevator-control" element={<ElevatorControl />} />
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
            <Route path="smart-meeting-room/meeting-room" element={<SmartMeetingRoom />} />
            <Route path="smart-workspace/workspace" element={<SmartWorkspace />} />
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
