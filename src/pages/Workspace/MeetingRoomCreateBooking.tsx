import { useState } from 'react'
import {
  Row, Col, Typography, Space, Button, Input, TimePicker, InputNumber,
  Checkbox, Tag, Divider, message, Alert,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, ArrowLeftOutlined, VideoCameraOutlined, DesktopOutlined,
  CheckCircleOutlined, SendOutlined,
  EyeOutlined, InfoCircleOutlined, AudioOutlined, EditOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { getMeetingBookings, saveMeetingBookings, getMeetingRooms, saveMeetingRooms } from '@/services/mockPersistence'

const { Text } = Typography

interface SuggestedRoom {
  room: string
  building: string
  floor: string
  capacity: number
  match: number
  equipment: string[]
  available: boolean
}

const mockSuggestions: SuggestedRoom[] = [
  { room: 'Phòng họp VIP', building: 'Tòa A', floor: '10F', capacity: 20, match: 96, equipment: ['Video Conference', 'Projector', 'Whiteboard', 'Audio'], available: true },
  { room: 'Phòng họp lớn A', building: 'Tòa A', floor: '8F', capacity: 30, match: 89, equipment: ['Video Conference', 'Projector', 'Audio'], available: true },
  { room: 'Phòng họp 502', building: 'Tòa B', floor: '5F', capacity: 15, match: 74, equipment: ['Projector', 'Whiteboard'], available: true },
  { room: 'Phòng họp 501', building: 'Tòa B', floor: '5F', capacity: 12, match: 62, equipment: ['Projector'], available: false },
  { room: 'Phòng họp nhỏ B', building: 'Tòa C', floor: '3F', capacity: 8, match: 45, equipment: ['Whiteboard'], available: false },
]

export default function MeetingRoomCreateBooking() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [title, setTitle] = useState('Họp ban giám đốc')
  const [startTime, setStartTime] = useState(dayjs('09:30', 'HH:mm'))
  const [endTime, setEndTime] = useState(dayjs('10:30', 'HH:mm'))
  const [attendees, setAttendees] = useState(12)
  const [requirements, setRequirements] = useState<string[]>(['vc', 'projector'])
  const [selectedRoom, setSelectedRoom] = useState<string | null>('Phòng họp VIP')

  const requirementOptions = [
    { label: t('meeting.videoConference'), value: 'vc', icon: <VideoCameraOutlined /> },
    { label: t('meeting.projector'), value: 'projector', icon: <DesktopOutlined /> },
    { label: t('meeting.whiteboard'), value: 'whiteboard', icon: <EditOutlined /> },
    { label: t('meeting.audioSystem'), value: 'audio', icon: <AudioOutlined /> },
  ]

  const getMatchColor = (match: number) => match >= 90 ? '#52c41a' : match >= 70 ? '#faad14' : '#ff4d4f'

  const handleCreate = () => {
    if (!title || !selectedRoom) {
      message.warning(t('meeting.fillRequired'))
      return
    }
    const prevBookings = getMeetingBookings<any>([])
    const nextBooking = {
      key: `booking-${Date.now()}`,
      roomName: selectedRoom,
      meetingTitle: title,
      organizer: 'N/A',
      date: dayjs().format('YYYY-MM-DD'),
      startTime: startTime.format('HH:mm'),
      endTime: endTime.format('HH:mm'),
      attendees,
      status: 'pending',
      recurring: false,
    }
    saveMeetingBookings([nextBooking, ...prevBookings])
    const rooms = getMeetingRooms<any>([])
    if (rooms.length > 0) {
      saveMeetingRooms(
        rooms.map((room: any) =>
          room.roomName === selectedRoom
            ? {
                ...room,
                status: room.status === 'maintenance' ? room.status : 'booked',
                nextMeeting: { title, start: startTime.format('HH:mm') },
              }
            : room,
        ),
      )
    }
    message.success(t('meeting.bookingCreated'))
    navigate('/smart-meeting-room/booking-calendar')
  }

  return (
    <PageContainer>
      <PageHeader
        title={<><Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />{t('meeting.createBookingTitle')}</>}
        icon={<CalendarOutlined />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ContentCard>
            <div className="workspace_create-form-col">
              <div>
                <Text strong className="workspace_create-label-block">{t('meeting.meetingTitle')}</Text>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('meeting.enterTitle')} size="large" />
              </div>

              <div>
                <Text strong className="workspace_create-label-block">{t('meeting.time')}</Text>
                <Space>
                  <TimePicker value={startTime} onChange={(v) => v && setStartTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary">{t('meeting.to')}</Text>
                  <TimePicker value={endTime} onChange={(v) => v && setEndTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary" className="workspace_create-ml-12">{t('meeting.attendees')}:</Text>
                  <InputNumber value={attendees} onChange={(v) => setAttendees(v || 1)} min={1} max={100} style={{ width: 70 }} />
                </Space>
              </div>

              <div>
                <Text strong className="workspace_create-label-block">{t('meeting.requirements')}</Text>
                <Checkbox.Group value={requirements} onChange={(v) => setRequirements(v as string[])}>
                  <Space wrap>
                    {requirementOptions.map(opt => (
                      <Checkbox key={opt.value} value={opt.value}>
                        <Space size={4}>
                          {opt.icon}
                          <span>{opt.label}</span>
                        </Space>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </div>

              <div>
                <Text strong className="workspace_create-label-block-8">{t('meeting.suggestedRooms')}</Text>
                <div className="workspace_create-rooms-col">
                  {mockSuggestions.map(room => (
                    <div key={room.room}
                      onClick={() => room.available && setSelectedRoom(room.room)}
                      className={`workspace_create-room-card ${selectedRoom === room.room ? 'workspace_create-room-card-selected' : room.available ? 'workspace_create-room-card-available' : 'workspace_create-room-card-unavailable'}`}
                    >
                      <div className="workspace_create-summary-row items-center">
                        <Space>
                          {selectedRoom === room.room && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
                          <div>
                            <Text strong className="text-md">{room.room}</Text>
                            <Text type="secondary" className="text-sm" style={{ marginLeft: 8 }}>{room.building} · {room.floor} · {room.capacity} {t('meeting.people')}</Text>
                          </div>
                        </Space>
                        <Space>
                          <Tag color={getMatchColor(room.match)} className="workspace_tag-rounded-10 font-semibold">
                            {t('meeting.match')} {room.match}%
                          </Tag>
                          {!room.available && <Tag color="red">{t('meeting.unavailable')}</Tag>}
                        </Space>
                      </div>
                      <div className="mt-6">
                        {room.equipment.map((e, i) => <Tag key={i} className="text-11">{e}</Tag>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert
                message={t('meeting.policy')}
                description={t('meeting.policyDesc')}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="workspace_create-alert-radius"
              />

              <div className="workspace_create-actions">
                <Button icon={<EyeOutlined />} size="large" disabled={!selectedRoom}>
                  {t('meeting.previewRoom')}
                </Button>
                <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleCreate} disabled={!selectedRoom || !title}>
                  {t('meeting.createAndSend')}
                </Button>
              </div>
            </div>
          </ContentCard>
        </Col>

        <Col xs={24} lg={10}>
          <ContentCard title={t('meeting.summary')} titleIcon={<CalendarOutlined />} className="workspace_create-summary-sticky">
            <div className="flex flex-col gap-12">
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('meeting.meetingTitle')}</Text>
                <Text strong>{title || '—'}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('meeting.time')}</Text>
                <Text strong>{startTime.format('HH:mm')} – {endTime.format('HH:mm')}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('meeting.attendees')}</Text>
                <Text strong>{attendees}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('meeting.requirements')}</Text>
                <div>{requirements.map(r => <Tag key={r} className="workspace_create-tag-mb mb-2">{r.toUpperCase()}</Tag>)}</div>
              </div>
              <Divider className="workspace_create-divider-my" />
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('meeting.selectedRoom')}</Text>
                <Text strong className="text-lg text-primary">{selectedRoom || '—'}</Text>
              </div>
              {selectedRoom && (
                <div>
                  {(() => {
                    const r = mockSuggestions.find(s => s.room === selectedRoom)
                    if (!r) return null
                    return (
                      <div className="workspace_create-selected-box">
                        <Text type="secondary" className="text-sm">{r.building} · {r.floor} · {r.capacity} {t('meeting.people')}</Text>
                        <br />
                        <Space className="mt-4">
                          <Tag color="green">{t('meeting.match')} {r.match}%</Tag>
                          {r.equipment.map((e, i) => <Tag key={i} className="text-11">{e}</Tag>)}
                        </Space>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
