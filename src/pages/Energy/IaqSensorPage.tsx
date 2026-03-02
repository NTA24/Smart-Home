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
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  CloudOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard, DataTable, TableActionButtons, CrudModal } from '@/components'
import { getIaqSensors, saveIaqSensors } from '@/services/mockPersistence'
import type {
  IaqSensor,
  CreateIaqSensorPayload,
  UpdateIaqSensorPayload,
} from '@/services'
import { useBuildingStore } from '@/stores'

const { Text } = Typography

export default function IaqSensorPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [sensors, setSensors] = useState<IaqSensor[]>([])
  const [total, setTotal] = useState(0)
  const [selectedSensor, setSelectedSensor] = useState<IaqSensor | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchSensors() }, [])

  const fetchSensors = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const allItems = getIaqSensors<IaqSensor>([])
      setSensors(allItems.slice(offset, offset + limit))
      setTotal(allItems.length)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchSensorById = async (id: string) => {
    setLoading(true)
    try {
      const item = getIaqSensors<IaqSensor>([]).find((sensor) => sensor.device_id === id) || null
      if (!item) throw new Error(`IAQ sensor ${id} not found`)
      setSelectedSensor(item)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateIaqSensorPayload & { meta?: string }) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: CreateIaqSensorPayload = {
        ...values,
        meta: values.meta ? (typeof values.meta === 'string' ? JSON.parse(values.meta) : values.meta) : {},
      }
      const currentItems = getIaqSensors<IaqSensor>([])
      if (currentItems.some((sensor) => sensor.device_id === payload.device_id)) {
        throw new Error(`IAQ sensor ${payload.device_id} already exists`)
      }
      const now = new Date().toISOString()
      const nextItems: IaqSensor[] = [
        {
          ...payload,
          created_at: now,
          updated_at: now,
        },
        ...currentItems,
      ]
      saveIaqSensors(nextItems)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchSensors()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateIaqSensorPayload & { meta?: string }) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: UpdateIaqSensorPayload = {
        ...values,
        meta: values.meta ? (typeof values.meta === 'string' ? JSON.parse(values.meta) : values.meta) : undefined,
      }
      const now = new Date().toISOString()
      const currentItems = getIaqSensors<IaqSensor>([])
      let found = false
      const nextItems = currentItems.map((sensor) => {
        if (sensor.device_id !== editingId) return sensor
        found = true
        return {
          ...sensor,
          ...payload,
          updated_at: now,
        }
      })
      if (!found) throw new Error(`IAQ sensor ${editingId} not found`)
      saveIaqSensors(nextItems)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchSensors()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const currentItems = getIaqSensors<IaqSensor>([])
      const nextItems = currentItems.filter((sensor) => sensor.device_id !== id)
      if (nextItems.length === currentItems.length) throw new Error(`IAQ sensor ${id} not found`)
      saveIaqSensors(nextItems)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchSensors()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openEditModal = (sensor: IaqSensor) => {
    setEditingId(sensor.device_id)
    form.setFieldsValue({
      sensor_type: sensor.sensor_type,
      meta: JSON.stringify(sensor.meta || {}, null, 2),
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const sensorTypeColor: Record<string, string> = {
    iaq: 'green',
    co2: 'orange',
    pm25: 'red',
    tvoc: 'purple',
    temperature: 'blue',
    humidity: 'cyan',
  }

  const columns = [
    {
      title: t('iaqSensor.deviceId'),
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
      title: t('iaqSensor.sensorType'),
      dataIndex: 'sensor_type',
      key: 'sensor_type',
      width: 130,
      render: (type: string) => (
        <Tag color={sensorTypeColor[type?.toLowerCase()] || 'default'} className="rounded-lg">
          <CloudOutlined className="mr-4" />
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('iaqSensor.meta'),
      dataIndex: 'meta',
      key: 'meta',
      width: 180,
      ellipsis: true,
      render: (meta: Record<string, unknown>) => (
        <Text className="text-11 font-mono text-muted">
          {JSON.stringify(meta || {})}
        </Text>
      ),
    },
    {
      title: t('apiTest.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 150,
      render: (_: unknown, record: IaqSensor) => (
        <TableActionButtons
          onView={() => fetchSensorById(record.device_id)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.device_id)}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('iaqSensor.title')}
        icon={<CloudOutlined />}
        subtitle={`${selectedBuilding?.name || t('iaqSensor.allSites')} — ${t('common.total')}: ${total}`}
      />

      <Spin spinning={loading}>
        <ContentCard
          title={t('iaqSensor.sensorList')}
          titleIcon={<CloudOutlined />}
          titleIconColor="#52c41a"
          titleExtra={
            <>
              <Button icon={<ReloadOutlined />} onClick={() => fetchSensors()}>
                {t('apiTest.reload')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </>
          }
        >
          <DataTable<IaqSensor>
            columns={columns}
            dataSource={sensors}
            rowKey="device_id"
            total={total}
            pageSize={10}
            onPageChange={(page, pageSize) => fetchSensors(pageSize, (page - 1) * pageSize)}
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
              label={t('iaqSensor.deviceId')}
              rules={[{ required: true, message: t('iaqSensor.deviceIdRequired') }]}
            >
              <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
            </Form.Item>
          )}

          <Form.Item
            name="sensor_type"
            label={t('iaqSensor.sensorType')}
            rules={[{ required: !editingId, message: t('iaqSensor.sensorTypeRequired') }]}
          >
            <Select
              placeholder={t('iaqSensor.selectSensorType')}
              options={[
                { value: 'IAQ', label: 'IAQ (Indoor Air Quality)' },
                { value: 'CO2', label: 'CO2' },
                { value: 'PM25', label: 'PM2.5' },
                { value: 'TVOC', label: 'TVOC' },
                { value: 'Temperature', label: 'Temperature' },
                { value: 'Humidity', label: 'Humidity' },
              ]}
            />
          </Form.Item>

          <Form.Item name="meta" label={t('iaqSensor.meta')}>
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
        {selectedSensor ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('iaqSensor.deviceId')}>{selectedSensor.device_id}</Descriptions.Item>
            <Descriptions.Item label={t('iaqSensor.sensorType')}>
              <Tag color={sensorTypeColor[selectedSensor.sensor_type != null ? selectedSensor.sensor_type.toLowerCase() : ''] || 'default'}>
                {selectedSensor.sensor_type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('iaqSensor.meta')}>
              <pre className="m-0 text-sm font-mono overflow-auto max-h-200">
                {JSON.stringify(selectedSensor.meta, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedSensor.created_at ? new Date(selectedSensor.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedSensor.updated_at ? new Date(selectedSensor.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t('common.noData')}</Text>
        )}
      </Modal>
    </PageContainer>
  )
}
