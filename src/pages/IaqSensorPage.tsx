import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Popconfirm,
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { iaqSensorApi } from '@/services'
import type {
  IaqSensor,
  CreateIaqSensorPayload,
  UpdateIaqSensorPayload,
} from '@/services'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

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
      const res = await iaqSensorApi.getList({ limit, offset })
      setSensors(res?.items || [])
      setTotal(res?.total || 0)
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
      const res = await iaqSensorApi.getById(id)
      setSelectedSensor(res)
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
      await iaqSensorApi.create(payload)
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
      await iaqSensorApi.update(editingId, payload)
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
      await iaqSensorApi.delete(id)
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
        <Text copyable={{ text: id || '' }} style={{ fontSize: 12, fontFamily: 'monospace' }}>
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
        <Tag color={sensorTypeColor[type?.toLowerCase()] || 'default'} style={{ borderRadius: 12 }}>
          <CloudOutlined style={{ marginRight: 4 }} />
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
        <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#8c8c8c' }}>
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
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchSensorById(record.device_id)} />
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
            <CloudOutlined />
            {t('iaqSensor.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('iaqSensor.allSites')} — {t('common.total')}: {total}
          </Text>
        </div>
      </div>

      <Spin spinning={loading}>
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudOutlined style={{ color: '#52c41a' }} />
              {t('iaqSensor.sensorList')}
            </span>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchSensors()}>
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
            dataSource={sensors}
            rowKey="device_id"
            pagination={{
              total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `${t} items`,
              onChange: (page, pageSize) => fetchSensors(pageSize, (page - 1) * pageSize),
            }}
            size="middle"
            scroll={{ x: 800 }}
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
        {selectedSensor ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('iaqSensor.deviceId')}>{selectedSensor.device_id}</Descriptions.Item>
            <Descriptions.Item label={t('iaqSensor.sensorType')}>
              <Tag color={sensorTypeColor[selectedSensor.sensor_type?.toLowerCase()] || 'default'}>
                {selectedSensor.sensor_type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('iaqSensor.meta')}>
              <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', maxHeight: 200, overflow: 'auto' }}>
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
    </div>
  )
}
