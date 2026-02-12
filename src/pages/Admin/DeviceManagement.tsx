import { Row, Col, Card, Table, Tag, Typography, Badge, Space, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons'
import { StatCard, PieChart, BarChart } from '@/components'

const { Title } = Typography

export default function DeviceManagement() {
  const { t } = useTranslation()

  const deviceStatusData = [
    { name: t('common.online'), value: 539 },
    { name: t('common.offline'), value: 149 },
    { name: t('common.alarm'), value: 132 },
  ]

  const deviceTypeCategories = [t('devices.camera'), t('devices.sensor'), t('devices.gate'), t('devices.light'), t('devices.airConditioner'), t('devices.other')]
  const deviceTypeData = [120, 200, 80, 95, 60, 65]

  const devices = [
    { key: '1', name: 'Camera A1-01', type: t('devices.camera'), location: 'Floor 1 - Lobby', status: 'online', lastUpdate: '2026-01-26 08:30:00' },
    { key: '2', name: 'Heat Sensor B2-05', type: t('devices.sensor'), location: 'Floor 2 - Meeting', status: 'alarm', lastUpdate: '2026-01-26 08:25:00' },
    { key: '3', name: 'Main Gate', type: t('devices.gate'), location: 'Main Entrance', status: 'online', lastUpdate: '2026-01-26 08:28:00' },
    { key: '4', name: 'Smart Light C3-12', type: t('devices.light'), location: 'Floor 3 - Hallway', status: 'offline', lastUpdate: '2026-01-26 07:15:00' },
    { key: '5', name: 'AC Unit D1-03', type: t('devices.airConditioner'), location: 'Floor 1 - Office', status: 'online', lastUpdate: '2026-01-26 08:29:00' },
  ]

  const columns = [
    { title: t('devices.deviceName'), dataIndex: 'name', key: 'name' },
    { title: t('common.type'), dataIndex: 'type', key: 'type', render: (type: string) => <Tag>{type}</Tag> },
    { title: t('common.location'), dataIndex: 'location', key: 'location' },
    {
      title: t('common.status'), dataIndex: 'status', key: 'status',
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
    { title: t('devices.lastUpdate'), dataIndex: 'lastUpdate', key: 'lastUpdate' },
    {
      title: t('common.action'), key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">{t('common.details')}</Button>
          <Button type="link" size="small" icon={<ReloadOutlined />}>{t('common.restart')}</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>{t('devices.title')}</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('devices.totalDevices')} value={820} icon={<ApiOutlined />} iconBgColor="#1890ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="success" />
              <span style={{ color: '#666' }}>{t('common.online')}</span>
              <span style={{ fontWeight: 600, fontSize: 20, color: '#52c41a' }}>539</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="default" />
              <span style={{ color: '#666' }}>{t('common.offline')}</span>
              <span style={{ fontWeight: 600, fontSize: 20, color: '#999' }}>149</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge status="error" />
              <span style={{ color: '#666' }}>{t('common.alarm')}</span>
              <span style={{ fontWeight: 600, fontSize: 20, color: '#f5222d' }}>132</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <PieChart title={t('devices.deviceStatus')} data={deviceStatusData} />
        </Col>
        <Col xs={24} lg={16}>
          <BarChart title={t('devices.deviceType')} categories={deviceTypeCategories} data={deviceTypeData} color="#1890ff" />
        </Col>
      </Row>

      <Card title={t('devices.deviceList')} bordered={false}>
        <Table columns={columns} dataSource={devices} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
