import { Card, Typography, Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

export default function Architecture() {
  const navigate = useNavigate()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Kiến trúc hệ thống</Title>
        <Paragraph type="secondary">
          Trang này mô tả lớp thiết bị, kết nối, Smart IoT HUB và nền tảng quản lý tập trung. Thường nên kèm: sơ đồ, mô tả luồng dữ liệu, luồng điều khiển, tích hợp mở rộng.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Luồng dữ liệu" bordered={false}>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Thiết bị gửi video/sự kiện → Hub ingest/stream</li>
              <li>Rules/AI inference → cảnh báo theo ngữ cảnh</li>
              <li>Lưu trữ + báo cáo + audit log</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Luồng điều khiển" bordered={false}>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Điều khiển barrier/e-gate/thang máy theo quyền</li>
              <li>Tự động hóa kịch bản (rule engine)</li>
              <li>Tích hợp hệ thống hiện hữu qua API</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Card
        title="Sơ đồ tổng quan"
        extra={
          <Button type="primary" onClick={() => navigate('/smart-building/contact')}>
            Get diagram pack
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Placeholder – sau này thay ảnh sơ đồ từ thiết kế/UI.
        </Paragraph>
        <div
          style={{
            height: 300,
            border: '2px dashed #d9d9d9',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            color: '#999',
          }}
        >
          (Chỗ này để ảnh/sơ đồ kiến trúc)
        </div>
      </Card>
    </div>
  )
}
