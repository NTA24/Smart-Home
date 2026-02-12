import { useState, useMemo } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Badge,
  Progress,
  Tooltip,
  Button,
  Space,
  Descriptions,
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

const { Text, Title } = Typography

const RobotDetail = () => {
  const { t } = useTranslation()
  const [selectedRobotId, setSelectedRobotId] = useState('R-07')

  /* ── mock robots ── */
  const robotsMap = useMemo(() => ({
    'R-07': {
      id: 'R-07', name: 'R-07', type: t('robotDetail.typeDelivery'),
      status: 'critical' as const,
      location: 'B1 - Corridor C',
      heartbeat: t('robotDetail.heartbeat', { sec: 2 }),
      battery: 32, speed: 0.0, mode: t('robotDetail.modeAuto'),
      sensors: {
        lidar: 'OK', camera: 'OK', bumper: t('robotDetail.triggered'),
      },
      currentTask: t('robotFleet.taskDeliver', { id: '#A102' }),
      eta: '--',
      events: [
        { time: '10:12', text: t('robotDetail.evObstacle'), color: 'orange' as const },
        { time: '10:13', text: t('robotDetail.evRetryFail'), color: 'red' as const },
        { time: '10:14', text: t('robotDetail.evStuck'), color: 'red' as const },
      ],
    },
    'R-01': {
      id: 'R-01', name: 'R-01', type: t('robotDetail.typeClean'),
      status: 'ok' as const,
      location: 'B1 - Zone 2',
      heartbeat: t('robotDetail.heartbeat', { sec: 1 }),
      battery: 68, speed: 0.4, mode: t('robotDetail.modeAuto'),
      sensors: { lidar: 'OK', camera: 'OK', bumper: 'OK' },
      currentTask: t('robotFleet.taskClean', { zone: 'B1 Zone 2' }),
      eta: '~5m',
      events: [
        { time: '10:30', text: t('robotDetail.evStartClean'), color: 'blue' as const },
        { time: '10:35', text: t('robotDetail.evReachZone'), color: 'blue' as const },
        { time: '10:38', text: t('robotDetail.evCleaning'), color: 'green' as const },
      ],
    },
    'R-12': {
      id: 'R-12', name: 'R-12', type: t('robotDetail.typeDelivery'),
      status: 'warning' as const,
      location: 'B1 - Lobby',
      heartbeat: t('robotDetail.heartbeat', { sec: 3 }),
      battery: 14, speed: 0.2, mode: t('robotDetail.modeAuto'),
      sensors: { lidar: 'OK', camera: 'OK', bumper: 'OK' },
      currentTask: t('robotFleet.taskDocking'),
      eta: '~2m',
      events: [
        { time: '10:08', text: t('robotDetail.evLowBattery'), color: 'orange' as const },
        { time: '10:10', text: t('robotDetail.evReturnDock'), color: 'blue' as const },
      ],
    },
  }), [t])

  const robot = robotsMap[selectedRobotId as keyof typeof robotsMap] ?? robotsMap['R-07']

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
        style={{ borderRadius: 6, fontSize: 12, margin: 0 }}
      >
        {label}: {val}
      </Tag>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => window.history.back()} />
        <Select
          value={selectedRobotId}
          onChange={setSelectedRobotId}
          style={{ width: 120 }}
          options={Object.keys(robotsMap).map(k => ({ value: k, label: k }))}
        />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge dot color={sev.color}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: sev.bg, border: `2px solid ${sev.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RobotOutlined style={{ fontSize: 20, color: sev.color }} />
            </div>
          </Badge>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {t('robotDetail.title', { name: robot.name })} ({robot.type})
            </Title>
            <Space size={6}>
              <Tag color={robot.status === 'ok' ? 'success' : robot.status === 'warning' ? 'warning' : 'error'} style={{ borderRadius: 4 }}>
                {sev.text}
              </Tag>
            </Space>
          </div>
        </div>
      </div>

      {/* ── Info cards ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* Location & Heartbeat */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDetail.location')}</Text>
              <div><Text strong style={{ fontSize: 14 }}><AimOutlined style={{ marginRight: 4 }} />{robot.location}</Text></div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDetail.lastHeartbeat')}</Text>
              <div><Text style={{ fontSize: 14, color: '#52c41a' }}><ClockCircleOutlined style={{ marginRight: 4 }} />{robot.heartbeat}</Text></div>
            </div>
          </Card>
        </Col>

        {/* Battery & Speed */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{t('robotFleet.battery')}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ThunderboltOutlined style={{ color: getBatteryColor(robot.battery) }} />
                <Progress percent={robot.battery} strokeColor={getBatteryColor(robot.battery)} style={{ flex: 1, margin: 0 }} size="small" />
              </div>
            </div>
            <Row gutter={12}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDetail.speed')}</Text>
                <div><Text strong>{robot.speed} m/s</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11 }}>{t('robotDetail.mode')}</Text>
                <div><Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>{robot.mode}</Tag></div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Sensors */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 10, height: '100%' }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>{t('robotDetail.sensors')}</Text>
            <Space size={6} wrap>
              {sensorTag('Lidar', robot.sensors.lidar)}
              {sensorTag(t('robotDetail.camera'), robot.sensors.camera)}
              {sensorTag('Bumper', robot.sensors.bumper)}
            </Space>
          </Card>
        </Col>

        {/* Current Task */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 10, height: '100%', background: sev.bg }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{t('robotFleet.currentTask')}</Text>
            <Text strong style={{ fontSize: 14 }}>{robot.currentTask}</Text>
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>ETA: </Text>
              <Text>{robot.eta}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Actions ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 10, marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
        title={<span><SettingOutlined style={{ marginRight: 6 }} />{t('robotDetail.actions')}</span>}
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
      </Card>

      {/* ── Timeline / Logs ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: 16 }}
        title={<span><ClockCircleOutlined style={{ marginRight: 6 }} />{t('robotDetail.timeline')}</span>}
        extra={
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
      </Card>
    </div>
  )
}

export default RobotDetail
