import { useEffect, useMemo, useState } from 'react'
import { Table, Button, Space, Avatar, Tag, Badge, Input, Select, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import { BellOutlined, UserOutlined, MailOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { PageContainer, ContentCard } from '@/components'

const MOCK_LOGS = [
  { key: '1', date: '2026-02-25', name: 'Linh Tran', subText: 'Rapid visit', accessPoint: 'Lobby Gate', credential: 'Mobile Key', credentialId: 'RFID Card', status: 'success', time: '13:50' },
  { key: '2', date: '2026-02-25', name: 'Nguyễn Văn A', subText: 'Tenant', accessPoint: 'Elevator Panel', credential: 'Mobile Key', credentialId: 'MPRO-0080', status: 'success', time: '23:10' },
  { key: '3', date: '2026-02-25', name: 'Delivery (GHN)', subText: 'Visitor', accessPoint: 'Parking Barrier', credential: 'Badge', credentialId: 'RE6122034', status: 'default', time: '10:00' },
  { key: '4', date: '2026-02-25', name: 'Linh Tran', subText: 'Employee', accessPoint: 'Floor 15', credential: 'Mobile Key', credentialId: 'MBOIB Card', status: 'processing', time: '19:05' },
  { key: '5', date: '2026-02-24', name: 'Trần Văn B', subText: 'Tenant', accessPoint: 'Lobby Gate', credential: 'Mobile Key', credentialId: 'RFID Card', status: 'success', time: '08:30' },
  { key: '6', date: '2026-02-23', name: 'Linh Tran', subText: 'Employee', accessPoint: 'Elevator Panel', credential: 'Badge', credentialId: 'RE6122035', status: 'success', time: '14:20' },
]

const CREDENTIAL_LABEL_KEY: Record<string, string> = {
  'Mobile Key': 'accessLogs.credentialMobileKey',
  'Badge': 'accessLogs.credentialBadge',
}

const ACCESS_POINT_LABEL_KEY: Record<string, string> = {
  'Lobby Gate': 'accessLogs.accessPointLobbyGate',
  'Elevator Panel': 'accessLogs.accessPointElevatorPanel',
  'Parking Barrier': 'accessLogs.accessPointParkingBarrier',
  'Floor 15': 'accessLogs.accessPointFloor15',
}

const SUBTEXT_LABEL_KEY: Record<string, string> = {
  'Rapid visit': 'accessLogs.rapidVisit',
  'Tenant': 'accessLogs.tenant',
  'Visitor': 'accessLogs.visitor',
  'Employee': 'accessLogs.employee',
}

export default function AccessLogs() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [nameSearch, setNameSearch] = useState('')
  const [accessPointFilter, setAccessPointFilter] = useState<string>('all')
  const [credentialFilter, setCredentialFilter] = useState<string>('all')

  const uniqueAccessPoints = useMemo(() => [...new Set(MOCK_LOGS.map((r) => r.accessPoint))], [])
  const uniqueCredentials = useMemo(() => [...new Set(MOCK_LOGS.map((r) => r.credential))], [])

  useEffect(() => {
    setPage(1)
  }, [nameSearch, dateRange, accessPointFilter, credentialFilter])

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((row) => {
      if (nameSearch.trim()) {
        const q = nameSearch.trim().toLowerCase()
        if (!row.name.toLowerCase().includes(q) && !row.subText.toLowerCase().includes(q)) return false
      }
      if (dateRange?.[0] && dateRange?.[1]) {
        const rowDate = dayjs(row.date)
        if (rowDate.isBefore(dateRange[0], 'day') || rowDate.isAfter(dateRange[1], 'day')) return false
      }
      if (accessPointFilter !== 'all' && row.accessPoint !== accessPointFilter) return false
      if (credentialFilter !== 'all' && row.credential !== credentialFilter) return false
      return true
    })
  }, [nameSearch, dateRange, accessPointFilter, credentialFilter])

  const pageSize = 10
  const paginatedLogs = useMemo(
    () => filteredLogs.slice((page - 1) * pageSize, page * pageSize),
    [filteredLogs, page]
  )

  const columns = [
    {
      title: t('accessLogs.date', 'Date'),
      dataIndex: 'date',
      key: 'date',
      width: 110,
    },
    {
      title: t('accessLogs.name', 'Name'),
      key: 'name',
      width: 200,
      render: (_: unknown, r: (typeof MOCK_LOGS)[0]) => (
        <div className="flex items-center gap-8">
          <Avatar size="small" icon={<UserOutlined />} className="flex-shrink-0" />
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-secondary">{t(SUBTEXT_LABEL_KEY[r.subText] || r.subText)}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('accessLogs.accessPoint', 'Access Point'),
      dataIndex: 'accessPoint',
      key: 'accessPoint',
      width: 140,
      render: (val: string) => t(ACCESS_POINT_LABEL_KEY[val] || val),
    },
    {
      title: t('accessLogs.credential', 'Credential'),
      key: 'credential',
      width: 180,
      render: (_: unknown, r: (typeof MOCK_LOGS)[0]) => (
        <div className="flex items-center gap-8">
          <span>{t(CREDENTIAL_LABEL_KEY[r.credential] || r.credential)}</span>
          <Tag color={r.status === 'success' ? 'green' : r.status === 'processing' ? 'blue' : 'default'} className="m-0">
            {r.credentialId}
          </Tag>
        </div>
      ),
    },
    {
      title: t('accessLogs.expirationVar', 'Time'),
      key: 'time',
      width: 90,
      render: (_: unknown, r: (typeof MOCK_LOGS)[0]) => `${r.time}`,
    },
    {
      key: 'action',
      width: 48,
      render: () => <Button type="text" size="small" icon={<RightOutlined />} />,
    },
  ]

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-xl font-semibold m-0">{t('accessLogs.title', 'Access Logs')}</h1>
        <Space size="middle">
          <Button type="text" icon={<BellOutlined />} />
          <Button type="text" icon={<UserOutlined />} />
          <Button type="text" icon={<MailOutlined />} />
          <Badge count={94} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
          <Avatar size="small" icon={<UserOutlined />} />
        </Space>
      </div>

      <ContentCard>
        <div className="mb-12 flex flex-wrap items-center gap-8">
          <Input
            placeholder={t('accessLogs.searchName', 'Search by name')}
            prefix={<SearchOutlined />}
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates ?? null)}
            placeholder={[t('accessLogs.dateRangePlaceholder', 'Select date range'), t('accessLogs.dateRangePlaceholder', 'Select date range')]}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={accessPointFilter}
            onChange={setAccessPointFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: t('accessLogs.allAccessPoints', 'All Access Points') },
              ...uniqueAccessPoints.map((p) => ({ value: p, label: t(ACCESS_POINT_LABEL_KEY[p] || p) })),
            ]}
          />
          <Select
            value={credentialFilter}
            onChange={setCredentialFilter}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: t('accessLogs.allCredentials', 'All Credentials') },
              ...uniqueCredentials.map((c) => ({ value: c, label: t(CREDENTIAL_LABEL_KEY[c] || c) })),
            ]}
          />
        </div>
        <Table
          size="middle"
          columns={columns}
          dataSource={paginatedLogs}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: filteredLogs.length,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (total) => t('accessLogs.result', 'Result') + `: ${total}`,
          }}
        />
      </ContentCard>
    </PageContainer>
  )
}
