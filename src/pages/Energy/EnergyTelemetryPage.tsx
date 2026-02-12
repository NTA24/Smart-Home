import { useState } from 'react'
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
  ThunderboltOutlined,
  DashboardOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { energyTelemetryApi } from '@/services'
import type {
  EnergyTelemetry,
  EnergyTelemetryIngestItem,
} from '@/services'
import { useBuildingStore } from '@/stores'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function EnergyTelemetryPage() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<EnergyTelemetry[]>([])
  const [ingestModalVisible, setIngestModalVisible] = useState(false)
  const [ingestItems, setIngestItems] = useState<EnergyTelemetryIngestItem[]>([])
  const [queryForm] = Form.useForm()
  const [ingestForm] = Form.useForm()

  // Stats
  const totalKwh = data.reduce((acc, d) => acc + (d.kwh_delta || 0), 0)
  const avgKw = data.length > 0 ? data.reduce((acc, d) => acc + (d.kw || 0), 0) / data.length : 0
  const maxKw = data.length > 0 ? Math.max(...data.map(d => d.kw || 0)) : 0
  const avgVoltage = data.length > 0 ? data.reduce((acc, d) => acc + (d.voltage || 0), 0) / data.length : 0

  const handleQuery = async (values: { device_id: string; range: [dayjs.Dayjs, dayjs.Dayjs]; limit?: number }) => {
    setLoading(true)
    try {
      const res = await energyTelemetryApi.query({
        device_id: values.device_id,
        start: values.range[0].toISOString(),
        end: values.range[1].toISOString(),
        limit: values.limit || 10000,
      })
      setData(Array.isArray(res) ? res : [])
      if (Array.isArray(res) && res.length === 0) {
        message.info(t('energyTelemetry.noResults'))
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
      const item: EnergyTelemetryIngestItem = {
        device_id: values.device_id,
        ts: values.ts?.toISOString?.() || values.ts,
        kwh_delta: values.kwh_delta || 0,
        kw: values.kw || 0,
        voltage: values.voltage || 0,
        current: values.current || 0,
        pf: values.pf || 0,
        extra: values.extra ? (typeof values.extra === 'string' ? JSON.parse(values.extra) : values.extra) : {},
      }
      setIngestItems(prev => [...prev, item])
      ingestForm.resetFields(['ts', 'kwh_delta', 'kw', 'voltage', 'current', 'pf', 'extra'])
    }).catch(() => {})
  }

  const removeIngestItem = (index: number) => {
    setIngestItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleIngest = async () => {
    if (ingestItems.length === 0) {
      message.warning(t('energyTelemetry.noItemsToIngest'))
      return
    }
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await energyTelemetryApi.ingestBulk(ingestItems)
      hide()
      message.success(t('energyTelemetry.ingestSuccess'))
      setIngestItems([])
      setIngestModalVisible(false)
      ingestForm.resetFields()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('energyTelemetry.ingestError')}: ${errorMsg}`)
    }
  }

  const columns = [
    {
      title: t('energyTelemetry.deviceId'),
      dataIndex: 'device_id',
      key: 'device_id',
      width: 140,
      ellipsis: true,
      render: (id: string) => (
        <Text copyable={{ text: id }} style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id?.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: t('energyTelemetry.timestamp'),
      dataIndex: 'ts',
      key: 'ts',
      width: 180,
      render: (ts: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {ts ? new Date(ts).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      title: 'kWh Delta',
      dataIndex: 'kwh_delta',
      key: 'kwh_delta',
      width: 100,
      render: (v: number) => <Text strong style={{ color: '#1890ff' }}>{v?.toFixed(2)}</Text>,
    },
    {
      title: 'kW',
      dataIndex: 'kw',
      key: 'kw',
      width: 80,
      render: (v: number) => <Text style={{ color: '#52c41a' }}>{v?.toFixed(2)}</Text>,
    },
    {
      title: t('energyTelemetry.voltage'),
      dataIndex: 'voltage',
      key: 'voltage',
      width: 90,
      render: (v: number) => <span>{v?.toFixed(1)} V</span>,
    },
    {
      title: t('energyTelemetry.current'),
      dataIndex: 'current',
      key: 'current',
      width: 90,
      render: (v: number) => <span>{v?.toFixed(2)} A</span>,
    },
    {
      title: 'PF',
      dataIndex: 'pf',
      key: 'pf',
      width: 70,
      render: (v: number) => (
        <Tag color={v >= 0.9 ? 'green' : v >= 0.8 ? 'orange' : 'red'} style={{ borderRadius: 8 }}>
          {v?.toFixed(2)}
        </Tag>
      ),
    },
  ]

  const ingestColumns = [
    { title: 'Device ID', dataIndex: 'device_id', key: 'device_id', width: 120, ellipsis: true, render: (id: string) => <Text style={{ fontSize: 11, fontFamily: 'monospace' }}>{id?.substring(0, 8)}...</Text> },
    { title: 'Timestamp', dataIndex: 'ts', key: 'ts', width: 160, render: (ts: string) => <Text style={{ fontSize: 11 }}>{new Date(ts).toLocaleString()}</Text> },
    { title: 'kWh', dataIndex: 'kwh_delta', key: 'kwh_delta', width: 70 },
    { title: 'kW', dataIndex: 'kw', key: 'kw', width: 60 },
    { title: 'V', dataIndex: 'voltage', key: 'voltage', width: 60 },
    { title: 'A', dataIndex: 'current', key: 'current', width: 60 },
    { title: 'PF', dataIndex: 'pf', key: 'pf', width: 50 },
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
            <DashboardOutlined />
            {t('energyTelemetry.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('energyTelemetry.allSites')}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setIngestModalVisible(true)}
        >
          {t('energyTelemetry.ingestData')}
        </Button>
      </div>

      {/* Query Form */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Form
          form={queryForm}
          layout="inline"
          onFinish={handleQuery}
          style={{ flexWrap: 'wrap', gap: 8 }}
        >
          <Form.Item
            name="device_id"
            rules={[{ required: true, message: t('energyTelemetry.deviceIdRequired') }]}
          >
            <Input
              placeholder={t('energyTelemetry.deviceId')}
              style={{ width: 300 }}
              prefix={<ThunderboltOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>
          <Form.Item
            name="range"
            rules={[{ required: true, message: t('energyTelemetry.dateRangeRequired') }]}
          >
            <DatePicker.RangePicker showTime style={{ width: 380 }} />
          </Form.Item>
          <Form.Item name="limit">
            <InputNumber min={1} max={200000} placeholder="Limit (10000)" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              {t('energyTelemetry.query')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Stats */}
      {data.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic title={t('energyTelemetry.totalKwh')} value={totalKwh.toFixed(2)} suffix="kWh" valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic title={t('energyTelemetry.avgKw')} value={avgKw.toFixed(2)} suffix="kW" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic title={t('energyTelemetry.peakKw')} value={maxKw.toFixed(2)} suffix="kW" valueStyle={{ color: '#f5222d' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Statistic title={t('energyTelemetry.avgVoltage')} value={avgVoltage.toFixed(1)} suffix="V" valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Results Table */}
      <Spin spinning={loading}>
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThunderboltOutlined style={{ color: '#faad14' }} />
              {t('energyTelemetry.results')} {data.length > 0 && `(${data.length})`}
            </span>
          }
        >
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(_, i) => String(i)}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ['20', '50', '100', '500'],
              showTotal: (t) => `${t} records`,
            }}
            size="small"
            scroll={{ x: 800 }}
          />
        </Card>
      </Spin>

      {/* Ingest Modal */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadOutlined />
            {t('energyTelemetry.ingestData')}
          </span>
        }
        open={ingestModalVisible}
        onCancel={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}
        width={800}
        footer={
          <Space>
            <Button onClick={() => { setIngestModalVisible(false); setIngestItems([]); ingestForm.resetFields() }}>
              {t('apiTest.cancel')}
            </Button>
            <Button type="primary" onClick={handleIngest} disabled={ingestItems.length === 0}>
              {t('energyTelemetry.ingest')} ({ingestItems.length} {t('energyTelemetry.items')})
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'form',
              label: t('energyTelemetry.addEntry'),
              children: (
                <Form form={ingestForm} layout="vertical">
                  <Form.Item
                    name="device_id"
                    label={t('energyTelemetry.deviceId')}
                    rules={[{ required: true, message: t('energyTelemetry.deviceIdRequired') }]}
                  >
                    <Input placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="ts" label={t('energyTelemetry.timestamp')} rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="kwh_delta" label="kWh Delta" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item name="kw" label="kW" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="voltage" label={t('energyTelemetry.voltage')} rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="current" label={t('energyTelemetry.current')} rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="pf" label="PF" rules={[{ required: true }]}>
                        <InputNumber min={0} max={1} step={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="extra" label="Extra">
                    <Input.TextArea rows={2} placeholder='{}' style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  </Form.Item>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addIngestItem} block>
                    {t('energyTelemetry.addToQueue')}
                  </Button>
                </Form>
              ),
            },
            {
              key: 'queue',
              label: `${t('energyTelemetry.queue')} (${ingestItems.length})`,
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
    </div>
  )
}
