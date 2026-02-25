import { useState } from 'react'
import {
  Row, Col, Statistic, Typography, Tag, Badge, DatePicker, Space, List, Progress,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  DashboardOutlined, BellOutlined,
  WarningOutlined, CloseCircleOutlined, RiseOutlined,
  TeamOutlined, ClockCircleOutlined,
  EnvironmentOutlined, VideoCameraOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard, SearchInput } from '@/components'
import { getMeetingBookings, getMeetingRooms } from '@/services/mockPersistence'

const { Text } = Typography

interface Alert {
  id: string
  severity: 'warning' | 'critical'
  room: string
  message: string
  time: string
}

interface TopRoom {
  room: string
  utilization: number
  building: string
}

const mockAlerts: Alert[] = [
  { id: '1', severity: 'critical', room: 'Phòng họp lớn A', message: 'meeting.alertProjectorOffline', time: '09:50' },
  { id: '2', severity: 'warning', room: 'Phòng họp 502', message: 'meeting.alertAudioIssue', time: '09:32' },
  { id: '3', severity: 'warning', room: 'Phòng họp VIP', message: 'meeting.alertTempHigh', time: '09:10' },
  { id: '4', severity: 'critical', room: 'Phòng họp 301', message: 'meeting.alertVcOffline', time: '08:45' },
]

const mockTopRooms: TopRoom[] = [
  { room: 'Phòng họp lớn A', utilization: 92, building: 'Tòa A' },
  { room: 'Phòng họp 502', utilization: 85, building: 'Tòa B' },
  { room: 'Phòng họp VIP', utilization: 80, building: 'Tòa A' },
  { room: 'Phòng họp 301', utilization: 74, building: 'Tòa C' },
  { room: 'Phòng họp 205', utilization: 66, building: 'Tòa B' },
]

const hourLabels = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const utilizationData = [8, 30, 65, 82, 75, 38, 60, 78, 70, 52, 28, 10]

export default function MeetingRoomDashboard() {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const rooms = getMeetingRooms<any>([])
  const bookings = getMeetingBookings<any>([])

  const kpi = {
    total: rooms.length || 24,
    inUse: rooms.filter((r: any) => r.status === 'in-meeting').length || 14,
    available: rooms.filter((r: any) => r.status === 'available').length || 8,
    noShow: 5,
    noShowPct: 18,
    avgUtil: rooms.length > 0 ? Math.round((rooms.filter((r: any) => r.status !== 'available').length / rooms.length) * 100) : 71,
    todayBookings: bookings.filter((b: any) => b.date === dayjs().format('YYYY-MM-DD')).length,
  }

  const chartOption = {
    tooltip: { trigger: 'axis' as const, formatter: '{b}<br/>{a}: {c}%' },
    grid: { top: 20, right: 16, bottom: 30, left: 40 },
    xAxis: { type: 'category' as const, data: hourLabels, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%', fontSize: 11 } },
    series: [{
      name: t('meeting.utilization'),
      type: 'line',
      smooth: true,
      data: utilizationData,
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(114,46,209,0.3)' }, { offset: 1, color: 'rgba(114,46,209,0.02)' }] } },
      lineStyle: { width: 2.5, color: '#722ed1' },
      itemStyle: { color: '#722ed1' },
      symbol: 'circle',
      symbolSize: 6,
    }],
  }

  const severityIcon = (s: string) => s === 'critical'
    ? <CloseCircleOutlined className="text-danger" />
    : <WarningOutlined className="text-warning" />

  return (
    <PageContainer>
      <PageHeader
        title={t('meeting.dashboard')}
        icon={<DashboardOutlined />}
        actions={
          <Space size={12} wrap>
            <DatePicker defaultValue={dayjs()} format="DD/MM/YYYY" size="middle" />
            <SearchInput
              placeholder={t('meeting.searchPlaceholder')}
              value={searchText}
              onChange={setSearchText}
              width={220}
            />
            <Badge count={mockAlerts.length} size="small">
              <BellOutlined className="workspace_bell-icon" />
            </Badge>
          </Space>
        }
      />

      <Row gutter={[16, 16]} className="workspace_row-mb-20">
        <Col xs={24} lg={14}>
          <ContentCard title={t('meeting.kpis')} titleIcon={<RiseOutlined />} className="workspace_card-h-full">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={t('meeting.roomsTotal')}
                  value={kpi.total}
                  prefix={<VideoCameraOutlined className="text-primary" />}
                  valueStyle={{ fontSize: 28 }}
                />
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('meeting.inUseAvailable')}</Text>
                  <div className="flex items-baseline gap-8 mt-4">
                    <Text strong className="text-3xl text-primary">{kpi.inUse}</Text>
                    <Text type="secondary">/</Text>
                    <Text strong className="text-3xl text-success">{kpi.available}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('meeting.noShowRate')}</Text>
                  <div className="flex items-baseline gap-6 mt-4">
                    <Text strong className="text-3xl text-warning">{kpi.noShow}</Text>
                    <Tag color="orange" className="workspace_tag-rounded-10">{kpi.noShowPct}%</Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('meeting.todayBookings')}</Text>
                  <div className="mt-4">
                    <Text strong className="text-3xl text-primary">{kpi.todayBookings}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('meeting.avgUtilization')}</Text>
                  <div className="flex items-center gap-12 mt-4">
                    <Text strong className="text-3xl" style={{ color: '#722ed1' }}>{kpi.avgUtil}%</Text>
                    <Progress percent={kpi.avgUtil} showInfo={false} strokeColor="#722ed1" className="workspace_progress-w-80" />
                  </div>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>

        <Col xs={24} lg={10}>
          <ContentCard
            title={<><BellOutlined className="workspace_title-icon-mr mr-8" />{t('meeting.alerts')}<Badge count={mockAlerts.length} className="workspace_badge-ml ml-4" /></>}
            titleIcon={<BellOutlined />}
            titleIconColor="#ff4d4f"
            className="workspace_card-h-full"
          >
            <List
              size="small"
              dataSource={mockAlerts}
              renderItem={(item) => (
                <List.Item className="workspace_list-item-py">
                  <Space>
                    {severityIcon(item.severity)}
                    <Tag color={item.severity === 'critical' ? 'red' : 'gold'} className="workspace_tag-alert">
                      {item.severity === 'critical' ? 'C' : 'W'}
                    </Tag>
                    <div>
                      <Text strong className="text-base">{item.room}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">{t(item.message)}</Text>
                    </div>
                  </Space>
                  <Text type="secondary" className="text-11">{item.time}</Text>
                </List.Item>
              )}
            />
          </ContentCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <ContentCard title={t('meeting.utilizationByHour')} titleIcon={<ClockCircleOutlined />}>
            <ReactECharts option={chartOption} className="workspace_chart-height" />
          </ContentCard>
        </Col>

        <Col xs={24} lg={10}>
          <ContentCard title={t('meeting.topRooms')} titleIcon={<TeamOutlined />} titleIconColor="#722ed1">
            <List
              size="small"
              dataSource={mockTopRooms}
              renderItem={(item, idx) => (
                <List.Item className="workspace_list-item-py-10">
                  <Space>
                    <div
                      className="flex flex-center flex-shrink-0"
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: idx === 0 ? '#f9f0ff' : idx === 1 ? '#f0f0f0' : idx === 2 ? '#fff1e6' : '#fafafa',
                        color: idx === 0 ? '#722ed1' : idx === 1 ? '#8c8c8c' : idx === 2 ? '#d46b08' : '#bfbfbf',
                        fontWeight: 700, fontSize: 12,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <Text strong>{item.room}</Text>
                      <br />
                      <Text type="secondary" className="text-11">{item.building}</Text>
                    </div>
                  </Space>
                  <div className="flex items-center gap-8">
                    <Progress
                      percent={item.utilization}
                      showInfo={false}
                      strokeColor={item.utilization >= 80 ? '#ff4d4f' : item.utilization >= 60 ? '#faad14' : '#52c41a'}
                      className="workspace_progress-w-80"
                    />
                    <Text strong className="workspace_percent-w-36 text-right">{item.utilization}%</Text>
                  </div>
                </List.Item>
              )}
            />
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
