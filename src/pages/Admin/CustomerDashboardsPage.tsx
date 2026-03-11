import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'

interface DashboardItem {
  id?: { id?: string }
  title?: string
  createdTime?: number
}

interface DashboardRow {
  key: string
  id: string
  createdTime: number
  title: string
}

function getDashboardId(item: DashboardItem): string {
  const id = item.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id?: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

export default function CustomerDashboardsPage() {
  const { t } = useTranslation()
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customerTitle, setCustomerTitle] = useState<string>('')
  const [data, setData] = useState<DashboardRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const fetchData = () => {
    if (!customerId) return
    setLoading(true)
    Promise.all([
      thingsBoardApi.getCustomer(customerId),
      thingsBoardApi.getCustomerDashboards(customerId, {
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        textSearch: searchText || undefined,
      }),
    ])
      .then(([customerRes, dashboardsRes]) => {
        const title = (customerRes?.title as string) ?? customerId
        setCustomerTitle(title)
        const list = dashboardsRes?.data ?? []
        const rows: DashboardRow[] = list.map((item) => ({
          key: getDashboardId(item),
          id: getDashboardId(item),
          createdTime: item.createdTime ?? 0,
          title: item.title ?? '',
        }))
        setData(rows)
        setTotal(dashboardsRes?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [customerId, page, pageSize])

  const onSearch = () => {
    setPage(1)
    fetchData()
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  const columns: ColumnsType<DashboardRow> = [
    {
      title: t('account.customers.createdTime', 'Created time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.dashboardTitle', 'Title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
  ]

  if (!customerId) {
    return (
      <PageContainer>
        <Card>
          <p className="text-red-600">{t('account.invalidCustomer', 'Invalid customer')}</p>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/account-settings')}>
            {t('account.backToCustomers', 'Quay lại Customers')}
          </Button>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/account-settings')}
        className="mb-4"
      >
        {t('account.backToCustomers', 'Quay lại Customers')}
      </Button>
      <Card title={`${customerTitle}: ${t('account.dashboards', 'Dashboards')}`} bordered={false}>
        <Space className="mb-4" wrap>
          <Button type="primary" icon={<PlusOutlined />}>
            {t('common.add', 'Thêm')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            {t('common.refresh', 'Làm mới')}
          </Button>
          <Input
            placeholder={t('common.search', 'Tìm kiếm')}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 220 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={onSearch}
          />
        </Space>
        <Table<DashboardRow>
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (n) => t('common.total', 'Tổng') + `: ${n}`,
            onChange: (p, size) => {
              setPage(p)
              if (size) setPageSize(size)
            },
          }}
          locale={{ emptyText: t('account.noDashboardsFound', 'No dashboards found') }}
        />
      </Card>
    </PageContainer>
  )
}
