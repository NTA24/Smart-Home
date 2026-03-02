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
  CloudOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard, DataTable } from '@/components'
import { iaqTelemetryApi } from '@/services'
import type {
  IaqTelemetry,
  IaqTelemetryIngestItem,
} from '@/services'
import { useBuildingStore } from '@/stores'
import {
  getIaqTelemetryIngestDraft,
  getIaqTelemetryQuery,
  saveIaqTelemetryIngestDraft,
  saveIaqTelemetryQuery,
} from '@/services/mockPersistence'
import dayjs from 'dayjs'

const { Text } = Typography
type QueryFormValues = { device_id?: string; range?: [dayjs.Dayjs, dayjs.Dayjs]; limit?: number }
type PersistedQueryFormValues = { device_id?: string; range?: [string, string]; limit?: number }

function toPersistedQueryValues(values: QueryFormValues): PersistedQueryFormValues {
  return {
    device_id: values.device_id,
    range: values.range?.[0] && values.range?.[1]
      ? [values.range[0].toISOString(), values.range[1].toISOString()]
      : undefined,
    limit: values.limit,
  }
}

function toQueryFormValues(values: PersistedQueryFormValues): QueryFormValues {
  return {
    device_id: values.device_id,
    range: values.range?.[0] && values.range?.[1]
      ? [dayjs(values.range[0]), dayjs(values.range[1])]
      : undefined,
    limit: values.limit,
  }
}

export default function IaqTelemetryPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<IaqTelemetry[]>([])
  const [ingestModalVisible, setIngestModalVisible] = useState(false)
  const [ingestItems, setIngestItems] = useState<IaqTelemetryIngestItem[]>([])
  const [queryForm] = Form.useForm()
  const [ingestForm] = Form.useForm()

  useEffect(() => {
    const savedQuery = getIaqTelemetryQuery<PersistedQueryFormValues>({})
    queryForm.setFieldsValue(toQueryFormValues(savedQuery))
    setIngestItems(getIaqTelemetryIngestDraft<IaqTelemetryIngestItem[]>([]))
  }, [queryForm])

  useEffect(() => {
    saveIaqTelemetryIngestDraft(ingestItems)
  }, [ingestItems])

  const avgTemp = data.length > 0 ? data.reduce((a, d) => a + (d.temp_c || 0), 0) / data.length : 0
  const avgHumidity = data.length > 0 ? data.reduce((a, d) => a + (d.humidity || 0), 0) / data.length : 0
  const avgCo2 = data.length > 0 ? data.reduce((a, d) => a + (d.co2_ppm || 0), 0) / data.length : 0
  const avgPm25 = data.length > 0 ? data.reduce((a, d) => a + (d.pm25 || 0), 0) / data.length : 0

  const handleQuery = async (values: { device_id: string; range: [dayjs.Dayjs, dayjs.Dayjs]; limit?: number }) => {
    saveIaqTelemetryQuery(toPersistedQueryValues(values))
    setLoading(true)
    try {
      const res = await iaqTelemetryApi.query({
        sensor_id: values.device_id,
        start: values.range[0].toISOString(),
        end: values.range[1].toISOString(),
      })
      setData(Array.isArray(res) ? res : [])
      if (Array.isArray(res) && res.length === 0) {
        message.info(t('iaqTelemetry.noResults'))
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
      const item: IaqTelemetryIngestItem = {
        sensor_id: values.device_id ?? '',
        ts: String(values.ts?.toISOString?.() ?? values.ts ?? ''),
        temp_c: values.temp_c || 0,
        humidity: values.humidity || 0,
        co2_ppm: values.co2_ppm || 0,
        pm25: values.pm25 || 0,
        extra: values.extra ? (typeof values.extra === 'string' ? JSON.parse(values.extra) : values.extra) : {},
      }
      setIngestItems(prev => [...prev, item])
      ingestForm.resetFields(['ts', 'temp_c', 'humidity', 'co2_ppm', 'pm25', 'extra'])
    }).catch(() => {})
  }

  const removeIngestItem = (index: number) => {
    setIngestItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleIngest = async () => {
    if (ingestItems.length === 0) {
      message.warning(t('iaqTelemetry.noItemsToIngest'))
      return
    }
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await iaqTelemetryApi.ingestBulk(ingestItems)
      hide()
      message.success(t('iaqTelemetry.ingestSuccess'))
      setIngestItems([])
      setIngestModalVisible(false)
      ingestForm.resetFields()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('iaqTelemetry.ingestError')}: ${errorMsg}`)
    }
  }

  const co2Color = (v: number) => v <= 800 ? 'green' : v <= 1200 ? 'orange' : 'red'
  const pm25Color = (v: number) => v <= 35 ? 'green' : v <= 75 ? 'orange' : 'red'

  const columns = [
    {
      title: t('iaqTelemetry.deviceId'),
      dataIndex: 'device_id',
      key: 'device_id',
      width: 140,
      ellipsis: true,
      render: (id: string) => (
        <Text copyable={{ text: id }} className="text-sm font-mono">
          {id?.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: t('iaqTelemetry.timestamp'),
      dataIndex: 'ts',
      key: 'ts',
      width: 180,
      render: (ts: string) => (
        <Text className="text-sm font-mono">
          {ts ? new Date(ts).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      title: t('iaqTelemetry.tempC'),
      dataIndex: 'temp_c',
      key: 'temp_c',
      width: 90,
      render: (v: number) => <Text strong className="text-warning">{v?.toFixed(1)}°C</Text>,
    },
    {
      title: t('iaqTelemetry.humidity'),
      dataIndex: 'humidity',
      key: 'humidity',
      width: 100,
      render: (v: number) => <Text className="text-primary">{v?.toFixed(1)}%</Text>,
    },
    {
      title: 'CO₂',
      dataIndex: 'co2_ppm',
      key: 'co2_ppm',
      width: 110,
      render: (v: number) => (
        <Tag color={co2Color(v)} className="rounded">{v} ppm</Tag>
      ),
    },
    {
      title: 'PM2.5',
      dataIndex: 'pm25',
      key: 'pm25',
      width: 100,
      render: (v: number) => (
        <Tag color={pm25Color(v)} className="rounded">{v} µg/m³</Tag>
      ),
    },
  ]

  const ingestColumns = [
    { title: 'Device ID', dataIndex: 'device_id', key: 'device_id', width: 110, ellipsis: true, render: (id: string) => <Text className="text-11 font-mono">{id?.substring(0, 8)}...</Text> },
    { title: 'Time', dataIndex: 'ts', key: 'ts', width: 150, render: (ts: string) => <Text className="text-11">{new Date(ts).toLocaleString()}</Text> },
    { title: '°C', dataIndex: 'temp_c', key: 'temp_c', width: 50 },
    { title: '%RH', dataIndex: 'humidity', key: 'humidity', width: 50 },
    { title: 'CO₂', dataIndex: 'co2_ppm', key: 'co2_ppm', width: 60 },
    { title: 'PM2.5', dataIndex: 'pm25', key: 'pm25', width: 60 },
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
        title={t('iaqTelemetry.title')}
        icon={<CloudOutlined />}
        subtitle={selectedBuilding?.name || t('iaqTelemetry.allSites')}
        actions={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setIngestModalVisible(true)}>
            {t('iaqTelemetry.ingestData')}
          </Button>
        }
      />

      {/* Query Form */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '16px 24px' }}>
        <Form
          form={queryForm}
          layout="inline"
          onFinish={handleQuery}
          onValuesChange={(_, allValues) => saveIaqTelemetryQuery(toPersistedQueryValues(allValues))}
          className="energy_form-inline flex"
        >
          <Form.Item name="device_id" rules={[{ required: true, message: t('iaqTelemetry.deviceIdRequired') }]}>
            <Input placeholder={t('iaqTelemetry.deviceId')} className="energy_input-w260" prefix={<CloudOutlined className="text-muted" />} />
          </Form.Item>
          <Form.Item name="range" rules={[{ required: true, message: t('iaqTelemetry.dateRangeRequired') }]}>
            <DatePicker.RangePicker showTime style={{ width: 380 }} />
          </Form.Item>
          <Form.Item name="limit">
            <InputNumber min={1} max={200000} placeholder="Limit (10000)" className="energy_input-w180" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              {t('iaqTelemetry.query')}
            </Button>
          </Form.Item>
        </Form>
      </ContentCard>

      {/* Stats */}
      {data.length > 0 && (
        <Row gutter={[16, 16]} className="mb-16">
          <Col xs={12} sm={6}>
            <Card variant="borderless" className="content-card rounded-lg">
              <Statistic title={t('iaqTelemetry.avgTemp')} value={avgTemp.toFixed(1)} suffix="°C" valueStyle={{ color: '#fa8c16' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" className="content-card rounded-lg">
              <Statistic title={t('iaqTelemetry.avgHumidity')} value={avgHumidity.toFixed(1)} suffix="%" valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" className="content-card rounded-lg">
              <Statistic title={t('iaqTelemetry.avgCo2')} value={avgCo2.toFixed(0)} suffix="ppm" valueStyle={{ color: avgCo2 <= 800 ? '#52c41a' : '#f5222d' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" className="content-card rounded-lg">
              <Statistic title={t('iaqTelemetry.avgPm25')} value={avgPm25.toFixed(1)} suffix="µg/m³" valueStyle={{ color: avgPm25 <= 35 ? '#52c41a' : '#f5222d' }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Results */}
      <Spin spinning={loading}>
        <ContentCard
          title={<>{t('iaqTelemetry.results')} {data.length > 0 && `(${data.length})`}</>}
          titleIcon={<CloudOutlined />}
          titleIconColor="#52c41a"
        >
          <DataTable<IaqTelemetry>
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
            scroll={{ x: 750 }}
          />
        </ContentCard>
      </Spin>

      {/* Ingest Modal */}
      <Modal
        title={<span className="flex items-center gap-8"><UploadOutlined />{t('iaqTelemetry.ingestData')}</span>}
        open={ingestModalVisible}
        onCancel={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}
        width={750}
        footer={
          <Space>
            <Button onClick={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}>
              {t('apiTest.cancel')}
            </Button>
            <Button type="primary" onClick={handleIngest} disabled={ingestItems.length === 0}>
              {t('iaqTelemetry.ingest')} ({ingestItems.length} {t('iaqTelemetry.items')})
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'form',
              label: t('iaqTelemetry.addEntry'),
              children: (
                <Form form={ingestForm} layout="vertical">
                  <Form.Item name="device_id" label={t('iaqTelemetry.deviceId')} rules={[{ required: true }]}>
                    <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="ts" label={t('iaqTelemetry.timestamp')} rules={[{ required: true }]}>
                        <DatePicker showTime className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="temp_c" label={t('iaqTelemetry.tempC')} rules={[{ required: true }]}>
                        <InputNumber step={0.1} className="w-full" addonAfter="°C" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="humidity" label={t('iaqTelemetry.humidity')} rules={[{ required: true }]}>
                        <InputNumber min={0} max={100} step={0.1} className="w-full" addonAfter="%" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="co2_ppm" label="CO₂ (ppm)" rules={[{ required: true }]}>
                        <InputNumber min={0} step={1} className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="pm25" label="PM2.5 (µg/m³)" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.1} className="w-full" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="extra" label="Extra">
                    <Input.TextArea rows={2} placeholder='{}' className="font-mono text-sm" />
                  </Form.Item>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addIngestItem} block>
                    {t('iaqTelemetry.addToQueue')}
                  </Button>
                </Form>
              ),
            },
            {
              key: 'queue',
              label: `${t('iaqTelemetry.queue')} (${ingestItems.length})`,
              children: (
                <Table
                  columns={ingestColumns}
                  dataSource={ingestItems}
                  rowKey={(_, i) => String(i)}
                  pagination={false}
                  size="small"
                  scroll={{ x: 550, y: 300 }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  )
}
