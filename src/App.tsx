import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import ParkingManagement from './pages/ParkingManagement'
import DeviceManagement from './pages/DeviceManagement'
import EnergyMonitor from './pages/EnergyMonitor'
import AlarmStatistics from './pages/AlarmStatistics'
import EnergyMonitoring from './pages/EnergyMonitoring'
import EquipmentOperation from './pages/EquipmentOperation'
import VisitorDistribution from './pages/VisitorDistribution'
import {
  SmartBuildingLanding,
  Architecture,
  Journeys,
  Solutions,
  SolutionDetail,
  Investment,
  Implementation,
  Contact,
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="parking" element={<ParkingManagement />} />
            <Route path="devices" element={<DeviceManagement />} />
            <Route path="energy" element={<EnergyMonitor />} />
            {/* Detail pages from Dashboard */}
            <Route path="alarm-statistics" element={<AlarmStatistics />} />
            <Route path="energy-monitoring" element={<EnergyMonitoring />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
