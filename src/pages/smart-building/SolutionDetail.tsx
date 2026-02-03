import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Row, Col, Button, Space, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { solutions } from './types'

const { Title, Paragraph } = Typography

export default function SolutionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const solution = useMemo(() => solutions.find((s) => s.slug === slug), [slug])

  if (!solution) {
    return (
      <div>
        <Title level={2}>Không tìm thấy giải pháp</Title>
        <Paragraph type="secondary">Slug không đúng hoặc chưa tạo nội dung.</Paragraph>
        <Button onClick={() => navigate('/smart-building/solutions')}>Quay lại danh mục</Button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/smart-building/solutions')}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>
        <Title level={2}>{solution.name}</Title>
        <Paragraph type="secondary">
          Template trang chi tiết: Problem → Components → Workflow → Value → Integrations.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Bài toán giải quyết" bordered={false}>
            <Paragraph>Viết 1–2 câu mô tả pain point và bối cảnh vận hành cho module này.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Thành phần/thiết bị" bordered={false}>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Thiết bị/edge box</li>
              <li>Kết nối (RTSP/ONVIF/SDK/API…)</li>
              <li>Nền tảng quản lý + quyền</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Card title="Workflow" style={{ marginBottom: 24 }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Luồng hoạt động chính (timeline).
        </Paragraph>
        <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Input event/data</li>
          <li>AI/rules xử lý</li>
          <li>Cảnh báo/điều khiển thiết bị</li>
          <li>Dashboard/báo cáo/audit</li>
        </ol>
      </Card>

      <Card title="Giá trị vận hành" style={{ marginBottom: 24 }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Lợi ích + KPI gợi ý.
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Giảm thao tác</div>
              <div style={{ color: '#666', fontSize: 13 }}>Tự động hóa, giảm xử lý thủ công.</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Tăng an toàn</div>
              <div style={{ color: '#666', fontSize: 13 }}>Cảnh báo sớm, hạn chế rủi ro.</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f0f2f5' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Minh bạch</div>
              <div style={{ color: '#666', fontSize: 13 }}>Lịch sử sự kiện, audit log, báo cáo.</div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="Tích hợp">
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Kết nối platform quản lý tập trung & hệ thống hiện hữu.
        </Paragraph>
        <Paragraph style={{ marginBottom: 16 }}>
          • API integration • Role/permission • Event streaming • Webhooks • SSO (nếu có)
        </Paragraph>
        <Space>
          <Button type="primary" onClick={() => navigate('/smart-building/contact')}>
            Liên hệ tích hợp
          </Button>
          <Button onClick={() => navigate('/smart-building/solutions')}>Quay lại</Button>
        </Space>
      </Card>
    </div>
  )
}
