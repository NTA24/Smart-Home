import { useEffect, useState } from 'react'
import { PageContainer } from '@/components'
import { Card, Table, Button, Input, Space, message, Modal, Form, Row, Col, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  BankOutlined,
  DesktopOutlined,
  AppstoreOutlined,
  WifiOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { thingsBoardApi } from '@/services'

const { TextArea } = Input

interface CustomerRecord {
  key: string
  id: string
  createdTime: number
  title: string
  email?: string
  country?: string
  city?: string
  isPublic?: boolean
}

function getCustomerId(raw: Record<string, unknown>): string {
  const id = raw.id
  if (typeof id === 'string') return id
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

export default function AccountSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CustomerRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [createdTimeSortOrder, setCreatedTimeSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm] = Form.useForm()
  const [addLoading, setAddLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; title: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCustomers = () => {
    setLoading(true)
    thingsBoardApi
      .getCustomers({
        pageSize,
        page: page - 1,
        sortProperty: 'createdTime',
        sortOrder: createdTimeSortOrder,
        textSearch: searchText || undefined,
      })
      .then((res) => {
        const list = (res?.data as Record<string, unknown>[]) ?? []
        const rows: CustomerRecord[] = list.map((item) => {
          const id = getCustomerId(item)
          const createdTime = typeof item.createdTime === 'number' ? item.createdTime : 0
          const title = (item.title as string) ?? ''
          const email = item.email as string | undefined
          const country = item.country as string | undefined
          const city = item.city as string | undefined
          const isPublic = (item.title as string) === 'Public' || (item as { isPublic?: boolean }).isPublic
          return {
            key: id,
            id,
            createdTime,
            title,
            email,
            country,
            city,
            isPublic,
          }
        })
        setData(rows)
        setTotal((res?.totalElements as number) ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
  }, [page, pageSize, createdTimeSortOrder])

  const handleAddCustomer = () => {
    addForm.validateFields().then((values) => {
      setAddLoading(true)
      const phoneVal = values.phone ? `${values.phoneCode || ''}${values.phone}`.trim() : undefined
      thingsBoardApi
        .createCustomer(
          {
            title: values.title,
            email: values.email || undefined,
            country: values.country || undefined,
            city: values.city || undefined,
            state: values.state || undefined,
            zip: values.zip || undefined,
            address: values.address || undefined,
            address2: values.address2 || undefined,
            phone: phoneVal,
            additionalInfo: values.description ? { description: values.description } : {},
          }
        )
        .then(() => {
          message.success(t('account.addCustomerSuccess', 'Đã thêm customer'))
          setAddModalOpen(false)
          addForm.resetFields()
          fetchCustomers()
        })
        .catch((err) => {
          message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed', 'Lưu thất bại'))
        })
        .finally(() => setAddLoading(false))
    })
  }

  const toggleCreatedTimeSort = () => {
    setCreatedTimeSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
    setPage(1)
  }

  const columns: ColumnsType<CustomerRecord> = [
    {
      title: (
        <span
          role="button"
          tabIndex={0}
          onClick={toggleCreatedTimeSort}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCreatedTimeSort() }}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          {t('account.customers.createdTime', 'Created time')}
        </span>
      ),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
    },
    {
      title: t('account.customers.title', 'Title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('account.customers.email', 'Email'),
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.customers.country', 'Country'),
      dataIndex: 'country',
      key: 'country',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('account.customers.city', 'City'),
      dataIndex: 'city',
      key: 'city',
      ellipsis: true,
      render: (v: string) => v || '—',
    },
    {
      title: t('common.action', 'Hành động'),
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<UserOutlined />}
            disabled={record.isPublic}
            title={t('account.manageCustomerUser', 'Manage customer user')}
            onClick={() => navigate(`/account-settings/customer/${record.id}/users`)}
          />
          <Button
            type="text"
            size="small"
            icon={<BankOutlined />}
            title={t('account.manageCustomerAssets', 'Manage customer assets')}
            onClick={() => navigate(`/account-settings/customer/${record.id}/assets`)}
          />
          <Button
            type="text"
            size="small"
            icon={<DesktopOutlined />}
            title={t('account.manageCustomerDevice', 'Manage customer device')}
            onClick={() => navigate(`/account-settings/customer/${record.id}/devices`)}
          />
          <Button
            type="text"
            size="small"
            icon={<AppstoreOutlined />}
            title={t('account.manageCustomerDashboard', 'Manage customer dashboard')}
            onClick={() => navigate(`/account-settings/customer/${record.id}/dashboards`)}
          />
          <Button
            type="text"
            size="small"
            icon={<WifiOutlined />}
            title={t('account.manageCustomerEdges', 'Manage customer edges')}
            onClick={() => navigate(`/account-settings/customer/${record.id}/edges`)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            title={t('common.delete', 'Xóa')}
            onClick={() => {
              setCustomerToDelete({ id: record.id, title: record.title || record.id })
              setDeleteModalOpen(true)
            }}
          />
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return
    setDeleteLoading(true)
    thingsBoardApi
      .deleteCustomer(customerToDelete.id)
      .then(() => {
        setDeleteModalOpen(false)
        setCustomerToDelete(null)
        message.success(t('account.deleteCustomerSuccess', 'Đã xóa customer'))
        fetchCustomers()
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setDeleteLoading(false))
  }

  return (
    <PageContainer>
      <Card title={t('account.customers.titlePage', 'Customers')} bordered={false}>
        <Space className="mb-4" wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
            {t('common.add', 'Thêm')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchCustomers} loading={loading}>
            {t('common.refresh', 'Làm mới')}
          </Button>
          <Input
            placeholder={t('common.search', 'Tìm kiếm')}
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 220 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchCustomers}
          />
        </Space>
        <Table<CustomerRecord>
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
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: 24 }}>
            <span>{t('account.addCustomer', 'Add customer')}</span>
            <Space>
              <Button type="text" size="small" icon={<QuestionCircleOutlined />} aria-label="Help" />
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setAddModalOpen(false)} aria-label="Close" />
            </Space>
          </div>
        }
        open={addModalOpen}
        closable={false}
        onCancel={() => setAddModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddModalOpen(false)}>
            {t('common.cancel', 'Hủy')}
          </Button>,
          <Button key="add" type="primary" loading={addLoading} onClick={handleAddCustomer}>
            {t('common.add', 'Thêm')}
          </Button>,
        ]}
        width={560}
        destroyOnClose
      >
        <Form form={addForm} layout="vertical" initialValues={{ phoneCode: '+1' }}>
          <Form.Item
            name="title"
            label={t('account.customers.title', 'Title') + ' *'}
            rules={[{ required: true, message: t('account.titleRequired', 'Nhập Title') }]}
          >
            <Input placeholder={t('account.customers.title', 'Title')} />
          </Form.Item>
          <Form.Item name="description" label={t('account.description', 'Description')}>
            <TextArea rows={3} placeholder={t('account.description', 'Description')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="country" label={t('account.customers.country', 'Country')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="city" label={t('account.customers.city', 'City')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="state" label={t('account.stateProvince', 'State / Province')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="zip" label={t('account.zipPostal', 'Zip / Postal Code')}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label={t('account.address', 'Address')}>
            <Input />
          </Form.Item>
          <Form.Item name="address2" label={t('account.address2', 'Address 2')}>
            <Input />
          </Form.Item>
          <Form.Item label={t('account.phone', 'Phone')}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="phoneCode" noStyle>
                <Select style={{ width: 90 }} options={[{ value: '+1', label: 'US' }, { value: '+84', label: 'VN' }]} />
              </Form.Item>
              <Form.Item name="phone" noStyle>
                <Input placeholder="+12015550123" />
              </Form.Item>
            </Space.Compact>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              {t('account.phoneHint', 'Phone Number in E.164 format, ex. +12015550123')}
            </div>
          </Form.Item>
          <Form.Item name="email" label={t('account.customers.email', 'Email')}>
            <Input type="email" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('account.deleteCustomerTitle', 'Xóa customer')}
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false)
          setCustomerToDelete(null)
        }}
        footer={[
          <Button key="no" onClick={() => { setDeleteModalOpen(false); setCustomerToDelete(null) }}>
            {t('account.deleteCustomerNo', 'No')}
          </Button>,
          <Button key="yes" type="primary" danger loading={deleteLoading} onClick={handleDeleteCustomer}>
            {t('account.deleteCustomerYes', 'Yes')}
          </Button>,
        ]}
        destroyOnClose
      >
        <p>
          {t('account.deleteCustomerConfirm', 'Are you sure you want to delete the customer \'{{title}}\'?', {
            title: customerToDelete?.title ?? '',
          })}
        </p>
        <p style={{ color: '#faad14', marginBottom: 0 }}>
          {t('account.deleteCustomerWarning', 'Be careful, after the confirmation the customer and all related data will become unrecoverable.')}
        </p>
      </Modal>
    </PageContainer>
  )
}
