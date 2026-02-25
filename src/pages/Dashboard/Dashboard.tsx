import { useState } from 'react'
import { Row, Col, Typography, Select, Tag, Badge } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ThunderboltOutlined,
  TeamOutlined,
  WarningOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { PieChart, LineChart, PageContainer, PageHeader, ContentCard, ChartCard } from '@/components'
import { useBuildingStore } from '@/stores'
import building3dImage from '@/assets/building-3d.png'

const { Text } = Typography

function StatCard({
  icon,
  iconBg,
  title,
  value,
  unit,
  subText,
  trend,
  trendUp,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  unit?: string
  subText?: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <ContentCard
      size="small"
      className="dashboard_stat-card dashboard_card--full-height"
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div className="dashboard_stat-row">
        <div className="dashboard_stat-icon" style={{ background: iconBg }}>
          {icon}
        </div>
        <div className="dashboard_stat-body">
          <Text className="dashboard_stat-label">{title}</Text>
          <div className="dashboard_value-row">
            <span className="dashboard_value">{value}</span>
            {unit && <span className="dashboard_unit">{unit}</span>}
          </div>
          {subText && (
            <div className="text-11 mt-2" style={{ color: trendUp !== undefined ? (trendUp ? '#52c41a' : '#f5222d') : '#8c8c8c' }}>
              {trendUp !== undefined && (trendUp ? '▲ ' : '▼ ')}
              {subText}
              {trend && (
                <span className="ml-6">
                  {trend}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </ContentCard>
  )
}

function AlarmCount({ count, label, color, bgColor }: { count: number; label: string; color: string; bgColor: string }) {
  return (
    <div className="dashboard_alarm-wrap">
      <div className="dashboard_alarm-badge" style={{ background: bgColor, color }}>
        {count}
      </div>
      <Text className="dashboard_alarm-label">{label}</Text>
    </div>
  )
}

function AlertItem({ 
  type, 
  title, 
  location, 
  status,
  extra
}: { 
  type: 'A' | 'B'
  title: string
  location: string
  status?: string
  extra?: string
}) {
  return (
    <div className="dashboard_alert-row">
      <div className="dashboard_alert-type-badge" style={{ background: type === 'A' ? '#ff4d4f' : '#faad14' }}>
        {type}
      </div>
      <div className="dashboard_alert-body">
        <div className="dashboard_alert-title">{title}</div>
        <div className="dashboard_alert-location">{location}</div>
        {extra && <div className="dashboard_alert-extra">{extra}</div>}
      </div>
      {status && (
        <Tag color="green" className="tag--no-margin text-xs">● {status}</Tag>
      )}
    </div>
  )
}

function ZoneInfo({ zone, temp, power, co2 }: { zone: string; temp: string; power: string; co2?: string }) {
  return (
    <div className="dashboard_zone-card">
      <div className="dashboard_zone-header">
        <EnvironmentOutlined className="text-primary" />
        <span className="font-semibold">{zone}</span>
      </div>
      <div className="dashboard_zone-meta">
        🌡 {temp} &nbsp; ⚡ {power}
        {co2 && <span> &nbsp; CO2: {co2}</span>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [activeTab, setActiveTab] = useState('energy')

  const energyBreakdownData = [
    { name: 'HVAC', value: 64, color: '#1890ff' },
    { name: 'Lighting', value: 20, color: '#faad14' },
    { name: 'Plug Load', value: 10, color: '#52c41a' },
    { name: 'Other', value: 6, color: '#722ed1' },
  ]

  const assetCategories = ['2:00', '6:00', '10:00', '14:00', '16:00', '2']
  const assetSeries = [
    { name: 'kWh', data: [80, 120, 180, 220, 200, 160], color: '#1890ff' }
  ]

  return (
    <PageContainer>
      <PageHeader
        title={selectedBuilding?.name || t('dashboard.mainOfficeBuilding')}
        icon={
          <div className="dashboard_header-icon">
            <EnvironmentOutlined className="text-white text-lg" />
          </div>
        }
        subtitle={<><ClockCircleOutlined /> {t('dashboard.lastUpdated')}: 11:25</>}
        actions={
          <>
            <Select defaultValue="main" style={{ width: 180 }} size="middle">
              <Select.Option value="main">{t('dashboard.mainOfficeBuilding')}</Select.Option>
              <Select.Option value="tower">Viettel Tower</Select.Option>
            </Select>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">{t('dashboard.allFloors')}</Select.Option>
              <Select.Option value="1">{t('dashboard.floor')} 1</Select.Option>
              <Select.Option value="2">{t('dashboard.floor')} 2</Select.Option>
            </Select>
            <Select defaultValue="today" style={{ width: 100 }}>
              <Select.Option value="today">{t('dashboard.today')}</Select.Option>
              <Select.Option value="week">{t('dashboard.thisWeek')}</Select.Option>
            </Select>
            <Select defaultValue="10" style={{ width: 100 }}>
              <Select.Option value="10">10 {t('dashboard.day')}</Select.Option>
              <Select.Option value="30">30 {t('dashboard.day')}</Select.Option>
            </Select>
            {[t('menu.energy'), t('menu.comfort'), t('menu.safety'), t('menu.operations')].map((tab, i) => (
              <Tag key={tab} color={i === 0 ? 'blue' : undefined} className={`dashboard_tab-tag ${i === 0 ? 'font-semibold' : ''}`}>
                {tab}
              </Tag>
            ))}
          </>
        }
      />

      {/* Stats Row */}
      <Row gutter={[12, 12]} className="mb-16">
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<ThunderboltOutlined />}
            iconBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title={t('dashboard.powerNow')}
            value="168"
            unit="kW"
            subText={`${t('dashboard.peak')}: 264 kW`}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<ThunderboltOutlined />}
            iconBg="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            title={t('dashboard.todayEnergy')}
            value="1,542"
            unit="kWh"
            subText={t('dashboard.sinceYesterday', { percent: '5,2' })}
            trendUp={true}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<TeamOutlined />}
            iconBg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            title={t('dashboard.occupancyNow')}
            value="432"
            unit={t('dashboard.people')}
            subText={`${t('dashboard.utilization')}: 67%`}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <ContentCard size="small" className="dashboard_stat-card dashboard_card--full-height" bodyStyle={{ padding: '16px 20px' }}>
            <Text className="dashboard_stat-label">{t('dashboard.iaqComfortIndex')}</Text>
            <div className="dashboard_value-row gap-8 mt-4">
              <span className="dashboard_value">92</span>
              <Tag color="success" className="rounded-xl font-semibold">{t('dashboard.good')}</Tag>
            </div>
          </ContentCard>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <ContentCard size="small" className="dashboard_stat-card dashboard_card--full-height" bodyStyle={{ padding: '16px 20px' }}>
            <Text className="dashboard_stat-label">{t('dashboard.openAlarms')}</Text>
            <div className="flex gap-8 mt-8">
              <AlarmCount count={3} label={t('dashboard.critical')} color="#fff" bgColor="#ff4d4f" />
              <AlarmCount count={3} label={t('dashboard.high')} color="#fff" bgColor="#fa8c16" />
              <AlarmCount count={2} label={t('dashboard.med')} color="#fff" bgColor="#fadb14" />
              <AlarmCount count={6} label={t('dashboard.low')} color="#1890ff" bgColor="#e6f7ff" />
              <AlarmCount count={15} label="" color="#8c8c8c" bgColor="#f5f5f5" />
            </div>
          </ContentCard>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <ContentCard size="small" className="dashboard_stat-card dashboard_card--full-height" bodyStyle={{ padding: '16px 20px' }}>
            <div className="flex-between">
              <Text className="dashboard_stat-label">{t('dashboard.workOrders')}</Text>
              <a className="text-11">{t('dashboard.viewDetails')}</a>
            </div>
            <div className="flex items-center gap-12 mt-8">
              <div>
                <span className="dashboard_work-order-badge">5</span>
                <span className="text-sm ml-4">5 {t('dashboard.open')}</span>
              </div>
              <div>
                <span className="text-xl font-semibold">2</span>
                <span className="text-11 text-danger ml-4">{t('dashboard.overdue')}</span>
              </div>
            </div>
          </ContentCard>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[12, 12]} className="flex items-stretch">
        {/* Left - Building Visualization */}
        <Col xs={24} lg={12} className="flex">
          <ContentCard className="dashboard_card" bodyStyle={{ padding: 16 }}>
            {/* Header with Building icon and Tabs */}
            <div className="dashboard_building-header">
              <div className="dashboard_building-title-row">
                <div className="dashboard_building-icon">
                  <EnvironmentOutlined className="text-white text-md" />
                </div>
                <span className="font-semibold text-md">{t('dashboard.building')}</span>
              </div>
              <div className="dashboard_building-tabs">
                {[t('dashboard.occupancy'), t('dashboard.temperature'), 'CO₂', t('dashboard.power')].map((tab, i) => (
                  <Tag
                    key={tab}
                    color={i === 0 ? 'blue' : undefined}
                    className={`dashboard_building-tab ${i === 0 ? 'dashboard_building-tab--active' : 'dashboard_building-tab--inactive'}`}
                  >
                    {tab}
                  </Tag>
                ))}
              </div>
              <span className="ml-auto text-muted">⋮</span>
            </div>

            {/* Floor Controls */}
            <div className="dashboard_floor-controls">
              <Tag className="dashboard_floor-tag">
                <span className="text-sm">①</span> {t('dashboard.first')}
              </Tag>
              <div className="flex gap-8">
                <span className="text-muted">🚩</span>
                <span className="text-muted">❄️</span>
                <span className="text-muted">📊</span>
              </div>
            </div>

            {/* Temperature Scale */}
            <div className="dashboard_temp-scale">
              <span className="dashboard_temp-legend">&lt; 20°C</span>
              <div className="dashboard_temp-bar" />
              <span className="text-11 text-primary">±74.7°C</span>
            </div>

            {/* 3D Building Visualization with Overlays */}
            <div className="dashboard_viz-wrap">
              <img src={building3dImage} alt="Building 3D View" className="dashboard_viz-img" />
              
              {/* Overlay Info Cards */}
              <div className="dashboard_overlay-card dashboard_overlay-card--warning absolute" style={{ top: '20%', left: '25%' }}>
                <div className="dashboard_overlay-row">
                  <span className="dashboard_overlay-badge dashboard_overlay-badge--warning">24%</span>
                  <span className="dashboard_overlay-value">26 kW</span>
                </div>
                <div className="dashboard_overlay-sub text-success">{t('dashboard.occupied')} 10 {t('dashboard.people')}</div>
              </div>

              <div className="dashboard_overlay-card dashboard_overlay-card--success absolute" style={{ top: '15%', right: '15%' }}>
                <div className="dashboard_overlay-row">
                  <CheckCircleOutlined className="text-success" />
                  <span className="dashboard_overlay-value">23 kW</span>
                </div>
                <div className="dashboard_overlay-sub text-success">{t('dashboard.occupied')} 8 {t('dashboard.people')}</div>
              </div>

              <div className="dashboard_overlay-card dashboard_overlay-card--primary absolute" style={{ bottom: '35%', left: '10%' }}>
                <div className="dashboard_overlay-row">
                  <CheckCircleOutlined />
                  <span className="dashboard_overlay-value">22 {t('dashboard.people')}</span>
                </div>
                <div className="dashboard_overlay-sub opacity-90">{t('dashboard.occupied')} 12 {t('dashboard.people')}</div>
              </div>

              <div className="dashboard_overlay-card dashboard_overlay-card--cyan absolute" style={{ bottom: '30%', left: '40%' }}>
                <div className="dashboard_overlay-row">
                  <CheckCircleOutlined />
                  <span className="dashboard_overlay-value">14 {t('dashboard.people')}</span>
                </div>
                <div className="dashboard_overlay-sub opacity-90">{t('dashboard.occupied')} 12 {t('dashboard.people')}</div>
              </div>

              {/* Zone Info Panel */}
              <div className="dashboard_zone-panel">
                <div className="dashboard_zone-panel-header">
                  <div className="dashboard_zone-panel-row">
                    <EnvironmentOutlined className="text-primary text-md" />
                    <span className="font-semibold text-base">{t('dashboard.zone')} A</span>
                  </div>
                  <span className="text-success text-11 font-medium">⚡ 4:07 E</span>
                </div>
                <div className="dashboard_zone-panel-green">
                  <span>🌡</span>
                  <span className="font-medium">23.3°C / ≈ 74°F</span>
                </div>
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-4">
                    <span className="text-muted">{t('dashboard.power')}</span>
                    <span className="font-semibold text-primary">5.9 kW</span>
                  </div>
                  <div className="dashboard_zone-badge">
                    📊 5%
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Temperature Legend */}
            <div className="dashboard_bottom-legend">
              <div className="dashboard_legend-item">
                <div className="dashboard_legend-bar dashboard_legend-bar--cool" />
                <span className="dashboard_temp-legend">&gt; 20°C</span>
              </div>
              <div className="dashboard_legend-item">
                <div className="dashboard_legend-bar dashboard_legend-bar--warm" />
                <span className="dashboard_temp-legend">≈ 25°C</span>
              </div>
            </div>
          </ContentCard>
        </Col>

        {/* Center - Alerts & Energy */}
        <Col xs={24} lg={6} className="flex flex-col">
          {/* Live Alerts Feed */}
          <ContentCard
            title={t('dashboard.liveAlertsFeed')}
            titleExtra={<a>&gt;</a>}
            className="dashboard_stat-card mb-12 flex-1"
            bodyStyle={{ padding: 12 }}
          >
            <div className="flex gap-8 mb-12">
              <Tag color="red">{t('dashboard.critical')}</Tag>
              <Tag>{t('dashboard.high')}</Tag>
              <Tag color="green">✓ {t('dashboard.acknowledged')}</Tag>
            </div>
            <div className="flex justify-end text-11 text-muted mb-8">
              🕐 2 Apm -234
            </div>

            {/* HVAC Stats */}
            <div className="dashboard_hvac-box">
              <div className="dashboard_hvac-header">
                <Badge status="processing" />
                <span className="font-semibold">{t('dashboard.hvac')}</span>
                <span className="text-sm text-muted">24 kWh</span>
                <Tag color="blue" className="ml-auto">▲ 88%</Tag>
              </div>
              <div className="text-3xl font-bold dashboard_text-dark">1,542 kWh</div>
            </div>

            {/* Energy Legend */}
            <div className="dashboard_energy-legend">
              <span><span className="text-primary">■</span> {t('dashboard.hvac')}</span>
              <span><span className="text-warning">■</span> {t('dashboard.lighting')}</span>
            </div>
            <div className="dashboard_energy-legend mt-4">
              <span><span className="text-success">■</span> 20% kWh</span>
              <span><span className="text-purple">■</span> {t('dashboard.other')}</span>
            </div>
            <div className="text-right mt-8">
              <a className="text-11">{t('dashboard.today')} &gt;</a>
            </div>
          </ContentCard>

          {/* Bottom Stats */}
          <ContentCard className="dashboard_stat-card" bodyStyle={{ padding: 12 }}>
            <Row gutter={8}>
              <Col span={8} className="text-center">
                <TeamOutlined className="text-xl text-primary" />
                <div className="text-lg font-semibold dashboard_text-dark">2</div>
                <div className="text-xs text-muted">{t('dashboard.technicians')}</div>
              </Col>
              <Col span={8} className="text-center">
                <ToolOutlined className="text-xl text-warning" />
                <div className="text-lg font-semibold dashboard_text-dark">9</div>
                <div className="text-xs text-muted">{t('dashboard.pendingTasks')}</div>
              </Col>
              <Col span={8} className="text-center">
                <WarningOutlined className="text-xl text-danger" />
                <div className="text-lg font-semibold dashboard_text-dark">2</div>
                <div className="text-xs text-muted">{t('dashboard.urgentAlerts')}</div>
              </Col>
            </Row>
          </ContentCard>
        </Col>

        {/* Right - Alerts List */}
        <Col xs={24} lg={6} className="flex">
          <ContentCard className="dashboard_card" bodyStyle={{ padding: 12 }}>
            <AlertItem 
              type="A" 
              title={t('dashboard.waterLeakDetected')} 
              location={`B4 ${t('dashboard.electricalRoom')}`}
              status={t('dashboard.open')}
            />
            <AlertItem 
              type="A" 
              title={t('dashboard.highCo2Level')} 
              location={t('dashboard.meetingRoomB')}
              extra="⚡ 7 kWh"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.ahuFaultChillerPumpFail')} 
              location={`B1 AHU-2 - ${t('dashboard.ticketInProgress')}`}
              extra="⏱ 5 in age"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.ahuFaultChillerPumpFail')} 
              location={`B1 AHU-2 - ${t('dashboard.ticketInProgress')}`}
              extra="⏱ 5 in age"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.accessDeniedRepeatedly')} 
              location={t('dashboard.lobbyMainEntrance')}
              status={t('dashboard.open')}
            />

          </ContentCard>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[12, 12]} className="mt-12 flex items-stretch">
        {/* Asset Health */}
        <Col xs={24} sm={12} lg={6} className="flex">
          <ContentCard
            title={<><span className="font-semibold">{t('dashboard.assetHealth')}</span> <Tag>{t('dashboard.today')}</Tag></>}
            titleExtra={<div><Tag>KW</Tag> <Tag color="blue">kWh</Tag></div>}
            className="dashboard_card"
            bodyStyle={{ padding: 12 }}
          >
            <div className="text-11 text-muted mb-8">
              <span className="text-primary">●</span> {t('dashboard.kwhAccumulated')} &nbsp;
              <span className="text-success">●</span> kWh ■ {t('dashboard.kwhAccumulated')}
            </div>
            <LineChart title="" categories={assetCategories} series={assetSeries} height={120} showArea={true} />
            <div className="text-xs text-muted mt-4">
              &gt; 00°C
            </div>
          </ContentCard>
        </Col>

        {/* Energy Breakdown */}
        <Col xs={24} sm={12} lg={6} className="flex">
          <ChartCard
            title={t('dashboard.energyBreakdown')}
            extra={<span className="text-11 text-muted">{t('dashboard.today')} ☁</span>}
            className="dashboard_card"
          >
            <Text className="text-11 text-muted">{t('dashboard.todaysEnergy')}</Text>
            <Row gutter={12} className="mt-8">
              <Col span={14}>
                <div className="text-11">
                  <div className="flex-between items-center mb-4">
                    <span><span className="text-primary">■</span> {t('dashboard.hvac')}</span>
                    <span className="font-semibold ml-8">64%</span>
                  </div>
                  <div className="flex-between items-center mb-4">
                    <span><span className="text-warning">■</span> {t('dashboard.lighting')}</span>
                    <span className="font-semibold ml-8">20%</span>
                  </div>
                  <div className="flex-between items-center mb-4">
                    <span><span className="text-success">■</span> {t('dashboard.plugLoad')}</span>
                    <span className="font-semibold ml-8">10%</span>
                  </div>
                  <div className="flex-between items-center">
                    <span><span className="text-purple">■</span> {t('dashboard.other')}</span>
                    <span className="font-semibold ml-8">6%</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="relative text-center">
                  <PieChart title="" data={energyBreakdownData} height={130} showLegend={false} innerRadius="50%" outerRadius="85%" />
                  <div className="dashboard_pie-center">
                    <div className="text-xs text-muted">304 kWh</div>
                    <div className="text-md font-bold text-success">1,542 kWh</div>
                  </div>
                </div>
              </Col>
            </Row>
          </ChartCard>
        </Col>

        {/* HVAC Performance */}
        <Col xs={24} sm={12} lg={6} className="flex">
          <ContentCard
            title={t('dashboard.hvacPerformance')}
            titleExtra={<span className="text-md">✏ ○</span>}
            className="dashboard_card"
            bodyStyle={{ padding: 12 }}
          >
            <div className="flex justify-center gap-20 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">23<span className="text-md">°C</span></div>
                <div className="text-xs text-muted">▲ O%T</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">23.6<span className="text-md">°C</span></div>
              </div>
            </div>
            <div className="text-11 text-muted mb-8">
              {t('dashboard.setpoint')}: &lt;23°C
            </div>
            <Row gutter={8}>
              <Col span={12}>
                <div className="dashboard_bottom-stat-box">
                  <div className="text-xs text-muted">{t('dashboard.ahus')}</div>
                  <div className="font-semibold">🏃 4/5 {t('dashboard.running')}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="dashboard_bottom-stat-box">
                  <div className="text-xs text-muted">{t('dashboard.chillers')}</div>
                  <div className="font-semibold">🏃 2/2 {t('dashboard.running')}</div>
                </div>
              </Col>
            </Row>
            <div className="flex justify-center gap-20 mt-12 text-11 text-muted">
              <span>🔧 4.05</span>
              <span>📊 23</span>
              <span>📁 13</span>
            </div>
          </ContentCard>
        </Col>

        {/* Parking & EV Charging */}
        <Col xs={24} sm={12} lg={6} className="flex">
          <ContentCard
            title={t('dashboard.parkingEvCharging')}
            className="dashboard_card"
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div className="text-11 text-muted">{t('dashboard.availableSpots')}</div>
                <div className="text-3xl font-bold text-primary">85</div>
              </Col>
              <Col span={12}>
                <div className="text-11 text-muted">{t('dashboard.totalInOut')}</div>
                <div className="text-3xl font-bold text-success">178</div>
              </Col>
            </Row>
            <div className="text-11 text-muted mt-8 p-8 dashboard_hvac-box">
              {t('dashboard.vehiclesIn')}: <strong>178</strong> | {t('dashboard.vehiclesOutLabel')}: <strong>162</strong>
            </div>
            
            {/* EV Charging Status */}
            <div className="mt-12">
              <div className="text-11 text-muted mb-4">{t('dashboard.evChargingStatus')}</div>
              <div className="flex gap-8 justify-center">
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    className="dashboard_ev-slot"
                    style={{ background: i <= 3 ? '#1890ff' : '#e8e8e8' }}
                  >
                    <CarOutlined style={{ color: i <= 3 ? '#fff' : '#8c8c8c', fontSize: 14 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-16 mt-4 text-xs text-muted">
                <span><span className="text-primary">●</span> {t('dashboard.charging')}: 3</span>
                <span><span style={{ color: '#e8e8e8' }}>●</span> {t('dashboard.availableChargers')}: 2</span>
              </div>
            </div>
            
            {/* Summary */}
            <Row gutter={8} className="mt-12">
              <Col span={12}>
                <div className="dashboard_bottom-stat-box">
                  <div className="text-xs text-muted">{t('dashboard.totalVehicles')}</div>
                  <div className="font-semibold">🚗 252</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="dashboard_bottom-stat-box text-center" style={{ background: '#e6f7ff' }}>
                  <div className="text-xs text-muted">{t('dashboard.evPower')}</div>
                  <div className="font-semibold text-primary">⚡ 262 kW</div>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
