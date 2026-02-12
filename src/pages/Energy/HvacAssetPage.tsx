import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Typography,
  Tag,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { hvacAssetApi, tenantApi, deviceApi, spaceApi } from '@/services'
import type {
  HvacAsset,
  CreateHvacAssetPayload,
  UpdateHvacAssetPayload,
  Tenant,
} from '@/services'
import type { SpaceItem } from '@/services'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

export default function HvacAssetPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [assets, setAssets] = useState<HvacAsset[]>([])
  const [total, setTotal] = useState(0)
  const [selectedAsset, setSelectedAsset] = useState<HvacAsset | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  // Dropdown data for create modal
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [devices, setDevices] = useState<Record<string, unknown>[]>([])
  const [spaces, setSpaces] = useState<SpaceItem[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [spacesLoading, setSpacesLoading] = useState(false)

  useEffect(() => { fetchAssets() }, [])

  const fetchAssets = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const res = await hvacAssetApi.getList({ limit, offset })
      setAssets(res?.items || [])
      setTotal(res?.total || 0)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssetById = async (id: string) => {
    setLoading(true)
    try {
      const res = await hvacAssetApi.getById(id)
      setSelectedAsset(res)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateHvacAssetPayload & { meta?: string }) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: CreateHvacAssetPayload = {
        ...values,
        meta: values.meta ? (typeof values.meta === 'string' ? JSON.parse(values.meta) : values.meta) : {},
      }
      await hvacAssetApi.create(payload)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchAssets()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateHvacAssetPayload & { meta?: string }) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: UpdateHvacAssetPayload = {
        ...values,
        meta: values.meta ? (typeof values.meta === 'string' ? JSON.parse(values.meta) : values.meta) : undefined,
      }
      await hvacAssetApi.update(editingId, payload)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchAssets()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await hvacAssetApi.delete(id)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchAssets()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openEditModal = (asset: HvacAsset) => {
    setEditingId(asset.device_id)
    form.setFieldsValue({
      system_type: asset.system_type,
      rated_kw: asset.rated_kw,
      meta: JSON.stringify(asset.meta || {}, null, 2),
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
    // Fetch dropdown data
    fetchTenants()
    fetchDevices()
    fetchSpaces()
  }

  const fetchTenants = async () => {
    setTenantsLoading(true)
    try {
      const res = await tenantApi.getList({ limit: 100, offset: 0 })
      setTenants(res?.items || [])
    } catch {
      setTenants([])
    } finally {
      setTenantsLoading(false)
    }
  }

  const fetchDevices = async () => {
    setDevicesLoading(true)
    try {
      const res = await deviceApi.getList({ limit: 100, offset: 0 })
      const items = Array.isArray(res) ? res : (res as Record<string, unknown>)?.items || []
      setDevices(items as Record<string, unknown>[])
    } catch {
      setDevices([])
    } finally {
      setDevicesLoading(false)
    }
  }

  const fetchSpaces = async () => {
    setSpacesLoading(true)
    try {
      const res = await spaceApi.getList({ limit: 100, offset: 0 })
      setSpaces(res?.items || [])
    } catch {
      setSpaces([])
    } finally {
      setSpacesLoading(false)
    }
  }

  const systemTypeColor: Record<string, string> = {
    ahu: 'blue',
    chiller: 'cyan',
    fcu: 'green',
    vrf: 'purple',
    split: 'orange',
  }

  const columns = [
    {
      title: t('hvacAsset.deviceId'),
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
      ellipsis: true,
      render: (id: string) => (
        <Text copyable={{ text: id || '' }} style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id || '—'}
        </Text>
      ),
    },
    {
      title: t('hvacAsset.systemType'),
      dataIndex: 'system_type',
      key: 'system_type',
      width: 120,
      render: (type: string) => (
        <Tag color={systemTypeColor[type?.toLowerCase()] || 'default'} style={{ borderRadius: 12 }}>
          <ControlOutlined style={{ marginRight: 4 }} />
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('hvacAsset.ratedKw'),
      dataIndex: 'rated_kw',
      key: 'rated_kw',
      width: 100,
      render: (kw: number) => <Text strong>{kw} kW</Text>,
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 150,
      render: (_: unknown, record: HvacAsset) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchAssetById(record.device_id)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t('apiTest.confirmDelete')}
            onConfirm={() => handleDelete(record.device_id)}
            okText={t('apiTest.yes')}
            cancelText={t('apiTest.no')}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ControlOutlined />
            {t('hvacAsset.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('hvacAsset.allSites')} — {t('common.total')}: {total}
          </Text>
        </div>
      </div>

      <Spin spinning={loading}>
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ControlOutlined style={{ color: '#1890ff' }} />
              {t('hvacAsset.assetList')}
            </span>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchAssets()}>
                {t('apiTest.reload')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={assets}
            rowKey="device_id"
            pagination={{
              total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `${t} items`,
              onChange: (page, pageSize) => fetchAssets(pageSize, (page - 1) * pageSize),
            }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Card>
      </Spin>

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? t('apiTest.edit') : t('apiTest.create')}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingId ? handleUpdate : handleCreate}
        >
          {/* Fields only for create */}
          {!editingId && (
            <>
              <Form.Item
                name="tenant_id"
                label={t('hvacAsset.tenantId')}
                rules={[{ required: true, message: t('hvacAsset.tenantIdRequired') }]}
              >
                <Select
                  showSearch
                  loading={tenantsLoading}
                  placeholder={t('hvacAsset.selectTenant')}
                  optionFilterProp="label"
                  options={tenants.map((tn) => ({
                    value: tn.id,
                    label: `${tn.name || tn.id}`,
                  }))}
                  notFoundContent={tenantsLoading ? <Spin size="small" /> : t('common.noData')}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="device_id"
                    label={t('hvacAsset.deviceId')}
                    rules={[{ required: true, message: t('hvacAsset.deviceIdRequired') }]}
                  >
                    <Select
                      showSearch
                      loading={devicesLoading}
                      placeholder={t('hvacAsset.selectDevice')}
                      optionFilterProp="label"
                      options={devices.map((d) => ({
                        value: (d.id || d.device_id || d._id) as string,
                        label: `${d.name || d.device_id || d.id}${d.type ? ` (${d.type})` : ''}`,
                      }))}
                      notFoundContent={devicesLoading ? <Spin size="small" /> : t('common.noData')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="space_id"
                    label={t('hvacAsset.spaceId')}
                    rules={[{ required: true, message: t('hvacAsset.spaceIdRequired') }]}
                  >
                    <Select
                      showSearch
                      loading={spacesLoading}
                      placeholder={t('hvacAsset.selectSpace')}
                      optionFilterProp="label"
                      options={spaces.map((s) => ({
                        value: (s.id || s.space_id) as string,
                        label: `${s.name || s.space_id || s.id}${s.space_type ? ` (${s.space_type})` : ''}${s.floor ? ` - ${s.floor}` : ''}`,
                      }))}
                      notFoundContent={spacesLoading ? <Spin size="small" /> : t('common.noData')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="system_type"
                label={t('hvacAsset.systemType')}
                rules={[{ required: !editingId, message: t('hvacAsset.systemTypeRequired') }]}
              >
                <Select
                  placeholder={t('hvacAsset.selectSystemType')}
                  options={[
                    { value: 'ahu', label: 'AHU (Air Handling Unit)' },
                    { value: 'chiller', label: 'Chiller' },
                    { value: 'fcu', label: 'FCU (Fan Coil Unit)' },
                    { value: 'vrf', label: 'VRF (Variable Refrigerant Flow)' },
                    { value: 'split', label: 'Split System' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rated_kw"
                label={t('hvacAsset.ratedKw')}
                rules={[{ required: !editingId, message: t('hvacAsset.ratedKwRequired') }]}
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0"
                  addonAfter="kW"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="meta" label={t('hvacAsset.meta')}>
            <Input.TextArea
              rows={3}
              placeholder='{ "key": "value" }'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}>
                {t('apiTest.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? t('apiTest.update') : t('apiTest.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={t('apiTest.detail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>{t('apiTest.close')}</Button>}
        width={600}
      >
        {selectedAsset ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('hvacAsset.deviceId')}>{selectedAsset.device_id}</Descriptions.Item>
            <Descriptions.Item label={t('hvacAsset.systemType')}>
              <Tag color={systemTypeColor[selectedAsset.system_type?.toLowerCase()] || 'default'}>
                {selectedAsset.system_type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('hvacAsset.ratedKw')}>
              <Text strong>{selectedAsset.rated_kw} kW</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('hvacAsset.meta')}>
              <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(selectedAsset.meta, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedAsset.created_at ? new Date(selectedAsset.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedAsset.updated_at ? new Date(selectedAsset.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t('common.noData')}</Text>
        )}
      </Modal>
    </div>
  )
}
