import { useState, useEffect } from 'react'
import {
  Typography, Space, Button, Tag, Progress, Avatar,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ClockCircleOutlined, TeamOutlined, CheckCircleOutlined, ExpandOutlined,
  CalendarOutlined, WarningOutlined, EnvironmentOutlined,
  RightOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageContainer, ContentCard } from '@/components'
import { getMeetingKioskState, saveMeetingKioskState } from '@/services/mockPersistence'

const { Title, Text } = Typography

const mockRoom = {
  id: 'MR-301',
  name: 'Phòng họp lớn A',
  floor: '3',
  capacity: 20,
  status: 'in-meeting' as const,
  current: {
    title: 'Họp ban giám đốc Q1',
    time: '14:00–15:30',
    host: 'Minh',
    attendees: 12,
    checkedIn: false,
    checkInDeadline: '14:10',
  },
  next: {
    time: '16:00',
    title: 'Review dự án Smart Home',
  },
}

export default function MeetingRoomKiosk() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [checkedIn, setCheckedIn] = useState(() => getMeetingKioskState({ checkedIn: false }).checkedIn)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    saveMeetingKioskState({ checkedIn })
  }, [checkedIn])

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

  const timeProgress = 45
  const isInMeeting = mockRoom.status === 'in-meeting'

  return (
    <PageContainer className="page-container--flex-center">
      <div className="meeting_kiosk-max-w">

        {/* Room Header */}
        <ContentCard className="meeting_kiosk-card-center">
          <div className="meeting_kiosk-header-row">
            <Tag color="#1890ff" className="text-11 rounded-sm">
              <EnvironmentOutlined /> {t('meeting.floor')} {mockRoom.floor}
            </Tag>
            <Text type="secondary" className="text-sm">
              <ClockCircleOutlined className="mr-4" />{formatTime(now)}
            </Text>
          </div>
          <Title level={3} className="m-0">
            {mockRoom.name}
          </Title>
        </ContentCard>

        {/* Status Badge */}
        <div className={isInMeeting ? 'meeting_kiosk-badge-in-meeting' : 'meeting_kiosk-badge-available'}>
          <Text strong className="meeting_kiosk-badge-text text-white">
            {isInMeeting ? t('meeting.inMeeting') : t('meeting.available')}
          </Text>
        </div>

        {/* Current Booking */}
        <ContentCard className="mb-16">
          <div className="meeting_kiosk-header-row flex-between mb-4">
            <Text type="secondary" className="meeting_kiosk-now-label">
              {t('meeting.now')}
            </Text>
            <Tag color="blue" className="meeting_tag-rounded-10 text-sm">{mockRoom.current.time}</Tag>
          </div>
          <Title level={4} className="meeting_kiosk-title-margin">
            {mockRoom.current.title}
          </Title>

          <Progress
            percent={timeProgress}
            showInfo={false}
            strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
            trailColor="#f0f0f0"
            className="meeting_kiosk-progress-mb"
          />

          {/* Host & Attendees */}
          <div className="meeting_kiosk-host-row">
            <Space>
              <Avatar size="small" className="text-white" style={{ background: '#1890ff' }}>
                {mockRoom.current.host[0]}
              </Avatar>
              <div>
                <Text type="secondary" className="text-11 block">{t('meeting.host')}</Text>
                <Text strong className="text-base">{mockRoom.current.host}</Text>
              </div>
            </Space>
            <Space>
              <TeamOutlined className="text-primary" />
              <div>
                <Text type="secondary" className="text-11 block">{t('meeting.attendees')}</Text>
                <Text strong className="text-base">{mockRoom.current.attendees}</Text>
              </div>
            </Space>
          </div>

          {/* Check-in warning */}
          {!checkedIn && (
            <div className="meeting_kiosk-warning-box">
              <WarningOutlined className="text-warning text-lg" />
              <Text className="text-md" style={{ color: '#d48806' }}>
                {t('meeting.checkInRequired')} <Text strong style={{ color: '#d48806' }}>{mockRoom.current.checkInDeadline}</Text>
              </Text>
            </div>
          )}

          {/* Actions */}
          <div className="meeting_kiosk-actions">
            {!checkedIn ? (
              <Button type="primary" size="large" block
                icon={<CheckCircleOutlined />}
                onClick={() => setCheckedIn(true)}
                className="meeting_kiosk-btn-checkin">
                {t('meeting.checkIn')}
              </Button>
            ) : (
              <Button size="large" block
                icon={<CheckCircleOutlined />}
                className="meeting_kiosk-btn-checked">
                {t('meeting.checkedIn')}
              </Button>
            )}
            <Button size="large" disabled={!checkedIn}
              icon={<ExpandOutlined />}
              className="meeting_kiosk-btn-extend">
              {t('meeting.extend')}
            </Button>
          </div>

          {checkedIn && (
            <Text type="secondary" className="meeting_kiosk-hint">
              {t('meeting.extendHint')}
            </Text>
          )}
        </ContentCard>

        {/* Next Booking */}
        <ContentCard className="mb-16">
          <div className="meeting_kiosk-header-row">
            <div>
              <Text type="secondary" className="meeting_kiosk-next-label">
                {t('meeting.next')}
              </Text>
              <Space className="mt-4">
                <CalendarOutlined className="text-primary" />
                <Text className="text-md">
                  <Text strong className="text-primary">{mockRoom.next.time}</Text> — {mockRoom.next.title}
                </Text>
              </Space>
            </div>
            <RightOutlined className="text-muted" />
          </div>
        </ContentCard>

        {/* Report Issue */}
        <Button block size="large"
          icon={<ExclamationCircleOutlined />}
          onClick={() => navigate('/smart-meeting-room/report-issue')}
          className="meeting_kiosk-report-btn">
          {t('meeting.reportIssue')}
        </Button>

      </div>
    </PageContainer>
  )
}
