import { Card, Tag, Progress, Row, Col, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  EnvironmentOutlined,
  BuildOutlined,
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { buildings, selectBuildingById } = useBuildingStore()

  // Calculate totals
  const totalFloors = buildings.reduce((sum, b) => sum + b.floors, 0)
  const totalDevices = buildings.reduce((sum, b) => sum + (b.energy || 0), 0)
  const totalAlerts = buildings.reduce((sum, b) => sum + (b.alerts || 0), 0)

  const handleBuildingClick = (buildingId: number) => {
    // Set selected building and navigate to dashboard
    selectBuildingById(buildingId)
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 40px',
          textAlign: 'center',
          borderRadius: '0 0 24px 24px',
          marginBottom: 32,
        }}
      >
        <Title
          level={2}
          style={{
            color: '#fff',
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Hệ thống quản lý tòa nhà thông minh
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
          Chọn tòa nhà để bắt đầu điều khiển và giám sát
        </Text>

        {/* Stats Cards */}
        <Row gutter={24} style={{ marginTop: 40, maxWidth: 800, margin: '40px auto 0' }}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: '24px 16px' }}
            >
              <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 8 }} />
              <Title level={2} style={{ margin: '8px 0 4px', color: '#1a1a1a' }}>
                {totalFloors}
              </Title>
              <Text type="secondary">Số tầng</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: '24px 16px' }}
            >
              <ThunderboltOutlined style={{ fontSize: 28, color: '#1890ff', marginBottom: 8 }} />
              <Title level={2} style={{ margin: '8px 0 4px', color: '#1a1a1a' }}>
                {totalDevices.toLocaleString()}
              </Title>
              <Text type="secondary">Thiết bị</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                borderRadius: 12,
                textAlign: 'center',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              bodyStyle={{ padding: '24px 16px' }}
            >
              <AlertOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 8 }} />
              <Title level={2} style={{ margin: '8px 0 4px', color: '#1a1a1a' }}>
                {totalAlerts}
              </Title>
              <Text type="secondary">Cảnh báo</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Building List Section */}
      <div style={{ padding: '0 40px 40px' }}>
        <Title level={4} style={{ marginBottom: 24, color: '#1a1a1a' }}>
          Danh sách tòa nhà đang quản lý
        </Title>

        <Row gutter={[24, 24]}>
          {buildings.map((building) => (
            <Col xs={24} sm={12} lg={8} key={building.id}>
              <Card
                hoverable
                onClick={() => handleBuildingClick(building.id)}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Building Image */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={building.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'}
                    alt={building.name}
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                    }}
                  />
                  <Tag
                    color="green"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      borderRadius: 4,
                      border: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Hoạt động
                  </Tag>
                </div>

                {/* Building Info */}
                <div style={{ padding: 20 }}>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    {building.name}
                  </Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {building.address}
                    </Text>
                  </div>

                  {/* Stats Row */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <Tag
                      icon={<BuildOutlined />}
                      style={{
                        background: '#f0f5ff',
                        border: 'none',
                        color: '#1890ff',
                        borderRadius: 6,
                        padding: '4px 10px',
                      }}
                    >
                      {building.floors} tầng
                    </Tag>
                    <Tag
                      icon={<ThunderboltOutlined />}
                      style={{
                        background: '#f6ffed',
                        border: 'none',
                        color: '#52c41a',
                        borderRadius: 6,
                        padding: '4px 10px',
                      }}
                    >
                      {(building.energy || 0).toLocaleString()} MWh
                    </Tag>
                    <Tag
                      icon={<AlertOutlined />}
                      style={{
                        background: '#fff7e6',
                        border: 'none',
                        color: '#fa8c16',
                        borderRadius: 6,
                        padding: '4px 10px',
                      }}
                    >
                      {building.alerts || 0} cảnh báo
                    </Tag>
                  </div>

                  {/* Energy Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <ThunderboltOutlined style={{ marginRight: 4 }} />
                        Năng lượng
                      </Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {building.energyPercent || 0}%
                      </Text>
                    </div>
                    <Progress
                      percent={building.energyPercent || 0}
                      showInfo={false}
                      strokeColor={{
                        '0%': '#52c41a',
                        '100%': '#87d068',
                      }}
                      trailColor="#f0f0f0"
                      size="small"
                    />
                  </div>

                  {/* Last Updated */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Cập nhật 1 phút trước
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}
