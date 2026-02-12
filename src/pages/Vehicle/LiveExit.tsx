import { useState } from 'react'
import {
  Card,
  Table,
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
  Checkbox,
  Descriptions,
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
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

// Mock exit gates
const gates = [
  { id: 'gate-exit-1', name: 'Gate Exit 1', status: 'online' },
  { id: 'gate-exit-2', name: 'Gate Exit 2', status: 'online' },
  { id: 'gate-exit-3', name: 'Gate Exit 3', status: 'offline' },
]

// Mock recent exits
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

const shifts = ['Morning', 'Afternoon', 'Night']

const PAYMENT_METHODS = [
  { value: 'qr', label: '📱 QR', color: '#1890ff' },
  { value: 'cash', label: '💵 Cash', color: '#52c41a' },
  { value: 'card', label: '💳 Card', color: '#722ed1' },
  { value: 'wallet', label: '👛 Resident Wallet', color: '#fa8c16' },
]

export default function LiveExit() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [selectedGate, setSelectedGate] = useState(gates[0].id)
  const [currentShift] = useState(shifts[0])
  const [selectedPayment, setSelectedPayment] = useState('qr')
  const [flagMismatch, setFlagMismatch] = useState(false)
  const [flagLowConfidence, setFlagLowConfidence] = useState(false)

  const gate = gates.find(g => g.id === selectedGate) || gates[0]

  // Simulated current exit ticket
  const currentTicket = {
    plate: '51A-123.45',
    confidence: 88,
    entryTime: '08:12',
    duration: '2h 15m',
    fee: 25000,
    vehicleType: 'Car',
  }

  const columns = [
    {
      title: t('liveExit.time'),
      dataIndex: 'time',
      key: 'time',
      width: 90,
      render: (time: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{time}</Text>
      ),
    },
    {
      title: t('liveExit.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 13, color: '#1890ff' }}>{plate}</Text>
      ),
    },
    {
      title: t('liveExit.type'),
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => (
        <Tag color={type === 'Car' ? 'blue' : 'cyan'} style={{ borderRadius: 12 }}>
          <CarOutlined style={{ marginRight: 4 }} />
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
        <Text strong style={{ color: '#fa8c16' }}>
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
        return <Tag color={c.color} style={{ borderRadius: 12 }}>{c.label}</Tag>
      },
    },
    {
      title: t('liveExit.operator'),
      dataIndex: 'operator',
      key: 'operator',
      width: 140,
      render: (op: string) => (
        <span style={{ fontSize: 12 }}>
          <UserOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
          {op}
        </span>
      ),
    },
  ]

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <SwapOutlined />
            {t('liveExit.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('liveExit.allSites')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Select
            value={selectedGate}
            onChange={setSelectedGate}
            style={{ minWidth: 180 }}
            options={gates.map(g => ({
              value: g.id,
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge status={g.status === 'online' ? 'success' : 'error'} />
                  {g.name}
                </span>
              ),
            }))}
          />
          <Tag color="blue" style={{ borderRadius: 12, padding: '2px 12px', fontSize: 13 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {t('liveExit.shift')}: {currentShift}
          </Tag>
        </div>
      </div>

      {/* ── Gate status bar ── */}
      <Card
        size="small"
        style={{
          borderRadius: 12,
          marginBottom: 16,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: 'none',
        }}
        bodyStyle={{ padding: '10px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Text strong style={{ color: '#fff', fontSize: 15 }}>{gate.name}</Text>
            <Badge
              status={gate.status === 'online' ? 'success' : 'error'}
              text={
                <Text style={{ color: gate.status === 'online' ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                  {gate.status === 'online' ? t('liveExit.online') : t('liveExit.offline')}
                </Text>
              }
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WifiOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {t('liveExit.lastSync')}: {new Date().toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Main 3-column layout ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* LEFT: Camera feed + plate crop */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CameraOutlined style={{ color: '#1890ff' }} />
                {t('liveExit.cameraFeed')}
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            {/* Live video */}
            <div
              style={{
                width: '100%',
                height: 180,
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <VideoCameraOutlined style={{ fontSize: 36, color: 'rgba(255,255,255,0.3)' }} />
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>
                  {t('liveExit.liveVideo')}
                </div>
              </div>
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5222d', animation: 'pulse 1.5s infinite' }} />
                <Text style={{ color: '#f5222d', fontSize: 10, fontWeight: 600 }}>LIVE</Text>
              </div>
              <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'monospace' }}>
                  {new Date().toLocaleString()}
                </Text>
              </div>
            </div>

            {/* Plate crop */}
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>
                {t('liveExit.plateCrop')}
              </Text>
              <div
                style={{
                  height: 60,
                  background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #faad14',
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: 800, fontFamily: 'monospace', color: '#1a1a1a', letterSpacing: 3 }}>
                  {currentTicket.plate}
                </Text>
                <Tag color="green" style={{ borderRadius: 8, marginLeft: 12, fontSize: 12 }}>
                  {currentTicket.confidence}%
                </Tag>
              </div>
            </div>

            {/* Entry vs Exit images side-by-side */}
            <Text type="secondary" style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>
              {t('liveExit.entryImage')} vs {t('liveExit.exitImage')}
            </Text>
            <Row gutter={8}>
              <Col span={12}>
                <div
                  style={{
                    height: 80,
                    background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a30 100%)',
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #303050',
                  }}
                >
                  <CarOutlined style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 4 }}>
                    {t('liveExit.entryImage')}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    height: 80,
                    background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a30 100%)',
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #52c41a',
                  }}
                >
                  <CarOutlined style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 4 }}>
                    {t('liveExit.exitImage')}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* CENTER: Ticket detail */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#fa8c16' }} />
                {t('liveExit.ticketDetail')}
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Descriptions column={1} size="small" labelStyle={{ color: '#8c8c8c', fontSize: 13 }} contentStyle={{ fontWeight: 500 }}>
              <Descriptions.Item label={t('liveExit.entryTime')}>
                <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>
                  <ClockCircleOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                  {currentTicket.entryTime}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('liveExit.duration')}>
                <Tag color="blue" style={{ borderRadius: 8, fontSize: 13, padding: '2px 10px' }}>
                  {currentTicket.duration}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('liveExit.fee')}>
                <Text style={{ fontSize: 20, fontWeight: 800, color: '#fa541c' }}>
                  {currentTicket.fee.toLocaleString('vi-VN')}đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('liveExit.type')}>
                <Tag color="blue" style={{ borderRadius: 12 }}>
                  <CarOutlined style={{ marginRight: 4 }} />
                  {currentTicket.vehicleType}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            {/* Flags */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                <WarningOutlined style={{ marginRight: 4 }} />
                {t('liveExit.flags')}
              </Text>
              <Space direction="vertical" size={6}>
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
          </Card>
        </Col>

        {/* RIGHT: Payment + Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* Payment */}
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined style={{ color: '#52c41a' }} />
                  {t('liveExit.payment')}
                </span>
              }
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: '16px 20px' }}
            >
              {/* Method selector */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  {t('liveExit.method')}
                </Text>
                <Select
                  value={selectedPayment}
                  onChange={setSelectedPayment}
                  style={{ width: '100%' }}
                  options={PAYMENT_METHODS.map(m => ({
                    value: m.value,
                    label: (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {m.label}
                      </span>
                    ),
                  }))}
                />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  {t('liveExit.amount')}
                </Text>
                <InputNumber
                  value={currentTicket.fee}
                  style={{ width: '100%', fontWeight: 700 }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value?.replace(/,/g, '') || 0)}
                  addonAfter="đ"
                  size="large"
                />
              </div>

              {/* Pay buttons */}
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    block
                    size="large"
                    style={{
                      height: 48,
                      borderRadius: 10,
                      fontWeight: 600,
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
                    style={{ height: 48, borderRadius: 10, fontWeight: 500 }}
                  >
                    {t('liveExit.issueInvoice')}
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Actions */}
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#722ed1' }} />
                  {t('liveExit.actions')}
                </span>
              }
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: '12px 20px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                <Button
                  icon={<UnlockOutlined />}
                  block
                  style={{
                    height: 44,
                    borderRadius: 8,
                    fontWeight: 500,
                    borderColor: '#52c41a',
                    color: '#52c41a',
                  }}
                >
                  ✓ {t('liveExit.openBarrier')}
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                    ({t('liveExit.autoAfterPaid')})
                  </Text>
                </Button>

                <Button
                  icon={<ExclamationCircleOutlined />}
                  block
                  style={{
                    height: 44,
                    borderRadius: 8,
                    fontWeight: 500,
                    borderColor: '#fa8c16',
                    color: '#fa8c16',
                  }}
                >
                  {t('liveExit.lostTicket')}
                </Button>

                <Button
                  danger
                  icon={<WarningOutlined />}
                  block
                  style={{
                    height: 44,
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  {t('liveExit.supervisorApproval')}
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* ── Bottom: Recent exits ── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              {t('liveExit.recentExits')} ({recentExits.length})
            </span>
          </div>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Table
          columns={columns}
          dataSource={recentExits}
          pagination={{ pageSize: 10, showSizeChanger: true, size: 'small', showTotal: (total) => `${t('common.total')}: ${total}` }}
          size="small"
          scroll={{ x: 700 }}
          style={{ borderRadius: 8 }}
        />
      </Card>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
