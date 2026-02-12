import { useState } from 'react'
import { Card, Table, Form, Input, Select, DatePicker, Button, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { RangePicker } = DatePicker

interface AlarmRecord {
  key: string
  serialNumber: number
  parkName: string
  deviceName: string
  deviceType: string
  latestAlarmTime: string
  alarmCount: number
  alarmStatus: string
  alarmStartTime: string
  deviceMac: string
  alarmSource: string
  bigAlarmType: string
  smallAlarmType: string
  dispositionType: string
}

const mockData: AlarmRecord[] = Array.from({ length: 10 }, (_, i) => ({
  key: `${i + 1}`,
  serialNumber: i + 1,
  parkName: 'Maike Hea...',
  deviceName: i < 6 ? 'A negative ...' : 'Negative o...',
  deviceType: 'Monitoring ...',
  latestAlarmTime: `2026-01-26 09:08:${52 - i}`,
  alarmCount: 1,
  alarmStatus: 'Call the po...',
  alarmStartTime: `2026-01-26 09:08:${52 - i}`,
  deviceMac: i < 6 ? '2cc1634dcd644f33...' : 'd2cb55147ad441b6...',
  alarmSource: 'IoT device ...',
  bigAlarmType: 'Video alarm',
  smallAlarmType: 'Regional invasion',
  dispositionType: 'There was ...',
}))

export default function AlarmStatistics() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<AlarmRecord[]>(mockData)
  const { t } = useTranslation()

  const columns: ColumnsType<AlarmRecord> = [
    { title: t('alarms.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 80, align: 'center' },
    { title: t('alarms.parkName'), dataIndex: 'parkName', key: 'parkName', width: 100, ellipsis: true },
    { title: t('alarms.deviceName'), dataIndex: 'deviceName', key: 'deviceName', width: 100, ellipsis: true },
    { title: t('alarms.deviceType'), dataIndex: 'deviceType', key: 'deviceType', width: 100, ellipsis: true },
    { title: t('alarms.latestAlarmTime'), dataIndex: 'latestAlarmTime', key: 'latestAlarmTime', width: 160 },
    { title: t('alarms.alarmCount'), dataIndex: 'alarmCount', key: 'alarmCount', width: 80, align: 'center', render: (count: number) => <Tag color="blue">{count}</Tag> },
    { title: t('alarms.alarmStatus'), dataIndex: 'alarmStatus', key: 'alarmStatus', width: 100, ellipsis: true, render: (status: string) => <Tag color="orange">{status}</Tag> },
    { title: t('alarms.alarmStartTime'), dataIndex: 'alarmStartTime', key: 'alarmStartTime', width: 160 },
    { title: t('alarms.deviceMac'), dataIndex: 'deviceMac', key: 'deviceMac', width: 150, ellipsis: true },
    { title: t('alarms.alarmSource'), dataIndex: 'alarmSource', key: 'alarmSource', width: 100, ellipsis: true },
    { title: t('alarms.bigAlarmType'), dataIndex: 'bigAlarmType', key: 'bigAlarmType', width: 100 },
    { title: t('alarms.smallAlarmType'), dataIndex: 'smallAlarmType', key: 'smallAlarmType', width: 120 },
    { title: t('alarms.dispositionType'), dataIndex: 'dispositionType', key: 'dispositionType', width: 100, ellipsis: true, render: (type: string) => <span style={{ color: '#1890ff' }}>{type}</span> },
    { title: t('common.operation'), key: 'operation', width: 80, fixed: 'right', render: () => <a style={{ color: '#1890ff' }}>{t('common.details')}</a> },
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
        <Form form={form} layout="inline" style={{ flexWrap: 'wrap', gap: 16 }}>
          <Form.Item label={t('alarms.deviceName')} name="deviceName">
            <Input placeholder={t('alarms.deviceName')} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label={t('alarms.deviceType')} name="deviceType">
            <Select placeholder={t('alarms.deviceType')} style={{ width: 180 }}>
              <Select.Option value="monitoring">Monitoring</Select.Option>
              <Select.Option value="sensor">Sensor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.dispositionType')} name="dispositionType">
            <Select placeholder={t('alarms.dispositionType')} style={{ width: 180 }}>
              <Select.Option value="processed">Processed</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.bigAlarmType')} name="bigAlarmType">
            <Select placeholder={t('alarms.bigAlarmType')} style={{ width: 180 }}>
              <Select.Option value="video">Video alarm</Select.Option>
              <Select.Option value="fire">Fire alarm</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.smallAlarmType')} name="smallAlarmType">
            <Select placeholder={t('alarms.smallAlarmType')} style={{ width: 180 }}>
              <Select.Option value="regional">Regional invasion</Select.Option>
              <Select.Option value="motion">Motion detection</Select.Option>
            </Select>
          </Form.Item>
        </Form>
        <Form form={form} layout="inline" style={{ marginTop: 16 }}>
          <Form.Item label={t('alarms.latestAlarmTime')} name="alarmTime">
            <RangePicker style={{ width: 260 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>{t('common.inquire')}</Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card bordered={false}>
        <Title level={5} style={{ marginBottom: 16, color: '#666' }}>{t('alarms.dataList')}</Title>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{ total: 100, showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `${t('common.total')} ${total}` }}
        />
      </Card>
    </div>
  )
}
