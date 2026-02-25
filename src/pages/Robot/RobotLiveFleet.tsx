import { useEffect, useState, useMemo } from 'react'
import {
  Typography,
  Row,
  Col,
  Select,
  Tag,
  Badge,
  Progress,
  Tooltip,
  Button,
  Space,
  Descriptions,
  Timeline,
  Segmented,
  Card,
} from 'antd'
import {
  RobotOutlined,
  AimOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  EnvironmentOutlined,
  StopOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExpandOutlined,
  CarOutlined,
  LockOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, FilterBar, ContentCard, DetailDrawer } from '@/components'
import {
  getRobotLiveFleetFilters,
  saveRobotLiveFleetFilters,
  getRobotManagementItems,
} from '@/services/mockPersistence'
import type { RobotManagementItem } from './robotShared'
import { seedRobotManagementItems } from './robotShared'

const { Title, Text } = Typography

/* ── types ── */
interface RobotOnMap {
  id: string
  name: string
  x: number
  y: number
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

type RobotLiveFleetFilters = {
  selectedFloor: string
  selectedZone: string
  selectedStatus: string
  viewMode: string
}

/* ── component ── */
const RobotLiveFleet = () => {
  const { t } = useTranslation()

  const MAP_COLS = 10
  const MAP_ROWS = 7

  const statusFilters = [
    { value: 'all', label: t('robotFleet.allStatus') },
    { value: 'ok', label: 'OK' },
    { value: 'warning', label: t('robotFleet.warning') },
    { value: 'critical', label: t('robotFleet.critical') },
  ]

  const managementRobots = useMemo(
    () => getRobotManagementItems<RobotManagementItem>(seedRobotManagementItems),
    [],
  )

  const floors = useMemo(
    () => Array.from(new Set(managementRobots.map((robot) => robot.floor))).map((value) => ({ value, label: value })),
    [managementRobots],
  )

  const zones = useMemo(
    () => [
      { value: 'all', label: t('robotFleet.allZones') },
      ...Array.from(new Set(managementRobots.map((robot) => robot.zone))).map((value) => ({ value, label: value })),
    ],
    [managementRobots, t],
  )

  const mapSpots = [
    [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
    [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3],
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
  ] as const

  const allRobots: RobotOnMap[] = useMemo(() => {
    const directionCycle: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down']
    return managementRobots.map((robot, index) => {
      const [x, y] = mapSpots[index % mapSpots.length]
      const mappedStatus = robot.status === 'running'
        ? (robot.type === 'cleaning' ? 'clean' : robot.type === 'patrol' ? 'return' : 'deliver')
        : robot.status === 'charging'
          ? 'charging'
          : robot.status === 'error'
            ? 'stuck'
            : 'idle'
      const severity = robot.status === 'error'
        ? 'critical'
        : robot.status === 'offline'
          ? 'warning'
          : 'ok'
      const task = robot.status === 'charging'
        ? t('robotFleet.taskCharging')
        : robot.status === 'idle'
          ? t('robotFleet.taskIdle')
          : robot.type === 'cleaning'
            ? t('robotFleet.taskClean', { zone: `${robot.floor} ${robot.zone}` })
            : t('robotFleet.taskDeliver', { id: `#${robot.id}` })
      const direction = robot.status === 'running' ? directionCycle[index % directionCycle.length] : undefined
      return {
        id: robot.id,
        name: robot.id,
        x,
        y,
        status: mappedStatus,
        severity,
        battery: robot.battery,
        task,
        direction,
        floor: robot.floor,
        zone: robot.zone,
      }
    })
  }, [managementRobots, t])

  const mapGrid: MapCell[][] = useMemo(() => {
    const grid: MapCell[][] = Array.from({ length: MAP_ROWS }, () =>
      Array.from({ length: MAP_COLS }, () => ({ type: 'empty' as const }))
    )
    grid[0][0] = { type: 'dock', label: 'Dock A' }
    grid[0][1] = { type: 'dock' }
    grid[0][2] = { type: 'dock' }
    grid[1][0] = { type: 'dock' }
    for (let c = 3; c <= 8; c++) { grid[0][c] = { type: 'hallway' }; grid[1][c] = { type: 'hallway' } }
    grid[0][3] = { type: 'hallway', label: t('robotFleet.hallway') }
    for (let c = 1; c <= 8; c++) { grid[2][c] = { type: 'route' } }
    for (let c = 1; c <= 8; c++) { grid[3][c] = { type: 'route' } }
    grid[3][0] = { type: 'elevator', label: t('robotFleet.elevator') }
    grid[4][0] = { type: 'elevator' }
    grid[3][4] = { type: 'restricted' }
    grid[3][5] = { type: 'restricted', label: t('robotFleet.restricted') }
    grid[4][4] = { type: 'restricted' }
    grid[4][5] = { type: 'restricted' }
    grid[2][6] = { type: 'obstacle' }
    for (let c = 1; c <= 6; c++) { grid[5][c] = { type: 'lobby' }; grid[6][c] = { type: 'lobby' } }
    grid[5][1] = { type: 'lobby', label: t('robotFleet.lobby') }
    return grid
  }, [t])

  const persistedFilters = useMemo(
    () => getRobotLiveFleetFilters<RobotLiveFleetFilters>({
      selectedFloor: 'B1',
      selectedZone: 'all',
      selectedStatus: 'all',
      viewMode: 'map',
    }),
    [],
  )
  const [selectedFloor, setSelectedFloor] = useState(persistedFilters.selectedFloor)
  const [selectedZone, setSelectedZone] = useState(persistedFilters.selectedZone)
  const [selectedStatus, setSelectedStatus] = useState(persistedFilters.selectedStatus)
  const [selectedRobot, setSelectedRobot] = useState<RobotOnMap | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<string>(persistedFilters.viewMode)

  useEffect(() => {
    if (floors.length === 0) return
    const exists = floors.some((floor) => floor.value === selectedFloor)
    if (!exists) setSelectedFloor(floors[0].value)
  }, [floors, selectedFloor])

  useEffect(() => {
    if (selectedZone === 'all') return
    const exists = zones.some((zone) => zone.value === selectedZone)
    if (!exists) setSelectedZone('all')
  }, [zones, selectedZone])

  useEffect(() => {
    saveRobotLiveFleetFilters({
      selectedFloor,
      selectedZone,
      selectedStatus,
      viewMode,
    })
  }, [selectedFloor, selectedZone, selectedStatus, viewMode])

  const filteredRobots = useMemo(() => {
    return allRobots.filter(r => {
      if (r.floor !== selectedFloor) return false
      if (selectedZone !== 'all' && r.zone !== selectedZone) return false
      if (selectedStatus !== 'all' && r.severity !== selectedStatus) return false
      return true
    })
  }, [allRobots, selectedFloor, selectedZone, selectedStatus])

  useEffect(() => {
    if (!selectedRobot) return
    const stillVisible = filteredRobots.some((robot) => robot.id === selectedRobot.id)
    if (!stillVisible) {
      setSelectedRobot(null)
      setDrawerOpen(false)
    }
  }, [filteredRobots, selectedRobot])

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

  const dirArrow: Record<string, string> = { left: '←', right: '→', up: '↑', down: '↓' }

  const cellBg: Record<string, string> = {
    empty: '#fafafa', dock: '#e6f7ff', hallway: '#f0f0f0', lobby: '#f6ffed',
    elevator: '#fff7e6', restricted: '#fff1f0', obstacle: '#ffccc7', route: '#f9f0ff',
  }

  const cellBorder: Record<string, string> = {
    empty: '#f0f0f0', dock: '#91d5ff', hallway: '#d9d9d9', lobby: '#b7eb8f',
    elevator: '#ffd591', restricted: '#ffa39e', obstacle: '#ff7875', route: '#d3adf7',
  }

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

  const mockEvents = useMemo(() => [
    { time: '10:32', text: t('robotFleet.eventStart') },
    { time: '10:35', text: t('robotFleet.eventReach', { floor: 'B1 Zone 2' }) },
    { time: '10:38', text: t('robotFleet.eventCleaning') },
    { time: '10:41', text: t('robotFleet.eventObstacle') },
    { time: '10:42', text: t('robotFleet.eventResume') },
  ], [t])

  return (
    <PageContainer className="page-container--flex-col">
      <PageHeader title={t('robotFleet.title')} className="mb-12" />

      <ContentCard bodyStyle={{ padding: '10px 16px' }} className="mb-12 rounded-md">
        <FilterBar>
          <div className="flex items-center gap-6">
            <Text type="secondary" className="text-sm whitespace-nowrap">{t('robotFleet.floor')}:</Text>
            <Select size="small" value={selectedFloor} onChange={setSelectedFloor} options={floors} style={{ width: 80 }} />
          </div>
          <div className="flex items-center gap-6">
            <Text type="secondary" className="text-sm whitespace-nowrap">{t('robotFleet.zones')}:</Text>
            <Select size="small" value={selectedZone} onChange={setSelectedZone} options={zones} style={{ width: 120 }} />
          </div>
          <div className="flex items-center gap-6">
            <Text type="secondary" className="text-sm whitespace-nowrap">{t('robotFleet.filter')}:</Text>
            <Select size="small" value={selectedStatus} onChange={setSelectedStatus} options={statusFilters} style={{ width: 120 }} />
          </div>
          <div className="flex-1" />
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
        </FilterBar>
      </ContentCard>

      <Row gutter={12} className="flex-1 min-h-0">
        <Col xs={24} lg={16} className="mb-12">
          <ContentCard
            title={<><EnvironmentOutlined className="mr-2" />{t('robotFleet.map')} ({selectedFloor})</>}
            bodyStyle={{ padding: 12, overflow: 'auto' }}
            className="robot_card-rounded"
            titleExtra={
              <Space size={8}>
                <Tag className="robot_legend-tag"><span className="robot_legend-dot" style={{ background: cellBg.dock, border: `1px solid ${cellBorder.dock}` }} />{t('robotFleet.dock')}</Tag>
                <Tag className="robot_legend-tag"><span className="robot_legend-dot" style={{ background: cellBg.hallway, border: `1px solid ${cellBorder.hallway}` }} />{t('robotFleet.hallway')}</Tag>
                <Tag className="robot_legend-tag"><span className="robot_legend-dot" style={{ background: cellBg.lobby, border: `1px solid ${cellBorder.lobby}` }} />{t('robotFleet.lobby')}</Tag>
                <Tag className="robot_legend-tag"><span className="robot_legend-dot" style={{ background: cellBg.elevator, border: `1px solid ${cellBorder.elevator}` }} />{t('robotFleet.elevator')}</Tag>
                <Tag className="robot_legend-tag"><span className="robot_legend-dot" style={{ background: cellBg.restricted, border: `1px solid ${cellBorder.restricted}` }} />{t('robotFleet.restricted')}</Tag>
                <Tag className="robot_legend-tag"><WarningOutlined className="robot_warning-legend" />{t('robotFleet.obstacle')}</Tag>
              </Space>
            }
          >
            <div
              className="robot_map-grid"
              style={{ gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)`, gridTemplateRows: `repeat(${MAP_ROWS}, 1fr)` }}
            >
              {mapGrid.flatMap((row, ri) =>
                row.map((cell, ci) => {
                  const robot = getRobotAt(ri, ci)
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className="robot_map-cell"
                      style={{
                        background: cellBg[cell.type],
                        border: `1.5px solid ${cellBorder[cell.type]}`,
                        cursor: robot ? 'pointer' : 'default',
                        ...(robot ? { boxShadow: `0 0 0 2px ${severityConfig[robot.severity].color}40` } : {}),
                      }}
                      onClick={() => robot && handleRobotClick(robot)}
                    >
                      {cell.label && !robot && (
                        <Text className="robot_cell-label">{cell.label}</Text>
                      )}
                      {cell.type === 'obstacle' && !robot && (
                        <WarningOutlined className="robot_obstacle-icon" />
                      )}
                      {cell.type === 'restricted' && !cell.label && !robot && (
                        <LockOutlined className="robot_restricted-icon" />
                      )}
                      {robot && (
                        <Tooltip title={`${robot.name} — ${robot.task}`}>
                          <div className="robot_badge-col">
                            <Badge dot color={severityConfig[robot.severity].color} offset={[-2, 2]}>
                              <div
                                className="robot_badge-box"
                                style={{ background: severityConfig[robot.severity].color + '18', border: `2px solid ${severityConfig[robot.severity].color}` }}
                              >
                                <RobotOutlined className="text-lg" style={{ color: severityConfig[robot.severity].color }} />
                              </div>
                            </Badge>
                            <div className="robot_badge-name-row">
                              <Text className="robot_badge-name" style={{ color: severityConfig[robot.severity].color }}>
                                {robot.name}
                              </Text>
                              {robot.direction && (
                                <Text className="robot_badge-dir">{dirArrow[robot.direction]}</Text>
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
          </ContentCard>
        </Col>

        <Col xs={24} lg={8} className="mb-12">
          <ContentCard
            title={<><RobotOutlined className="mr-4" />{t('robotFleet.robotList')} ({filteredRobots.length})</>}
            bodyStyle={{ padding: 0, overflow: 'auto', maxHeight: 520 }}
            className="robot_card-rounded"
          >
            {filteredRobots.length === 0 ? (
              <div className="robot_empty-state">
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
                    className={`robot_list-item ${selectedRobot?.id === robot.id ? 'robot_list-item--selected' : ''}`}
                  >
                    <div className="flex-between mb-4">
                      <div className="flex items-center gap-8">
                        <div
                          className="robot_list-icon-box"
                          style={{ background: sev.color + '18', border: `1.5px solid ${sev.color}` }}
                        >
                          <RobotOutlined className="text-md" style={{ color: sev.color }} />
                        </div>
                        <div>
                          <Text strong className="text-base">{robot.name}</Text>
                          <Tag
                            color={sev.color === '#52c41a' ? 'success' : sev.color === '#faad14' ? 'warning' : 'error'}
                            className="robot_list-sev-tag"
                          >
                            {sev.text}
                          </Tag>
                        </div>
                      </div>
                      <Tag icon={st.icon} color={st.color} className="robot_list-status-tag">
                        {t(`robotFleet.status_${robot.status}`)}
                      </Tag>
                    </div>
                    <div className="flex-between">
                      <div className="robot_list-battery-row">
                        <ThunderboltOutlined className="text-sm" style={{ color: getBatteryColor(robot.battery) }} />
                        <Progress
                          percent={robot.battery}
                          size="small"
                          strokeColor={getBatteryColor(robot.battery)}
                          className="m-0"
                          style={{ width: 80 }}
                          format={(pct) => <Text className="text-xs">{pct}%</Text>}
                        />
                      </div>
                      <Text type="secondary" className="robot_list-task-text">{robot.task}</Text>
                    </div>
                  </div>
                )
              })
            )}
          </ContentCard>
        </Col>
      </Row>

      <DetailDrawer
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
              <div className="robot_drawer-header">
                <div
                  className="robot_drawer-avatar"
                  style={{ background: sev.color + '18', border: `2px solid ${sev.color}` }}
                >
                  <RobotOutlined className="text-3xl" style={{ color: sev.color }} />
                </div>
                <div>
                  <Title level={5} className="m-0">{selectedRobot.name}</Title>
                  <Space size={6}>
                    <Tag
                      color={sev.color === '#52c41a' ? 'success' : sev.color === '#faad14' ? 'warning' : 'error'}
                      className="rounded-sm"
                    >
                      {sev.text}
                    </Tag>
                    <Tag icon={st.icon} color={st.color} className="rounded-sm">
                      {t(`robotFleet.status_${selectedRobot.status}`)}
                    </Tag>
                  </Space>
                </div>
              </div>

              <Card size="small" className="robot_drawer-battery-card">
                <div className="flex items-center gap-8">
                  <ThunderboltOutlined className="text-xl" style={{ color: getBatteryColor(selectedRobot.battery) }} />
                  <div className="flex-1">
                    <Text type="secondary" className="text-11">{t('robotFleet.battery')}</Text>
                    <Progress
                      percent={selectedRobot.battery}
                      strokeColor={getBatteryColor(selectedRobot.battery)}
                      className="m-0"
                    />
                  </div>
                </div>
              </Card>

              <Descriptions column={1} size="small" bordered className="mb-16">
                <Descriptions.Item label={t('robotFleet.currentTask')}>{selectedRobot.task}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.floor')}>{selectedRobot.floor}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.zones')}>{selectedRobot.zone}</Descriptions.Item>
                <Descriptions.Item label={t('robotFleet.position')}>({selectedRobot.x}, {selectedRobot.y})</Descriptions.Item>
                {selectedRobot.direction && (
                  <Descriptions.Item label={t('robotFleet.direction')}>{dirArrow[selectedRobot.direction]} {t(`robotFleet.dir_${selectedRobot.direction}`)}</Descriptions.Item>
                )}
              </Descriptions>

              <Text strong className="block mb-8">{t('robotFleet.recentEvents')}</Text>
              <div className="pt-4">
                <Timeline
                  items={mockEvents.map((ev) => ({
                    children: (
                      <div>
                        <Text type="secondary" className="text-11 mr-4">{ev.time}</Text>
                        <Text className="text-sm">{ev.text}</Text>
                      </div>
                    ),
                  }))}
                />
              </div>

              <Space className="w-full mt-8" wrap>
                <Button type="primary" size="small" icon={<AimOutlined />}>{t('robotFleet.actionLocate')}</Button>
                <Button size="small" icon={<StopOutlined />} danger>{t('robotFleet.actionStop')}</Button>
                <Button size="small" icon={<HomeOutlined />}>{t('robotFleet.actionRecall')}</Button>
                <Button size="small" icon={<ReloadOutlined />}>{t('robotFleet.actionRestart')}</Button>
              </Space>
            </div>
          )
        })()}
      </DetailDrawer>
    </PageContainer>
  )
}

export default RobotLiveFleet
