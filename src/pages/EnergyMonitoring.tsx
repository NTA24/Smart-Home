import { Row, Col, Card, Table, Typography, Select, DatePicker, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import { ThunderboltOutlined, CloudOutlined, BulbOutlined } from '@ant-design/icons'
import { LineChart, BarChart, GaugeChart } from '@/components'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function EnergyMonitoring() {
  const { t } = useTranslation()

  const hourlyCategories = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const hourlySeries = [{ name: t('energy.todayConsumption'), data: [150, 120, 100, 130, 450, 800, 950, 1100, 900, 700, 500, 300], color: '#1890ff' }]

  const monthlyCategories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const monthlySeries = [
    { name: '2026', data: [45000, 42000, 38000, 35000, 40000, 55000, 65000, 70000, 60000, 50000, 45000, 48000], color: '#1890ff' },
    { name: '2025', data: [50000, 48000, 45000, 42000, 47000, 60000, 72000, 78000, 68000, 55000, 50000, 52000], color: '#52c41a' },
  ]

  const areaCategories = ['A', 'B', 'C', 'D', 'Lighting', 'Other']
  const areaData = [35000, 28000, 22000, 15000, 8000, 5000]

  const consumptionData = [
    { key: '1', area: 'Building A - Office', today: 120.5, week: 845.2, month: 3650.2, change: '+5.2%' },
    { key: '2', area: 'Building B - Production', today: 89.3, week: 625.1, month: 2840.8, change: '-2.1%' },
    { key: '3', area: 'Building C - Warehouse', today: 45.2, week: 316.4, month: 1380.5, change: '+1.5%' },
    { key: '4', area: 'Building D - Service', today: 32.8, week: 229.6, month: 980.3, change: '-3.8%' },
    { key: '5', area: 'Public Lighting', today: 15.6, week: 109.2, month: 468.2, change: '0%' },
  ]

  const columns = [
    { title: t('energy.area'), dataIndex: 'area', key: 'area' },
    { title: `${t('energy.today')} (kWh)`, dataIndex: 'today', key: 'today', render: (val: number) => val.toFixed(1) },
    { title: `${t('energy.thisWeek')} (kWh)`, dataIndex: 'week', key: 'week', render: (val: number) => val.toFixed(1) },
    { title: `${t('energy.thisMonth')} (kWh)`, dataIndex: 'month', key: 'month', render: (val: number) => val.toLocaleString() },
    { title: t('energy.vsPrevious'), dataIndex: 'change', key: 'change', render: (val: string) => <span style={{ color: val.startsWith('+') ? '#f5222d' : val.startsWith('-') ? '#52c41a' : '#666' }}>{val}</span> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{t('energy.title')}</Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select defaultValue="all" style={{ width: 150 }}>
            <Select.Option value="all">All Buildings</Select.Option>
            <Select.Option value="a">Building A</Select.Option>
            <Select.Option value="b">Building B</Select.Option>
          </Select>
          <RangePicker />
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#faad14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ThunderboltOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Statistic title={t('energy.currentPower')} value={10.80} suffix="kW/h" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ThunderboltOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Statistic title={t('energy.todayConsumption')} value={311.6} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Statistic title={t('energy.airConditioning')} value={10.00} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BulbOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Statistic title={t('energy.lighting')} value={0.00} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <LineChart title={t('energy.dailyChart')} categories={hourlyCategories} series={hourlySeries} height={280} showArea />
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('energy.efficiency')} bordered={false}>
            <GaugeChart title="" value={72} height={200} color="#52c41a" />
            <div style={{ textAlign: 'center', marginTop: -20 }}>
              <Text type="secondary">{t('energy.efficiency')}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <LineChart title={t('energy.monthlyComparison')} categories={monthlyCategories} series={monthlySeries} height={280} />
        </Col>
        <Col xs={24} lg={12}>
          <BarChart title={t('energy.areaConsumption')} categories={areaCategories} data={areaData} height={280} color="#1890ff" />
        </Col>
      </Row>

      <Card title={t('energy.areaDetails')} bordered={false}>
        <Table columns={columns} dataSource={consumptionData} pagination={false} />
      </Card>
    </div>
  )
}
