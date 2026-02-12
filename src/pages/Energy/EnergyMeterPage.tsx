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
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { energyMeterApi, deviceApi } from '@/services'
import type {
  EnergyMeter,
  CreateEnergyMeterPayload,
  UpdateEnergyMeterPayload,
} from '@/services'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

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
      const res = await energyMeterApi.getList({ limit, offset })
      setMeters(res?.items || [])
      setTotal(res?.total || 0)
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
      const res = await energyMeterApi.getById(id)
      setSelectedMeter(res)
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
      // Parse meta if provided as JSON string
      if (typeof values.meta === 'string') {
        try { values.meta = JSON.parse(values.meta as unknown as string) } catch { values.meta = {} }
      }
      await energyMeterApi.create(values)
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
      if (typeof values.meta === 'string') {
        try { values.meta = JSON.parse(values.meta as unknown as string) } catch { values.meta = {} }
      }
      await energyMeterApi.update(editingId, values)
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
      await energyMeterApi.delete(id)
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
        <Text copyable={{ text: id || '' }} style={{ fontSize: 12, fontFamily: 'monospace' }}>
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
        <Tag color={type === 'main' ? 'blue' : type === 'sub' ? 'cyan' : 'default'} style={{ borderRadius: 12 }}>
          <ThunderboltOutlined style={{ marginRight: 4 }} />
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('energyMeter.phase'),
      dataIndex: 'phase',
      key: 'phase',
      width: 100,
      render: (phase: string) => <Tag style={{ borderRadius: 6 }}>{phase}</Tag>,
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
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => fetchMeterById(record.device_id)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
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
            <ThunderboltOutlined />
            {t('energyMeter.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('energyMeter.allSites')} — {t('common.total')}: {total}
          </Text>
        </div>
      </div>

      <Spin spinning={loading}>
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThunderboltOutlined style={{ color: '#faad14' }} />
              {t('energyMeter.meterList')}
            </span>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchMeters()}>
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
            dataSource={meters}
            rowKey="device_id"
            pagination={{
              total,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (t) => `${t} items`,
              onChange: (page, pageSize) => fetchMeters(pageSize, (page - 1) * pageSize),
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
          {/* device_id only for create */}
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
              <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', maxHeight: 200, overflow: 'auto' }}>
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
    </div>
  )
}
