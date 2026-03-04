import { useMemo, useState } from 'react'
import {
  Typography, Space, Button, Select, DatePicker, Tooltip,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined, PlusOutlined, LeftOutlined, RightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { getMeetingBookings, getMeetingRooms } from '@/services/mockPersistence'

const { Text } = Typography

const defaultRooms = ['Phòng họp lớn A', 'Phòng họp 502', 'Phòng họp 501', 'Phòng họp nhỏ B', 'Phòng họp VIP']
const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

const defaultBookings: Record<string, { start: string; end: string; title: string }[]> = {
  'Phòng họp lớn A': [
    { start: '09:00', end: '10:30', title: 'Họp ban giám đốc' },
    { start: '14:00', end: '15:30', title: 'Review dự án Q2' },
  ],
  'Phòng họp 502': [
    { start: '10:00', end: '11:00', title: 'Sprint Planning' },
    { start: '15:00', end: '16:00', title: 'Training nội bộ' },
  ],
  'Phòng họp 501': [
    { start: '08:30', end: '10:00', title: 'Standup + Retro' },
    { start: '13:00', end: '14:30', title: 'Gọi khách hàng' },
  ],
  'Phòng họp nhỏ B': [
    { start: '10:00', end: '11:30', title: 'Phỏng vấn ứng viên' },
  ],
  'Phòng họp VIP': [
    { start: '09:00', end: '10:00', title: 'Họp đối tác' },
    { start: '14:00', end: '15:00', title: '1-on-1 Manager' },
    { start: '16:00', end: '17:00', title: 'Tổng kết tuần' },
  ],
}

function isSlotBusy(room: string, time: string, bookingsMap: Record<string, { start: string; end: string; title: string }[]>): { busy: boolean; title?: string; isStart?: boolean } {
  const rb = bookingsMap[room] || []
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

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)
}

function toRoomName(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null
  const room = value as { roomName?: unknown; name?: unknown }
  if (typeof room.roomName === 'string') return room.roomName
  if (typeof room.name === 'string') return room.name
  return null
}

export default function MeetingRoomBookingCalendar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState('day')
  const [filterRoom, setFilterRoom] = useState<string | undefined>()
  const rooms = useMemo(() => {
    const rawRooms = getMeetingRooms<string>(defaultRooms)
    return Array.isArray(rawRooms) && rawRooms.length > 0 ? rawRooms : defaultRooms
  }, [])

  const persistedBookings = useMemo(
    () => getMeetingBookings<any>(
      Object.entries(defaultBookings).flatMap(([roomName, items], idx) =>
        items.map((item, i) => ({
          key: `seed-${idx}-${i}`,
          roomName,
          meetingTitle: item.title,
          startTime: item.start,
          endTime: item.end,
        })),
      ),
    ),
    [],
  )

  const bookingsMap = useMemo(
    () => persistedBookings.reduce((acc: Record<string, { start: string; end: string; title: string }[]>, item: any) => {
      const roomName = toRoomName(item?.roomName)
      const start = item?.startTime || item?.start
      const end = item?.endTime || item?.end
      if (!roomName || !isValidTime(start) || !isValidTime(end)) return acc
      if (!acc[roomName]) acc[roomName] = []
      acc[roomName].push({
        start,
        end,
        title: typeof item?.meetingTitle === 'string' ? item.meetingTitle : (typeof item?.title === 'string' ? item.title : 'Booking'),
      })
      return acc
    }, {}),
    [persistedBookings],
  )

  const displayRooms = filterRoom ? rooms.filter(r => r === filterRoom) : rooms

  return (
    <PageContainer>
      <PageHeader
        title={t('meeting.bookingCalendarTitle')}
        icon={<CalendarOutlined className="text-primary" />}
        actions={
          <Space wrap>
            <Space size={4}>
              <Button icon={<LeftOutlined />} size="small" onClick={() => setSelectedDate(d => d.subtract(1, 'day'))} />
              <DatePicker value={selectedDate} onChange={(d) => d && setSelectedDate(d)} format="DD/MM/YYYY" />
              <Button icon={<RightOutlined />} size="small" onClick={() => setSelectedDate(d => d.add(1, 'day'))} />
            </Space>
            <Select value={viewMode} onChange={setViewMode} style={{ width: 90 }}>
              <Select.Option value="day">{t('meeting.viewDay')}</Select.Option>
              <Select.Option value="week">{t('meeting.viewWeek')}</Select.Option>
            </Select>
            <Select placeholder={t('meeting.allRooms')} className="w-120" allowClear value={filterRoom} onChange={setFilterRoom}>
              {rooms.map(r => <Select.Option key={r} value={r}>{r}</Select.Option>)}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/smart-meeting-room/create-booking')}>
              {t('meeting.newBooking')}
            </Button>
          </Space>
        }
      />

      <ContentCard className="workspace_calendar-overflow">
        <div className="workspace_calendar-min-w">
          <div className="workspace_calendar-header">
            <div className="workspace_calendar-time-col">
              {t('meeting.time')}
            </div>
            {displayRooms.map(room => (
              <div key={room} className="workspace_calendar-room-col">
                {room}
              </div>
            ))}
          </div>

          {times.map((time) => {
            const isHour = time.endsWith(':00')
            return (
              <div key={time} className={`workspace_calendar-row ${isHour ? 'workspace_calendar-row-hour' : 'workspace_calendar-row-half'}`}>
                <div className={`workspace_calendar-time-cell ${isHour ? 'workspace_calendar-time-cell-hour' : ''}`}>
                  {isHour ? time : ''}
                </div>

                {displayRooms.map(room => {
                  const { busy, title, isStart } = isSlotBusy(room, time, bookingsMap)
                  const isIssueRoom = room === 'Phòng họp 501'
                  return (
                    <div key={room} className="workspace_calendar-cell">
                      {busy ? (
                        <Tooltip title={`${title} — ${room}`}>
                          <div className={`workspace_calendar-slot-busy ${!isStart ? 'workspace_calendar-slot-busy-mid' : ''} ${isIssueRoom ? 'workspace_calendar-legend-dot-issue' : 'workspace_calendar-legend-dot-busy'}`} style={{ background: isIssueRoom ? '#fff1f0' : '#e6f7ff', borderLeft: `3px solid ${isIssueRoom ? '#ff4d4f' : '#1890ff'}` }}>
                            {isStart && (
                              <Text className="text-11 font-semibold" style={{ color: isIssueRoom ? '#ff4d4f' : '#1890ff' }} ellipsis>
                                {title}
                              </Text>
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <Tooltip title={`${room} — ${time} ${t('meeting.free')}`}>
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

        <div className="workspace_calendar-legend">
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-busy" /><Text type="secondary" className="text-sm">{t('meeting.busy')}</Text></Space>
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-issue" /><Text type="secondary" className="text-sm">{t('meeting.issue')}</Text></Space>
          <Space size={4}><div className="workspace_calendar-legend-dot workspace_calendar-legend-dot-free" /><Text type="secondary" className="text-sm">{t('meeting.free')}</Text></Space>
        </div>
      </ContentCard>
    </PageContainer>
  )
}
