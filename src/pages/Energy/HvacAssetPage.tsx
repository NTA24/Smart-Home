import { useState, useEffect } from 'react'
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard, DataTable, TableActionButtons, CrudModal } from '@/components'
import { tenantApi, deviceApi, spaceApi } from '@/services'
import type {
  HvacAsset,
  CreateHvacAssetPayload,
  UpdateHvacAssetPayload,
  Tenant,
} from '@/services'
import type { SpaceItem } from '@/services'
import { useBuildingStore } from '@/stores'
import { getHvacAssets, saveHvacAssets } from '@/services/mockPersistence'

const { Text } = Typography

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
      const allItems = getHvacAssets<HvacAsset>([])
      setAssets(allItems.slice(offset, offset + limit))
      setTotal(allItems.length)
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
      const item = getHvacAssets<HvacAsset>([]).find((asset) => asset.device_id === id) || null
      if (!item) throw new Error(`HVAC asset ${id} not found`)
      setSelectedAsset(item)
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
      const currentItems = getHvacAssets<HvacAsset>([])
      if (currentItems.some((asset) => asset.device_id === payload.device_id)) {
        throw new Error(`HVAC asset ${payload.device_id} already exists`)
      }
      const now = new Date().toISOString()
      const nextItems: HvacAsset[] = [
        {
          ...payload,
          created_at: now,
          updated_at: now,
        },
        ...currentItems,
      ]
      saveHvacAssets(nextItems)
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
      const now = new Date().toISOString()
      const currentItems = getHvacAssets<HvacAsset>([])
      let found = false
      const nextItems = currentItems.map((asset) => {
        if (asset.device_id !== editingId) return asset
        found = true
        return {
          ...asset,
          ...payload,
          updated_at: now,
        }
      })
      if (!found) throw new Error(`HVAC asset ${editingId} not found`)
      saveHvacAssets(nextItems)
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
      const currentItems = getHvacAssets<HvacAsset>([])
      const nextItems = currentItems.filter((asset) => asset.device_id !== id)
      if (nextItems.length === currentItems.length) throw new Error(`HVAC asset ${id} not found`)
      saveHvacAssets(nextItems)
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
        <Text copyable={{ text: id || '' }} className="text-sm font-mono">
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
        <Tag color={systemTypeColor[type?.toLowerCase()] || 'default'} className="rounded-lg">
          <ControlOutlined className="mr-4" />
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
        <TableActionButtons
          onView={() => fetchAssetById(record.device_id)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.device_id)}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('hvacAsset.title')}
        icon={<ControlOutlined />}
        subtitle={`${selectedBuilding?.name || t('hvacAsset.allSites')} — ${t('common.total')}: ${total}`}
      />

      <Spin spinning={loading}>
        <ContentCard
          title={t('hvacAsset.assetList')}
          titleIcon={<ControlOutlined />}
          titleIconColor="#1890ff"
          titleExtra={
            <>
              <Button icon={<ReloadOutlined />} onClick={() => fetchAssets()}>
                {t('apiTest.reload')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </>
          }
        >
          <DataTable<HvacAsset>
            columns={columns}
            dataSource={assets}
            rowKey="device_id"
            total={total}
            pageSize={10}
            onPageChange={(page, pageSize) => fetchAssets(pageSize, (page - 1) * pageSize)}
            scroll={{ x: 900 }}
          />
        </ContentCard>
      </Spin>

      {/* Create / Edit Modal */}
      <CrudModal
        title={editingId ? t('apiTest.edit') : t('apiTest.create')}
        open={modalVisible}
        isEdit={!!editingId}
        form={form}
        onClose={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        onSubmit={editingId ? handleUpdate : handleCreate}
      >
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
                  className="w-full"
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
              className="font-mono text-sm"
            />
          </Form.Item>
      </CrudModal>

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
              <pre className="m-0 text-sm font-mono overflow-auto max-h-200">
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
    </PageContainer>
  )
}

