import { useState } from 'react'
import { Row, Col, Card, Table, Form, Input, Select, Button, Space, Tag, Badge, Typography, Statistic } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons'
import { PieChart, LineChart, BarChart } from '@/components'

const { Title } = Typography

interface DeviceRecord {
  key: string
  id: number
  name: string
  type: string
  location: string
  status: 'online' | 'offline' | 'alarm'
  lastUpdate: string
  alarmCount: number
}

const mockData: DeviceRecord[] = [
  { key: '1', id: 1, name: 'Camera A1-01', type: 'Camera', location: 'Floor 1 - Lobby', status: 'online', lastUpdate: '2026-01-26 09:30:00', alarmCount: 0 },
  { key: '2', id: 2, name: 'Heat Sensor B2-05', type: 'Sensor', location: 'Floor 2 - Meeting Room', status: 'alarm', lastUpdate: '2026-01-26 09:25:00', alarmCount: 5 },
  { key: '3', id: 3, name: 'Main Gate', type: 'Gate', location: 'Main Entrance', status: 'online', lastUpdate: '2026-01-26 09:28:00', alarmCount: 0 },
  { key: '4', id: 4, name: 'Smart Light C3-12', type: 'Light', location: 'Floor 3 - Hallway', status: 'offline', lastUpdate: '2026-01-26 07:15:00', alarmCount: 0 },
  { key: '5', id: 5, name: 'AC Unit D1-03', type: 'AC', location: 'Floor 1 - Office', status: 'online', lastUpdate: '2026-01-26 09:29:00', alarmCount: 0 },
]

export default function EquipmentOperation() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<DeviceRecord[]>(mockData)
  const { t } = useTranslation()

  const statusData = [
    { name: t('common.online'), value: 539 },
    { name: t('common.offline'), value: 149 },
    { name: t('common.alarm'), value: 132 },
  ]

  const typeCategories = [t('devices.camera'), t('devices.sensor'), t('devices.gate'), t('devices.light'), t('devices.airConditioner'), t('devices.other')]
  const typeData = [120, 200, 80, 95, 60, 65]

  const trendCategories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const trendSeries = [
    { name: t('common.online'), data: [520, 510, 530, 540, 535, 525, 530, 539, 535, 528, 532, 539], color: '#52c41a' },
    { name: t('common.offline'), data: [130, 140, 125, 115, 120, 135, 128, 149, 142, 155, 148, 149], color: '#faad14' },
    { name: t('common.alarm'), data: [100, 95, 110, 125, 115, 105, 118, 132, 128, 140, 135, 132], color: '#f5222d' },
  ]

  const columns: ColumnsType<DeviceRecord> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('devices.deviceName'), dataIndex: 'name', key: 'name', width: 150 },
    { title: t('common.type'), dataIndex: 'type', key: 'type', width: 100, render: (type: string) => <Tag>{type}</Tag> },
    { title: t('common.location'), dataIndex: 'location', key: 'location', width: 150 },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status', width: 100,
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          online: { color: 'success', icon: <CheckCircleOutlined />, text: t('common.online') },
          offline: { color: 'default', icon: <CloseCircleOutlined />, text: t('common.offline') },
          alarm: { color: 'error', icon: <WarningOutlined />, text: t('common.alarm') },
        }
        const { color, icon, text } = config[status]
        return <Tag color={color} icon={icon}>{text}</Tag>
      },
    },
    { title: t('devices.lastUpdate'), dataIndex: 'lastUpdate', key: 'lastUpdate', width: 160 },
    { title: t('devices.alarmCount'), dataIndex: 'alarmCount', key: 'alarmCount', width: 100, render: (count: number) => count > 0 ? <Badge count={count} /> : '-' },
    { title: t('common.action'), key: 'action', width: 150, render: () => <Space><a style={{ color: '#1890ff' }}>{t('common.details')}</a><a style={{ color: '#1890ff' }}><ReloadOutlined /> {t('common.restart')}</a></Space> },
  ]

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t('equipment.title')}</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApiOutlined style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <Statistic title={t('equipment.totalEquipment')} value={820} valueStyle={{ fontSize: 24 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="success" />
              <Statistic title={t('common.online')} value={539} valueStyle={{ fontSize: 24, color: '#52c41a' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="default" />
              <Statistic title={t('common.offline')} value={149} valueStyle={{ fontSize: 24, color: '#999' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="error" />
              <Statistic title={t('common.alarm')} value={132} valueStyle={{ fontSize: 24, color: '#f5222d' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <PieChart title={t('equipment.statusChart')} data={statusData} height={250} />
        </Col>
        <Col xs={24} lg={8}>
          <BarChart title={t('equipment.typeChart')} categories={typeCategories} data={typeData} height={250} color="#1890ff" />
        </Col>
        <Col xs={24} lg={8}>
          <LineChart title={t('equipment.trendChart')} categories={trendCategories} series={trendSeries} height={250} />
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Form.Item label={t('devices.deviceName')} name="name">
            <Input placeholder={t('devices.deviceName')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('devices.deviceType')} name="type">
            <Select placeholder={t('devices.deviceType')} style={{ width: 150 }}>
              <Select.Option value="camera">{t('devices.camera')}</Select.Option>
              <Select.Option value="sensor">{t('devices.sensor')}</Select.Option>
              <Select.Option value="gate">{t('devices.gate')}</Select.Option>
              <Select.Option value="light">{t('devices.light')}</Select.Option>
              <Select.Option value="ac">{t('devices.airConditioner')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('common.status')} name="status">
            <Select placeholder={t('common.status')} style={{ width: 150 }}>
              <Select.Option value="online">{t('common.online')}</Select.Option>
              <Select.Option value="offline">{t('common.offline')}</Select.Option>
              <Select.Option value="alarm">{t('common.alarm')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>{t('common.search')}</Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={t('equipment.equipmentList')} bordered={false}>
        <Table columns={columns} dataSource={data} loading={loading} pagination={{ total: 820, showSizeChanger: true, showQuickJumper: true }} />
      </Card>
    </div>
  )
}
