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
import { useNavigate } from 'react-router'
import { PageContainer, ContentCard } from '@/components'

const { Title, Text } = Typography

const mockRoom = {
  id: 'A-1201',
  floor: '12',
  capacity: 10,
  current: {
    title: 'Weekly Sync',
    time: '09:30–10:30',
    host: 'An',
    attendees: 8,
    checkedIn: false,
    checkInDeadline: '09:40',
  },
  next: {
    time: '10:45',
    title: 'Client Call',
  },
}

export default function WorkspaceKiosk() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

  const timeProgress = 30

  return (
    <PageContainer className="page-container--flex-center">
      <div className="workspace_kiosk-max-w">

        {/* Room Header */}
        <ContentCard className="workspace_kiosk-card-center">
          <div className="workspace_kiosk-header-row">
            <Tag color="#1890ff" className="text-11 rounded-sm">
              <EnvironmentOutlined /> {t('wsKiosk.floor')} {mockRoom.floor}
            </Tag>
            <Text type="secondary" className="text-sm">
              <ClockCircleOutlined className="mr-4" />{formatTime(now)}
            </Text>
          </div>
          <Title level={3} className="m-0">
            {t('wsKiosk.room')} {mockRoom.id}
          </Title>
        </ContentCard>

        {/* Status Badge */}
        <div className="workspace_kiosk-badge-in-use">
          <Text strong className="workspace_kiosk-badge-text text-white">
            {t('wsKiosk.inUse')}
          </Text>
        </div>

        {/* Current Booking */}
        <ContentCard className="mb-16">
          <div className="workspace_kiosk-header-row flex-between mb-4">
            <Text type="secondary" className="workspace_kiosk-now-label">
              {t('wsKiosk.now')}
            </Text>
            <Tag color="blue" className="workspace_tag-rounded-10 text-sm">{mockRoom.current.time}</Tag>
          </div>
          <Title level={4} className="workspace_kiosk-title-margin">
            {mockRoom.current.title}
          </Title>

          <Progress
            percent={timeProgress}
            showInfo={false}
            strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
            trailColor="#f0f0f0"
            className="workspace_kiosk-progress-mb"
          />

          {/* Host & Attendees */}
          <div className="workspace_kiosk-host-row">
            <Space>
              <Avatar size="small" className="text-white" style={{ background: '#1890ff' }}>
                {mockRoom.current.host[0]}
              </Avatar>
              <div>
                <Text type="secondary" className="text-11 block">{t('wsKiosk.host')}</Text>
                <Text strong className="text-base">{mockRoom.current.host}</Text>
              </div>
            </Space>
            <Space>
              <TeamOutlined className="text-primary" />
              <div>
                <Text type="secondary" className="text-11 block">{t('wsKiosk.attendees')}</Text>
                <Text strong className="text-base">{mockRoom.current.attendees}</Text>
              </div>
            </Space>
          </div>

          {/* Check-in warning */}
          {!checkedIn && (
            <div className="workspace_kiosk-warning-box">
              <WarningOutlined className="text-warning text-lg" />
              <Text className="text-md" style={{ color: '#d48806' }}>
                {t('wsKiosk.checkInRequired')} <Text strong style={{ color: '#d48806' }}>{mockRoom.current.checkInDeadline}</Text>
              </Text>
            </div>
          )}

          {/* Actions */}
          <div className="workspace_kiosk-actions">
            {!checkedIn ? (
              <Button type="primary" size="large" block
                icon={<CheckCircleOutlined />}
                onClick={() => setCheckedIn(true)}
                className="workspace_kiosk-btn-checkin">
                {t('wsKiosk.checkIn')}
              </Button>
            ) : (
              <Button size="large" block
                icon={<CheckCircleOutlined />}
                className="workspace_kiosk-btn-checked">
                {t('wsKiosk.checkedIn')}
              </Button>
            )}
            <Button size="large" disabled={!checkedIn}
              icon={<ExpandOutlined />}
              className="workspace_kiosk-btn-extend">
              {t('wsKiosk.extend')}
            </Button>
          </div>

          {checkedIn && (
            <Text type="secondary" className="workspace_kiosk-hint">
              {t('wsKiosk.extendHint')}
            </Text>
          )}
        </ContentCard>

        {/* Next Booking */}
        <ContentCard className="mb-16">
          <div className="workspace_kiosk-header-row">
            <div>
              <Text type="secondary" className="workspace_kiosk-next-label">
                {t('wsKiosk.next')}
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
          onClick={() => navigate('/smart-workspace/report-issue')}
          className="workspace_kiosk-report-btn">
          {t('wsKiosk.reportIssue')}
        </Button>

      </div>
    </PageContainer>
  )
}
