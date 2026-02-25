import { useState } from 'react'
import {
  Row, Col, Statistic, Typography, Tag, Badge, DatePicker, Space, List, Progress,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  DashboardOutlined, BellOutlined,
  WarningOutlined, CloseCircleOutlined, RiseOutlined,
  TeamOutlined, ClockCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import { PageContainer, PageHeader, ContentCard, SearchInput } from '@/components'

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
  { id: '1', severity: 'warning', room: 'A-1201', message: 'wsDash.alertCo2High', time: '09:42' },
  { id: '2', severity: 'critical', room: 'B-0902', message: 'wsDash.alertVcOffline', time: '09:15' },
  { id: '3', severity: 'warning', room: 'C-0701', message: 'wsDash.alertTempHigh', time: '08:50' },
  { id: '4', severity: 'warning', room: 'A-1203', message: 'wsDash.alertHumidityLow', time: '08:30' },
]

const mockTopRooms: TopRoom[] = [
  { room: 'A-1201', utilization: 88, building: 'Tòa A' },
  { room: 'B-0902', utilization: 84, building: 'Tòa B' },
  { room: 'A-1203', utilization: 78, building: 'Tòa A' },
  { room: 'C-0701', utilization: 72, building: 'Tòa C' },
  { room: 'B-0501', utilization: 68, building: 'Tòa B' },
]

const hourLabels = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const utilizationData = [12, 35, 58, 72, 68, 42, 55, 70, 65, 48, 30, 15]

export default function WorkspaceDashboard() {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')

  const kpi = {
    total: 48,
    inUse: 22,
    available: 18,
    reserved: 8,
    noShow: 7,
    noShowPct: 14,
    avgUtil: 62,
  }

  const chartOption = {
    tooltip: { trigger: 'axis' as const, formatter: '{b}<br/>{a}: {c}%' },
    grid: { top: 20, right: 16, bottom: 30, left: 40 },
    xAxis: { type: 'category' as const, data: hourLabels, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%', fontSize: 11 } },
    series: [{
      name: t('wsDash.utilization'),
      type: 'line',
      smooth: true,
      data: utilizationData,
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(24,144,255,0.3)' }, { offset: 1, color: 'rgba(24,144,255,0.02)' }] } },
      lineStyle: { width: 2.5, color: '#1890ff' },
      itemStyle: { color: '#1890ff' },
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
        title={t('wsDash.title')}
        icon={<DashboardOutlined />}
        actions={
          <Space size={12} wrap>
            <DatePicker defaultValue={dayjs()} format="DD/MM/YYYY" size="middle" />
            <SearchInput
              placeholder={t('wsDash.searchPlaceholder')}
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

      {/* KPIs + Alerts */}
      <Row gutter={[16, 16]} className="workspace_row-mb-20">
        {/* KPIs */}
        <Col xs={24} lg={14}>
          <ContentCard title={t('wsDash.kpis')} titleIcon={<RiseOutlined />} className="workspace_card-h-full">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={t('wsDash.roomsTotal')}
                  value={kpi.total}
                  prefix={<EnvironmentOutlined className="text-primary" />}
                  valueStyle={{ fontSize: 28 }}
                />
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('wsDash.inUseAvailable')}</Text>
                  <div className="flex items-baseline gap-8 mt-4">
                    <Text strong className="text-3xl text-primary">{kpi.inUse}</Text>
                    <Text type="secondary">/</Text>
                    <Text strong className="text-3xl text-success">{kpi.available}</Text>
                    <Text type="secondary" className="text-sm">({kpi.reserved} {t('wsDash.reserved')})</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('wsDash.noShowToday')}</Text>
                  <div className="flex items-baseline gap-6 mt-4">
                    <Text strong className="text-3xl text-warning">{kpi.noShow}</Text>
                    <Tag color="orange" className="workspace_tag-rounded-10">{kpi.noShowPct}%</Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" className="text-sm">{t('wsDash.avgUtilization')}</Text>
                  <div className="flex items-center gap-12 mt-4">
                    <Text strong className="text-3xl" style={{ color: '#722ed1' }}>{kpi.avgUtil}%</Text>
                    <Progress percent={kpi.avgUtil} showInfo={false} strokeColor="#722ed1" className="workspace_progress-w-80" />
                  </div>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>

        {/* Alerts */}
        <Col xs={24} lg={10}>
          <ContentCard
            title={<><BellOutlined className="workspace_title-icon-mr mr-8" />{t('wsDash.alerts')}<Badge count={mockAlerts.length} className="workspace_badge-ml ml-4" /></>}
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
                      <Text strong className="text-base">{t('wsDash.room')} {item.room}</Text>
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

      {/* Chart + Top Rooms */}
      <Row gutter={[16, 16]}>
        {/* Utilization by Hour */}
        <Col xs={24} lg={14}>
          <ContentCard title={t('wsDash.utilizationByHour')} titleIcon={<ClockCircleOutlined />}>
            <ReactECharts option={chartOption} className="workspace_chart-height" />
          </ContentCard>
        </Col>

        {/* Top Rooms */}
        <Col xs={24} lg={10}>
          <ContentCard title={t('wsDash.topRooms')} titleIcon={<TeamOutlined />} titleIconColor="#722ed1">
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
                        background: idx === 0 ? '#fff7e6' : idx === 1 ? '#f0f0f0' : idx === 2 ? '#fff1e6' : '#fafafa',
                        color: idx === 0 ? '#fa8c16' : idx === 1 ? '#8c8c8c' : idx === 2 ? '#d46b08' : '#bfbfbf',
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
