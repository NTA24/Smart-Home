import { Card, Typography, Row, Col, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import { solutions } from './types'

const { Title, Paragraph, Text } = Typography

export default function Solutions() {
  const navigate = useNavigate()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Danh mục giải pháp</Title>
        <Paragraph type="secondary">
          Trang listing: 12 modules. Sau này có thể thêm filter (An ninh / Vận hành / Phase 2).
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {solutions.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.slug}>
            <Card
              hoverable
              onClick={() => navigate(`/smart-building/solutions/${s.slug}`)}
              style={{ height: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</div>
                {s.name.includes('Phase 2') && (
                  <Tag color="orange" style={{ margin: 0 }}>
                    Phase 2
                  </Tag>
                )}
              </div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{s.desc}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Xem chi tiết <ArrowRightOutlined />
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
