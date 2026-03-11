import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'
import type { ThingsBoardAssetInfo } from '@/services'

function getAssetId(item: ThingsBoardAssetInfo): string {
  const id = item.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

interface AssetRow {
  key: string
  id: string
  createdTime: number
  name: string
  assetProfileName?: string
  label?: string
}

export default function CustomerAssetsPage() {
  const { t } = useTranslation()
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customerTitle, setCustomerTitle] = useState<string>('')
  const [data, setData] = useState<AssetRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [assetProfileId, setAssetProfileId] = useState<string>('')
  const [assetProfileOptions, setAssetProfileOptions] = useState<{ value: string; label: string }[]>([])

  const fetchData = () => {
    if (!customerId) return
    setLoading(true)
    Promise.all([
      thingsBoardApi.getCustomer(customerId),
      thingsBoardApi.getCustomerAssetInfos(customerId, {
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        assetProfileId: assetProfileId || undefined,
        textSearch: searchText || undefined,
      }),
    ])
      .then(([customerRes, assetsRes]) => {
        const title = (customerRes?.title as string) ?? customerId
        setCustomerTitle(title)
        const list = assetsRes?.data ?? []
        const rows: AssetRow[] = list.map((item) => ({
          key: getAssetId(item),
          id: getAssetId(item),
          createdTime: item.createdTime ?? 0,
          name: item.name ?? '',
          assetProfileName: item.assetProfileName,
          label: item.label,
        }))
        setData(rows)
        setTotal(assetsRes?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [customerId, page, pageSize, assetProfileId])

  useEffect(() => {
    thingsBoardApi
      .getAssetProfileInfos({ pageSize: 100, page: 0 })
      .then((res) => {
        const list = res?.data ?? []
        const opts = [
          { value: '', label: t('account.assetProfileAll', 'All') },
          ...list
            .map((p) => {
              const idObj = p.id
              const id = typeof idObj === 'object' && idObj && 'id' in idObj ? (idObj as { id?: string }).id : ''
              return { value: id ?? '', label: p.name ?? '' }
            })
            .filter((o) => o.value || o.label),
        ]
        setAssetProfileOptions(opts)
      })
      .catch(() => {})
  }, [t])

  const columns: ColumnsType<AssetRow> = [
    {
      title: t('account.customers.createdTime', 'Created time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.assetName', 'Name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.assetProfile', 'Asset profile'),
      dataIndex: 'assetProfileName',
      key: 'assetProfileName',
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
      <Card title={`${customerTitle}: ${t('account.assets', 'Assets')}`} bordered={false}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Space.Compact>
            <span className="inline-flex items-center px-2 text-sm text-gray-600">
              {t('account.assetProfile', 'Asset profile')}:
            </span>
            <Select
              value={assetProfileId || undefined}
              onChange={(v) => setAssetProfileId(v ?? '')}
              options={assetProfileOptions}
              style={{ minWidth: 160 }}
              placeholder={t('account.assetProfileAll', 'All')}
              allowClear
            />
          </Space.Compact>
          <Space wrap>
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
        </div>
        <Table<AssetRow>
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
          locale={{ emptyText: t('account.noAssetsFound', 'No assets found') }}
        />
      </Card>
    </PageContainer>
  )
}
