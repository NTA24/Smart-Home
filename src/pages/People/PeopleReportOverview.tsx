import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Typography, Select, DatePicker, Input, Tag, Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  TeamOutlined,
  LoginOutlined,
  LogoutOutlined,
  HistoryOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  StatCard,
  BarChart,
  DataTable,
} from '@/components'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'
import { getPeopleGateHistory, savePeopleGateHistory } from '@/services/mockPersistence'

const { Text } = Typography

export interface PeopleGateRecord {
  key: string
  gateId: string
  gateName: string
  occurredAt: string
  personName: string
  personId: string
  direction: 'in' | 'out'
  method: 'FaceID' | 'card' | 'manual'
}

const GATES = [
  { id: 'gate-1', name: 'Cổng 1 - FaceID' },
  { id: 'gate-2', name: 'Cổng 2 - FaceID' },
  { id: 'gate-3', name: 'Cổng 3 - Cửa quay' },
]

function seedGateHistory(): PeopleGateRecord[] {
  const today = dayjs().format('YYYY-MM-DD')
  const records: PeopleGateRecord[] = []
  const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F', 'Đặng Văn G']
  const ids = ['NV001', 'NV002', 'NV003', 'NV004', 'NV005', 'NV006', 'NV007']
  let key = 1
  for (let h = 7; h <= 18; h++) {
    const count = 2 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const gate = GATES[Math.floor(Math.random() * GATES.length)]
      const dir = Math.random() > 0.5 ? 'in' : 'out'
      const idx = Math.floor(Math.random() * names.length)
      records.push({
        key: `seed-${key++}`,
        gateId: gate.id,
        gateName: gate.name,
        occurredAt: `${today} ${String(h).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
        personName: names[idx],
        personId: ids[idx],
        direction: dir as 'in' | 'out',
        method: Math.random() > 0.2 ? 'FaceID' : 'card',
      })
    }
  }
  return records.sort((a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf())
}

export default function PeopleReportOverview() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [history, setHistory] = useState<PeopleGateRecord[]>(() =>
    getPeopleGateHistory<PeopleGateRecord[]>(seedGateHistory()),
  )
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])
  const [gateFilter, setGateFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<'all' | 'in' | 'out'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'FaceID' | 'card' | 'manual'>('all')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    savePeopleGateHistory(history)
  }, [history])

  const filteredHistory = useMemo(() => {
    return history.filter((row) => {
      const occurred = dayjs(row.occurredAt)
      if (dateRange && (occurred.isBefore(dateRange[0]) || occurred.isAfter(dateRange[1]))) return false
      if (gateFilter !== 'all' && row.gateId !== gateFilter) return false
      if (directionFilter !== 'all' && row.direction !== directionFilter) return false
      if (methodFilter !== 'all' && row.method !== methodFilter) return false
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase()
        if (!row.personName.toLowerCase().includes(k) && !row.personId.toLowerCase().includes(k)) return false
      }
      return true
    })
  }, [history, dateRange, gateFilter, directionFilter, methodFilter, keyword])

  const todayStr = dayjs().format('YYYY-MM-DD')
  const todayIn = useMemo(
    () => history.filter((r) => r.direction === 'in' && r.occurredAt.startsWith(todayStr)).length,
    [history, todayStr],
  )
  const todayOut = useMemo(
    () => history.filter((r) => r.direction === 'out' && r.occurredAt.startsWith(todayStr)).length,
    [history, todayStr],
  )

  const hourlyCategories = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const hourlyIn = useMemo(() => {
    const arr = new Array(24).fill(0)
    filteredHistory
      .filter((r) => r.direction === 'in')
      .forEach((r) => {
        const h = dayjs(r.occurredAt).hour()
        arr[h] += 1
      })
    return arr
  }, [filteredHistory])
  const hourlyOut = useMemo(() => {
    const arr = new Array(24).fill(0)
    filteredHistory
      .filter((r) => r.direction === 'out')
      .forEach((r) => {
        const h = dayjs(r.occurredAt).hour()
        arr[h] += 1
      })
    return arr
  }, [filteredHistory])
  const hourlyTotal = hourlyIn.map((a, i) => a + hourlyOut[i])

  const setQuickDateRange = (preset: 'today' | 'last7' | 'last30') => {
    const end = dayjs().endOf('day')
    if (preset === 'today') setDateRange([dayjs().startOf('day'), end])
    else if (preset === 'last7') setDateRange([dayjs().subtract(6, 'day').startOf('day'), end])
    else setDateRange([dayjs().subtract(29, 'day').startOf('day'), end])
  }

  const exportToCsv = () => {
    const rows = filteredHistory.map((r) => ({
      occurredAt: dayjs(r.occurredAt).format('YYYY-MM-DD HH:mm:ss'),
      gateName: r.gateName,
      personName: r.personName,
      personId: r.personId,
      direction: r.direction === 'in' ? t('peopleReport.entry', 'Vào') : t('peopleReport.exit', 'Ra'),
      method: r.method === 'FaceID' ? 'FaceID' : r.method === 'card' ? t('peopleReport.card', 'Thẻ') : t('peopleReport.manual', 'Thủ công'),
    }))
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `people-gate-history-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      title: t('peopleReport.time', 'Thời gian'),
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('peopleReport.gate', 'Cổng'),
      dataIndex: 'gateName',
      key: 'gateName',
      width: 140,
    },
    {
      title: t('peopleReport.person', 'Người / Mã NV'),
      key: 'person',
      width: 180,
      render: (_: unknown, row: PeopleGateRecord) => (
        <span>
          {row.personName} <Text type="secondary">({row.personId})</Text>
        </span>
      ),
    },
    {
      title: t('peopleReport.direction', 'Hướng'),
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
      render: (v: 'in' | 'out') => (
        <Tag color={v === 'in' ? 'blue' : 'orange'}>
          {v === 'in' ? t('peopleReport.entry', 'Vào') : t('peopleReport.exit', 'Ra')}
        </Tag>
      ),
    },
    {
      title: t('peopleReport.method', 'Phương thức'),
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (v: string) => (v === 'FaceID' ? 'FaceID' : v === 'card' ? t('peopleReport.card', 'Thẻ') : t('peopleReport.manual', 'Thủ công')),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('peopleReport.title', 'Báo cáo tổng quan')}
        icon={<TeamOutlined />}
        subtitle={selectedBuilding?.name || t('peopleReport.subtitle', 'Lịch sử vào ra & lưu lượng qua cổng')}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('peopleReport.todayEntry', 'Lượt vào hôm nay')}
            value={todayIn}
            icon={<LoginOutlined />}
            iconBgColor="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('peopleReport.todayExit', 'Lượt ra hôm nay')}
            value={todayOut}
            icon={<LogoutOutlined />}
            iconBgColor="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title={t('peopleReport.todayTotal', 'Tổng lượt qua cổng hôm nay')}
            value={todayIn + todayOut}
            icon={<HistoryOutlined />}
            iconBgColor="#52c41a"
          />
        </Col>
      </Row>

      <ContentCard
        title={t('peopleReport.trafficByHour', 'Lưu lượng theo giờ')}
        className="mb-16"
      >
        <BarChart
          title=""
          categories={hourlyCategories}
          data={hourlyTotal}
          height={260}
          color="#722ed1"
        />
      </ContentCard>

      <ContentCard
        title={t('peopleReport.historyTitle', 'Lịch sử vào ra')}
        className="mb-16"
      >
        <div className="mb-12 flex flex-wrap items-center gap-8">
          <Space wrap>
            <Button size="small" type={dateRange?.[0]?.isSame(dayjs(), 'day') ? 'primary' : 'default'} onClick={() => setQuickDateRange('today')}>
              {t('peopleReport.today', 'Hôm nay')}
            </Button>
            <Button size="small" type="default" onClick={() => setQuickDateRange('last7')}>
              {t('peopleReport.last7Days', '7 ngày qua')}
            </Button>
            <Button size="small" type="default" onClick={() => setQuickDateRange('last30')}>
              {t('peopleReport.last30Days', '30 ngày qua')}
            </Button>
          </Space>
          <DatePicker.RangePicker
            showTime
            value={dateRange}
            onChange={(value) => setDateRange(value as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          />
          <Select
            value={gateFilter}
            onChange={setGateFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: t('peopleReport.allGates', 'Tất cả cổng') },
              ...GATES.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
          <Select
            value={directionFilter}
            onChange={(value) => setDirectionFilter(value as 'all' | 'in' | 'out')}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: t('common.all', 'Tất cả') },
              { value: 'in', label: t('peopleReport.entry', 'Vào') },
              { value: 'out', label: t('peopleReport.exit', 'Ra') },
            ]}
          />
          <Select
            value={methodFilter}
            onChange={(value) => setMethodFilter(value as 'all' | 'FaceID' | 'card' | 'manual')}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: t('peopleReport.allMethods', 'Tất cả phương thức') },
              { value: 'FaceID', label: 'FaceID' },
              { value: 'card', label: t('peopleReport.card', 'Thẻ') },
              { value: 'manual', label: t('peopleReport.manual', 'Thủ công') },
            ]}
          />
          <Input
            placeholder={t('peopleReport.searchPerson', 'Tên hoặc mã NV')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<ExportOutlined />} onClick={exportToCsv} disabled={filteredHistory.length === 0}>
            {t('peopleReport.export', 'Xuất file')}
          </Button>
        </div>
        <DataTable
          columns={columns}
          dataSource={filteredHistory}
          pageSize={10}
          total={filteredHistory.length}
          size="small"
          scroll={{ x: 720 }}
        />
      </ContentCard>
    </PageContainer>
  )
}
