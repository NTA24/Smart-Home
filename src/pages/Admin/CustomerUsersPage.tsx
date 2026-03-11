import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'

interface CustomerUserRecord {
  key: string
  id: string
  createdTime: number
  firstName?: string
  lastName?: string
  email?: string
}

function getUserId(raw: Record<string, unknown>): string {
  const id = raw.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

export default function CustomerUsersPage() {
  const { t } = useTranslation()
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customerTitle, setCustomerTitle] = useState<string>('')
  const [data, setData] = useState<CustomerUserRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')

  const fetchData = () => {
    if (!customerId) return
    setLoading(true)
    Promise.all([
      thingsBoardApi.getCustomer(customerId),
      thingsBoardApi.getCustomerUsers(customerId, {
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        textSearch: searchText || undefined,
      }),
    ])
      .then(([customerRes, usersRes]) => {
        const title = (customerRes?.title as string) ?? customerId
        setCustomerTitle(title)
        const list = (usersRes?.data as Record<string, unknown>[]) ?? []
        const rows: CustomerUserRecord[] = list.map((item) => {
          const id = getUserId(item)
          const createdTime = typeof item.createdTime === 'number' ? item.createdTime : 0
          const firstName = item.firstName as string | undefined
          const lastName = item.lastName as string | undefined
          const email = item.email as string | undefined
          return { key: id, id, createdTime, firstName, lastName, email }
        })
        setData(rows)
        setTotal((usersRes?.totalElements as number) ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [customerId, page, pageSize])

  const columns: ColumnsType<CustomerUserRecord> = [
    {
      title: t('account.customers.createdTime', 'Created time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.userFirstName', 'First name'),
      dataIndex: 'firstName',
      key: 'firstName',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.userLastName', 'Last name'),
      dataIndex: 'lastName',
      key: 'lastName',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.customers.email', 'Email'),
      dataIndex: 'email',
      key: 'email',
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
            {t('menu.backToDashboard', 'Quay lại')}
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
      <Card
        title={`${customerTitle}: ${t('account.customerUsers', 'Customer users')}`}
        bordered={false}
      >
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
            onPressEnter={fetchData}
          />
        </Space>
        <Table<CustomerUserRecord>
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
          locale={{ emptyText: t('account.noUsersFound', 'No users found') }}
        />
      </Card>
    </PageContainer>
  )
}
