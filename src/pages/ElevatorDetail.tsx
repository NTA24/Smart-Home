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
  up: <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
  down: <ArrowDownOutlined style={{ color: '#1890ff', fontSize: 18 }} />,
  idle: <MinusOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />,
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
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<LeftOutlined />} onClick={() => navigate('/elevator-live')} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Title level={4} style={{ margin: 0 }}>{data.id}</Title>
              <Tag color="blue" style={{ borderRadius: 8 }}>{t('elevatorLive.bank')} {data.bank}</Tag>
              <Tag color={STATUS_COLOR[data.status]} style={{ borderRadius: 8 }}>
                {data.status === 'normal' ? <CheckCircleOutlined /> : <WarningOutlined />}
                {' '}{t(`elevatorLive.${data.status}`)}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedBuilding?.name || t('elevatorDetail.allSites')} · {t('elevatorDetail.lastHeartbeat')}: {data.lastHeartbeat} {t('elevatorDash.ago')}
            </Text>
          </div>
        </div>
        <Select value={selectedId} onChange={setSelectedId} style={{ width: 120 }}
          options={allElevators.map(e => ({ value: e, label: e }))}
        />
      </div>

      {/* Main 3-column layout */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* LEFT: Status Panel */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ThunderboltOutlined style={{ color: '#1890ff' }} />
                {t('elevatorDetail.status')}
              </span>
            }
          >
            {/* Current floor - big display */}
            <div style={{
              textAlign: 'center',
              padding: '16px 0 20px',
              background: '#fafafa',
              borderRadius: 10,
              marginBottom: 16,
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('elevatorDetail.currentFloor')}</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 }}>
                <span style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', color: '#1a1a1a', lineHeight: 1 }}>
                  {data.floorLabel}
                </span>
                {DIRECTION_ICON[data.direction]}
              </div>
              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                {t('elevatorDetail.direction')}: {data.direction === 'up' ? '↑ ' + t('elevatorDetail.dirUp') : data.direction === 'down' ? '↓ ' + t('elevatorDetail.dirDown') : '— ' + t('elevatorDetail.dirIdle')}
              </Text>
            </div>

            {/* Speed */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>{t('elevatorDetail.speed')}</Text>
              <Text strong style={{ fontFamily: 'monospace' }}>{data.speed} m/s</Text>
            </div>

            {/* Load gauge */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#8c8c8c' }}>{t('elevatorDetail.load')}</Text>
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
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <WarningOutlined style={{ color: '#f5222d', fontSize: 12 }} />
                  <Text style={{ fontSize: 11, color: '#f5222d' }}>{t('elevatorDetail.highLoad')}</Text>
                </div>
              )}
            </div>

            {/* Door status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>{t('elevatorDetail.door')}</Text>
              <Badge status={DOOR_CONFIG[data.door].color as 'success' | 'processing' | 'error' | 'warning' | 'default'} text={
                <Text strong>{DOOR_CONFIG[data.door].label}</Text>
              } />
            </div>

            {/* Mode */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>{t('elevatorLive.modeLabel')}</Text>
              <Tag color="green" style={{ borderRadius: 8 }}>{data.mode}</Tag>
            </div>

            {/* Mini shaft visualization */}
            <Divider style={{ margin: '16px 0 12px' }} />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>{t('elevatorDetail.shaftView')}</Text>
            <div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
              {floors.map((f, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: f.isCurrent ? '#e6f7ff' : 'transparent',
                  borderLeft: f.isCurrent ? '3px solid #1890ff' : '3px solid transparent',
                  marginBottom: 1,
                }}>
                  <Text style={{ width: 28, textAlign: 'right', fontSize: 10, fontFamily: 'monospace', fontWeight: f.isCurrent ? 700 : 400, color: f.isCurrent ? '#1890ff' : '#8c8c8c' }}>
                    {f.label}
                  </Text>
                  {f.isCurrent && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff' }} />}
                  {f.isNextStop && !f.isCurrent && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fa8c16', border: '1px solid #fff' }} />}
                  {f.isHallCall && <Tag color="orange" style={{ fontSize: 8, padding: '0 4px', borderRadius: 4, margin: 0, lineHeight: '16px' }}>HC</Tag>}
                  {f.isCarCall && <Tag color="blue" style={{ fontSize: 8, padding: '0 4px', borderRadius: 4, margin: 0, lineHeight: '16px' }}>CC</Tag>}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* CENTER: Call Queue */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SwapOutlined style={{ color: '#722ed1' }} />
                {t('elevatorDetail.callQueue')}
              </span>
            }
          >
            {/* Hall calls */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                {t('elevatorDetail.hallCalls')}
              </Text>
              {data.hallCalls.length > 0 ? (
                <Space wrap size={8}>
                  {data.hallCalls.map((call, i) => (
                    <Tag
                      key={i}
                      color="orange"
                      style={{
                        borderRadius: 10,
                        padding: '4px 12px',
                        fontSize: 14,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {call.floor}{call.direction === 'down' ? '↓' : '↑'}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>{t('elevatorDetail.noCalls')}</Text>
              )}
            </div>

            {/* Car calls */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                {t('elevatorDetail.carCalls')}
              </Text>
              {data.carCalls.length > 0 ? (
                <Space wrap size={8}>
                  {data.carCalls.map((floor, i) => {
                    let label = `${floor}F`
                    if (floor === 0) label = 'G'
                    else if (floor < 0) label = `B${Math.abs(floor)}`
                    return (
                      <Tag
                        key={i}
                        color="blue"
                        style={{
                          borderRadius: 10,
                          padding: '4px 12px',
                          fontSize: 14,
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </Tag>
                    )
                  })}
                </Space>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>{t('elevatorDetail.noCalls')}</Text>
              )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Next stop prediction */}
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                {t('elevatorDetail.nextStop')}
              </Text>
              {data.nextStop ? (
                <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{t('elevatorDetail.floor')}</Text>
                      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: '#389e0d' }}>
                        {data.nextStop.floor}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 12, color: '#8c8c8c' }}>ETA</Text>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: '#1890ff' }}>
                        {data.nextStop.eta}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>{t('elevatorDetail.noNextStop')}</Text>
              )}
            </div>

            {/* Summary */}
            <Card size="small" style={{ borderRadius: 10, background: '#fafafa' }}>
              <Row gutter={16}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 10 }}>{t('elevatorDetail.hallCalls')}</Text>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fa8c16' }}>{data.hallCalls.length}</div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 10 }}>{t('elevatorDetail.carCalls')}</Text>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff' }}>{data.carCalls.length}</div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 10 }}>{t('common.total')}</Text>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{data.hallCalls.length + data.carCalls.length}</div>
                </Col>
              </Row>
            </Card>
          </Card>
        </Col>

        {/* RIGHT: Timeline / Events */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('elevatorDetail.timeline')}
              </span>
            }
            extra={<Button size="small" icon={<ReloadOutlined />} />}
          >
            <div style={{ maxHeight: 400, overflowY: 'auto', paddingTop: 4 }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 13 }}>{evt.event}</Text>
                          <Text style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'monospace', whiteSpace: 'nowrap', marginLeft: 8 }}>{evt.time}</Text>
                        </div>
                      </div>
                    ),
                  }
                })}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bottom: Controls */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToolOutlined style={{ color: '#722ed1' }} />
            {t('elevatorDetail.controls')}
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 400, marginLeft: 8 }}>
              ({t('elevatorDetail.ifPermitted')})
            </Text>
          </span>
        }
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
              style={{ height: 44, borderRadius: 8, fontWeight: 500 }}
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
      </Card>
    </div>
  )
}
