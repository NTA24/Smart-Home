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
import EquipmentOperation from './pages/EquipmentOperation'
import VisitorDistribution from './pages/VisitorDistribution'
import PersonnelManagement from './pages/PersonnelManagement'
import RobotManagement from './pages/RobotManagement'
import LuggageControl from './pages/LuggageControl'
import UserManagement from './pages/UserManagement'
import SmartMeetingRoom from './pages/SmartMeetingRoom'
import SmartWorkspace from './pages/SmartWorkspace'
import ElevatorByArea from './pages/ElevatorByArea'
import EnergyDeviceManagement from './pages/EnergyDeviceManagement'
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
            <Route path="devices" element={<DeviceManagement />} />
            <Route path="energy" element={<EnergyMonitor />} />
            {/* Detail pages from Dashboard */}
            <Route path="alarm-statistics" element={<AlarmStatistics />} />
            <Route path="energy-monitoring" element={<EnergyMonitoring />} />
            <Route path="energy-data-center" element={<EnergyDataCenter />} />
            <Route path="security-monitoring" element={<SecurityMonitoring />} />
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
            <Route path="energy-device-management" element={<EnergyDeviceManagement />} />
            {/* Management */}
            <Route path="personnel-management" element={<PersonnelManagement />} />
            <Route path="robot-management" element={<RobotManagement />} />
            <Route path="luggage-control" element={<LuggageControl />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="smart-meeting-room/meeting-room" element={<SmartMeetingRoom />} />
            <Route path="smart-workspace/workspace" element={<SmartWorkspace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
