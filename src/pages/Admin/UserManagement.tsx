import { useState } from 'react'
import { Form, Input, Button, Space, Card, Table } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { TableActionButtons } from '@/components'

interface UserPermissionRecord {
  key: string
  serialNumber: number
  username: string
  name: string
  contactNumber: string
  userType: string
  characterName: string
}

const mockData: UserPermissionRecord[] = [
  { key: '1', serialNumber: 1, username: 'test1', name: 'test1', contactNumber: '090****1001', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
  { key: '2', serialNumber: 2, username: 'test2', name: 'test2', contactNumber: '090****1002', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
  { key: '3', serialNumber: 3, username: 'test3', name: 'test3', contactNumber: '090****1003', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
  { key: '4', serialNumber: 4, username: 'test4', name: 'test4', contactNumber: '090****1004', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
  { key: '5', serialNumber: 5, username: 'test5', name: 'test5', contactNumber: '090****1005', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
  { key: '6', serialNumber: 6, username: 'test6', name: 'test6', contactNumber: '090****1006', userType: 'Organization Senior Admin', characterName: 'Company administrator' },
]

export default function UserManagement() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<UserPermissionRecord[]>(mockData)
  const { t } = useTranslation()

  const columns: ColumnsType<UserPermissionRecord> = [
    { title: t('userPermission.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 80, align: 'center' },
    { title: t('userPermission.username'), dataIndex: 'username', key: 'username', width: 140, ellipsis: true },
    { title: t('userPermission.name'), dataIndex: 'name', key: 'name', width: 120, ellipsis: true },
    { title: t('userPermission.contactNumber'), dataIndex: 'contactNumber', key: 'contactNumber', width: 140 },
    { title: t('userPermission.userType'), dataIndex: 'userType', key: 'userType', width: 180, ellipsis: true },
    { title: t('userPermission.characterName'), dataIndex: 'characterName', key: 'characterName', width: 160, ellipsis: true },
    {
      title: t('common.operation'),
      key: 'operation',
      width: 100,
      fixed: 'right',
      render: () => (
        <TableActionButtons onEdit={() => { /* TODO: open edit modal */ }} />
      ),
    },
  ]

  const handleInquire = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
  }

  const handleAddAdmin = () => {
  }

  return (
    <div>
      <Card variant="borderless" className="admin_card-mb">
        <div className="admin_form-wrap">
          <Form form={form} layout="inline" className="admin_form-wrap flex-1">
            <Form.Item label={t('userPermission.username')} name="username">
              <Input placeholder={t('userPermission.pleaseEnterUsername')} style={{ width: 220 }} allowClear />
            </Form.Item>
            <Form.Item label={t('userPermission.mobilePhone')} name="mobilePhone">
              <Input placeholder={t('userPermission.pleaseEnterMobile')} style={{ width: 220 }} allowClear />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleInquire} loading={loading}>
                  {t('common.inquire')}
                </Button>
                <Button onClick={handleReset}>{t('common.reset')}</Button>
              </Space>
            </Form.Item>
          </Form>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAdmin}>
            + {t('userPermission.addAdminUsers')}
          </Button>
        </div>
      </Card>

      <Card title={t('userPermission.dataList')} variant="borderless">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ total: data.length, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `${t('common.total')} ${total}` }}
        />
      </Card>
    </div>
  )
}
