import { useState, useEffect } from 'react'
import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Typography,
  Tag,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  Spin,
} from 'antd'
import { PageContainer, PageHeader, ContentCard, DataTable, CrudModal } from '@/components'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getEnergyAggregates, saveEnergyAggregates } from '@/services/mockPersistence'
import type {
  EnergyAggregate,
  CreateEnergyAggregatePayload,
  UpdateEnergyAggregatePayload,
} from '@/services'
import { useBuildingStore } from '@/stores'

const { Text } = Typography

export default function EnergyAggregatePage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [aggregates, setAggregates] = useState<EnergyAggregate[]>([])
  const [total, setTotal] = useState(0)
  const [selectedItem, setSelectedItem] = useState<EnergyAggregate | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchData() }, [])

  const fetchData = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const allItems = getEnergyAggregates<EnergyAggregate>([])
      setAggregates(allItems.slice(offset, offset + limit))
      setTotal(allItems.length)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchById = async (id: string) => {
    setLoading(true)
    try {
      const item = getEnergyAggregates<EnergyAggregate>([]).find((aggregate) => aggregate.scope_id === id) || null
      if (!item) throw new Error(`Energy aggregate ${id} not found`)
      setSelectedItem(item)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreate = async (values: any) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: CreateEnergyAggregatePayload = {
        scope_type: values.scope_type,
        scope_id: values.scope_id,
        bucket: values.bucket,
        bucket_start: values.bucket_start?.toISOString?.() || values.bucket_start,
        kwh: values.kwh,
        kw_avg: values.kw_avg,
        kw_peak: values.kw_peak,
        breakdown: values.breakdown ? (typeof values.breakdown === 'string' ? JSON.parse(values.breakdown) : values.breakdown) : {},
      }
      const now = new Date().toISOString()
      const currentItems = getEnergyAggregates<EnergyAggregate>([])
      const nextItems: EnergyAggregate[] = [
        {
          ...payload,
          created_at: now,
          updated_at: now,
        },
        ...currentItems,
      ]
      saveEnergyAggregates(nextItems)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (values: any) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const payload: UpdateEnergyAggregatePayload = {
        kwh: values.kwh,
        kw_avg: values.kw_avg,
        kw_peak: values.kw_peak,
        breakdown: values.breakdown ? (typeof values.breakdown === 'string' ? JSON.parse(values.breakdown) : values.breakdown) : undefined,
      }
      const now = new Date().toISOString()
      const currentItems = getEnergyAggregates<EnergyAggregate>([])
      let found = false
      const nextItems = currentItems.map((aggregate) => {
        if (aggregate.scope_id !== editingId) return aggregate
        found = true
        return {
          ...aggregate,
          ...payload,
          updated_at: now,
        }
      })
      if (!found) throw new Error(`Energy aggregate ${editingId} not found`)
      saveEnergyAggregates(nextItems)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchData()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      const currentItems = getEnergyAggregates<EnergyAggregate>([])
      const nextItems = currentItems.filter((aggregate) => aggregate.scope_id !== id)
      if (nextItems.length === currentItems.length) throw new Error(`Energy aggregate ${id} not found`)
      saveEnergyAggregates(nextItems)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchData()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openEditModal = (item: EnergyAggregate) => {
    setEditingId(item.scope_id)
    form.setFieldsValue({
      kwh: item.kwh,
      kw_avg: item.kw_avg,
      kw_peak: item.kw_peak,
      breakdown: JSON.stringify(item.breakdown || {}, null, 2),
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const bucketColor: Record<string, string> = {
    '15min': 'cyan',
    hourly: 'blue',
    daily: 'green',
    monthly: 'purple',
    yearly: 'orange',
  }

  const columns = [
    {
      title: t('energyAggregate.scopeType'),
      dataIndex: 'scope_type',
      key: 'scope_type',
      width: 110,
      render: (type: string) => <Tag className="rounded-sm">{type}</Tag>,
    },
    {
      title: t('energyAggregate.scopeId'),
      dataIndex: 'scope_id',
      key: 'scope_id',
      width: 120,
      ellipsis: true,
      render: (id: string) => (
        <Text copyable={{ text: id || '' }} className="text-sm font-mono">
          {id || '—'}
        </Text>
      ),
    },
    {
      title: t('energyAggregate.bucket'),
      dataIndex: 'bucket',
      key: 'bucket',
      width: 100,
      render: (bucket: string) => (
        <Tag color={bucketColor[bucket?.toLowerCase()] || 'default'} className="rounded-lg">
          {bucket}
        </Tag>
      ),
    },
    {
      title: t('energyAggregate.bucketStart'),
      dataIndex: 'bucket_start',
      key: 'bucket_start',
      width: 170,
      render: (date: string) => (
        <Text className="text-sm font-mono">
          {date ? new Date(date).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      title: 'kWh',
      dataIndex: 'kwh',
      key: 'kwh',
      width: 90,
      render: (v: number) => <Text strong className="text-primary">{v}</Text>,
    },
    {
      title: 'kW Avg',
      dataIndex: 'kw_avg',
      key: 'kw_avg',
      width: 90,
      render: (v: number) => <Text className="text-success">{v}</Text>,
    },
    {
      title: 'kW Peak',
      dataIndex: 'kw_peak',
      key: 'kw_peak',
      width: 90,
      render: (v: number) => <Text className="text-danger">{v}</Text>,
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 150,
      render: (_: unknown, record: EnergyAggregate) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchById(record.scope_id)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t('apiTest.confirmDelete')}
            onConfirm={() => handleDelete(record.scope_id)}
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
    <PageContainer>
      <PageHeader
        title={t('energyAggregate.title')}
        icon={<BarChartOutlined />}
        subtitle={`${selectedBuilding?.name || t('energyAggregate.allSites')} — ${t('common.total')}: ${total}`}
      />

      <Spin spinning={loading}>
        <ContentCard
          title={t('energyAggregate.aggregateList')}
          titleIcon={<BarChartOutlined />}
          titleIconColor="#722ed1"
          titleExtra={
            <>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                {t('apiTest.reload')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </>
          }
        >
          <DataTable<EnergyAggregate>
            columns={columns}
            dataSource={aggregates}
            rowKey={(record: EnergyAggregate) => `${record.scope_id}-${record.bucket}-${record.bucket_start}`}
            total={total}
            pageSize={10}
            onPageChange={(page, pageSize) => fetchData(pageSize, (page - 1) * pageSize)}
            scroll={{ x: 1000 }}
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
        width={600}
      >
          {!editingId && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="scope_type"
                    label={t('energyAggregate.scopeType')}
                    rules={[{ required: true, message: t('energyAggregate.scopeTypeRequired') }]}
                  >
                    <Select
                      placeholder={t('energyAggregate.selectScopeType')}
                      options={[
                        { value: 'building', label: 'Building' },
                        { value: 'floor', label: 'Floor' },
                        { value: 'zone', label: 'Zone' },
                        { value: 'meter', label: 'Meter' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="scope_id"
                    label={t('energyAggregate.scopeId')}
                    rules={[{ required: true, message: t('energyAggregate.scopeIdRequired') }]}
                  >
                    <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="bucket"
                    label={t('energyAggregate.bucket')}
                    rules={[{ required: true, message: t('energyAggregate.bucketRequired') }]}
                  >
                    <Select
                      placeholder={t('energyAggregate.selectBucket')}
                      options={[
                        { value: '15min', label: '15 min' },
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'yearly', label: 'Yearly' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bucket_start"
                    label={t('energyAggregate.bucketStart')}
                    rules={[{ required: true, message: t('energyAggregate.bucketStartRequired') }]}
                  >
                    <DatePicker showTime className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="kwh"
                label="kWh"
                rules={[{ required: !editingId, message: t('energyAggregate.kwhRequired') }]}
              >
                <InputNumber min={0} step={0.01} className="w-full" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="kw_avg"
                label="kW Avg"
                rules={[{ required: !editingId, message: t('energyAggregate.kwAvgRequired') }]}
              >
                <InputNumber min={0} step={0.01} className="w-full" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="kw_peak"
                label="kW Peak"
                rules={[{ required: !editingId, message: t('energyAggregate.kwPeakRequired') }]}
              >
                <InputNumber min={0} step={0.01} className="w-full" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="breakdown" label={t('energyAggregate.breakdown')}>
            <Input.TextArea
              rows={3}
              placeholder='{ "hvac": 120, "lighting": 45 }'
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
        {selectedItem ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('energyAggregate.scopeType')}>
              <Tag>{selectedItem.scope_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('energyAggregate.scopeId')}>{selectedItem.scope_id}</Descriptions.Item>
            <Descriptions.Item label={t('energyAggregate.bucket')}>
              <Tag color={bucketColor[selectedItem.bucket?.toLowerCase()] || 'default'}>
                {selectedItem.bucket}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('energyAggregate.bucketStart')}>
              {selectedItem.bucket_start ? new Date(selectedItem.bucket_start).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="kWh">
              <Text strong className="text-primary">{selectedItem.kwh}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="kW Avg">
              <Text className="text-success">{selectedItem.kw_avg}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="kW Peak">
              <Text className="text-danger">{selectedItem.kw_peak}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('energyAggregate.breakdown')}>
              <pre className="m-0 text-sm font-mono overflow-auto max-h-200">
                {JSON.stringify(selectedItem.breakdown, null, 2)}
              </pre>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t('common.noData')}</Text>
        )}
      </Modal>
    </PageContainer>
  )
}
