import { useState } from 'react'
import { Card, Table, Form, Input, Button, Space, Select, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { SettingOutlined } from '@ant-design/icons'

interface WorkspaceRecord {
  key: string
  serialNumber: number
  roomName: string
  capacity: number
  equipment: string
  area: string
  building: string
  floor: string
  roomNumber: string
  status: 'available' | 'occupied' | 'maintenance'
}

const mockData: WorkspaceRecord[] = [
  { key: '1', serialNumber: 1, roomName: 'Phòng làm việc 301', capacity: 8, equipment: 'Máy tính, máy in', area: 'Khu văn phòng', building: 'Tòa nhà 1', floor: '3F', roomNumber: '301', status: 'available' },
  { key: '2', serialNumber: 2, roomName: 'Phòng làm việc 302', capacity: 10, equipment: 'Máy tính, máy in, máy scan', area: 'Khu văn phòng', building: 'Tòa nhà 1', floor: '3F', roomNumber: '302', status: 'occupied' },
  { key: '3', serialNumber: 3, roomName: 'Phòng làm việc 401', capacity: 6, equipment: 'Máy tính', area: 'Khu văn phòng', building: 'Tòa nhà 1', floor: '4F', roomNumber: '401', status: 'available' },
  { key: '4', serialNumber: 4, roomName: 'Phòng làm việc 501', capacity: 12, equipment: 'Máy tính, máy in, máy chiếu', area: 'Khu văn phòng', building: 'Tòa nhà 2', floor: '5F', roomNumber: '501', status: 'maintenance' },
  { key: '5', serialNumber: 5, roomName: 'Phòng làm việc 502', capacity: 8, equipment: 'Máy tính, bảng trắng', area: 'Khu văn phòng', building: 'Tòa nhà 2', floor: '5F', roomNumber: '502', status: 'available' },
]

export default function SmartWorkspace() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<WorkspaceRecord[]>(mockData)
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green'
      case 'occupied': return 'blue'
      case 'maintenance': return 'orange'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return t('workspace.available')
      case 'occupied': return t('workspace.occupied')
      case 'maintenance': return t('workspace.maintenance')
      default: return status
    }
  }

  const columns: ColumnsType<WorkspaceRecord> = [
    { title: t('workspace.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 70, align: 'center' },
    { title: t('workspace.roomName'), dataIndex: 'roomName', key: 'roomName', width: 150 },
    { title: t('workspace.capacity'), dataIndex: 'capacity', key: 'capacity', width: 80, align: 'center' },
    { title: t('workspace.equipment'), dataIndex: 'equipment', key: 'equipment', width: 200, ellipsis: true },
    { title: t('workspace.area'), dataIndex: 'area', key: 'area', width: 120 },
    { title: t('workspace.building'), dataIndex: 'building', key: 'building', width: 100 },
    { title: t('workspace.floor'), dataIndex: 'floor', key: 'floor', width: 70, align: 'center' },
    { title: t('workspace.roomNumber'), dataIndex: 'roomNumber', key: 'roomNumber', width: 90, align: 'center' },
    { 
      title: t('workspace.status'), 
      dataIndex: 'status', 
      key: 'status', 
      width: 120,
      align: 'center',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: t('common.operation'),
      key: 'operation',
      width: 180,
      fixed: 'right',
      render: () => (
        <Button 
          type="primary" 
          size="small" 
          icon={<SettingOutlined />}
          style={{ background: '#faad14', borderColor: '#faad14' }}
        >
          {t('workspace.deviceManagement')}
        </Button>
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

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: '12px 16px' }}>
          <Form.Item label={t('workspace.region')} name="region">
            <Select placeholder={t('workspace.selectRegion')} style={{ width: 150 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="hanoi">Hà Nội</Select.Option>
              <Select.Option value="hcm">TP. Hồ Chí Minh</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('workspace.building')} name="building">
            <Select placeholder={t('workspace.selectBuilding')} style={{ width: 150 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="building1">Tòa nhà 1</Select.Option>
              <Select.Option value="building2">Tòa nhà 2</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('workspace.floor')} name="floor">
            <Select placeholder={t('workspace.selectFloor')} style={{ width: 120 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="3F">3F</Select.Option>
              <Select.Option value="4F">4F</Select.Option>
              <Select.Option value="5F">5F</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('workspace.status')} name="status">
            <Select placeholder={t('workspace.selectStatus')} style={{ width: 150 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="available">{t('workspace.available')}</Select.Option>
              <Select.Option value="occupied">{t('workspace.occupied')}</Select.Option>
              <Select.Option value="maintenance">{t('workspace.maintenance')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('workspace.roomName')} name="roomName">
            <Input placeholder={t('workspace.enterRoomName')} style={{ width: 180 }} allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch} loading={loading} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                {t('common.search')}
              </Button>
              <Button onClick={handleReset} style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}>
                {t('common.reset')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{ 
            total: data.length, 
            showSizeChanger: true, 
            showQuickJumper: true, 
            showTotal: (total) => `${total} ${t('workspace.inTotal')}` 
          }}
        />
      </Card>
    </div>
  )
}
