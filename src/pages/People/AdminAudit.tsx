import { useMemo, useState } from 'react'
import { Table, Select, Input, Button, Space, Avatar, Dropdown, Modal, message, DatePicker } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  BellOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  MoreOutlined,
  CopyOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import { PageContainer, ContentCard } from '@/components'

const MOCK_AUDIT = [
  { key: '1', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail1', descriptionKey: 'adminAudit.desc1', timestamp: '2026-02-25 08:10' },
  { key: '2', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail2', descriptionKey: 'adminAudit.desc2', timestamp: '2026-02-25 02:18' },
  { key: '3', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail3', descriptionKey: 'adminAudit.desc3', timestamp: '2026-02-24 19:30' },
  { key: '4', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail4', descriptionKey: 'adminAudit.desc4', timestamp: '2026-02-24 15:22' },
  { key: '5', type: 'Admin', actionDetailKey: 'adminAudit.actionDetail5', descriptionKey: 'adminAudit.desc5', timestamp: '2026-02-24 10:15' },
]

const ACTION_KEYS = ['adminAudit.actionDetail1', 'adminAudit.actionDetail2', 'adminAudit.actionDetail3', 'adminAudit.actionDetail4', 'adminAudit.actionDetail5'] as const

export default function AdminAudit() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<(typeof MOCK_AUDIT)[0] | null>(null)

  const filteredData = useMemo(() => {
    return MOCK_AUDIT.filter((row) => {
      if (dateRange) {
        const rowDate = dayjs(row.timestamp)
        const [start, end] = dateRange
        if (rowDate.isBefore(start.startOf('day')) || rowDate.isAfter(end.endOf('day'))) return false
      }
      if (userFilter !== 'all' && row.type !== userFilter) return false
      if (actionFilter !== 'all' && row.actionDetailKey !== actionFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const actionText = t(row.actionDetailKey).toLowerCase()
        if (!actionText.includes(q)) return false
      }
      return true
    })
  }, [t, userFilter, actionFilter, dateRange, search])

  const handleResetFilters = () => {
    setUserFilter('all')
    setActionFilter('all')
    setDateRange(null)
    setSearch('')
    message.success(t('adminAudit.filtersReset', 'Filters reset'))
  }

  const handleExportList = () => {
    const header = [t('adminAudit.type'), t('adminAudit.actionDetails'), t('adminAudit.timestamp')].join(',')
    const rows = filteredData.map((r) => [r.type, t(r.actionDetailKey), r.timestamp].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access-log-${dayjs().format('YYYY-MM-DD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success(t('adminAudit.exportList', 'Export list'))
  }

  const handleViewRecord = (row: (typeof MOCK_AUDIT)[0]) => {
    setSelectedRow(row)
    setViewModalOpen(true)
  }

  const handleCopyDetails = (row: (typeof MOCK_AUDIT)[0]) => {
    const text = `${t('adminAudit.type')}: ${row.type}\n${t('adminAudit.actionDetails')}: ${t(row.actionDetailKey)}\n${t('adminAudit.timestamp')}: ${row.timestamp}`
    navigator.clipboard.writeText(text).then(() => message.success(t('adminAudit.detailsCopied', 'Details copied')))
  }

  const handleExportRecord = (row: (typeof MOCK_AUDIT)[0]) => {
    const csv = [t('adminAudit.type'), t('adminAudit.actionDetails'), t('adminAudit.timestamp')].join(',') + '\n' + [row.type, t(row.actionDetailKey), row.timestamp].join(',')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `log-${row.key}-${dayjs().format('YYYY-MM-DD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success(t('adminAudit.exportThisRecord', 'Export this record'))
  }

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
      title: t('adminAudit.description', 'Description'),
      key: 'description',
      ellipsis: true,
      render: (_: unknown, r: (typeof MOCK_AUDIT)[0]) => {
        const desc = r.descriptionKey ? t(r.descriptionKey) : '–'
        return <span title={desc}>{desc}</span>
      },
    },
    {
      key: 'action',
      width: 140,
      render: (_: unknown, r: (typeof MOCK_AUDIT)[0]) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'export',
            icon: <ExportOutlined />,
            label: t('adminAudit.exportThisRecord', 'Export this record'),
            onClick: () => handleExportRecord(r),
          },
          {
            key: 'copy',
            icon: <CopyOutlined />,
            label: t('adminAudit.copyDetails', 'Copy details'),
            onClick: () => handleCopyDetails(r),
          },
        ]
        return (
          <Space size="small">
            <Button type="primary" size="small" onClick={() => handleViewRecord(r)}>
              {t('adminAudit.view', 'View')}
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button size="small" icon={<MoreOutlined />}>
                {t('adminAudit.moreActions', 'More')}
              </Button>
            </Dropdown>
          </Space>
        )
      },
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
        <div className="admin-audit-filter-bar mb-12">
          <div className="admin-audit-filter-bar__filters">
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
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(value) => setDateRange(value as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={[t('adminAudit.placeholderTimeStart', 'Từ ngày'), t('adminAudit.placeholderTimeEnd', 'Đến ngày')]}
              style={{ width: 240 }}
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
          <div className="admin-audit-filter-bar__actions">
            <Button className="admin-audit-reset-btn" icon={<ReloadOutlined />} onClick={handleResetFilters}>
              {t('adminAudit.resetFilters', 'Reset filters')}
            </Button>
            <Button className="admin-audit-export-btn" type="primary" icon={<DownloadOutlined />} onClick={handleExportList}>
              {t('adminAudit.exportList', 'Export list')}
            </Button>
          </div>
        </div>
        <Table
          size="middle"
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </ContentCard>

      <Modal
        title={t('adminAudit.viewDetailTitle', 'Record details')}
        open={viewModalOpen}
        onCancel={() => { setViewModalOpen(false); setSelectedRow(null) }}
        footer={[
          <Button key="close" onClick={() => { setViewModalOpen(false); setSelectedRow(null) }}>
            {t('common.close', 'Close')}
          </Button>,
        ]}
        width={520}
      >
        {selectedRow && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm text-secondary mb-1">{t('adminAudit.type', 'Type')}</div>
              <div className="font-medium">{selectedRow.type === 'Admin' ? t('adminAudit.typeAdmin', 'Admin') : selectedRow.type}</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">{t('adminAudit.actionDetails', 'Action Details')}</div>
              <div className="font-medium">{t(selectedRow.actionDetailKey)}</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">{t('adminAudit.timestamp', 'Timestamp')}</div>
              <div className="font-medium">{selectedRow.timestamp}</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">{t('adminAudit.description', 'Description')}</div>
              <div className="text-neutral-700 leading-relaxed">{selectedRow.descriptionKey ? t(selectedRow.descriptionKey) : '–'}</div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
