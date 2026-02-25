import { useState } from 'react'
import {
  Row,
  Col,
  Typography,
  Select,
  Tag,
  Badge,
  Button,
  Tooltip,
  Segmented,
  Tabs,
  Empty,
  Modal,
  Descriptions,
  Divider,
  Timeline,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  LockOutlined,
  UnlockOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard, FilterBar } from '@/components'

const { Text } = Typography

type CellStatus = 'empty' | 'occupied' | 'reserved' | 'maintenance' | 'error'

interface Cell {
  id: number
  status: CellStatus
  size: 'S' | 'M' | 'L'
  session?: string
  user?: string
  since?: string
}

interface Locker {
  id: string
  name: string
  location: string
  floor: string
  online: boolean
  cells: Cell[]
}

const generateCells = (count: number): Cell[] => {
  return Array.from({ length: count }, (_, i) => {
    const r = Math.random()
    const status: CellStatus = r < 0.35 ? 'empty'
      : r < 0.7 ? 'occupied'
      : r < 0.85 ? 'reserved'
      : r < 0.95 ? 'maintenance'
      : 'error'
    return {
      id: i + 1,
      status,
      size: 'M' as const,
      session: status === 'occupied' ? `#S${1000 + Math.floor(Math.random() * 999)}` : undefined,
      user: status === 'occupied' ? `User ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}` : undefined,
      since: status === 'occupied' ? `${8 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
    }
  })
}

const lockers: Locker[] = [
  { id: 'L-1', name: 'Locker 1', location: 'Lobby A', floor: '1F', online: true, cells: generateCells(16) },
  { id: 'L-2', name: 'Locker 2', location: 'Lobby A', floor: '1F', online: true, cells: generateCells(20) },
  { id: 'L-3', name: 'Locker 3', location: 'Lobby B', floor: '1F', online: false, cells: generateCells(16) },
  { id: 'L-4', name: 'Locker 4', location: 'Hall C', floor: '2F', online: true, cells: generateCells(20) },
  { id: 'L-5', name: 'Locker 5', location: 'Hall C', floor: '2F', online: true, cells: generateCells(16) },
  { id: 'L-6', name: 'Locker 6', location: 'Lobby D', floor: '3F', online: true, cells: generateCells(20) },
  { id: 'L-7', name: 'Locker 7', location: 'Lobby D', floor: '3F', online: true, cells: generateCells(16) },
  { id: 'L-8', name: 'Locker 8', location: 'Basement', floor: 'B1', online: true, cells: generateCells(20) },
  { id: 'L-9', name: 'Locker 9', location: 'Basement', floor: 'B1', online: true, cells: generateCells(16) },
  { id: 'L-10', name: 'Locker 10', location: 'Hall E', floor: '4F', online: true, cells: generateCells(20) },
  { id: 'L-11', name: 'Locker 11', location: 'Hall E', floor: '4F', online: true, cells: generateCells(16) },
  { id: 'L-12', name: 'Locker 12', location: 'Lobby F', floor: '5F', online: true, cells: generateCells(16) },
]

const statusConfig: Record<CellStatus, { color: string; bg: string; border: string; labelKey: string }> = {
  empty:       { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', labelKey: 'lockerMap.statusEmpty' },
  occupied:    { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff', labelKey: 'lockerMap.statusOccupied' },
  reserved:    { color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7', labelKey: 'lockerMap.statusReserved' },
  maintenance: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', labelKey: 'lockerMap.statusMaintenance' },
  error:       { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', labelKey: 'lockerMap.statusError' },
}

function CellGrid({ cells, t, onCellClick }: { cells: Cell[]; t: (key: string, fallback?: string) => string; onCellClick?: (cell: Cell) => void }) {
  return (
    <div className="flex flex-wrap gap-8">
      {cells.map((cell) => {
        const cfg = statusConfig[cell.status]
        return (
          <Tooltip
            key={cell.id}
            title={
              <div className="text-sm">
                <div><strong>{t('lockerMap.cell', 'Cell')} #{cell.id}</strong></div>
                <div>{t(cfg.labelKey)}</div>
              </div>
            }
          >
            <div
              onClick={() => onCellClick?.(cell)}
              className="item_cell-box"
              style={{
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                color: cfg.color,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)'
                e.currentTarget.style.boxShadow = `0 2px 8px ${cfg.color}44`
                e.currentTarget.style.zIndex = '10'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.zIndex = '1'
              }}
            >
              {cell.id}
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

function CellDetailModal({
  cell,
  lockerId,
  open,
  onClose,
  t,
}: {
  cell: Cell | null
  lockerId: string
  open: boolean
  onClose: () => void
  t: (key: string, fallback?: string) => string
}) {
  if (!cell) return null
  const cfg = statusConfig[cell.status]

  const cellHistory = [
    { time: '10:32', action: t('lockerMap.historyOpened', 'Opened by user'), detail: cell.user || 'User A', color: 'blue' },
    { time: '09:15', action: t('lockerMap.historyDelivered', 'Package delivered'), detail: `${t('lockerMap.session', 'Session')} ${cell.session || '#S1001'}`, color: 'green' },
    { time: '08:40', action: t('lockerMap.historyReserved', 'Reserved'), detail: cell.user || 'User A', color: 'purple' },
    { time: '07:00', action: t('lockerMap.historyMaintenance', 'Maintenance check'), detail: t('lockerMap.historyPassed', 'Passed'), color: 'orange' },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex gap-8 justify-end">
          {cell.status === 'occupied' && (
            <Button type="primary" danger icon={<UnlockOutlined />}>
              {t('lockerMap.forceOpen', 'Force Open')}
            </Button>
          )}
          {cell.status === 'error' && (
            <Button type="primary" icon={<CheckCircleOutlined />} className="text-warning" style={{ background: '#faad14', borderColor: '#faad14' }}>
              {t('lockerMap.reportIssue', 'Report Issue')}
            </Button>
          )}
          <Button onClick={onClose}>{t('lockerMap.close', 'Close')}</Button>
        </div>
      }
      width={520}
      title={
        <div className="flex items-center gap-12">
          <div
            className="item_modal-title-box"
            style={{
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
              color: cfg.color,
            }}
          >
            {cell.id}
          </div>
          <div>
            <div className="text-lg font-semibold">
              {t('lockerMap.cell', 'Cell')} #{cell.id}
            </div>
            <Text type="secondary" className="text-sm">
              {lockerId} · {t('lockerMap.cell', 'Cell')} {cell.id}
            </Text>
          </div>
          <Tag
            className="m-0 ml-auto rounded text-sm px-3 py-0.5 font-semibold"
            style={{
              border: `1px solid ${cfg.border}`,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {t(cfg.labelKey)}
          </Tag>
        </div>
      }
    >
      {/* Status banner */}
      <div
        className="rounded-lg mb-20 flex items-center gap-12"
        style={{
          padding: '14px 18px',
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <InfoCircleOutlined className="text-2xl" style={{ color: cfg.color }} />
        <div>
          <Text strong className="text-base" style={{ color: cfg.color }}>
            {cell.status === 'empty' && t('lockerMap.detailEmpty', 'This cell is available for use')}
            {cell.status === 'occupied' && t('lockerMap.detailOccupied', 'This cell is currently in use')}
            {cell.status === 'reserved' && t('lockerMap.detailReserved', 'This cell has been reserved')}
            {cell.status === 'maintenance' && t('lockerMap.detailMaintenance', 'This cell is under maintenance')}
            {cell.status === 'error' && t('lockerMap.detailError', 'This cell has an error and needs attention')}
          </Text>
        </div>
      </div>

      {/* Detail info */}
      <Descriptions
        column={2}
        size="small"
        labelStyle={{ fontWeight: 600, color: '#666', fontSize: 12 }}
        contentStyle={{ fontSize: 13 }}
      >
        <Descriptions.Item label={<><InboxOutlined /> {t('lockerMap.locker', 'Locker')}</>}>
          {lockerId}
        </Descriptions.Item>
        <Descriptions.Item label={<><AppstoreOutlined /> {t('lockerMap.cellNumber', 'Cell No.')}</>}>
          #{cell.id}
        </Descriptions.Item>
        {cell.session && (
          <Descriptions.Item label={<><ClockCircleOutlined /> {t('lockerMap.session', 'Session')}</>}>
            <Tag color="blue" className="m-0 rounded-4">{cell.session}</Tag>
          </Descriptions.Item>
        )}
        {cell.user && (
          <Descriptions.Item label={<><UserOutlined /> {t('lockerMap.user', 'User')}</>}>
            {cell.user}
          </Descriptions.Item>
        )}
        {cell.since && (
          <Descriptions.Item label={<><ClockCircleOutlined /> {t('lockerMap.since', 'Since')}</>}>
            {cell.since}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={<><CheckCircleOutlined /> {t('lockerMap.statusLabel', 'Status')}</>}>
          <Badge color={cfg.color} text={<span className="font-semibold" style={{ color: cfg.color }}>{t(cfg.labelKey)}</span>} />
        </Descriptions.Item>
      </Descriptions>

      <Divider className="my-16" />

      {/* Activity history */}
      <div className="mb-8">
        <Text strong className="text-base flex items-center gap-6">
          <HistoryOutlined />
          {t('lockerMap.activityHistory', 'Activity History')}
        </Text>
      </div>
      <Timeline
        className="mt-12"
        items={cellHistory.map((h) => ({
          color: h.color,
          children: (
            <div className="flex items-center gap-8">
              <Tag className="m-0 rounded-4 text-11 font-semibold font-mono text-center" style={{ minWidth: 44 }}>
                {h.time}
              </Tag>
              <Text className="text-base">{h.action}</Text>
              <Text type="secondary" className="text-11">— {h.detail}</Text>
            </div>
          ),
        }))}
      />
    </Modal>
  )
}

function LockerCard({ locker, t, onCellClick }: { locker: Locker; t: (key: string, fallback?: string) => string; onCellClick?: (cell: Cell, lockerId: string) => void }) {
  const counts = {
    empty: locker.cells.filter(c => c.status === 'empty').length,
    occupied: locker.cells.filter(c => c.status === 'occupied').length,
    reserved: locker.cells.filter(c => c.status === 'reserved').length,
    maintenance: locker.cells.filter(c => c.status === 'maintenance').length,
    error: locker.cells.filter(c => c.status === 'error').length,
  }

  return (
    <ContentCard
      size="small"
      className="rounded-xl h-full"
      style={{ opacity: locker.online ? 1 : 0.7 }}
      bodyStyle={{ padding: '16px' }}
      title={
        <div className="flex-between">
          <div className="flex items-center gap-8">
            <Badge status={locker.online ? 'success' : 'error'} />
            <Text strong className="text-md">
              {locker.online ? <UnlockOutlined className="mr-4" /> : <LockOutlined className="mr-4" />}
              {locker.id}
            </Text>
          </div>
          <div className="flex items-center gap-6 text-11 text-muted">
            <EnvironmentOutlined />
            <span>{locker.location} · {locker.floor}</span>
          </div>
        </div>
      }
    >
      {/* Status summary */}
      <div className="flex gap-6 mb-12 flex-wrap">
        {(Object.keys(counts) as CellStatus[]).map((status) => (
          <Tag
            key={status}
            className="m-0 rounded-sm text-xs"
            style={{
              border: `1px solid ${statusConfig[status].border}`,
              background: statusConfig[status].bg,
              color: statusConfig[status].color,
            }}
          >
            {t(statusConfig[status].labelKey)}: {counts[status]}
          </Tag>
        ))}
      </div>

      {/* Cell grid */}
      <CellGrid cells={locker.cells} t={t} onCellClick={(cell) => onCellClick?.(cell, locker.id)} />
    </ContentCard>
  )
}

function LockerListItem({ locker, t, onCellClick }: { locker: Locker; t: (key: string, fallback?: string) => string; onCellClick?: (cell: Cell, lockerId: string) => void }) {
  const counts = {
    empty: locker.cells.filter(c => c.status === 'empty').length,
    occupied: locker.cells.filter(c => c.status === 'occupied').length,
    reserved: locker.cells.filter(c => c.status === 'reserved').length,
    maintenance: locker.cells.filter(c => c.status === 'maintenance').length,
    error: locker.cells.filter(c => c.status === 'error').length,
  }
  const total = locker.cells.length
  const occupancyPct = Math.round((counts.occupied / total) * 100)

  return (
    <ContentCard
      size="small"
      className="rounded-xl mb-12"
      style={{ opacity: locker.online ? 1 : 0.7 }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <Row gutter={16} align="middle">
        {/* Left: Locker info */}
        <Col xs={24} sm={6}>
          <div className="flex items-center gap-10">
            <div
              className="flex-center flex-shrink-0 text-white text-lg font-bold rounded-lg"
              style={{
                width: 44,
                height: 44,
                background: locker.online
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              }}
            >
              {locker.online ? <UnlockOutlined /> : <LockOutlined />}
            </div>
            <div>
              <Text strong className="text-md">{locker.id}</Text>
              <div className="flex items-center gap-4 text-11 text-muted">
                <EnvironmentOutlined />
                <span>{locker.location} · {locker.floor}</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Middle: Stats */}
        <Col xs={24} sm={10}>
          <div className="flex gap-12 flex-wrap">
            {(Object.keys(counts) as CellStatus[]).map((status) => (
              <div key={status} className="text-center">
                <div className="text-xl font-bold leading-none" style={{ color: statusConfig[status].color }}>
                  {counts[status]}
                </div>
                <div className="text-xs text-muted">{t(statusConfig[status].labelKey)}</div>
              </div>
            ))}
          </div>
        </Col>

        {/* Right: Occupancy & status */}
        <Col xs={24} sm={8}>
          <div className="flex items-center justify-end gap-16">
            <div className="text-center">
              <div className="text-2xl font-bold item_text-dark">{occupancyPct}%</div>
              <div className="text-xs text-muted">{t('lockerMap.occupancy', 'Occupancy')}</div>
            </div>
            <div className="text-center">
              <div className="text-md font-semibold item_text-dark">{total}</div>
              <div className="text-xs text-muted">{t('lockerMap.totalCells', 'Cells')}</div>
            </div>
            <Badge
              status={locker.online ? 'success' : 'error'}
              text={
                <span className="text-11">
                  {locker.online ? t('lockerMap.online', 'Online') : t('lockerMap.offline', 'Offline')}
                </span>
              }
            />
            {counts.error > 0 && (
              <Tag color="error" className="m-0 rounded-sm text-xs">
                <WarningOutlined /> {counts.error} {t('lockerMap.errors', 'errors')}
              </Tag>
            )}
          </div>
        </Col>
      </Row>

      {/* Cell grid row */}
      <div className="item_cell-grid-row">
        <CellGrid cells={locker.cells} t={t} onCellClick={(cell) => onCellClick?.(cell, locker.id)} />
      </div>
    </ContentCard>
  )
}

export default function LockerMap() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<string>('grid')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
  const [selectedLockerId, setSelectedLockerId] = useState('')
  const [cellModalOpen, setCellModalOpen] = useState(false)

  const handleCellClick = (cell: Cell, lockerId: string) => {
    setSelectedCell(cell)
    setSelectedLockerId(lockerId)
    setCellModalOpen(true)
  }

  const floors = [...new Set(lockers.map(l => l.floor))]

  const filteredLockers = lockers.filter(l => {
    if (floorFilter !== 'all' && l.floor !== floorFilter) return false
    if (statusFilter === 'online' && !l.online) return false
    if (statusFilter === 'offline' && l.online) return false
    return true
  })

  const allCells = lockers.flatMap(l => l.cells)
  const summary = {
    total: allCells.length,
    empty: allCells.filter(c => c.status === 'empty').length,
    occupied: allCells.filter(c => c.status === 'occupied').length,
    reserved: allCells.filter(c => c.status === 'reserved').length,
    maintenance: allCells.filter(c => c.status === 'maintenance').length,
    error: allCells.filter(c => c.status === 'error').length,
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('lockerMap.title', 'Locker Cell Map')}
        icon={<InboxOutlined />}
        subtitle={t('lockerMap.subtitle', 'Visual layout of all locker cells and their status')}
        actions={
          <FilterBar>
            <Segmented
              value={viewMode}
              onChange={(val) => setViewMode(val as string)}
              options={[
                { value: 'grid', icon: <AppstoreOutlined />, label: t('lockerMap.gridView', 'Grid') },
                { value: 'list', icon: <UnorderedListOutlined />, label: t('lockerMap.listView', 'List') },
              ]}
              className="vehicle_segmented"
            />
            <div className="item_divider-v mx-4" />
            <Select
              value={floorFilter}
              className="vehicle_filter-select-w120"
              size="small"
              onChange={setFloorFilter}
              options={[
                { value: 'all', label: t('lockerMap.allFloors', 'All Floors') },
                ...floors.map(f => ({ value: f, label: f })),
              ]}
            />
            <Select
              value={statusFilter}
              className="vehicle_filter-select-w130"
              size="small"
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: t('lockerMap.allStatus', 'All Status') },
                { value: 'online', label: t('lockerMap.online', 'Online') },
                { value: 'offline', label: t('lockerMap.offline', 'Offline') },
              ]}
            />
            <Tooltip title={t('lockerMap.refresh', 'Refresh')}>
              <Button size="small" icon={<ReloadOutlined />} />
            </Tooltip>
          </FilterBar>
        }
      />

      {/* ── Legend & Summary ──────────────────────────── */}
      <ContentCard
        size="small"
        className="rounded-xl mb-20"
        bodyStyle={{ padding: '14px 20px' }}
      >
        <div className="flex-between flex-wrap gap-12">
          {/* Legend */}
          <div className="flex gap-16 flex-wrap items-center">
            <Text strong className="text-sm">{t('lockerMap.legend', 'Legend')}:</Text>
            {(Object.keys(statusConfig) as CellStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-4">
                <div
                  className="item_legend-dot"
                  style={{
                    background: statusConfig[status].bg,
                    border: `1.5px solid ${statusConfig[status].border}`,
                  }}
                />
                <Text className="text-11 text-secondary">{t(statusConfig[status].labelKey)}</Text>
              </div>
            ))}
          </div>

          {/* Summary numbers */}
          <div className="flex gap-16 flex-wrap">
            <Text className="text-sm">
              <strong>{summary.total}</strong> {t('lockerMap.totalCells', 'cells')}
            </Text>
            <Text className="text-sm" style={{ color: statusConfig.empty.color }}>
              <CheckCircleOutlined /> {summary.empty} {t('lockerMap.statusEmpty', 'empty')}
            </Text>
            <Text className="text-sm" style={{ color: statusConfig.occupied.color }}>
              <InboxOutlined /> {summary.occupied} {t('lockerMap.statusOccupied', 'occupied')}
            </Text>
            <Text className="text-sm" style={{ color: statusConfig.error.color }}>
              <CloseCircleOutlined /> {summary.error} {t('lockerMap.statusError', 'error')}
            </Text>
          </div>
        </div>
      </ContentCard>

      {/* ── Content ──────────────────────────────────── */}
      {filteredLockers.length === 0 ? (
        <ContentCard className="rounded-xl">
          <Empty description={t('lockerMap.noLockers', 'No lockers found')} />
        </ContentCard>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ─────────────────────────────── */
        <Row gutter={[16, 16]}>
          {filteredLockers.map((locker) => (
            <Col xs={24} lg={12} key={locker.id}>
              <LockerCard locker={locker} t={t} onCellClick={handleCellClick} />
            </Col>
          ))}
        </Row>
      ) : (
        /* ── Tab/List View ─────────────────────────── */
        <Tabs
          type="card"
          size="small"
          items={floors.map((floor) => {
            const floorLockers = filteredLockers.filter(l => l.floor === floor)
            return {
              key: floor,
              label: (
                <span>
                  {floor} <Badge count={floorLockers.length} size="small" className="ml-4" />
                </span>
              ),
              children: floorLockers.length === 0 ? (
                <Empty description={t('lockerMap.noLockersOnFloor', 'No lockers on this floor')} />
              ) : (
                floorLockers.map((locker) => (
                  <LockerListItem key={locker.id} locker={locker} t={t} onCellClick={handleCellClick} />
                ))
              ),
            }
          })}
        />
      )}

      {/* Cell Detail Modal */}
      <CellDetailModal
        cell={selectedCell}
        lockerId={selectedLockerId}
        open={cellModalOpen}
        onClose={() => setCellModalOpen(false)}
        t={t}
      />
    </PageContainer>
  )
}
