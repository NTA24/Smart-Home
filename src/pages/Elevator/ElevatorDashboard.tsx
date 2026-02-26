import { useState } from 'react'
import {
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Select,
  Button,
  Space,
  Timeline,
  Tooltip,
} from 'antd'
import {
  DashboardOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  BellOutlined,
  UserOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'
import { PageContainer, PageHeader, ContentCard, FilterBar, SearchInput } from '@/components'

const { Text } = Typography

// Mock KPI data
const kpiData = {
  elevatorsOnline: 12,
  elevatorsTotal: 12,
  alarmsCritical: 0,
  alarmsWarning: 2,
  avgWaitTime: 28,
  avgTravelTime: 42,
  totalTrips: 9240,
  downtimeMonth: '1h 15m',
}

// Mock wait time by hour (deterministic)
const WAIT_TIMES = [10, 9, 7, 6, 7, 9, 15, 32, 42, 38, 28, 22, 20, 18, 22, 26, 30, 38, 45, 34, 24, 18, 14, 11]
const waitTimeByHour = WAIT_TIMES.map((wait, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  wait,
}))

// Mock trips by floor (deterministic)
const FLOOR_TRIPS = [682, 853, 1858, 1122, 1112, 970, 482, 477, 212, 472]
const tripsByFloor = FLOOR_TRIPS.map((trips, i) => ({
  floor: i === 0 ? 'B2' : i === 1 ? 'B1' : i === 2 ? 'G' : `${i - 2}F`,
  trips,
}))

export default function ElevatorDashboard() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [timeRange, setTimeRange] = useState('Today')
  const [searchElevator, setSearchElevator] = useState('')

  const timeRanges = [t('elevatorDash.timeToday'), t('elevatorDash.timeWeek'), t('elevatorDash.timeMonth')]
  const alarmTypes = [
    { type: t('elevatorDash.alarmDoorObstruction'), count: 8, color: '#fa8c16' },
    { type: t('elevatorDash.alarmOverload'), count: 4, color: '#f5222d' },
    { type: t('elevatorDash.alarmCommLoss'), count: 3, color: '#722ed1' },
    { type: t('elevatorDash.alarmEmergencyStop'), count: 2, color: '#ff4d4f' },
    { type: t('elevatorDash.alarmMotorFault'), count: 1, color: '#8c8c8c' },
  ]
  const recentEvents = [
    { id: '1', time: '10:32', elevator: 'E03', event: t('elevatorDash.eventDoorObstructionCleared'), severity: 'info', ago: '10m' },
    { id: '2', time: '08:00', elevator: 'Bank B', event: t('elevatorDash.eventUpPeakEnabled'), severity: 'info', ago: '2h 42m' },
    { id: '3', time: '07:45', elevator: 'E07', event: t('elevatorDash.eventOverloadDetected'), severity: 'warning', ago: '2h 57m' },
    { id: '4', time: '07:30', elevator: 'E01', event: t('elevatorDash.eventScheduledMaintenance'), severity: 'info', ago: '3h 12m' },
    { id: '5', time: '06:15', elevator: 'E12', event: t('elevatorDash.eventCommTimeout'), severity: 'warning', ago: '4h 27m' },
    { id: '6', time: '23:50', elevator: 'E05', event: t('elevatorDash.eventNightMode'), severity: 'info', ago: '11h' },
    { id: '7', time: '22:10', elevator: 'E09', event: t('elevatorDash.eventEmergencyFalseAlarm'), severity: 'critical', ago: '12h 32m' },
  ]

  const maxTrips = Math.max(...tripsByFloor.map(f => f.trips))

  return (
    <PageContainer>
      <PageHeader
        title={t('elevatorDash.title')}
        icon={<DashboardOutlined />}
        subtitle={selectedBuilding?.name || t('elevatorDash.allSites')}
        actions={
          <FilterBar>
            <Select value={timeRange} onChange={setTimeRange} className="elevator_select-130"
              options={timeRanges.map(r => ({ value: r, label: r }))}
            />
            <SearchInput
              placeholder={t('elevatorDash.searchElevator')}
              value={searchElevator}
              onChange={setSearchElevator}
              width={180}
            />
            <Tooltip title={t('elevatorDash.alerts')}>
              <Badge count={kpiData.alarmsWarning} size="small">
                <Button icon={<BellOutlined />} shape="circle" />
              </Badge>
            </Tooltip>
            <Tooltip title={t('elevatorDash.profile')}>
              <Button icon={<UserOutlined />} shape="circle" />
            </Tooltip>
          </FilterBar>
        }
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-16" align="stretch">
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="mb-0 elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.elevatorsOnline')}
              value={kpiData.elevatorsOnline}
              suffix={`/ ${kpiData.elevatorsTotal}`}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.activeAlarms')}
              valueRender={() => (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                  <Text strong style={{ color: kpiData.alarmsCritical > 0 ? '#f5222d' : '#52c41a', fontSize: 24 }}>
                    {kpiData.alarmsCritical}
                  </Text>
                  <Text className="text-xs text-muted">{t('elevatorDash.critical')}</Text>
                  <Text strong style={{ color: '#fa8c16', fontSize: 18, marginLeft: 4 }}>
                    {kpiData.alarmsWarning}
                  </Text>
                  <Text className="text-xs text-muted">{t('elevatorDash.warningLabel')}</Text>
                </div>
              )}
              prefix={<AlertOutlined className="text-warning" />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.avgWaitTime')}
              value={kpiData.avgWaitTime}
              suffix="s"
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              prefix={<ClockCircleOutlined />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.avgTravelTime')}
              value={kpiData.avgTravelTime}
              suffix="s"
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
              prefix={<ArrowUpOutlined />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.totalTrips')}
              value={kpiData.totalTrips}
              valueStyle={{ fontSize: 24 }}
              prefix={<ArrowDownOutlined />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={8} lg={4} style={{ display: 'flex' }}>
          <ContentCard className="elevator_kpi-card" bodyStyle={{ padding: '16px' }} style={{ width: '100%' }}>
            <Statistic
              title={t('elevatorDash.downtimeMonth')}
              value={kpiData.downtimeMonth}
              valueStyle={{ color: '#fa8c16', fontSize: 24 }}
              prefix={<ThunderboltOutlined />}
            />
          </ContentCard>
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} className="mb-16" align="stretch">
        {/* Wait time by hour */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <ContentCard
            title={t('elevatorDash.waitTimeByHour')}
            titleIcon={<ClockCircleOutlined />}
            titleIconColor="#1890ff"
            bodyStyle={{ padding: '12px 16px' }}
            style={{ width: '100%' }}
          >
            {(() => {
              const maxWait = Math.max(...waitTimeByHour.map(w => w.wait))
              return (
                <div>
                  <div className="elevator_chart-bars">
                    {waitTimeByHour.map((item, i) => {
                      const h = (item.wait / maxWait) * 150
                      const isPeak = (i >= 7 && i <= 9) || (i >= 17 && i <= 19)
                      return (
                        <Tooltip key={i} title={`${item.hour}: ${item.wait}s`}>
                          <div className="elevator_chart-bar-col">
                            <div
                              className="elevator_chart-bar"
                              style={{
                                height: h,
                                background: isPeak ? 'linear-gradient(180deg, #ff7a45 0%, #fa541c 100%)' : 'linear-gradient(180deg, #69c0ff 0%, #1890ff 100%)',
                              }}
                            />
                          </div>
                        </Tooltip>
                      )
                    })}
                  </div>
                  <div className="elevator_chart-labels">
                    {waitTimeByHour.map((item, i) => (
                      <div key={i} className="elevator_chart-label">
                        {i % 3 === 0 ? item.hour.split(':')[0] : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            <div className="flex justify-center gap-20 mt-8">
              <Space size={4}><div className="elevator_legend-dot elevator_legend-dot--blue" /><Text className="text-11">{t('elevatorDash.normal')}</Text></Space>
              <Space size={4}><div className="elevator_legend-dot elevator_legend-dot--orange" /><Text className="text-11">{t('elevatorDash.peakHours')}</Text></Space>
            </div>
          </ContentCard>
        </Col>

        {/* Trips by floor (horizontal bar) */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <ContentCard
            title={t('elevatorDash.tripsByFloor')}
            titleIcon={<ArrowUpOutlined />}
            titleIconColor="#722ed1"
            bodyStyle={{ padding: '12px 16px' }}
            style={{ width: '100%' }}
          >
            {tripsByFloor.map((floor, i) => (
              <div key={i} className="flex items-center gap-8 mb-4">
                <Text className="elevator_floor-label text-11 font-mono text-muted">{floor.floor}</Text>
                <div className="elevator_bar-track flex-1">
                  <Tooltip title={`${floor.floor}: ${floor.trips.toLocaleString()} ${t('elevatorDash.trips')}`}>
                    <div
                      style={{
                        width: `${(floor.trips / maxTrips) * 100}%`,
                        height: '100%',
                        background: floor.floor === 'G' ? 'linear-gradient(90deg, #722ed1, #b37feb)' : 'linear-gradient(90deg, #1890ff, #69c0ff)',
                        borderRadius: 3,
                        transition: 'width 0.5s',
                      }}
                    />
                  </Tooltip>
                </div>
                <Text className="elevator_bar-value text-xs font-mono text-right">{floor.trips.toLocaleString()}</Text>
              </div>
            ))}
          </ContentCard>
        </Col>
      </Row>

      {/* Bottom row: Alarm distribution + Recent events */}
      <Row gutter={[16, 16]}>
        {/* Alarm types */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('elevatorDash.alarmDistribution')}
            titleIcon={<AlertOutlined />}
            titleIconColor="#f5222d"
            className="h-full"
          >
            {/* Simple donut-like visualization */}
            <div className="flex justify-center mb-16">
              <div className="elevator_donut-wrap relative">
                <svg viewBox="0 0 36 36" className="elevator_donut-svg">
                  {(() => {
                    const total = alarmTypes.reduce((s, a) => s + a.count, 0)
                    let offset = 0
                    return alarmTypes.map((alarm, i) => {
                      const pct = (alarm.count / total) * 100
                      const dashArray = `${pct} ${100 - pct}`
                      const el = (
                        <circle
                          key={i}
                          cx="18" cy="18" r="15.915"
                          fill="transparent"
                          stroke={alarm.color}
                          strokeWidth="3.5"
                          strokeDasharray={dashArray}
                          strokeDashoffset={`-${offset}`}
                        />
                      )
                      offset += pct
                      return el
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex-center">
                  <div className="text-center">
                    <Text strong className="text-2xl">{alarmTypes.reduce((s, a) => s + a.count, 0)}</Text>
                    <br />
                    <Text className="text-xs text-muted">{t('elevatorDash.totalAlarms')}</Text>
                  </div>
                </div>
              </div>
            </div>
            <Space direction="vertical" className="w-full" size={6}>
              {alarmTypes.map((alarm, i) => (
                <div key={i} className="flex-between">
                  <Space size={8}>
                    <div className="elevator_legend-dot" style={{ background: alarm.color }} />
                    <Text className="text-sm">{alarm.type}</Text>
                  </Space>
                  <Tag className="elevator_tag-count rounded">{alarm.count}</Tag>
                </div>
              ))}
            </Space>
          </ContentCard>
        </Col>

        {/* Recent events */}
        <Col xs={24} lg={16}>
          <ContentCard
            title={t('elevatorDash.recentEvents')}
            titleIcon={<ClockCircleOutlined />}
            titleIconColor="#1890ff"
            titleExtra={<Button size="small" icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>}
            className="h-full"
          >
            <Timeline
              items={recentEvents.map(evt => {
                const severityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
                  info: { color: '#1890ff', icon: <CheckCircleOutlined /> },
                  warning: { color: '#fa8c16', icon: <WarningOutlined /> },
                  critical: { color: '#f5222d', icon: <ExclamationCircleOutlined /> },
                }
                const cfg = severityConfig[evt.severity] || severityConfig.info
                return {
                  color: cfg.color,
                  dot: cfg.icon,
                  children: (
                    <div className="flex items-start justify-between">
                      <div>
                        <Text strong className="text-base">{evt.elevator}</Text>
                        <Text className="text-base ml-4">{evt.event}</Text>
                      </div>
                      <Text type="secondary" className="text-11 whitespace-nowrap ml-4">
                        {evt.ago} {t('elevatorDash.ago')}
                      </Text>
                    </div>
                  ),
                }
              })}
            />
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
