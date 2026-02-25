import { useEffect, useState } from 'react'
import { Button, Segmented, Space, Tag, Typography, Select } from 'antd'
import { ReloadOutlined, ToolOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { ContentCard, DataTable, PageContainer, PageHeader } from '@/components'
import {
  getMeetingIssues,
  getWorkspaceIssues,
  updateMeetingIssueStatus,
  updateWorkspaceIssueStatus,
  type IssueStatus,
  type IssueTicket,
} from '@/services/mockPersistence'

const { Text } = Typography

type IssueSource = 'workspace' | 'meeting'

interface IssueTicketsProps {
  defaultSource?: IssueSource
}

const severityColors: Record<string, string> = {
  low: 'green',
  normal: 'blue',
  high: 'orange',
  critical: 'red',
}

const statusColors: Record<IssueStatus, string> = {
  open: 'red',
  in_progress: 'gold',
  resolved: 'green',
}

export default function IssueTickets({ defaultSource = 'workspace' }: IssueTicketsProps) {
  const { t } = useTranslation()
  const [source, setSource] = useState<IssueSource>(defaultSource)
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all')
  const [issues, setIssues] = useState<IssueTicket[]>([])

  const loadIssues = (nextSource: IssueSource = source) => {
    setIssues(nextSource === 'workspace' ? getWorkspaceIssues() : getMeetingIssues())
  }

  useEffect(() => {
    loadIssues(source)
  }, [source])

  const handleUpdateStatus = (id: string, status: IssueStatus) => {
    if (source === 'workspace') {
      updateWorkspaceIssueStatus(id, status)
    } else {
      updateMeetingIssueStatus(id, status)
    }
    loadIssues(source)
  }

  const filteredIssues = issues.filter((item) => statusFilter === 'all' || item.status === statusFilter)

  const columns: ColumnsType<IssueTicket> = [
    { title: 'Ticket', dataIndex: 'id', key: 'id', width: 120 },
    { title: t('issueTickets.room', 'Room'), dataIndex: 'room', key: 'room', width: 180 },
    {
      title: t('issueTickets.type', 'Type'),
      dataIndex: 'issueType',
      key: 'issueType',
      width: 140,
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: t('issueTickets.severity', 'Severity'),
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (value: string) => <Tag color={severityColors[value] || 'default'}>{value}</Tag>,
    },
    {
      title: t('issueTickets.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value: IssueStatus) => <Tag color={statusColors[value]}>{t(`issueTickets.${value}`)}</Tag>,
    },
    {
      title: t('issueTickets.description', 'Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 320,
    },
    {
      title: t('issueTickets.time', 'Time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: t('issueTickets.action', 'Action'),
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleUpdateStatus(record.id, 'open')}>
            {t('issueTickets.open')}
          </Button>
          <Button size="small" onClick={() => handleUpdateStatus(record.id, 'in_progress')}>
            {t('issueTickets.in_progress')}
          </Button>
          <Button size="small" type="primary" ghost onClick={() => handleUpdateStatus(record.id, 'resolved')}>
            {t('issueTickets.resolved')}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.issueTickets', 'Issue Tickets')}
        icon={<ToolOutlined />}
        subtitle={t('wsReport.ticketDesc', 'Track all submitted issue tickets')}
        actions={
          <Space>
            <Segmented<IssueSource>
              value={source}
              onChange={(value) => {
                setSource(value)
                setStatusFilter('all')
              }}
              options={[
                { label: t('menu.smartWorkspace', 'Workspace'), value: 'workspace' },
                { label: t('menu.smartMeetingRoom', 'Meeting Room'), value: 'meeting' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="vehicle_filter-select-w130"
              options={[
                { label: t('issueTickets.all'), value: 'all' },
                { label: t('issueTickets.open'), value: 'open' },
                { label: t('issueTickets.in_progress'), value: 'in_progress' },
                { label: t('issueTickets.resolved'), value: 'resolved' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => loadIssues(source)}>
              {t('issueTickets.refresh')}
            </Button>
          </Space>
        }
      />

      <ContentCard title={`${t('menu.issueTickets', 'Issue Tickets')} (${filteredIssues.length})`}>
        <DataTable<IssueTicket>
          columns={columns}
          dataSource={filteredIssues}
          pageSize={10}
          total={filteredIssues.length}
          scroll={{ x: 1400 }}
          pagination={{ showTotal: (total) => `${total} ${t('issueTickets.tickets')}` }}
        />
      </ContentCard>
    </PageContainer>
  )
}
