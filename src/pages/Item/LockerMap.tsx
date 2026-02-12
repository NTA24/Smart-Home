import { useState } from 'react'
import {
  Row,
  Col,
  Card,
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

const { Title, Text } = Typography

// ─── Cell status type ───────────────────────────────────────
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

// ─── Mock Data ──────────────────────────────────────────────
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

// ─── Status config ──────────────────────────────────────────
const statusConfig: Record<CellStatus, { color: string; bg: string; border: string; labelKey: string }> = {
  empty:       { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', labelKey: 'lockerMap.statusEmpty' },
  occupied:    { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff', labelKey: 'lockerMap.statusOccupied' },
  reserved:    { color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7', labelKey: 'lockerMap.statusReserved' },
  maintenance: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', labelKey: 'lockerMap.statusMaintenance' },
  error:       { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', labelKey: 'lockerMap.statusError' },
}

// ─── Cell Grid Component ────────────────────────────────────
function CellGrid({ cells, t, onCellClick }: { cells: Cell[]; t: (key: string, fallback?: string) => string; onCellClick?: (cell: Cell) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {cells.map((cell) => {
        const cfg = statusConfig[cell.status]
        return (
          <Tooltip
            key={cell.id}
            title={
              <div style={{ fontSize: 12 }}>
                <div><strong>{t('lockerMap.cell', 'Cell')} #{cell.id}</strong></div>
                <div>{t(cfg.labelKey)}</div>
              </div>
            }
          >
            <div
              onClick={() => onCellClick?.(cell)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: cfg.color,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
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

// ─── Cell Detail Modal ──────────────────────────────────────
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

  // Mock history for the cell
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
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {cell.status === 'occupied' && (
            <Button type="primary" danger icon={<UnlockOutlined />}>
              {t('lockerMap.forceOpen', 'Force Open')}
            </Button>
          )}
          {cell.status === 'error' && (
            <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#faad14', borderColor: '#faad14' }}>
              {t('lockerMap.reportIssue', 'Report Issue')}
            </Button>
          )}
          <Button onClick={onClose}>{t('lockerMap.close', 'Close')}</Button>
        </div>
      }
      width={520}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: cfg.color,
            }}
          >
            {cell.id}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {t('lockerMap.cell', 'Cell')} #{cell.id}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {lockerId} · {t('lockerMap.cell', 'Cell')} {cell.id}
            </Text>
          </div>
          <Tag
            style={{
              margin: 0,
              marginLeft: 'auto',
              borderRadius: 8,
              fontSize: 12,
              padding: '2px 12px',
              fontWeight: 600,
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
        style={{
          padding: '14px 18px',
          borderRadius: 12,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <InfoCircleOutlined style={{ fontSize: 20, color: cfg.color }} />
        <div>
          <Text strong style={{ color: cfg.color, fontSize: 13 }}>
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
            <Tag color="blue" style={{ margin: 0, borderRadius: 4 }}>{cell.session}</Tag>
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
          <Badge color={cfg.color} text={<span style={{ color: cfg.color, fontWeight: 600 }}>{t(cfg.labelKey)}</span>} />
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '16px 0' }} />

      {/* Activity history */}
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <HistoryOutlined />
          {t('lockerMap.activityHistory', 'Activity History')}
        </Text>
      </div>
      <Timeline
        style={{ marginTop: 12 }}
        items={cellHistory.map((h) => ({
          color: h.color,
          children: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag style={{ margin: 0, borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'monospace', minWidth: 44, textAlign: 'center' }}>
                {h.time}
              </Tag>
              <Text style={{ fontSize: 13 }}>{h.action}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>— {h.detail}</Text>
            </div>
          ),
        }))}
      />
    </Modal>
  )
}

// ─── Locker Card (Grid View) ────────────────────────────────
function LockerCard({ locker, t, onCellClick }: { locker: Locker; t: (key: string, fallback?: string) => string; onCellClick?: (cell: Cell, lockerId: string) => void }) {
  const counts = {
    empty: locker.cells.filter(c => c.status === 'empty').length,
    occupied: locker.cells.filter(c => c.status === 'occupied').length,
    reserved: locker.cells.filter(c => c.status === 'reserved').length,
    maintenance: locker.cells.filter(c => c.status === 'maintenance').length,
    error: locker.cells.filter(c => c.status === 'error').length,
  }

  return (
    <Card
      size="small"
      style={{
        borderRadius: 14,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        height: '100%',
        opacity: locker.online ? 1 : 0.7,
      }}
      styles={{ body: { padding: '16px' } }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge status={locker.online ? 'success' : 'error'} />
            <Text strong style={{ fontSize: 14 }}>
              {locker.online ? <UnlockOutlined style={{ marginRight: 4 }} /> : <LockOutlined style={{ marginRight: 4 }} />}
              {locker.id}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8c8c8c' }}>
            <EnvironmentOutlined />
            <span>{locker.location} · {locker.floor}</span>
          </div>
        </div>
      }
    >
      {/* Status summary */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(counts) as CellStatus[]).map((status) => (
          <Tag
            key={status}
            style={{
              margin: 0,
              borderRadius: 6,
              fontSize: 10,
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
    </Card>
  )
}

// ─── Locker Row (Tab/List View) ─────────────────────────────
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
    <Card
      size="small"
      style={{
        borderRadius: 14,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        marginBottom: 12,
        opacity: locker.online ? 1 : 0.7,
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Row gutter={16} align="middle">
        {/* Left: Locker info */}
        <Col xs={24} sm={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: locker.online
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {locker.online ? <UnlockOutlined /> : <LockOutlined />}
            </div>
            <div>
              <Text strong style={{ fontSize: 15 }}>{locker.id}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8c8c8c' }}>
                <EnvironmentOutlined />
                <span>{locker.location} · {locker.floor}</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Middle: Stats */}
        <Col xs={24} sm={10}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(Object.keys(counts) as CellStatus[]).map((status) => (
              <div key={status} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: statusConfig[status].color, lineHeight: 1 }}>
                  {counts[status]}
                </div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t(statusConfig[status].labelKey)}</div>
              </div>
            ))}
          </div>
        </Col>

        {/* Right: Occupancy & status */}
        <Col xs={24} sm={8}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{occupancyPct}%</div>
              <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('lockerMap.occupancy', 'Occupancy')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{total}</div>
              <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('lockerMap.totalCells', 'Cells')}</div>
            </div>
            <Badge
              status={locker.online ? 'success' : 'error'}
              text={
                <span style={{ fontSize: 11 }}>
                  {locker.online ? t('lockerMap.online', 'Online') : t('lockerMap.offline', 'Offline')}
                </span>
              }
            />
            {counts.error > 0 && (
              <Tag color="error" style={{ margin: 0, borderRadius: 6, fontSize: 10 }}>
                <WarningOutlined /> {counts.error} {t('lockerMap.errors', 'errors')}
              </Tag>
            )}
          </div>
        </Col>
      </Row>

      {/* Cell grid row */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
        <CellGrid cells={locker.cells} t={t} onCellClick={(cell) => onCellClick?.(cell, locker.id)} />
      </div>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────
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

  // Get unique floors
  const floors = [...new Set(lockers.map(l => l.floor))]

  // Filter lockers
  const filteredLockers = lockers.filter(l => {
    if (floorFilter !== 'all' && l.floor !== floorFilter) return false
    if (statusFilter === 'online' && !l.online) return false
    if (statusFilter === 'offline' && l.online) return false
    return true
  })

  // Summary counts
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
    <div style={{ padding: 0 }}>
      {/* ── Header ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <InboxOutlined />
            {t('lockerMap.title', 'Locker Cell Map')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('lockerMap.subtitle', 'Visual layout of all locker cells and their status')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as string)}
            options={[
              { value: 'grid', icon: <AppstoreOutlined />, label: t('lockerMap.gridView', 'Grid') },
              { value: 'list', icon: <UnorderedListOutlined />, label: t('lockerMap.listView', 'List') },
            ]}
            style={{
              background: '#f0f0f0',
              borderRadius: 10,
              padding: 2,
              fontWeight: 600,
            }}
          />
          <div style={{ width: 1, height: 24, background: '#e0e0e0', margin: '0 4px' }} />
          <Select
            value={floorFilter}
            style={{ width: 120 }}
            size="small"
            onChange={setFloorFilter}
            options={[
              { value: 'all', label: t('lockerMap.allFloors', 'All Floors') },
              ...floors.map(f => ({ value: f, label: f })),
            ]}
          />
          <Select
            value={statusFilter}
            style={{ width: 130 }}
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
        </div>
      </div>

      {/* ── Legend & Summary ──────────────────────────── */}
      <Card
        size="small"
        style={{
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 20,
        }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 12 }}>{t('lockerMap.legend', 'Legend')}:</Text>
            {(Object.keys(statusConfig) as CellStatus[]).map((status) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: statusConfig[status].bg,
                    border: `1.5px solid ${statusConfig[status].border}`,
                  }}
                />
                <Text style={{ fontSize: 11, color: '#666' }}>{t(statusConfig[status].labelKey)}</Text>
              </div>
            ))}
          </div>

          {/* Summary numbers */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 12 }}>
              <strong>{summary.total}</strong> {t('lockerMap.totalCells', 'cells')}
            </Text>
            <Text style={{ fontSize: 12, color: statusConfig.empty.color }}>
              <CheckCircleOutlined /> {summary.empty} {t('lockerMap.statusEmpty', 'empty')}
            </Text>
            <Text style={{ fontSize: 12, color: statusConfig.occupied.color }}>
              <InboxOutlined /> {summary.occupied} {t('lockerMap.statusOccupied', 'occupied')}
            </Text>
            <Text style={{ fontSize: 12, color: statusConfig.error.color }}>
              <CloseCircleOutlined /> {summary.error} {t('lockerMap.statusError', 'error')}
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Content ──────────────────────────────────── */}
      {filteredLockers.length === 0 ? (
        <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Empty description={t('lockerMap.noLockers', 'No lockers found')} />
        </Card>
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
                  {floor} <Badge count={floorLockers.length} size="small" style={{ marginLeft: 4 }} />
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
    </div>
  )
}
