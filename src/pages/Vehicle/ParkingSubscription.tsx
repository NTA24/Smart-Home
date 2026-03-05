import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Modal,
  Table,
  Typography,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Row,
  Col,
  Switch,
  Checkbox,
  Upload,
  message,
  Badge,
  Space,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  CreditCardOutlined,
  SearchOutlined,
  EditOutlined,
  UserOutlined,
  UploadOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { TableActionButtons } from '@/components'
import { useBuildingStore, useHomeNavigationStore } from '@/stores'
import dayjs from 'dayjs'
import {
  getVehicleSubscriptionFilters,
  saveVehicleSubscriptionFilters,
} from '@/services/mockPersistence'
import { parkingSubscriptionApi, type ParkingSubscriptionItem } from '@/services'

const { Title, Text } = Typography

interface Subscription {
  id: string
  key: string
  plate: string
  owner: string
  phone: string
  vehicleType: string
  plan: string
  validFrom: string
  validTo: string
  status: 'active' | 'expired' | 'cancelled'
  autoRenew: boolean
  zone: string
  rules: string[]
}

function mapItemToSubscription(item: ParkingSubscriptionItem): Subscription {
  const statusLower = (item.status ?? '').toLowerCase()
  const status: Subscription['status'] =
    statusLower === 'cancelled' ? 'cancelled'
    : statusLower === 'expired' ? 'expired'
    : 'active'
  const planType = (item.plan_type ?? '').toLowerCase()
  const plan = planType === 'monthly' || planType === 'quarterly' || planType === 'yearly'
    ? planType
    : (item.plan_type ?? 'monthly')
  const rules = Array.isArray(item.rules) ? item.rules.filter((r): r is string => typeof r === 'string') : []
  return {
    id: String(item.id),
    key: String(item.id),
    plate: item.plate_no ?? '',
    owner: item.owner_name ?? '-',
    phone: item.phone ?? '-',
    vehicleType: item.vehicle_type ?? 'Car',
    plan,
    validFrom: item.valid_from ?? '',
    validTo: item.valid_to ?? '',
    status,
    autoRenew: !!item.auto_renew,
    zone: item.zone ?? '-',
    rules,
  }
}

const PLAN_COLORS: Record<string, string> = {
  monthly: 'blue',
  quarterly: 'purple',
  yearly: 'gold',
}

export default function ParkingSubscription() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const tenantId = useHomeNavigationStore((s) => s.selectedTenant?.id)
  const persistedFilters = getVehicleSubscriptionFilters<{
    searchText: string
    dateRange: [string, string] | null
  }>({
    searchText: '',
    dateRange: null,
  })
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Subscription | null>(null)
  const [searchText, setSearchText] = useState(persistedFilters.searchText)
  const [filterRange, setFilterRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    persistedFilters.dateRange?.[0] && persistedFilters.dateRange?.[1]
      ? [dayjs(persistedFilters.dateRange[0]), dayjs(persistedFilters.dateRange[1])]
      : null,
  )
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()

  const fetchList = useCallback(() => {
    if (!tenantId) {
      setSubscriptions([])
      return
    }
    setLoading(true)
    parkingSubscriptionApi
      .getList({
        tenant_id: tenantId,
        search: searchText.trim() || undefined,
        valid_from: filterRange?.[0]?.format('YYYY-MM-DD') ?? undefined,
        valid_to: filterRange?.[1]?.format('YYYY-MM-DD') ?? undefined,
        limit: 500,
        offset: 0,
      })
      .then((res) => {
        const items = res.items ?? []
        setSubscriptions(items.map(mapItemToSubscription))
      })
      .catch(() => {
        message.error(t('parkingSub.loadError', 'Không tải được danh sách đăng ký'))
        setSubscriptions([])
      })
      .finally(() => setLoading(false))
  }, [tenantId, searchText, filterRange, t])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    saveVehicleSubscriptionFilters({
      searchText,
      dateRange: filterRange ? [filterRange[0].toISOString(), filterRange[1].toISOString()] : null,
    })
  }, [searchText, filterRange])

  const filtered = useMemo(() => subscriptions.filter((sub) => {
    const q = searchText.trim().toLowerCase()
    const matchKeyword = !q
      || sub.plate.toLowerCase().includes(q)
      || sub.owner.toLowerCase().includes(q)
      || sub.phone.includes(q)
    if (!matchKeyword) return false
    if (!filterRange) return true
    const start = dayjs(sub.validFrom)
    const end = dayjs(sub.validTo)
    return !(end.isBefore(filterRange[0], 'day') || start.isAfter(filterRange[1], 'day'))
  }), [subscriptions, searchText, filterRange])
  const handleFilterRangeChange = (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (value && value[0] && value[1]) {
      setFilterRange([value[0], value[1]])
      return
    }
    setFilterRange(null)
  }


  const handleCreate = () => {
    if (!tenantId) {
      message.warning(t('parkingSub.selectTenantFirst', 'Vui lòng chọn tenant từ trang chủ'))
      return
    }
    form.validateFields().then(() => {
      const values = form.getFieldsValue()
      const validFrom = values.validRange?.[0] ? dayjs(values.validRange[0]).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      const validTo = values.validRange?.[1] ? dayjs(values.validRange[1]).format('YYYY-MM-DD') : dayjs().add(1, 'month').format('YYYY-MM-DD')
      const planType = typeof values.plan === 'string' ? values.plan.toUpperCase() : 'MONTHLY'
      parkingSubscriptionApi
        .create({
          tenant_id: tenantId,
          plate_no: values.plate,
          owner_name: values.resident || values.owner || undefined,
          phone: values.phone || undefined,
          vehicle_type: values.vehicleType || undefined,
          plan_type: planType,
          valid_from: validFrom,
          valid_to: validTo,
          status: 'ACTIVE',
          auto_renew: !!values.autoRenew,
          zone: values.zone || undefined,
          rules: Array.isArray(values.rules) ? values.rules : [],
        })
        .then(() => {
          message.success(t('parkingSub.createSuccess'))
          setCreateModalVisible(false)
          form.resetFields()
          fetchList()
        })
        .catch(() => message.error(t('parkingSub.createError', 'Tạo đăng ký thất bại')))
    }).catch(() => {})
  }

  const handleEdit = (record: Subscription) => {
    setEditingRecord(record)
    editForm.setFieldsValue({
      plate: record.plate,
      owner: record.owner,
      resident: record.owner,
      phone: record.phone,
      vehicleType: record.vehicleType,
      plan: record.plan,
      zone: record.zone,
      autoRenew: record.autoRenew,
      rules: record.rules,
      validRange: [dayjs(record.validFrom), dayjs(record.validTo)],
    })
    setEditModalVisible(true)
  }

  const handleUpdate = () => {
    if (!editingRecord) return
    editForm.validateFields().then(() => {
      const values = editForm.getFieldsValue()
      const validFrom = values.validRange?.[0] ? dayjs(values.validRange[0]).format('YYYY-MM-DD') : editingRecord.validFrom
      const validTo = values.validRange?.[1] ? dayjs(values.validRange[1]).format('YYYY-MM-DD') : editingRecord.validTo
      const planType = typeof values.plan === 'string' ? values.plan.toUpperCase() : (editingRecord.plan ?? 'MONTHLY').toUpperCase()
      parkingSubscriptionApi
        .update(editingRecord.id, {
          plate_no: values.plate,
          owner_name: values.owner ?? values.resident,
          phone: values.phone,
          vehicle_type: values.vehicleType,
          plan_type: planType,
          valid_from: validFrom,
          valid_to: validTo,
          status: editingRecord.status.toUpperCase(),
          auto_renew: !!values.autoRenew,
          zone: values.zone,
          rules: Array.isArray(values.rules) ? values.rules : [],
        })
        .then(() => {
          message.success(t('parkingSub.updateSuccess'))
          setEditModalVisible(false)
          setEditingRecord(null)
          editForm.resetFields()
          fetchList()
        })
        .catch(() => message.error(t('parkingSub.updateError', 'Cập nhật thất bại')))
    }).catch(() => {})
  }

  const handleDelete = (record: Subscription) => {
    parkingSubscriptionApi
      .delete(record.id)
      .then(() => {
        message.success(t('parkingSub.deleteSuccess'))
        fetchList()
      })
      .catch(() => message.error(t('parkingSub.deleteError', 'Xóa thất bại')))
  }

  const exportSubscriptions = () => {
    if (filtered.length === 0) {
      message.info(t('common.noData'))
      return
    }
    const rows = filtered.map((sub) => ({
      plate: sub.plate,
      owner: sub.owner,
      phone: sub.phone,
      vehicleType: sub.vehicleType,
      plan: sub.plan,
      validFrom: sub.validFrom,
      validTo: sub.validTo,
      status: sub.status,
      autoRenew: sub.autoRenew ? 'yes' : 'no',
      zone: sub.zone,
      rules: sub.rules.join('|'),
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parking-subscriptions-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      title: t('parkingSub.plate'),
      dataIndex: 'plate',
      key: 'plate',
      width: 130,
      render: (plate: string) => (
        <Text strong className="font-mono text-primary">{plate}</Text>
      ),
    },
    {
      title: t('parkingSub.owner'),
      dataIndex: 'owner',
      key: 'owner',
      width: 150,
      render: (name: string) => (
        <span><UserOutlined className="mr-4 text-muted" />{name}</span>
      ),
    },
    {
      title: t('parkingSub.validity'),
      key: 'validity',
      width: 200,
      render: (_: unknown, r: Subscription) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {r.validFrom} → {r.validTo}
        </Text>
      ),
    },
    {
      title: t('parkingSub.plan'),
      dataIndex: 'plan',
      key: 'plan',
      width: 100,
      render: (plan: string) => (
        <Tag color={PLAN_COLORS[plan] || 'default'} className="vehicle_tag-rounded-8">
          {t(`parkingSub.${plan}`)}
        </Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => {
        const cfg: Record<string, { color: string; label: string }> = {
          active: { color: 'green', label: t('parkingSub.active') },
          expired: { color: 'red', label: t('parkingSub.expired') },
          cancelled: { color: 'default', label: t('parkingSub.cancelled') },
        }
        const c = cfg[s] || cfg.active
        return <Tag color={c.color} className="vehicle_tag-rounded-8">{c.label}</Tag>
      },
    },
    {
      title: t('parkingSub.autoRenew'),
      dataIndex: 'autoRenew',
      key: 'autoRenew',
      width: 100,
      render: (v: boolean) => v ? <Badge status="success" text="ON" /> : <Badge status="default" text="OFF" />,
    },
    {
      title: t('parkingSub.actions'),
      key: 'actions',
      width: 140,
      render: (_: unknown, record: Subscription) => (
        <TableActionButtons
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          deleteConfirmTitle={t('apiTest.confirmDelete')}
        />
      ),
    },
  ]

  const subscriptionForm = (formInstance: ReturnType<typeof Form.useForm>[0], isEdit = false) => (
    <Form form={formInstance} layout="vertical">
      {!isEdit ? (
        <Form.Item name="resident" label={t('parkingSub.residentTenant')} rules={[{ required: true }]}>
          <Input prefix={<SearchOutlined />} placeholder={t('parkingSub.searchResident')} />
        </Form.Item>
      ) : (
        <Form.Item name="owner" label={t('parkingSub.owner')}>
          <Input placeholder={t('parkingSub.owner')} />
        </Form.Item>
      )}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="plate" label={t('parkingSub.plate')} rules={[{ required: true }]}>
            <Input placeholder="51A-123.45" className="vehicle_input-monospace" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="photo" label={t('parkingSub.regPhoto')}>
            <Upload maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>{t('parkingSub.uploadPhoto')}</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="vehicleType" label={t('parkingSub.vehicleType')} rules={[{ required: true }]}>
            <Select placeholder={t('parkingSub.selectVehicle')} options={[
              { value: 'Car', label: `🚗 ${t('parking.car')}` },
              { value: 'Motorcycle', label: `🏍️ ${t('parking.motorcycle')}` },
            ]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="plan" label={t('parkingSub.plan')} rules={[{ required: true }]}>
            <Select placeholder={t('parkingSub.selectPlan')} options={[
              { value: 'monthly', label: t('parkingSub.monthly') },
              { value: 'quarterly', label: t('parkingSub.quarterly') },
              { value: 'yearly', label: t('parkingSub.yearly') },
            ]} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="validRange" label={t('parkingSub.validFromTo')} rules={[{ required: true }]}>
        <DatePicker.RangePicker style={{ width: '100%' }} />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="zone" label={t('parkingSub.zoneLabel')}>
            <Select placeholder={t('parkingSub.zoneLabel')} options={[
              { value: 'A', label: t('parkingSub.zoneA') },
              { value: 'B', label: t('parkingSub.zoneB') },
              { value: 'C', label: t('parkingSub.zoneC') },
            ]} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="autoRenew" label={t('parkingSub.autoRenew')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="rules" label={t('parkingSub.rules')}>
        <Checkbox.Group options={[
          { label: t('parkingSub.multiEntry'), value: 'multi-entry' },
          { label: t('parkingSub.overnight'), value: 'overnight' },
          { label: t('parkingSub.zoneRestriction'), value: 'zone-restriction' },
        ]} />
      </Form.Item>
    </Form>
  )

  return (
    <div className="vehicle_page">
      {/* Header */}
      <div className="vehicle_header vehicle_header--mb16">
        <div>
          <Title level={4} className="vehicle_title-row">
            <CreditCardOutlined />
            {t('parkingSub.title')}
          </Title>
          <Text type="secondary" className="text-sm">{selectedBuilding?.name || t('parkingSub.allSites')}</Text>
        </div>
        <Space>
          <Button icon={<ExportOutlined />} onClick={exportSubscriptions}>{t('parkingTickets.export')}</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            disabled={!tenantId}
          >
            {t('parkingSub.createSubscription')}
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card variant="borderless" className="vehicle_search-card" bodyStyle={{ padding: '12px 20px' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('parkingSub.searchPlaceholder')}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 350 }}
          allowClear
        />
        <DatePicker.RangePicker value={filterRange} onChange={handleFilterRangeChange} />
      </Card>

      {/* Table */}
      <Card
        variant="borderless"
        className="rounded-lg shadow"
        title={
          <span className="vehicle_table-title">
            <CreditCardOutlined style={{ color: '#722ed1' }} />
            {t('parkingSub.subscriptionList')}
            <Tag color="blue" className="vehicle_tag-rounded-8">{filtered.length}</Tag>
          </span>
        }
      >
        {!tenantId ? (
          <div className="py-8 text-center">
            <Text type="secondary">{t('parkingSub.selectTenantFirst', 'Vui lòng chọn tenant từ trang chủ để xem danh sách đăng ký gửi xe.')}</Text>
          </div>
        ) : (
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${t('common.total')}: ${total}` }}
              size="small"
              scroll={{ x: 950 }}
            />
          </Spin>
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        title={<span><PlusOutlined /> {t('parkingSub.createSubscription')}</span>}
        open={createModalVisible}
        onCancel={() => { setCreateModalVisible(false); form.resetFields() }}
        onOk={handleCreate}
        okText={t('apiTest.create')}
        cancelText={t('apiTest.cancel')}
        width={600}
      >
        {subscriptionForm(form)}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span><EditOutlined /> {t('parkingSub.editSubscription')}</span>}
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setEditingRecord(null); editForm.resetFields() }}
        onOk={handleUpdate}
        okText={t('apiTest.update')}
        cancelText={t('apiTest.cancel')}
        width={600}
      >
        {subscriptionForm(editForm, true)}
      </Modal>
    </div>
  )
}
