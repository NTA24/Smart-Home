import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Table, Button, Space, Select, Tag, Drawer, Descriptions,
  Switch, Slider, Typography, InputNumber, Badge, Tooltip, Row, Col, Statistic,
} from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import {
  EnvironmentOutlined, TeamOutlined, EyeOutlined, PlusOutlined,
  SettingOutlined, BulbOutlined, CloudOutlined, PoweroffOutlined,
  WifiOutlined, ThunderboltOutlined, ExperimentOutlined,
  PlayCircleOutlined, CheckCircleOutlined, ToolOutlined, ClockCircleOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

type RoomStatus = 'in-use' | 'available' | 'issue' | 'reserved' | 'maintenance'

interface WorkspaceRoom {
  key: string
  room: string
  building: string
  floor: string
  capacity: number
  status: RoomStatus
  occupancy: number
  nextBooking?: string
  nextBookingNote?: string
  temperature: number
  co2: number
  humidity: number
  equipment: string[]
  hasVC: boolean
  acOn: boolean
  lightOn: boolean
  blindsOpen: boolean
}

const mockRooms: WorkspaceRoom[] = [
  { key: '1', room: 'A-1201', building: 'Tòa A', floor: '12F', capacity: 8, status: 'in-use', occupancy: 6, nextBooking: undefined, nextBookingNote: 'wsRoom.endsAt', temperature: 24, co2: 900, humidity: 55, equipment: ['Máy tính', 'Máy in'], hasVC: false, acOn: true, lightOn: true, blindsOpen: false },
  { key: '2', room: 'A-1203', building: 'Tòa A', floor: '12F', capacity: 10, status: 'available', occupancy: 0, temperature: 25, co2: 650, humidity: 52, equipment: ['Máy tính', 'Máy chiếu'], hasVC: true, acOn: false, lightOn: false, blindsOpen: true },
  { key: '3', room: 'B-0902', building: 'Tòa B', floor: '9F', capacity: 6, status: 'issue', occupancy: 0, nextBooking: '10:00–11:00', nextBookingNote: 'VC', temperature: 24, co2: 700, humidity: 58, equipment: ['Máy tính', 'Camera HD'], hasVC: true, acOn: false, lightOn: true, blindsOpen: false },
  { key: '4', room: 'C-0701', building: 'Tòa C', floor: '7F', capacity: 12, status: 'reserved', occupancy: 0, nextBooking: '10:15', nextBookingNote: 'wsRoom.startsAt', temperature: 26, co2: 800, humidity: 60, equipment: ['Máy tính', 'Bảng trắng'], hasVC: false, acOn: true, lightOn: false, blindsOpen: true },
  { key: '5', room: 'A-1105', building: 'Tòa A', floor: '11F', capacity: 4, status: 'in-use', occupancy: 3, temperature: 23, co2: 520, humidity: 50, equipment: ['Máy tính'], hasVC: false, acOn: true, lightOn: true, blindsOpen: false },
  { key: '6', room: 'B-0501', building: 'Tòa B', floor: '5F', capacity: 15, status: 'available', occupancy: 0, temperature: 24, co2: 400, humidity: 48, equipment: ['Máy tính', 'Máy chiếu', 'Micro'], hasVC: true, acOn: false, lightOn: false, blindsOpen: true },
  { key: '7', room: 'C-0305', building: 'Tòa C', floor: '3F', capacity: 6, status: 'maintenance', occupancy: 0, temperature: 27, co2: 380, humidity: 45, equipment: ['Máy tính'], hasVC: false, acOn: false, lightOn: false, blindsOpen: false },
  { key: '8', room: 'A-0801', building: 'Tòa A', floor: '8F', capacity: 20, status: 'reserved', occupancy: 0, nextBooking: '11:00', nextBookingNote: 'wsRoom.startsAt', temperature: 25, co2: 600, humidity: 54, equipment: ['Máy tính', 'Máy chiếu', 'Camera HD'], hasVC: true, acOn: true, lightOn: false, blindsOpen: true },
  { key: '9', room: 'B-0603', building: 'Tòa B', floor: '6F', capacity: 8, status: 'in-use', occupancy: 7, temperature: 25, co2: 850, humidity: 57, equipment: ['Máy tính', 'Bảng trắng'], hasVC: false, acOn: true, lightOn: true, blindsOpen: false },
  { key: '10', room: 'C-1001', building: 'Tòa C', floor: '10F', capacity: 10, status: 'available', occupancy: 0, temperature: 24, co2: 420, humidity: 50, equipment: ['Máy tính', 'Máy chiếu'], hasVC: true, acOn: false, lightOn: false, blindsOpen: true },
]

const statusConfig: Record<RoomStatus, { color: string; icon: React.ReactNode }> = {
  'in-use': { color: 'blue', icon: <TeamOutlined /> },
  available: { color: 'green', icon: <CheckCircleOutlined /> },
  issue: { color: 'red', icon: <ExperimentOutlined /> },
  reserved: { color: 'gold', icon: <ClockCircleOutlined /> },
  maintenance: { color: 'orange', icon: <ToolOutlined /> },
}

export default function SmartWorkspace() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<WorkspaceRoom | null>(null)
  const [controls, setControls] = useState({ acOn: false, lightOn: false, blindsOpen: false, acTemp: 24, lightLevel: 80 })

  // Filters
  const [filterFloor, setFilterFloor] = useState<string | undefined>()
  const [filterCapMin, setFilterCapMin] = useState<number | undefined>()
  const [filterCapMax, setFilterCapMax] = useState<number | undefined>()
  const [filterVC, setFilterVC] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  const filteredData = mockRooms.filter(r => {
    if (filterFloor && r.floor !== filterFloor) return false
    if (filterCapMin && r.capacity < filterCapMin) return false
    if (filterCapMax && r.capacity > filterCapMax) return false
    if (filterVC === 'yes' && !r.hasVC) return false
    if (filterVC === 'no' && r.hasVC) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  const floors = [...new Set(mockRooms.map(r => r.floor))].sort()

  const openDrawer = (room: WorkspaceRoom) => {
    setSelectedRoom(room)
    setControls({ acOn: room.acOn, lightOn: room.lightOn, blindsOpen: room.blindsOpen, acTemp: Math.round(room.temperature), lightLevel: 80 })
    setDrawerVisible(true)
  }

  const getCo2Color = (co2: number) => co2 < 600 ? '#52c41a' : co2 < 800 ? '#faad14' : '#ff4d4f'

  const columns: ColumnsType<WorkspaceRoom> = [
    {
      title: t('wsRoom.room'), key: 'room', width: 140, fixed: 'left',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{record.room}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.building} · {record.floor}</Text>
        </Space>
      ),
    },
    {
      title: t('wsRoom.status'), dataIndex: 'status', key: 'status', width: 120, align: 'center',
      render: (status: RoomStatus) => {
        const cfg = statusConfig[status]
        return (
          <Tag color={cfg.color} icon={cfg.icon} style={{ borderRadius: 12 }}>
            {t(`wsRoom.status_${status}`)}
          </Tag>
        )
      },
    },
    {
      title: t('wsRoom.nextBooking'), key: 'nextBooking', width: 180,
      render: (_, record) => {
        if (record.status === 'in-use') {
          return <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.endsAt')} 10:30</Text>
        }
        if (record.nextBooking) {
          return (
            <Space size={4}>
              <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>
                {record.nextBooking}
                {record.nextBookingNote && !record.nextBookingNote.startsWith('wsRoom.') && ` (${record.nextBookingNote})`}
                {record.nextBookingNote?.startsWith('wsRoom.') && ` — ${t(record.nextBookingNote)}`}
              </Text>
            </Space>
          )
        }
        return <Text type="secondary">—</Text>
      },
    },
    {
      title: t('wsRoom.tempCo2'), key: 'tempCo2', width: 160, align: 'center',
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title={t('wsRoom.temperature')}>
            <Text style={{ fontSize: 13 }}>{record.temperature}°C</Text>
          </Tooltip>
          <Tooltip title={`CO₂: ${record.co2} ppm`}>
            <Tag color={getCo2Color(record.co2)} style={{ borderRadius: 10, fontSize: 11, margin: 0 }}>
              {record.co2} ppm
            </Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('wsRoom.capacity'), dataIndex: 'capacity', key: 'capacity', width: 80, align: 'center',
      render: (cap: number, record) => record.status === 'in-use' ? (
        <Text>{record.occupancy}/{cap}</Text>
      ) : <Text type="secondary">{cap}</Text>,
    },
    {
      title: t('wsRoom.actions'), key: 'actions', width: 130, fixed: 'right', align: 'center',
      render: (_, record) => (
        <Space>
          {record.status === 'available' && (
            <Tooltip title={t('wsRoom.book')}>
              <Button type="primary" size="small" ghost icon={<PlusOutlined />}>{t('wsRoom.book')}</Button>
            </Tooltip>
          )}
          <Tooltip title={t('wsRoom.view')}>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate('/smart-workspace/room-detail')}>
              {t('wsRoom.view')}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined />
          {t('wsRoom.title')}
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.subtitle')}</Text>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <Space wrap size={12}>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.floor')}:</Text>
            <Select placeholder={t('wsRoom.allFloors')} style={{ width: 100 }} allowClear value={filterFloor} onChange={setFilterFloor}>
              {floors.map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
            </Select>
          </Space>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.capacity')}:</Text>
            <InputNumber placeholder="Min" style={{ width: 70 }} min={1} value={filterCapMin} onChange={(v) => setFilterCapMin(v ?? undefined)} />
            <Text type="secondary">–</Text>
            <InputNumber placeholder="Max" style={{ width: 70 }} min={1} value={filterCapMax} onChange={(v) => setFilterCapMax(v ?? undefined)} />
          </Space>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.equip')}:</Text>
            <Select placeholder="VC" style={{ width: 90 }} allowClear value={filterVC} onChange={setFilterVC}>
              <Select.Option value="yes">VC</Select.Option>
              <Select.Option value="no">No VC</Select.Option>
            </Select>
          </Space>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.status')}:</Text>
            <Select placeholder={t('wsRoom.allStatuses')} style={{ width: 130 }} allowClear value={filterStatus} onChange={setFilterStatus}>
              <Select.Option value="in-use">{t('wsRoom.status_in-use')}</Select.Option>
              <Select.Option value="available">{t('wsRoom.status_available')}</Select.Option>
              <Select.Option value="reserved">{t('wsRoom.status_reserved')}</Select.Option>
              <Select.Option value="issue">{t('wsRoom.status_issue')}</Select.Option>
              <Select.Option value="maintenance">{t('wsRoom.status_maintenance')}</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={<span><EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsRoom.rooms')} <Badge count={filteredData.length} style={{ backgroundColor: '#1890ff', marginLeft: 8 }} /></span>}>
        <Table
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: 900 }}
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} ${t('wsRoom.roomsLabel')}` }}
          rowClassName={(record) => record.status === 'issue' ? 'ant-table-row-issue' : ''}
        />
      </Card>

      {/* Room Detail Drawer */}
      <Drawer
        title={selectedRoom ? `${selectedRoom.room} — ${t('wsRoom.roomDetail')}` : ''}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={460}
      >
        {selectedRoom && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Info */}
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label={t('wsRoom.building')}>{selectedRoom.building}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.floor')}>{selectedRoom.floor}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.capacity')}><TeamOutlined style={{ marginRight: 4 }} />{selectedRoom.capacity}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.status')}>
                <Tag color={statusConfig[selectedRoom.status].color} icon={statusConfig[selectedRoom.status].icon}>
                  {t(`wsRoom.status_${selectedRoom.status}`)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.equipment')} span={2}>
                {selectedRoom.equipment.map((e, i) => <Tag key={i}>{e}</Tag>)}
              </Descriptions.Item>
            </Descriptions>

            {/* Environment */}
            <Card size="small" title={<span><ExperimentOutlined style={{ marginRight: 6, color: '#1890ff' }} />{t('wsRoom.environment')}</span>}>
              <Row gutter={[16, 12]}>
                <Col span={8}>
                  <Statistic title={t('wsRoom.temperature')} value={selectedRoom.temperature} suffix="°C" valueStyle={{ fontSize: 18 }} prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />} />
                </Col>
                <Col span={8}>
                  <Statistic title={t('wsRoom.humidity')} value={selectedRoom.humidity} suffix="%" valueStyle={{ fontSize: 18 }} prefix={<CloudOutlined style={{ color: '#1890ff' }} />} />
                </Col>
                <Col span={8}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>CO₂</Text>
                    <div><Text strong style={{ fontSize: 18, color: getCo2Color(selectedRoom.co2) }}>{selectedRoom.co2}</Text> <Text type="secondary">ppm</Text></div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Controls */}
            <Card size="small" title={<span><SettingOutlined style={{ marginRight: 6, color: '#52c41a' }} />{t('wsRoom.deviceControl')}</span>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space><PoweroffOutlined style={{ color: controls.acOn ? '#52c41a' : '#d9d9d9' }} /><Text>{t('wsRoom.ac')}</Text></Space>
                  <Switch checked={controls.acOn} onChange={(v) => setControls(p => ({ ...p, acOn: v }))} />
                </div>
                {controls.acOn && (
                  <div style={{ paddingLeft: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t('wsRoom.setTemp')}: {controls.acTemp}°C</Text>
                    <Slider min={16} max={30} value={controls.acTemp} onChange={(v) => setControls(p => ({ ...p, acTemp: v }))} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space><BulbOutlined style={{ color: controls.lightOn ? '#fadb14' : '#d9d9d9' }} /><Text>{t('wsRoom.light')}</Text></Space>
                  <Switch checked={controls.lightOn} onChange={(v) => setControls(p => ({ ...p, lightOn: v }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space><CloudOutlined style={{ color: controls.blindsOpen ? '#1890ff' : '#d9d9d9' }} /><Text>{t('wsRoom.blinds')}</Text></Space>
                  <Switch checked={controls.blindsOpen} onChange={(v) => setControls(p => ({ ...p, blindsOpen: v }))} checkedChildren={t('wsRoom.open')} unCheckedChildren={t('wsRoom.closed')} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space><WifiOutlined style={{ color: '#52c41a' }} /><Text>Wi-Fi</Text></Space>
                  <Tag color="green">{t('wsRoom.connected')}</Tag>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}
