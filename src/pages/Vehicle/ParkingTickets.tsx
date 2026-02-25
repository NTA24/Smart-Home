import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Button,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Descriptions,
  Divider,
  Badge,
  Statistic,
  DatePicker,
  message,
} from 'antd'
import {
  FileTextOutlined,
  ExportOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  CarOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  FilterBar,
  SearchInput,
  DataTable,
  DetailDrawer,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleTicketFilters,
  getVehicleTickets,
  saveVehicleTicketFilters,
  saveVehicleTickets,
} from '@/services/mockPersistence'

const { Text } = Typography

interface ParkingTicket {
  key: string
  ticketId: string
  plate: string
  entry: string
  exit: string | null
  fee: number
  paid: boolean
  exception: string | null
  gate: string
  zone: string
  payment: string | null
  status: 'active' | 'closed' | 'exception'
  vehicleType: string
  phone?: string
  resident?: string
}

const mockTickets: ParkingTicket[] = [
  { key: '1', ticketId: 'TK-20260210-0001', plate: '51A-123.45', entry: '2026-02-10 08:12', exit: '2026-02-10 10:27', fee: 25000, paid: true, exception: null, gate: 'Gate Exit 1', zone: 'A', payment: 'QR', status: 'closed', vehicleType: 'Car', phone: '0901234567', resident: 'Nguyen Van A' },
  { key: '2', ticketId: 'TK-20260210-0002', plate: '30G-789.01', entry: '2026-02-10 08:28', exit: null, fee: 0, paid: false, exception: null, gate: 'Gate Entrance 1', zone: 'B', payment: null, status: 'active', vehicleType: 'Motorcycle', phone: '0912345678' },
  { key: '3', ticketId: 'TK-20260210-0003', plate: '29B-456.78', entry: '2026-02-10 07:45', exit: '2026-02-10 09:50', fee: 50000, paid: true, exception: null, gate: 'Gate Exit 2', zone: 'A', payment: 'Cash', status: 'closed', vehicleType: 'Car', resident: 'Tran Thi B' },
  { key: '4', ticketId: 'TK-20260210-0004', plate: '51H-222.33', entry: '2026-02-10 09:10', exit: null, fee: 0, paid: false, exception: 'Lost ticket', gate: 'Gate Entrance 2', zone: 'C', payment: null, status: 'exception', vehicleType: 'Car' },
  { key: '5', ticketId: 'TK-20260210-0005', plate: '30A-444.55', entry: '2026-02-10 07:30', exit: '2026-02-10 11:15', fee: 10000, paid: true, exception: null, gate: 'Gate Exit 1', zone: 'B', payment: 'Card', status: 'closed', vehicleType: 'Motorcycle', phone: '0923456789' },
  { key: '6', ticketId: 'TK-20260210-0006', plate: '29C-666.77', entry: '2026-02-10 08:55', exit: null, fee: 0, paid: false, exception: null, gate: 'Gate Entrance 1', zone: 'A', payment: null, status: 'active', vehicleType: 'Car', resident: 'Le Van C' },
  { key: '7', ticketId: 'TK-20260210-0007', plate: '51B-888.99', entry: '2026-02-10 06:30', exit: '2026-02-10 08:45', fee: 25000, paid: true, exception: null, gate: 'Gate Exit 1', zone: 'A', payment: 'Wallet', status: 'closed', vehicleType: 'Car', resident: 'Pham Van D' },
  { key: '8', ticketId: 'TK-20260210-0008', plate: '30D-111.00', entry: '2026-02-10 09:30', exit: null, fee: 0, paid: false, exception: 'Mismatch', gate: 'Gate Entrance 2', zone: 'B', payment: null, status: 'exception', vehicleType: 'Motorcycle' },
  { key: '9', ticketId: 'TK-20260210-0009', plate: '29E-333.22', entry: '2026-02-10 10:00', exit: null, fee: 0, paid: false, exception: null, gate: 'Gate Entrance 1', zone: 'C', payment: null, status: 'active', vehicleType: 'Car' },
  { key: '10', ticketId: 'TK-20260210-0010', plate: '51F-555.44', entry: '2026-02-10 07:15', exit: '2026-02-10 12:30', fee: 75000, paid: false, exception: 'Dispute', gate: 'Gate Exit 2', zone: 'A', payment: null, status: 'exception', vehicleType: 'Car', phone: '0934567890' },
]

export default function ParkingTickets() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const persistedFilters = getVehicleTicketFilters<{
    searchText: string
    statusFilter: string
    gateFilter: string
    zoneFilter: string
    paymentFilter: string
    dateRange: [string, string] | null
  }>({
    searchText: '',
    statusFilter: 'all',
    gateFilter: 'all',
    zoneFilter: 'all',
    paymentFilter: 'all',
    dateRange: null,
  })
  const [tickets] = useState<ParkingTicket[]>(() => getVehicleTickets<ParkingTicket>(mockTickets))
  const [searchText, setSearchText] = useState(persistedFilters.searchText)
  const [statusFilter, setStatusFilter] = useState<string>(persistedFilters.statusFilter)
  const [gateFilter, setGateFilter] = useState<string>(persistedFilters.gateFilter)
  const [zoneFilter, setZoneFilter] = useState<string>(persistedFilters.zoneFilter)
  const [paymentFilter, setPaymentFilter] = useState<string>(persistedFilters.paymentFilter)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    persistedFilters.dateRange?.[0] && persistedFilters.dateRange?.[1]
      ? [dayjs(persistedFilters.dateRange[0]), dayjs(persistedFilters.dateRange[1])]
      : null,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<ParkingTicket | null>(null)

  useEffect(() => {
    saveVehicleTickets(tickets)
  }, [tickets])

  useEffect(() => {
    saveVehicleTicketFilters({
      searchText,
      statusFilter,
      gateFilter,
      zoneFilter,
      paymentFilter,
      dateRange: dateRange ? [dateRange[0].toISOString(), dateRange[1].toISOString()] : null,
    })
  }, [searchText, statusFilter, gateFilter, zoneFilter, paymentFilter, dateRange])

  const filtered = useMemo(() => tickets.filter(ticket => {
    if (searchText) {
      const q = searchText.toLowerCase()
      const match = ticket.plate.toLowerCase().includes(q) ||
        ticket.ticketId.toLowerCase().includes(q) ||
        ticket.phone?.toLowerCase().includes(q) ||
        ticket.resident?.toLowerCase().includes(q)
      if (!match) return false
    }
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
    if (gateFilter !== 'all' && !ticket.gate.includes(gateFilter)) return false
    if (zoneFilter !== 'all' && ticket.zone !== zoneFilter) return false
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'unpaid' && ticket.paid) return false
      if (paymentFilter !== 'unpaid' && ticket.payment !== paymentFilter) return false
    }
    if (dateRange) {
      const entry = dayjs(ticket.entry, 'YYYY-MM-DD HH:mm')
      if (entry.isValid()) {
        if (entry.isBefore(dateRange[0], 'day') || entry.isAfter(dateRange[1], 'day')) return false
      }
    }
    return true
  }), [tickets, searchText, statusFilter, gateFilter, zoneFilter, paymentFilter, dateRange])

  const stats = {
    active: tickets.filter(t => t.status === 'active').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    exception: tickets.filter(t => t.status === 'exception').length,
  }

  const exportTickets = () => {
    const rows = filtered.map((ticket) => ({
      ticketId: ticket.ticketId,
      plate: ticket.plate,
      entry: ticket.entry,
      exit: ticket.exit || '',
      fee: ticket.fee,
      paid: ticket.paid ? 'yes' : 'no',
      payment: ticket.payment || '',
      status: ticket.status,
      gate: ticket.gate,
      zone: ticket.zone,
      exception: ticket.exception || '',
    }))
    if (rows.length === 0) {
      message.info(t('common.noData'))
      return
    }
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parking-tickets-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 180,
      render: (id: string) => <Text copyable={{ text: id }} className="text-sm font-mono">{id}</Text>,
    },
    {
      title: t('parkingTickets.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => <Text strong className="font-mono text-primary">{plate}</Text>,
    },
    {
      title: t('parkingTickets.entry'),
      dataIndex: 'entry',
      key: 'entry',
      width: 150,
      render: (d: string) => <Text className="text-sm font-mono">{d}</Text>,
    },
    {
      title: t('parkingTickets.exit'),
      dataIndex: 'exit',
      key: 'exit',
      width: 150,
      render: (d: string | null) => d ? <Text className="text-sm font-mono">{d}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t('parkingTickets.fee'),
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (v: number) => v > 0 ? <Text strong className="text-warning">{v.toLocaleString('vi-VN')}đ</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t('parkingTickets.paid'),
      dataIndex: 'paid',
      key: 'paid',
      width: 80,
      render: (paid: boolean, record: ParkingTicket) => paid
        ? <Tag color="green" className="vehicle_tag-rounded-8">✓ {record.payment}</Tag>
        : <Tag color="default" className="vehicle_tag-rounded-8">—</Tag>,
    },
    {
      title: t('parkingTickets.exception'),
      dataIndex: 'exception',
      key: 'exception',
      width: 110,
      render: (v: string | null) => v ? <Tag color="red" className="vehicle_tag-rounded-8"><ExclamationCircleOutlined /> {v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: t('parkingTickets.actions'),
      key: 'actions',
      width: 180,
      render: (_: unknown, record: ParkingTicket) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedTicket(record); setDrawerOpen(true) }}>
            {t('parkingTickets.viewDetail')}
          </Button>
          <Button type="link" size="small" icon={<PrinterOutlined />}>{t('parkingTickets.reprint')}</Button>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('parkingTickets.title')}
        icon={<FileTextOutlined />}
        subtitle={selectedBuilding?.name || t('parkingTickets.allSites')}
        actions={<Button icon={<ExportOutlined />} onClick={exportTickets}>{t('parkingTickets.export')}</Button>}
      />

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={8}>
          <ContentCard>
            <Statistic title={t('parkingTickets.active')} value={stats.active} valueStyle={{ color: '#1890ff' }} prefix={<Badge status="processing" />} />
          </ContentCard>
        </Col>
        <Col xs={8}>
          <ContentCard>
            <Statistic title={t('parkingTickets.closed')} value={stats.closed} valueStyle={{ color: '#52c41a' }} prefix={<Badge status="success" />} />
          </ContentCard>
        </Col>
        <Col xs={8}>
          <ContentCard>
            <Statistic title={t('parkingTickets.exceptionLabel')} value={stats.exception} valueStyle={{ color: '#f5222d' }} prefix={<Badge status="error" />} />
          </ContentCard>
        </Col>
      </Row>

      {/* Search + Filters */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
        <FilterBar>
          <SearchInput
            placeholder={t('parkingTickets.searchPlaceholder')}
            value={searchText}
            onChange={setSearchText}
            width={280}
          />
          <FilterOutlined className="text-muted" />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}
            options={[
              { value: 'all', label: t('parkingTickets.allStatus') },
              { value: 'active', label: t('parkingTickets.active') },
              { value: 'closed', label: t('parkingTickets.closed') },
              { value: 'exception', label: t('parkingTickets.exceptionLabel') },
            ]}
          />
          <Select value={gateFilter} onChange={setGateFilter} style={{ width: 140 }}
            options={[
              { value: 'all', label: t('parkingTickets.allGates') },
              { value: 'Entrance 1', label: 'Entrance 1' },
              { value: 'Entrance 2', label: 'Entrance 2' },
              { value: 'Exit 1', label: 'Exit 1' },
              { value: 'Exit 2', label: 'Exit 2' },
            ]}
          />
          <Select value={zoneFilter} onChange={setZoneFilter} style={{ width: 100 }}
            options={[
              { value: 'all', label: t('parkingTickets.allZones') },
              { value: 'A', label: 'Zone A' },
              { value: 'B', label: 'Zone B' },
              { value: 'C', label: 'Zone C' },
            ]}
          />
          <Select value={paymentFilter} onChange={setPaymentFilter} style={{ width: 130 }}
            options={[
              { value: 'all', label: t('parkingTickets.allPayments') },
              { value: 'QR', label: 'QR' },
              { value: 'Cash', label: t('parkingTickets.cash') },
              { value: 'Card', label: t('parkingTickets.card') },
              { value: 'Wallet', label: t('parkingTickets.wallet') },
              { value: 'unpaid', label: t('parkingTickets.unpaid') },
            ]}
          />
          <DatePicker.RangePicker value={dateRange} onChange={(value) => setDateRange(value as [dayjs.Dayjs, dayjs.Dayjs] | null)} />
          <Button
            onClick={() => {
              setSearchText('')
              setStatusFilter('all')
              setGateFilter('all')
              setZoneFilter('all')
              setPaymentFilter('all')
              setDateRange(null)
            }}
          >
            {t('common.reset')}
          </Button>
        </FilterBar>
      </ContentCard>

      {/* Table */}
      <ContentCard>
        <DataTable
          columns={columns}
          dataSource={filtered}
          pageSize={10}
          total={filtered.length}
          size="small"
          scroll={{ x: 1100 }}
        />
      </ContentCard>

      {/* Detail Drawer */}
      <DetailDrawer
        title={
          selectedTicket ? (
            <span className="vehicle_drawer-title">
              <FileTextOutlined className="text-primary" />
              {selectedTicket.ticketId}
            </span>
          ) : undefined
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {selectedTicket && (
          <>
            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
              <Descriptions.Item label={t('parkingTickets.plate')}>
                <Text strong className="font-mono text-primary text-lg">{selectedTicket.plate}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('common.status')}>
                <Tag color={selectedTicket.status === 'active' ? 'blue' : selectedTicket.status === 'closed' ? 'green' : 'red'} className="vehicle_tag-rounded-8">
                  {t(`parkingTickets.${selectedTicket.status === 'exception' ? 'exceptionLabel' : selectedTicket.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.entry')}>{selectedTicket.entry}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.exit')}>{selectedTicket.exit || '—'}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.fee')}>
                <Text strong className="text-warning">{selectedTicket.fee.toLocaleString('vi-VN')}đ</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.paid')}>
                {selectedTicket.paid ? <Tag color="green">✓ {selectedTicket.payment}</Tag> : <Tag>—</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Gate">{selectedTicket.gate}</Descriptions.Item>
              <Descriptions.Item label="Zone">{selectedTicket.zone}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.vehicle')}>
                <Tag color="blue" className="vehicle_tag-rounded"><CarOutlined /> {selectedTicket.vehicleType}</Tag>
              </Descriptions.Item>
              {selectedTicket.resident && <Descriptions.Item label={t('parkingTickets.resident')}>{selectedTicket.resident}</Descriptions.Item>}
              {selectedTicket.phone && <Descriptions.Item label={t('parkingTickets.phone')}>{selectedTicket.phone}</Descriptions.Item>}
              {selectedTicket.exception && (
                <Descriptions.Item label={t('parkingTickets.exception')}>
                  <Tag color="red"><ExclamationCircleOutlined /> {selectedTicket.exception}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
            <Divider />
            <Space>
              <Button icon={<ExportOutlined />} onClick={exportTickets}>{t('parkingTickets.export')}</Button>
              <Button icon={<PrinterOutlined />}>{t('parkingTickets.reprint')}</Button>
              {selectedTicket.status !== 'closed' && (
                <Button danger icon={<ExclamationCircleOutlined />}>{t('parkingTickets.dispute')}</Button>
              )}
            </Space>
          </>
        )}
      </DetailDrawer>
    </PageContainer>
  )
}
