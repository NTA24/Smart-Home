import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Badge,
  Tooltip,
  Select,
  Popconfirm,
  message,
  Modal,
  Table,
} from 'antd'
import {
  ApiOutlined,
  ReloadOutlined,
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
  ExportOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  FilterBar,
  SearchInput,
  DataTable,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleDeviceFilters,
  getVehicleDevices,
  saveVehicleDeviceFilters,
  saveVehicleDevices,
} from '@/services/mockPersistence'

const { Text } = Typography

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
  nameKey?: string
  locationKey?: string
  locationFloor?: string
  locationZone?: string
  locationSlot?: string
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
  { key: '1', name: '', type: 'gate', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:20', ip: '192.168.1.101', firmware: 'v2.4.1', nameKey: 'device_gateEntrance1', locationKey: 'loc_B1MainEntry' },
  { key: '2', name: '', type: 'gate', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:18', ip: '192.168.1.102', firmware: 'v2.4.1', nameKey: 'device_gateEntrance2', locationKey: 'loc_B1SideEntry' },
  { key: '3', name: '', type: 'gate', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:22', ip: '192.168.1.103', firmware: 'v2.4.1', nameKey: 'device_gateExit1', locationKey: 'loc_B1MainExit' },
  { key: '4', name: '', type: 'gate', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:15', ip: '192.168.1.104', firmware: 'v2.4.1', nameKey: 'device_gateExit2', locationKey: 'loc_B1SideExit' },
  { key: '5', name: '', type: 'gate', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:44:50', ip: '192.168.1.105', firmware: 'v2.3.8', nameKey: 'device_gateEntrance3', locationKey: 'loc_B2Entry' },
  { key: '6', name: '', type: 'gate', location: '', status: 'warning', lastHeartbeat: '2026-02-10 10:30:00', ip: '192.168.1.106', firmware: 'v2.3.8', nameKey: 'device_gateExit3', locationKey: 'loc_B2Exit' },
  { key: '7', name: 'CAM-ENT-01', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:21', ip: '192.168.2.1', firmware: 'v5.1.2', nameKey: 'device_camEnt01', locationKey: 'loc_B1MainEntry' },
  { key: '8', name: 'CAM-ENT-02', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:19', ip: '192.168.2.2', firmware: 'v5.1.2', nameKey: 'device_camEnt02', locationKey: 'loc_B1SideEntry' },
  { key: '9', name: 'CAM-EXIT-01', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:20', ip: '192.168.2.3', firmware: 'v5.1.2', nameKey: 'device_camExit01', locationKey: 'loc_B1MainExit' },
  { key: '10', name: 'CAM-EXIT-02', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:17', ip: '192.168.2.4', firmware: 'v5.1.2', nameKey: 'device_camExit02', locationKey: 'loc_B1SideExit' },
  { key: '11', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:10', ip: '192.168.2.5', firmware: 'v5.1.2', nameKey: 'device_camB1ZoneA', locationKey: 'loc_B1ZoneA' },
  { key: '12', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:12', ip: '192.168.2.6', firmware: 'v5.1.2', nameKey: 'device_camB1ZoneB', locationKey: 'loc_B1ZoneB' },
  { key: '13', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:08', ip: '192.168.2.7', firmware: 'v5.1.2', nameKey: 'device_camB2ZoneA', locationKey: 'loc_B2ZoneA' },
  { key: '14', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:45:05', ip: '192.168.2.8', firmware: 'v5.1.2', nameKey: 'device_camB2ZoneB', locationKey: 'loc_B2ZoneB' },
  { key: '15', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:44:55', ip: '192.168.2.9', firmware: 'v5.0.9', nameKey: 'device_camB2ZoneC', locationKey: 'loc_B2ZoneC' },
  { key: '16', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:44:50', ip: '192.168.2.10', firmware: 'v5.0.9', nameKey: 'device_camB3ZoneA', locationKey: 'loc_B3ZoneA' },
  { key: '17', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:44:48', ip: '192.168.2.11', firmware: 'v5.0.9', nameKey: 'device_camB3ZoneB', locationKey: 'loc_B3ZoneB' },
  { key: '18', name: '', type: 'camera', location: '', status: 'online', lastHeartbeat: '2026-02-10 10:44:45', ip: '192.168.2.12', firmware: 'v5.0.9', nameKey: 'device_camB3ZoneC', locationKey: 'loc_B3ZoneC' },
  ...Array.from({ length: 480 }, (_, i) => {
    const zone = ['A', 'B', 'C'][i % 3]
    const floor = ['B1', 'B2', 'B3'][Math.floor(i / 160)]
    const status: DeviceStatus = i === 42 || i === 105 || i === 200 || i === 310 || i === 410 ? 'faulty' : 'online'
    const slot = `${zone}${String((i % 53) + 1).padStart(2, '0')}`
    return {
      key: `s-${i}`,
      name: `SENS-${floor}-${zone}-${String((i % 160) + 1).padStart(3, '0')}`,
      type: 'sensor' as DeviceType,
      location: '',
      status,
      lastHeartbeat: status === 'faulty' ? '2026-02-10 08:15:00' : `2026-02-10 10:${String(40 + (i % 6)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      ip: `192.168.3.${i + 1}`,
      firmware: 'v1.2.0',
      locationFloor: floor,
      locationZone: zone,
      locationSlot: slot,
    }
  }),
]

export default function ParkingDevices() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const persistedFilters = getVehicleDeviceFilters<{ searchText: string; typeFilter: string; statusFilter: string }>({
    searchText: '',
    typeFilter: 'all',
    statusFilter: 'all',
  })
  const [devices] = useState<ParkingDevice[]>(() => getVehicleDevices<ParkingDevice>(mockDevices))
  const [searchText, setSearchText] = useState(persistedFilters.searchText)
  const [typeFilter, setTypeFilter] = useState<string>(persistedFilters.typeFilter)
  const [statusFilter, setStatusFilter] = useState<string>(persistedFilters.statusFilter)

  useEffect(() => {
    saveVehicleDevices(devices)
  }, [devices])

  useEffect(() => {
    saveVehicleDeviceFilters({ searchText, typeFilter, statusFilter })
  }, [searchText, typeFilter, statusFilter])

  const filtered = useMemo(() => devices.filter(d => {
    if (searchText) {
      const q = searchText.toLowerCase()
      if (!d.name.toLowerCase().includes(q) && !d.location.toLowerCase().includes(q)) return false
    }
    if (typeFilter !== 'all' && d.type !== typeFilter) return false
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    return true
  }), [devices, searchText, typeFilter, statusFilter])

  const gateDevices = devices.filter(d => d.type === 'gate')
  const cameraDevices = devices.filter(d => d.type === 'camera')
  const sensorDevices = devices.filter(d => d.type === 'sensor')

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
    setTimeout(() => message.success(`${getDeviceDisplayName(device)} ${t('parkingDevices.restartSuccess')}`), 2000)
  }

  const handleTest = (device: ParkingDevice) => {
    const displayName = device.nameKey ? t(`parkingDevices.${device.nameKey}`) : device.name
    message.loading(`${t('parkingDevices.testing')} ${displayName}...`, 1.5)
    setTimeout(() => message.success(`${displayName} ${t('parkingDevices.testOk')}`), 1500)
  }

  const [logsModalVisible, setLogsModalVisible] = useState(false)
  const [logsModalDevice, setLogsModalDevice] = useState<ParkingDevice | null>(null)

  const getDeviceDisplayName = (device: ParkingDevice) => device.nameKey ? t(`parkingDevices.${device.nameKey}`) : device.name

  const getFakeLogs = (deviceKey: string): Array<{ key: string; time: string; level: 'info' | 'warn' | 'error'; message: string }> => {
    const now = dayjs()
    const levels: Array<'info' | 'warn' | 'error'> = ['info', 'info', 'info', 'warn', 'info', 'error', 'info', 'info']
    const msgKeys = [
      'log_heartbeat',
      'log_statusOk',
      'log_connection',
      'log_retry',
      'log_restart',
      'log_timeout',
      'log_firmware',
      'log_sync',
    ]
    return Array.from({ length: 12 }, (_, i) => ({
      key: `${deviceKey}-log-${i}`,
      time: now.subtract(i * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      level: levels[i % levels.length],
      message: msgKeys[i % msgKeys.length],
    }))
  }

  const handleOpenLogs = (device: ParkingDevice) => {
    setLogsModalDevice(device)
    setLogsModalVisible(true)
  }

  const exportDevices = () => {
    if (filtered.length === 0) {
      message.info(t('common.noData'))
      return
    }
    const rows = filtered.map((item) => ({
      name: item.name,
      type: item.type,
      location: item.location,
      status: item.status,
      lastHeartbeat: item.lastHeartbeat,
      ip: item.ip || '',
      firmware: item.firmware || '',
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parking-devices-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      title: t('parkingDevices.device'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: ParkingDevice) => {
        const cfg = TYPE_CONFIG[record.type]
        const displayName = record.nameKey ? t(`parkingDevices.${record.nameKey}`) : name
        return (
          <Space>
            <span style={{ color: cfg.color }}>{cfg.icon}</span>
            <Text strong className="text-base">{displayName}</Text>
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
        return <Tag color={cfg.color} className="rounded">{cfg.icon} {t(`parkingDevices.${cfg.label}`)}</Tag>
      },
    },
    {
      title: t('parkingDevices.location'),
      dataIndex: 'location',
      key: 'location',
      width: 180,
      ellipsis: true,
      render: (loc: string, record: ParkingDevice) => {
        if (record.locationFloor != null && record.locationZone != null && record.locationSlot != null) {
          return t('parkingDevices.zoneSlotFormat', { floor: record.locationFloor, zone: record.locationZone, slot: record.locationSlot })
        }
        if (record.locationKey) return t(`parkingDevices.${record.locationKey}`)
        return loc
      },
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
      render: (ts: string) => <Text className="text-sm font-mono">{ts}</Text>,
    },
    {
      title: t('parkingDevices.actions'),
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ParkingDevice) => (
        <Space size={4}>
          <Tooltip title={t('parkingDevices.restart')}>
            <Popconfirm title={`${t('parkingDevices.restart')} ${getDeviceDisplayName(record)}?`} onConfirm={() => handleRestart(record)} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
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
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleOpenLogs(record)}>
              {t('parkingDevices.logs')}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('parkingDevices.title')}
        icon={<ApiOutlined />}
        subtitle={selectedBuilding?.name || t('parkingDevices.allSites')}
        actions={
          <Space>
            <Button icon={<ExportOutlined />} onClick={exportDevices}>{t('parkingTickets.export')}</Button>
            <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
          </Space>
        }
      />

      {/* Overview cards */}
      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} sm={8}>
          <ContentCard>
            <div className="flex items-center gap-12">
              <div className="vehicle_overview-icon-box vehicle_overview-icon-box--gate">
                <GatewayOutlined className="vehicle_overview-icon" style={{ color: '#1890ff' }} />
              </div>
              <div>
                <Text type="secondary" className="text-sm">{t('parkingDevices.gates')}</Text>
                <div>
                  <Text strong className="text-2xl text-success">{stats.gatesOnline}</Text>
                  <Text type="secondary" className="text-base"> {t('parkingDevices.online')}</Text>
                  {stats.gatesWarning > 0 && (
                    <Text className="text-base text-warning ml-4">/ {stats.gatesWarning} {t('parkingDevices.warning')}</Text>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>
        </Col>
        <Col xs={24} sm={8}>
          <ContentCard>
            <div className="flex items-center gap-12">
              <div className="vehicle_overview-icon-box vehicle_overview-icon-box--camera">
                <VideoCameraOutlined className="vehicle_overview-icon" style={{ color: '#722ed1' }} />
              </div>
              <div>
                <Text type="secondary" className="text-sm">{t('parkingDevices.cameras')}</Text>
                <div>
                  <Text strong className="text-2xl text-success">{stats.camerasOnline}</Text>
                  <Text type="secondary" className="text-base"> {t('parkingDevices.online')}</Text>
                  <Text className="text-base text-muted ml-4">/ {stats.camerasOffline} {t('parkingDevices.offline')}</Text>
                </div>
              </div>
            </div>
          </ContentCard>
        </Col>
        <Col xs={24} sm={8}>
          <ContentCard>
            <div className="flex items-center gap-12">
              <div className="vehicle_overview-icon-box vehicle_overview-icon-box--sensor">
                <ApiOutlined className="vehicle_overview-icon" style={{ color: '#13c2c2' }} />
              </div>
              <div>
                <Text type="secondary" className="text-sm">{t('parkingDevices.sensors')}</Text>
                <div>
                  <Text strong className="text-2xl">{stats.sensorsTotal}</Text>
                  <Text type="secondary" className="text-base"> {t('common.total')}</Text>
                  {stats.sensorsFaulty > 0 && (
                    <Text className="text-base text-danger ml-4">/ {stats.sensorsFaulty} {t('parkingDevices.faulty')}</Text>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>
        </Col>
      </Row>

      {/* Filters */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
        <FilterBar>
          <SearchInput
            placeholder={t('parkingDevices.searchPlaceholder')}
            value={searchText}
            onChange={setSearchText}
            width={260}
          />
          <FilterOutlined className="text-muted" />
          <Select value={typeFilter} onChange={setTypeFilter} className="vehicle_filter-select-w130"
            options={[
              { value: 'all', label: t('parkingDevices.allTypes') },
              { value: 'gate', label: `🚧 ${t('parkingDevices.gate')}` },
              { value: 'camera', label: `📷 ${t('parkingDevices.camera')}` },
              { value: 'sensor', label: `📡 ${t('parkingDevices.sensor')}` },
            ]}
          />
          <Select value={statusFilter} onChange={setStatusFilter} className="vehicle_filter-select-w130"
            options={[
              { value: 'all', label: t('parkingDevices.allStatus') },
              { value: 'online', label: t('parkingDevices.online') },
              { value: 'offline', label: t('parkingDevices.offline') },
              { value: 'warning', label: t('parkingDevices.warning') },
              { value: 'faulty', label: t('parkingDevices.faulty') },
            ]}
          />
        </FilterBar>
      </ContentCard>

      {/* Device Table */}
      <ContentCard
        title={<>{t('parkingDevices.deviceList')} <Tag color="blue" className="vehicle_tag-rounded-8">{filtered.length}</Tag></>}
        titleIcon={<ApiOutlined />}
        titleIconColor="#1890ff"
      >
        <DataTable
          columns={columns}
          dataSource={filtered}
          pageSize={20}
          total={filtered.length}
          size="small"
          scroll={{ x: 960 }}
          pagination={{
            pageSizeOptions: ['20', '50', '100'],
          }}
        />
      </ContentCard>

      <Modal
        title={logsModalDevice ? `${t('parkingDevices.logsTitle')}: ${getDeviceDisplayName(logsModalDevice)}` : t('parkingDevices.logsTitle')}
        open={logsModalVisible}
        onCancel={() => { setLogsModalVisible(false); setLogsModalDevice(null) }}
        footer={null}
        width={640}
        destroyOnClose
      >
        {logsModalDevice && (
          <Table
            size="small"
            dataSource={getFakeLogs(logsModalDevice.key)}
            columns={[
              { title: t('parkingDevices.logTime'), dataIndex: 'time', key: 'time', width: 180, render: (v: string) => <Text className="font-mono text-xs">{v}</Text> },
              {
                title: t('parkingDevices.logLevel'),
                dataIndex: 'level',
                key: 'level',
                width: 90,
                render: (level: string) => (
                  <Tag color={level === 'error' ? 'red' : level === 'warn' ? 'orange' : 'blue'}>
                    {t(`parkingDevices.logLevel_${level}`)}
                  </Tag>
                ),
              },
              { title: t('parkingDevices.logMessage'), dataIndex: 'message', key: 'message', render: (key: string) => t(`parkingDevices.${key}`) },
            ]}
            pagination={false}
            scroll={{ y: 360 }}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
