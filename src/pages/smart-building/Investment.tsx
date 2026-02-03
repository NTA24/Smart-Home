import { Card, Typography, Table, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

export default function Investment() {
  const navigate = useNavigate()

  const columns = [
    { title: 'Hạng mục', dataIndex: 'item', key: 'item' },
    { title: 'Phần cứng', dataIndex: 'hardware', key: 'hardware' },
    { title: 'Nền tảng', dataIndex: 'platform', key: 'platform' },
    { title: 'Dịch vụ', dataIndex: 'service', key: 'service' },
  ]

  const data = [
    { key: '1', item: 'Camera AI', hardware: '—', platform: '—', service: '—' },
    { key: '2', item: 'Kiểm soát phương tiện', hardware: '—', platform: '—', service: '—' },
    { key: '3', item: 'E-gate', hardware: '—', platform: '—', service: '—' },
    { key: '4', item: 'NOC', hardware: '—', platform: '—', service: '—' },
    { key: '5', item: 'Platform', hardware: '—', platform: '—', service: '—' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dự toán & đề xuất</Title>
        <Paragraph type="secondary">
          Skeleton: bảng breakdown theo hệ thống (phần cứng / nền tảng / dịch vụ). Thực tế nên có: phạm vi, giả định, tùy chọn (Option A/B), và CTA xin BOQ.
        </Paragraph>
      </div>

      <Card
        extra={
          <Button type="primary" onClick={() => navigate('/smart-building/contact')}>
            Nhận BOQ chi tiết
          </Button>
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Thay bằng bảng giá/BOQ thật (ẩn/hiện theo quyền nếu cần).
        </Paragraph>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  )
}
