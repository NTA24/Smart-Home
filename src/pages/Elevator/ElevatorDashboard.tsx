import { useState } from 'react'
import {
  Card,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Badge,
  Select,
  Input,
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
  SearchOutlined,
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

const { Title, Text } = Typography

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

// Mock wait time by hour
const waitTimeByHour = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  wait: i >= 7 && i <= 9 ? 35 + Math.floor(Math.random() * 20) : i >= 17 && i <= 19 ? 30 + Math.floor(Math.random() * 15) : 15 + Math.floor(Math.random() * 15),
}))

// Mock trips by floor
const tripsByFloor = Array.from({ length: 20 }, (_, i) => ({
  floor: i === 0 ? 'B2' : i === 1 ? 'B1' : i === 2 ? 'G' : `${i - 2}F`,
  trips: i === 2 ? 1850 : i <= 1 ? 600 + Math.floor(Math.random() * 300) : i <= 5 ? 800 + Math.floor(Math.random() * 400) : 200 + Math.floor(Math.random() * 500),
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
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DashboardOutlined />
            {t('elevatorDash.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('elevatorDash.allSites')}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Select value={timeRange} onChange={setTimeRange} style={{ width: 130 }}
            options={timeRanges.map(r => ({ value: r, label: r }))}
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('elevatorDash.searchElevator')}
            value={searchElevator}
            onChange={e => setSearchElevator(e.target.value)}
            style={{ width: 180 }}
            allowClear
          />
          <Tooltip title={t('elevatorDash.alerts')}>
            <Badge count={kpiData.alarmsWarning} size="small">
              <Button icon={<BellOutlined />} shape="circle" />
            </Badge>
          </Tooltip>
          <Tooltip title={t('elevatorDash.profile')}>
            <Button icon={<UserOutlined />} shape="circle" />
          </Tooltip>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.elevatorsOnline')}
              value={kpiData.elevatorsOnline}
              suffix={`/ ${kpiData.elevatorsTotal}`}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.activeAlarms')}
              valueRender={() => (
                <div>
                  <Text strong style={{ fontSize: 24, color: kpiData.alarmsCritical > 0 ? '#f5222d' : '#52c41a' }}>
                    {kpiData.alarmsCritical}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8c8c8c' }}> {t('elevatorDash.critical')}</Text>
                  <Text strong style={{ fontSize: 18, color: '#fa8c16', marginLeft: 8 }}>
                    {kpiData.alarmsWarning}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8c8c8c' }}> {t('elevatorDash.warningLabel')}</Text>
                </div>
              )}
              prefix={<AlertOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.avgWaitTime')}
              value={kpiData.avgWaitTime}
              suffix="s"
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.avgTravelTime')}
              value={kpiData.avgTravelTime}
              suffix="s"
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.totalTrips')}
              value={kpiData.totalTrips}
              valueStyle={{ fontSize: 24 }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={t('elevatorDash.downtimeMonth')}
              value={kpiData.downtimeMonth}
              valueStyle={{ color: '#fa8c16', fontSize: 24 }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Wait time by hour */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('elevatorDash.waitTimeByHour')}
              </span>
            }
            bodyStyle={{ padding: '12px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160, padding: '0 4px' }}>
              {waitTimeByHour.map((item, i) => {
                const h = (item.wait / 60) * 140
                const isPeak = (i >= 7 && i <= 9) || (i >= 17 && i <= 19)
                return (
                  <Tooltip key={i} title={`${item.hour}: ${item.wait}s`}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: h,
                          background: isPeak ? 'linear-gradient(180deg, #ff7a45 0%, #fa541c 100%)' : 'linear-gradient(180deg, #69c0ff 0%, #1890ff 100%)',
                          borderRadius: '3px 3px 0 0',
                          minHeight: 4,
                          transition: 'height 0.3s',
                        }}
                      />
                      {i % 3 === 0 && (
                        <Text style={{ fontSize: 8, color: '#8c8c8c', marginTop: 2 }}>{item.hour.split(':')[0]}</Text>
                      )}
                    </div>
                  </Tooltip>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
              <Space size={4}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#1890ff' }} /><Text style={{ fontSize: 11 }}>{t('elevatorDash.normal')}</Text></Space>
              <Space size={4}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#fa541c' }} /><Text style={{ fontSize: 11 }}>{t('elevatorDash.peakHours')}</Text></Space>
            </div>
          </Card>
        </Col>

        {/* Trips by floor (horizontal bar) */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowUpOutlined style={{ color: '#722ed1' }} />
                {t('elevatorDash.tripsByFloor')}
              </span>
            }
            bodyStyle={{ padding: '12px 16px', maxHeight: 220, overflowY: 'auto' }}
          >
            {tripsByFloor.map((floor, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ width: 30, textAlign: 'right', fontSize: 11, fontFamily: 'monospace', color: '#8c8c8c' }}>{floor.floor}</Text>
                <div style={{ flex: 1, height: 14, background: '#f5f5f5', borderRadius: 3, overflow: 'hidden' }}>
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
                <Text style={{ width: 45, fontSize: 10, fontFamily: 'monospace', textAlign: 'right' }}>{floor.trips.toLocaleString()}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Bottom row: Alarm distribution + Recent events */}
      <Row gutter={[16, 16]}>
        {/* Alarm types */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertOutlined style={{ color: '#f5222d' }} />
                {t('elevatorDash.alarmDistribution')}
              </span>
            }
          >
            {/* Simple donut-like visualization */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 36 36" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
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
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: 20 }}>{alarmTypes.reduce((s, a) => s + a.count, 0)}</Text>
                    <br />
                    <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{t('elevatorDash.totalAlarms')}</Text>
                  </div>
                </div>
              </div>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size={6}>
              {alarmTypes.map((alarm, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Space size={8}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: alarm.color }} />
                    <Text style={{ fontSize: 12 }}>{alarm.type}</Text>
                  </Space>
                  <Tag style={{ borderRadius: 8, minWidth: 30, textAlign: 'center' }}>{alarm.count}</Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Recent events */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('elevatorDash.recentEvents')}
              </span>
            }
            extra={<Button size="small" icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>}
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
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{evt.elevator}</Text>
                        <Text style={{ fontSize: 13, marginLeft: 8 }}>{evt.event}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {evt.ago} {t('elevatorDash.ago')}
                      </Text>
                    </div>
                  ),
                }
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
