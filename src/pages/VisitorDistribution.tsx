import { useState } from 'react'
import { Card, Table, Form, Input, Select, DatePicker, Button, Space, Typography, Pagination } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface VisitorRecord {
  key: string
  serialNumber: number
  reservationNumber: string
  visitorName: string
  visitorPhone: string
  visitorWorkUnit: string
  reason: string
  licensePlate: string
  visitingTime: string
  appointmentTime: string
  appointmentStatus: string
}

const mockData: VisitorRecord[] = [
  { key: '1', serialNumber: 1, reservationNumber: 'YY202601...', visitorName: "Do'lan", visitorPhone: '139****3125', visitorWorkUnit: 'Shenzhen Domiduo Opto...', reason: 'Corporate visit', licensePlate: 'Guangdong T**', visitingTime: '2026-01-05', appointmentTime: '2026-01-05 08:58:11', appointmentStatus: 'Approved' },
  { key: '2', serialNumber: 2, reservationNumber: 'YY202601...', visitorName: "Yang *quan", visitorPhone: '133****9559', visitorWorkUnit: 'Turn off the network', reason: 'Corporate visit', licensePlate: 'Guangdong C**', visitingTime: '2026-01-04', appointmentTime: '2026-01-04 10:43:42', appointmentStatus: 'Approved' },
  { key: '3', serialNumber: 3, reservationNumber: 'YY202512...', visitorName: "Zhang*", visitorPhone: '136****0460', visitorWorkUnit: 'New Trend Media Technol...', reason: 'Corporate visit', licensePlate: 'Guangdong B*', visitingTime: '2025-12-17', appointmentTime: '2025-12-17 12:26:47', appointmentStatus: 'Approved' },
  { key: '4', serialNumber: 4, reservationNumber: 'YY202512...', visitorName: "Measurement*", visitorPhone: '131****2914', visitorWorkUnit: 'Test', reason: 'Corporate visit', licensePlate: 'Not at the morr', visitingTime: '2025-12-09', appointmentTime: '2025-12-09 08:55:33', appointmentStatus: 'Approved' },
  { key: '5', serialNumber: 5, reservationNumber: 'YY202512...', visitorName: "Measurement*", visitorPhone: '131****2914', visitorWorkUnit: 'Test', reason: 'Corporate visit', licensePlate: 'Not at the morr', visitingTime: '2025-12-09', appointmentTime: '2025-12-09 08:54:02', appointmentStatus: 'Approved' },
]

export default function VisitorDistribution() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<VisitorRecord[]>(mockData)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { t } = useTranslation()

  const columns: ColumnsType<VisitorRecord> = [
    { title: t('visitors.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 80, align: 'center' },
    { title: t('visitors.reservationNumber'), dataIndex: 'reservationNumber', key: 'reservationNumber', width: 120, ellipsis: true },
    { title: t('visitors.visitorName'), dataIndex: 'visitorName', key: 'visitorName', width: 100 },
    { title: t('visitors.visitorPhone'), dataIndex: 'visitorPhone', key: 'visitorPhone', width: 150 },
    { title: t('visitors.visitorWorkUnit'), dataIndex: 'visitorWorkUnit', key: 'visitorWorkUnit', width: 180, ellipsis: true },
    { title: t('visitors.reason'), dataIndex: 'reason', key: 'reason', width: 120, render: (reason: string) => <span style={{ color: '#1890ff' }}>{reason}</span> },
    { title: t('visitors.licensePlate'), dataIndex: 'licensePlate', key: 'licensePlate', width: 130, render: (plate: string) => <span style={{ color: '#1890ff' }}>{plate}</span> },
    { title: t('visitors.visitingTime'), dataIndex: 'visitingTime', key: 'visitingTime', width: 110 },
    { title: t('visitors.appointmentTime'), dataIndex: 'appointmentTime', key: 'appointmentTime', width: 160 },
    { title: t('visitors.state'), dataIndex: 'appointmentStatus', key: 'appointmentStatus', width: 80, render: (status: string) => <span style={{ color: status === 'Approved' ? '#52c41a' : '#faad14' }}>{status === 'Approved' ? t('visitors.approved') : t('visitors.pending')}</span> },
    { title: t('common.operation'), key: 'operation', width: 200, fixed: 'right', render: () => <Space><a style={{ color: '#1890ff' }}>{t('visitors.intervieweeDetails')}</a><a style={{ color: '#1890ff' }}>{t('visitors.allVisitorInfo')}</a></Space> },
  ]

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
  }

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: '12px 24px' }}>
          <Form.Item label={t('visitors.appointmentType')} name="appointmentType">
            <Select placeholder={t('visitors.appointmentType')} style={{ width: 180 }}>
              <Select.Option value="visit">{t('visitors.corporateVisit')}</Select.Option>
              <Select.Option value="interview">{t('visitors.interview')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('visitors.reservationNumber')} name="reservationNumber">
            <Input placeholder={t('visitors.reservationNumber')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('visitors.visitorName')} name="visitorName">
            <Input placeholder={t('visitors.visitorName')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('visitors.visitorPhone')} name="visitorPhone">
            <Input placeholder={t('visitors.visitorPhone')} style={{ width: 180 }} />
          </Form.Item>
        </Form>
        <Form form={form} layout="inline" style={{ marginTop: 12, flexWrap: 'wrap', gap: '12px 24px' }}>
          <Form.Item label={t('visitors.intervieweeName')} name="intervieweeName">
            <Input placeholder={t('visitors.intervieweeName')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('visitors.intervieweePhone')} name="intervieweePhone">
            <Input placeholder={t('visitors.intervieweePhone')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('visitors.state')} name="state">
            <Select placeholder={t('visitors.state')} style={{ width: 150 }}>
              <Select.Option value="approved">{t('visitors.approved')}</Select.Option>
              <Select.Option value="pending">{t('visitors.pending')}</Select.Option>
              <Select.Option value="rejected">{t('visitors.rejected')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('visitors.visitingTime')} name="visitingTime">
            <DatePicker placeholder={t('visitors.visitingTime')} style={{ width: 180 }} />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button type="primary" onClick={handleSearch}>{t('common.inquire')}</Button>
            <Button onClick={handleReset}>{t('common.reset')}</Button>
          </Space>
        </div>
      </Card>

      <Card bordered={false}>
        <Title level={5} style={{ marginBottom: 16, color: '#666' }}>{t('visitors.dataList')}</Title>
        <Table columns={columns} dataSource={data} loading={loading} scroll={{ x: 1500 }} pagination={false} />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
          <span>{t('common.total')} 1025</span>
          <Pagination current={currentPage} pageSize={pageSize} total={1025} showSizeChanger showQuickJumper onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }} />
        </div>
      </Card>
    </div>
  )
}
