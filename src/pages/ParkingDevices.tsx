import { useState } from 'react'
import {
  Card,
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Input,
  Select,
  Popconfirm,
  message,
} from 'antd'
import {
  ApiOutlined,
  ReloadOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  VideoCameraOutlined,
  GatewayOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

type DeviceType = 'gate' | 'camera' | 'sensor'
type DeviceStatus = 'online' | 'offline' | 'warning' | 'faulty'

interface ParkingDevice {
  key: string
  name: string
  type: DeviceType
  location: string
  status: DeviceStatus
  lastHeartbeat: string
  ip?: string
  firmware?: string
}

const STATUS_CONFIG: Record<DeviceStatus, { color: string; badge: 'success' | 'error' | 'warning' | 'default'; icon: React.ReactNode }> = {
  online: { color: 'green', badge: 'success', icon: <CheckCircleOutlined /> },
  offline: { color: 'red', badge: 'error', icon: <CloseCircleOutlined /> },
  warning: { color: 'orange', badge: 'warning', icon: <WarningOutlined /> },
  faulty: { color: 'default', badge: 'default', icon: <AlertOutlined /> },
}

const TYPE_CONFIG: Record<DeviceType, { color: string; icon: React.ReactNode; label: string }> = {
  gate: { color: 'blue', icon: <GatewayOutlined />, label: 'gate' },
  camera: { color: 'purple', icon: <VideoCameraOutlined />, label: 'camera' },
  sensor: { color: 'cyan', icon: <ApiOutlined />, label: 'sensor' },
}

const mockDevices: ParkingDevice[] = [
  { key: '1', name: 'Gate Entrance 1', type: 'gate', location: 'B1 - Main Entry', status: 'online', lastHeartbeat: '2026-02-10 10:45:20', ip: '192.168.1.101', firmware: 'v2.4.1' },
  { key: '2', name: 'Gate Entrance 2', type: 'gate', location: 'B1 - Side Entry', status: 'online', lastHeartbeat: '2026-02-10 10:45:18', ip: '192.168.1.102', firmware: 'v2.4.1' },
  { key: '3', name: 'Gate Exit 1', type: 'gate', location: 'B1 - Main Exit', status: 'online', lastHeartbeat: '2026-02-10 10:45:22', ip: '192.168.1.103', firmware: 'v2.4.1' },
  { key: '4', name: 'Gate Exit 2', type: 'gate', location: 'B1 - Side Exit', status: 'online', lastHeartbeat: '2026-02-10 10:45:15', ip: '192.168.1.104', firmware: 'v2.4.1' },
  { key: '5', name: 'Gate Entrance 3', type: 'gate', location: 'B2 - Entry', status: 'online', lastHeartbeat: '2026-02-10 10:44:50', ip: '192.168.1.105', firmware: 'v2.3.8' },
  { key: '6', name: 'Gate Exit 3', type: 'gate', location: 'B2 - Exit', status: 'warning', lastHeartbeat: '2026-02-10 10:30:00', ip: '192.168.1.106', firmware: 'v2.3.8' },
  { key: '7', name: 'CAM-ENT-01', type: 'camera', location: 'B1 - Main Entry', status: 'online', lastHeartbeat: '2026-02-10 10:45:21', ip: '192.168.2.1', firmware: 'v5.1.2' },
  { key: '8', name: 'CAM-ENT-02', type: 'camera', location: 'B1 - Side Entry', status: 'online', lastHeartbeat: '2026-02-10 10:45:19', ip: '192.168.2.2', firmware: 'v5.1.2' },
  { key: '9', name: 'CAM-EXIT-01', type: 'camera', location: 'B1 - Main Exit', status: 'online', lastHeartbeat: '2026-02-10 10:45:20', ip: '192.168.2.3', firmware: 'v5.1.2' },
  { key: '10', name: 'CAM-EXIT-02', type: 'camera', location: 'B1 - Side Exit', status: 'online', lastHeartbeat: '2026-02-10 10:45:17', ip: '192.168.2.4', firmware: 'v5.1.2' },
  { key: '11', name: 'CAM-B1-ZONE-A', type: 'camera', location: 'B1 - Zone A', status: 'online', lastHeartbeat: '2026-02-10 10:45:10', ip: '192.168.2.5', firmware: 'v5.1.2' },
  { key: '12', name: 'CAM-B1-ZONE-B', type: 'camera', location: 'B1 - Zone B', status: 'online', lastHeartbeat: '2026-02-10 10:45:12', ip: '192.168.2.6', firmware: 'v5.1.2' },
  { key: '13', name: 'CAM-B2-ZONE-A', type: 'camera', location: 'B2 - Zone A', status: 'online', lastHeartbeat: '2026-02-10 10:45:08', ip: '192.168.2.7', firmware: 'v5.1.2' },
  { key: '14', name: 'CAM-B2-ZONE-B', type: 'camera', location: 'B2 - Zone B', status: 'online', lastHeartbeat: '2026-02-10 10:45:05', ip: '192.168.2.8', firmware: 'v5.1.2' },
  { key: '15', name: 'CAM-B2-ZONE-C', type: 'camera', location: 'B2 - Zone C', status: 'online', lastHeartbeat: '2026-02-10 10:44:55', ip: '192.168.2.9', firmware: 'v5.0.9' },
  { key: '16', name: 'CAM-B3-ZONE-A', type: 'camera', location: 'B3 - Zone A', status: 'online', lastHeartbeat: '2026-02-10 10:44:50', ip: '192.168.2.10', firmware: 'v5.0.9' },
  { key: '17', name: 'CAM-B3-ZONE-B', type: 'camera', location: 'B3 - Zone B', status: 'online', lastHeartbeat: '2026-02-10 10:44:48', ip: '192.168.2.11', firmware: 'v5.0.9' },
  { key: '18', name: 'CAM-B3-ZONE-C', type: 'camera', location: 'B3 - Zone C', status: 'online', lastHeartbeat: '2026-02-10 10:44:45', ip: '192.168.2.12', firmware: 'v5.0.9' },
  // Sensors — many
  ...Array.from({ length: 480 }, (_, i) => {
    const zone = ['A', 'B', 'C'][i % 3]
    const floor = ['B1', 'B2', 'B3'][Math.floor(i / 160)]
    const status: DeviceStatus = i === 42 || i === 105 || i === 200 || i === 310 || i === 410 ? 'faulty' : 'online'
    return {
      key: `s-${i}`,
      name: `SENS-${floor}-${zone}-${String((i % 160) + 1).padStart(3, '0')}`,
      type: 'sensor' as DeviceType,
      location: `${floor} - Zone ${zone} - Slot ${zone}${String((i % 53) + 1).padStart(2, '0')}`,
      status,
      lastHeartbeat: status === 'faulty' ? '2026-02-10 08:15:00' : `2026-02-10 10:${String(40 + (i % 6)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      ip: `192.168.3.${i + 1}`,
      firmware: 'v1.2.0',
    }
  }),
]

export default function ParkingDevices() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = mockDevices.filter(d => {
    if (searchText) {
      const q = searchText.toLowerCase()
      if (!d.name.toLowerCase().includes(q) && !d.location.toLowerCase().includes(q)) return false
    }
    if (typeFilter !== 'all' && d.type !== typeFilter) return false
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    return true
  })

  const gateDevices = mockDevices.filter(d => d.type === 'gate')
  const cameraDevices = mockDevices.filter(d => d.type === 'camera')
  const sensorDevices = mockDevices.filter(d => d.type === 'sensor')

  const stats = {
    gatesOnline: gateDevices.filter(d => d.status === 'online').length,
    gatesWarning: gateDevices.filter(d => d.status === 'warning' || d.status === 'faulty').length,
    camerasOnline: cameraDevices.filter(d => d.status === 'online').length,
    camerasOffline: cameraDevices.filter(d => d.status === 'offline').length,
    sensorsTotal: sensorDevices.length,
    sensorsFaulty: sensorDevices.filter(d => d.status === 'faulty').length,
  }

  const handleRestart = (device: ParkingDevice) => {
    message.loading(`${t('parkingDevices.restarting')} ${device.name}...`, 2)
    setTimeout(() => message.success(`${device.name} ${t('parkingDevices.restartSuccess')}`), 2000)
  }

  const handleTest = (device: ParkingDevice) => {
    message.loading(`${t('parkingDevices.testing')} ${device.name}...`, 1.5)
    setTimeout(() => message.success(`${device.name} ${t('parkingDevices.testOk')}`), 1500)
  }

  const columns = [
    {
      title: t('parkingDevices.device'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: ParkingDevice) => {
        const cfg = TYPE_CONFIG[record.type]
        return (
          <Space>
            <span style={{ color: cfg.color }}>{cfg.icon}</span>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Space>
        )
      },
    },
    {
      title: t('parkingDevices.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: DeviceType) => {
        const cfg = TYPE_CONFIG[type]
        return <Tag color={cfg.color} style={{ borderRadius: 8 }}>{cfg.icon} {t(`parkingDevices.${cfg.label}`)}</Tag>
      },
    },
    {
      title: t('parkingDevices.location'),
      dataIndex: 'location',
      key: 'location',
      width: 180,
      ellipsis: true,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: DeviceStatus) => {
        const cfg = STATUS_CONFIG[status]
        return (
          <Badge status={cfg.badge} text={
            <Text style={{ color: status === 'online' ? '#52c41a' : status === 'offline' ? '#ff4d4f' : status === 'warning' ? '#fa8c16' : '#8c8c8c' }}>
              {t(`parkingDevices.${status}`)}
            </Text>
          } />
        )
      },
    },
    {
      title: t('parkingDevices.lastHeartbeat'),
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: 170,
      render: (ts: string) => <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{ts}</Text>,
    },
    {
      title: t('parkingDevices.actions'),
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ParkingDevice) => (
        <Space size={4}>
          <Tooltip title={t('parkingDevices.restart')}>
            <Popconfirm title={`${t('parkingDevices.restart')} ${record.name}?`} onConfirm={() => handleRestart(record)} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
              <Button type="link" size="small" icon={<PlayCircleOutlined />}>
                {t('parkingDevices.restart')}
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title={t('parkingDevices.test')}>
            <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => handleTest(record)}>
              {t('parkingDevices.test')}
            </Button>
          </Tooltip>
          <Tooltip title={t('parkingDevices.logs')}>
            <Button type="link" size="small" icon={<FileTextOutlined />}>
              {t('parkingDevices.logs')}
            </Button>
          </Tooltip>
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
            <ApiOutlined />
            {t('parkingDevices.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('parkingDevices.allSites')}</Text>
        </div>
        <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
      </div>

      {/* Overview cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GatewayOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{t('parkingDevices.gates')}</Text>
                <div>
                  <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{stats.gatesOnline}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}> {t('parkingDevices.online')}</Text>
                  {stats.gatesWarning > 0 && (
                    <Text style={{ fontSize: 13, color: '#fa8c16', marginLeft: 8 }}>/ {stats.gatesWarning} {t('parkingDevices.warning')}</Text>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f9f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VideoCameraOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{t('parkingDevices.cameras')}</Text>
                <div>
                  <Text strong style={{ fontSize: 20, color: '#52c41a' }}>{stats.camerasOnline}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}> {t('parkingDevices.online')}</Text>
                  <Text style={{ fontSize: 13, color: '#8c8c8c', marginLeft: 8 }}>/ {stats.camerasOffline} {t('parkingDevices.offline')}</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e6fffb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApiOutlined style={{ fontSize: 22, color: '#13c2c2' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{t('parkingDevices.sensors')}</Text>
                <div>
                  <Text strong style={{ fontSize: 20 }}>{stats.sensorsTotal}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}> {t('common.total')}</Text>
                  {stats.sensorsFaulty > 0 && (
                    <Text style={{ fontSize: 13, color: '#f5222d', marginLeft: 8 }}>/ {stats.sensorsFaulty} {t('parkingDevices.faulty')}</Text>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('parkingDevices.searchPlaceholder')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <FilterOutlined style={{ color: '#8c8c8c' }} />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 130 }}
            options={[
              { value: 'all', label: t('parkingDevices.allTypes') },
              { value: 'gate', label: `🚧 ${t('parkingDevices.gate')}` },
              { value: 'camera', label: `📷 ${t('parkingDevices.camera')}` },
              { value: 'sensor', label: `📡 ${t('parkingDevices.sensor')}` },
            ]}
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}
            options={[
              { value: 'all', label: t('parkingDevices.allStatus') },
              { value: 'online', label: t('parkingDevices.online') },
              { value: 'offline', label: t('parkingDevices.offline') },
              { value: 'warning', label: t('parkingDevices.warning') },
              { value: 'faulty', label: t('parkingDevices.faulty') },
            ]}
          />
        </div>
      </Card>

      {/* Device Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApiOutlined style={{ color: '#1890ff' }} />
            {t('parkingDevices.deviceList')}
            <Tag color="blue" style={{ borderRadius: 8 }}>{filtered.length}</Tag>
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100'],
            showTotal: (total) => `${t('common.total')}: ${total}`,
          }}
          size="small"
          scroll={{ x: 960 }}
        />
      </Card>
    </div>
  )
}
