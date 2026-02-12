import { useState } from 'react'
import {
  Card, Row, Col, Statistic, Typography, Tag, Badge, Input, DatePicker, Space, List, Progress, Tooltip,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  DashboardOutlined, BellOutlined, SearchOutlined,
  WarningOutlined, CloseCircleOutlined, RiseOutlined,
  TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EnvironmentOutlined, ExperimentOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'

const { Title, Text } = Typography

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
    ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    : <WarningOutlined style={{ color: '#faad14' }} />

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DashboardOutlined />
            {t('wsDash.title')}
          </Title>
        </div>
        <Space size={12} wrap>
          <DatePicker defaultValue={dayjs()} format="DD/MM/YYYY" size="middle" />
          <Input
            placeholder={t('wsDash.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Badge count={mockAlerts.length} size="small">
            <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          </Badge>
        </Space>
      </div>

      {/* KPIs + Alerts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* KPIs */}
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={<span><RiseOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsDash.kpis')}</span>}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={t('wsDash.roomsTotal')}
                  value={kpi.total}
                  prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ fontSize: 28 }}
                />
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDash.inUseAvailable')}</Text>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <Text strong style={{ fontSize: 28, color: '#1890ff' }}>{kpi.inUse}</Text>
                    <Text type="secondary">/</Text>
                    <Text strong style={{ fontSize: 28, color: '#52c41a' }}>{kpi.available}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>({kpi.reserved} {t('wsDash.reserved')})</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDash.noShowToday')}</Text>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <Text strong style={{ fontSize: 28, color: '#faad14' }}>{kpi.noShow}</Text>
                    <Tag color="orange" style={{ borderRadius: 10 }}>{kpi.noShowPct}%</Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDash.avgUtilization')}</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <Text strong style={{ fontSize: 28, color: '#722ed1' }}>{kpi.avgUtil}%</Text>
                    <Progress percent={kpi.avgUtil} showInfo={false} strokeColor="#722ed1" style={{ width: 80 }} />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Alerts */}
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={
              <span>
                <BellOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                {t('wsDash.alerts')}
                <Badge count={mockAlerts.length} style={{ marginLeft: 8 }} />
              </span>
            }>
            <List
              size="small"
              dataSource={mockAlerts}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Space>
                    {severityIcon(item.severity)}
                    <Tag color={item.severity === 'critical' ? 'red' : 'gold'} style={{ borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                      {item.severity === 'critical' ? 'C' : 'W'}
                    </Tag>
                    <div>
                      <Text strong style={{ fontSize: 13 }}>{t('wsDash.room')} {item.room}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{t(item.message)}</Text>
                    </div>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart + Top Rooms */}
      <Row gutter={[16, 16]}>
        {/* Utilization by Hour */}
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={<span><ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsDash.utilizationByHour')}</span>}>
            <ReactECharts option={chartOption} style={{ height: 260 }} />
          </Card>
        </Col>

        {/* Top Rooms */}
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={<span><TeamOutlined style={{ color: '#722ed1', marginRight: 8 }} />{t('wsDash.topRooms')}</span>}>
            <List
              size="small"
              dataSource={mockTopRooms}
              renderItem={(item, idx) => (
                <List.Item style={{ padding: '10px 0' }}>
                  <Space>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: idx === 0 ? '#fff7e6' : idx === 1 ? '#f0f0f0' : idx === 2 ? '#fff1e6' : '#fafafa',
                      color: idx === 0 ? '#fa8c16' : idx === 1 ? '#8c8c8c' : idx === 2 ? '#d46b08' : '#bfbfbf',
                      fontWeight: 700, fontSize: 12,
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <Text strong>{item.room}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{item.building}</Text>
                    </div>
                  </Space>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Progress
                      percent={item.utilization}
                      showInfo={false}
                      strokeColor={item.utilization >= 80 ? '#ff4d4f' : item.utilization >= 60 ? '#faad14' : '#52c41a'}
                      style={{ width: 80 }}
                    />
                    <Text strong style={{ width: 36, textAlign: 'right' }}>{item.utilization}%</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
