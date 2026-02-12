import { useState } from 'react'
import {
  Card, Row, Col, Typography, Space, Button, Select, DatePicker, Tag, Tooltip,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, PlusOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface TimeSlot {
  room: string
  slots: { time: string; status: 'free' | 'busy'; title?: string }[]
}

const rooms = ['A-1201', 'A-1203', 'B-0902', 'C-0701', 'B-0501']
const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

const bookings: Record<string, { start: string; end: string; title: string }[]> = {
  'A-1201': [
    { start: '09:00', end: '10:30', title: 'Weekly Sync' },
    { start: '14:00', end: '15:30', title: 'Design Review' },
  ],
  'A-1203': [
    { start: '10:00', end: '11:00', title: 'Sprint Planning' },
    { start: '15:00', end: '16:00', title: 'Training' },
  ],
  'B-0902': [
    { start: '08:30', end: '10:00', title: 'Standup + Retro' },
    { start: '13:00', end: '14:30', title: 'Client Call' },
  ],
  'C-0701': [
    { start: '10:00', end: '11:30', title: 'Board Meeting' },
  ],
  'B-0501': [
    { start: '09:00', end: '10:00', title: 'Interview' },
    { start: '14:00', end: '15:00', title: '1-on-1' },
    { start: '16:00', end: '17:00', title: 'Sync' },
  ],
}

function isSlotBusy(room: string, time: string): { busy: boolean; title?: string; isStart?: boolean } {
  const rb = bookings[room] || []
  for (const b of rb) {
    const startMin = timeToMin(b.start)
    const endMin = timeToMin(b.end)
    const slotMin = timeToMin(time)
    if (slotMin >= startMin && slotMin < endMin) {
      return { busy: true, title: b.title, isStart: slotMin === startMin }
    }
  }
  return { busy: false }
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function WorkspaceBookingCalendar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState('day')
  const [filterRoom, setFilterRoom] = useState<string | undefined>()

  const displayRooms = filterRoom ? rooms.filter(r => r === filterRoom) : rooms

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space size={12} align="center">
            <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>{t('wsBooking.title')}</Title>
          </Space>
          <Space wrap>
            <Space size={4}>
              <Button icon={<LeftOutlined />} size="small" onClick={() => setSelectedDate(d => d.subtract(1, 'day'))} />
              <DatePicker value={selectedDate} onChange={(d) => d && setSelectedDate(d)} format="DD/MM/YYYY" />
              <Button icon={<RightOutlined />} size="small" onClick={() => setSelectedDate(d => d.add(1, 'day'))} />
            </Space>
            <Select value={viewMode} onChange={setViewMode} style={{ width: 90 }}>
              <Select.Option value="day">{t('wsBooking.viewDay')}</Select.Option>
              <Select.Option value="week">{t('wsBooking.viewWeek')}</Select.Option>
            </Select>
            <Select placeholder={t('wsBooking.allRooms')} style={{ width: 120 }} allowClear value={filterRoom} onChange={setFilterRoom}>
              {rooms.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/smart-workspace/create-booking')}>
              {t('wsBooking.newBooking')}
            </Button>
          </Space>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          {/* Room Headers */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 0 }}>
            <div style={{ width: 70, flexShrink: 0, fontWeight: 600, color: '#8c8c8c', fontSize: 12 }}>
              {t('wsBooking.time')}
            </div>
            {displayRooms.map(room => (
              <div key={room} style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>
                {room}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {times.map((time, idx) => {
            const isHour = time.endsWith(':00')
            return (
              <div key={time} style={{
                display: 'flex', alignItems: 'stretch',
                borderBottom: isHour ? '1px solid #f0f0f0' : '1px solid #fafafa',
                minHeight: 36,
              }}>
                {/* Time label */}
                <div style={{
                  width: 70, flexShrink: 0, fontSize: 11, color: '#8c8c8c',
                  display: 'flex', alignItems: 'center', paddingRight: 8,
                  fontWeight: isHour ? 600 : 400,
                }}>
                  {isHour ? time : ''}
                </div>

                {/* Room cells */}
                {displayRooms.map(room => {
                  const { busy, title, isStart } = isSlotBusy(room, time)
                  return (
                    <div key={room} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '2px 4px', position: 'relative',
                    }}>
                      {busy ? (
                        <Tooltip title={`${title} — ${room}`}>
                          <div style={{
                            width: '100%', height: '100%',
                            background: room === 'B-0902' ? '#fff1f0' : '#e6f7ff',
                            borderLeft: `3px solid ${room === 'B-0902' ? '#ff4d4f' : '#1890ff'}`,
                            borderRadius: isStart ? '6px 6px 0 0' : 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', minHeight: 32,
                          }}>
                            {isStart && (
                              <Text style={{ fontSize: 11, fontWeight: 600, color: room === 'B-0902' ? '#ff4d4f' : '#1890ff' }} ellipsis>
                                {title}
                              </Text>
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <Tooltip title={`${room} — ${time} ${t('wsBooking.free')}`}>
                          <div style={{
                            width: '100%', height: '100%', minHeight: 32,
                            background: '#fafffe', borderRadius: 4, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f6ffed' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafffe' }}
                          >
                            <Text style={{ fontSize: 10, color: '#bfbfbf' }}>—</Text>
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Space size={4}><div style={{ width: 14, height: 14, background: '#e6f7ff', border: '2px solid #1890ff', borderRadius: 3 }} /><Text type="secondary" style={{ fontSize: 12 }}>{t('wsBooking.busy')}</Text></Space>
          <Space size={4}><div style={{ width: 14, height: 14, background: '#fff1f0', border: '2px solid #ff4d4f', borderRadius: 3 }} /><Text type="secondary" style={{ fontSize: 12 }}>{t('wsBooking.issue')}</Text></Space>
          <Space size={4}><div style={{ width: 14, height: 14, background: '#fafffe', border: '1px solid #d9d9d9', borderRadius: 3 }} /><Text type="secondary" style={{ fontSize: 12 }}>{t('wsBooking.free')}</Text></Space>
        </div>
      </Card>
    </div>
  )
}
