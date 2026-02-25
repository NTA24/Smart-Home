import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'
import { PageContainer, ContentCard, DataTable } from '@/components'
import dayjs from 'dayjs'
import {
  getEnergyAlarmStatisticsFilters,
  saveEnergyAlarmStatisticsFilters,
} from '@/services/mockPersistence'

const { RangePicker } = DatePicker
type AlarmFilterFormValues = {
  deviceName?: string
  deviceType?: string
  dispositionType?: string
  bigAlarmType?: string
  smallAlarmType?: string
  alarmTime?: [dayjs.Dayjs, dayjs.Dayjs]
}
type PersistedAlarmFilterFormValues = Omit<AlarmFilterFormValues, 'alarmTime'> & {
  alarmTime?: [string, string]
}

function toPersistedFilterValues(values: AlarmFilterFormValues): PersistedAlarmFilterFormValues {
  return {
    ...values,
    alarmTime: values.alarmTime?.[0] && values.alarmTime?.[1]
      ? [values.alarmTime[0].toISOString(), values.alarmTime[1].toISOString()]
      : undefined,
  }
}

function toAlarmFormValues(values: PersistedAlarmFilterFormValues): AlarmFilterFormValues {
  return {
    ...values,
    alarmTime: values.alarmTime?.[0] && values.alarmTime?.[1]
      ? [dayjs(values.alarmTime[0]), dayjs(values.alarmTime[1])]
      : undefined,
  }
}

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
  parkName: 'Khu Maike',
  deviceName: i < 6 ? 'Cảm biến cửa khu A' : 'Camera hành lang B',
  deviceType: i < 6 ? 'Giám sát' : 'Cảm biến',
  latestAlarmTime: `2026-01-26 09:08:${52 - i}`,
  alarmCount: 1,
  alarmStatus: i < 5 ? 'Đã gọi bảo vệ' : 'Chờ xác minh',
  alarmStartTime: `2026-01-26 09:08:${52 - i}`,
  deviceMac: i < 6 ? '2cc1634dcd644f33...' : 'd2cb55147ad441b6...',
  alarmSource: 'Thiết bị IoT',
  bigAlarmType: i < 7 ? 'Cảnh báo video' : 'Cảnh báo cháy',
  smallAlarmType: i < 7 ? 'Xâm nhập khu vực' : 'Phát hiện chuyển động',
  dispositionType: i < 5 ? 'Đã tạo phiếu xử lý' : 'Chờ xử lý',
}))

export default function AlarmStatistics() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data] = useState<AlarmRecord[]>(mockData)
  const [appliedFilters, setAppliedFilters] = useState<AlarmFilterFormValues>({})
  const { t } = useTranslation()

  useEffect(() => {
    const savedFilters = getEnergyAlarmStatisticsFilters<PersistedAlarmFilterFormValues>({})
    const restored = toAlarmFormValues(savedFilters)
    form.setFieldsValue(restored)
    setAppliedFilters(restored)
  }, [form])

  const normalize = (value?: string) => (value || '').trim().toLowerCase()

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesDeviceName = !appliedFilters.deviceName
        || normalize(item.deviceName).includes(normalize(appliedFilters.deviceName))
      const matchesDeviceType = !appliedFilters.deviceType
        || normalize(item.deviceType).includes(normalize(appliedFilters.deviceType))
      const matchesDisposition = !appliedFilters.dispositionType
        || normalize(item.dispositionType).includes(normalize(appliedFilters.dispositionType))
      const matchesBigAlarm = !appliedFilters.bigAlarmType
        || normalize(item.bigAlarmType).includes(normalize(appliedFilters.bigAlarmType))
      const matchesSmallAlarm = !appliedFilters.smallAlarmType
        || normalize(item.smallAlarmType).includes(normalize(appliedFilters.smallAlarmType))

      const latestAlarmTime = dayjs(item.latestAlarmTime, 'YYYY-MM-DD HH:mm:ss')
      const matchesAlarmTime = !appliedFilters.alarmTime?.[0] || !appliedFilters.alarmTime?.[1]
        || (
          latestAlarmTime.isValid()
          && !latestAlarmTime.isBefore(appliedFilters.alarmTime[0], 'minute')
          && !latestAlarmTime.isAfter(appliedFilters.alarmTime[1], 'minute')
        )

      return (
        matchesDeviceName
        && matchesDeviceType
        && matchesDisposition
        && matchesBigAlarm
        && matchesSmallAlarm
        && matchesAlarmTime
      )
    })
  }, [data, appliedFilters])

  const columns: ColumnsType<AlarmRecord> = [
    { title: t('alarms.serialNumber'), dataIndex: 'serialNumber', key: 'serialNumber', width: 80, align: 'center' },
    { title: t('alarms.parkName'), dataIndex: 'parkName', key: 'parkName', width: 140, ellipsis: true },
    { title: t('alarms.deviceName'), dataIndex: 'deviceName', key: 'deviceName', width: 180, ellipsis: true },
    { title: t('alarms.deviceType'), dataIndex: 'deviceType', key: 'deviceType', width: 120, ellipsis: true },
    { title: t('alarms.latestAlarmTime'), dataIndex: 'latestAlarmTime', key: 'latestAlarmTime', width: 160 },
    { title: t('alarms.alarmCount'), dataIndex: 'alarmCount', key: 'alarmCount', width: 80, align: 'center', render: (count: number) => <Tag color="blue">{count}</Tag> },
    { title: t('alarms.alarmStatus'), dataIndex: 'alarmStatus', key: 'alarmStatus', width: 150, ellipsis: true, render: (status: string) => <Tag color="orange">{status}</Tag> },
    { title: t('alarms.alarmStartTime'), dataIndex: 'alarmStartTime', key: 'alarmStartTime', width: 160 },
    { title: t('alarms.deviceMac'), dataIndex: 'deviceMac', key: 'deviceMac', width: 170, ellipsis: true },
    { title: t('alarms.alarmSource'), dataIndex: 'alarmSource', key: 'alarmSource', width: 130, ellipsis: true },
    { title: t('alarms.bigAlarmType'), dataIndex: 'bigAlarmType', key: 'bigAlarmType', width: 140 },
    { title: t('alarms.smallAlarmType'), dataIndex: 'smallAlarmType', key: 'smallAlarmType', width: 170 },
    { title: t('alarms.dispositionType'), dataIndex: 'dispositionType', key: 'dispositionType', width: 170, ellipsis: true, render: (type: string) => <span className="energy_link">{type}</span> },
    { title: t('common.operation'), key: 'operation', width: 90, align: 'center', render: () => <a className="energy_link">{t('common.details')}</a> },
  ]

  const handleSearch = () => {
    const values = form.getFieldsValue() as AlarmFilterFormValues
    saveEnergyAlarmStatisticsFilters(toPersistedFilterValues(values))
    setAppliedFilters(values)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
  }

  const handleReset = () => {
    form.resetFields()
    saveEnergyAlarmStatisticsFilters({})
    setAppliedFilters({})
  }

  return (
    <PageContainer>
      <ContentCard className="mb-16">
        <Form
          form={form}
          layout="inline"
          onValuesChange={(_, allValues) => saveEnergyAlarmStatisticsFilters(toPersistedFilterValues(allValues))}
          className="energy_form-inline"
        >
          <Form.Item label={t('alarms.deviceName')} name="deviceName">
            <Input placeholder={t('alarms.deviceName')} className="energy_input-w180" />
          </Form.Item>
          <Form.Item label={t('alarms.deviceType')} name="deviceType">
            <Select placeholder={t('alarms.deviceType')} className="energy_input-w180">
              <Select.Option value="Giám sát">Giám sát</Select.Option>
              <Select.Option value="Cảm biến">Cảm biến</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.dispositionType')} name="dispositionType">
            <Select placeholder={t('alarms.dispositionType')} className="energy_input-w180">
              <Select.Option value="Đã tạo phiếu xử lý">Đã tạo phiếu xử lý</Select.Option>
              <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.bigAlarmType')} name="bigAlarmType">
            <Select placeholder={t('alarms.bigAlarmType')} className="energy_input-w180">
              <Select.Option value="Cảnh báo video">Cảnh báo video</Select.Option>
              <Select.Option value="Cảnh báo cháy">Cảnh báo cháy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('alarms.smallAlarmType')} name="smallAlarmType">
            <Select placeholder={t('alarms.smallAlarmType')} className="energy_input-w180">
              <Select.Option value="Xâm nhập khu vực">Xâm nhập khu vực</Select.Option>
              <Select.Option value="Phát hiện chuyển động">Phát hiện chuyển động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
        <Form
          form={form}
          layout="inline"
          onValuesChange={(_, allValues) => saveEnergyAlarmStatisticsFilters(toPersistedFilterValues(allValues))}
          className="energy_form-row"
        >
          <Form.Item label={t('alarms.latestAlarmTime')} name="alarmTime">
            <RangePicker className="energy_input-w260" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>{t('common.inquire')}</Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </ContentCard>

      <ContentCard title={t('alarms.dataList')} className="alarm_statistics-card">
        <DataTable<AlarmRecord>
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          className="alarm_statistics-table"
          scroll={{ x: 1600 }}
          total={filteredData.length}
          showQuickJumper
        />
      </ContentCard>
    </PageContainer>
  )
}
