import { useState, useMemo } from 'react'
import { Card, Typography, Row, Col, Tag, Steps } from 'antd'
import { journeys } from './types'

const { Title, Paragraph } = Typography

export default function Journeys() {
  const [activeTab, setActiveTab] = useState<string>(journeys[0].key)
  const activeJourney = useMemo(() => journeys.find((j) => j.key === activeTab) ?? journeys[0], [activeTab])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Trải nghiệm theo persona</Title>
        <Paragraph type="secondary">
          Trình bày 3 luồng: VIP / Nhân viên / Visitor. Mỗi luồng nên có steps + input/output + điểm chạm (gate, barrier, elevator, robot…).
        </Paragraph>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {journeys.map((j) => (
          <Tag
            key={j.key}
            color={activeTab === j.key ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 16px', fontSize: 14 }}
            onClick={() => setActiveTab(j.key)}
          >
            {j.title}
          </Tag>
        ))}
      </div>

      <Card>
        <Title level={4}>{activeJourney.title}</Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {activeJourney.subtitle}
        </Paragraph>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16, fontWeight: 600 }}>Flow</div>
            <Steps
              direction="vertical"
              current={activeJourney.steps.length}
              items={activeJourney.steps.map((step, idx) => ({
                title: step,
                status: 'finish' as const,
              }))}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16, fontWeight: 600 }}>Deliverables</div>
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>Journey diagram + UI screens</li>
              <li>Rules/permissions matrix</li>
              <li>Event tracking (CTA, check-in, access)</li>
              <li>Edge cases (offline, deny, escalation)</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
