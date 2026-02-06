import { useState } from 'react'
import { Card, Table, Form, Input, Button, Space, Select, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { SettingOutlined } from '@ant-design/icons'

interface MeetingRoomRecord {
  key: string
  serialNumber: number
  roomName: string
  capacity: number
  equipment: string
  area: string
  building: string
  floor: string
  roomNumber: string
  hasAudio: boolean
}

const mockData: MeetingRoomRecord[] = [
  { key: '1', serialNumber: 1, roomName: 'Phòng họp 601', capacity: 20, equipment: 'Máy tính, bảng trắng', area: 'Khu văn phòng', building: 'Tòa nhà 2', floor: '6F', roomNumber: '601', hasAudio: false },
  { key: '2', serialNumber: 2, roomName: 'Phòng họp 502', capacity: 25, equipment: 'Bảng trắng, máy tính, máy chiếu', area: 'Khu văn phòng', building: 'Tòa nhà 2', floor: '5F', roomNumber: '502', hasAudio: true },
  { key: '3', serialNumber: 3, roomName: 'Phòng họp 501', capacity: 20, equipment: 'Máy tính, máy chiếu', area: 'Khu văn phòng', building: 'Tòa nhà 2', floor: '5F', roomNumber: '501', hasAudio: true },
  { key: '4', serialNumber: 4, roomName: 'Phòng họp lớn A', capacity: 50, equipment: 'Máy tính, máy chiếu, micro', area: 'Khu hội nghị', building: 'Tòa nhà 1', floor: '3F', roomNumber: '301', hasAudio: true },
  { key: '5', serialNumber: 5, roomName: 'Phòng họp nhỏ B', capacity: 10, equipment: 'TV, bảng trắng', area: 'Khu văn phòng', building: 'Tòa nhà 1', floor: '2F', roomNumber: '205', hasAudio: false },
]

export default function SmartMeetingRoom() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<MeetingRoomRecord[]>(mockData)
  const { t } = useTranslation()

  const columns: ColumnsType<MeetingRoomRecord> = [
    { title: t('meetingRoom.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 70, align: 'center' },
    { title: t('meetingRoom.roomName'), dataIndex: 'roomName', key: 'roomName', width: 150 },
    { title: t('meetingRoom.capacity'), dataIndex: 'capacity', key: 'capacity', width: 80, align: 'center' },
    { title: t('meetingRoom.equipment'), dataIndex: 'equipment', key: 'equipment', width: 200, ellipsis: true },
    { title: t('meetingRoom.area'), dataIndex: 'area', key: 'area', width: 120 },
    { title: t('meetingRoom.building'), dataIndex: 'building', key: 'building', width: 100 },
    { title: t('meetingRoom.floor'), dataIndex: 'floor', key: 'floor', width: 70, align: 'center' },
    { title: t('meetingRoom.roomNumber'), dataIndex: 'roomNumber', key: 'roomNumber', width: 90, align: 'center' },
    { 
      title: t('meetingRoom.hasAudio'), 
      dataIndex: 'hasAudio', 
      key: 'hasAudio', 
      width: 100,
      align: 'center',
      render: (hasAudio: boolean) => (
        <Tag color={hasAudio ? 'green' : 'orange'}>
          {hasAudio ? t('meetingRoom.yes') : t('meetingRoom.no')}
        </Tag>
      )
    },
    {
      title: t('common.operation'),
      key: 'operation',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<SettingOutlined />}
          style={{ background: '#faad14', borderColor: '#faad14' }}
        >
          {t('meetingRoom.deviceManagement')}
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
          <Form.Item label={t('meetingRoom.region')} name="region">
            <Select placeholder={t('meetingRoom.selectRegion')} style={{ width: 150 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="hanoi">Hà Nội</Select.Option>
              <Select.Option value="hcm">TP. Hồ Chí Minh</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('meetingRoom.building')} name="building">
            <Select placeholder={t('meetingRoom.selectBuilding')} style={{ width: 150 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="building1">Tòa nhà 1</Select.Option>
              <Select.Option value="building2">Tòa nhà 2</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('meetingRoom.floor')} name="floor">
            <Select placeholder={t('meetingRoom.selectFloor')} style={{ width: 120 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="1F">1F</Select.Option>
              <Select.Option value="2F">2F</Select.Option>
              <Select.Option value="3F">3F</Select.Option>
              <Select.Option value="5F">5F</Select.Option>
              <Select.Option value="6F">6F</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('meetingRoom.roomType')} name="roomType">
            <Select placeholder={t('meetingRoom.selectRoomType')} style={{ width: 180 }} allowClear>
              <Select.Option value="all">{t('common.all')}</Select.Option>
              <Select.Option value="small">{t('meetingRoom.small')}</Select.Option>
              <Select.Option value="medium">{t('meetingRoom.medium')}</Select.Option>
              <Select.Option value="large">{t('meetingRoom.large')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('meetingRoom.roomName')} name="roomName">
            <Input placeholder={t('meetingRoom.enterRoomName')} style={{ width: 180 }} allowClear />
          </Form.Item>
          <Form.Item label={t('meetingRoom.roomNumber')} name="roomNumber">
            <Input placeholder={t('meetingRoom.enterRoomNumber')} style={{ width: 150 }} allowClear />
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
            showTotal: (total) => `${total} ${t('meetingRoom.inTotal')}` 
          }}
        />
      </Card>
    </div>
  )
}
