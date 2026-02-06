import { useState } from 'react'
import { Card, Table, Form, Input, Button, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface PersonnelRecord {
  key: string
  serialNumber: number
  employeeId: string
  name: string
  department: string
  position: string
  contactNumber: string
  email: string
  status: 'active' | 'inactive'
}

const mockData: PersonnelRecord[] = [
  { key: '1', serialNumber: 1, employeeId: 'NV001', name: 'Nguyễn Văn A', department: 'Kỹ thuật', position: 'Kỹ sư phần mềm', contactNumber: '090****1001', email: 'nva@company.com', status: 'active' },
  { key: '2', serialNumber: 2, employeeId: 'NV002', name: 'Trần Thị B', department: 'Nhân sự', position: 'Trưởng phòng', contactNumber: '090****1002', email: 'ttb@company.com', status: 'active' },
  { key: '3', serialNumber: 3, employeeId: 'NV003', name: 'Lê Văn C', department: 'Kỹ thuật', position: 'Kỹ sư hệ thống', contactNumber: '090****1003', email: 'lvc@company.com', status: 'active' },
  { key: '4', serialNumber: 4, employeeId: 'NV004', name: 'Phạm Thị D', department: 'Kế toán', position: 'Kế toán viên', contactNumber: '090****1004', email: 'ptd@company.com', status: 'inactive' },
  { key: '5', serialNumber: 5, employeeId: 'NV005', name: 'Hoàng Văn E', department: 'Bảo vệ', position: 'Nhân viên bảo vệ', contactNumber: '090****1005', email: 'hve@company.com', status: 'active' },
  { key: '6', serialNumber: 6, employeeId: 'NV006', name: 'Vũ Thị F', department: 'Hành chính', position: 'Lễ tân', contactNumber: '090****1006', email: 'vtf@company.com', status: 'active' },
]

export default function PersonnelManagement() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<PersonnelRecord[]>(mockData)
  const { t } = useTranslation()

  const columns: ColumnsType<PersonnelRecord> = [
    { title: t('personnel.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 70, align: 'center' },
    { title: t('personnel.employeeId'), dataIndex: 'employeeId', key: 'employeeId', width: 100 },
    { title: t('personnel.name'), dataIndex: 'name', key: 'name', width: 150, ellipsis: true },
    { title: t('personnel.department'), dataIndex: 'department', key: 'department', width: 120 },
    { title: t('personnel.position'), dataIndex: 'position', key: 'position', width: 150, ellipsis: true },
    { title: t('personnel.contactNumber'), dataIndex: 'contactNumber', key: 'contactNumber', width: 130 },
    { title: t('personnel.email'), dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
    { 
      title: t('personnel.status'), 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? t('personnel.active') : t('personnel.inactive')}
        </Tag>
      )
    },
    {
      title: t('common.operation'),
      key: 'operation',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} style={{ padding: 0 }}>
            {t('common.edit')}
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
  }

  const handleAddPersonnel = () => {
    // TODO: open modal or navigate to add form
  }

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '12px 24px' }}>
          <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: '12px 24px', flex: 1 }}>
            <Form.Item label={t('personnel.name')} name="name">
              <Input placeholder={t('personnel.enterName')} style={{ width: 180 }} allowClear />
            </Form.Item>
            <Form.Item label={t('personnel.department')} name="department">
              <Input placeholder={t('personnel.enterDepartment')} style={{ width: 180 }} allowClear />
            </Form.Item>
            <Form.Item label={t('personnel.contactNumber')} name="contactNumber">
              <Input placeholder={t('personnel.enterPhone')} style={{ width: 180 }} allowClear />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSearch} loading={loading}>
                  {t('common.search')}
                </Button>
                <Button onClick={handleReset}>{t('common.reset')}</Button>
              </Space>
            </Form.Item>
          </Form>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPersonnel}>
            {t('personnel.addPersonnel')}
          </Button>
        </div>
      </Card>

      <Card title={t('personnel.personnelList')} bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ 
            total: data.length, 
            showSizeChanger: true, 
            showQuickJumper: true, 
            showTotal: (total) => `${t('common.total')} ${total} ${t('personnel.records')}` 
          }}
        />
      </Card>
    </div>
  )
}
