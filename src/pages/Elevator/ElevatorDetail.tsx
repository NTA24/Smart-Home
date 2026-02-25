import { useState } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Select,
  Timeline,
  Progress,
  Badge,
  Tooltip,
  Divider,
  Popconfirm,
  message,
} from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  StopOutlined,
  SwapOutlined,
  ToolOutlined,
  ExperimentOutlined,
  LeftOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useBuildingStore } from '@/stores'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Title, Text } = Typography

type Direction = 'up' | 'down' | 'idle'
type DoorState = 'closed' | 'opening' | 'open' | 'closing' | 'stuck'

interface ElevatorData {
  id: string
  bank: string
  status: 'normal' | 'warning' | 'critical'
  lastHeartbeat: string
  currentFloor: number
  floorLabel: string
  direction: Direction
  speed: number
  load: number
  door: DoorState
  mode: string
  floorRange: [number, number]
  hallCalls: { floor: string; direction: 'up' | 'down' }[]
  carCalls: number[]
  nextStop: { floor: string; eta: string } | null
  events: { time: string; event: string; severity: 'info' | 'warning' | 'critical' }[]
}

const allElevators = ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12']

const DIRECTION_ICON: Record<Direction, React.ReactNode> = {
  up: <ArrowUpOutlined className="text-success text-xl" />,
  down: <ArrowDownOutlined className="text-primary text-xl" />,
  idle: <MinusOutlined className="text-muted text-xl" />,
}

const LOAD_COLOR = (load: number) => load >= 90 ? '#f5222d' : load >= 70 ? '#fa8c16' : load >= 50 ? '#fadb14' : '#52c41a'

const STATUS_COLOR: Record<string, string> = {
  normal: '#52c41a',
  warning: '#fa8c16',
  critical: '#f5222d',
}

export default function ElevatorDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedBuilding } = useBuildingStore()

  const DOOR_CONFIG: Record<DoorState, { color: string; label: string }> = {
    closed: { color: 'default', label: t('elevatorDetail.doorClosed') },
    opening: { color: 'processing', label: t('elevatorDetail.doorOpening') },
    open: { color: 'success', label: t('elevatorDetail.doorOpen') },
    closing: { color: 'warning', label: t('elevatorDetail.doorClosing') },
    stuck: { color: 'error', label: t('elevatorDetail.doorStuck') },
  }

  const elevatorData: ElevatorData = {
    id: 'E03',
    bank: 'A',
    status: 'warning',
    lastHeartbeat: '3s',
    currentFloor: 7,
    floorLabel: '7F',
    direction: 'down',
    speed: 2.5,
    load: 92,
    door: 'closed',
    mode: t('elevatorLive.modeNormal'),
    floorRange: [-2, 20],
    hallCalls: [
      { floor: '9F', direction: 'down' },
      { floor: '6F', direction: 'down' },
      { floor: '2F', direction: 'down' },
    ],
    carCalls: [3, 1],
    nextStop: { floor: '6F', eta: '~8s' },
    events: [
      { time: '08:14', event: t('elevatorDetail.eventArrivedFloor6'), severity: 'info' },
      { time: '08:13', event: t('elevatorDetail.eventOverloadWarning'), severity: 'warning' },
      { time: '08:12', event: t('elevatorDetail.eventDoorReopen'), severity: 'info' },
      { time: '08:10', event: t('elevatorDetail.eventDepartedFloor12'), severity: 'info' },
      { time: '08:09', event: t('elevatorDetail.eventPassengerBoarding'), severity: 'info' },
      { time: '08:05', event: t('elevatorDetail.eventArrivedFloor12'), severity: 'info' },
      { time: '08:02', event: t('elevatorDetail.eventHallCallAssigned'), severity: 'info' },
      { time: '07:58', event: t('elevatorDetail.eventIdleTimeout'), severity: 'info' },
      { time: '07:45', event: t('elevatorDetail.eventSystemStartup'), severity: 'info' },
    ],
  }

  const [selectedId, setSelectedId] = useState(elevatorData.id)
  const data = elevatorData // In real app, fetch by selectedId

  const handleAction = (action: string) => {
    message.loading(`${action}...`, 1.5)
    setTimeout(() => message.success(`${action} - OK`), 1500)
  }

  // Build floor shaft visualization
  const totalFloors = data.floorRange[1] - data.floorRange[0] + 1
  const floors = Array.from({ length: totalFloors }, (_, i) => {
    const floorNum = data.floorRange[1] - i
    let label = `${floorNum}F`
    if (floorNum === 0) label = 'G'
    else if (floorNum < 0) label = `B${Math.abs(floorNum)}`
    const isCurrent = floorNum === data.currentFloor
    const isHallCall = data.hallCalls.some(h => h.floor === label)
    const isCarCall = data.carCalls.includes(floorNum)
    const isNextStop = data.nextStop?.floor === label
    return { floorNum, label, isCurrent, isHallCall, isCarCall, isNextStop }
  })

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="flex items-center gap-12">
            <Button icon={<LeftOutlined />} onClick={() => navigate('/elevator-live')} />
            <span className="flex items-center gap-10">
              <Title level={4} className="m-0">{data.id}</Title>
              <Tag color="blue" style={{ borderRadius: 8 }}>{t('elevatorLive.bank')} {data.bank}</Tag>
              <Tag color={STATUS_COLOR[data.status]} style={{ borderRadius: 8 }}>
                {data.status === 'normal' ? <CheckCircleOutlined /> : <WarningOutlined />}
                {' '}{t(`elevatorLive.${data.status}`)}
              </Tag>
            </span>
          </span>
        }
        subtitle={`${selectedBuilding?.name || t('elevatorDetail.allSites')} · ${t('elevatorDetail.lastHeartbeat')}: ${data.lastHeartbeat} ${t('elevatorDash.ago')}`}
        actions={<Select value={selectedId} onChange={setSelectedId} style={{ width: 120 }} options={allElevators.map(e => ({ value: e, label: e }))} />}
      />

      {/* Main 3-column layout */}
      <Row gutter={[16, 16]} className="mb-16">
        {/* LEFT: Status Panel */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('elevatorDetail.status')}
            titleIcon={<ThunderboltOutlined />}
            titleIconColor="#1890ff"
            style={{ height: '100%' }}
          >
            {/* Current floor - big display */}
            <div className="elevator_floor-display">
              <Text type="secondary" className="text-sm">{t('elevatorDetail.currentFloor')}</Text>
              <div className="flex items-center justify-center gap-12 mt-4">
                <span className="elevator_floor-value">
                  {data.floorLabel}
                </span>
                {DIRECTION_ICON[data.direction]}
              </div>
              <Text className="text-base text-muted">
                {t('elevatorDetail.direction')}: {data.direction === 'up' ? '↑ ' + t('elevatorDetail.dirUp') : data.direction === 'down' ? '↓ ' + t('elevatorDetail.dirDown') : '— ' + t('elevatorDetail.dirIdle')}
              </Text>
            </div>

            {/* Speed */}
            <div className="flex-between mb-4">
              <Text className="text-base text-muted">{t('elevatorDetail.speed')}</Text>
              <Text strong className="font-mono">{data.speed} m/s</Text>
            </div>

            {/* Load gauge */}
            <div className="mb-4">
              <div className="flex-between mb-2">
                <Text className="text-base text-muted">{t('elevatorDetail.load')}</Text>
                <Text strong style={{ color: LOAD_COLOR(data.load), fontSize: 15 }}>{data.load}%</Text>
              </div>
              <Progress
                percent={data.load}
                showInfo={false}
                strokeColor={{
                  '0%': '#52c41a',
                  '50%': '#fadb14',
                  '75%': '#fa8c16',
                  '100%': '#f5222d',
                }}
                trailColor="#f0f0f0"
              />
              {data.load >= 90 && (
                <div className="mt-4 flex items-center gap-4">
                  <WarningOutlined className="text-danger text-sm" />
                  <Text className="text-11 text-danger">{t('elevatorDetail.highLoad')}</Text>
                </div>
              )}
            </div>

            {/* Door status */}
            <div className="flex-between mb-4">
              <Text className="text-base text-muted">{t('elevatorDetail.door')}</Text>
              <Badge status={DOOR_CONFIG[data.door].color as 'success' | 'processing' | 'error' | 'warning' | 'default'} text={
                <Text strong>{DOOR_CONFIG[data.door].label}</Text>
              } />
            </div>

            {/* Mode */}
            <div className="flex-between">
              <Text className="text-base text-muted">{t('elevatorLive.modeLabel')}</Text>
              <Tag color="green" style={{ borderRadius: 8 }}>{data.mode}</Tag>
            </div>

            {/* Mini shaft visualization */}
            <Divider className="mt-16 mb-12" />
            <Text type="secondary" className="text-11 block mb-8">{t('elevatorDetail.shaftView')}</Text>
            <div className="overflow-y-auto elevator_shaft-list">
              {floors.map((f, i) => (
                <div
                  key={i}
                  className={`elevator_shaft-row ${f.isCurrent ? 'elevator_shaft-row--current' : ''}`}
                >
                  <Text className={`elevator_shaft-label ${f.isCurrent ? 'elevator_shaft-label--current font-bold' : 'text-muted'}`}>
                    {f.label}
                  </Text>
                  {f.isCurrent && <div className="elevator_status-dot" />}
                  {f.isNextStop && !f.isCurrent && <div className="elevator_next-stop-dot" />}
                  {f.isHallCall && <Tag color="orange" className="text-xs p-4 rounded-sm m-0 leading-none">HC</Tag>}
                  {f.isCarCall && <Tag color="blue" className="text-xs p-4 rounded-sm m-0 leading-none">CC</Tag>}
                </div>
              ))}
            </div>
          </ContentCard>
        </Col>

        {/* CENTER: Call Queue */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('elevatorDetail.callQueue')}
            titleIcon={<SwapOutlined />}
            titleIconColor="#722ed1"
            style={{ height: '100%' }}
          >
            {/* Hall calls */}
            <div className="mb-20">
              <Text strong className="text-base block mb-8">{t('elevatorDetail.hallCalls')}</Text>
              {data.hallCalls.length > 0 ? (
                <Space wrap size={8}>
                  {data.hallCalls.map((call, i) => (
                    <Tag key={i} color="orange" className="rounded-md text-md font-mono font-semibold p-4">
                      {call.floor}{call.direction === 'down' ? '↓' : '↑'}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary" className="text-sm">{t('elevatorDetail.noCalls')}</Text>
              )}
            </div>

            {/* Car calls */}
            <div className="mb-20">
              <Text strong className="text-base block mb-8">{t('elevatorDetail.carCalls')}</Text>
              {data.carCalls.length > 0 ? (
                <Space wrap size={8}>
                  {data.carCalls.map((floor, i) => {
                    let label = `${floor}F`
                    if (floor === 0) label = 'G'
                    else if (floor < 0) label = `B${Math.abs(floor)}`
                    return (
                      <Tag key={i} color="blue" className="rounded-md text-md font-mono font-semibold p-4">
                        {label}
                      </Tag>
                    )
                  })}
                </Space>
              ) : (
                <Text type="secondary" className="text-sm">{t('elevatorDetail.noCalls')}</Text>
              )}
            </div>

            <Divider className="mt-12 mb-12" />

            {/* Next stop prediction */}
            <div className="mb-20">
              <Text strong className="text-base block mb-8">{t('elevatorDetail.nextStop')}</Text>
              {data.nextStop ? (
                <Card size="small" className="elevator_next-stop-card">
                  <div className="flex-between items-center">
                    <div>
                      <Text className="text-sm text-muted">{t('elevatorDetail.floor')}</Text>
                      <div className="text-4xl font-bold font-mono text-success">{data.nextStop.floor}</div>
                    </div>
                    <div className="text-right">
                      <Text className="text-sm text-muted">ETA</Text>
                      <div className="text-2xl font-bold font-mono text-primary">{data.nextStop.eta}</div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Text type="secondary" className="text-sm">{t('elevatorDetail.noNextStop')}</Text>
              )}
            </div>

            {/* Summary */}
            <Card size="small" className="elevator_summary-card">
              <Row gutter={16}>
                <Col span={8} className="text-center">
                  <Text type="secondary" className="text-xs">{t('elevatorDetail.hallCalls')}</Text>
                  <div className="text-2xl font-bold text-warning">{data.hallCalls.length}</div>
                </Col>
                <Col span={8} className="text-center">
                  <Text type="secondary" className="text-xs">{t('elevatorDetail.carCalls')}</Text>
                  <div className="text-2xl font-bold text-primary">{data.carCalls.length}</div>
                </Col>
                <Col span={8} className="text-center">
                  <Text type="secondary" className="text-xs">{t('common.total')}</Text>
                  <div className="text-2xl font-bold">{data.hallCalls.length + data.carCalls.length}</div>
                </Col>
              </Row>
            </Card>
          </ContentCard>
        </Col>

        {/* RIGHT: Timeline / Events */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('elevatorDetail.timeline')}
            titleIcon={<ClockCircleOutlined />}
            titleIconColor="#1890ff"
            titleExtra={<Button size="small" icon={<ReloadOutlined />} />}
            style={{ height: '100%' }}
          >
            <div className="overflow-y-auto pt-4 max-h-400">
              <Timeline
                items={data.events.map(evt => {
                  const colorMap: Record<string, string> = { info: '#1890ff', warning: '#fa8c16', critical: '#f5222d' }
                  const iconMap: Record<string, React.ReactNode> = {
                    info: <CheckCircleOutlined />,
                    warning: <WarningOutlined />,
                    critical: <WarningOutlined />,
                  }
                  return {
                    color: colorMap[evt.severity],
                    dot: iconMap[evt.severity],
                    children: (
                      <div>
                        <div className="flex-between">
                          <Text className="text-base">{evt.event}</Text>
                          <Text className="text-11 text-muted font-mono whitespace-nowrap ml-8">{evt.time}</Text>
                        </div>
                      </div>
                    ),
                  }
                })}
              />
            </div>
          </ContentCard>
        </Col>
      </Row>

      {/* Bottom: Controls */}
      <ContentCard
        title={
          <>
            {t('elevatorDetail.controls')}
            <Text type="secondary" className="text-11 ml-8">
              ({t('elevatorDetail.ifPermitted')})
            </Text>
          </>
        }
        titleIcon={<ToolOutlined />}
        titleIconColor="#722ed1"
      >
        <Space wrap size={12}>
          <Popconfirm title={t('elevatorDetail.confirmResetDoor')} onConfirm={() => handleAction(t('elevatorDetail.resetDoorCycle'))} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
            <Tooltip title={t('elevatorDetail.resetDoorDesc')}>
              <Button
                icon={<ReloadOutlined />}
                style={{ height: 44, borderRadius: 8, fontWeight: 500, borderColor: '#1890ff', color: '#1890ff' }}
              >
                {t('elevatorDetail.resetDoorCycle')}
              </Button>
            </Tooltip>
          </Popconfirm>

          <Tooltip title={t('elevatorDetail.switchModeDesc')}>
            <Button
              icon={<SwapOutlined />}
              style={{ height: 44, borderRadius: 8, fontWeight: 500, borderColor: '#722ed1', color: '#722ed1' }}
            >
              {t('elevatorDetail.switchMode')}
            </Button>
          </Tooltip>

          <Popconfirm title={t('elevatorDetail.confirmOutOfService')} onConfirm={() => handleAction(t('elevatorDetail.outOfService'))} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
            <Button
              danger
              icon={<StopOutlined />}
              className="elevator_control-btn"
            >
              {t('elevatorDetail.outOfService')}
            </Button>
          </Popconfirm>

          <Tooltip title={t('elevatorDetail.runDiagnosticDesc')}>
            <Button
              icon={<ExperimentOutlined />}
              style={{ height: 44, borderRadius: 8, fontWeight: 500, borderColor: '#13c2c2', color: '#13c2c2' }}
            >
              {t('elevatorDetail.runDiagnostic')}
            </Button>
          </Tooltip>
        </Space>
      </ContentCard>
    </PageContainer>
  )
}
