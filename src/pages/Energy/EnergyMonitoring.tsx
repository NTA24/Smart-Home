import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Card, Typography, Select, DatePicker, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import { ThunderboltOutlined, CloudOutlined, BulbOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard, DataTable, LineChart, BarChart, GaugeChart } from '@/components'
import dayjs from 'dayjs'
import { getEnergyMonitoringFilters, saveEnergyMonitoringFilters } from '@/services/mockPersistence'

const { Text } = Typography
const { RangePicker } = DatePicker

type MonitoringFilters = {
  building: 'all' | 'a' | 'b'
  range?: [dayjs.Dayjs, dayjs.Dayjs]
}

type PersistedMonitoringFilters = {
  building: 'all' | 'a' | 'b'
  range?: [string, string]
}

interface ConsumptionRow {
  key: string
  area: string
  today: number
  week: number
  month: number
  change: string
  measuredAt: string
}

function toPersistedFilters(filters: MonitoringFilters): PersistedMonitoringFilters {
  return {
    building: filters.building,
    range: filters.range?.[0] && filters.range?.[1]
      ? [filters.range[0].toISOString(), filters.range[1].toISOString()]
      : undefined,
  }
}

function toMonitoringFilters(filters: PersistedMonitoringFilters): MonitoringFilters {
  return {
    building: filters.building || 'all',
    range: filters.range?.[0] && filters.range?.[1]
      ? [dayjs(filters.range[0]), dayjs(filters.range[1])]
      : undefined,
  }
}

export default function EnergyMonitoring() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<MonitoringFilters>({ building: 'all' })

  useEffect(() => {
    const saved = getEnergyMonitoringFilters<PersistedMonitoringFilters>({ building: 'all' })
    setFilters(toMonitoringFilters(saved))
  }, [])

  const hourlyCategories = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
  const hourlySeries = [{ name: t('energy.todayConsumption'), data: [150, 120, 100, 130, 450, 800, 950, 1100, 900, 700, 500, 300], color: '#1890ff' }]

  const monthlyCategories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const monthlySeries = [
    { name: '2026', data: [45000, 42000, 38000, 35000, 40000, 55000, 65000, 70000, 60000, 50000, 45000, 48000], color: '#1890ff' },
    { name: '2025', data: [50000, 48000, 45000, 42000, 47000, 60000, 72000, 78000, 68000, 55000, 50000, 52000], color: '#52c41a' },
  ]

  const consumptionData: ConsumptionRow[] = [
    { key: '1', area: 'Building A - Office', today: 120.5, week: 845.2, month: 3650.2, change: '+5.2%', measuredAt: '2026-02-18' },
    { key: '2', area: 'Building B - Production', today: 89.3, week: 625.1, month: 2840.8, change: '-2.1%', measuredAt: '2026-02-19' },
    { key: '3', area: 'Building C - Warehouse', today: 45.2, week: 316.4, month: 1380.5, change: '+1.5%', measuredAt: '2026-02-20' },
    { key: '4', area: 'Building D - Service', today: 32.8, week: 229.6, month: 980.3, change: '-3.8%', measuredAt: '2026-02-21' },
    { key: '5', area: 'Public Lighting', today: 15.6, week: 109.2, month: 468.2, change: '0%', measuredAt: '2026-02-22' },
  ]

  const columns = [
    { title: t('energy.area'), dataIndex: 'area', key: 'area' },
    { title: `${t('energy.today')} (kWh)`, dataIndex: 'today', key: 'today', render: (val: number) => val.toFixed(1) },
    { title: `${t('energy.thisWeek')} (kWh)`, dataIndex: 'week', key: 'week', render: (val: number) => val.toFixed(1) },
    { title: `${t('energy.thisMonth')} (kWh)`, dataIndex: 'month', key: 'month', render: (val: number) => val.toLocaleString() },
    { title: t('energy.vsPrevious'), dataIndex: 'change', key: 'change', render: (val: string) => <span className={val.startsWith('+') ? 'text-danger' : val.startsWith('-') ? 'text-success' : 'text-secondary'}>{val}</span> },
  ]

  const filteredConsumptionData = useMemo(() => {
    return consumptionData.filter((item) => {
      const matchesBuilding = filters.building === 'all'
        || (filters.building === 'a' && item.area.toLowerCase().includes('building a'))
        || (filters.building === 'b' && item.area.toLowerCase().includes('building b'))

      const measuredAt = dayjs(item.measuredAt, 'YYYY-MM-DD')
      const matchesRange = !filters.range?.[0] || !filters.range?.[1]
        || (
          measuredAt.isValid()
          && !measuredAt.isBefore(filters.range[0], 'day')
          && !measuredAt.isAfter(filters.range[1], 'day')
        )

      return matchesBuilding && matchesRange
    })
  }, [filters.building, filters.range, consumptionData])

  const areaChartCategories = filteredConsumptionData.map((item) => item.area)
  const areaChartData = filteredConsumptionData.map((item) => item.month)

  const totalToday = filteredConsumptionData.reduce((sum, item) => sum + item.today, 0)
  const airConditioningValue = filteredConsumptionData
    .filter((item) => item.area.toLowerCase().includes('building'))
    .reduce((sum, item) => sum + item.today, 0)
  const lightingValue = filteredConsumptionData
    .filter((item) => item.area.toLowerCase().includes('lighting'))
    .reduce((sum, item) => sum + item.today, 0)
  const currentPower = totalToday > 0 ? totalToday / 24 : 0

  const handleBuildingChange = (value: 'all' | 'a' | 'b') => {
    const nextFilters = { ...filters, building: value }
    setFilters(nextFilters)
    saveEnergyMonitoringFilters(toPersistedFilters(nextFilters))
  }

  const handleRangeChange = (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    const nextFilters: MonitoringFilters = {
      ...filters,
      range: value?.[0] && value?.[1] ? [value[0], value[1]] : undefined,
    }
    setFilters(nextFilters)
    saveEnergyMonitoringFilters(toPersistedFilters(nextFilters))
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('energy.title')}
        actions={
          <>
            <Select value={filters.building} className="energy_input-w180" onChange={handleBuildingChange}>
              <Select.Option value="all">All Buildings</Select.Option>
              <Select.Option value="a">Building A</Select.Option>
              <Select.Option value="b">Building B</Select.Option>
            </Select>
            <RangePicker value={filters.range} onChange={handleRangeChange} />
          </>
        }
      />

      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div className="energy_stat-row">
              <div className="energy_stat-icon-box" style={{ background: '#faad14' }}>
                <ThunderboltOutlined className="energy_stat-icon" />
              </div>
              <Statistic title={t('energy.currentPower')} value={Number(currentPower.toFixed(2))} suffix="kW/h" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div className="energy_stat-row">
              <div className="energy_stat-icon-box" style={{ background: '#1890ff' }}>
                <ThunderboltOutlined className="energy_stat-icon" />
              </div>
              <Statistic title={t('energy.todayConsumption')} value={Number(totalToday.toFixed(1))} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div className="energy_stat-row">
              <div className="energy_stat-icon-box" style={{ background: '#52c41a' }}>
                <CloudOutlined className="energy_stat-icon" />
              </div>
              <Statistic title={t('energy.airConditioning')} value={Number(airConditioningValue.toFixed(1))} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <div className="energy_stat-row">
              <div className="energy_stat-icon-box" style={{ background: '#722ed1' }}>
                <BulbOutlined className="energy_stat-icon" />
              </div>
              <Statistic title={t('energy.lighting')} value={Number(lightingValue.toFixed(1))} suffix="kWh" valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} lg={16}>
          <LineChart title={t('energy.dailyChart')} categories={hourlyCategories} series={hourlySeries} height={280} showArea />
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('energy.efficiency')} bordered={false}>
            <GaugeChart title="" value={72} height={200} color="#52c41a" />
            <div className="text-center mt-n20">
              <Text type="secondary">{t('energy.efficiency')}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} lg={12}>
          <LineChart title={t('energy.monthlyComparison')} categories={monthlyCategories} series={monthlySeries} height={280} />
        </Col>
        <Col xs={24} lg={12}>
          <BarChart title={t('energy.areaConsumption')} categories={areaChartCategories} data={areaChartData} height={280} color="#1890ff" />
        </Col>
      </Row>

      <ContentCard title={t('energy.areaDetails')}>
        <DataTable columns={columns} dataSource={filteredConsumptionData} pagination={false} />
      </ContentCard>
    </PageContainer>
  )
}
