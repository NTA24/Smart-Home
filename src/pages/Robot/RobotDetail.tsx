import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Row,
  Col,
  Tag,
  Badge,
  Progress,
  Tooltip,
  Button,
  Space,
  Timeline,
  Select,
  Popconfirm,
  message,
} from 'antd'
import {
  RobotOutlined,
  AimOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  HomeOutlined,
  VideoCameraOutlined,
  RadarChartOutlined,
  SettingOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  DashboardOutlined,
  EyeOutlined,
  ToolOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { getRobotManagementItems } from '@/services/mockPersistence'
import type { RobotManagementItem } from './robotShared'
import { seedRobotManagementItems } from './robotShared'

const { Text } = Typography

const RobotDetail = () => {
  const { t } = useTranslation()
  const managementRobots = useMemo(
    () => getRobotManagementItems<RobotManagementItem>(seedRobotManagementItems),
    [],
  )
  const defaultRobotId = managementRobots.find((robot) => robot.id === 'R-07')?.id || managementRobots[0]?.id || 'R-07'
  const [selectedRobotId, setSelectedRobotId] = useState(defaultRobotId)

  useEffect(() => {
    if (!managementRobots.some((robot) => robot.id === selectedRobotId)) {
      setSelectedRobotId(defaultRobotId)
    }
  }, [managementRobots, selectedRobotId, defaultRobotId])

  const robotsMap = useMemo(() => {
    return Object.fromEntries(
      managementRobots.map((robot, index) => {
        const severity = robot.status === 'error' ? 'critical' : robot.status === 'offline' ? 'warning' : 'ok'
        const typeLabel = robot.type === 'cleaning'
          ? t('robotDetail.typeClean')
          : robot.type === 'patrol'
            ? t('robotDash.missionPatrol')
            : t('robotDetail.typeDelivery')
        const currentTask = robot.status === 'charging'
          ? t('robotFleet.taskCharging')
          : robot.status === 'idle'
            ? t('robotFleet.taskIdle')
            : robot.type === 'cleaning'
              ? t('robotFleet.taskClean', { zone: `${robot.floor} ${robot.zone}` })
              : t('robotFleet.taskDeliver', { id: `#${robot.id}` })
        const events = severity === 'critical'
          ? [
              { time: '10:12', text: t('robotDetail.evObstacle'), color: 'orange' as const },
              { time: '10:13', text: t('robotDetail.evRetryFail'), color: 'red' as const },
              { time: '10:14', text: t('robotDetail.evStuck'), color: 'red' as const },
            ]
          : [
              { time: '10:30', text: t('robotDetail.evStartClean'), color: 'blue' as const },
              { time: '10:35', text: t('robotDetail.evReachZone'), color: 'blue' as const },
              { time: '10:38', text: t('robotDetail.evCleaning'), color: 'green' as const },
            ]
        return [robot.id, {
          id: robot.id,
          name: robot.id,
          type: typeLabel,
          status: severity as 'ok' | 'warning' | 'critical',
          location: `${robot.floor} - ${robot.zone}`,
          heartbeat: t('robotDetail.heartbeat', { sec: Math.max(1, ((index % 4) + 1)) }),
          battery: robot.battery,
          speed: robot.status === 'running' ? 0.3 : robot.status === 'error' ? 0.0 : 0.1,
          mode: t('robotDetail.modeAuto'),
          sensors: {
            lidar: 'OK',
            camera: 'OK',
            bumper: robot.status === 'error' ? t('robotDetail.triggered') : 'OK',
          },
          currentTask,
          eta: robot.status === 'idle' ? '--' : robot.status === 'charging' ? '~2m' : '~5m',
          events,
        }]
      }),
    ) as Record<string, {
      id: string
      name: string
      type: string
      status: 'ok' | 'warning' | 'critical'
      location: string
      heartbeat: string
      battery: number
      speed: number
      mode: string
      sensors: { lidar: string; camera: string; bumper: string }
      currentTask: string
      eta: string
      events: Array<{ time: string; text: string; color: 'blue' | 'green' | 'orange' | 'red' }>
    }>
  }, [managementRobots, t])

  const robot = robotsMap[selectedRobotId] ?? robotsMap[defaultRobotId] ?? {
    id: 'R-00',
    name: 'R-00',
    type: t('robotDetail.typeDelivery'),
    status: 'ok' as const,
    location: '--',
    heartbeat: t('robotDetail.heartbeat', { sec: 1 }),
    battery: 0,
    speed: 0,
    mode: t('robotDetail.modeAuto'),
    sensors: { lidar: 'OK', camera: 'OK', bumper: 'OK' },
    currentTask: t('robotFleet.taskIdle'),
    eta: '--',
    events: [] as Array<{ time: string; text: string; color: 'blue' | 'green' | 'orange' | 'red' }>,
  }

  const sevConfig: Record<string, { color: string; text: string; bg: string }> = {
    ok: { color: '#52c41a', text: 'OK', bg: '#f6ffed' },
    warning: { color: '#faad14', text: t('robotFleet.warning'), bg: '#fffbe6' },
    critical: { color: '#ff4d4f', text: 'CRITICAL', bg: '#fff1f0' },
  }

  const sev = sevConfig[robot.status]

  const getBatteryColor = (pct: number) => {
    if (pct <= 20) return '#ff4d4f'
    if (pct <= 40) return '#faad14'
    return '#52c41a'
  }

  const sensorTag = (label: string, val: string) => {
    const isOk = val === 'OK'
    return (
      <Tag
        color={isOk ? 'success' : 'error'}
        icon={isOk ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        className="robot_sensor-tag"
      >
        {label}: {val}
      </Tag>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={<>{t('robotDetail.title', { name: robot.name })} ({robot.type})</>}
        icon={
          <Badge dot color={sev.color}>
            <div
              className="robot_status-badge"
              style={{ background: sev.bg, border: `2px solid ${sev.color}` }}
            >
              <RobotOutlined className="text-2xl" style={{ color: sev.color }} />
            </div>
          </Badge>
        }
        actions={
          <>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => window.history.back()} />
            <Select
              value={selectedRobotId}
              onChange={setSelectedRobotId}
              style={{ width: 120 }}
              options={managementRobots.map((robotItem) => ({ value: robotItem.id, label: robotItem.id }))}
            />
            <Space size={6}>
              <Tag color={robot.status === 'ok' ? 'success' : robot.status === 'warning' ? 'warning' : 'error'} className="rounded-sm">
                {sev.text}
              </Tag>
            </Space>
          </>
        }
      />

      <Row gutter={[12, 12]} className="mb-16">
        {/* Location & Heartbeat */}
        <Col xs={24} sm={12} lg={6}>
          <ContentCard className="robot_info-card rounded-md" bodyStyle={{ padding: 16 }}>
            <div className="mb-8">
              <Text type="secondary" className="text-11">{t('robotDetail.location')}</Text>
              <div><Text strong className="text-md"><AimOutlined className="mr-4" />{robot.location}</Text></div>
            </div>
            <div>
              <Text type="secondary" className="text-11">{t('robotDetail.lastHeartbeat')}</Text>
              <div><Text className="text-md text-success"><ClockCircleOutlined className="mr-4" />{robot.heartbeat}</Text></div>
            </div>
          </ContentCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <ContentCard className="robot_info-card rounded-md" bodyStyle={{ padding: 16 }}>
            <div className="mb-8">
              <Text type="secondary" className="text-11">{t('robotFleet.battery')}</Text>
              <div className="flex items-center gap-6">
                <ThunderboltOutlined style={{ color: getBatteryColor(robot.battery) }} />
                <Progress percent={robot.battery} strokeColor={getBatteryColor(robot.battery)} className="flex-1 m-0" size="small" />
              </div>
            </div>
            <Row gutter={12}>
              <Col span={12}>
                <Text type="secondary" className="text-11">{t('robotDetail.speed')}</Text>
                <div><Text strong>{robot.speed} m/s</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" className="text-11">{t('robotDetail.mode')}</Text>
                <div><Tag color="blue" className="rounded-sm m-0">{robot.mode}</Tag></div>
              </Col>
            </Row>
          </ContentCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <ContentCard className="robot_info-card rounded-md" bodyStyle={{ padding: 16 }}>
            <Text type="secondary" className="text-11 block mb-8">{t('robotDetail.sensors')}</Text>
            <Space size={6} wrap>
              {sensorTag('Lidar', robot.sensors.lidar)}
              {sensorTag(t('robotDetail.camera'), robot.sensors.camera)}
              {sensorTag('Bumper', robot.sensors.bumper)}
            </Space>
          </ContentCard>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <ContentCard style={{ borderRadius: 10, height: '100%', background: sev.bg }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{t('robotFleet.currentTask')}</Text>
            <Text strong style={{ fontSize: 14 }}>{robot.currentTask}</Text>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>ETA: </Text>
              <Text>{robot.eta}</Text>
            </div>
          </ContentCard>
        </Col>
      </Row>

      <ContentCard
        style={{ borderRadius: 10, marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
        title={t('robotDetail.actions')}
        titleIcon={<SettingOutlined />}
      >
        <Space size={8} wrap>
          <Button type="primary" icon={<SendOutlined />} size="small">
            {t('robotDetail.actionReplan')}
          </Button>
          <Button icon={<ReloadOutlined />} size="small">
            {t('robotDetail.actionRetry')}
          </Button>
          <Button icon={<HomeOutlined />} size="small">
            {t('robotDetail.actionReturnDock')}
          </Button>
          <Button icon={<AlertOutlined />} size="small" onClick={() => message.info(t('robotDetail.ticketCreated'))}>
            {t('robotDetail.actionCreateTicket')}
          </Button>
          <Tooltip title={t('robotDetail.needsApproval')}>
            <Button icon={<EyeOutlined />} size="small">
              {t('robotDetail.actionTeleop')}
            </Button>
          </Tooltip>
          <Popconfirm
            title={t('robotDetail.confirmStop')}
            onConfirm={() => message.warning(t('robotDetail.stopped'))}
            okText={t('robotDetail.confirm')}
            cancelText={t('robotDetail.cancel')}
          >
            <Button danger icon={<StopOutlined />} size="small">
              {t('robotDetail.actionEmergency')}
            </Button>
          </Popconfirm>
        </Space>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <WarningOutlined style={{ marginRight: 4 }} />{t('robotDetail.roleBasedNote')}
          </Text>
        </div>
      </ContentCard>

      <ContentCard
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: 16 }}
        title={t('robotDetail.timeline')}
        titleIcon={<ClockCircleOutlined />}
        titleExtra={
          <Space size={8}>
            <Button size="small" icon={<VideoCameraOutlined />}>{t('robotDetail.viewCamera')}</Button>
            <Button size="small" icon={<RadarChartOutlined />}>{t('robotDetail.viewLidar')}</Button>
            <Button size="small" icon={<DashboardOutlined />}>{t('robotDetail.viewTelemetry')}</Button>
            <Button size="small" icon={<ToolOutlined />}>{t('robotDetail.viewLogs')}</Button>
          </Space>
        }
      >
        <div style={{ paddingTop: 4 }}>
          <Timeline
            items={robot.events.map((ev) => ({
              color: ev.color,
              children: (
                <div>
                  <Tag style={{ borderRadius: 4, fontSize: 11, margin: 0, marginRight: 8 }}>{ev.time}</Tag>
                  <Text style={{ fontSize: 13 }}>{ev.text}</Text>
                </div>
              ),
            }))}
          />
        </div>
      </ContentCard>
    </PageContainer>
  )
}


export default RobotDetail
