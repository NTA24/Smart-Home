import { useState } from 'react'
import { Card, Table, Tag, Typography, Button, Select, Badge, Row, Col, Divider, Space, Input, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  UnlockOutlined,
  StopOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  UserOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

// Mock gate data
const gates = [
  { id: 'gate-1', name: 'Gate Entrance 1', status: 'online', type: 'entrance' },
  { id: 'gate-2', name: 'Gate Entrance 2', status: 'online', type: 'entrance' },
  { id: 'gate-3', name: 'Gate Exit 1', status: 'online', type: 'exit' },
  { id: 'gate-4', name: 'Gate Exit 2', status: 'offline', type: 'exit' },
]

// Mock recent entries
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

const shifts = ['Morning', 'Afternoon', 'Night']

export default function LiveEntrance() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [selectedGate, setSelectedGate] = useState(gates[0].id)
  const [currentShift] = useState(shifts[0])

  const gate = gates.find(g => g.id === selectedGate) || gates[0]

  // Simulated current recognition
  const currentRecognition = {
    plate: '51A-123.45',
    confidence: 92,
    vehicleType: 'Car',
    customer: 'Unknown',
    isResident: false,
  }

  const columns = [
    {
      title: t('liveEntrance.time'),
      dataIndex: 'time',
      key: 'time',
      width: 100,
      render: (time: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{time}</Text>
      ),
    },
    {
      title: t('liveEntrance.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 13, color: '#1890ff' }}>{plate}</Text>
      ),
    },
    {
      title: t('liveEntrance.type'),
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
      title: t('liveEntrance.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
          confirmed: { color: 'green', label: t('liveEntrance.confirmed') },
          manual: { color: 'orange', label: t('liveEntrance.manual') },
          blocked: { color: 'red', label: t('liveEntrance.blocked') },
        }
        const c = config[status] || config.confirmed
        return <Tag color={c.color} style={{ borderRadius: 12 }}>{c.label}</Tag>
      },
    },
    {
      title: t('liveEntrance.operator'),
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
            <VideoCameraOutlined />
            {t('liveEntrance.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('liveEntrance.allSites')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Gate selector */}
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
          {/* Shift badge */}
          <Tag color="blue" style={{ borderRadius: 12, padding: '2px 12px', fontSize: 13 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {t('liveEntrance.shift')}: {currentShift}
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
                  {gate.status === 'online' ? t('liveEntrance.online') : t('liveEntrance.offline')}
                </Text>
              }
            />
            <Tag color={gate.type === 'entrance' ? 'green' : 'orange'} style={{ borderRadius: 12 }}>
              <SwapOutlined style={{ marginRight: 4 }} />
              {gate.type === 'entrance' ? t('liveEntrance.entrance') : t('liveEntrance.exit')}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WifiOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {t('liveEntrance.lastSync')}: {new Date().toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Main 3-column layout ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* LEFT: Camera feed */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CameraOutlined style={{ color: '#1890ff' }} />
                {t('liveEntrance.cameraFeed')}
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            {/* Live video placeholder */}
            <div
              style={{
                width: '100%',
                height: 200,
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
                <VideoCameraOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)' }} />
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>
                  {t('liveEntrance.liveVideo')}
                </div>
              </div>
              {/* Recording indicator */}
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5222d', animation: 'pulse 1.5s infinite' }} />
                <Text style={{ color: '#f5222d', fontSize: 10, fontWeight: 600 }}>LIVE</Text>
              </div>
              {/* Timestamp */}
              <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: 'monospace' }}>
                  {new Date().toLocaleString()}
                </Text>
              </div>
            </div>

            {/* Last captured image */}
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>
                {t('liveEntrance.lastCapture')}
              </Text>
              <Row gutter={8}>
                <Col span={14}>
                  <div
                    style={{
                      height: 90,
                      background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a30 100%)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #303050',
                    }}
                  >
                    <CarOutlined style={{ fontSize: 28, color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                </Col>
                <Col span={10}>
                  <div
                    style={{
                      height: 90,
                      background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a30 100%)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #f0ad4e',
                    }}
                  >
                    <Text style={{ color: '#f0ad4e', fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
                      51A-123.45
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* CENTER: Recognition panel */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                {t('liveEntrance.recognitionPanel')}
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            {/* Plate */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('liveEntrance.plate')}</Text>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 6,
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                  border: '2px solid #faad14',
                  borderRadius: 8,
                  padding: '8px 20px',
                  flex: 1,
                }}>
                  <Text style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: '#1a1a1a', letterSpacing: 2 }}>
                    {currentRecognition.plate}
                  </Text>
                </div>
                <Tag color="green" style={{ borderRadius: 8, padding: '4px 8px', fontSize: 12 }}>
                  {currentRecognition.confidence}%
                </Tag>
              </div>
            </div>

            {/* Vehicle type */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('liveEntrance.vehicleType')}</Text>
              <div style={{ marginTop: 6 }}>
                <Select
                  value={currentRecognition.vehicleType}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'Car', label: `🚗 ${t('parking.car')}` },
                    { value: 'Motorcycle', label: `🏍️ ${t('parking.motorcycle')}` },
                    { value: 'Truck', label: `🚛 ${t('liveEntrance.truck')}` },
                  ]}
                />
              </div>
            </div>

            {/* Customer */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('liveEntrance.customer')}</Text>
              <div style={{
                marginTop: 6,
                padding: '10px 14px',
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined style={{ color: '#8c8c8c' }} />
                  <Text style={{ color: '#8c8c8c' }}>{currentRecognition.customer}</Text>
                </div>
                {currentRecognition.isResident ? (
                  <Tag color="green" style={{ borderRadius: 12, margin: 0 }}>
                    {t('liveEntrance.resident')}
                  </Tag>
                ) : (
                  <Tag color="default" style={{ borderRadius: 12, margin: 0 }}>
                    {t('liveEntrance.visitor')}
                  </Tag>
                )}
              </div>
            </div>

            {/* Note */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('liveEntrance.note')}</Text>
              <Input.TextArea
                placeholder={t('liveEntrance.notePlaceholder')}
                rows={2}
                style={{ marginTop: 6, borderRadius: 8 }}
              />
            </div>
          </Card>
        </Col>

        {/* RIGHT: Actions */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#722ed1' }} />
                {t('liveEntrance.actions')}
              </span>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {/* Primary action */}
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="large"
                block
                style={{
                  height: 52,
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                }}
              >
                {t('liveEntrance.confirmEntry')}
              </Button>

              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Tooltip title={t('liveEntrance.editPlate')}>
                    <Button
                      icon={<EditOutlined />}
                      block
                      style={{ height: 44, borderRadius: 8, fontWeight: 500 }}
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
                      style={{ height: 44, borderRadius: 8, fontWeight: 500 }}
                    >
                      {t('liveEntrance.printTicket')}
                    </Button>
                  </Tooltip>
                </Col>
              </Row>

              <Button
                icon={<UnlockOutlined />}
                block
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontWeight: 500,
                  borderColor: '#1890ff',
                  color: '#1890ff',
                }}
              >
                {t('liveEntrance.openBarrier')}
              </Button>

              <Divider style={{ margin: '8px 0' }} />

              <Button
                danger
                icon={<StopOutlined />}
                block
                style={{
                  height: 44,
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                {t('liveEntrance.blockNotify')}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* ── Bottom: Recent entries ── */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              {t('liveEntrance.recentEntries')} ({recentEntries.length})
            </span>
          </div>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <Table
          columns={columns}
          dataSource={recentEntries}
          pagination={{ pageSize: 10, showSizeChanger: true, size: 'small', showTotal: (total) => `${t('common.total')}: ${total}` }}
          size="small"
          scroll={{ x: 600 }}
          style={{ borderRadius: 8 }}
        />
      </Card>

      {/* Pulse animation */}
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
