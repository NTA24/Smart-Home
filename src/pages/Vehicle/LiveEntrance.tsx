import { useEffect, useMemo, useState } from 'react'
import { Card, Tag, Typography, Button, Select, Badge, Row, Col, Space, Input, Tooltip, DatePicker, Modal, message } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  UnlockOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  UserOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  DataTable,
  StatusTag,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleLiveEntranceEntries,
  getVehicleLiveEntranceState,
  getVehicleManagementConfig,
  getVehicleSubscriptions,
  saveVehicleLiveEntranceEntries,
  saveVehicleLiveEntranceState,
} from '@/services/mockPersistence'

const { Text } = Typography

const gates = [
  { id: 'gate-1', name: 'Cổng vào 1', status: 'online', type: 'entrance' },
  { id: 'gate-2', name: 'Cổng vào 2', status: 'online', type: 'entrance' },
  { id: 'gate-3', name: 'Cổng ra 1', status: 'online', type: 'exit' },
  { id: 'gate-4', name: 'Cổng ra 2', status: 'offline', type: 'exit' },
]
const entranceGates = gates.filter((gate) => gate.type === 'entrance')

const recentEntries = [
  { key: '1', time: '08:30:25', plate: '51A-123.45', type: 'Car', status: 'confirmed', operator: 'Nguyen Van A' },
  { key: '2', time: '08:28:10', plate: '30G-789.01', type: 'Motorcycle', status: 'confirmed', operator: 'Nguyen Van A' },
  { key: '3', time: '08:25:42', plate: '29B-456.78', type: 'Car', status: 'manual', operator: 'Nguyen Van A' },
  { key: '4', time: '08:22:15', plate: '51H-222.33', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '5', time: '08:20:00', plate: '30A-444.55', type: 'Motorcycle', status: 'blocked', operator: 'Tran Van B' },
  { key: '6', time: '08:18:30', plate: '29C-666.77', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '7', time: '08:15:10', plate: '51B-888.99', type: 'Car', status: 'confirmed', operator: 'Nguyen Van A' },
  { key: '8', time: '08:12:45', plate: '30D-111.00', type: 'Motorcycle', status: 'confirmed', operator: 'Auto' },
  { key: '9', time: '08:10:20', plate: '29E-333.22', type: 'Car', status: 'manual', operator: 'Tran Van B' },
  { key: '10', time: '08:08:55', plate: '51F-555.44', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '11', time: '08:05:30', plate: '30G-777.66', type: 'Motorcycle', status: 'confirmed', operator: 'Auto' },
  { key: '12', time: '08:03:15', plate: '29H-999.88', type: 'Car', status: 'blocked', operator: 'Nguyen Van A' },
  { key: '13', time: '08:01:00', plate: '51K-121.34', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '14', time: '07:58:40', plate: '30L-343.56', type: 'Motorcycle', status: 'confirmed', operator: 'Auto' },
  { key: '15', time: '07:55:20', plate: '29M-565.78', type: 'Car', status: 'confirmed', operator: 'Tran Van B' },
  { key: '16', time: '07:52:10', plate: '51N-787.90', type: 'Car', status: 'manual', operator: 'Nguyen Van A' },
  { key: '17', time: '07:50:00', plate: '30P-909.12', type: 'Motorcycle', status: 'confirmed', operator: 'Auto' },
  { key: '18', time: '07:47:35', plate: '29Q-131.45', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '19', time: '07:45:10', plate: '51R-353.67', type: 'Car', status: 'confirmed', operator: 'Auto' },
  { key: '20', time: '07:42:50', plate: '30S-575.89', type: 'Motorcycle', status: 'blocked', operator: 'Tran Van B' },
]

const shifts = ['morning', 'afternoon', 'night'] as const

interface EntranceEntry {
  key: string
  time: string
  plate: string
  type: string
  status: string
  operator: string
  occurredAt?: string
}

interface VehicleSubscriptionRecord {
  plate: string
  vehicleType: string
  owner?: string
  plan?: string
  status?: string
  validFrom?: string
  validTo?: string
}

const subscriptionSeed: VehicleSubscriptionRecord[] = [
  { plate: '51A-123.45', vehicleType: 'Car', status: 'active', validFrom: '2026-01-01', validTo: '2026-12-31' },
  { plate: '30G-789.01', vehicleType: 'Motorcycle', status: 'active', validFrom: '2026-01-01', validTo: '2026-12-31' },
]

type LiveEntranceProps = {
  hideRecentTable?: boolean
  hideGateSelector?: boolean
  forcedGateId?: string
  embedded?: boolean
  onEntryAdded?: () => void
}

export default function LiveEntrance(props: LiveEntranceProps = {}) {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const vehicleConfig = getVehicleManagementConfig<{ defaultEntryGate: string }>({
    defaultEntryGate: entranceGates[0].id,
  })
  const persistedState = getVehicleLiveEntranceState<{
    selectedGate: string
    noteText: string
    timeRange: [string, string] | null
  }>({
    selectedGate: props.forcedGateId || vehicleConfig.defaultEntryGate || entranceGates[0].id,
    noteText: '',
    timeRange: null,
  })
  const [selectedGate, setSelectedGate] = useState(persistedState.selectedGate)
  const [noteText, setNoteText] = useState(persistedState.noteText)
  const [currentPlate, setCurrentPlate] = useState('51A-123.45')
  const [currentVehicleType, setCurrentVehicleType] = useState<'Car' | 'Motorcycle' | 'Truck'>('Car')
  const [editPlateOpen, setEditPlateOpen] = useState(false)
  const [editingPlate, setEditingPlate] = useState(currentPlate)
  const [editingVehicleType, setEditingVehicleType] = useState<'Car' | 'Motorcycle' | 'Truck'>(currentVehicleType)
  const [filterRange, setFilterRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    persistedState.timeRange?.[0] && persistedState.timeRange?.[1]
      ? [dayjs(persistedState.timeRange[0]), dayjs(persistedState.timeRange[1])]
      : null,
  )
  const [entries, setEntries] = useState<EntranceEntry[]>(() => {
    const seedEntries: EntranceEntry[] = recentEntries.map((entry) => ({
      ...entry,
      occurredAt: `${dayjs().format('YYYY-MM-DD')} ${entry.time}`,
    }))
    return getVehicleLiveEntranceEntries<EntranceEntry>(seedEntries).map((entry) => ({
      ...entry,
      occurredAt: entry.occurredAt || (entry as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${entry.time}`,
    }))
  })
  const [currentShift] = useState<(typeof shifts)[number]>(shifts[0])
  const shiftLabelMap: Record<(typeof shifts)[number], string> = {
    morning: t('liveEntrance.shiftMorning', 'Buổi sáng'),
    afternoon: t('liveEntrance.shiftAfternoon', 'Ca trực chiều'),
    night: t('liveEntrance.shiftNight', 'Ca trực đêm'),
  }

  useEffect(() => {
    if (!props.forcedGateId) return
    const exists = entranceGates.some((gate) => gate.id === props.forcedGateId)
    if (exists && selectedGate !== props.forcedGateId) {
      setSelectedGate(props.forcedGateId)
    }
  }, [props.forcedGateId, selectedGate])

  useEffect(() => {
    saveVehicleLiveEntranceEntries(entries)
  }, [entries])

  useEffect(() => {
    saveVehicleLiveEntranceState({
      selectedGate,
      noteText,
      timeRange: filterRange ? [filterRange[0].toISOString(), filterRange[1].toISOString()] : null,
    })
  }, [selectedGate, noteText, filterRange])

  const filteredEntries = entries.filter((entry) => {
    if (!filterRange) return true
    const occurredAt = dayjs(entry.occurredAt || (entry as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${entry.time}`)
    return !occurredAt.isBefore(filterRange[0]) && !occurredAt.isAfter(filterRange[1])
  })

  const handleFilterRangeChange = (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (value && value[0] && value[1]) {
      setFilterRange([value[0], value[1]])
      return
    }
    setFilterRange(null)
  }

  const exportFilteredEntries = () => {
    if (filteredEntries.length === 0) {
      message.info(t('common.noData'))
      return
    }
    const rows = filteredEntries.map((entry) => ({
      time: entry.time,
      plate: entry.plate,
      type: entry.type,
      status: entry.status,
      operator: entry.operator,
      occurredAt: entry.occurredAt || (entry as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${entry.time}`,
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `live-entrance-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleConfirmEntry = () => {
    const now = dayjs()
    const newEntry: EntranceEntry = {
      key: `entry-${now.valueOf()}`,
      time: now.format('HH:mm:ss'),
      plate: currentPlate,
      type: currentVehicleType,
      status: 'confirmed',
      operator: 'Auto',
      occurredAt: now.format('YYYY-MM-DD HH:mm:ss'),
    }
    const nextEntries = [newEntry, ...entries]
    saveVehicleLiveEntranceEntries(nextEntries)
    setEntries(nextEntries)
    message.success(t('liveEntrance.confirmed'))
    props.onEntryAdded?.()
  }

  const gate = entranceGates.find(g => g.id === selectedGate) || entranceGates[0]

  const matchedSubscription = useMemo(() => {
    const subscriptions = getVehicleSubscriptions<VehicleSubscriptionRecord>(subscriptionSeed)
    const normalizedPlate = (currentPlate || '').trim().toUpperCase()
    const normalizedType = (currentVehicleType || '').trim().toLowerCase()
    const today = dayjs()

    return subscriptions.find((sub) => {
      const subPlate = (sub.plate || '').trim().toUpperCase()
      const subType = (sub.vehicleType || '').trim().toLowerCase()
      const hasSubscriptionPlan = ['monthly', 'quarterly', 'yearly'].includes((sub.plan || '').toLowerCase())
      const statusOk = !sub.status || sub.status === 'active'
      const from = sub.validFrom ? dayjs(sub.validFrom) : null
      const to = sub.validTo ? dayjs(sub.validTo) : null
      const inRange =
        (!from || !today.isBefore(from, 'day')) &&
        (!to || !today.isAfter(to, 'day'))
      return hasSubscriptionPlan && statusOk && inRange && subPlate === normalizedPlate && subType === normalizedType
    })
  }, [currentPlate, currentVehicleType])
  const currentRecognition = {
    plate: currentPlate,
    confidence: 92,
    vehicleType: currentVehicleType,
    customer: matchedSubscription?.owner?.trim() || 'Unknown',
    isResident: !!matchedSubscription,
  }

  const columns = [
    {
      title: t('liveEntrance.time'),
      dataIndex: 'time',
      key: 'time',
      width: 100,
      render: (time: string) => (
        <Text className="text-sm font-mono">{time}</Text>
      ),
    },
    {
      title: t('liveEntrance.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => (
        <Text strong className="font-mono text-base text-primary">{plate}</Text>
      ),
    },
    {
      title: t('liveEntrance.type'),
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => (
        <Tag color={type === 'Car' ? 'blue' : 'cyan'} className="vehicle_tag-rounded">
          <CarOutlined className="mr-4" />
          {type}
        </Tag>
      ),
    },
    {
      title: t('liveEntrance.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <StatusTag
          status={status}
          config={{
            confirmed: { color: 'green', label: t('liveEntrance.confirmed') },
            manual: { color: 'orange', label: t('liveEntrance.manual') },
            blocked: { color: 'red', label: t('liveEntrance.blocked') },
          }}
          className="vehicle_tag-rounded"
        />
      ),
    },
    {
      title: t('liveEntrance.operator'),
      dataIndex: 'operator',
      key: 'operator',
      width: 140,
      render: (op: string) => (
        <span className="text-sm">
          <UserOutlined className="mr-4 text-muted" />
          {op}
        </span>
      ),
    },
  ]

  return (
    <PageContainer
      style={
        props.embedded
          ? { margin: 0, padding: 0, minHeight: 'auto', background: 'transparent' }
          : undefined
      }
    >
      <PageHeader
        title={t('liveEntrance.title')}
        icon={<VideoCameraOutlined />}
        subtitle={selectedBuilding?.name || t('liveEntrance.allSites')}
        actions={
          <>
          {/* Gate selector */}
          {!props.hideGateSelector && (
            <Select
              value={selectedGate}
              onChange={setSelectedGate}
              className="vehicle_select-min"
              options={entranceGates.map(g => ({
                value: g.id,
                label: (
                  <span className="flex items-center gap-6">
                    <Badge status={g.status === 'online' ? 'success' : 'error'} />
                    {g.name}
                  </span>
                ),
              }))}
            />
          )}
          {/* Shift badge */}
          <Tag color="blue" className="vehicle_shift-tag">
            <ClockCircleOutlined className="mr-4" />
            {t('liveEntrance.shift')}: {shiftLabelMap[currentShift]}
          </Tag>
          <DatePicker.RangePicker
            showTime
            value={filterRange}
            onChange={handleFilterRangeChange}
          />
          <Button icon={<ExportOutlined />} onClick={exportFilteredEntries}>
            {t('parkingTickets.export')}
          </Button>
          </>
        }
      />

      {/* ── Gate status bar ── */}
      <Card
        size="small"
        className="vehicle_gate-card"
        bodyStyle={{ padding: '10px 20px' }}
      >
        <div className="vehicle_gate-bar">
          <div className="flex items-center gap-16">
            <Text strong className="vehicle_gate-name">{gate.name}</Text>
            <Badge
              status={gate.status === 'online' ? 'success' : 'error'}
              text={
                <Text style={{ color: gate.status === 'online' ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                  {gate.status === 'online' ? t('liveEntrance.online') : t('liveEntrance.offline')}
                </Text>
              }
            />
            <Tag color={gate.type === 'entrance' ? 'green' : 'orange'} className="vehicle_tag-rounded">
              <SwapOutlined className="mr-4" />
              {gate.type === 'entrance' ? t('liveEntrance.entrance') : t('liveEntrance.exit')}
            </Tag>
          </div>
          <div className="flex items-center gap-8">
            <WifiOutlined className="text-success" />
            <Text className="vehicle_last-sync">
              {t('liveEntrance.lastSync')}: {new Date().toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Main 3-column layout ── */}
      <Row gutter={[16, 16]} className="vehicle_row-mb">
        {/* LEFT: Camera feed */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('liveEntrance.cameraFeed')}
            titleIcon={<CameraOutlined />}
            titleIconColor="#1890ff"
            className="h-full"
            bodyStyle={{ padding: 12 }}
          >
            {/* Live video placeholder */}
            <div className="vehicle_video-placeholder">
              <div className="text-center">
                <VideoCameraOutlined className="vehicle_video-icon" />
                <div className="vehicle_video-caption">
                  {t('liveEntrance.liveVideo')}
                </div>
              </div>
              {/* Recording indicator */}
              <div className="vehicle_recording-badge">
                <div className="vehicle_live-dot" />
                <Text className="vehicle_live-text">LIVE</Text>
              </div>
              {/* Timestamp */}
              <Text className="vehicle_timestamp-overlay">
                {new Date().toLocaleString()}
              </Text>
            </div>

            {/* Last captured image */}
            <div className="mb-8">
              <Text type="secondary" className="vehicle_label-block text-11">
                {t('liveEntrance.lastCapture')}
              </Text>
              <Row gutter={8}>
                <Col span={14}>
                  <div className="vehicle_capture-box">
                    <CarOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                </Col>
                <Col span={10}>
                  <div className="vehicle_plate-box flex items-center justify-center">
                    <Text className="vehicle_plate-text">
                      {currentPlate}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          </ContentCard>
        </Col>

        {/* CENTER: Recognition panel */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('liveEntrance.recognitionPanel')}
            titleIcon={<SafetyCertificateOutlined />}
            titleIconColor="#52c41a"
            className="h-full"
          >
            {/* Plate */}
            <div className="vehicle_field-group">
              <Text type="secondary" className="text-sm">{t('liveEntrance.plate')}</Text>
              <div className="flex items-center gap-12 vehicle_field-gap">
                <div className="vehicle_plate-display flex-1">
                  <Text className="vehicle_plate-value">
                    {currentRecognition.plate}
                  </Text>
                </div>
                <Tag color="green" className="vehicle_tag-rounded-8 py-4 px-8 text-sm">
                  {currentRecognition.confidence}%
                </Tag>
              </div>
            </div>

            {/* Vehicle type */}
            <div className="vehicle_field-group">
              <Text type="secondary" className="text-sm">{t('liveEntrance.vehicleType')}</Text>
              <div className="vehicle_field-gap">
                <div className="vehicle_plate-display" style={{ maxWidth: 180 }}>
                  <Text className="vehicle_plate-value">
                    {currentRecognition.vehicleType === 'Car'
                      ? `🚗 ${t('parking.car')}`
                      : currentRecognition.vehicleType === 'Motorcycle'
                        ? `🏍️ ${t('parking.motorcycle')}`
                        : `🚛 ${t('liveEntrance.truck')}`}
                  </Text>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="vehicle_field-group">
              <Text type="secondary" className="text-sm">{t('liveEntrance.customer')}</Text>
              <div className="vehicle_customer-box">
                <div className="flex items-center gap-8">
                  <UserOutlined className="text-muted" />
                  <Text className="text-muted">{currentRecognition.customer}</Text>
                </div>
                {currentRecognition.isResident ? (
                  <Tag color="green" className="vehicle_tag-rounded m-0">
                    {t('liveEntrance.resident')}
                  </Tag>
                ) : (
                  <Tag color="default" className="vehicle_tag-rounded m-0">
                    {t('liveEntrance.visitor')}
                  </Tag>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <Text type="secondary" className="text-sm">{t('liveEntrance.note')}</Text>
              <Input.TextArea
                placeholder={t('liveEntrance.notePlaceholder')}
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="vehicle_field-gap rounded"
              />
            </div>
          </ContentCard>
        </Col>

        {/* RIGHT: Actions */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('liveEntrance.actions')}
            titleIcon={<CheckCircleOutlined />}
            titleIconColor="#722ed1"
            className="h-full"
          >
            <Space direction="vertical" className="vehicle_space-full" size={12}>
              {matchedSubscription && (
                <div className="vehicle_monthly-pass-notice">
                  Xe này đã đăng ký vé định kỳ
                </div>
              )}
              {/* Primary action */}
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="large"
                block
                className="vehicle_btn-confirm"
                onClick={handleConfirmEntry}
              >
                {t('liveEntrance.confirmEntry')}
              </Button>

              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Tooltip title={t('liveEntrance.editPlate')}>
                    <Button
                      icon={<EditOutlined />}
                      block
                      className="vehicle_btn-secondary"
                      onClick={() => {
                        setEditingPlate(currentPlate)
                        setEditingVehicleType(currentVehicleType)
                        setEditPlateOpen(true)
                      }}
                    >
                      {t('liveEntrance.editPlate')}
                    </Button>
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Tooltip title={t('liveEntrance.printTicket')}>
                    <Button
                      icon={<PrinterOutlined />}
                      block
                      className="vehicle_btn-secondary"
                    >
                      {t('liveEntrance.printTicket')}
                    </Button>
                  </Tooltip>
                </Col>
              </Row>

              <Button
                icon={<UnlockOutlined />}
                block
                className="vehicle_btn-secondary"
                style={{ borderColor: '#1890ff', color: '#1890ff' }}
              >
                {t('liveEntrance.openBarrier')}
              </Button>
            </Space>
          </ContentCard>
        </Col>
      </Row>

      {/* ── Bottom: Recent entries ── */}
      {!props?.hideRecentTable && (
        <ContentCard
          title={<>{t('liveEntrance.recentEntries')} ({filteredEntries.length})</>}
          titleIcon={<ClockCircleOutlined />}
          titleIconColor="#1890ff"
        >
          <DataTable
            columns={columns}
            dataSource={filteredEntries}
            pageSize={10}
            total={filteredEntries.length}
            size="small"
            scroll={{ x: 600 }}
            className="rounded"
          />
        </ContentCard>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>

      <Modal
        open={editPlateOpen}
        title={t('liveEntrance.editPlate')}
        onCancel={() => setEditPlateOpen(false)}
        onOk={() => {
          const nextPlate = editingPlate.trim()
          if (!nextPlate) {
            message.warning(t('liveEntrance.editPlate'))
            return
          }
          setCurrentVehicleType(editingVehicleType)
          setCurrentPlate(nextPlate)
          setEditPlateOpen(false)
          message.success(t('apiTest.update'))
        }}
        okText={t('apiTest.update')}
        cancelText={t('apiTest.cancel')}
      >
        <Space direction="vertical" className="w-full">
          <Input
            value={editingPlate}
            onChange={(e) => setEditingPlate(e.target.value.toUpperCase())}
            placeholder="51A-123.45"
          />
          <Select
            value={editingVehicleType}
            onChange={(value) => setEditingVehicleType(value as 'Car' | 'Motorcycle' | 'Truck')}
            style={{ width: 180 }}
            options={[
              { value: 'Car', label: `🚗 ${t('parking.car')}` },
              { value: 'Motorcycle', label: `🏍️ ${t('parking.motorcycle')}` },
              { value: 'Truck', label: `🚛 ${t('liveEntrance.truck')}` },
            ]}
          />
        </Space>
      </Modal>
    </PageContainer>
  )
}
