import { Row, Col, Card, Typography, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import { solutions } from './types'

const { Title, Paragraph, Text } = Typography

export default function SmartBuildingLanding() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero Section */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none' }}>
        <div style={{ color: '#fff', textAlign: 'center', padding: '40px 20px' }}>
          <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
            Chuyển đổi số tòa nhà
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, maxWidth: 800, margin: '0 auto' }}>
            Nền tảng vận hành tòa nhà thông minh: hợp nhất giám sát – kiểm soát – điều phối – báo cáo
          </Paragraph>
          <Space size="large" style={{ marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              style={{ background: '#fff', color: '#1890ff', border: 'none' }}
              onClick={() => navigate('/smart-building/solutions')}
            >
              Khám phá giải pháp
            </Button>
            <Button
              size="large"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={() => navigate('/smart-building/contact')}
            >
              Nhận tư vấn / demo
            </Button>
          </Space>
        </div>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>An toàn</div>
              <div style={{ marginTop: 8, color: '#666' }}>AI + kiểm soát</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>Hiệu quả</div>
              <div style={{ marginTop: 8, color: '#666' }}>Tập trung vận hành</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>Thông minh</div>
              <div style={{ marginTop: 8, color: '#666' }}>Tự động hóa</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Current State / Problem */}
      <Card title="Hiện trạng / Bài toán" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>Pain points</Title>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Chưa giám sát phương tiện tự động (vào/ra, bãi đỗ)</li>
              <li>Thiếu quản lý định danh ra/vào cho nhân sự/khách</li>
              <li>Nhiều hệ thống độc lập → vận hành khó, thiếu cái nhìn tổng thể</li>
              <li>Thiếu nền tảng IoT để thu thập dữ liệu & điều khiển</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Mục tiêu chuyển đổi số</Title>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Hợp nhất giám sát – kiểm soát – điều phối trong 1 nền tảng</li>
              <li>Tự động hóa quy trình: nhận diện, cảnh báo, báo cáo</li>
              <li>Tối ưu trải nghiệm (VIP/nhân viên/khách)</li>
              <li>Mở rộng linh hoạt (phase 2: năng lượng, báo cháy…)</li>
            </ul>
          </Col>
        </Row>
      </Card>

      {/* Value Propositions */}
      <Card title="Giá trị mang lại" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>An toàn</div>
              <div style={{ color: '#666', fontSize: 13 }}>
                Cảnh báo theo ngữ cảnh, kiểm soát truy cập, truy vết.
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Thông minh</div>
              <div style={{ color: '#666', fontSize: 13 }}>
                AI nhận diện + tự động hóa quy trình vận hành.
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Hiệu quả</div>
              <div style={{ color: '#666', fontSize: 13 }}>
                Vận hành tập trung, giảm thao tác thủ công, giảm lỗi.
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Biểu tượng</div>
              <div style={{ color: '#666', fontSize: 13 }}>
                Không gian hiện đại, trải nghiệm chuẩn corporate.
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Solutions Preview */}
      <Card
        title="Danh mục giải pháp"
        extra={
          <Button type="link" onClick={() => navigate('/smart-building/solutions')}>
            Xem tất cả <ArrowRightOutlined />
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {solutions.slice(0, 6).map((s) => (
            <Col xs={24} sm={12} lg={8} key={s.slug}>
              <Card
                hoverable
                onClick={() => navigate(`/smart-building/solutions/${s.slug}`)}
                style={{ height: '100%' }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{s.name}</div>
                <div style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{s.desc}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Xem chi tiết <ArrowRightOutlined />
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Architecture Preview */}
      <Card title="Architecture preview" style={{ marginBottom: 24 }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Placeholder cho sơ đồ: Thiết bị → Kết nối → Smart IoT HUB → Nền tảng quản lý.
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Thiết bị</div>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
                <li>CCTV</li>
                <li>E-gate</li>
                <li>ANPR</li>
                <li>X-ray</li>
                <li>Robot</li>
                <li>Elevator</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Smart IoT HUB</div>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
                <li>Ingest</li>
                <li>Stream</li>
                <li>Rules</li>
                <li>Device control</li>
                <li>Integrations</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Nền tảng quản lý</div>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
                <li>Dashboard</li>
                <li>Alerts</li>
                <li>Reports</li>
                <li>Admin</li>
                <li>APIs</li>
              </ul>
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" onClick={() => navigate('/smart-building/architecture')}>
              Xem kiến trúc
            </Button>
            <Button onClick={() => navigate('/smart-building/contact')}>Trao đổi tích hợp</Button>
          </Space>
        </div>
      </Card>

      {/* Quick Links */}
      <Card title="Quick links">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate('/smart-building/architecture')}>
              Kiến trúc hệ thống
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate('/smart-building/journeys')}>
              Trải nghiệm người dùng
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate('/smart-building/investment')}>
              Dự toán & đề xuất
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button block onClick={() => navigate('/smart-building/implementation')}>
              Kế hoạch triển khai
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
