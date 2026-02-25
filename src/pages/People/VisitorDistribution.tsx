import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Space, Pagination, Modal, Descriptions } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { PageContainer, FilterBar, ContentCard, DataTable } from '@/components'
import dayjs from 'dayjs'
import {
  getPeopleVisitors,
  savePeopleVisitors,
  getPeopleVisitorFilters,
  savePeopleVisitorFilters,
} from '@/services/mockPersistence'

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
  appointmentType: 'visit' | 'interview'
}

const mockData: VisitorRecord[] = [
  { key: '1', serialNumber: 1, reservationNumber: 'YY202601...', visitorName: "Do'lan", visitorPhone: '139****3125', visitorWorkUnit: 'Shenzhen Domiduo Opto...', reason: 'Tham quan doanh nghiệp', licensePlate: '51A-123.45', visitingTime: '2026-01-05', appointmentTime: '2026-01-05 08:58:11', appointmentStatus: 'Approved', appointmentType: 'visit' },
  { key: '2', serialNumber: 2, reservationNumber: 'YY202601...', visitorName: "Yang *quan", visitorPhone: '133****9559', visitorWorkUnit: 'Turn off the network', reason: 'Tham quan doanh nghiệp', licensePlate: '30G-789.01', visitingTime: '2026-01-04', appointmentTime: '2026-01-04 10:43:42', appointmentStatus: 'Approved', appointmentType: 'visit' },
  { key: '3', serialNumber: 3, reservationNumber: 'YY202512...', visitorName: "Zhang*", visitorPhone: '136****0460', visitorWorkUnit: 'New Trend Media Technol...', reason: 'Phỏng vấn', licensePlate: '29B-456.78', visitingTime: '2025-12-17', appointmentTime: '2025-12-17 12:26:47', appointmentStatus: 'Approved', appointmentType: 'interview' },
  { key: '4', serialNumber: 4, reservationNumber: 'YY202512...', visitorName: "Measurement*", visitorPhone: '131****2914', visitorWorkUnit: 'Test', reason: 'Làm việc đối tác', licensePlate: '51H-222.33', visitingTime: '2025-12-09', appointmentTime: '2025-12-09 08:55:33', appointmentStatus: 'Approved', appointmentType: 'visit' },
  { key: '5', serialNumber: 5, reservationNumber: 'YY202512...', visitorName: "Measurement*", visitorPhone: '131****2914', visitorWorkUnit: 'Test', reason: 'Làm việc đối tác', licensePlate: '30A-444.55', visitingTime: '2025-12-09', appointmentTime: '2025-12-09 08:54:02', appointmentStatus: 'Approved', appointmentType: 'visit' },
]

interface VisitorFilterValues {
  appointmentType?: 'visit' | 'interview'
  reservationNumber?: string
  visitorName?: string
  visitorPhone?: string
  intervieweeName?: string
  intervieweePhone?: string
  state?: 'approved' | 'pending' | 'rejected'
  visitingTime?: string
  currentPage?: number
  pageSize?: number
}

export default function VisitorDistribution() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<VisitorRecord[]>(() => getPeopleVisitors(mockData))
  const [filters, setFilters] = useState<VisitorFilterValues>(() =>
    getPeopleVisitorFilters<VisitorFilterValues>({ currentPage: 1, pageSize: 10 }),
  )
  const [currentPage, setCurrentPage] = useState(filters.currentPage || 1)
  const [pageSize, setPageSize] = useState(filters.pageSize || 10)
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    form.setFieldsValue({
      ...filters,
      visitingTime: filters.visitingTime ? dayjs(filters.visitingTime) : undefined,
    })
  }, [form])

  useEffect(() => {
    savePeopleVisitors(data)
  }, [data])

  useEffect(() => {
    savePeopleVisitorFilters({
      ...filters,
      currentPage,
      pageSize,
    })
  }, [filters, currentPage, pageSize])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.appointmentType && item.appointmentType !== filters.appointmentType) return false
      if (filters.reservationNumber && !item.reservationNumber.toLowerCase().includes(filters.reservationNumber.toLowerCase())) return false
      if (filters.visitorName && !item.visitorName.toLowerCase().includes(filters.visitorName.toLowerCase())) return false
      if (filters.visitorPhone && !item.visitorPhone.toLowerCase().includes(filters.visitorPhone.toLowerCase())) return false
      if (filters.state) {
        const normalized = item.appointmentStatus.toLowerCase()
        if (filters.state === 'approved' && normalized !== 'approved') return false
        if (filters.state === 'pending' && normalized !== 'pending') return false
        if (filters.state === 'rejected' && normalized !== 'rejected') return false
      }
      if (filters.visitingTime && item.visitingTime !== filters.visitingTime) return false
      return true
    })
  }, [data, filters])

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const columns: ColumnsType<VisitorRecord> = [
    { title: t('visitors.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 80, align: 'center' },
    { title: t('visitors.reservationNumber'), dataIndex: 'reservationNumber', key: 'reservationNumber', width: 120, ellipsis: true },
    { title: t('visitors.visitorName'), dataIndex: 'visitorName', key: 'visitorName', width: 100 },
    { title: t('visitors.visitorPhone'), dataIndex: 'visitorPhone', key: 'visitorPhone', width: 150 },
    { title: t('visitors.visitorWorkUnit'), dataIndex: 'visitorWorkUnit', key: 'visitorWorkUnit', width: 180, ellipsis: true },
    { title: t('visitors.reason'), dataIndex: 'reason', key: 'reason', width: 120, render: (reason: string) => <span className="text-primary">{reason}</span> },
    { title: t('visitors.licensePlate'), dataIndex: 'licensePlate', key: 'licensePlate', width: 130, render: (plate: string) => <span className="text-primary">{plate}</span> },
    { title: t('visitors.visitingTime'), dataIndex: 'visitingTime', key: 'visitingTime', width: 110 },
    { title: t('visitors.appointmentTime'), dataIndex: 'appointmentTime', key: 'appointmentTime', width: 160 },
    { title: t('visitors.state'), dataIndex: 'appointmentStatus', key: 'appointmentStatus', width: 80, render: (status: string) => <span className={status === 'Approved' ? 'text-success' : 'text-warning'}>{status === 'Approved' ? t('visitors.approved') : t('visitors.pending')}</span> },
    {
      title: t('common.operation'),
      key: 'operation',
      width: 120,
      align: 'center',
      render: (_: unknown, record: VisitorRecord) => (
        <Button
          type="link"
          className="people_operation-btn"
          onClick={() => {
            setSelectedVisitor(record)
            setDetailOpen(true)
          }}
        >
          {t('common.info', 'Thông tin')}
        </Button>
      ),
    },
  ]

  const handleSearch = async () => {
    const values = await form.validateFields()
    setFilters({
      ...values,
      visitingTime: values.visitingTime ? values.visitingTime.format('YYYY-MM-DD') : undefined,
    })
    setCurrentPage(1)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({})
    setCurrentPage(1)
  }

  return (
    <PageContainer>
      <ContentCard className="people_card-mb">
        <Form
          form={form}
          layout="inline"
          className="people_filter-form"
          onValuesChange={(_, allValues) =>
            setFilters((prev) => ({
              ...prev,
              ...allValues,
              visitingTime: allValues.visitingTime ? allValues.visitingTime.format('YYYY-MM-DD') : undefined,
            }))
          }
        >
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
        <Form
          form={form}
          layout="inline"
          className="people_filter-form people_filter-form-mt"
          onValuesChange={(_, allValues) =>
            setFilters((prev) => ({
              ...prev,
              ...allValues,
              visitingTime: allValues.visitingTime ? allValues.visitingTime.format('YYYY-MM-DD') : undefined,
            }))
          }
        >
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
        <FilterBar className="people_filter-mt">
          <Button type="primary" onClick={handleSearch}>{t('common.inquire')}</Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </FilterBar>
      </ContentCard>

      <ContentCard title={t('visitors.dataList')}>
        <DataTable<VisitorRecord>
          columns={columns}
          dataSource={pagedData}
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={false}
        />
        <div className="people_pagination-wrap">
          <span>{t('common.total')} {filteredData.length}</span>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            showSizeChanger
            showQuickJumper
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size ?? 10)
            }}
          />
        </div>
      </ContentCard>

      <Modal
        open={detailOpen}
        title={t('common.info', 'Thông tin')}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {selectedVisitor && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={t('visitors.serialNumber')}>{selectedVisitor.serialNumber}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.reservationNumber')}>{selectedVisitor.reservationNumber}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.visitorName')}>{selectedVisitor.visitorName}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.visitorPhone')}>{selectedVisitor.visitorPhone}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.visitorWorkUnit')}>{selectedVisitor.visitorWorkUnit}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.reason')}>{selectedVisitor.reason}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.licensePlate')}>{selectedVisitor.licensePlate}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.visitingTime')}>{selectedVisitor.visitingTime}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.appointmentTime')}>{selectedVisitor.appointmentTime}</Descriptions.Item>
            <Descriptions.Item label={t('visitors.state')}>
              {selectedVisitor.appointmentStatus === 'Approved' ? t('visitors.approved') : t('visitors.pending')}
            </Descriptions.Item>
            <Descriptions.Item label={t('visitors.appointmentType')}>
              {selectedVisitor.appointmentType === 'visit' ? t('visitors.corporateVisit') : t('visitors.interview')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
