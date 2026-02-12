import { useState } from 'react'
import {
  Card,
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
  Tooltip,
  Progress,
  Timeline,
} from 'antd'
import {
  RobotOutlined,
  SearchOutlined,
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  DashboardOutlined,
  ReloadOutlined,
  ApiOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

export default function RobotDashboard() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [dateRange, setDateRange] = useState('today')
  const [searchText, setSearchText] = useState('')

  const kpi = {
    online: 18, total: 20,
    idle: 3, running: 10, charging: 3, error: 2,
    avgTaskTime: '6m 40s',
    mttr: '9m',
  }

  const deviceHealth = {
    critical: 1, warning: 2, dockingOffline: 1,
  }

  const missions = {
    completed: 240, inProgress: 12, failed: 3,
    topTypes: [
      { type: t('robotDash.missionClean'), pct: 60, color: '#1890ff' },
      { type: t('robotDash.missionDeliver'), pct: 30, color: '#52c41a' },
      { type: t('robotDash.missionPatrol'), pct: 10, color: '#722ed1' },
    ],
  }

  const activeAlerts = [
    { id: '1', severity: 'critical' as const, robot: 'R-07', message: t('robotDash.alertStuck'), ago: '3m' },
    { id: '2', severity: 'warning' as const, robot: 'R-12', message: t('robotDash.alertLowBattery'), ago: '8m' },
    { id: '3', severity: 'warning' as const, robot: 'R-03', message: t('robotDash.alertNavError'), ago: '15m' },
  ]

  const recentEvents = [
    { time: '10:45', robot: 'R-01', event: t('robotDash.eventDeliveryComplete'), severity: 'info' as const },
    { time: '10:42', robot: 'R-07', event: t('robotDash.eventStuckDetected'), severity: 'critical' as const },
    { time: '10:38', robot: 'R-05', event: t('robotDash.eventCleaningStarted'), severity: 'info' as const },
    { time: '10:35', robot: 'R-12', event: t('robotDash.eventLowBattery'), severity: 'warning' as const },
    { time: '10:30', robot: 'R-09', event: t('robotDash.eventPatrolComplete'), severity: 'info' as const },
    { time: '10:25', robot: 'R-03', event: t('robotDash.eventNavRetry'), severity: 'warning' as const },
    { time: '10:20', robot: 'R-14', event: t('robotDash.eventDockingSuccess'), severity: 'info' as const },
    { time: '10:15', robot: 'R-02', event: t('robotDash.eventMissionAssigned'), severity: 'info' as const },
  ]

  // Robot fleet overview (mini grid)
  // 20 total: 10 running, 3 idle, 3 charging, 2 error, 2 offline = 20
  const robots = Array.from({ length: 20 }, (_, i) => {
    const id = `R-${String(i + 1).padStart(2, '0')}`
    let status: 'running' | 'idle' | 'charging' | 'error' | 'offline' = 'running'
    if (i === 6) status = 'error'       // R-07 stuck
    if (i === 2) status = 'error'       // R-03 nav error
    if ([18, 19].includes(i)) status = 'offline'  // R-19, R-20 offline
    if ([3, 8, 13].includes(i)) status = 'idle'   // 3 idle
    if ([5, 11, 17].includes(i)) status = 'charging' // 3 charging
    const battery = status === 'charging' ? 15 + Math.floor(Math.random() * 30)
      : status === 'error' ? 20 + Math.floor(Math.random() * 20)
      : status === 'offline' ? 0
      : 40 + Math.floor(Math.random() * 60)
    return { id, status, battery }
  })

  const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    running: { color: '#52c41a', bg: '#f6ffed', label: t('robotDash.statusRunning') },
    idle: { color: '#8c8c8c', bg: '#fafafa', label: t('robotDash.statusIdle') },
    charging: { color: '#1890ff', bg: '#e6f7ff', label: t('robotDash.statusCharging') },
    error: { color: '#f5222d', bg: '#fff1f0', label: t('robotDash.statusError') },
    offline: { color: '#595959', bg: '#f0f0f0', label: t('robotDash.statusOffline') },
  }

  const SEVERITY_ICON: Record<string, React.ReactNode> = {
    info: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
    warning: <WarningOutlined style={{ color: '#fa8c16' }} />,
    critical: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />,
  }

  const SEVERITY_COLOR: Record<string, string> = {
    info: '#1890ff', warning: '#fa8c16', critical: '#f5222d',
  }

  const statusCounts = {
    running: robots.filter(r => r.status === 'running').length,
    idle: robots.filter(r => r.status === 'idle').length,
    charging: robots.filter(r => r.status === 'charging').length,
    error: robots.filter(r => r.status === 'error').length,
    offline: robots.filter(r => r.status === 'offline').length,
  }

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined />
            {t('robotDash.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('robotDash.allSites')}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Select value={dateRange} onChange={setDateRange} style={{ width: 130 }}
            options={[
              { value: 'today', label: t('robotDash.timeToday') },
              { value: 'week', label: t('robotDash.timeWeek') },
              { value: 'month', label: t('robotDash.timeMonth') },
            ]}
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('robotDash.searchPlaceholder')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200, borderRadius: 8 }}
            allowClear
          />
          <Tooltip title={t('robotDash.alerts')}>
            <Badge count={activeAlerts.length} size="small">
              <Button icon={<BellOutlined />} shape="circle" />
            </Badge>
          </Tooltip>
          <Button icon={<ReloadOutlined />} />
        </div>
      </div>

      {/* KPI Row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12, display: 'flex' }}>
        <Col xs={12} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }} bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Statistic
              title={t('robotDash.online')}
              value={kpi.online}
              suffix={`/ ${kpi.total}`}
              valueStyle={{ color: '#52c41a', fontSize: 26 }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
                <SyncOutlined spin style={{ marginRight: 2 }} />{kpi.running} {t('robotDash.running')}
              </Tag>
              <Tag style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
                <PauseCircleOutlined style={{ marginRight: 2 }} />{kpi.idle} {t('robotDash.idle')}
              </Tag>
              <Tag color="cyan" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
                <ThunderboltOutlined style={{ marginRight: 2 }} />{kpi.charging} {t('robotDash.charging')}
              </Tag>
              <Tag color="red" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>
                <ExclamationCircleOutlined style={{ marginRight: 2 }} />{kpi.error} {t('robotDash.error')}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }} bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Statistic
              title={t('robotDash.avgTaskTime')}
              value={kpi.avgTaskTime}
              valueStyle={{ color: '#722ed1', fontSize: 26 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }} bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('robotDash.mttr')}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
              <Text strong style={{ fontSize: 26, color: '#fa8c16' }}>{kpi.mttr}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDash.mttrDesc')}</Text>
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', background: deviceHealth.critical > 0 ? '#fff1f0' : '#fff' }} bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('robotDash.deviceHealth')}</Text>
            </div>
            <Space size={8} wrap>
              <Tooltip title={t('robotDash.critical')}>
                <Tag color="red" style={{ borderRadius: 8, fontSize: 14, fontWeight: 600, padding: '2px 10px', margin: 0 }}>
                  <ExclamationCircleOutlined /> {deviceHealth.critical}
                </Tag>
              </Tooltip>
              <Tooltip title={t('robotDash.warningLabel')}>
                <Tag color="orange" style={{ borderRadius: 8, fontSize: 14, fontWeight: 600, padding: '2px 10px', margin: 0 }}>
                  <WarningOutlined /> {deviceHealth.warning}
                </Tag>
              </Tooltip>
              <Tooltip title={t('robotDash.dockingOffline')}>
                <Tag style={{ borderRadius: 8, fontSize: 14, fontWeight: 600, padding: '2px 10px', margin: 0, background: '#f0f0f0', color: '#595959', border: '1px solid #d9d9d9' }}>
                  <ApiOutlined /> {deviceHealth.dockingOffline}
                </Tag>
              </Tooltip>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main content: Missions + Alerts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Missions Today */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DashboardOutlined style={{ color: '#1890ff' }} />
                {t('robotDash.missionsToday')}
              </span>
            }
          >
            {/* Mission stats */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#52c41a' }}>{missions.completed}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDash.completed')}</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1890ff' }}>{missions.inProgress}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDash.inProgress')}</Text>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f5222d' }}>{missions.failed}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDash.failed')}</Text>
              </Col>
            </Row>

            {/* Top mission types */}
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
              {t('robotDash.topTypes')}
            </Text>
            {missions.topTypes.map((mt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ width: 70, fontSize: 12 }}>{mt.type}</Text>
                <div style={{ flex: 1 }}>
                  <Progress percent={mt.pct} strokeColor={mt.color} showInfo={false} size="small" />
                </div>
                <Text strong style={{ fontSize: 12, width: 35, textAlign: 'right' }}>{mt.pct}%</Text>
              </div>
            ))}
          </Card>
        </Col>

        {/* Active Alerts */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FireOutlined style={{ color: '#f5222d' }} />
                {t('robotDash.activeAlerts')}
                <Badge count={activeAlerts.length} style={{ backgroundColor: '#f5222d' }} />
              </span>
            }
          >
            {activeAlerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', marginBottom: 8, borderRadius: 10,
                background: alert.severity === 'critical' ? '#fff1f0' : '#fffbe6',
                border: `1px solid ${alert.severity === 'critical' ? '#ffa39e' : '#ffe58f'}`,
              }}>
                <Tag
                  color={alert.severity === 'critical' ? 'red' : 'orange'}
                  style={{ borderRadius: 6, fontWeight: 600, fontSize: 10, margin: 0, minWidth: 24, textAlign: 'center' }}
                >
                  {alert.severity === 'critical' ? 'C' : 'W'}
                </Tag>
                <Text strong style={{ fontFamily: 'monospace', fontSize: 13, minWidth: 40 }}>{alert.robot}</Text>
                <Text style={{ fontSize: 13, flex: 1 }}>{alert.message}</Text>
                <Text style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {alert.ago} {t('robotDash.ago')}
                </Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Fleet overview + Recent events */}
      <Row gutter={[16, 16]}>
        {/* Fleet grid */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RobotOutlined style={{ color: '#722ed1' }} />
                {t('robotDash.fleetOverview')}
              </span>
            }
            extra={
              <Space size={12}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Space key={status} size={4}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CONFIG[status].color }} />
                    <Text style={{ fontSize: 11 }}>{STATUS_CONFIG[status].label} ({count})</Text>
                  </Space>
                ))}
              </Space>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
              {robots.map(robot => {
                const cfg = STATUS_CONFIG[robot.status]
                return (
                  <Tooltip key={robot.id} title={`${robot.id} · ${cfg.label} · ${t('robotDash.battery')}: ${robot.battery}%`}>
                    <div style={{
                      padding: '8px 6px',
                      borderRadius: 10,
                      background: cfg.bg,
                      border: `1.5px solid ${cfg.color}30`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <RobotOutlined style={{ fontSize: 18, color: cfg.color, display: 'block', marginBottom: 4 }} />
                      <Text strong style={{ fontSize: 11, fontFamily: 'monospace', display: 'block' }}>{robot.id}</Text>
                      <Progress
                        percent={robot.battery}
                        size="small"
                        showInfo={false}
                        strokeColor={robot.battery <= 20 ? '#f5222d' : robot.battery <= 40 ? '#fa8c16' : '#52c41a'}
                        trailColor="#f0f0f0"
                        style={{ margin: '4px 0 0' }}
                      />
                      <Text style={{ fontSize: 9, color: '#8c8c8c' }}>{robot.battery}%</Text>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </Card>
        </Col>

        {/* Recent Events */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('robotDash.recentEvents')}
              </span>
            }
            extra={<Button size="small" icon={<ReloadOutlined />} />}
          >
            <div style={{ maxHeight: 350, overflowY: 'auto', paddingTop: 4 }}>
              <Timeline
                items={recentEvents.map(evt => ({
                  color: SEVERITY_COLOR[evt.severity],
                  dot: SEVERITY_ICON[evt.severity],
                  children: (
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{evt.robot}</Text>
                        <Text style={{ fontSize: 13, marginLeft: 8 }}>{evt.event}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 12, fontFamily: 'monospace' }}>
                        {evt.time}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
