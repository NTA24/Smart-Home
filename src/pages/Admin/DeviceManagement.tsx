import { Row, Col, Card, Tag, Badge, Space, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons'
import { StatCard, PieChart, BarChart, PageContainer, PageHeader, ContentCard, DataTable } from '@/components'

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
    <PageContainer>
      <PageHeader title={t('devices.title')} />

      <Row gutter={[16, 16]} className="mb-24">
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={t('devices.totalDevices')} value={820} icon={<ApiOutlined />} iconBgColor="#1890ff" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="stat-card">
            <div className="admin_stat-inner">
              <Badge status="success" />
              <span className="admin_stat-label">{t('common.online')}</span>
              <span className="admin_stat-value-20 admin_stat-value-green">539</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="stat-card">
            <div className="admin_stat-inner">
              <Badge status="default" />
              <span className="admin_stat-label">{t('common.offline')}</span>
              <span className="admin_stat-value-20 admin_stat-value-gray">149</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="stat-card">
            <div className="admin_stat-inner">
              <Badge status="error" />
              <span className="admin_stat-label">{t('common.alarm')}</span>
              <span className="admin_stat-value-20 admin_stat-value-red">132</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-24">
        <Col xs={24} lg={8}>
          <PieChart title={t('devices.deviceStatus')} data={deviceStatusData} />
        </Col>
        <Col xs={24} lg={16}>
          <BarChart title={t('devices.deviceType')} categories={deviceTypeCategories} data={deviceTypeData} color="#1890ff" />
        </Col>
      </Row>

      <ContentCard title={t('devices.deviceList')}>
        <DataTable columns={columns} dataSource={devices} pageSize={10} />
      </ContentCard>
    </PageContainer>
  )
}
