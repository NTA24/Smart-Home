import { useState } from 'react'
import { Card, Typography, Row, Col, Form, Input, Button, message } from 'antd'
import TextArea from 'antd/es/input/TextArea'

const { Title, Paragraph } = Typography

export default function Contact() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      message.success('Gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
      form.resetFields()
    }, 1000)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Liên hệ / Request demo</Title>
        <Paragraph type="secondary">
          Form skeleton: thu lead + yêu cầu demo. Thực tế nên có chống spam + tracking + email routing.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Thông tin liên hệ">
            <Paragraph>
              • Email: sales@company.com
              <br />
              • Hotline: 0xxx xxx xxx
              <br />
              • Địa chỉ: …
            </Paragraph>
            <Card size="small" style={{ marginTop: 16, background: '#f0f2f5' }}>
              <Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
                Gợi ý: CTA phụ "Tải proposal / slide" (gated content) để tăng conversion.
              </Paragraph>
            </Card>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Gửi yêu cầu">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="name@company.com" />
              </Form.Item>
              <Form.Item name="company" label="Công ty">
                <Input placeholder="Company" />
              </Form.Item>
              <Form.Item name="requirement" label="Nhu cầu">
                <TextArea
                  rows={4}
                  placeholder="Bạn muốn demo phần nào? (CCTV, E-gate, NOC, platform…)"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Gửi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
