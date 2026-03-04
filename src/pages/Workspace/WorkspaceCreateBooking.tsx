import { useState } from 'react'
import {
  Row, Col, Typography, Space, Button, Input, TimePicker, InputNumber,
  Checkbox, Tag, Divider, message, Alert,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, ArrowLeftOutlined, VideoCameraOutlined, DesktopOutlined,
  CheckCircleOutlined, SendOutlined,
  EyeOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { getWorkspaceBookings, saveWorkspaceBookings } from '@/services/mockPersistence'

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
  { room: 'A-1201', building: 'Tòa A', floor: '12F', capacity: 10, match: 95, equipment: ['TV', 'VC', 'Whiteboard'], available: true },
  { room: 'A-1203', building: 'Tòa A', floor: '12F', capacity: 10, match: 88, equipment: ['TV', 'VC'], available: true },
  { room: 'B-0501', building: 'Tòa B', floor: '5F', capacity: 15, match: 72, equipment: ['TV', 'VC', 'Whiteboard', 'Micro'], available: true },
  { room: 'C-0701', building: 'Tòa C', floor: '7F', capacity: 12, match: 65, equipment: ['TV', 'Whiteboard'], available: false },
]

export default function WorkspaceCreateBooking() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [title, setTitle] = useState('Weekly Sync')
  const [startTime, setStartTime] = useState(dayjs('09:30', 'HH:mm'))
  const [endTime, setEndTime] = useState(dayjs('10:30', 'HH:mm'))
  const [attendees, setAttendees] = useState(8)
  const [requirements, setRequirements] = useState<string[]>(['vc', 'tv'])
  const [selectedRoom, setSelectedRoom] = useState<string | null>('A-1201')

  const requirementOptions = [
    { label: 'VC', value: 'vc', icon: <VideoCameraOutlined /> },
    { label: 'TV', value: 'tv', icon: <DesktopOutlined /> },
    { label: 'Whiteboard', value: 'whiteboard' },
    { label: t('wsCreate.nearPantry'), value: 'pantry' },
  ]

  const getMatchColor = (match: number) => match >= 90 ? '#52c41a' : match >= 70 ? '#faad14' : '#ff4d4f'

  const handleCreate = () => {
    if (!title || !selectedRoom) {
      message.warning(t('wsCreate.fillRequired'))
      return
    }
    const prevBookings = getWorkspaceBookings<any>([])
    const nextBooking = {
      key: `ws-booking-${Date.now()}`,
      roomName: selectedRoom,
      meetingTitle: title,
      organizer: 'N/A',
      date: dayjs().format('YYYY-MM-DD'),
      startTime: startTime.format('HH:mm'),
      endTime: endTime.format('HH:mm'),
      attendees,
      requirements,
      status: 'pending',
      recurring: false,
    }
    saveWorkspaceBookings([nextBooking, ...prevBookings])
    message.success(t('wsCreate.bookingCreated'))
    navigate('/smart-workspace/booking-calendar')
  }

  return (
    <PageContainer>
      <PageHeader
        title={<><Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />{t('wsCreate.title')}</>}
        icon={<CalendarOutlined />}
      />

      <Row gutter={[16, 16]}>
        {/* Form */}
        <Col xs={24} lg={14}>
          <ContentCard>
            <div className="workspace_create-form-col">
              {/* Title */}
              <div>
                <Text strong className="workspace_create-label-block">{t('wsCreate.meetingTitle')}</Text>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('wsCreate.enterTitle')} size="large" />
              </div>

              {/* Time */}
              <div>
                <Text strong className="workspace_create-label-block">{t('wsCreate.time')}</Text>
                <Space>
                  <TimePicker value={startTime} onChange={(v) => v && setStartTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary">{t('wsCreate.to')}</Text>
                  <TimePicker value={endTime} onChange={(v) => v && setEndTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary" className="workspace_create-ml-12">{t('wsCreate.attendees')}:</Text>
                  <InputNumber value={attendees} onChange={(v) => setAttendees(v || 1)} min={1} max={100} style={{ width: 70 }} />
                </Space>
              </div>

              {/* Requirements */}
              <div>
                <Text strong className="workspace_create-label-block">{t('wsCreate.requirements')}</Text>
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

              {/* Suggested Rooms */}
              <div>
                <Text strong className="workspace_create-label-block-8">{t('wsCreate.suggestedRooms')}</Text>
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
                            <Text type="secondary" className="text-sm" style={{ marginLeft: 8 }}>{room.building} · {room.floor} · {room.capacity} {t('wsCreate.people')}</Text>
                          </div>
                        </Space>
                        <Space>
                          <Tag color={getMatchColor(room.match)} className="workspace_tag-rounded-10 font-semibold">
                            {t('wsCreate.match')} {room.match}%
                          </Tag>
                          {!room.available && <Tag color="red">{t('wsCreate.unavailable')}</Tag>}
                        </Space>
                      </div>
                      <div className="mt-6">
                        {room.equipment.map((e, i) => <Tag key={i} className="text-11">{e}</Tag>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy */}
              <Alert
                message={t('wsCreate.policy')}
                description={t('wsCreate.policyDesc')}
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="workspace_create-alert-radius"
              />

              {/* Actions */}
              <div className="workspace_create-actions">
                <Button icon={<EyeOutlined />} size="large" disabled={!selectedRoom}>
                  {t('wsCreate.previewRoom')}
                </Button>
                <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleCreate} disabled={!selectedRoom || !title}>
                  {t('wsCreate.createAndSend')}
                </Button>
              </div>
            </div>
          </ContentCard>
        </Col>

        {/* Summary */}
        <Col xs={24} lg={10}>
          <ContentCard title={t('wsCreate.summary')} titleIcon={<CalendarOutlined />} className="workspace_create-summary-sticky">
            <div className="flex flex-col gap-12">
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('wsCreate.meetingTitle')}</Text>
                <Text strong>{title || '—'}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('wsCreate.time')}</Text>
                <Text strong>{startTime.format('HH:mm')} – {endTime.format('HH:mm')}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('wsCreate.attendees')}</Text>
                <Text strong>{attendees}</Text>
              </div>
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('wsCreate.requirements')}</Text>
                <div>{requirements.map(r => <Tag key={r} className="workspace_create-tag-mb mb-2">{r.toUpperCase()}</Tag>)}</div>
              </div>
              <Divider className="workspace_create-divider-my" />
              <div className="workspace_create-summary-row">
                <Text type="secondary">{t('wsCreate.selectedRoom')}</Text>
                <Text strong className="text-lg text-primary">{selectedRoom || '—'}</Text>
              </div>
              {selectedRoom && (
                <div>
                  {(() => {
                    const r = mockSuggestions.find(s => s.room === selectedRoom)
                    if (!r) return null
                    return (
                      <div className="workspace_create-selected-box">
                        <Text type="secondary" className="text-sm">{r.building} · {r.floor} · {r.capacity} {t('wsCreate.people')}</Text>
                        <br />
                        <Space className="mt-4">
                          <Tag color="green">{t('wsCreate.match')} {r.match}%</Tag>
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
