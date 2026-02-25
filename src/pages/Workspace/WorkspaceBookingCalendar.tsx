import { useState } from 'react'
import {
  Typography, Space, Button, Select, DatePicker, Tooltip,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, PlusOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Text } = Typography

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
    <PageContainer>
      <PageHeader
        title={t('wsBooking.title')}
        icon={<CalendarOutlined className="text-primary" />}
        actions={
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
            <Select placeholder={t('wsBooking.allRooms')} className="w-120" allowClear value={filterRoom} onChange={setFilterRoom}>
              {rooms.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/smart-workspace/create-booking')}>
              {t('wsBooking.newBooking')}
            </Button>
          </Space>
        }
      />

      {/* Calendar Grid */}
      <ContentCard className="workspace_calendar-overflow">
        <div className="workspace_calendar-min-w">
          {/* Room Headers */}
          <div className="workspace_calendar-header">
            <div className="workspace_calendar-time-col">
              {t('wsBooking.time')}
            </div>
            {displayRooms.map(room => (
              <div key={room} className="workspace_calendar-room-col">
                {room}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {times.map((time, idx) => {
            const isHour = time.endsWith(':00')
            return (
              <div key={time} className={`workspace_calendar-row ${isHour ? 'workspace_calendar-row-hour' : 'workspace_calendar-row-half'}`}>
                {/* Time label */}
                <div className={`workspace_calendar-time-cell ${isHour ? 'workspace_calendar-time-cell-hour' : ''}`}>
                  {isHour ? time : ''}
                </div>

                {/* Room cells */}
                {displayRooms.map(room => {
                  const { busy, title, isStart } = isSlotBusy(room, time)
                  return (
                    <div key={room} className="workspace_calendar-cell">
                      {busy ? (
                        <Tooltip title={`${title} — ${room}`}>
                          <div className={`workspace_calendar-slot-busy ${!isStart ? 'workspace_calendar-slot-busy-mid' : ''} ${room === 'B-0902' ? 'workspace_calendar-legend-dot-issue' : 'workspace_calendar-legend-dot-busy'}`} style={{ background: room === 'B-0902' ? '#fff1f0' : '#e6f7ff', borderLeft: `3px solid ${room === 'B-0902' ? '#ff4d4f' : '#1890ff'}` }}>
                            {isStart && (
                              <Text className="text-11 font-semibold" style={{ color: room === 'B-0902' ? '#ff4d4f' : '#1890ff' }} ellipsis>
                                {title}
                              </Text>
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <Tooltip title={`${room} — ${time} ${t('wsBooking.free')}`}>
                          <div className="workspace_calendar-slot-free"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f6ffed' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fafffe' }}
                          >
                            <Text className="text-xs text-muted">—</Text>
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
        <div className="workspace_calendar-legend">
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-busy" /><Text type="secondary" className="text-sm">{t('wsBooking.busy')}</Text></Space>
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-issue" /><Text type="secondary" className="text-sm">{t('wsBooking.issue')}</Text></Space>
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-free" /><Text type="secondary" className="text-sm">{t('wsBooking.free')}</Text></Space>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
