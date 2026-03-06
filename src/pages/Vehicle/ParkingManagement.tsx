import { useState, useEffect } from 'react'
import { Row, Col, Typography, Progress, Segmented, Spin, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CarOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  DollarOutlined,
  LoginOutlined,
  LogoutOutlined,
  WarningOutlined,
  RiseOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import {
  ContentCard,
  StatCard,
  BarChart,
} from '@/components'
import { useBuildingStore } from '@/stores'
import { parkingDashboardApi } from '@/services'
import type { ParkingDashboardStats, ParkingDashboardTraffic, ParkingDashboardRevenue, ParkingZone } from '@/services'
import dayjs from 'dayjs'
import {
  getVehicleRecentVehicles,
} from '@/services/mockPersistence'

const { Title, Text } = Typography

const DEFAULT_ZONES = [
  { name: 'Zone A', total: 20, used: 18, color: '#f5222d' },
  { name: 'Zone B', total: 15, used: 12, color: '#1890ff' },
  { name: 'Zone C', total: 16, used: 10, color: '#52c41a' },
  { name: 'Zone D', total: 10, used: 5, color: '#faad14' },
]

const DEFAULT_HOURLY = [4, 3, 2, 1, 1, 2, 6, 12, 20, 26, 31, 28, 24, 22, 27, 33, 38, 30, 23, 18, 12, 9, 7, 5, 3]
const DEFAULT_REVENUE_DAY = [12000, 8000, 5000, 3000, 2000, 4000, 18000, 45000, 72000, 85000, 68000, 55000, 62000, 58000, 71000, 89000, 95000, 78000, 52000, 38000, 28000, 22000, 18000, 15000]

export default function ParkingManagement() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const buildingId = selectedBuilding?.id ?? undefined

  const [apiStats, setApiStats] = useState<ParkingDashboardStats | null>(null)
  const [apiTrafficDay, setApiTrafficDay] = useState<ParkingDashboardTraffic | null>(null)
  const [apiTrafficMonth, setApiTrafficMonth] = useState<ParkingDashboardTraffic | null>(null)
  const [apiRevenueDay, setApiRevenueDay] = useState<ParkingDashboardRevenue | null>(null)
  const [apiRevenueMonth, setApiRevenueMonth] = useState<ParkingDashboardRevenue | null>(null)
  const [zonesList, setZonesList] = useState<ParkingZone[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSelectedZoneId(undefined)
    parkingDashboardApi
      .getZonesList({ building_id: buildingId ?? null, limit: 500 })
      .then((res) => setZonesList(res.items ?? []))
      .catch(() => setZonesList([]))
  }, [buildingId])

  useEffect(() => {
    const params: { building_id?: string; parking_zone_id?: string } = {}
    if (buildingId) params.building_id = buildingId
    if (selectedZoneId) params.parking_zone_id = selectedZoneId
    const hasParams = !!params.building_id || !!params.parking_zone_id
    setLoading(true)
    Promise.all([
      parkingDashboardApi.getStats(hasParams ? params : undefined),
      parkingDashboardApi.getTraffic({ ...params, period: 'day' }),
      parkingDashboardApi.getTraffic({ ...params, period: 'month' }),
      parkingDashboardApi.getRevenue({ ...params, period: 'day' }),
      parkingDashboardApi.getRevenue({ ...params, period: 'month' }),
    ])
      .then(([stats, trafficDay, trafficMonth, revenueDay, revenueMonth]) => {
        setApiStats(stats)
        setApiTrafficDay(trafficDay)
        setApiTrafficMonth(trafficMonth)
        setApiRevenueDay(revenueDay)
        setApiRevenueMonth(revenueMonth)
      })
      .catch(() => {
        setApiStats(null)
        setApiTrafficDay(null)
        setApiTrafficMonth(null)
        setApiRevenueDay(null)
        setApiRevenueMonth(null)
      })
      .finally(() => setLoading(false))
  }, [buildingId, selectedZoneId])

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

  const parkingZones =
    apiStats?.zones?.length ?
      apiStats.zones.map((z) => ({ name: z.name, total: z.total, used: z.used, color: z.color ?? '#1890ff' }))
      : DEFAULT_ZONES

  const totalSpots = apiStats?.total_spots ?? parkingZones.reduce((acc, z) => acc + z.total, 0)
  const usedSpots = apiStats?.used_spots ?? parkingZones.reduce((acc, z) => acc + z.used, 0)
  const availableSpots = apiStats?.available_spots ?? totalSpots - usedSpots
  const usageRate = (apiStats?.usage_rate ?? (totalSpots ? (usedSpots / totalSpots) * 100 : 0)).toFixed(1)
  const selectedDate = dayjs()
  const hourlyData = Array.from({ length: 25 }, (_, hour) => `${hour}h`)
  const isInSelectedDay = (date: string) => dayjs(date).isSame(selectedDate, 'day')
  const isInSelectedMonth = (date: string) => dayjs(date).isSame(selectedDate, 'month')

  const dayInCount = apiTrafficDay?.in_count ?? recentVehicles.filter((v) => v.status === 'in' && isInSelectedDay(v.date)).length
  const dayOutCount = apiTrafficDay?.out_count ?? recentVehicles.filter((v) => v.status === 'out' && isInSelectedDay(v.date)).length
  const monthInCount = apiTrafficMonth?.in_count ?? recentVehicles.filter((v) => v.status === 'in' && isInSelectedMonth(v.date)).length
  const monthOutCount = apiTrafficMonth?.out_count ?? recentVehicles.filter((v) => v.status === 'out' && isInSelectedMonth(v.date)).length

  const [trafficChartMode, setTrafficChartMode] = useState<'day' | 'month'>('day')
  const trafficDayHourly = (apiTrafficDay?.hourly?.length ? apiTrafficDay.hourly : DEFAULT_HOURLY).slice(0, 25)
  const trafficMonthHourly = (apiTrafficMonth?.hourly?.length ? apiTrafficMonth.hourly : []).slice(0, 31)
  const hourlyVehicles = trafficChartMode === 'day' ? trafficDayHourly : trafficMonthHourly.length ? trafficMonthHourly : trafficDayHourly
  const trafficChartCategories = trafficChartMode === 'day' ? hourlyData : Array.from({ length: hourlyVehicles.length }, (_, i) => `${i + 1}`)

  const [revenueMode, setRevenueMode] = useState<'day' | 'month'>('day')

  const revenueDayCategories = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const revenueDayValues = (apiRevenueDay?.series?.length ? apiRevenueDay.series : DEFAULT_REVENUE_DAY).slice(0, 24)
  const revenueMonthCategories = Array.from({ length: 31 }, (_, i) => `${i + 1}`)
  const revenueMonthValues = (apiRevenueMonth?.series?.length ? apiRevenueMonth.series : [
    620000, 580000, 710000, 850000, 920000, 780000, 430000,
    650000, 590000, 730000, 880000, 950000, 810000, 460000,
    680000, 620000, 760000, 910000, 980000, 840000, 490000,
    700000, 640000, 780000, 930000, 1020000, 870000, 510000,
    720000, 660000,
  ]).slice(0, 31)

  const dayRevenue = apiRevenueDay?.total ?? revenueDayValues.reduce((sum, v) => sum + v, 0)
  const monthRevenue = apiRevenueMonth?.total ?? revenueMonthValues.reduce((sum, v) => sum + v, 0)

  return (
    <div className="page-container">
      <Spin spinning={loading} tip={t('common.loading', 'Đang tải...')}>
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Text type="secondary" className="text-sm whitespace-nowrap">{t('parking.filterZone', 'Khu vực')}:</Text>
            <Select
              placeholder={t('parking.selectZone', 'Chọn khu vực')}
              allowClear
              value={selectedZoneId ?? ''}
              onChange={(v) => setSelectedZoneId(v && v !== '' ? v : undefined)}
              options={[
                { value: '', label: t('parking.allZones', 'Tất cả khu vực') },
                ...zonesList.map((z) => ({
                  value: z.id,
                  label: z.name || z.code || z.id,
                })),
              ]}
              style={{ minWidth: 180 }}
            />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} className="mb-20">
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
      <Row gutter={[16, 16]} className="mb-20">
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
        <Col xs={24} lg={12} className="flex">
          <ContentCard
            title={t('parking.hourlyTraffic')}
            titleExtra={
              <Segmented
                value={trafficChartMode}
                onChange={(v) => setTrafficChartMode(v as 'day' | 'month')}
                options={[
                  { label: t('parking.viewDay', 'Ngày'), value: 'day' },
                  { label: t('parking.viewMonth', 'Tháng'), value: 'month' },
                ]}
              />
            }
            className="w-full"
          >
            <BarChart
              title=""
              categories={trafficChartCategories}
              data={hourlyVehicles}
              color="#1890ff"
              height={280}
            />
          </ContentCard>
        </Col>
        <Col xs={24} lg={12} className="flex">
          <ContentCard
            title={t('parking.parkingZones')}
            titleIcon={<EnvironmentOutlined />}
            titleIconColor="#1890ff"
            className="w-full"
          >
            <div className="vehicle_zone-list">
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
            </div>
          </ContentCard>
        </Col>
      </Row>

      <ContentCard
        title={t('parking.revenueTitle', 'Doanh thu')}
        titleIcon={<DollarOutlined />}
        titleIconColor="#52c41a"
      >
        <Row gutter={[12, 12]} className="mb-12">
          <Col xs={24} md={12}>
            <StatCard
              title={t('parking.dayRevenue', 'Doanh thu ngày')}
              value={dayRevenue.toLocaleString('vi-VN')}
              suffix="VND"
              icon={<RiseOutlined />}
              iconBgColor="#52c41a"
            />
          </Col>
          <Col xs={24} md={12}>
            <StatCard
              title={t('parking.monthRevenue', 'Doanh thu tháng')}
              value={monthRevenue.toLocaleString('vi-VN')}
              suffix="VND"
              icon={<CalendarOutlined />}
              iconBgColor="#389e0d"
            />
          </Col>
        </Row>
        <div className="flex-between mb-12">
          <Text strong className="text-15">
            <BarChartOutlined className="mr-6" />
            {revenueMode === 'day'
              ? t('parking.revenueByHour', 'Doanh thu theo giờ (hôm nay)')
              : t('parking.revenueByDayOfMonth', 'Doanh thu theo ngày (tháng này)')}
          </Text>
          <Segmented
            value={revenueMode}
            onChange={(val) => setRevenueMode(val as 'day' | 'month')}
            options={[
              { label: t('parking.viewDay', 'Ngày'), value: 'day' },
              { label: t('parking.viewMonth', 'Tháng'), value: 'month' },
            ]}
          />
        </div>
        <BarChart
          title=""
          categories={revenueMode === 'day' ? revenueDayCategories : revenueMonthCategories}
          data={revenueMode === 'day' ? revenueDayValues : revenueMonthValues}
          color={revenueMode === 'day' ? '#52c41a' : '#1890ff'}
          height={280}
        />
      </ContentCard>
      </Spin>
    </div>
  )
}
