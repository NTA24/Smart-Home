import { useState } from 'react'
import {
  Card, Row, Col, Typography, Space, Button, Input, TimePicker, InputNumber,
  Checkbox, Tag, Progress, Divider, message, Alert,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, ArrowLeftOutlined, VideoCameraOutlined, DesktopOutlined,
  CheckCircleOutlined, EnvironmentOutlined, TeamOutlined, SendOutlined,
  EyeOutlined, ClockCircleOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography

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
    message.success(t('wsCreate.bookingCreated'))
    navigate('/smart-workspace/booking-calendar')
  }

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Space size={12} align="center">
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />
          <Title level={4} style={{ margin: 0 }}><CalendarOutlined style={{ marginRight: 8 }} />{t('wsCreate.title')}</Title>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Form */}
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>{t('wsCreate.meetingTitle')}</Text>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('wsCreate.enterTitle')} size="large" />
              </div>

              {/* Time */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>{t('wsCreate.time')}</Text>
                <Space>
                  <TimePicker value={startTime} onChange={(v) => v && setStartTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary">{t('wsCreate.to')}</Text>
                  <TimePicker value={endTime} onChange={(v) => v && setEndTime(v)} format="HH:mm" minuteStep={15} />
                  <Text type="secondary" style={{ marginLeft: 12 }}>{t('wsCreate.attendees')}:</Text>
                  <InputNumber value={attendees} onChange={(v) => setAttendees(v || 1)} min={1} max={100} style={{ width: 70 }} />
                </Space>
              </div>

              {/* Requirements */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>{t('wsCreate.requirements')}</Text>
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
                <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('wsCreate.suggestedRooms')}</Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mockSuggestions.map(room => (
                    <div key={room.room}
                      onClick={() => room.available && setSelectedRoom(room.room)}
                      style={{
                        padding: '12px 16px', borderRadius: 10, cursor: room.available ? 'pointer' : 'not-allowed',
                        border: selectedRoom === room.room ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        background: selectedRoom === room.room ? '#e6f7ff' : room.available ? '#fff' : '#fafafa',
                        opacity: room.available ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          {selectedRoom === room.room && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
                          <div>
                            <Text strong style={{ fontSize: 14 }}>{room.room}</Text>
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{room.building} · {room.floor} · {room.capacity} {t('wsCreate.people')}</Text>
                          </div>
                        </Space>
                        <Space>
                          <Tag color={getMatchColor(room.match)} style={{ borderRadius: 10, fontWeight: 600 }}>
                            {t('wsCreate.match')} {room.match}%
                          </Tag>
                          {!room.available && <Tag color="red">{t('wsCreate.unavailable')}</Tag>}
                        </Space>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        {room.equipment.map((e, i) => <Tag key={i} style={{ fontSize: 11 }}>{e}</Tag>)}
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
                style={{ borderRadius: 8 }}
              />

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button icon={<EyeOutlined />} size="large" disabled={!selectedRoom}>
                  {t('wsCreate.previewRoom')}
                </Button>
                <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleCreate} disabled={!selectedRoom || !title}>
                  {t('wsCreate.createAndSend')}
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Summary */}
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}
            title={<span><CalendarOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsCreate.summary')}</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('wsCreate.meetingTitle')}</Text>
                <Text strong>{title || '—'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('wsCreate.time')}</Text>
                <Text strong>{startTime.format('HH:mm')} – {endTime.format('HH:mm')}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('wsCreate.attendees')}</Text>
                <Text strong>{attendees}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('wsCreate.requirements')}</Text>
                <div>{requirements.map(r => <Tag key={r} style={{ marginBottom: 2 }}>{r.toUpperCase()}</Tag>)}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">{t('wsCreate.selectedRoom')}</Text>
                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>{selectedRoom || '—'}</Text>
              </div>
              {selectedRoom && (
                <div>
                  {(() => {
                    const r = mockSuggestions.find(s => s.room === selectedRoom)
                    if (!r) return null
                    return (
                      <div style={{ background: '#f6ffed', padding: '8px 12px', borderRadius: 8, marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{r.building} · {r.floor} · {r.capacity} {t('wsCreate.people')}</Text>
                        <br />
                        <Space style={{ marginTop: 4 }}>
                          <Tag color="green">{t('wsCreate.match')} {r.match}%</Tag>
                          {r.equipment.map((e, i) => <Tag key={i} style={{ fontSize: 11 }}>{e}</Tag>)}
                        </Space>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
