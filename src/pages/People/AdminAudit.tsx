import { useMemo, useState } from 'react'
import { Table, Select, Input, Button, Space, Avatar, Tabs } from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  BellOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { PageContainer, ContentCard } from '@/components'

const MOCK_AUDIT = [
  { key: '1', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail1', timestamp: '2026-02-25 08:10' },
  { key: '2', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail2', timestamp: '2026-02-25 02:18' },
  { key: '3', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail3', timestamp: '2026-02-24 19:30' },
  { key: '4', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail4', timestamp: '2026-02-24 15:22' },
  { key: '5', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail5', timestamp: '2026-02-24 10:15' },
]

const ACTION_KEYS = ['adminAudit.actionDetail1', 'adminAudit.actionDetail2', 'adminAudit.actionDetail3', 'adminAudit.actionDetail4', 'adminAudit.actionDetail5'] as const

export default function AdminAudit() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState('20d')
  const [logTab, setLogTab] = useState('access')

  const filteredData = useMemo(() => {
    const now = dayjs()
    const days = timeFilter === '7d' ? 7 : 20
    return MOCK_AUDIT.filter((row) => {
      const rowDate = dayjs(row.timestamp)
      if (now.diff(rowDate, 'day') > days) return false
      if (userFilter !== 'all' && row.type !== userFilter) return false
      if (actionFilter !== 'all' && row.actionDetailKey !== actionFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const actionText = t(row.actionDetailKey).toLowerCase()
        if (!actionText.includes(q)) return false
      }
      return true
    })
  }, [t, userFilter, actionFilter, timeFilter, search])

  const columns = [
    {
      title: t('adminAudit.type', 'Type'),
      key: 'type',
      width: 160,
      render: (_: unknown, r: (typeof MOCK_AUDIT)[0]) => (
        <div className="flex items-center gap-8">
          <Avatar size="small" icon={<UserOutlined />} className="flex-shrink-0" />
          <span>{r.type === 'Admin' ? t('adminAudit.typeAdmin', 'Admin') : r.type}</span>
        </div>
      ),
    },
    {
      title: t('adminAudit.actionDetails', 'Action Details'),
      key: 'actionDetails',
      ellipsis: true,
      render: (_: unknown, r: (typeof MOCK_AUDIT)[0]) => t(r.actionDetailKey),
    },
    {
      title: t('adminAudit.timestamp', 'Timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
    },
    {
      key: 'action',
      width: 90,
      render: () => (
        <Button type="primary" size="small">
          {t('adminAudit.view', 'View')}
        </Button>
      ),
    },
  ]

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-xl font-semibold m-0">{t('adminAudit.title', 'Admin Control Panel')}</h1>
        <Space size="middle">
          <Button type="text" icon={<BellOutlined />} />
          <Button type="text" icon={<UserOutlined />} />
          <Button type="text" icon={<MailOutlined />} />
          <Button type="text" icon={<ClockCircleOutlined />} />
          <Avatar size="small" icon={<UserOutlined />} />
        </Space>
      </div>

      <ContentCard>
        <div className="mb-12">
          <Tabs
            activeKey={logTab}
            onChange={setLogTab}
            size="small"
            items={[
              {
                key: 'access',
                label: (
                  <span>
                    <FileTextOutlined className="mr-4" />
                    {t('adminAudit.accessLogs', 'Access Logs')}
                  </span>
                ),
              },
              {
                key: 'export',
                label: t('adminAudit.exportLogs', 'Export Logs'),
              },
            ]}
          />
        </div>
        <div className="mb-12 flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('adminAudit.filterUser', 'User')}</span>
            <Select
              value={userFilter}
              onChange={setUserFilter}
              style={{ width: 180 }}
              placeholder={t('adminAudit.placeholderUser', 'Select user')}
              options={[
                { value: 'all', label: t('adminAudit.allUsers', 'All Users') },
                { value: 'Admin', label: t('adminAudit.typeAdmin', 'Admin') },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('adminAudit.filterAction', 'Action')}</span>
            <Select
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: 180 }}
              placeholder={t('adminAudit.placeholderAction', 'Select action')}
              options={[
                { value: 'all', label: t('adminAudit.allActions', 'All Actions') },
                ...ACTION_KEYS.map((key) => ({ value: key, label: t(key) })),
              ]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('adminAudit.filterTime', 'Time range')}</span>
            <Select
              value={timeFilter}
              onChange={setTimeFilter}
              style={{ width: 160 }}
              placeholder={t('adminAudit.placeholderTime', 'Select time range')}
              options={[
                { value: '7d', label: t('adminAudit.last7d', 'Last 7 Days') },
                { value: '20d', label: t('adminAudit.last20Days', 'Last 20 Days') },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('adminAudit.filterSearch', 'Search records')}</span>
            <Input
              placeholder={t('adminAudit.searchRecords', 'Search Records')}
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
          </div>
        </div>
        <Table
          size="middle"
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </ContentCard>
    </PageContainer>
  )
}
