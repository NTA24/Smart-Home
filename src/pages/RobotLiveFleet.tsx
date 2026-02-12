import { useState, useMemo } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Select,
  Tag,
  Badge,
  Progress,
  Tooltip,
  Drawer,
  Button,
  Space,
  Descriptions,
  Timeline,
  Segmented,
} from 'antd'
import {
  RobotOutlined,
  AimOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExpandOutlined,
  CarOutlined,
  LockOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Text, Title } = Typography

/* ── types ── */
interface RobotOnMap {
  id: string
  name: string
  x: number          // grid col (0-based)
  y: number          // grid row (0-based)
  status: 'clean' | 'deliver' | 'return' | 'idle' | 'stuck' | 'charging' | 'docking'
  severity: 'ok' | 'warning' | 'critical'
  battery: number
  task: string
  direction?: 'left' | 'right' | 'up' | 'down'
  floor: string
  zone: string
}

interface MapCell {
  type: 'empty' | 'dock' | 'hallway' | 'lobby' | 'elevator' | 'restricted' | 'obstacle' | 'route'
  label?: string
}

/* ── component ── */
const RobotLiveFleet = () => {
  const { t } = useTranslation()

  /* ── map definition: 8 cols x 6 rows ── */
  const MAP_COLS = 10
  const MAP_ROWS = 7

  const floors = [
    { value: 'B1', label: 'B1' },
    { value: '1F', label: '1F' },
    { value: '2F', label: '2F' },
  ]

  const zones = [
    { value: 'all', label: t('robotFleet.allZones') },
    { value: 'dock-a', label: 'Dock A' },
    { value: 'hallway', label: t('robotFleet.hallway') },
    { value: 'lobby', label: t('robotFleet.lobby') },
  ]

  const statusFilters = [
    { value: 'all', label: t('robotFleet.allStatus') },
    { value: 'ok', label: 'OK' },
    { value: 'warning', label: t('robotFleet.warning') },
    { value: 'critical', label: t('robotFleet.critical') },
  ]

  /* mock robots */
  const allRobots: RobotOnMap[] = useMemo(() => [
    { id: 'R-01', name: 'R-01', x: 2, y: 1, status: 'clean', severity: 'ok', battery: 68, task: t('robotFleet.taskClean', { zone: 'B1 Zone 2' }), direction: 'right', floor: 'B1', zone: 'dock-a' },
    { id: 'R-03', name: 'R-03', x: 3, y: 5, status: 'deliver', severity: 'ok', battery: 55, task: t('robotFleet.taskDeliver', { id: '#A103' }), direction: 'right', floor: 'B1', zone: 'lobby' },
    { id: 'R-04', name: 'R-04', x: 4, y: 5, status: 'deliver', severity: 'ok', battery: 44, task: t('robotFleet.taskDeliver', { id: '#A104' }), direction: 'right', floor: 'B1', zone: 'lobby' },
    { id: 'R-07', name: 'R-07', x: 7, y: 1, status: 'stuck', severity: 'critical', battery: 32, task: t('robotFleet.taskDeliver', { id: '#A102' }), floor: 'B1', zone: 'hallway' },
    { id: 'R-12', name: 'R-12', x: 7, y: 4, status: 'return', severity: 'warning', battery: 14, task: t('robotFleet.taskDocking'), direction: 'left', floor: 'B1', zone: 'hallway' },
    { id: 'R-05', name: 'R-05', x: 1, y: 1, status: 'charging', severity: 'ok', battery: 88, task: t('robotFleet.taskCharging'), floor: 'B1', zone: 'dock-a' },
    { id: 'R-09', name: 'R-09', x: 5, y: 3, status: 'idle', severity: 'ok', battery: 72, task: t('robotFleet.taskIdle'), floor: 'B1', zone: 'hallway' },
  ], [t])

  /* map cells */
  const mapGrid: MapCell[][] = useMemo(() => {
    const grid: MapCell[][] = Array.from({ length: MAP_ROWS }, () =>
      Array.from({ length: MAP_COLS }, () => ({ type: 'empty' as const }))
    )
    // Dock A
    grid[0][0] = { type: 'dock', label: 'Dock A' }
    grid[0][1] = { type: 'dock' }
    grid[0][2] = { type: 'dock' }
    grid[1][0] = { type: 'dock' }
    // Hallway
    for (let c = 3; c <= 8; c++) { grid[0][c] = { type: 'hallway' }; grid[1][c] = { type: 'hallway' } }
    grid[0][3] = { type: 'hallway', label: t('robotFleet.hallway') }
    // Route lines
    for (let c = 1; c <= 8; c++) { grid[2][c] = { type: 'route' } }
    for (let c = 1; c <= 8; c++) { grid[3][c] = { type: 'route' } }
    // Elevator
    grid[3][0] = { type: 'elevator', label: t('robotFleet.elevator') }
    grid[4][0] = { type: 'elevator' }
    // Restricted zone
    grid[3][4] = { type: 'restricted' }
    grid[3][5] = { type: 'restricted', label: t('robotFleet.restricted') }
    grid[4][4] = { type: 'restricted' }
    grid[4][5] = { type: 'restricted' }
    // Obstacle
    grid[2][6] = { type: 'obstacle' }
    // Lobby
    for (let c = 1; c <= 6; c++) { grid[5][c] = { type: 'lobby' }; grid[6][c] = { type: 'lobby' } }
    grid[5][1] = { type: 'lobby', label: t('robotFleet.lobby') }
    return grid
  }, [t])

  /* ── state ── */
  const [selectedFloor, setSelectedFloor] = useState('B1')
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRobot, setSelectedRobot] = useState<RobotOnMap | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<string>('map')

  /* filter */
  const filteredRobots = useMemo(() => {
    return allRobots.filter(r => {
      if (r.floor !== selectedFloor) return false
      if (selectedZone !== 'all' && r.zone !== selectedZone) return false
      if (selectedStatus !== 'all' && r.severity !== selectedStatus) return false
      return true
    })
  }, [allRobots, selectedFloor, selectedZone, selectedStatus])

  /* severity config */
  const severityConfig: Record<string, { color: string; text: string }> = {
    ok: { color: '#52c41a', text: 'OK' },
    warning: { color: '#faad14', text: t('robotFleet.warning') },
    critical: { color: '#ff4d4f', text: t('robotFleet.critical') },
  }

  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    clean: { color: 'blue', icon: <AimOutlined /> },
    deliver: { color: 'cyan', icon: <CarOutlined /> },
    return: { color: 'orange', icon: <ReloadOutlined /> },
    idle: { color: 'default', icon: <ClockCircleOutlined /> },
    stuck: { color: 'red', icon: <StopOutlined /> },
    charging: { color: 'green', icon: <ThunderboltOutlined /> },
    docking: { color: 'purple', icon: <HomeOutlined /> },
  }

  /* direction arrow */
  const dirArrow: Record<string, string> = { left: '←', right: '→', up: '↑', down: '↓' }

  /* cell colors */
  const cellBg: Record<string, string> = {
    empty: '#fafafa',
    dock: '#e6f7ff',
    hallway: '#f0f0f0',
    lobby: '#f6ffed',
    elevator: '#fff7e6',
    restricted: '#fff1f0',
    obstacle: '#ffccc7',
    route: '#f9f0ff',
  }

  const cellBorder: Record<string, string> = {
    empty: '#f0f0f0',
    dock: '#91d5ff',
    hallway: '#d9d9d9',
    lobby: '#b7eb8f',
    elevator: '#ffd591',
    restricted: '#ffa39e',
    obstacle: '#ff7875',
    route: '#d3adf7',
  }

  /* robot badge on map */
  const getRobotAt = (row: number, col: number) => filteredRobots.find(r => r.y === row && r.x === col)

  const getBatteryColor = (pct: number) => {
    if (pct <= 20) return '#ff4d4f'
    if (pct <= 40) return '#faad14'
    return '#52c41a'
  }

  const handleRobotClick = (robot: RobotOnMap) => {
    setSelectedRobot(robot)
    setDrawerOpen(true)
  }

  /* mock events for drawer */
  const mockEvents = useMemo(() => [
    { time: '10:32', text: t('robotFleet.eventStart') },
    { time: '10:35', text: t('robotFleet.eventReach', { floor: 'B1 Zone 2' }) },
    { time: '10:38', text: t('robotFleet.eventCleaning') },
    { time: '10:41', text: t('robotFleet.eventObstacle') },
    { time: '10:42', text: t('robotFleet.eventResume') },
  ], [t])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Title ── */}
      <div style={{ marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>{t('robotFleet.title')}</Title>
      </div>

      {/* ── Toolbar ── */}
      <Card bordered={false} bodyStyle={{ padding: '10px 16px' }} style={{ marginBottom: 12, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{t('robotFleet.floor')}:</Text>
            <Select size="small" value={selectedFloor} onChange={setSelectedFloor} options={floors} style={{ width: 80 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{t('robotFleet.zones')}:</Text>
            <Select size="small" value={selectedZone} onChange={setSelectedZone} options={zones} style={{ width: 120 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{t('robotFleet.filter')}:</Text>
            <Select size="small" value={selectedStatus} onChange={setSelectedStatus} options={statusFilters} style={{ width: 120 }} />
          </div>
          <div style={{ flex: 1 }} />
          <Segmented
            size="small"
            value={viewMode}
            onChange={(v) => setViewMode(v as string)}
            options={[
              { value: 'map', label: t('robotFleet.mapView') },
              { value: 'list', label: t('robotFleet.listView') },
            ]}
          />
          <Button size="small" icon={<ExpandOutlined />} />
        </div>
      </Card>

      {/* ── Main content ── */}
      <Row gutter={12} style={{ flex: 1, minHeight: 0 }}>
        {/* MAP */}
        <Col xs={24} lg={16} style={{ marginBottom: 12 }}>
          <Card
            bordered={false}
            title={<span><EnvironmentOutlined style={{ marginRight: 6 }} />{t('robotFleet.map')} ({selectedFloor})</span>}
            bodyStyle={{ padding: 12, overflow: 'auto' }}
            style={{ borderRadius: 10, height: '100%' }}
            extra={
              <Space size={8}>
                <Tag style={{ margin: 0, borderRadius: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: cellBg.dock, border: `1px solid ${cellBorder.dock}`, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t('robotFleet.dock')}</Tag>
                <Tag style={{ margin: 0, borderRadius: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: cellBg.hallway, border: `1px solid ${cellBorder.hallway}`, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t('robotFleet.hallway')}</Tag>
                <Tag style={{ margin: 0, borderRadius: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: cellBg.lobby, border: `1px solid ${cellBorder.lobby}`, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t('robotFleet.lobby')}</Tag>
                <Tag style={{ margin: 0, borderRadius: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: cellBg.elevator, border: `1px solid ${cellBorder.elevator}`, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t('robotFleet.elevator')}</Tag>
                <Tag style={{ margin: 0, borderRadius: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: cellBg.restricted, border: `1px solid ${cellBorder.restricted}`, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />{t('robotFleet.restricted')}</Tag>
                <Tag style={{ margin: 0, borderRadius: 4 }}><WarningOutlined style={{ color: '#ff7875', marginRight: 4 }} />{t('robotFleet.obstacle')}</Tag>
              </Space>
            }
          >
            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${MAP_ROWS}, 1fr)`,
              gap: 3,
              minHeight: 420,
            }}>
              {mapGrid.flatMap((row, ri) =>
                row.map((cell, ci) => {
                  const robot = getRobotAt(ri, ci)
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      style={{
                        background: cellBg[cell.type],
                        border: `1.5px solid ${cellBorder[cell.type]}`,
                        borderRadius: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        minHeight: 56,
                        cursor: robot ? 'pointer' : 'default',
                        transition: 'box-shadow .2s',
                        ...(robot ? { boxShadow: `0 0 0 2px ${severityConfig[robot.severity].color}40` } : {}),
                      }}
                      onClick={() => robot && handleRobotClick(robot)}
                    >
                      {/* cell label */}
                      {cell.label && !robot && (
                        <Text style={{ fontSize: 9, color: '#8c8c8c', textAlign: 'center', lineHeight: 1.1 }}>
                          {cell.label}
                        </Text>
                      )}

                      {/* obstacle */}
                      {cell.type === 'obstacle' && !robot && (
                        <WarningOutlined style={{ fontSize: 18, color: '#ff7875' }} />
                      )}

                      {/* restricted icon */}
                      {cell.type === 'restricted' && !cell.label && !robot && (
                        <LockOutlined style={{ fontSize: 14, color: '#ff7875' }} />
                      )}

                      {/* robot */}
                      {robot && (
                        <Tooltip title={`${robot.name} — ${robot.task}`}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Badge
                              dot
                              color={severityConfig[robot.severity].color}
                              offset={[-2, 2]}
                            >
                              <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: severityConfig[robot.severity].color + '18',
                                border: `2px solid ${severityConfig[robot.severity].color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <RobotOutlined style={{ fontSize: 16, color: severityConfig[robot.severity].color }} />
                              </div>
                            </Badge>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Text style={{ fontSize: 10, fontWeight: 600, color: severityConfig[robot.severity].color }}>
                                {robot.name}
                              </Text>
                              {robot.direction && (
                                <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{dirArrow[robot.direction]}</Text>
                              )}
                            </div>
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </Col>

        {/* Robot List (right) */}
        <Col xs={24} lg={8} style={{ marginBottom: 12 }}>
          <Card
            bordered={false}
            title={<span><RobotOutlined style={{ marginRight: 6 }} />{t('robotFleet.robotList')} ({filteredRobots.length})</span>}
            bodyStyle={{ padding: 0, overflow: 'auto', maxHeight: 520 }}
            style={{ borderRadius: 10, height: '100%' }}
          >
            {filteredRobots.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Text type="secondary">{t('common.noData')}</Text>
              </div>
            ) : (
              filteredRobots.map((robot) => {
                const sev = severityConfig[robot.severity]
                const st = statusConfig[robot.status]
                return (
                  <div
                    key={robot.id}
                    onClick={() => handleRobotClick(robot)}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'background .15s',
                      background: selectedRobot?.id === robot.id ? '#e6f7ff' : 'transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = selectedRobot?.id === robot.id ? '#e6f7ff' : '#fafafa' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedRobot?.id === robot.id ? '#e6f7ff' : 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: sev.color + '18',
                          border: `1.5px solid ${sev.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <RobotOutlined style={{ fontSize: 14, color: sev.color }} />
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 13 }}>{robot.name}</Text>
                          <Tag
                            color={sev.color === '#52c41a' ? 'success' : sev.color === '#faad14' ? 'warning' : 'error'}
                            style={{ marginLeft: 6, borderRadius: 4, fontSize: 10, padding: '0 4px' }}
                          >
                            {sev.text}
                          </Tag>
                        </div>
                      </div>
                      <Tag
                        icon={st.icon}
                        color={st.color}
                        style={{ borderRadius: 6, fontSize: 11, margin: 0 }}
                      >
                        {t(`robotFleet.status_${robot.status}`)}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThunderboltOutlined style={{ fontSize: 12, color: getBatteryColor(robot.battery) }} />
                        <Progress
                          percent={robot.battery}
                          size="small"
                          strokeColor={getBatteryColor(robot.battery)}
                          style={{ width: 80, margin: 0 }}
                          format={(pct) => <Text style={{ fontSize: 10 }}>{pct}%</Text>}
                        />
                      </div>
                      <Text type="secondary" style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {robot.task}
                      </Text>
                    </div>
                  </div>
                )
              })
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={selectedRobot ? `${selectedRobot.name} — ${t('robotFleet.detail')}` : ''}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {selectedRobot && (() => {
          const sev = severityConfig[selectedRobot.severity]
          const st = statusConfig[selectedRobot.status]
          return (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: sev.color + '18',
                  border: `2px solid ${sev.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RobotOutlined style={{ fontSize: 24, color: sev.color }} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{selectedRobot.name}</Title>
                  <Space size={6}>
                    <Tag
                      color={sev.color === '#52c41a' ? 'success' : sev.color === '#faad14' ? 'warning' : 'error'}
                      style={{ borderRadius: 4 }}
                    >
                      {sev.text}
                    </Tag>
                    <Tag icon={st.icon} color={st.color} style={{ borderRadius: 4 }}>
                      {t(`robotFleet.status_${selectedRobot.status}`)}
                    </Tag>
                  </Space>
                </div>
              </div>

              {/* Battery */}
              <Card size="small" style={{ marginBottom: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThunderboltOutlined style={{ color: getBatteryColor(selectedRobot.battery), fontSize: 18 }} />
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>{t('robotFleet.battery')}</Text>
                    <Progress
                      percent={selectedRobot.battery}
                      strokeColor={getBatteryColor(selectedRobot.battery)}
                      style={{ margin: 0 }}
                    />
                  </div>
                </div>
              </Card>

              {/* Info */}
              <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label={t('robotFleet.currentTask')}>{selectedRobot.task}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.floor')}>{selectedRobot.floor}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.zones')}>{selectedRobot.zone}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.position')}>({selectedRobot.x}, {selectedRobot.y})</Descriptions.Item>
                {selectedRobot.direction && (
                  <Descriptions.Item label={t('robotFleet.direction')}>{dirArrow[selectedRobot.direction]} {t(`robotFleet.dir_${selectedRobot.direction}`)}</Descriptions.Item>
                )}
              </Descriptions>

              {/* Recent Events */}
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('robotFleet.recentEvents')}</Text>
              <div style={{ paddingTop: 4 }}>
                <Timeline
                  items={mockEvents.map((ev) => ({
                    children: (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11, marginRight: 6 }}>{ev.time}</Text>
                        <Text style={{ fontSize: 12 }}>{ev.text}</Text>
                      </div>
                    ),
                  }))}
                />
              </div>

              {/* Actions */}
              <Space style={{ width: '100%', marginTop: 8 }} wrap>
                <Button type="primary" size="small" icon={<AimOutlined />}>{t('robotFleet.actionLocate')}</Button>
                <Button size="small" icon={<StopOutlined />} danger>{t('robotFleet.actionStop')}</Button>
                <Button size="small" icon={<HomeOutlined />}>{t('robotFleet.actionRecall')}</Button>
                <Button size="small" icon={<ReloadOutlined />}>{t('robotFleet.actionRestart')}</Button>
              </Space>
            </div>
          )
        })()}
      </Drawer>
    </div>
  )
}

export default RobotLiveFleet
