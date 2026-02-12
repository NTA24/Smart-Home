import { useState } from 'react'
import {
  Card,
  Table,
  Typography,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Drawer,
  Descriptions,
  Divider,
  Badge,
  Statistic,
} from 'antd'
import {
  SearchOutlined,
  FileTextOutlined,
  ExportOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  CarOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

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
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gateFilter, setGateFilter] = useState<string>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<ParkingTicket | null>(null)

  const filtered = mockTickets.filter(ticket => {
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
    return true
  })

  const stats = {
    active: mockTickets.filter(t => t.status === 'active').length,
    closed: mockTickets.filter(t => t.status === 'closed').length,
    exception: mockTickets.filter(t => t.status === 'exception').length,
  }

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 180,
      render: (id: string) => <Text copyable={{ text: id }} style={{ fontSize: 12, fontFamily: 'monospace' }}>{id}</Text>,
    },
    {
      title: t('parkingTickets.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => <Text strong style={{ fontFamily: 'monospace', color: '#1890ff' }}>{plate}</Text>,
    },
    {
      title: t('parkingTickets.entry'),
      dataIndex: 'entry',
      key: 'entry',
      width: 150,
      render: (d: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{d}</Text>,
    },
    {
      title: t('parkingTickets.exit'),
      dataIndex: 'exit',
      key: 'exit',
      width: 150,
      render: (d: string | null) => d ? <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{d}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t('parkingTickets.fee'),
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (v: number) => v > 0 ? <Text strong style={{ color: '#fa8c16' }}>{v.toLocaleString('vi-VN')}đ</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t('parkingTickets.paid'),
      dataIndex: 'paid',
      key: 'paid',
      width: 80,
      render: (paid: boolean, record: ParkingTicket) => paid
        ? <Tag color="green" style={{ borderRadius: 8 }}>✓ {record.payment}</Tag>
        : <Tag color="default" style={{ borderRadius: 8 }}>—</Tag>,
    },
    {
      title: t('parkingTickets.exception'),
      dataIndex: 'exception',
      key: 'exception',
      width: 110,
      render: (v: string | null) => v ? <Tag color="red" style={{ borderRadius: 8 }}><ExclamationCircleOutlined /> {v}</Tag> : <Text type="secondary">—</Text>,
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
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined />
            {t('parkingTickets.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('parkingTickets.allSites')}</Text>
        </div>
        <Button icon={<ExportOutlined />}>{t('parkingTickets.export')}</Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={t('parkingTickets.active')} value={stats.active} valueStyle={{ color: '#1890ff' }} prefix={<Badge status="processing" />} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={t('parkingTickets.closed')} value={stats.closed} valueStyle={{ color: '#52c41a' }} prefix={<Badge status="success" />} />
          </Card>
        </Col>
        <Col xs={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title={t('parkingTickets.exceptionLabel')} value={stats.exception} valueStyle={{ color: '#f5222d' }} prefix={<Badge status="error" />} />
          </Card>
        </Col>
      </Row>

      {/* Search + Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('parkingTickets.searchPlaceholder')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <FilterOutlined style={{ color: '#8c8c8c' }} />
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
        </div>
      </Card>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${t('common.total')}: ${total}` }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          selectedTicket ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              {selectedTicket.ticketId}
            </span>
          ) : ''
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {selectedTicket && (
          <>
            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c' }}>
              <Descriptions.Item label={t('parkingTickets.plate')}>
                <Text strong style={{ fontFamily: 'monospace', color: '#1890ff', fontSize: 16 }}>{selectedTicket.plate}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('common.status')}>
                <Tag color={selectedTicket.status === 'active' ? 'blue' : selectedTicket.status === 'closed' ? 'green' : 'red'} style={{ borderRadius: 8 }}>
                  {t(`parkingTickets.${selectedTicket.status === 'exception' ? 'exceptionLabel' : selectedTicket.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.entry')}>{selectedTicket.entry}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.exit')}>{selectedTicket.exit || '—'}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.fee')}>
                <Text strong style={{ color: '#fa8c16' }}>{selectedTicket.fee.toLocaleString('vi-VN')}đ</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.paid')}>
                {selectedTicket.paid ? <Tag color="green">✓ {selectedTicket.payment}</Tag> : <Tag>—</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Gate">{selectedTicket.gate}</Descriptions.Item>
              <Descriptions.Item label="Zone">{selectedTicket.zone}</Descriptions.Item>
              <Descriptions.Item label={t('parkingTickets.vehicle')}>
                <Tag color="blue" style={{ borderRadius: 12 }}><CarOutlined /> {selectedTicket.vehicleType}</Tag>
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
              <Button icon={<ExportOutlined />}>{t('parkingTickets.export')}</Button>
              <Button icon={<PrinterOutlined />}>{t('parkingTickets.reprint')}</Button>
              {selectedTicket.status !== 'closed' && (
                <Button danger icon={<ExclamationCircleOutlined />}>{t('parkingTickets.dispute')}</Button>
              )}
            </Space>
          </>
        )}
      </Drawer>
    </div>
  )
}
