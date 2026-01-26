import { Row, Col, Card, Table, Tag, Typography, Progress } from 'antd'
import { useTranslation } from 'react-i18next'
import { CarOutlined } from '@ant-design/icons'
import { StatCard, PieChart, BarChart } from '@/components'

const { Title } = Typography

export default function ParkingManagement() {
  const { t } = useTranslation()

  const parkingData = [
    { name: t('parking.usedSpots'), value: 45 },
    { name: t('parking.availableSpots'), value: 16 },
  ]

  const hourlyData = ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h']
  const hourlyVehicles = [10, 45, 60, 40, 55, 70, 50, 25]

  const recentVehicles = [
    { key: '1', plate: '30A-123.45', type: 'car', time: '08:30:25', status: 'in' },
    { key: '2', plate: '29B-456.78', type: 'car', time: '08:25:10', status: 'out' },
    { key: '3', plate: '30G-789.01', type: 'motorcycle', time: '08:20:45', status: 'in' },
    { key: '4', plate: '30A-234.56', type: 'car', time: '08:15:30', status: 'in' },
    { key: '5', plate: '29C-567.89', type: 'motorcycle', time: '08:10:15', status: 'out' },
  ]

  const columns = [
    { title: t('parking.plateNumber'), dataIndex: 'plate', key: 'plate' },
    { title: t('parking.vehicleType'), dataIndex: 'type', key: 'type', render: (type: string) => type === 'car' ? t('parking.car') : t('parking.motorcycle') },
    { title: t('common.time'), dataIndex: 'time', key: 'time' },
    { title: t('common.status'), dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'in' ? 'green' : 'orange'}>{status === 'in' ? t('parking.in') : t('parking.out')}</Tag> },
  ]

  const parkingZones = [
    { name: 'Zone A', total: 20, used: 18 },
    { name: 'Zone B', total: 15, used: 12 },
    { name: 'Zone C', total: 16, used: 10 },
    { name: 'Zone D', total: 10, used: 5 },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>{t('parking.title')}</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('parking.totalSpots')} value={61} suffix={t('dashboard.spots')} icon={<CarOutlined />} iconBgColor="#1890ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('parking.usedSpots')} value={45} suffix={t('dashboard.spots')} icon={<CarOutlined />} iconBgColor="#52c41a" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('parking.availableSpots')} value={16} suffix={t('dashboard.spots')} icon={<CarOutlined />} iconBgColor="#faad14" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('parking.usageRate')} value="73.8%" icon={<CarOutlined />} iconBgColor="#722ed1" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <PieChart title={t('parking.parkingStatus')} data={parkingData} innerRadius="50%" outerRadius="75%" />
        </Col>
        <Col xs={24} lg={16}>
          <BarChart title={t('parking.hourlyTraffic')} categories={hourlyData} data={hourlyVehicles} color="#1890ff" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title={t('parking.parkingZones')} bordered={false}>
            {parkingZones.map((zone) => (
              <div key={zone.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{zone.name}</span>
                  <span>{zone.used}/{zone.total}</span>
                </div>
                <Progress percent={Math.round((zone.used / zone.total) * 100)} showInfo={false} strokeColor={zone.used / zone.total > 0.8 ? '#f5222d' : '#1890ff'} />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title={t('parking.recentVehicles')} bordered={false}>
            <Table columns={columns} dataSource={recentVehicles} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
