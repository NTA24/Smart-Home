import { useEffect, useState } from 'react'
import {
  Button, Space, Select, Descriptions,
  Switch, Slider, Typography, InputNumber, Badge, Tooltip, Row, Col, Statistic,
  Card, Tag, Form, Input,
} from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import {
  EnvironmentOutlined, TeamOutlined, PlusOutlined,
  SettingOutlined, BulbOutlined, CloudOutlined, PoweroffOutlined,
  WifiOutlined, ThunderboltOutlined, ExperimentOutlined,
  CheckCircleOutlined, ToolOutlined, ClockCircleOutlined,
} from '@ant-design/icons'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  FilterBar,
  DataTable,
  StatusTag,
  DetailDrawer,
  CrudModal,
  TableActionButtons,
} from '@/components'
import { getWorkspaceRooms, saveWorkspaceRooms } from '@/services/mockPersistence'

const { Text } = Typography

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

interface RoomFormValues {
  room: string
  building: string
  floor: string
  capacity: number
  status: RoomStatus
  occupancy: number
  temperature: number
  co2: number
  humidity: number
  hasVC: boolean
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

const getStatusConfig = (t: (k: string) => string): Record<RoomStatus, { color: string; label: string; icon?: React.ReactNode }> => ({
  'in-use': { color: 'blue', label: t('wsRoom.status_in-use'), icon: <TeamOutlined /> },
  available: { color: 'green', label: t('wsRoom.status_available'), icon: <CheckCircleOutlined /> },
  issue: { color: 'red', label: t('wsRoom.status_issue'), icon: <ExperimentOutlined /> },
  reserved: { color: 'gold', label: t('wsRoom.status_reserved'), icon: <ClockCircleOutlined /> },
  maintenance: { color: 'orange', label: t('wsRoom.status_maintenance'), icon: <ToolOutlined /> },
})

export default function SmartWorkspace() {
  const { t } = useTranslation()
  const [form] = Form.useForm<RoomFormValues>()
  const [rooms, setRooms] = useState<WorkspaceRoom[]>(() => getWorkspaceRooms(mockRooms))
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<WorkspaceRoom | null>(null)
  const [controls, setControls] = useState({ acOn: false, lightOn: false, blindsOpen: false, acTemp: 24, lightLevel: 80 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<WorkspaceRoom | null>(null)

  // Filters
  const [filterFloor, setFilterFloor] = useState<string | undefined>()
  const [filterCapMin, setFilterCapMin] = useState<number | undefined>()
  const [filterCapMax, setFilterCapMax] = useState<number | undefined>()
  const [filterVC, setFilterVC] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  const filteredData = rooms.filter(r => {
    if (filterFloor && r.floor !== filterFloor) return false
    if (filterCapMin && r.capacity < filterCapMin) return false
    if (filterCapMax && r.capacity > filterCapMax) return false
    if (filterVC === 'yes' && !r.hasVC) return false
    if (filterVC === 'no' && r.hasVC) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  const floors = [...new Set(rooms.map(r => r.floor))].sort()

  const openDrawer = (room: WorkspaceRoom) => {
    setSelectedRoom(room)
    setControls({ acOn: room.acOn, lightOn: room.lightOn, blindsOpen: room.blindsOpen, acTemp: Math.round(room.temperature), lightLevel: 80 })
    setDrawerVisible(true)
  }

  const openCreateModal = () => {
    setEditingRoom(null)
    form.setFieldsValue({
      room: '',
      building: '',
      floor: '',
      capacity: 6,
      status: 'available',
      occupancy: 0,
      temperature: 24,
      co2: 500,
      humidity: 50,
      hasVC: false,
    })
    setModalOpen(true)
  }

  const openEditModal = (room: WorkspaceRoom) => {
    setEditingRoom(room)
    form.setFieldsValue({
      room: room.room,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      status: room.status,
      occupancy: room.occupancy,
      temperature: room.temperature,
      co2: room.co2,
      humidity: room.humidity,
      hasVC: room.hasVC,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRoom(null)
    form.resetFields()
  }

  const handleSubmit = (values: RoomFormValues) => {
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.key === editingRoom.key
            ? {
                ...r,
                ...values,
                occupancy: values.status === 'in-use' ? values.occupancy : 0,
              }
            : r,
        ),
      )
      setSelectedRoom((prev) =>
        prev && prev.key === editingRoom.key
          ? { ...prev, ...values, occupancy: values.status === 'in-use' ? values.occupancy : 0 }
          : prev,
      )
    } else {
      const newRoom: WorkspaceRoom = {
        key: `room-${Date.now()}`,
        room: values.room,
        building: values.building,
        floor: values.floor,
        capacity: values.capacity,
        status: values.status,
        occupancy: values.status === 'in-use' ? values.occupancy : 0,
        temperature: values.temperature,
        co2: values.co2,
        humidity: values.humidity,
        hasVC: values.hasVC,
        nextBooking: undefined,
        nextBookingNote: undefined,
        equipment: values.hasVC ? ['Máy tính', 'VC'] : ['Máy tính'],
        acOn: values.status === 'in-use',
        lightOn: values.status === 'in-use',
        blindsOpen: values.status !== 'in-use',
      }
      setRooms((prev) => [newRoom, ...prev])
    }
    closeModal()
  }

  const handleDelete = (roomKey: string) => {
    setRooms((prev) => prev.filter((r) => r.key !== roomKey))
    if (selectedRoom?.key === roomKey) {
      setDrawerVisible(false)
      setSelectedRoom(null)
    }
  }

  const getCo2Color = (co2: number) => co2 < 600 ? '#52c41a' : co2 < 800 ? '#faad14' : '#ff4d4f'

  useEffect(() => {
    saveWorkspaceRooms(rooms)
  }, [rooms])

  const columns: ColumnsType<WorkspaceRoom> = [
    {
      title: t('wsRoom.room'), key: 'room', width: 140, fixed: 'left',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-md">{record.room}</Text>
          <Text type="secondary" className="text-11">{record.building} · {record.floor}</Text>
        </Space>
      ),
    },
    {
      title: t('wsRoom.status'), dataIndex: 'status', key: 'status', width: 120, align: 'center',
      render: (status: RoomStatus) => <StatusTag status={status} config={getStatusConfig(t)} className="workspace_tag-radius-12" />,
    },
    {
      title: t('wsRoom.nextBooking'), key: 'nextBooking', width: 180,
      render: (_, record) => {
        if (record.status === 'in-use') {
          return <Text type="secondary" className="text-sm">{t('wsRoom.endsAt')} 10:30</Text>
        }
        if (record.nextBooking) {
          return (
            <Space size={4}>
              <ClockCircleOutlined className="text-primary text-sm" />
              <Text className="text-sm">
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
            <Text className="text-base">{record.temperature}°C</Text>
            </Tooltip>
          <Tooltip title={`CO₂: ${record.co2} ppm`}>
            <Tag color={getCo2Color(record.co2)} className="workspace_tag-rounded-10 text-11 m-0">
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
          <TableActionButtons
            onView={() => openDrawer(record)}
            onEdit={() => openEditModal(record)}
            onDelete={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ]

  const statusConfig = getStatusConfig(t)

  return (
    <PageContainer>
      <PageHeader
        title={t('wsRoom.title')}
        icon={<EnvironmentOutlined />}
        subtitle={t('wsRoom.subtitle')}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            {t('common.add', 'Add')}
          </Button>
        }
      />

      {/* Filters */}
      <ContentCard className="workspace_filter-mb">
        <FilterBar>
          <Space size={4}>
            <Text type="secondary" className="text-sm">{t('wsRoom.floor')}:</Text>
            <Select placeholder={t('wsRoom.allFloors')} style={{ width: 100 }} allowClear value={filterFloor} onChange={setFilterFloor}>
              {floors.map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
            </Select>
          </Space>
          <Space size={4}>
            <Text type="secondary" className="text-sm">{t('wsRoom.capacity')}:</Text>
            <InputNumber placeholder="Min" style={{ width: 70 }} min={1} value={filterCapMin} onChange={(v) => setFilterCapMin(v ?? undefined)} />
            <Text type="secondary">–</Text>
            <InputNumber placeholder="Max" style={{ width: 70 }} min={1} value={filterCapMax} onChange={(v) => setFilterCapMax(v ?? undefined)} />
          </Space>
          <Space size={4}>
            <Text type="secondary" className="text-sm">{t('wsRoom.equip')}:</Text>
            <Select placeholder="VC" style={{ width: 90 }} allowClear value={filterVC} onChange={setFilterVC}>
              <Select.Option value="yes">VC</Select.Option>
              <Select.Option value="no">No VC</Select.Option>
            </Select>
          </Space>
          <Space size={4}>
            <Text type="secondary" className="text-sm">{t('wsRoom.status')}:</Text>
            <Select placeholder={t('wsRoom.allStatuses')} style={{ width: 130 }} allowClear value={filterStatus} onChange={setFilterStatus}>
              <Select.Option value="in-use">{t('wsRoom.status_in-use')}</Select.Option>
              <Select.Option value="available">{t('wsRoom.status_available')}</Select.Option>
              <Select.Option value="reserved">{t('wsRoom.status_reserved')}</Select.Option>
              <Select.Option value="issue">{t('wsRoom.status_issue')}</Select.Option>
              <Select.Option value="maintenance">{t('wsRoom.status_maintenance')}</Select.Option>
            </Select>
          </Space>
        </FilterBar>
      </ContentCard>

      {/* Table */}
      <ContentCard
        title={<>{t('wsRoom.rooms')} <Badge count={filteredData.length} className="ml-4 text-primary" style={{ backgroundColor: '#1890ff' }} /></>}
        titleIcon={<EnvironmentOutlined />}
      >
        <DataTable<WorkspaceRoom>
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: 900 }}
          pageSize={10}
          total={filteredData.length}
          pagination={{ showTotal: (total) => `${total} ${t('wsRoom.roomsLabel')}` }}
          rowClassName={(record) => record.status === 'issue' ? 'ant-table-row-issue' : ''}
        />
      </ContentCard>

      {/* Room Detail Drawer */}
      <DetailDrawer
        title={selectedRoom ? `${selectedRoom.room} — ${t('wsRoom.roomDetail')}` : ''}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={460}
      >
        {selectedRoom && (
          <div className="workspace_drawer-col">
            {/* Info */}
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label={t('wsRoom.building')}>{selectedRoom.building}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.floor')}>{selectedRoom.floor}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.capacity')}><TeamOutlined className="workspace_icon-mr-4 mr-4" />{selectedRoom.capacity}</Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.status')}>
                <StatusTag status={selectedRoom.status} config={statusConfig} />
              </Descriptions.Item>
              <Descriptions.Item label={t('wsRoom.equipment')} span={2}>
                {selectedRoom.equipment.map((e, i) => <Tag key={i}>{e}</Tag>)}
              </Descriptions.Item>
            </Descriptions>

            {/* Environment */}
            <Card size="small" title={<span><ExperimentOutlined className="workspace_card-icon-mr text-primary" />{t('wsRoom.environment')}</span>}>
              <Row gutter={[16, 12]}>
                <Col span={8}>
                  <Statistic title={t('wsRoom.temperature')} value={selectedRoom.temperature} suffix="°C" valueStyle={{ fontSize: 18 }} prefix={<ThunderboltOutlined className="text-warning" />} />
                </Col>
                <Col span={8}>
                  <Statistic title={t('wsRoom.humidity')} value={selectedRoom.humidity} suffix="%" valueStyle={{ fontSize: 18 }} prefix={<CloudOutlined className="text-primary" />} />
                </Col>
                <Col span={8}>
                  <div>
                    <Text type="secondary" className="text-sm">CO₂</Text>
                    <div className="workspace_co2-row"><Text strong className="text-xl" style={{ color: getCo2Color(selectedRoom.co2) }}>{selectedRoom.co2}</Text> <Text type="secondary">ppm</Text></div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Controls */}
            <Card size="small" title={<span><SettingOutlined className="workspace_card-icon-mr text-success" />{t('wsRoom.deviceControl')}</span>}>
              <div className="workspace_control-col">
                <div className="workspace_control-row">
                  <Space><PoweroffOutlined style={{ color: controls.acOn ? '#52c41a' : '#d9d9d9' }} /><Text>{t('wsRoom.ac')}</Text></Space>
                  <Switch checked={controls.acOn} onChange={(v) => setControls(p => ({ ...p, acOn: v }))} />
                </div>
                {controls.acOn && (
                  <div className="workspace_ac-indent">
                    <Text type="secondary" className="text-sm">{t('wsRoom.setTemp')}: {controls.acTemp}°C</Text>
                    <Slider min={16} max={30} value={controls.acTemp} onChange={(v) => setControls(p => ({ ...p, acTemp: v }))} />
                  </div>
                )}
                <div className="workspace_control-row">
                  <Space><BulbOutlined style={{ color: controls.lightOn ? '#fadb14' : '#d9d9d9' }} /><Text>{t('wsRoom.light')}</Text></Space>
                  <Switch checked={controls.lightOn} onChange={(v) => setControls(p => ({ ...p, lightOn: v }))} />
                </div>
                <div className="workspace_control-row">
                  <Space><CloudOutlined style={{ color: controls.blindsOpen ? '#1890ff' : '#d9d9d9' }} /><Text>{t('wsRoom.blinds')}</Text></Space>
                  <Switch checked={controls.blindsOpen} onChange={(v) => setControls(p => ({ ...p, blindsOpen: v }))} checkedChildren={t('wsRoom.open')} unCheckedChildren={t('wsRoom.closed')} />
                </div>
                <div className="workspace_control-row">
                  <Space><WifiOutlined style={{ color: '#52c41a' }} /><Text>Wi-Fi</Text></Space>
                  <Tag color="green">{t('wsRoom.connected')}</Tag>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DetailDrawer>

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        form={form}
        isEdit={!!editingRoom}
        onSubmit={handleSubmit}
        title={editingRoom ? t('common.edit', 'Edit room') : t('common.add', 'Add room')}
      >
        <Form.Item name="room" label={t('wsRoom.room')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="building" label={t('wsRoom.building')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="floor" label={t('wsRoom.floor')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="capacity" label={t('wsRoom.capacity')} rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="occupancy" label={t('wsRoom.occupancy', 'Occupancy')}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="status" label={t('wsRoom.status')} rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'in-use', label: t('wsRoom.status_in-use') },
                  { value: 'available', label: t('wsRoom.status_available') },
                  { value: 'reserved', label: t('wsRoom.status_reserved') },
                  { value: 'issue', label: t('wsRoom.status_issue') },
                  { value: 'maintenance', label: t('wsRoom.status_maintenance') },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hasVC" label="VC" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="temperature" label={t('wsRoom.temperature')}>
              <InputNumber min={16} max={35} className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="co2" label="CO₂">
              <InputNumber min={300} max={2000} className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="humidity" label={t('wsRoom.humidity')}>
              <InputNumber min={20} max={90} className="w-full" />
            </Form.Item>
          </Col>
        </Row>
      </CrudModal>
    </PageContainer>
  )
}
