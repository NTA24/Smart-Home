import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined, SearchOutlined, ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'
import type { ThingsBoardDeviceInfo } from '@/services'

function getDeviceId(item: ThingsBoardDeviceInfo): string {
  const id = item.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

interface DeviceRow {
  key: string
  id: string
  createdTime: number
  name: string
  deviceProfileName?: string
  label?: string
  active?: boolean
  gateway?: boolean
}

export default function CustomerDevicesPage() {
  const { t } = useTranslation()
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [customerTitle, setCustomerTitle] = useState<string>('')
  const [data, setData] = useState<DeviceRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')

  const fetchData = () => {
    if (!customerId) return
    setLoading(true)
    Promise.all([
      thingsBoardApi.getCustomer(customerId),
      thingsBoardApi.getCustomerDeviceInfos(customerId, {
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        textSearch: searchText || undefined,
      }),
    ])
      .then(([customerRes, devicesRes]) => {
        const title = (customerRes?.title as string) ?? customerId
        setCustomerTitle(title)
        const list = devicesRes?.data ?? []
        const rows: DeviceRow[] = list.map((item) => ({
          key: getDeviceId(item),
          id: getDeviceId(item),
          createdTime: item.createdTime ?? 0,
          name: item.name ?? '',
          deviceProfileName: item.deviceProfileName,
          label: item.label,
          active: item.active,
          gateway: item.gateway,
        }))
        setData(rows)
        setTotal(devicesRes?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [customerId, page, pageSize])

  const columns: ColumnsType<DeviceRow> = [
    {
      title: t('account.customers.createdTime', 'Created time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.deviceName', 'Name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.deviceProfile', 'Device profile'),
      dataIndex: 'deviceProfileName',
      key: 'deviceProfileName',
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
    {
      title: t('account.deviceState', 'State'),
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (v: boolean) => (v === true ? t('common.online', 'Active') : v === false ? t('common.offline', 'Inactive') : '—'),
    },
    {
      title: t('account.isGateway', 'Is gateway'),
      dataIndex: 'gateway',
      key: 'gateway',
      width: 100,
      render: (v: boolean) => (v === true ? t('common.yes', 'Yes') : v === false ? t('common.no', 'No') : '—'),
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
      <Card title={`${customerTitle}: ${t('account.devices', 'Devices')}`} bordered={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button icon={<FilterOutlined />}>
            {t('account.deviceFilter', 'Device filter')}
          </Button>
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
        <Table<DeviceRow>
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
          locale={{ emptyText: t('account.noDevicesFound', 'No devices found') }}
        />
      </Card>
    </PageContainer>
  )
}
