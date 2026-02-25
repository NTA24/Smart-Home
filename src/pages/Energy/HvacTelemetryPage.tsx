import { useEffect, useState } from 'react'
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
  DatePicker,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Spin,
  Tabs,
  Statistic,
} from 'antd'
import {
  SearchOutlined,
  UploadOutlined,
  ControlOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard, DataTable } from '@/components'
import { hvacTelemetryApi } from '@/services'
import type {
  HvacTelemetry,
  HvacTelemetryIngestItem,
} from '@/services'
import { useBuildingStore } from '@/stores'
import {
  getHvacTelemetryIngestDraft,
  getHvacTelemetryQuery,
  saveHvacTelemetryIngestDraft,
  saveHvacTelemetryQuery,
} from '@/services/mockPersistence'
import dayjs from 'dayjs'

const { Text } = Typography
type QueryFormValues = { asset_id?: string; range?: [dayjs.Dayjs, dayjs.Dayjs]; limit?: number }
type PersistedQueryFormValues = { asset_id?: string; range?: [string, string]; limit?: number }

function toPersistedQueryValues(values: QueryFormValues): PersistedQueryFormValues {
  return {
    asset_id: values.asset_id,
    range: values.range?.[0] && values.range?.[1]
      ? [values.range[0].toISOString(), values.range[1].toISOString()]
      : undefined,
    limit: values.limit,
  }
}

function toQueryFormValues(values: PersistedQueryFormValues): QueryFormValues {
  return {
    asset_id: values.asset_id,
    range: values.range?.[0] && values.range?.[1]
      ? [dayjs(values.range[0]), dayjs(values.range[1])]
      : undefined,
    limit: values.limit,
  }
}

const STATE_OPTIONS = ['ON', 'OFF', 'STANDBY', 'FAULT']
const STATE_COLORS: Record<string, string> = {
  ON: 'green',
  OFF: 'default',
  STANDBY: 'orange',
  FAULT: 'red',
}

export default function HvacTelemetryPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<HvacTelemetry[]>([])
  const [ingestModalVisible, setIngestModalVisible] = useState(false)
  const [ingestItems, setIngestItems] = useState<HvacTelemetryIngestItem[]>([])
  const [queryForm] = Form.useForm()
  const [ingestForm] = Form.useForm()

  useEffect(() => {
    const savedQuery = getHvacTelemetryQuery<PersistedQueryFormValues>({})
    queryForm.setFieldsValue(toQueryFormValues(savedQuery))
    setIngestItems(getHvacTelemetryIngestDraft<HvacTelemetryIngestItem[]>([]))
  }, [queryForm])

  useEffect(() => {
    saveHvacTelemetryIngestDraft(ingestItems)
  }, [ingestItems])

  const avgSupply = data.length > 0 ? data.reduce((a, d) => a + (d.supply_temp || 0), 0) / data.length : 0
  const avgReturn = data.length > 0 ? data.reduce((a, d) => a + (d.return_temp || 0), 0) / data.length : 0
  const avgKw = data.length > 0 ? data.reduce((a, d) => a + (d.kw || 0), 0) / data.length : 0
  const avgEer = data.length > 0 ? data.reduce((a, d) => a + (d.eer || 0), 0) / data.length : 0

  const handleQuery = async (values: { asset_id: string; range: [dayjs.Dayjs, dayjs.Dayjs]; limit?: number }) => {
    saveHvacTelemetryQuery(toPersistedQueryValues(values))
    setLoading(true)
    try {
      const res = await hvacTelemetryApi.query({
        asset_id: values.asset_id,
        start: values.range[0].toISOString(),
        end: values.range[1].toISOString(),
        limit: values.limit || 10000,
      })
      setData(Array.isArray(res) ? res : [])
      if (Array.isArray(res) && res.length === 0) {
        message.info(t('hvacTelemetry.noResults'))
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const addIngestItem = () => {
    ingestForm.validateFields().then(values => {
      const item: HvacTelemetryIngestItem = {
        asset_id: values.asset_id,
        ts: values.ts?.toISOString?.() || values.ts,
        supply_temp: values.supply_temp || 0,
        return_temp: values.return_temp || 0,
        flow: values.flow || 0,
        kw: values.kw || 0,
        eer: values.eer || 0,
        state: values.state || 'OFF',
        extra: values.extra ? (typeof values.extra === 'string' ? JSON.parse(values.extra) : values.extra) : {},
      }
      setIngestItems(prev => [...prev, item])
      ingestForm.resetFields(['ts', 'supply_temp', 'return_temp', 'flow', 'kw', 'eer', 'state', 'extra'])
    }).catch(() => {})
  }

  const removeIngestItem = (index: number) => {
    setIngestItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleIngest = async () => {
    if (ingestItems.length === 0) {
      message.warning(t('hvacTelemetry.noItemsToIngest'))
      return
    }
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await hvacTelemetryApi.ingestBulk(ingestItems)
      hide()
      message.success(t('hvacTelemetry.ingestSuccess'))
      setIngestItems([])
      setIngestModalVisible(false)
      ingestForm.resetFields()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('hvacTelemetry.ingestError')}: ${errorMsg}`)
    }
  }

  const columns = [
    {
      title: t('hvacTelemetry.assetId'),
      dataIndex: 'asset_id',
      key: 'asset_id',
      width: 140,
      ellipsis: true,
      render: (id: string) => (
        <Text copyable={{ text: id }} className="text-sm font-mono">
          {id?.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: t('hvacTelemetry.timestamp'),
      dataIndex: 'ts',
      key: 'ts',
      width: 170,
      render: (ts: string) => (
        <Text className="text-sm font-mono">
          {ts ? new Date(ts).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      title: t('hvacTelemetry.supplyTemp'),
      dataIndex: 'supply_temp',
      key: 'supply_temp',
      width: 90,
      render: (v: number) => <Text className="text-primary">{v?.toFixed(1)}°C</Text>,
    },
    {
      title: t('hvacTelemetry.returnTemp'),
      dataIndex: 'return_temp',
      key: 'return_temp',
      width: 90,
      render: (v: number) => <Text className="text-warning">{v?.toFixed(1)}°C</Text>,
    },
    {
      title: t('hvacTelemetry.flow'),
      dataIndex: 'flow',
      key: 'flow',
      width: 80,
      render: (v: number) => <Text>{v?.toFixed(1)} L/s</Text>,
    },
    {
      title: 'kW',
      dataIndex: 'kw',
      key: 'kw',
      width: 70,
      render: (v: number) => <Text strong>{v?.toFixed(2)}</Text>,
    },
    {
      title: 'EER',
      dataIndex: 'eer',
      key: 'eer',
      width: 70,
      render: (v: number) => (
        <Tag color={v >= 3 ? 'green' : v >= 2 ? 'orange' : 'red'} className="rounded">{v?.toFixed(2)}</Tag>
      ),
    },
    {
      title: t('hvacTelemetry.state'),
      dataIndex: 'state',
      key: 'state',
      width: 90,
      render: (s: string) => <Tag color={STATE_COLORS[s] || 'default'}>{s}</Tag>,
    },
  ]

  const ingestColumns = [
    { title: 'Asset ID', dataIndex: 'asset_id', key: 'asset_id', width: 100, ellipsis: true, render: (id: string) => <Text className="text-11 font-mono">{id?.substring(0, 8)}...</Text> },
    { title: 'Time', dataIndex: 'ts', key: 'ts', width: 140, render: (ts: string) => <Text className="text-11">{new Date(ts).toLocaleString()}</Text> },
    { title: 'Supply', dataIndex: 'supply_temp', key: 'supply_temp', width: 55, render: (v: number) => `${v}°C` },
    { title: 'Return', dataIndex: 'return_temp', key: 'return_temp', width: 55, render: (v: number) => `${v}°C` },
    { title: 'kW', dataIndex: 'kw', key: 'kw', width: 50 },
    { title: 'EER', dataIndex: 'eer', key: 'eer', width: 50 },
    { title: 'State', dataIndex: 'state', key: 'state', width: 60, render: (s: string) => <Tag color={STATE_COLORS[s] || 'default'} className="text-xs">{s}</Tag> },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_: unknown, __: unknown, index: number) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => removeIngestItem(index)} />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('hvacTelemetry.title')}
        icon={<ControlOutlined />}
        subtitle={selectedBuilding?.name || t('hvacTelemetry.allSites')}
        actions={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setIngestModalVisible(true)}>
            {t('hvacTelemetry.ingestData')}
          </Button>
        }
      />

      {/* Query Form */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '16px 24px' }}>
        <Form
          form={queryForm}
          layout="inline"
          onFinish={handleQuery}
          onValuesChange={(_, allValues) => saveHvacTelemetryQuery(toPersistedQueryValues(allValues))}
          className="energy_form-inline flex"
        >
          <Form.Item name="asset_id" rules={[{ required: true, message: t('hvacTelemetry.assetIdRequired') }]}>
            <Input placeholder={t('hvacTelemetry.assetId')} className="energy_input-w260" prefix={<ControlOutlined className="text-muted" />} />
          </Form.Item>
          <Form.Item name="range" rules={[{ required: true, message: t('hvacTelemetry.dateRangeRequired') }]}>
            <DatePicker.RangePicker showTime style={{ width: 380 }} />
          </Form.Item>
          <Form.Item name="limit">
            <InputNumber min={1} max={200000} placeholder="Limit (10000)" className="energy_input-w180" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              {t('hvacTelemetry.query')}
            </Button>
          </Form.Item>
        </Form>
      </ContentCard>

      {/* Stats */}
      {data.length > 0 && (
        <Row gutter={[16, 16]} className="mb-16">
          <Col xs={12} sm={6}>
            <Card bordered={false} className="content-card rounded-lg">
              <Statistic title={t('hvacTelemetry.avgSupplyTemp')} value={avgSupply.toFixed(1)} suffix="°C" valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className="content-card rounded-lg">
              <Statistic title={t('hvacTelemetry.avgReturnTemp')} value={avgReturn.toFixed(1)} suffix="°C" valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className="content-card rounded-lg">
              <Statistic title={t('hvacTelemetry.avgKw')} value={avgKw.toFixed(2)} suffix="kW" valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className="content-card rounded-lg">
              <Statistic title={t('hvacTelemetry.avgEer')} value={avgEer.toFixed(2)} valueStyle={{ color: avgEer >= 3 ? '#52c41a' : '#f5222d' }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Results */}
      <Spin spinning={loading}>
        <ContentCard
          title={<>{t('hvacTelemetry.results')} {data.length > 0 && `(${data.length})`}</>}
          titleIcon={<ControlOutlined />}
          titleIconColor="#722ed1"
        >
          <DataTable<HvacTelemetry>
            columns={columns}
            dataSource={data}
            rowKey={(_, i) => String(i)}
            pageSize={20}
            total={data.length}
            pagination={{
              pageSizeOptions: ['20', '50', '100', '500'],
              showTotal: (total) => `${total} records`,
            }}
            size="small"
            scroll={{ x: 850 }}
          />
        </ContentCard>
      </Spin>

      {/* Ingest Modal */}
      <Modal
        title={<span className="flex items-center gap-8"><UploadOutlined />{t('hvacTelemetry.ingestData')}</span>}
        open={ingestModalVisible}
        onCancel={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}
        width={800}
        footer={
          <Space>
            <Button onClick={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}>
              {t('apiTest.cancel')}
            </Button>
            <Button type="primary" onClick={handleIngest} disabled={ingestItems.length === 0}>
              {t('hvacTelemetry.ingest')} ({ingestItems.length} {t('hvacTelemetry.items')})
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'form',
              label: t('hvacTelemetry.addEntry'),
              children: (
                <Form form={ingestForm} layout="vertical">
                  <Form.Item name="asset_id" label={t('hvacTelemetry.assetId')} rules={[{ required: true }]}>
                    <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="ts" label={t('hvacTelemetry.timestamp')} rules={[{ required: true }]}>
                        <DatePicker showTime className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="state" label={t('hvacTelemetry.state')} rules={[{ required: true }]}>
                        <Select placeholder={t('hvacTelemetry.selectState')}>
                          {STATE_OPTIONS.map(s => (
                            <Select.Option key={s} value={s}><Tag color={STATE_COLORS[s]}>{s}</Tag></Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="supply_temp" label={t('hvacTelemetry.supplyTemp')} rules={[{ required: true }]}>
                        <InputNumber step={0.1} className="w-full" addonAfter="°C" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="return_temp" label={t('hvacTelemetry.returnTemp')} rules={[{ required: true }]}>
                        <InputNumber step={0.1} className="w-full" addonAfter="°C" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="flow" label={t('hvacTelemetry.flow')} rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.1} className="w-full" addonAfter="L/s" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="kw" label="kW" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="eer" label="EER" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="extra" label="Extra">
                        <Input.TextArea rows={1} placeholder='{}' className="font-mono text-sm" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addIngestItem} block>
                    {t('hvacTelemetry.addToQueue')}
                  </Button>
                </Form>
              ),
            },
            {
              key: 'queue',
              label: `${t('hvacTelemetry.queue')} (${ingestItems.length})`,
              children: (
                <Table
                  columns={ingestColumns}
                  dataSource={ingestItems}
                  rowKey={(_, i) => String(i)}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600, y: 300 }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  )
}
