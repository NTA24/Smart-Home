import { useEffect, useState } from 'react'
import {
  Button, Space, Select, Tag, Row, Col, Card,
  Table, Drawer, Modal,
  Statistic, Descriptions, Switch, Timeline, Badge, Tooltip, Typography, Form, Input, DatePicker, TimePicker,
} from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import {
  CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
  VideoCameraOutlined, AudioOutlined, DesktopOutlined, BulbOutlined,
  SettingOutlined, PlusOutlined, EyeOutlined, PoweroffOutlined,
  WifiOutlined, SoundOutlined,
} from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import {
  getMeetingBookings,
  saveMeetingBookings,
  getMeetingRooms,
  saveMeetingRooms,
} from '@/services/mockPersistence'

const { Text } = Typography

interface MeetingRoom {
  key: string
  roomName: string
  capacity: number
  equipment: string[]
  building: string
  floor: string
  roomNumber: string
  status: 'available' | 'in-meeting' | 'booked' | 'maintenance'
  currentMeeting?: { title: string; organizer: string; start: string; end: string; attendees: number }
  nextMeeting?: { title: string; start: string }
  hasVideo: boolean
  hasAudio: boolean
  hasProjector: boolean
  hasWhiteboard: boolean
  acOn: boolean
  lightOn: boolean
}

interface Booking {
  key: string
  roomName: string
  meetingTitle: string
  organizer: string
  date: string
  startTime: string
  endTime: string
  attendees: number
  status: 'confirmed' | 'pending' | 'cancelled'
  recurring: boolean
}

const mockRooms: MeetingRoom[] = [
  { key: '1', roomName: 'Phòng họp lớn A', capacity: 50, equipment: ['Máy chiếu', 'Micro', 'Camera'], building: 'Tòa nhà 1', floor: '3F', roomNumber: '301', status: 'in-meeting', currentMeeting: { title: 'Họp ban giám đốc Q1', organizer: 'Nguyễn Văn A', start: '09:00', end: '10:30', attendees: 25 }, nextMeeting: { title: 'Review dự án X', start: '14:00' }, hasVideo: true, hasAudio: true, hasProjector: true, hasWhiteboard: true, acOn: true, lightOn: true },
  { key: '2', roomName: 'Phòng họp 502', capacity: 25, equipment: ['Bảng trắng', 'Máy tính', 'Máy chiếu'], building: 'Tòa nhà 2', floor: '5F', roomNumber: '502', status: 'booked', nextMeeting: { title: 'Sprint Planning', start: '13:00' }, hasVideo: true, hasAudio: true, hasProjector: true, hasWhiteboard: true, acOn: false, lightOn: false },
  { key: '3', roomName: 'Phòng họp 501', capacity: 20, equipment: ['Máy tính', 'Máy chiếu'], building: 'Tòa nhà 2', floor: '5F', roomNumber: '501', status: 'available', hasVideo: true, hasAudio: true, hasProjector: true, hasWhiteboard: false, acOn: false, lightOn: false },
  { key: '4', roomName: 'Phòng họp nhỏ B', capacity: 10, equipment: ['TV', 'Bảng trắng'], building: 'Tòa nhà 1', floor: '2F', roomNumber: '205', status: 'available', hasVideo: false, hasAudio: true, hasProjector: false, hasWhiteboard: true, acOn: false, lightOn: false },
  { key: '5', roomName: 'Phòng họp 601', capacity: 20, equipment: ['Máy tính', 'Bảng trắng'], building: 'Tòa nhà 2', floor: '6F', roomNumber: '601', status: 'in-meeting', currentMeeting: { title: 'Daily standup', organizer: 'Trần Thị B', start: '09:30', end: '10:00', attendees: 12 }, hasVideo: true, hasAudio: true, hasProjector: false, hasWhiteboard: true, acOn: true, lightOn: true },
  { key: '6', roomName: 'Phòng họp VIP', capacity: 15, equipment: ['Máy chiếu 4K', 'Hệ thống âm thanh', 'Camera HD'], building: 'Tòa nhà 1', floor: '7F', roomNumber: '701', status: 'maintenance', hasVideo: true, hasAudio: true, hasProjector: true, hasWhiteboard: true, acOn: false, lightOn: false },
]

const mockBookings: Booking[] = [
  { key: '1', roomName: 'Phòng họp lớn A', meetingTitle: 'Họp ban giám đốc Q1', organizer: 'Nguyễn Văn A', date: '2026-02-10', startTime: '09:00', endTime: '10:30', attendees: 25, status: 'confirmed', recurring: false },
  { key: '2', roomName: 'Phòng họp lớn A', meetingTitle: 'Review dự án X', organizer: 'Lê Văn C', date: '2026-02-10', startTime: '14:00', endTime: '15:30', attendees: 18, status: 'confirmed', recurring: false },
  { key: '3', roomName: 'Phòng họp 502', meetingTitle: 'Sprint Planning', organizer: 'Phạm Thị D', date: '2026-02-10', startTime: '13:00', endTime: '14:00', attendees: 15, status: 'confirmed', recurring: true },
  { key: '4', roomName: 'Phòng họp 601', meetingTitle: 'Daily standup', organizer: 'Trần Thị B', date: '2026-02-10', startTime: '09:30', endTime: '10:00', attendees: 12, status: 'confirmed', recurring: true },
  { key: '5', roomName: 'Phòng họp nhỏ B', meetingTitle: 'Phỏng vấn ứng viên', organizer: 'Hoàng Văn E', date: '2026-02-10', startTime: '15:00', endTime: '16:00', attendees: 4, status: 'pending', recurring: false },
  { key: '6', roomName: 'Phòng họp 501', meetingTitle: 'Training nội bộ', organizer: 'Nguyễn Thị F', date: '2026-02-11', startTime: '09:00', endTime: '11:00', attendees: 20, status: 'confirmed', recurring: false },
  { key: '7', roomName: 'Phòng họp lớn A', meetingTitle: 'Họp toàn công ty', organizer: 'CEO', date: '2026-02-12', startTime: '10:00', endTime: '12:00', attendees: 45, status: 'pending', recurring: false },
]

const todaySchedule = [
  { time: '09:00 – 10:30', room: 'Phòng họp lớn A', title: 'Họp ban giám đốc Q1', status: 'ongoing' },
  { time: '09:30 – 10:00', room: 'Phòng họp 601', title: 'Daily standup', status: 'ongoing' },
  { time: '13:00 – 14:00', room: 'Phòng họp 502', title: 'Sprint Planning', status: 'upcoming' },
  { time: '14:00 – 15:30', room: 'Phòng họp lớn A', title: 'Review dự án X', status: 'upcoming' },
  { time: '15:00 – 16:00', room: 'Phòng họp nhỏ B', title: 'Phỏng vấn ứng viên', status: 'upcoming' },
]

export default function SmartMeetingRoom() {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<MeetingRoom[]>(() => getMeetingRooms(mockRooms))
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [bookingForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms')
  const [controls, setControls] = useState({ acOn: false, lightOn: false, projectorOn: false, audioOn: false })
  const [bookings, setBookings] = useState<Booking[]>(() => getMeetingBookings(mockBookings))

  const totalRooms = rooms.length
  const availableRooms = rooms.filter(r => r.status === 'available').length
  const inMeetingRooms = rooms.filter(r => r.status === 'in-meeting').length
  const todayBookings = bookings.filter(b => b.date === '2026-02-10').length

  const statusConfig: Record<string, { color: string; label: string }> = {
    available: { color: 'green', label: t('meeting.available') },
    'in-meeting': { color: 'red', label: t('meeting.inMeeting') },
    booked: { color: 'blue', label: t('meeting.booked') },
    maintenance: { color: 'orange', label: t('meeting.maintenanceStatus') },
  }

  const bookingStatusConfig: Record<string, { color: string; label: string }> = {
    confirmed: { color: 'green', label: t('meeting.confirmed') },
    pending: { color: 'gold', label: t('meeting.pending') },
    cancelled: { color: 'red', label: t('meeting.cancelled') },
  }

  const openDrawer = (room: MeetingRoom) => {
    setSelectedRoom(room)
    setControls({ acOn: room.acOn, lightOn: room.lightOn, projectorOn: room.hasProjector && room.status === 'in-meeting', audioOn: room.hasAudio && room.status === 'in-meeting' })
    setDrawerVisible(true)
  }

  const updateSelectedRoom = (patch: Partial<MeetingRoom>) => {
    setSelectedRoom((prev) => (prev ? { ...prev, ...patch } : prev))
    setRooms((prev) => prev.map((room) => (room.key === selectedRoom?.key ? { ...room, ...patch } : room)))
  }

  const roomColumns: ColumnsType<MeetingRoom> = [
    {
      title: t('meeting.roomName'), dataIndex: 'roomName', key: 'roomName', width: 160,
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" className="text-11">{record.building} · {record.floor} · {record.roomNumber}</Text>
        </Space>
      ),
    },
    { title: t('meeting.capacity'), dataIndex: 'capacity', key: 'capacity', width: 80, align: 'center', render: (v: number) => <span><TeamOutlined className="mr-4" />{v}</span> },
    {
      title: t('meeting.status'), dataIndex: 'status', key: 'status', width: 110, align: 'center',
      filters: Object.entries(statusConfig).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>,
    },
    {
      title: t('meeting.currentMeeting'), key: 'current', width: 220,
      render: (_, record) => record.currentMeeting ? (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 12 }}>{record.currentMeeting.title}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.currentMeeting.start} – {record.currentMeeting.end} · {record.currentMeeting.attendees} {t('meeting.attendees')}</Text>
        </Space>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: t('meeting.nextMeeting'), key: 'next', width: 180,
      render: (_, record) => record.nextMeeting ? (
        <Space size={4}>
          <ClockCircleOutlined className="text-primary" />
          <Text className="text-sm">{record.nextMeeting.title} ({record.nextMeeting.start})</Text>
        </Space>
      ) : <Text type="secondary">—</Text>,
    },
    {
      title: t('meeting.features'), key: 'features', width: 130, align: 'center',
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Video"><VideoCameraOutlined style={{ color: record.hasVideo ? '#52c41a' : '#d9d9d9' }} /></Tooltip>
          <Tooltip title="Audio"><AudioOutlined style={{ color: record.hasAudio ? '#52c41a' : '#d9d9d9' }} /></Tooltip>
          <Tooltip title={t('meeting.projector')}><DesktopOutlined style={{ color: record.hasProjector ? '#52c41a' : '#d9d9d9' }} /></Tooltip>
          <Tooltip title={t('meeting.whiteboard')}><span className="text-md" style={{ color: record.hasWhiteboard ? '#52c41a' : '#d9d9d9' }}>▭</span></Tooltip>
        </Space>
      ),
    },
    {
      title: t('common.action'), key: 'action', width: 130, fixed: 'right', align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('meeting.viewControl')}><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDrawer(record)} /></Tooltip>
          <Tooltip title={t('meeting.bookRoom')}><Button type="link" size="small" icon={<CalendarOutlined />} onClick={() => { bookingForm.setFieldsValue({ roomName: record.roomName }); setBookingModalVisible(true) }} disabled={record.status === 'maintenance'} /></Tooltip>
        </Space>
      ),
    },
  ]

  const bookingColumns: ColumnsType<Booking> = [
    { title: t('meeting.date'), dataIndex: 'date', key: 'date', width: 110 },
    {
      title: t('meeting.time'), key: 'time', width: 120,
      render: (_, record) => <Text>{record.startTime} – {record.endTime}</Text>,
    },
    { title: t('meeting.roomName'), dataIndex: 'roomName', key: 'roomName', width: 150 },
    { title: t('meeting.meetingTitle'), dataIndex: 'meetingTitle', key: 'meetingTitle', width: 200 },
    { title: t('meeting.organizer'), dataIndex: 'organizer', key: 'organizer', width: 130 },
    { title: t('meeting.attendees'), dataIndex: 'attendees', key: 'attendees', width: 80, align: 'center' },
    {
      title: t('meeting.recurring'), dataIndex: 'recurring', key: 'recurring', width: 90, align: 'center',
      render: (v: boolean) => v ? <Tag color="purple">{t('meeting.yes')}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: t('meeting.bookingStatus'), dataIndex: 'status', key: 'status', width: 110, align: 'center',
      render: (status: string) => <Tag color={bookingStatusConfig[status]?.color}>{bookingStatusConfig[status]?.label}</Tag>,
    },
  ]

  useEffect(() => {
    saveMeetingBookings(bookings)
  }, [bookings])

  useEffect(() => {
    saveMeetingRooms(rooms)
  }, [rooms])

  return (
    <PageContainer>
      <PageHeader
        title={t('meeting.title')}
        icon={<CalendarOutlined />}
        subtitle={t('meeting.subtitle')}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { bookingForm.resetFields(); setBookingModalVisible(true) }}>
            {t('meeting.newBooking')}
          </Button>
        }
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-20">
        <Col xs={12} sm={6}>
          <ContentCard>
            <Statistic title={t('meeting.totalRooms')} value={totalRooms} prefix={<CalendarOutlined className="text-primary" />} />
          </ContentCard>
        </Col>
        <Col xs={12} sm={6}>
          <ContentCard>
            <Statistic title={t('meeting.available')} value={availableRooms} prefix={<CheckCircleOutlined className="text-success" />} valueStyle={{ color: '#52c41a' }} />
          </ContentCard>
        </Col>
        <Col xs={12} sm={6}>
          <ContentCard>
            <Statistic title={t('meeting.inMeeting')} value={inMeetingRooms} prefix={<VideoCameraOutlined className="text-danger" />} valueStyle={{ color: '#ff4d4f' }} />
          </ContentCard>
        </Col>
        <Col xs={12} sm={6}>
          <ContentCard>
            <Statistic title={t('meeting.todayBookings')} value={todayBookings} prefix={<ClockCircleOutlined className="text-purple" />} valueStyle={{ color: '#722ed1' }} />
          </ContentCard>
        </Col>
      </Row>

      {/* Today Schedule */}
      <ContentCard title={t('meeting.todaySchedule')} titleIcon={<ClockCircleOutlined />} className="mb-20">
        <Timeline
          items={todaySchedule.map(s => ({
            color: s.status === 'ongoing' ? 'red' : 'blue',
            dot: s.status === 'ongoing' ? <Badge status="processing" /> : undefined,
            children: (
              <div>
                <Text strong className="mr-8">{s.time}</Text>
                <Tag color={s.status === 'ongoing' ? 'red' : 'blue'}>{s.status === 'ongoing' ? t('meeting.ongoing') : t('meeting.upcoming')}</Tag>
                <br />
                <Text>{s.title}</Text>
                <Text type="secondary" className="ml-4">— {s.room}</Text>
              </div>
            ),
          }))}
        />
      </ContentCard>

      {/* Tab Switch */}
      <Space className="mb-16">
        <Button type={activeTab === 'rooms' ? 'primary' : 'default'} onClick={() => setActiveTab('rooms')}>{t('meeting.roomList')}</Button>
        <Button type={activeTab === 'bookings' ? 'primary' : 'default'} onClick={() => setActiveTab('bookings')}>{t('meeting.bookingList')}</Button>
      </Space>

      {/* Table */}
      <ContentCard>
        {activeTab === 'rooms' ? (
          <Table columns={roomColumns} dataSource={rooms} scroll={{ x: 1300 }} size="middle" pagination={false} />
        ) : (
          <Table columns={bookingColumns} dataSource={bookings} scroll={{ x: 1100 }} size="middle" pagination={{ showSizeChanger: true, showTotal: (total) => `${total} ${t('meeting.bookings')}` }} />
        )}
      </ContentCard>

      {/* Room Control Drawer */}
      <Drawer
        title={selectedRoom ? `${selectedRoom.roomName} — ${t('meeting.roomControl')}` : ''}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={460}
      >
        {selectedRoom && (
          <div className="workspace_drawer-col">
            {/* Room Info */}
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label={t('meeting.building')}>{selectedRoom.building}</Descriptions.Item>
              <Descriptions.Item label={t('meeting.floor')}>{selectedRoom.floor}</Descriptions.Item>
              <Descriptions.Item label={t('meeting.capacity')}><TeamOutlined className="mr-4" />{selectedRoom.capacity}</Descriptions.Item>
              <Descriptions.Item label={t('meeting.status')}>
                <Tag color={statusConfig[selectedRoom.status]?.color}>{statusConfig[selectedRoom.status]?.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('meeting.equipment')} span={2}>
                {selectedRoom.equipment.map((e, i) => <Tag key={i}>{e}</Tag>)}
              </Descriptions.Item>
            </Descriptions>

            {/* Current Meeting */}
            {selectedRoom.currentMeeting && (
              <Card size="small" title={<span><VideoCameraOutlined className="workspace_card-icon-mr text-danger" />{t('meeting.currentMeeting')}</span>} style={{ background: '#fff1f0', borderColor: '#ffa39e' }}>
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label={t('meeting.meetingTitle')}><Text strong>{selectedRoom.currentMeeting.title}</Text></Descriptions.Item>
                  <Descriptions.Item label={t('meeting.organizer')}>{selectedRoom.currentMeeting.organizer}</Descriptions.Item>
                  <Descriptions.Item label={t('meeting.time')}>{selectedRoom.currentMeeting.start} – {selectedRoom.currentMeeting.end}</Descriptions.Item>
                  <Descriptions.Item label={t('meeting.attendees')}>{selectedRoom.currentMeeting.attendees} {t('meeting.people')}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Device Controls */}
            <Card size="small" title={<span><SettingOutlined className="workspace_card-icon-mr text-success" />{t('meeting.deviceControl')}</span>}>
              <div className="workspace_control-col">
                <div className="workspace_control-row">
                  <Space><PoweroffOutlined style={{ color: controls.acOn ? '#52c41a' : '#d9d9d9' }} /><Text>{t('meeting.ac')}</Text></Space>
                  <Switch checked={controls.acOn} onChange={(v) => { setControls(p => ({ ...p, acOn: v })); updateSelectedRoom({ acOn: v }) }} />
                </div>
                <div className="workspace_control-row">
                  <Space><BulbOutlined style={{ color: controls.lightOn ? '#fadb14' : '#d9d9d9' }} /><Text>{t('meeting.light')}</Text></Space>
                  <Switch checked={controls.lightOn} onChange={(v) => { setControls(p => ({ ...p, lightOn: v })); updateSelectedRoom({ lightOn: v }) }} />
                </div>
                {selectedRoom.hasProjector && (
<div className="workspace_control-row">
                  <Space><DesktopOutlined style={{ color: controls.projectorOn ? '#1890ff' : '#d9d9d9' }} /><Text>{t('meeting.projector')}</Text></Space>
                    <Switch checked={controls.projectorOn} onChange={(v) => setControls(p => ({ ...p, projectorOn: v }))} />
                  </div>
                )}
                {selectedRoom.hasAudio && (
<div className="workspace_control-row">
                  <Space><SoundOutlined style={{ color: controls.audioOn ? '#722ed1' : '#d9d9d9' }} /><Text>{t('meeting.audioSystem')}</Text></Space>
                    <Switch checked={controls.audioOn} onChange={(v) => setControls(p => ({ ...p, audioOn: v }))} />
                  </div>
                )}
                <div className="workspace_control-row">
                  <Space><WifiOutlined className="text-success" /><Text>Wi-Fi</Text></Space>
                  <Tag color="green">{t('meeting.connected')}</Tag>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Booking Modal */}
      <Modal
        title={t('meeting.newBooking')}
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={bookingForm}
          layout="vertical"
          onFinish={(values) => {
            const nextBooking: Booking = {
              key: `booking-${Date.now()}`,
              roomName: values.roomName,
              meetingTitle: values.meetingTitle,
              organizer: values.organizer,
              date: values.date?.format?.('YYYY-MM-DD') ?? '',
              startTime: values.startTime?.format?.('HH:mm') ?? '',
              endTime: values.endTime?.format?.('HH:mm') ?? '',
              attendees: Number(values.attendees || 0),
              status: 'pending',
              recurring: false,
            }
            setBookings((prev) => [nextBooking, ...prev])
            setRooms((prev) =>
              prev.map((room) =>
                room.roomName === values.roomName
                  ? {
                      ...room,
                      status: room.status === 'maintenance' ? room.status : 'booked',
                      nextMeeting: { title: values.meetingTitle, start: values.startTime?.format?.('HH:mm') ?? '' },
                    }
                  : room,
              ),
            )
            setBookingModalVisible(false)
            bookingForm.resetFields()
          }}
        >
          <Form.Item name="roomName" label={t('meeting.roomName')} rules={[{ required: true }]}>
            <Select placeholder={t('meeting.selectRoom')}>
              {rooms.filter(r => r.status !== 'maintenance').map(r => (
                <Select.Option key={r.key} value={r.roomName}>{r.roomName} ({r.capacity} {t('meeting.people')})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="meetingTitle" label={t('meeting.meetingTitle')} rules={[{ required: true }]}>
            <Input placeholder={t('meeting.enterMeetingTitle')} />
          </Form.Item>
          <Form.Item name="organizer" label={t('meeting.organizer')} rules={[{ required: true }]}>
            <Input placeholder={t('meeting.enterOrganizer')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label={t('meeting.date')} rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="startTime" label={t('meeting.startTime')} rules={[{ required: true }]}>
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="endTime" label={t('meeting.endTime')} rules={[{ required: true }]}>
                <TimePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="attendees" label={t('meeting.attendees')}>
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setBookingModalVisible(false)}>{t('common.cancel')}</Button>
              <Button type="primary" htmlType="submit">{t('meeting.bookRoom')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
