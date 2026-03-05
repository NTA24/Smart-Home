import { useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  DatePicker,
  message,
  Spin,
  Table,
  Typography,
  Space,
} from 'antd'
import { ReloadOutlined, DatabaseOutlined, BarChartOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { energyMvApi } from '@/services'
import type { MvDeviceDayResponse, MvBuildingDayResponse } from '@/services'

const { RangePicker } = DatePicker
const { Text } = Typography

export interface EnergyMvPageProps {
  embedded?: boolean
}

export default function EnergyMvPage({ embedded }: EnergyMvPageProps = {}) {
  const { t } = useTranslation()
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [deviceDayLoading, setDeviceDayLoading] = useState(false)
  const [buildingDayLoading, setBuildingDayLoading] = useState(false)
  const [deviceDayData, setDeviceDayData] = useState<MvDeviceDayResponse[]>([])
  const [buildingDayData, setBuildingDayData] = useState<MvBuildingDayResponse[]>([])
  const [deviceForm] = Form.useForm()
  const [buildingForm] = Form.useForm()

  const handleRefreshMv = async () => {
    setRefreshLoading(true)
    try {
      await energyMvApi.refreshMv()
      message.success(t('energyMv.refreshSuccess'))
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('energyMv.refreshError')}: ${errorMsg}`)
    } finally {
      setRefreshLoading(false)
    }
  }

  const handleQueryDeviceDay = async () => {
    const values = await deviceForm.validateFields().catch(() => null)
    if (!values?.device_id || !values?.dateRange?.length) return
    setDeviceDayLoading(true)
    try {
      const [start, end] = values.dateRange
      const res = await energyMvApi.getDeviceDay({
        device_id: values.device_id,
        start_day: start.format('YYYY-MM-DD'),
        end_day: end.format('YYYY-MM-DD'),
      })
      const arr = Array.isArray(res) ? res : res ? [res] : []
      setDeviceDayData(arr)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('energyMv.queryError')}: ${errorMsg}`)
      setDeviceDayData([])
    } finally {
      setDeviceDayLoading(false)
    }
  }

  const handleQueryBuildingDay = async () => {
    const values = await buildingForm.validateFields().catch(() => null)
    if (!values?.building_id || !values?.dateRange?.length) return
    setBuildingDayLoading(true)
    try {
      const [start, end] = values.dateRange
      const res = await energyMvApi.getBuildingDay({
        building_id: values.building_id,
        start_day: start.format('YYYY-MM-DD'),
        end_day: end.format('YYYY-MM-DD'),
      })
      const arr = Array.isArray(res) ? res : res ? [res] : []
      setBuildingDayData(arr)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('energyMv.queryError')}: ${errorMsg}`)
      setBuildingDayData([])
    } finally {
      setBuildingDayLoading(false)
    }
  }

  const deviceColumns = [
    { title: t('energyMv.deviceId'), dataIndex: 'device_id', key: 'device_id', ellipsis: true, render: (v: string) => <Text copyable className="font-mono text-sm">{v || '—'}</Text> },
    { title: t('energyMv.day'), dataIndex: 'day', key: 'day', width: 180 },
    { title: 'kWh', dataIndex: 'kwh', key: 'kwh', width: 100, render: (v: number) => <Text strong>{v ?? '—'}</Text> },
    { title: t('energyMv.kwAvg'), dataIndex: 'kw_avg', key: 'kw_avg', width: 100 },
    { title: t('energyMv.kwPeak'), dataIndex: 'kw_peak', key: 'kw_peak', width: 100 },
  ]

  const buildingColumns = [
    { title: t('energyMv.buildingId'), dataIndex: 'building_id', key: 'building_id', ellipsis: true, render: (v: string) => <Text copyable className="font-mono text-sm">{v || '—'}</Text> },
    { title: t('energyMv.day'), dataIndex: 'day', key: 'day', width: 180 },
    { title: 'kWh', dataIndex: 'kwh', key: 'kwh', width: 100, render: (v: number) => <Text strong>{v ?? '—'}</Text> },
    { title: t('energyMv.kwAvg'), dataIndex: 'kw_avg', key: 'kw_avg', width: 100 },
    { title: t('energyMv.kwPeak'), dataIndex: 'kw_peak', key: 'kw_peak', width: 100 },
  ]

  const content = (
    <>
      {!embedded && (
        <PageHeader
          title={t('energyMv.title')}
          icon={<DatabaseOutlined />}
          subtitle={t('energyMv.subtitle')}
        />
      )}
      <ContentCard
        title={t('energyMv.refreshMv')}
        titleIcon={<ReloadOutlined />}
        titleIconColor="#52c41a"
        className="mb-4"
      >
        <p className="text-gray-500 mb-3">{t('energyMv.refreshHint')}</p>
        <Button type="primary" loading={refreshLoading} onClick={handleRefreshMv} icon={<ReloadOutlined />}>
          {t('energyMv.refreshButton')}
        </Button>
      </ContentCard>

      <Space direction="vertical" size="middle" className="w-full">
        <Card title={t('energyMv.deviceDay')} extra={<BarChartOutlined />}>
          <Form form={deviceForm} layout="inline" onFinish={handleQueryDeviceDay} className="mb-4 gap-2">
            <Form.Item name="device_id" label={t('energyMv.deviceId')} rules={[{ required: true }]}>
              <Input placeholder="UUID" className="w-64 font-mono" />
            </Form.Item>
            <Form.Item name="dateRange" label={t('energyMv.dateRange')} rules={[{ required: true }]}>
              <RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={deviceDayLoading}>
                {t('energyMv.query')}
              </Button>
            </Form.Item>
          </Form>
          <Spin spinning={deviceDayLoading}>
            <Table
              rowKey={(r) => `${r.device_id}-${r.day}`}
              columns={deviceColumns}
              dataSource={deviceDayData}
              pagination={false}
              size="small"
            />
          </Spin>
        </Card>

        <Card title={t('energyMv.buildingDay')} extra={<BarChartOutlined />}>
          <Form form={buildingForm} layout="inline" onFinish={handleQueryBuildingDay} className="mb-4 gap-2">
            <Form.Item name="building_id" label={t('energyMv.buildingId')} rules={[{ required: true }]}>
              <Input placeholder="UUID" className="w-64 font-mono" />
            </Form.Item>
            <Form.Item name="dateRange" label={t('energyMv.dateRange')} rules={[{ required: true }]}>
              <RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={buildingDayLoading}>
                {t('energyMv.query')}
              </Button>
            </Form.Item>
          </Form>
          <Spin spinning={buildingDayLoading}>
            <Table
              rowKey={(r) => `${r.building_id}-${r.day}`}
              columns={buildingColumns}
              dataSource={buildingDayData}
              pagination={false}
              size="small"
            />
          </Spin>
        </Card>
      </Space>
    </>
  )
  return embedded ? content : <PageContainer>{content}</PageContainer>
}
