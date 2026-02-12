import { useState } from 'react'
import { Row, Col, Card, Table, Tag, Typography, Progress, Select, Segmented, Badge } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { StatCard, PieChart, BarChart } from '@/components'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

export default function ParkingManagement() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [zoneFilter, setZoneFilter] = useState('all')
  const [viewMode, setViewMode] = useState<string>('overview')

  const parkingData = [
    { name: t('parking.usedSpots'), value: 45 },
    { name: t('parking.availableSpots'), value: 16 },
  ]

  const hourlyData = ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h']
  const hourlyVehicles = [10, 45, 60, 40, 55, 70, 50, 25]

  const recentVehicles = [
    { key: '1', plate: '30A-123.45', type: 'car', time: '08:30:25', status: 'in', zone: 'Zone A' },
    { key: '2', plate: '29B-456.78', type: 'car', time: '08:25:10', status: 'out', zone: 'Zone B' },
    { key: '3', plate: '30G-789.01', type: 'motorcycle', time: '08:20:45', status: 'in', zone: 'Zone A' },
    { key: '4', plate: '30A-234.56', type: 'car', time: '08:15:30', status: 'in', zone: 'Zone C' },
    { key: '5', plate: '29C-567.89', type: 'motorcycle', time: '08:10:15', status: 'out', zone: 'Zone D' },
    { key: '6', plate: '30H-111.22', type: 'car', time: '08:05:00', status: 'in', zone: 'Zone B' },
    { key: '7', plate: '29A-333.44', type: 'motorcycle', time: '07:58:30', status: 'in', zone: 'Zone A' },
    { key: '8', plate: '30B-555.66', type: 'car', time: '07:50:12', status: 'out', zone: 'Zone C' },
  ]

  const filteredVehicles = zoneFilter === 'all'
    ? recentVehicles
    : recentVehicles.filter(v => v.zone === zoneFilter)

  const columns = [
    {
      title: t('parking.plateNumber'),
      dataIndex: 'plate',
      key: 'plate',
      render: (plate: string) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 13 }}>{plate}</Text>
      ),
    },
    {
      title: t('parking.vehicleType'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'car' ? 'blue' : 'cyan'} style={{ borderRadius: 12 }}>
          <CarOutlined style={{ marginRight: 4 }} />
          {type === 'car' ? t('parking.car') : t('parking.motorcycle')}
        </Tag>
      ),
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
      render: (zone: string) => (
        <Tag style={{ borderRadius: 6 }}>{zone}</Tag>
      ),
    },
    {
      title: t('common.time'),
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          {time}
        </span>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'in' ? 'success' : 'warning'}
          text={
            <Text style={{ fontSize: 13, color: status === 'in' ? '#52c41a' : '#faad14' }}>
              {status === 'in' ? t('parking.in') : t('parking.out')}
            </Text>
          }
        />
      ),
    },
  ]

  const parkingZones = [
    { name: 'Zone A', total: 20, used: 18, color: '#f5222d' },
    { name: 'Zone B', total: 15, used: 12, color: '#1890ff' },
    { name: 'Zone C', total: 16, used: 10, color: '#52c41a' },
    { name: 'Zone D', total: 10, used: 5, color: '#faad14' },
  ]

  const totalSpots = parkingZones.reduce((acc, z) => acc + z.total, 0)
  const usedSpots = parkingZones.reduce((acc, z) => acc + z.used, 0)
  const availableSpots = totalSpots - usedSpots
  const usageRate = ((usedSpots / totalSpots) * 100).toFixed(1)

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CarOutlined />
            {t('parking.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('parking.allSites')} — {usedSpots}/{totalSpots} {t('parking.spotsUsed')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as string)}
            options={[
              { value: 'overview', label: t('parking.overview') },
              { value: 'vehicles', label: t('parking.vehicles') },
            ]}
            style={{ background: '#f0f0f0', borderRadius: 10, padding: 2, fontWeight: 600 }}
          />
          <Select
            value={zoneFilter}
            onChange={setZoneFilter}
            style={{ minWidth: 120 }}
            options={[
              { value: 'all', label: t('parking.allZones') },
              ...parkingZones.map(z => ({ value: z.name, label: z.name })),
            ]}
          />
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.totalSpots')}
            value={totalSpots}
            suffix={t('parking.spots')}
            icon={<EnvironmentOutlined />}
            iconBgColor="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.usedSpots')}
            value={usedSpots}
            suffix={t('parking.spots')}
            icon={<CarOutlined />}
            iconBgColor="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.availableSpots')}
            value={availableSpots}
            suffix={t('parking.spots')}
            icon={<DashboardOutlined />}
            iconBgColor="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.usageRate')}
            value={`${usageRate}%`}
            icon={<WarningOutlined />}
            iconBgColor={Number(usageRate) > 80 ? '#f5222d' : '#722ed1'}
          />
        </Col>
      </Row>

      {viewMode === 'overview' ? (
        <>
          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} lg={8}>
              <PieChart
                title={t('parking.parkingStatus')}
                data={parkingData}
                innerRadius="50%"
                outerRadius="75%"
              />
            </Col>
            <Col xs={24} lg={16}>
              <BarChart
                title={t('parking.hourlyTraffic')}
                categories={hourlyData}
                data={hourlyVehicles}
                color="#1890ff"
              />
            </Col>
          </Row>

          {/* Zones + Recent */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    {t('parking.parkingZones')}
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                {parkingZones.map((zone) => {
                  const percent = Math.round((zone.used / zone.total) * 100)
                  return (
                    <div key={zone.name} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 13 }}>{zone.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {zone.used}/{zone.total} ({percent}%)
                        </Text>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={percent > 80 ? '#f5222d' : percent > 60 ? '#faad14' : '#52c41a'}
                        trailColor="#f0f0f0"
                        strokeWidth={8}
                        style={{ borderRadius: 4 }}
                      />
                    </div>
                  )
                })}
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    {t('parking.recentVehicles')}
                  </span>
                }
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <Table
                  columns={columns}
                  dataSource={filteredVehicles.slice(0, 5)}
                  pagination={false}
                  size="small"
                  style={{ borderRadius: 8 }}
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        /* Vehicles view - full table */
        <Card
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CarOutlined style={{ color: '#1890ff' }} />
              {t('parking.recentVehicles')}
            </span>
          }
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Table
            columns={columns}
            dataSource={filteredVehicles}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${t('common.total')}: ${total}` }}
            size="middle"
            style={{ borderRadius: 8 }}
          />
        </Card>
      )}
    </div>
  )
}
