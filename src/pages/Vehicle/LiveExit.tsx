import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Tag,
  Typography,
  Button,
  Select,
  Badge,
  Row,
  Col,
  Divider,
  Space,
  InputNumber,
  Input,
  Checkbox,
  DatePicker,
  Modal,
  message,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  CheckCircleOutlined,
  UnlockOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  UserOutlined,
  CameraOutlined,
  DollarOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  SwapOutlined,
  ExportOutlined,
  EditOutlined,
} from '@ant-design/icons'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  DataTable,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleLiveExitEntries,
  getVehicleLiveExitState,
  getVehicleManagementConfig,
  getVehiclePricingConfig,
  getVehicleSubscriptions,
  saveVehicleLiveExitEntries,
  saveVehicleLiveExitState,
} from '@/services/mockPersistence'

const { Text } = Typography

const gates = [
  { id: 'gate-exit-1', name: 'Cổng ra 1', status: 'online' },
  { id: 'gate-exit-2', name: 'Cổng ra 2', status: 'online' },
  { id: 'gate-exit-3', name: 'Cổng ra 3', status: 'offline' },
]

const recentExits = [
  { key: '1', time: '10:45:20', plate: '51A-123.45', type: 'Car', fee: 25000, status: 'paid', operator: 'Auto' },
  { key: '2', time: '10:42:15', plate: '30G-789.01', type: 'Motorcycle', fee: 5000, status: 'paid', operator: 'Auto' },
  { key: '3', time: '10:38:50', plate: '29B-456.78', type: 'Car', fee: 50000, status: 'paid', operator: 'Nguyen Van A' },
  { key: '4', time: '10:35:30', plate: '51H-222.33', type: 'Car', fee: 25000, status: 'pending', operator: 'Nguyen Van A' },
  { key: '5', time: '10:32:10', plate: '30A-444.55', type: 'Motorcycle', fee: 0, status: 'exception', operator: 'Tran Van B' },
  { key: '6', time: '10:28:45', plate: '29C-666.77', type: 'Car', fee: 35000, status: 'paid', operator: 'Auto' },
  { key: '7', time: '10:25:20', plate: '51B-888.99', type: 'Car', fee: 25000, status: 'paid', operator: 'Auto' },
  { key: '8', time: '10:22:00', plate: '30D-111.00', type: 'Motorcycle', fee: 5000, status: 'paid', operator: 'Auto' },
  { key: '9', time: '10:18:35', plate: '29E-333.22', type: 'Car', fee: 75000, status: 'paid', operator: 'Auto' },
  { key: '10', time: '10:15:10', plate: '51F-555.44', type: 'Car', fee: 25000, status: 'paid', operator: 'Auto' },
]

const shifts = ['morning', 'afternoon', 'night'] as const

const PAYMENT_METHODS = [
  { value: 'qr', icon: '📱', color: '#1890ff' },
  { value: 'cash', icon: '💵', color: '#52c41a' },
  { value: 'card', icon: '💳', color: '#722ed1' },
]

interface ExitEntry {
  key: string
  time: string
  plate: string
  type: string
  fee: number
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

interface VehiclePricingConfigItem {
  vehicleType: 'Car' | 'Motorcycle' | 'Truck'
  hourlyRate: number
  dailyRate: number
}

interface VehicleManagementConfig {
  autoOpenBarrierAfterPaid: boolean
  freeExitMinutes: number
  maxPlateRetries: number
  defaultEntryGate: string
  defaultExitGate: string
}

const defaultVehiclePricingConfig: VehiclePricingConfigItem[] = [
  { vehicleType: 'Car', hourlyRate: 15000, dailyRate: 180000 },
  { vehicleType: 'Motorcycle', hourlyRate: 5000, dailyRate: 60000 },
  { vehicleType: 'Truck', hourlyRate: 30000, dailyRate: 320000 },
]

const subscriptionSeed: VehicleSubscriptionRecord[] = [
  { plate: '51A-123.45', vehicleType: 'Car', status: 'active', plan: 'monthly', validFrom: '2026-01-01', validTo: '2026-12-31' },
  { plate: '30G-789.01', vehicleType: 'Motorcycle', status: 'active', plan: 'quarterly', validFrom: '2026-01-01', validTo: '2026-12-31' },
]

type LiveExitProps = {
  hideRecentTable?: boolean
  hideGateSelector?: boolean
  forcedGateId?: string
  embedded?: boolean
  onExitAdded?: () => void
}

export default function LiveExit(props: LiveExitProps = {}) {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const vehicleConfig = getVehicleManagementConfig<VehicleManagementConfig>({
    autoOpenBarrierAfterPaid: true,
    freeExitMinutes: 10,
    maxPlateRetries: 3,
    defaultEntryGate: 'gate-1',
    defaultExitGate: 'gate-exit-1',
  })
  const persistedState = getVehicleLiveExitState<{
    selectedGate: string
    selectedPayment: string
    flagMismatch: boolean
    flagLowConfidence: boolean
    timeRange: [string, string] | null
  }>({
    selectedGate: props.forcedGateId || vehicleConfig.defaultExitGate || gates[0].id,
    selectedPayment: 'qr',
    flagMismatch: false,
    flagLowConfidence: false,
    timeRange: null,
  })
  const [selectedGate, setSelectedGate] = useState(persistedState.selectedGate)
  const [currentShift] = useState<(typeof shifts)[number]>(shifts[0])
  const shiftLabelMap: Record<(typeof shifts)[number], string> = {
    morning: t('liveExit.shiftMorning', 'Buổi sáng'),
    afternoon: t('liveExit.shiftAfternoon', 'Ca trực chiều'),
    night: t('liveExit.shiftNight', 'Ca trực đêm'),
  }
  const getGateLabel = (id: string) => {
    const map: Record<string, string> = {
      'gate-exit-1': t('liveExit.gateExit1'),
      'gate-exit-2': t('liveExit.gateExit2'),
      'gate-exit-3': t('liveExit.gateExit3'),
    }
    return map[id] ?? id
  }
  const [selectedPayment, setSelectedPayment] = useState(persistedState.selectedPayment)
  const [flagMismatch, setFlagMismatch] = useState(persistedState.flagMismatch)
  const [flagLowConfidence, setFlagLowConfidence] = useState(persistedState.flagLowConfidence)
  const [currentPlate, setCurrentPlate] = useState('51A-123.45')
  const [currentVehicleType, setCurrentVehicleType] = useState<'Car' | 'Motorcycle' | 'Truck'>('Car')
  const [editPlateOpen, setEditPlateOpen] = useState(false)
  const [editingPlate, setEditingPlate] = useState(currentPlate)
  const [editingVehicleType, setEditingVehicleType] = useState<'Car' | 'Motorcycle' | 'Truck'>(currentVehicleType)
  const [currentEntryAt] = useState(() => dayjs().subtract(2, 'hour').subtract(15, 'minute'))
  const [nowTick, setNowTick] = useState(() => dayjs())
  const pricingConfig = getVehiclePricingConfig<VehiclePricingConfigItem[]>(defaultVehiclePricingConfig)
  const [filterRange, setFilterRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    persistedState.timeRange?.[0] && persistedState.timeRange?.[1]
      ? [dayjs(persistedState.timeRange[0]), dayjs(persistedState.timeRange[1])]
      : null,
  )
  const [exits, setExits] = useState<ExitEntry[]>(() => {
    const seedExits: ExitEntry[] = recentExits.map((entry) => ({
      ...entry,
      occurredAt: `${dayjs().format('YYYY-MM-DD')} ${entry.time}`,
    }))
    return getVehicleLiveExitEntries<ExitEntry>(seedExits).map((entry) => ({
      ...entry,
      occurredAt: entry.occurredAt || (entry as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${entry.time}`,
    }))
  })

  useEffect(() => {
    if (!props.forcedGateId) return
    const exists = gates.some((gate) => gate.id === props.forcedGateId)
    if (exists && selectedGate !== props.forcedGateId) {
      setSelectedGate(props.forcedGateId)
    }
  }, [props.forcedGateId, selectedGate])

  useEffect(() => {
    saveVehicleLiveExitEntries(exits)
  }, [exits])

  useEffect(() => {
    saveVehicleLiveExitState({
      selectedGate,
      selectedPayment,
      flagMismatch,
      flagLowConfidence,
      timeRange: filterRange ? [filterRange[0].toISOString(), filterRange[1].toISOString()] : null,
    })
  }, [selectedGate, selectedPayment, flagMismatch, flagLowConfidence, filterRange])

  useEffect(() => {
    const valid = PAYMENT_METHODS.some((item) => item.value === selectedPayment)
    if (!valid) {
      setSelectedPayment(PAYMENT_METHODS[0].value)
    }
  }, [selectedPayment])

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(dayjs()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const filteredExits = exits.filter((entry) => {
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

  const exportFilteredExits = () => {
    if (filteredExits.length === 0) {
      message.info(t('common.noData'))
      return
    }
    const rows = filteredExits.map((entry) => ({
      time: entry.time,
      plate: entry.plate,
      type: entry.type,
      fee: entry.fee,
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
    a.download = `live-exit-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const gate = gates.find(g => g.id === selectedGate) || gates[0]

  const parkedMinutes = Math.max(1, nowTick.diff(currentEntryAt, 'minute'))
  const parkedHours = parkedMinutes / 60
  const billableHours = Math.max(1, Math.ceil(parkedHours))
  const isFreeExit = parkedMinutes <= Math.max(0, vehicleConfig.freeExitMinutes || 0)
  const currentHourlyRate =
    pricingConfig.find((item) => item.vehicleType === currentVehicleType)?.hourlyRate ?? 0
  const currentFee = isFreeExit ? 0 : currentHourlyRate * billableHours
  const parkingDurationLabel = `${Math.floor(parkedMinutes / 60)}h ${parkedMinutes % 60}m`
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

  const handleConfirmPaid = () => {
    const now = dayjs()
    const newExit: ExitEntry = {
      key: `exit-${now.valueOf()}`,
      time: now.format('HH:mm:ss'),
      plate: currentPlate,
      type: currentVehicleType,
      fee: currentFee,
      status: 'paid',
      operator: 'Auto',
      occurredAt: now.format('YYYY-MM-DD HH:mm:ss'),
    }
    const nextExits = [newExit, ...exits]
    saveVehicleLiveExitEntries(nextExits)
    setExits(nextExits)
    message.success(t('liveExit.confirmPaid'))
    props.onExitAdded?.()
  }

  const handleAllowSubscriptionExit = () => {
    const now = dayjs()
    const newExit: ExitEntry = {
      key: `exit-sub-${now.valueOf()}`,
      time: now.format('HH:mm:ss'),
      plate: currentPlate,
      type: currentVehicleType,
      fee: 0,
      status: 'paid',
      operator: 'Auto',
      occurredAt: now.format('YYYY-MM-DD HH:mm:ss'),
    }
    const nextExits = [newExit, ...exits]
    saveVehicleLiveExitEntries(nextExits)
    setExits(nextExits)
    message.success(t('liveExit.subscriptionExitSuccess'))
    props.onExitAdded?.()
  }

  const currentTicket = {
    plate: currentPlate,
    confidence: 88,
    entryTime: currentEntryAt.format('HH:mm'),
    duration: parkingDurationLabel,
    fee: currentFee,
    vehicleType: currentVehicleType,
  }

  const columns = [
    {
      title: t('liveExit.time'),
      dataIndex: 'time',
      key: 'time',
      width: 90,
      render: (time: string) => (
        <Text className="text-sm font-mono">{time}</Text>
      ),
    },
    {
      title: t('liveExit.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => (
        <Text strong className="font-mono text-base text-primary">{plate}</Text>
      ),
    },
    {
      title: t('liveExit.type'),
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
      title: t('liveExit.fee'),
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee: number) => (
        <Text strong className="text-warning">
          {fee.toLocaleString('vi-VN')}đ
        </Text>
      ),
    },
    {
      title: t('liveExit.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          paid: { color: 'green', label: t('liveExit.paid') },
          pending: { color: 'orange', label: t('liveExit.pending') },
          exception: { color: 'red', label: t('liveExit.exception') },
        }
        const c = config[status] || config.paid
        return <Tag color={c.color} className="vehicle_tag-rounded">{c.label}</Tag>
      },
    },
    {
      title: t('liveExit.operator'),
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
        title={t('liveExit.title')}
        icon={<SwapOutlined />}
        subtitle={selectedBuilding?.name || t('liveExit.allSites')}
        actions={
          <>
          {!props.hideGateSelector && (
            <Select
              value={selectedGate}
              onChange={setSelectedGate}
              className="vehicle_select-min"
              options={gates.map(g => ({
                value: g.id,
                label: (
                  <span className="flex items-center gap-6">
                    <Badge status={g.status === 'online' ? 'success' : 'error'} />
                    {getGateLabel(g.id)}
                  </span>
                ),
              }))}
            />
          )}
          <Tag color="blue" className="vehicle_shift-tag">
            <ClockCircleOutlined className="mr-4" />
            {t('liveExit.shift')}: {shiftLabelMap[currentShift]}
          </Tag>
          <DatePicker.RangePicker
            showTime
            value={filterRange}
            onChange={handleFilterRangeChange}
          />
          <Button icon={<ExportOutlined />} onClick={exportFilteredExits}>
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
            <Text strong className="vehicle_gate-name">{getGateLabel(gate.id)}</Text>
            <Badge
              status={gate.status === 'online' ? 'success' : 'error'}
              text={
                <Text className="text-sm" style={{ color: gate.status === 'online' ? '#52c41a' : '#ff4d4f' }}>
                  {gate.status === 'online' ? t('liveExit.online') : t('liveExit.offline')}
                </Text>
              }
            />
          </div>
          <div className="flex items-center gap-8">
            <WifiOutlined className="text-success" />
            <Text className="vehicle_last-sync">
              {t('liveExit.lastSync')}: {new Date().toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Main 3-column layout ── */}
      <Row gutter={[16, 16]} className="vehicle_row-mb">
        {/* LEFT: Camera feed + plate crop */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('liveExit.cameraFeed')}
            titleIcon={<CameraOutlined />}
            titleIconColor="#1890ff"
            className="h-full"
            bodyStyle={{ padding: 12 }}
          >
            {/* Live video */}
            <div className="vehicle_video-placeholder vehicle_video-placeholder--sm">
              <div className="text-center">
                <VideoCameraOutlined className="vehicle_video-icon vehicle_video-icon--sm" />
                <div className="vehicle_video-caption">
                  {t('liveExit.liveVideo')}
                </div>
              </div>
              <div className="vehicle_recording-badge">
                <div className="vehicle_live-dot" />
                <Text className="vehicle_live-text">LIVE</Text>
              </div>
              <Text className="vehicle_timestamp-overlay">
                {new Date().toLocaleString()}
              </Text>
            </div>

            {/* Plate crop */}
            <div className="mb-12">
              <Text type="secondary" className="vehicle_label-block text-11">
                {t('liveExit.plateCrop')}
              </Text>
              <div className="vehicle_plate-crop flex items-center justify-center">
                <Text className="vehicle_plate-crop-value">
                  {currentTicket.plate}
                </Text>
                <Tag color="green" className="vehicle_tag-rounded-8 ml-4 text-sm">
                  {currentTicket.confidence}%
                </Tag>
              </div>
            </div>

            {/* Entry vs Exit images side-by-side */}
            <Text type="secondary" className="vehicle_label-block text-11">
              {t('liveExit.entryImage')} vs {t('liveExit.exitImage')}
            </Text>
            <Row gutter={8}>
              <Col span={12}>
                <div className="vehicle_entry-image">
                  <CarOutlined className="vehicle_entry-image-icon" />
                  <Text className="vehicle_entry-image-label">
                    {t('liveExit.entryImage')}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="vehicle_entry-image vehicle_entry-image--exit">
                  <CarOutlined className="vehicle_entry-image-icon" />
                  <Text className="vehicle_entry-image-label">
                    {t('liveExit.exitImage')}
                  </Text>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>

        {/* CENTER: Ticket detail */}
        <Col xs={24} lg={8}>
          <ContentCard
            title={t('liveExit.ticketDetail')}
            titleIcon={<FileTextOutlined />}
            titleIconColor="#fa8c16"
            className="h-full"
          >
            <div className="vehicle_ticket-detail">
              <div className="vehicle_ticket-row">
                <Text className="vehicle_ticket-label">{t('liveExit.entryTime')}</Text>
                <Text className="vehicle_ticket-value vehicle_ticket-value-mono">
                  <ClockCircleOutlined className="mr-8 text-primary" />
                  {currentTicket.entryTime}
                </Text>
              </div>

              <div className="vehicle_ticket-row">
                <Text className="vehicle_ticket-label">{t('liveExit.duration')}</Text>
                <Tag color="blue" className="vehicle_tag-rounded">
                  {currentTicket.duration}
                </Tag>
              </div>

              <div className="vehicle_ticket-row">
                <Text className="vehicle_ticket-label">{t('liveExit.fee')}</Text>
                <Text className="vehicle_ticket-fee">
                  {currentTicket.fee.toLocaleString('vi-VN')}đ
                </Text>
              </div>

              <div className="vehicle_ticket-row">
                <Text className="vehicle_ticket-label">{t('liveExit.type')}</Text>
                <Tag color="blue" className="vehicle_tag-rounded">
                  <CarOutlined className="mr-4" />
                  {currentTicket.vehicleType}
                </Tag>
              </div>
            </div>

            <Divider className="vehicle_divider--md" />

            {/* Flags */}
            <div className="vehicle_flags-box">
              <Text type="secondary" className="vehicle_flags-title">
                <WarningOutlined className="mr-4" />
                {t('liveExit.flags')}
              </Text>
              <Space direction="vertical" size={6} className="vehicle_space-full">
                <Checkbox
                  checked={flagMismatch}
                  onChange={e => setFlagMismatch(e.target.checked)}
                >
                  <Text style={{ color: flagMismatch ? '#f5222d' : undefined }}>
                    {t('liveExit.mismatch')}
                  </Text>
                </Checkbox>
                <Checkbox
                  checked={flagLowConfidence}
                  onChange={e => setFlagLowConfidence(e.target.checked)}
                >
                  <Text style={{ color: flagLowConfidence ? '#fa8c16' : undefined }}>
                    {t('liveExit.lowConfidence')}
                  </Text>
                </Checkbox>
              </Space>
            </div>
          </ContentCard>
        </Col>

        {/* RIGHT: Payment + Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full" size={16}>
            {/* Payment */}
            <ContentCard
              title={t('liveExit.payment')}
              titleIcon={<DollarOutlined />}
              titleIconColor="#52c41a"
              bodyStyle={{ padding: '16px 20px' }}
            >
              {matchedSubscription ? (
                <Space direction="vertical" className="w-full" size={12}>
                  <div className="vehicle_monthly-pass-notice">
                    Xe này đã đăng ký vé định kỳ
                  </div>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    block
                    size="large"
                    className="vehicle_btn-open"
                    onClick={handleAllowSubscriptionExit}
                  >
                    OK
                  </Button>
                </Space>
              ) : (
                <>
                  {/* Method selector */}
                  <div className="mb-16">
                    <Select
                      value={selectedPayment}
                      onChange={setSelectedPayment}
                      className="w-full"
                      options={PAYMENT_METHODS.map(m => ({
                        value: m.value,
                        label: (
                          <span className="flex items-center gap-6">
                            {m.icon}{' '}
                            {m.value === 'qr'
                              ? t('liveExit.qr', 'QR')
                              : m.value === 'cash'
                                ? t('liveExit.cash', 'Tiền mặt')
                                : t('liveExit.card', 'Thẻ')}
                          </span>
                        ),
                      }))}
                    />
                  </div>

                  {/* Amount */}
                  <div className="mb-16">
                    <Text type="secondary" className="text-sm block vehicle_label-mb6">
                      {t('liveExit.amount')}
                    </Text>
                    <InputNumber
                      value={currentFee}
                      readOnly
                      controls={false}
                      className="w-full font-bold"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value?.replace(/,/g, '') || 0)}
                      addonAfter="đ"
                      size="large"
                    />
                    <Text type="secondary" className="text-11">
                      {isFreeExit
                        ? t('liveExit.freeExitNote', { minutes: Math.max(0, vehicleConfig.freeExitMinutes || 0) })
                        : `${currentHourlyRate.toLocaleString('vi-VN')}đ/giờ x ${billableHours} giờ`}
                    </Text>
                  </div>

                  {/* Pay buttons */}
                  <Row gutter={[10, 10]}>
                    <Col span={12}>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        block
                        size="large"
                        className="vehicle_btn-open"
                        onClick={handleConfirmPaid}
                        style={{
                          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                        }}
                      >
                        {t('liveExit.confirmPaid')}
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        icon={<PrinterOutlined />}
                        block
                        size="large"
                        className="vehicle_btn-open font-medium"
                      >
                        {t('liveExit.issueInvoice')}
                      </Button>
                    </Col>
                  </Row>
                </>
              )}

              <Button
                icon={<EditOutlined />}
                block
                className="vehicle_btn-secondary mt-10"
                onClick={() => {
                  setEditingPlate(currentPlate)
                  setEditingVehicleType(currentVehicleType)
                  setEditPlateOpen(true)
                }}
              >
                {t('liveEntrance.editPlate')}
              </Button>
            </ContentCard>

            {/* Actions */}
            <ContentCard
              title={t('liveExit.actions')}
              titleIcon={<CheckCircleOutlined />}
              titleIconColor="#722ed1"
              bodyStyle={{ padding: '12px 20px' }}
            >
              <Space direction="vertical" className="w-full" size={10}>
                <Button
                  icon={<UnlockOutlined />}
                  block
                  className="vehicle_btn-secondary"
                  style={{ borderColor: '#52c41a', color: '#52c41a' }}
                >
                  ✓ {t('liveExit.openBarrier')}
                  <Text type="secondary" className="text-11 ml-6">
                    ({vehicleConfig.autoOpenBarrierAfterPaid ? t('liveExit.autoAfterPaid') : t('liveExit.manualOnly', 'thủ công')})
                  </Text>
                </Button>

                <Button
                  icon={<ExclamationCircleOutlined />}
                  block
                  className="vehicle_btn-secondary"
                  style={{ borderColor: '#fa8c16', color: '#fa8c16' }}
                >
                  {t('liveExit.lostTicket')}
                </Button>
              </Space>
            </ContentCard>
          </Space>
        </Col>
      </Row>

      {/* ── Bottom: Recent exits ── */}
      {!props.hideRecentTable && (
        <ContentCard
          title={<>{t('liveExit.recentExits')} ({filteredExits.length})</>}
          titleIcon={<ClockCircleOutlined />}
          titleIconColor="#1890ff"
        >
          <DataTable
            columns={columns}
            dataSource={filteredExits}
            pageSize={10}
            total={filteredExits.length}
            size="small"
            scroll={{ x: 700 }}
            className="rounded"
          />
        </ContentCard>
      )}

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
          setCurrentPlate(nextPlate)
          setCurrentVehicleType(editingVehicleType)
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

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </PageContainer>
  )
}
