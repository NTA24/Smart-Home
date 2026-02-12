import { useState, useEffect } from 'react'
import {
  Card, Typography, Space, Button, Tag, Progress, Avatar,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ClockCircleOutlined, TeamOutlined, CheckCircleOutlined, ExpandOutlined,
  CalendarOutlined, WarningOutlined, EnvironmentOutlined,
  RightOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

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
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Room Header */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Tag color="#1890ff" style={{ fontSize: 11, borderRadius: 6 }}>
              <EnvironmentOutlined /> {t('wsKiosk.floor')} {mockRoom.floor}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />{formatTime(now)}
            </Text>
          </div>
          <Title level={3} style={{ margin: 0 }}>
            {t('wsKiosk.room')} {mockRoom.id}
          </Title>
        </Card>

        {/* Status Badge */}
        <div style={{
          background: '#ff4d4f', borderRadius: 10, padding: '8px 0', textAlign: 'center', marginBottom: 16,
        }}>
          <Text strong style={{ color: '#fff', fontSize: 14, letterSpacing: 1 }}>
            {t('wsKiosk.inUse')}
          </Text>
        </div>

        {/* Current Booking */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('wsKiosk.now')}
            </Text>
            <Tag color="blue" style={{ borderRadius: 10, fontSize: 12 }}>{mockRoom.current.time}</Tag>
          </div>
          <Title level={4} style={{ margin: '4px 0 12px' }}>
            {mockRoom.current.title}
          </Title>

          <Progress
            percent={timeProgress}
            showInfo={false}
            strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
            trailColor="#f0f0f0"
            style={{ marginBottom: 16 }}
          />

          {/* Host & Attendees */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <Avatar size="small" style={{ background: '#1890ff' }}>
                {mockRoom.current.host[0]}
              </Avatar>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{t('wsKiosk.host')}</Text>
                <Text strong style={{ fontSize: 13 }}>{mockRoom.current.host}</Text>
              </div>
            </Space>
            <Space>
              <TeamOutlined style={{ color: '#1890ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{t('wsKiosk.attendees')}</Text>
                <Text strong style={{ fontSize: 13 }}>{mockRoom.current.attendees}</Text>
              </div>
            </Space>
          </div>

          {/* Check-in warning */}
          {!checkedIn && (
            <div style={{
              background: '#fffbe6', border: '1px solid #ffe58f',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
              <Text style={{ color: '#d48806', fontSize: 13 }}>
                {t('wsKiosk.checkInRequired')} <Text strong style={{ color: '#d48806' }}>{mockRoom.current.checkInDeadline}</Text>
              </Text>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!checkedIn ? (
              <Button type="primary" size="large" block
                icon={<CheckCircleOutlined />}
                onClick={() => setCheckedIn(true)}
                style={{ borderRadius: 10, height: 48, fontWeight: 600, fontSize: 15 }}>
                {t('wsKiosk.checkIn')}
              </Button>
            ) : (
              <Button size="large" block
                icon={<CheckCircleOutlined />}
                style={{ borderRadius: 10, height: 48, background: '#f6ffed', borderColor: '#52c41a', color: '#52c41a', fontWeight: 600 }}>
                {t('wsKiosk.checkedIn')}
              </Button>
            )}
            <Button size="large" disabled={!checkedIn}
              icon={<ExpandOutlined />}
              style={{ borderRadius: 10, height: 48, minWidth: 110 }}>
              {t('wsKiosk.extend')}
            </Button>
          </div>

          {checkedIn && (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 11 }}>
              {t('wsKiosk.extendHint')}
            </Text>
          )}
        </Card>

        {/* Next Booking */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
                {t('wsKiosk.next')}
              </Text>
              <Space style={{ marginTop: 4 }}>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <Text style={{ fontSize: 14 }}>
                  <Text strong style={{ color: '#1890ff' }}>{mockRoom.next.time}</Text> — {mockRoom.next.title}
                </Text>
              </Space>
            </div>
            <RightOutlined style={{ color: '#bfbfbf' }} />
          </div>
        </Card>

        {/* Report Issue */}
        <Button block size="large"
          icon={<ExclamationCircleOutlined />}
          onClick={() => navigate('/smart-workspace/report-issue')}
          style={{ borderRadius: 10, height: 46, fontWeight: 500 }}>
          {t('wsKiosk.reportIssue')}
        </Button>

      </div>
    </div>
  )
}
