import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Button, Space, Tag, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import {
  PageContainer,
  PageHeader,
  FilterBar,
  ContentCard,
  DataTable,
  TableActionButtons,
  CrudModal,
} from '@/components'
import {
  getPeoplePersonnel,
  savePeoplePersonnel,
  getPeoplePersonnelFilters,
  savePeoplePersonnelFilters,
} from '@/services/mockPersistence'

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

interface PersonnelFilterValues {
  name?: string
  department?: string
  contactNumber?: string
}

interface PersonnelFormValues {
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
  const [modalForm] = Form.useForm<PersonnelFormValues>()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PersonnelRecord[]>(() => getPeoplePersonnel(mockData))
  const [filters, setFilters] = useState<PersonnelFilterValues>(() =>
    getPeoplePersonnelFilters<PersonnelFilterValues>({}),
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PersonnelRecord | null>(null)
  const { t } = useTranslation()

  const filteredData = useMemo(() => {
    const name = filters.name?.trim().toLowerCase()
    const department = filters.department?.trim().toLowerCase()
    const contact = filters.contactNumber?.trim().toLowerCase()
    return data.filter((item) => {
      if (name && !item.name.toLowerCase().includes(name)) return false
      if (department && !item.department.toLowerCase().includes(department)) return false
      if (contact && !item.contactNumber.toLowerCase().includes(contact)) return false
      return true
    })
  }, [data, filters])

  useEffect(() => {
    form.setFieldsValue(filters)
  }, [form])

  useEffect(() => {
    savePeoplePersonnel(data)
  }, [data])

  useEffect(() => {
    savePeoplePersonnelFilters(filters)
  }, [filters])

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
        <TableActionButtons
          onEdit={() => {
            setEditingRecord(record)
            modalForm.setFieldsValue({
              employeeId: record.employeeId,
              name: record.name,
              department: record.department,
              position: record.position,
              contactNumber: record.contactNumber,
              email: record.email,
              status: record.status,
            })
            setModalOpen(true)
          }}
          onDelete={() => {
            setData((prev) => prev.filter((item) => item.key !== record.key))
          }}
          deleteConfirmTitle={t('common.confirmDelete')}
        />
      ),
    },
  ]

  const handleSearch = async () => {
    const values = await form.validateFields()
    setFilters(values)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({})
  }

  const handleAddPersonnel = () => {
    setEditingRecord(null)
    modalForm.setFieldsValue({
      employeeId: '',
      name: '',
      department: '',
      position: '',
      contactNumber: '',
      email: '',
      status: 'active',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRecord(null)
    modalForm.resetFields()
  }

  const handleSubmit = (values: PersonnelFormValues) => {
    if (editingRecord) {
      setData((prev) =>
        prev.map((item) =>
          item.key === editingRecord.key
            ? { ...item, ...values }
            : item,
        ),
      )
    } else {
      const nextItem: PersonnelRecord = {
        key: `person-${Date.now()}`,
        serialNumber: data.length + 1,
        ...values,
      }
      setData((prev) => [nextItem, ...prev.map((item, idx) => ({ ...item, serialNumber: idx + 2 }))])
    }
    closeModal()
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('personnel.personnelList')}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPersonnel}>
            {t('personnel.addPersonnel')}
          </Button>
        }
      />
      <ContentCard className="people_card-mb">
        <FilterBar>
          <Form
            form={form}
            layout="inline"
            className="people_filter-form"
            onValuesChange={(_, allValues) => setFilters(allValues)}
          >
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
        </FilterBar>
      </ContentCard>

      <ContentCard title={t('personnel.personnelList')}>
        <DataTable<PersonnelRecord>
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1200 }}
          total={filteredData.length}
          showSizeChanger
          showQuickJumper
        />
      </ContentCard>

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        form={modalForm}
        isEdit={!!editingRecord}
        onSubmit={handleSubmit}
        title={editingRecord ? t('common.edit', 'Edit personnel') : t('personnel.addPersonnel')}
      >
        <Form.Item name="employeeId" label={t('personnel.employeeId')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label={t('personnel.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label={t('personnel.department')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="position" label={t('personnel.position')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contactNumber" label={t('personnel.contactNumber')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label={t('personnel.email')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label={t('personnel.status')} rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'active', label: t('personnel.active') },
              { value: 'inactive', label: t('personnel.inactive') },
            ]}
          />
        </Form.Item>
      </CrudModal>
    </PageContainer>
  )
}
