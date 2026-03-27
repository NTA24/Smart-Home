import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'
import { errorMessageFromUnknown } from '@/utils/crudErrors'

function getEdgeId(item: { id?: { id?: string } | string }): string {
  const id = item.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id?: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

interface EdgeRow {
  key: string
  id: string
  createdTime: number
  name: string
  type?: string
  label?: string
}

export default function CustomerEdgesPage() {
  const { t } = useTranslation()
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customerTitle, setCustomerTitle] = useState<string>('')
  const [data, setData] = useState<EdgeRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [edgeType, setEdgeType] = useState<string>('')
  const [edgeTypeOptions, setEdgeTypeOptions] = useState<{ value: string; label: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const fetchData = () => {
    if (!customerId) return
    setLoading(true)
    Promise.all([
      thingsBoardApi.getCustomer(customerId),
      thingsBoardApi.getCustomerEdgeInfos(customerId, {
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        type: edgeType || undefined,
        textSearch: searchText || undefined,
      }),
    ])
      .then(([customerRes, edgesRes]) => {
        const title = (customerRes?.title as string) ?? customerId
        setCustomerTitle(title)
        const list = edgesRes?.data ?? []
        const rows: EdgeRow[] = list.map((item) => ({
          key: getEdgeId(item),
          id: getEdgeId(item),
          createdTime: item.createdTime ?? 0,
          name: item.name ?? '',
          type: item.type,
          label: item.label,
        }))
        setData(rows)
        setTotal(edgesRes?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [customerId, page, pageSize, edgeType])

  useEffect(() => {
    thingsBoardApi
      .getEdgeTypes()
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res as { types?: string[] })?.types ?? []
        const opts = [
          { value: '', label: t('account.edgeTypeAll', 'All') },
          ...raw.map((typeName: string) => ({ value: typeName, label: typeName })),
        ]
        setEdgeTypeOptions(opts)
      })
      .catch((err: unknown) => {
        message.error(errorMessageFromUnknown(err) || t('common.loadFailed', 'Tải thất bại'))
      })
  }, [t])

  const onSearch = () => {
    setPage(1)
    fetchData()
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  const columns: ColumnsType<EdgeRow> = [
    {
      title: t('account.customers.createdTime', 'Created time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.edgeName', 'Name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.edgeType', 'Edge type'),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.assetLabel', 'Label'),
      dataIndex: 'label',
      key: 'label',
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
      <Card title={`${customerTitle}: ${t('account.edges', 'Edge instances')}`} bordered={false}>
        <Space className="mb-4" wrap>
          <Select
            placeholder={t('account.edgeType', 'Edge type')}
            allowClear
            style={{ width: 160 }}
            value={edgeType || undefined}
            onChange={(v) => {
              setEdgeType(v ?? '')
              setPage(1)
            }}
            options={edgeTypeOptions}
          />
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
        <Table<EdgeRow>
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
          locale={{ emptyText: t('account.noEdgesFound', 'No edges found') }}
        />
      </Card>
    </PageContainer>
  )
}
