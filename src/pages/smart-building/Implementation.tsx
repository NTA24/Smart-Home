import { Card, Typography, Row, Col, Badge } from 'antd'

const { Title, Paragraph } = Typography

const phases = [
  { title: 'Khảo sát', desc: 'Khảo sát hiện trạng, yêu cầu, đo đạc & rủi ro.' },
  { title: 'Thiết kế', desc: 'Thiết kế kiến trúc, sơ đồ mạng, thiết bị, luồng nghiệp vụ.' },
  { title: 'Triển khai', desc: 'Lắp đặt thiết bị, cấu hình, kết nối hub/platform.' },
  { title: 'Tích hợp', desc: 'API/SSO, rule engine, dashboard, cảnh báo.' },
  { title: 'UAT', desc: 'Kiểm thử kịch bản VIP/Staff/Visitor, nghiệm thu.' },
  { title: 'Vận hành', desc: 'Đào tạo, bàn giao, giám sát & tối ưu.' },
]

export default function Implementation() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Kế hoạch triển khai</Title>
        <Paragraph type="secondary">
          Timeline skeleton để trình bày tiến độ và deliverables theo giai đoạn.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {phases.map((phase, idx) => (
          <Col xs={24} key={phase.title}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <Badge
                  count={idx + 1}
                  style={{ backgroundColor: '#1890ff' }}
                  overflowCount={99}
                />
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    {phase.title}
                  </Title>
                  <Paragraph>{phase.desc}</Paragraph>
                  <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                    Deliverables: checklist + tài liệu + cấu hình + báo cáo
                  </Paragraph>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
