import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Typography, Progress, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  DollarOutlined,
  LoginOutlined,
  LogoutOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  ContentCard,
  StatCard,
  PieChart,
  BarChart,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleManagementFilters,
  getVehicleRecentVehicles,
  saveVehicleManagementFilters,
} from '@/services/mockPersistence'

const { Title, Text } = Typography

export default function ParkingManagement() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const persistedFilters = getVehicleManagementFilters<{
    dateRange: [string, string] | null
  }>({
    dateRange: null,
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    persistedFilters.dateRange?.[0] && persistedFilters.dateRange?.[1]
      ? [dayjs(persistedFilters.dateRange[0]), dayjs(persistedFilters.dateRange[1])]
      : null,
  )

  const parkingData = [
    { name: t('parking.usedSpots'), value: 45 },
    { name: t('parking.availableSpots'), value: 16 },
  ]

  const recentVehicleSeed = [
    { key: '1', plate: '30A-123.45', type: 'car', time: '08:30:25', date: dayjs().format('YYYY-MM-DD'), status: 'in', zone: 'Zone A', fee: 0 },
    { key: '2', plate: '29B-456.78', type: 'car', time: '10:25:10', date: dayjs().format('YYYY-MM-DD'), status: 'out', zone: 'Zone B', fee: 45000 },
    { key: '3', plate: '30G-789.01', type: 'motorcycle', time: '11:20:45', date: dayjs().format('YYYY-MM-DD'), status: 'in', zone: 'Zone A', fee: 0 },
    { key: '4', plate: '30A-234.56', type: 'car', time: '12:15:30', date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), status: 'out', zone: 'Zone C', fee: 55000 },
    { key: '5', plate: '29C-567.89', type: 'motorcycle', time: '13:10:15', date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), status: 'out', zone: 'Zone D', fee: 12000 },
    { key: '6', plate: '30H-111.22', type: 'car', time: '15:05:00', date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'), status: 'in', zone: 'Zone B', fee: 0 },
    { key: '7', plate: '29A-333.44', type: 'motorcycle', time: '17:58:30', date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), status: 'out', zone: 'Zone A', fee: 10000 },
    { key: '8', plate: '30B-555.66', type: 'car', time: '19:50:12', date: dayjs().subtract(10, 'day').format('YYYY-MM-DD'), status: 'out', zone: 'Zone C', fee: 38000 },
  ]

  const [recentVehicles] = useState(() => getVehicleRecentVehicles(recentVehicleSeed))

  useEffect(() => {
    saveVehicleManagementFilters({
      dateRange: dateRange ? [dateRange[0].toISOString(), dateRange[1].toISOString()] : null,
    })
  }, [dateRange])

  const filteredVehicles = useMemo(() => recentVehicles.filter((vehicle) => {
    if (!dateRange) return true
    const d = dayjs(vehicle.date)
    return !(d.isBefore(dateRange[0], 'day') || d.isAfter(dateRange[1], 'day'))
  }), [recentVehicles, dateRange])

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
  const selectedDate = dateRange?.[1] ?? dayjs()
  const hourlyData = Array.from({ length: 25 }, (_, hour) => `${hour}h`)
  const isInSelectedDay = (date: string) => dayjs(date).isSame(selectedDate, 'day')
  const isInSelectedMonth = (date: string) => dayjs(date).isSame(selectedDate, 'month')
  const hourlyVehicles = [4, 3, 2, 1, 1, 2, 6, 12, 20, 26, 31, 28, 24, 22, 27, 33, 38, 30, 23, 18, 12, 9, 7, 5, 3]
  const revenueCategories = ['00-06', '06-12', '12-18', '18-24']
  const revenueValues = [180000, 320000, 280000, 240000]
  const dayInCount = filteredVehicles.filter(v => v.status === 'in' && isInSelectedDay(v.date)).length
  const dayOutCount = filteredVehicles.filter(v => v.status === 'out' && isInSelectedDay(v.date)).length
  const monthInCount = filteredVehicles.filter(v => v.status === 'in' && isInSelectedMonth(v.date)).length
  const monthOutCount = filteredVehicles.filter(v => v.status === 'out' && isInSelectedMonth(v.date)).length
  const dayRevenue = revenueValues.reduce((sum, value) => sum + value, 0)
  const monthRevenue = 18450000

  return (
    <div className="page-container">
      {/* Header */}
      <div className="camera_header">
        <div>
          <Title level={4} className="m-0 flex items-center gap-8">
            <CarOutlined />
            {t('parking.title')}
          </Title>
          <Text type="secondary" className="text-sm">
            {selectedBuilding?.name || t('parking.allSites')} — {usedSpots}/{totalSpots} {t('parking.spotsUsed')}
          </Text>
        </div>

        <div className="flex items-center gap-10 flex-wrap">
          <DatePicker.RangePicker value={dateRange} onChange={(value) => setDateRange(value as [dayjs.Dayjs, dayjs.Dayjs] | null)} />
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

      {/* Day/Month traffic and revenue */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.inCountDay', 'Lượt vào (ngày)')}
            value={dayInCount}
            icon={<LoginOutlined />}
            iconBgColor="#13c2c2"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.outCountDay', 'Lượt ra (ngày)')}
            value={dayOutCount}
            icon={<LogoutOutlined />}
            iconBgColor="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.inCountMonth', 'Lượt vào (tháng)')}
            value={monthInCount}
            icon={<LoginOutlined />}
            iconBgColor="#2f54eb"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={t('parking.outCountMonth', 'Lượt ra (tháng)')}
            value={monthOutCount}
            icon={<LogoutOutlined />}
            iconBgColor="#722ed1"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-20" align="stretch">
        <Col xs={24} lg={8} style={{ display: 'flex' }}>
          <PieChart
            title={t('parking.parkingStatus')}
            data={parkingData}
            height={360}
            innerRadius="50%"
            outerRadius="75%"
            centerText={`${usageRate}%`}
            cardStyle={{ width: '100%', height: '100%' }}
          />
        </Col>
        <Col xs={24} lg={16} style={{ display: 'flex' }}>
          <ContentCard
            title={t('parking.revenueTitle', 'Doanh thu')}
            titleIcon={<DollarOutlined />}
            titleIconColor="#52c41a"
            style={{ width: '100%', height: '100%' }}
          >
            <Row gutter={[12, 12]} className="mb-12">
              <Col xs={24} md={12}>
                <StatCard
                  title={t('parking.dayRevenue', 'Doanh thu ngày')}
                  value={dayRevenue.toLocaleString('vi-VN')}
                  suffix="VND"
                  icon={<DollarOutlined />}
                  iconBgColor="#52c41a"
                />
              </Col>
              <Col xs={24} md={12}>
                <StatCard
                  title={t('parking.monthRevenue', 'Doanh thu tháng')}
                  value={monthRevenue.toLocaleString('vi-VN')}
                  suffix="VND"
                  icon={<DollarOutlined />}
                  iconBgColor="#389e0d"
                />
              </Col>
            </Row>
            <BarChart
              title={t('parking.revenueByDay', 'Doanh thu theo khung giờ')}
              categories={revenueCategories}
              data={revenueValues}
              color="#52c41a"
              height={260}
            />
          </ContentCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <BarChart
            title={t('parking.hourlyTraffic')}
            categories={hourlyData}
            data={hourlyVehicles}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} lg={12}>
          <ContentCard
            title={t('parking.parkingZones')}
            titleIcon={<EnvironmentOutlined />}
            titleIconColor="#1890ff"
          >
            {parkingZones.map((zone) => {
              const percent = Math.round((zone.used / zone.total) * 100)
              return (
                <div key={zone.name} className="vehicle_zone-row">
                  <div className="vehicle_zone-header">
                    <Text strong className="vehicle_zone-name">{zone.name}</Text>
                    <Text type="secondary" className="text-sm">
                      {zone.used}/{zone.total} ({percent}%)
                    </Text>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={percent > 80 ? '#f5222d' : percent > 60 ? '#faad14' : '#52c41a'}
                    trailColor="#f0f0f0"
                    strokeWidth={8}
                    className="rounded-4"
                  />
                </div>
              )
            })}
          </ContentCard>
        </Col>
      </Row>
    </div>
  )
}
