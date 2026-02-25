import { useEffect, useMemo, useState } from 'react'
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
  Tooltip,
  Progress,
  Timeline,
} from 'antd'
import {
  RobotOutlined,
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
import { PageContainer, PageHeader, ContentCard, SearchInput } from '@/components'
import { getRobotDashboardFilters, saveRobotDashboardFilters } from '@/services/mockPersistence'

const { Text } = Typography

export default function RobotDashboard() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [dateRange, setDateRange] = useState(() => getRobotDashboardFilters<{ dateRange: string; searchText: string }>({
    dateRange: 'today',
    searchText: '',
  }).dateRange)
  const [searchText, setSearchText] = useState(() => getRobotDashboardFilters<{ dateRange: string; searchText: string }>({
    dateRange: 'today',
    searchText: '',
  }).searchText)

  useEffect(() => {
    saveRobotDashboardFilters({ dateRange, searchText })
  }, [dateRange, searchText])

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
    const battery = status === 'charging' ? 25 + ((i * 11) % 25)
      : status === 'error' ? 20 + ((i * 7) % 20)
      : status === 'offline' ? 0
      : 45 + ((i * 9) % 50)
    return { id, status, battery }
  })

  const keyword = searchText.trim().toLowerCase()
  const visibleRobots = useMemo(
    () => robots.filter((robot) => !keyword || robot.id.toLowerCase().includes(keyword)),
    [robots, keyword],
  )
  const visibleAlerts = useMemo(
    () => activeAlerts.filter((alert) => !keyword || alert.robot.toLowerCase().includes(keyword) || alert.message.toLowerCase().includes(keyword)),
    [activeAlerts, keyword],
  )
  const visibleEvents = useMemo(
    () => recentEvents.filter((event) => !keyword || event.robot.toLowerCase().includes(keyword) || event.event.toLowerCase().includes(keyword)),
    [recentEvents, keyword],
  )

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
    running: visibleRobots.filter(r => r.status === 'running').length,
    idle: visibleRobots.filter(r => r.status === 'idle').length,
    charging: visibleRobots.filter(r => r.status === 'charging').length,
    error: visibleRobots.filter(r => r.status === 'error').length,
    offline: visibleRobots.filter(r => r.status === 'offline').length,
  }
  const kpi = {
    online: visibleRobots.filter((r) => r.status !== 'offline').length,
    total: visibleRobots.length,
    idle: statusCounts.idle,
    running: statusCounts.running,
    charging: statusCounts.charging,
    error: statusCounts.error,
    avgTaskTime: dateRange === 'month' ? '7m 10s' : dateRange === 'week' ? '6m 55s' : '6m 40s',
    mttr: dateRange === 'month' ? '10m' : dateRange === 'week' ? '9m 30s' : '9m',
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('robotDash.title')}
        icon={<RobotOutlined />}
        subtitle={selectedBuilding?.name || t('robotDash.allSites')}
        actions={
          <>
            <Select value={dateRange} onChange={setDateRange} style={{ width: 130 }}
              options={[
                { value: 'today', label: t('robotDash.timeToday') },
                { value: 'week', label: t('robotDash.timeWeek') },
                { value: 'month', label: t('robotDash.timeMonth') },
              ]}
            />
            <SearchInput
              placeholder={t('robotDash.searchPlaceholder')}
              value={searchText}
              onChange={setSearchText}
              width={200}
            />
            <Tooltip title={t('robotDash.alerts')}>
                <Badge count={visibleAlerts.length} size="small">
                <Button icon={<BellOutlined />} shape="circle" />
              </Badge>
            </Tooltip>
            <Button icon={<ReloadOutlined />} />
          </>
        }
      />

      <Row gutter={[12, 12]} className="mb-12 flex">
        <Col xs={12} sm={12} lg={6} className="flex">
          <ContentCard className="w-full" bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Statistic
              title={t('robotDash.online')}
              value={kpi.online}
              suffix={`/ ${kpi.total}`}
              valueStyle={{ color: '#52c41a', fontSize: 26 }}
              prefix={<CheckCircleOutlined />}
            />
            <div className="mt-8 flex gap-6 flex-wrap">
              <Tag color="blue" className="robot_device-health-tag">
                <SyncOutlined spin className="mr-2" />{kpi.running} {t('robotDash.running')}
              </Tag>
              <Tag className="robot_device-health-tag robot_device-health-tag--muted">
                <PauseCircleOutlined className="mr-2" />{kpi.idle} {t('robotDash.idle')}
              </Tag>
              <Tag color="cyan" className="robot_device-health-tag">
                <ThunderboltOutlined className="mr-2" />{kpi.charging} {t('robotDash.charging')}
              </Tag>
              <Tag color="red" className="robot_device-health-tag">
                <ExclamationCircleOutlined className="mr-2" />{kpi.error} {t('robotDash.error')}
              </Tag>
            </div>
          </ContentCard>
        </Col>
        <Col xs={12} sm={12} lg={6} className="flex">
          <ContentCard className="w-full" bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Statistic
              title={t('robotDash.avgTaskTime')}
              value={kpi.avgTaskTime}
              valueStyle={{ color: '#722ed1', fontSize: 26 }}
              prefix={<ClockCircleOutlined />}
            />
          </ContentCard>
        </Col>
        <Col xs={12} sm={12} lg={6} className="flex">
          <ContentCard className="w-full" bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div className="mb-4">
              <Text type="secondary" className="text-sm">{t('robotDash.mttr')}</Text>
            </div>
            <div className="flex items-baseline gap-6">
              <ThunderboltOutlined className="text-warning text-lg" />
              <Text strong className="text-4xl text-warning">{kpi.mttr}</Text>
            </div>
            <Text type="secondary" className="text-11">{t('robotDash.mttrDesc')}</Text>
          </ContentCard>
        </Col>
        <Col xs={12} sm={12} lg={6} className="flex">
          <ContentCard className="w-full" bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }} style={{ background: deviceHealth.critical > 0 ? '#fff1f0' : undefined }}>
            <div className="mb-4">
              <Text type="secondary" className="text-sm">{t('robotDash.deviceHealth')}</Text>
            </div>
            <Space size={8} wrap>
              <Tooltip title={t('robotDash.critical')}>
                <Tag color="red" className="robot_device-health-tag">
                  <ExclamationCircleOutlined /> {deviceHealth.critical}
                </Tag>
              </Tooltip>
              <Tooltip title={t('robotDash.warningLabel')}>
                <Tag color="orange" className="robot_device-health-tag">
                  <WarningOutlined /> {deviceHealth.warning}
                </Tag>
              </Tooltip>
              <Tooltip title={t('robotDash.dockingOffline')}>
                <Tag className="robot_device-health-tag robot_device-health-tag--muted">
                  <ApiOutlined /> {deviceHealth.dockingOffline}
                </Tag>
              </Tooltip>
            </Space>
          </ContentCard>
        </Col>
      </Row>

      {/* Main content: Missions + Alerts */}
      <Row gutter={[16, 16]} className="mb-16">
        {/* Missions Today */}
        <Col xs={24} lg={10}>
          <ContentCard
            className="h-full"
            title={t('robotDash.missionsToday')}
            titleIcon={<DashboardOutlined />}
            titleIconColor="#1890ff"
          >
            {/* Mission stats */}
            <Row gutter={12} className="robot_kpi-row mb-20">
              <Col span={8} className="text-center">
                <div className="robot_mission-stat text-success">{missions.completed}</div>
                <Text type="secondary" className="text-11">{t('robotDash.completed')}</Text>
              </Col>
              <Col span={8} className="text-center">
                <div className="robot_mission-stat text-primary">{missions.inProgress}</div>
                <Text type="secondary" className="text-11">{t('robotDash.inProgress')}</Text>
              </Col>
              <Col span={8} className="text-center">
                <div className="robot_mission-stat text-danger">{missions.failed}</div>
                <Text type="secondary" className="text-11">{t('robotDash.failed')}</Text>
              </Col>
            </Row>

            {/* Top mission types */}
            <Text strong className="robot_section-title">
              {t('robotDash.topTypes')}
            </Text>
            {missions.topTypes.map((mt, i) => (
              <div key={i} className="robot_mission-type-row">
                <Text className="text-sm" style={{ width: 70 }}>{mt.type}</Text>
                <div className="flex-1">
                  <Progress percent={mt.pct} strokeColor={mt.color} showInfo={false} size="small" />
                </div>
                <Text strong className="text-sm text-right" style={{ width: 35 }}>{mt.pct}%</Text>
              </div>
            ))}
          </ContentCard>
        </Col>

        {/* Active Alerts */}
        <Col xs={24} lg={14}>
          <ContentCard
            className="h-full"
            title={
              <span className="flex items-center gap-8">
                <FireOutlined className="text-danger" />
                {t('robotDash.activeAlerts')}
                <Badge count={visibleAlerts.length} style={{ backgroundColor: '#f5222d' }} />
              </span>
            }
          >
            {visibleAlerts.map(alert => (
              <div
                key={alert.id}
                className="rounded-md mb-8 p-4 flex items-center gap-12"
                style={{
                  background: alert.severity === 'critical' ? '#fff1f0' : '#fffbe6',
                  border: `1px solid ${alert.severity === 'critical' ? '#ffa39e' : '#ffe58f'}`,
                }}
              >
                <Tag color={alert.severity === 'critical' ? 'red' : 'orange'} className="rounded-sm font-semibold text-xs m-0 text-center min-w-6">
                  {alert.severity === 'critical' ? 'C' : 'W'}
                </Tag>
                <Text strong className="font-mono text-base min-w-10">{alert.robot}</Text>
                <Text className="text-base flex-1">{alert.message}</Text>
                <Text className="text-11 text-muted font-mono whitespace-nowrap">
                  {alert.ago} {t('robotDash.ago')}
                </Text>
              </div>
            ))}
          </ContentCard>
        </Col>
      </Row>

      {/* Fleet overview + Recent events */}
      <Row gutter={[16, 16]}>
        {/* Fleet grid */}
        <Col xs={24} lg={14}>
          <ContentCard
            title={t('robotDash.fleetOverview')}
            titleIcon={<RobotOutlined />}
            titleIconColor="#722ed1"
            titleExtra={
              <Space size={12}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Space key={status} size={4}>
                    <div className="rounded-full w-2 h-2" style={{ background: STATUS_CONFIG[status].color }} />
                    <Text className="text-11">{STATUS_CONFIG[status].label} ({count})</Text>
                  </Space>
                ))}
              </Space>
            }
          >
            <div className="robot_fleet-grid">
              {visibleRobots.map(robot => {
                const cfg = STATUS_CONFIG[robot.status]
                return (
                  <Tooltip key={robot.id} title={`${robot.id} · ${cfg.label} · ${t('robotDash.battery')}: ${robot.battery}%`}>
                    <div
                      className="robot_fleet-cell"
                      style={{ background: cfg.bg, border: `1.5px solid ${cfg.color}30` }}
                    >
                      <RobotOutlined style={{ color: cfg.color }} className="text-xl block mb-4" />
                      <Text strong className="text-11 font-mono block">{robot.id}</Text>
                      <Progress
                        percent={robot.battery}
                        size="small"
                        showInfo={false}
                        strokeColor={robot.battery <= 20 ? '#f5222d' : robot.battery <= 40 ? '#fa8c16' : '#52c41a'}
                        trailColor="#f0f0f0"
                        className="mt-4"
                      />
                      <Text className="text-xs text-muted">{robot.battery}%</Text>
                    </div>
                  </Tooltip>
                )
              })}
            </div>
          </ContentCard>
        </Col>

        {/* Recent Events */}
        <Col xs={24} lg={10}>
          <ContentCard
            className="h-full"
            title={t('robotDash.recentEvents')}
            titleIcon={<ClockCircleOutlined />}
            titleIconColor="#1890ff"
            titleExtra={<Button size="small" icon={<ReloadOutlined />} />}
          >
            <div className="robot_events-list">
              <Timeline
                items={visibleEvents.map(evt => ({
                  color: SEVERITY_COLOR[evt.severity],
                  dot: SEVERITY_ICON[evt.severity],
                  children: (
                    <div className="flex items-start flex-between">
                      <div>
                        <Text strong className="text-base">{evt.robot}</Text>
                        <Text className="text-base ml-8">{evt.event}</Text>
                      </div>
                      <Text type="secondary" className="text-11 whitespace-nowrap ml-12 font-mono">
                        {evt.time}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </div>
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

