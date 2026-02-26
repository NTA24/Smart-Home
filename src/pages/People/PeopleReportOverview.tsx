import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Typography, Select, DatePicker, Input, Tag, Button, Modal } from 'antd'
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

export type PersonType = 'resident' | 'stranger'

export interface PeopleGateRecord {
  key: string
  gateId: string
  gateName: string
  occurredAt: string
  personName: string
  personId: string
  direction: 'in' | 'out'
  method: 'FaceID' | 'card' | 'manual'
  personType?: PersonType
}

const GATES = [
  { id: 'gate-1', name: 'Cổng 1 - FaceID' },
  { id: 'gate-2', name: 'Cổng 2 - FaceID' },
  { id: 'gate-3', name: 'Cổng 3 - Cửa quay' },
]

const RESIDENTS = [
  { name: 'Nguyễn Văn A', id: 'NV001' },
  { name: 'Trần Thị B', id: 'NV002' },
  { name: 'Lê Văn C', id: 'NV003' },
  { name: 'Phạm Thị D', id: 'NV004' },
  { name: 'Hoàng Văn E', id: 'NV005' },
  { name: 'Vũ Thị F', id: 'NV006' },
  { name: 'Đặng Văn G', id: 'NV007' },
]

const STRANGERS = [
  { name: 'Bùi Minh Tuấn', id: 'KL001' },
  { name: 'Đỗ Thị Hương', id: 'KL002' },
  { name: 'Trương Quốc Bảo', id: 'KL003' },
  { name: 'Lý Thị Mai', id: 'KL004' },
]

const HOURLY_PATTERN = [1, 1, 0, 0, 1, 2, 5, 12, 15, 10, 7, 6, 8, 7, 9, 11, 14, 12, 8, 5, 3, 2, 1, 1]
const FACE_IMAGES = [
  '/security-faces/stored-face-1.png',
  '/security-faces/stored-face-2.png',
  '/security-faces/stored-face-3.png',
  '/security-faces/stored-face-4.png',
  '/security-faces/stored-face-5.png',
  '/security-faces/stored-face-6.png',
  '/security-faces/stored-face-7.png',
]

function seedGateHistory(): PeopleGateRecord[] {
  const today = dayjs().format('YYYY-MM-DD')
  const records: PeopleGateRecord[] = []
  let key = 1

  for (let h = 0; h < 24; h++) {
    const base = HOURLY_PATTERN[h]
    const residentIn = Math.max(0, base + Math.floor(Math.random() * 3) - 1)
    const residentOut = Math.max(0, base + Math.floor(Math.random() * 3) - 1)
    const strangerIn = Math.max(0, Math.floor(base * 0.4) + Math.floor(Math.random() * 2))
    const strangerOut = Math.max(0, Math.floor(base * 0.3) + Math.floor(Math.random() * 2))

    const addRecords = (count: number, dir: 'in' | 'out', type: 'resident' | 'stranger') => {
      const pool = type === 'resident' ? RESIDENTS : STRANGERS
      for (let i = 0; i < count; i++) {
        const gate = GATES[Math.floor(Math.random() * GATES.length)]
        const p = pool[Math.floor(Math.random() * pool.length)]
        records.push({
          key: `seed-${key++}`,
          gateId: gate.id,
          gateName: gate.name,
          occurredAt: `${today} ${String(h).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
          personName: p.name,
          personId: p.id,
          direction: dir,
          method: type === 'resident' ? (Math.random() > 0.2 ? 'FaceID' : 'card') : (Math.random() > 0.3 ? 'manual' : 'card'),
          personType: type,
        })
      }
    }

    addRecords(residentIn, 'in', 'resident')
    addRecords(residentOut, 'out', 'resident')
    addRecords(strangerIn, 'in', 'stranger')
    addRecords(strangerOut, 'out', 'stranger')
  }
  return records.sort((a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf())
}

export default function PeopleReportOverview() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [history] = useState<PeopleGateRecord[]>(() => {
    const cached = getPeopleGateHistory<PeopleGateRecord>(seedGateHistory())
    const hasTypes = cached.some((r) => r.personType === 'stranger')
    return hasTypes ? cached : seedGateHistory()
  })
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])
  const [gateFilter, setGateFilter] = useState<string>('all')
  const [directionFilter, setDirectionFilter] = useState<'all' | 'in' | 'out'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'FaceID' | 'card' | 'manual'>('all')
  const [keyword, setKeyword] = useState('')
  const [previewFace, setPreviewFace] = useState<{ src: string; name: string } | null>(null)

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

  const hourlyByDirectionAndType = useMemo(() => {
    const inResident = new Array(24).fill(0)
    const inStranger = new Array(24).fill(0)
    const outResident = new Array(24).fill(0)
    const outStranger = new Array(24).fill(0)
    filteredHistory.forEach((r) => {
      const h = dayjs(r.occurredAt).hour()
      const type = r.personType === 'stranger' ? 'stranger' : 'resident'
      if (r.direction === 'in') {
        if (type === 'resident') inResident[h] += 1
        else inStranger[h] += 1
      } else {
        if (type === 'resident') outResident[h] += 1
        else outStranger[h] += 1
      }
    })
    return { inResident, inStranger, outResident, outStranger }
  }, [filteredHistory])


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
      title: t('peopleReport.image', 'Hình ảnh'),
      key: 'image',
      width: 86,
      render: (_: unknown, row: PeopleGateRecord) => {
        let h = 0
        const seed = `${row.personId}-${row.key}`
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
        const src = FACE_IMAGES[h % FACE_IMAGES.length]
        return (
          <button
            type="button"
            onClick={() => setPreviewFace({ src, name: row.personName })}
            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
          >
            <img
              src={src}
              alt={row.personName}
              style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', border: '1px solid #f0f0f0' }}
            />
          </button>
        )
      },
    },
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
    {
      title: t('peopleReport.personType', 'Loại'),
      dataIndex: 'personType',
      key: 'personType',
      width: 120,
      render: (v: PersonType) => (
        <Tag color={v === 'resident' ? 'blue' : 'red'}>
          {v === 'resident' ? t('peopleReport.resident', 'Cư dân') : t('peopleReport.stranger', 'Khách lạ')}
        </Tag>
      ),
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

      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} lg={12}>
          <ContentCard
            title={t('peopleReport.trafficIn', 'Lưu lượng vào')}
            titleIcon={<LoginOutlined />}
            titleIconColor="#1890ff"
            className="people-traffic-card mb-0"
          >
            <BarChart
              title=""
              categories={hourlyCategories}
              height={260}
              series={[
                { name: t('peopleReport.resident', 'Cư dân'), data: hourlyByDirectionAndType.inResident, color: '#1890ff' },
                { name: t('peopleReport.stranger', 'Khách lạ'), data: hourlyByDirectionAndType.inStranger, color: '#ff4d4f' },
              ]}
            />
          </ContentCard>
        </Col>
        <Col xs={24} lg={12}>
          <ContentCard
            title={t('peopleReport.trafficOut', 'Lưu lượng ra')}
            titleIcon={<LogoutOutlined />}
            titleIconColor="#fa8c16"
            className="people-traffic-card mb-0"
          >
            <BarChart
              title=""
              categories={hourlyCategories}
              height={260}
              series={[
                { name: t('peopleReport.resident', 'Cư dân'), data: hourlyByDirectionAndType.outResident, color: '#1890ff' },
                { name: t('peopleReport.stranger', 'Khách lạ'), data: hourlyByDirectionAndType.outStranger, color: '#ff4d4f' },
              ]}
            />
          </ContentCard>
        </Col>
      </Row>

      <ContentCard
        title={t('peopleReport.historyTitle', 'Lịch sử vào ra')}
        className="mb-16"
      >
        <div className="mb-12 flex flex-wrap items-center gap-8">
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
          scroll={{ x: 780 }}
        />
      </ContentCard>

      <Modal
        title={previewFace?.name ?? t('peopleReport.imagePreview', 'Xem ảnh người')}
        open={!!previewFace}
        onCancel={() => setPreviewFace(null)}
        footer={null}
        width={360}
        centered
      >
        {previewFace && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <img
              src={previewFace.src}
              alt={previewFace.name}
              style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 10, objectFit: 'contain' }}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
