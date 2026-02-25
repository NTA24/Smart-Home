import { useState, useEffect } from 'react'
import {
  Button,
  Modal,
  Form,
  Input,
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
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard, DataTable, TableActionButtons, CrudModal } from '@/components'
import { deviceApi } from '@/services'
import type {
  EnergyMeter,
  CreateEnergyMeterPayload,
  UpdateEnergyMeterPayload,
} from '@/services'
import { useBuildingStore } from '@/stores'
import { getEnergyMeters, saveEnergyMeters } from '@/services/mockPersistence'

const { Text } = Typography

export default function EnergyMeterPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [meters, setMeters] = useState<EnergyMeter[]>([])
  const [total, setTotal] = useState(0)
  const [selectedMeter, setSelectedMeter] = useState<EnergyMeter | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devices, setDevices] = useState<any[]>([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { fetchMeters() }, [])

  const fetchDevices = async () => {
    setDevicesLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await deviceApi.getList({ limit: 500, offset: 0 })
      setDevices(res?.items || res || [])
    } catch {
      setDevices([])
    } finally {
      setDevicesLoading(false)
    }
  }

  const fetchMeters = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const allItems = getEnergyMeters<EnergyMeter>([])
      setMeters(allItems.slice(offset, offset + limit))
      setTotal(allItems.length)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchMeterById = async (id: string) => {
    setLoading(true)
    try {
      const item = getEnergyMeters<EnergyMeter>([]).find((meter) => meter.device_id === id) || null
      if (!item) throw new Error(`Energy meter ${id} not found`)
      setSelectedMeter(item)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateEnergyMeterPayload) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const parsedMeta =
        typeof values.meta === 'string'
          ? JSON.parse(values.meta as unknown as string)
          : values.meta || {}
      const currentItems = getEnergyMeters<EnergyMeter>([])
      if (currentItems.some((meter) => meter.device_id === values.device_id)) {
        throw new Error(`Energy meter ${values.device_id} already exists`)
      }
      const now = new Date().toISOString()
      const nextItems: EnergyMeter[] = [
        {
          ...values,
          meta: parsedMeta,
          created_at: now,
          updated_at: now,
        },
        ...currentItems,
      ]
      saveEnergyMeters(nextItems)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchMeters()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateEnergyMeterPayload) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const parsedMeta =
        typeof values.meta === 'string'
          ? JSON.parse(values.meta as unknown as string)
          : values.meta
      const now = new Date().toISOString()
      const currentItems = getEnergyMeters<EnergyMeter>([])
      let found = false
      const nextItems = currentItems.map((meter) => {
        if (meter.device_id !== editingId) return meter
        found = true
        return {
          ...meter,
          ...values,
          ...(parsedMeta !== undefined ? { meta: parsedMeta } : {}),
          updated_at: now,
        }
      })
      if (!found) throw new Error(`Energy meter ${editingId} not found`)
      saveEnergyMeters(nextItems)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchMeters()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const currentItems = getEnergyMeters<EnergyMeter>([])
      const nextItems = currentItems.filter((meter) => meter.device_id !== id)
      if (nextItems.length === currentItems.length) throw new Error(`Energy meter ${id} not found`)
      saveEnergyMeters(nextItems)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchMeters()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openEditModal = (meter: EnergyMeter) => {
    setEditingId(meter.device_id)
    form.setFieldsValue({
      meter_type: meter.meter_type,
      phase: meter.phase,
      unit_default: meter.unit_default,
      meta: JSON.stringify(meter.meta || {}, null, 2),
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    fetchDevices()
    setModalVisible(true)
  }

  const columns = [
    {
      title: t('energyMeter.deviceId'),
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
      title: t('energyMeter.meterType'),
      dataIndex: 'meter_type',
      key: 'meter_type',
      width: 110,
      render: (type: string) => (
        <Tag color={type === 'main' ? 'blue' : type === 'sub' ? 'cyan' : 'default'} className="rounded-lg">
          <ThunderboltOutlined className="mr-4" />
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('energyMeter.phase'),
      dataIndex: 'phase',
      key: 'phase',
      width: 100,
      render: (phase: string) => <Tag className="rounded-sm">{phase}</Tag>,
    },
    {
      title: t('energyMeter.unit'),
      dataIndex: 'unit_default',
      key: 'unit_default',
      width: 80,
      render: (unit: string) => <Text strong>{unit}</Text>,
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 80,
      render: () => <Tag color="green">ACTIVE</Tag>,
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 150,
      render: (_: unknown, record: EnergyMeter) => (
        <TableActionButtons
          onView={() => fetchMeterById(record.device_id)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.device_id)}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('energyMeter.title')}
        icon={<ThunderboltOutlined />}
        subtitle={`${selectedBuilding?.name || t('energyMeter.allSites')} — ${t('common.total')}: ${total}`}
      />

      <Spin spinning={loading}>
        <ContentCard
          title={t('energyMeter.meterList')}
          titleIcon={<ThunderboltOutlined />}
          titleIconColor="#faad14"
          titleExtra={
            <>
              <Button icon={<ReloadOutlined />} onClick={() => fetchMeters()}>
                {t('apiTest.reload')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </>
          }
        >
          <DataTable<EnergyMeter>
            columns={columns}
            dataSource={meters}
            rowKey="device_id"
            total={total}
            pageSize={10}
            onPageChange={(page, pageSize) => fetchMeters(pageSize, (page - 1) * pageSize)}
            scroll={{ x: 800 }}
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
            <Form.Item
              name="device_id"
              label={t('energyMeter.deviceId')}
              rules={[{ required: true, message: t('energyMeter.deviceIdRequired') }]}
            >
              <Select
                showSearch
                loading={devicesLoading}
                placeholder={t('energyMeter.selectDevice')}
                optionFilterProp="label"
                options={devices.map((d: Record<string, unknown>) => ({
                  value: d.id || d.device_id || d._id,
                  label: `${d.name || d.device_id || d.id}${d.type ? ` (${d.type})` : ''}`,
                }))}
                notFoundContent={devicesLoading ? <Spin size="small" /> : t('common.noData')}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="meter_type"
                label={t('energyMeter.meterType')}
                rules={[{ required: !editingId, message: t('energyMeter.meterTypeRequired') }]}
              >
                <Select
                  placeholder={t('energyMeter.selectMeterType')}
                  options={[
                    { value: 'main', label: 'Main' },
                    { value: 'sub', label: 'Sub' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phase"
                label={t('energyMeter.phase')}
                rules={[{ required: !editingId, message: t('energyMeter.phaseRequired') }]}
              >
                <Select
                  placeholder={t('energyMeter.selectPhase')}
                  options={[
                    { value: '1-phase', label: '1 Phase' },
                    { value: '3-phase', label: '3 Phase' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="unit_default"
            label={t('energyMeter.unit')}
            rules={[{ required: !editingId, message: t('energyMeter.unitRequired') }]}
          >
            <Select
              placeholder={t('energyMeter.selectUnit')}
              options={[
                { value: 'kwh', label: 'kWh' },
                { value: 'mwh', label: 'MWh' },
                { value: 'wh', label: 'Wh' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="meta"
            label={t('energyMeter.meta')}
          >
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
        {selectedMeter ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('energyMeter.deviceId')}>{selectedMeter.device_id}</Descriptions.Item>
            <Descriptions.Item label={t('energyMeter.meterType')}>
              <Tag color={selectedMeter.meter_type === 'main' ? 'blue' : 'cyan'}>
                {selectedMeter.meter_type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('energyMeter.phase')}>{selectedMeter.phase}</Descriptions.Item>
            <Descriptions.Item label={t('energyMeter.unit')}>{selectedMeter.unit_default}</Descriptions.Item>
            <Descriptions.Item label={t('energyMeter.meta')}>
              <pre className="m-0 text-sm font-mono overflow-auto max-h-200">
                {JSON.stringify(selectedMeter.meta, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedMeter.created_at ? new Date(selectedMeter.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedMeter.updated_at ? new Date(selectedMeter.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t('common.noData')}</Text>
        )}
      </Modal>
    </PageContainer>
  )
}
