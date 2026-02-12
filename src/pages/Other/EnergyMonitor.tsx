import { Row, Col, Card, Table, Typography, Select, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import { ThunderboltOutlined, CloudOutlined, BulbOutlined, FireOutlined } from '@ant-design/icons'
import { StatCard, LineChart, BarChart, GaugeChart } from '@/components'

const { Title } = Typography
const { RangePicker } = DatePicker

export default function EnergyMonitor() {
  const { t } = useTranslation()

  const hourlyCategories = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  const powerSeries = [{ name: t('energy.todayConsumption'), data: [200, 180, 400, 800, 1000, 600], color: '#1890ff' }]

  const monthlyCategories = ['T8', 'T9', 'T10', 'T11', 'T12']
  const monthlySeries = [
    { name: '2026', data: [80000, 70000, 65000, 55000, 45000], color: '#1890ff' },
    { name: '2025', data: [75000, 68000, 62000, 58000, 50000], color: '#52c41a' },
  ]

  const areaCategories = ['A', 'B', 'C', 'D']
  const areaData = [450, 380, 290, 200]

  const consumptionData = [
    { key: '1', area: 'Building A - Office', today: 120.5, month: 3650.2, change: '+5.2%' },
    { key: '2', area: 'Building B - Production', today: 89.3, month: 2840.8, change: '-2.1%' },
    { key: '3', area: 'Building C - Warehouse', today: 45.2, month: 1380.5, change: '+1.5%' },
    { key: '4', area: 'Building D - Service', today: 32.8, month: 980.3, change: '-3.8%' },
    { key: '5', area: 'Public Lighting', today: 15.6, month: 468.2, change: '0%' },
  ]

  const columns = [
    { title: t('energy.area'), dataIndex: 'area', key: 'area' },
    { title: `${t('energy.today')} (kWh)`, dataIndex: 'today', key: 'today', render: (val: number) => val.toFixed(1) },
    { title: `${t('energy.thisMonth')} (kWh)`, dataIndex: 'month', key: 'month', render: (val: number) => val.toLocaleString() },
    { title: t('energy.vsPrevious'), dataIndex: 'change', key: 'change', render: (val: string) => <span style={{ color: val.startsWith('+') ? '#f5222d' : val.startsWith('-') ? '#52c41a' : '#666' }}>{val}</span> },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('energy.currentPower')} value={9.80} suffix="kW/h" icon={<ThunderboltOutlined />} iconBgColor="#faad14" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('energy.todayConsumption')} value={303.4} suffix="kWh" icon={<ThunderboltOutlined />} iconBgColor="#1890ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('energy.airConditioning')} value={0.00} suffix="kWh" icon={<CloudOutlined />} iconBgColor="#52c41a" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('energy.lighting')} value={0.00} suffix="kWh" icon={<BulbOutlined />} iconBgColor="#722ed1" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <LineChart title={t('energy.dailyChart')} categories={hourlyCategories} series={powerSeries} showArea />
        </Col>
        <Col xs={24} lg={8}>
          <GaugeChart title={t('energy.efficiency')} value={72} color="#52c41a" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <LineChart title={t('energy.monthlyComparison')} categories={monthlyCategories} series={monthlySeries} />
        </Col>
        <Col xs={24} lg={12}>
          <BarChart title={t('energy.areaConsumption')} categories={areaCategories} data={areaData} color="#1890ff" />
        </Col>
      </Row>

      <Card title={t('energy.areaDetails')} bordered={false}>
        <Table columns={columns} dataSource={consumptionData} pagination={false} />
      </Card>
    </div>
  )
}
