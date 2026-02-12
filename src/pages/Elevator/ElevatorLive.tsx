import { useState } from 'react'
import {
  Card,
  Typography,
  Select,
  Tag,
  Row,
  Col,
  Drawer,
  Button,
  Space,
  Divider,
  Badge,
  Progress,
  Tooltip,
} from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  FilterOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  StopOutlined,
  SoundOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

type Direction = 'up' | 'down' | 'idle'
type DoorState = 'open' | 'closed'
type ElevatorMode = 'normal' | 'express' | 'maintenance' | 'fire'
type ElevatorStatus = 'normal' | 'warning' | 'critical' | 'offline'

interface Elevator {
  id: string
  name: string
  bank: string
  floor: number
  floorLabel: string
  direction: Direction
  load: number
  door: DoorState
  mode: ElevatorMode
  status: ElevatorStatus
  warning?: string
  queue: number
  idleTime?: string
  floorRange: [number, number]
}

const BANKS = ['A', 'B', 'C']

const DIRECTION_ICON: Record<Direction, React.ReactNode> = {
  up: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
  down: <ArrowDownOutlined style={{ color: '#1890ff' }} />,
  idle: <MinusOutlined style={{ color: '#8c8c8c' }} />,
}

const STATUS_COLOR: Record<ElevatorStatus, string> = {
  normal: '#52c41a',
  warning: '#fa8c16',
  critical: '#f5222d',
  offline: '#8c8c8c',
}

const LOAD_COLOR = (load: number) => load >= 90 ? '#f5222d' : load >= 70 ? '#fa8c16' : load >= 50 ? '#fadb14' : '#52c41a'

export default function ElevatorLive() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()

  const MODE_CONFIG: Record<ElevatorMode, { color: string; label: string }> = {
    normal: { color: 'green', label: t('elevatorLive.modeNormal') },
    express: { color: 'blue', label: t('elevatorLive.modeExpress') },
    maintenance: { color: 'orange', label: t('elevatorLive.modeMaintenance') },
    fire: { color: 'red', label: t('elevatorLive.modeFire') },
  }

  const mockElevators: Elevator[] = [
    { id: 'E01', name: 'E01', bank: 'A', floor: 12, floorLabel: '12F', direction: 'up', load: 45, door: 'closed', mode: 'normal', status: 'normal', queue: 2, floorRange: [-2, 20] },
    { id: 'E02', name: 'E02', bank: 'A', floor: 1, floorLabel: '1F', direction: 'idle', load: 10, door: 'open', mode: 'normal', status: 'normal', queue: 0, idleTime: '32s', floorRange: [-2, 20] },
    { id: 'E03', name: 'E03', bank: 'A', floor: 7, floorLabel: '7F', direction: 'down', load: 92, door: 'closed', mode: 'normal', status: 'warning', warning: t('elevatorLive.warnHighLoad'), queue: 4, floorRange: [-2, 20] },
    { id: 'E04', name: 'E04', bank: 'A', floor: 0, floorLabel: 'G', direction: 'idle', load: 0, door: 'open', mode: 'maintenance', status: 'warning', warning: t('elevatorLive.warnMaintenance'), queue: 0, floorRange: [-2, 20] },
    { id: 'E05', name: 'E05', bank: 'B', floor: 15, floorLabel: '15F', direction: 'up', load: 60, door: 'closed', mode: 'normal', status: 'normal', queue: 3, floorRange: [-1, 25] },
    { id: 'E06', name: 'E06', bank: 'B', floor: 3, floorLabel: '3F', direction: 'down', load: 25, door: 'closed', mode: 'normal', status: 'normal', queue: 1, floorRange: [-1, 25] },
    { id: 'E07', name: 'E07', bank: 'B', floor: 20, floorLabel: '20F', direction: 'down', load: 78, door: 'closed', mode: 'express', status: 'normal', queue: 5, floorRange: [-1, 25] },
    { id: 'E08', name: 'E08', bank: 'B', floor: -1, floorLabel: 'B1', direction: 'up', load: 55, door: 'closed', mode: 'normal', status: 'normal', queue: 2, floorRange: [-1, 25] },
    { id: 'E09', name: 'E09', bank: 'C', floor: 10, floorLabel: '10F', direction: 'up', load: 40, door: 'closed', mode: 'normal', status: 'normal', queue: 1, floorRange: [-2, 15] },
    { id: 'E10', name: 'E10', bank: 'C', floor: 5, floorLabel: '5F', direction: 'idle', load: 0, door: 'closed', mode: 'normal', status: 'normal', queue: 0, idleTime: '1m 15s', floorRange: [-2, 15] },
    { id: 'E11', name: 'E11', bank: 'C', floor: 0, floorLabel: 'G', direction: 'idle', load: 15, door: 'open', mode: 'normal', status: 'normal', queue: 0, idleTime: '8s', floorRange: [-2, 15] },
    { id: 'E12', name: 'E12', bank: 'C', floor: -2, floorLabel: 'B2', direction: 'up', load: 70, door: 'closed', mode: 'normal', status: 'critical', warning: t('elevatorLive.warnCommTimeout'), queue: 0, floorRange: [-2, 15] },
  ]

  const [bankFilter, setBankFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modeFilter, setModeFilter] = useState<string>('all')
  const [floorRange] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedElevator, setSelectedElevator] = useState<Elevator | null>(null)

  const filtered = mockElevators.filter(e => {
    if (bankFilter !== 'all' && e.bank !== bankFilter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (modeFilter !== 'all' && e.mode !== modeFilter) return false
    return true
  })

  const handleSelect = (elevator: Elevator) => {
    setSelectedElevator(elevator)
    setDrawerOpen(true)
  }

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpOutlined />
            {t('elevatorLive.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('elevatorLive.allSites')}</Text>
        </div>
        <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#8c8c8c' }} />
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.bank')}</Text>
            <Select value={bankFilter} onChange={setBankFilter} style={{ width: 100, marginLeft: 8 }}
              options={[{ value: 'all', label: t('elevatorLive.allBanks') }, ...BANKS.map(b => ({ value: b, label: `${t('elevatorLive.bank')} ${b}` }))]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('common.status')}</Text>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130, marginLeft: 8 }}
              options={[
                { value: 'all', label: t('elevatorLive.allStatus') },
                { value: 'normal', label: t('elevatorLive.normal') },
                { value: 'warning', label: t('elevatorLive.warning') },
                { value: 'critical', label: t('elevatorLive.critical') },
              ]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.modeLabel')}</Text>
            <Select value={modeFilter} onChange={setModeFilter} style={{ width: 140, marginLeft: 8 }}
              options={[
                { value: 'all', label: t('elevatorLive.allModes') },
                { value: 'normal', label: t('elevatorLive.modeNormal') },
                { value: 'express', label: t('elevatorLive.modeExpress') },
                { value: 'maintenance', label: t('elevatorLive.modeMaintenance') },
              ]}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
            {filtered.length} / {mockElevators.length} {t('elevatorLive.elevators')}
          </Text>
        </div>
      </Card>

      {/* Grid Cards */}
      <Row gutter={[16, 16]}>
        {filtered.map(elevator => (
          <Col key={elevator.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              bordered={false}
              hoverable
              onClick={() => handleSelect(elevator)}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${STATUS_COLOR[elevator.status]}`,
                cursor: 'pointer',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              {/* Top: name + status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Space size={8}>
                  <Text strong style={{ fontSize: 18, fontFamily: 'monospace' }}>{elevator.name}</Text>
                  <Tag color={MODE_CONFIG[elevator.mode].color} style={{ borderRadius: 8, fontSize: 10 }}>
                    {MODE_CONFIG[elevator.mode].label}
                  </Tag>
                </Space>
                {elevator.status === 'normal' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                ) : elevator.status === 'critical' ? (
                  <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 16 }} />
                ) : (
                  <WarningOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
                )}
              </div>

              {/* Floor + Direction */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 12,
                padding: '10px 0',
                background: '#fafafa',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: '#1a1a1a' }}>
                  {elevator.floorLabel}
                </div>
                <div style={{ fontSize: 20 }}>
                  {DIRECTION_ICON[elevator.direction]}
                </div>
              </div>

              {/* Load bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{t('elevatorLive.load')}</Text>
                  <Text strong style={{ fontSize: 12, color: LOAD_COLOR(elevator.load) }}>{elevator.load}%</Text>
                </div>
                <Progress
                  percent={elevator.load}
                  showInfo={false}
                  size="small"
                  strokeColor={LOAD_COLOR(elevator.load)}
                  trailColor="#f0f0f0"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Info row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={12}>
                  <Tooltip title={t('elevatorLive.door')}>
                    <Tag color={elevator.door === 'open' ? 'green' : 'default'} style={{ borderRadius: 6, fontSize: 10, margin: 0 }}>
                      {elevator.door === 'open' ? '◄ ►' : '►◄'}
                    </Tag>
                  </Tooltip>
                  {elevator.queue > 0 && (
                    <Tooltip title={t('elevatorLive.queue')}>
                      <Badge count={elevator.queue} size="small" style={{ backgroundColor: '#1890ff' }}>
                        <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Q</Text>
                      </Badge>
                    </Tooltip>
                  )}
                </Space>
                {elevator.idleTime && (
                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                    {t('elevatorLive.idle')} {elevator.idleTime}
                  </Text>
                )}
                {elevator.warning && (
                  <Tag color={elevator.status === 'critical' ? 'red' : 'orange'} style={{ borderRadius: 6, fontSize: 10, margin: 0 }}>
                    <WarningOutlined /> {elevator.warning}
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Right Drawer: Quick Actions */}
      <Drawer
        title={
          selectedElevator ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text strong style={{ fontSize: 20, fontFamily: 'monospace' }}>{selectedElevator.name}</Text>
              <Tag color={STATUS_COLOR[selectedElevator.status]} style={{ borderRadius: 8 }}>
                {selectedElevator.status}
              </Tag>
              <Tag color={MODE_CONFIG[selectedElevator.mode].color} style={{ borderRadius: 8 }}>
                {MODE_CONFIG[selectedElevator.mode].label}
              </Tag>
            </div>
          ) : ''
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={380}
      >
        {selectedElevator && (
          <>
            {/* Live status */}
            <Card size="small" style={{ borderRadius: 10, marginBottom: 16, background: '#fafafa' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.currentFloor')}</Text>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace' }}>
                    {selectedElevator.floorLabel} {DIRECTION_ICON[selectedElevator.direction]}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.load')}</Text>
                  <div>
                    <Text strong style={{ fontSize: 20, color: LOAD_COLOR(selectedElevator.load) }}>{selectedElevator.load}%</Text>
                  </div>
                  <Progress percent={selectedElevator.load} showInfo={false} size="small" strokeColor={LOAD_COLOR(selectedElevator.load)} />
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.door')}</Text>
                  <div>
                    <Tag color={selectedElevator.door === 'open' ? 'green' : 'default'} style={{ borderRadius: 6 }}>
                      {selectedElevator.door === 'open' ? t('elevatorLive.doorOpen') : t('elevatorLive.doorClosed')}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.queue')}</Text>
                  <div><Text strong style={{ fontSize: 16 }}>{selectedElevator.queue}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.floorRange')}</Text>
                  <div><Text style={{ fontSize: 13, fontFamily: 'monospace' }}>{selectedElevator.floorRange[0]} → {selectedElevator.floorRange[1]}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('elevatorLive.bank')}</Text>
                  <div><Tag color="blue" style={{ borderRadius: 6 }}>{t('elevatorLive.bank')} {selectedElevator.bank}</Tag></div>
                </Col>
              </Row>
            </Card>

            {selectedElevator.warning && (
              <Card size="small" style={{ borderRadius: 10, marginBottom: 16, background: selectedElevator.status === 'critical' ? '#fff1f0' : '#fffbe6', border: `1px solid ${selectedElevator.status === 'critical' ? '#ffa39e' : '#ffe58f'}` }}>
                <Space>
                  <WarningOutlined style={{ color: selectedElevator.status === 'critical' ? '#f5222d' : '#fa8c16' }} />
                  <Text strong style={{ color: selectedElevator.status === 'critical' ? '#f5222d' : '#fa8c16' }}>
                    {selectedElevator.warning}
                  </Text>
                </Space>
              </Card>
            )}

            <Divider style={{ margin: '12px 0' }}>{t('elevatorLive.quickActions')}</Divider>

            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <Button icon={<EyeOutlined />} block style={{ height: 44, borderRadius: 8, fontWeight: 500, textAlign: 'left' }}>
                {t('elevatorLive.viewDetail')}
              </Button>
              <Button
                icon={<StopOutlined />}
                block
                danger
                style={{ height: 44, borderRadius: 8, fontWeight: 500, textAlign: 'left' }}
              >
                {t('elevatorLive.setOutOfService')}
              </Button>
              <Button icon={<SoundOutlined />} block style={{ height: 44, borderRadius: 8, fontWeight: 500, textAlign: 'left', borderColor: '#fa8c16', color: '#fa8c16' }}>
                {t('elevatorLive.announceMessage')}
              </Button>
              <Button icon={<ToolOutlined />} block style={{ height: 44, borderRadius: 8, fontWeight: 500, textAlign: 'left', borderColor: '#722ed1', color: '#722ed1' }}>
                {t('elevatorLive.createWorkOrder')}
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  )
}
