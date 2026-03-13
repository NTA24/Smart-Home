import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Spin, Button, message, Modal, DatePicker, Select, Input, Table, Tabs } from 'antd'
import type { Dayjs } from 'dayjs'
import {
  ArrowLeftOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  FireOutlined,
  CloudOutlined,
  CloseOutlined,
  PictureOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { PageContainer } from '@/components'
import { thingsBoardApi, buildEntitiesQueryFindPayload } from '@/services'

/** Map dashboard id -> device id khi config dashboard không trả về entityAliases (vd. Ổ cắm điện Aqara) */
const DASHBOARD_TO_DEVICE_ID: Record<string, string> = {
  '4a47e9e0-1b95-11f1-ae4a-7d6b236a15c2': '5dda6760-1c28-11f1-ae4a-7d6b236a15c2', // Ổ cắm điện Aqara
}

/** Dashboard cảm biến nhiệt độ và độ ẩm — dùng getDashboard, visit, tenant/dashboards, serverTime */
const TEMP_HUMIDITY_DASHBOARD_ID = '8ac183c0-1b8e-11f1-ae4a-7d6b236a15c2'

/** Rule Engine Statistics — getDashboard, visit, tenant/dashboards, serverTime */
const RULE_ENGINE_DASHBOARD_ID = 'd0f90c50-1aa3-11f1-8db1-5df566826c84'

/** Software OTA dashboard (Device list) — getDashboard, visit, serverTime */
const SOFTWARE_DASHBOARD_ID = 'd0f6c260-1aa3-11f1-8db1-5df566826c84'

/** Bảng thống kê năng lượng Tasmota — getDashboard, visit, tenant/dashboards, serverTime, images */
const TASMOTA_ENERGY_DASHBOARD_ID = '0add88d0-1ddb-11f1-ae4a-7d6b236a15c2'

function getDeviceIdFromDashboard(data: Record<string, unknown> | null, dashboardId: string): string | null {
  if (!data) return DASHBOARD_TO_DEVICE_ID[dashboardId] ?? null
  const config = data.configuration as Record<string, unknown> | undefined
  if (!config) return DASHBOARD_TO_DEVICE_ID[dashboardId] ?? null
  const aliases = config.entityAliases as Record<string, { entityType?: string; entityId?: string }> | undefined
  if (!aliases || typeof aliases !== 'object') return DASHBOARD_TO_DEVICE_ID[dashboardId] ?? null
  for (const key of Object.keys(aliases)) {
    const alias = aliases[key]
    if (alias?.entityType === 'DEVICE' && alias.entityId) return alias.entityId
  }
  return DASHBOARD_TO_DEVICE_ID[dashboardId] ?? null
}

/** Đồng hồ Current 0–5 A dùng ECharts — titleLabel/unitLabel cho i18n */
function TasmotaCurrentGaugeEcharts({
  value,
  max,
  compact = false,
  fullScreen = false,
  titleLabel = 'Current',
  unitLabel = 'A',
}: {
  value: number
  max: number
  compact?: boolean
  fullScreen?: boolean
  titleLabel?: string
  unitLabel?: string
}) {
  const axisLabelFontSize = compact ? 9 : 11
  const axisLabelDistance = compact ? 20 : 24
  const detailFontSize = compact ? 18 : 28
  const titleFontSize = compact ? 12 : 16
  const height = fullScreen ? '100%' : compact ? 400 : 520
  const option = {
    series: [
      {
        type: 'gauge',
        min: 0,
        max,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: compact ? 16 : 20,
            color: [
              [2.5 / max, '#f5d4a8'],
              [3.5 / max, '#e89550'],
              [1, '#d46b2d'],
            ],
          },
        },
        pointer: { width: compact ? 5 : 6, itemStyle: { color: '#e89550' } },
        axisTick: { length: 6, lineStyle: { color: '#8c8c8c' } },
        splitLine: { length: 12, lineStyle: { color: '#595959', width: 2 } },
        axisLabel: { distance: axisLabelDistance, color: '#595959', fontSize: axisLabelFontSize },
        detail: {
          formatter: '{value}',
          fontSize: detailFontSize,
          color: '#262626',
          offsetCenter: [0, '60%'],
        },
        title: { show: true, offsetCenter: [0, '-10%'], fontSize: titleFontSize, color: '#595959', formatter: titleLabel },
        data: [{ value, name: unitLabel }],
      },
    ],
  }
  return (
    <div className={`energy-tasmota-gauge-echarts-wrap${fullScreen ? ' energy-tasmota-gauge-echarts-fullscreen' : ''}`}>
      <ReactECharts option={option} style={{ height, width: '100%' }} notMerge />
    </div>
  )
}

/** Đồng hồ Power Factor 0–1 dùng ECharts — titleLabel/unitLabel cho i18n */
function TasmotaPowerFactorGaugeEcharts({
  value,
  compact = false,
  fullScreen = false,
  titleLabel = 'Power Factor',
  unitLabel = 'PF',
}: {
  value: number
  compact?: boolean
  fullScreen?: boolean
  titleLabel?: string
  unitLabel?: string
}) {
  const axisLabelFontSize = compact ? 9 : 11
  const axisLabelDistance = compact ? 20 : 24
  const detailFontSize = compact ? 18 : 28
  const titleFontSize = compact ? 12 : 16
  const height = fullScreen ? '100%' : compact ? 400 : 520
  const option = {
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 1,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: compact ? 16 : 20,
            color: [
              [0.5, '#ff3b30'],
              [0.8, '#ffd60a'],
              [1, '#007aff'],
            ],
          },
        },
        pointer: { width: compact ? 5 : 6, itemStyle: { color: '#e89550' } },
        axisTick: { length: 6, lineStyle: { color: '#8c8c8c' } },
        splitLine: { length: 12, lineStyle: { color: '#595959', width: 2 } },
        axisLabel: { distance: axisLabelDistance, color: '#595959', fontSize: axisLabelFontSize },
        detail: {
          formatter: '{value}',
          fontSize: detailFontSize,
          color: '#262626',
          offsetCenter: [0, '60%'],
        },
        title: { show: true, offsetCenter: [0, '-10%'], fontSize: titleFontSize, color: '#595959', formatter: titleLabel },
        data: [{ value, name: unitLabel }],
      },
    ],
  }
  return (
    <div className={`energy-tasmota-gauge-echarts-wrap${fullScreen ? ' energy-tasmota-gauge-echarts-fullscreen' : ''}`}>
      <ReactECharts option={option} style={{ height, width: '100%' }} notMerge />
    </div>
  )
}

export default function EnergyDeviceDashboardViewPage() {
  const { t } = useTranslation()
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deviceTitle, setDeviceTitle] = useState('')
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [powerOn, setPowerOn] = useState(false)
  const [powerLoading, setPowerLoading] = useState(false)
  const [continuousToggle, setContinuousToggle] = useState(false)
  const continuousIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleOffTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [schedulePickerValue, setSchedulePickerValue] = useState<Dayjs | null>(null)
  const [scheduleModalLoading, setScheduleModalLoading] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<number | null>(null)
  const [scheduleOffModalOpen, setScheduleOffModalOpen] = useState(false)
  const [scheduleOffPickerValue, setScheduleOffPickerValue] = useState<Dayjs | null>(null)
  const [scheduleOffModalLoading, setScheduleOffModalLoading] = useState(false)
  const [scheduledOffAt, setScheduledOffAt] = useState<number | null>(null)
  const [serverTime, setServerTime] = useState<number | null>(null)
  const [sensorEditMode, setSensorEditMode] = useState(false)
  const [tempTitle, setTempTitle] = useState('Temperature')
  const [humidityTitle, setHumidityTitle] = useState('humidity')
  const [showTempCard, setShowTempCard] = useState(true)
  const [showHumidityCard, setShowHumidityCard] = useState(true)
  const [editCardModalOpen, setEditCardModalOpen] = useState(false)
  const [editingCardKey, setEditingCardKey] = useState<'temp' | 'humidity' | null>(null)
  const [editingCardTitle, setEditingCardTitle] = useState('')
  const [tasmotaGaugeFullScreen, setTasmotaGaugeFullScreen] = useState<'current' | 'pf' | null>(null)
  const isTempHumidityDashboard = dashboardId === TEMP_HUMIDITY_DASHBOARD_ID
  const isRuleEngineDashboard = dashboardId === RULE_ENGINE_DASHBOARD_ID
  const isSoftwareDashboard = dashboardId === SOFTWARE_DASHBOARD_ID
  const isTasmotaEnergyDashboard = dashboardId === TASMOTA_ENERGY_DASHBOARD_ID
  const isSoftwareLikeDashboard = isSoftwareDashboard || deviceTitle === 'Software' || deviceTitle === 'Firmware'

  useEffect(() => {
    if (!dashboardId) {
      setLoading(false)
      setError(t('energyDeviceDashboard.invalidDashboard', 'Invalid dashboard'))
      return
    }

    setLoading(true)
    setError(null)

    const useStatsApis = isTempHumidityDashboard || isRuleEngineDashboard || isTasmotaEnergyDashboard
    if (useStatsApis) {
      Promise.all([
        thingsBoardApi.getDashboard(dashboardId),
        thingsBoardApi.visitDashboard(dashboardId),
        thingsBoardApi.getTenantDashboards({ pageSize: 100, page: 0 }),
        thingsBoardApi.getServerTime(),
      ])
        .then(([dashboardRes, , , serverTimeRes]) => {
          const data = dashboardRes as Record<string, unknown>
          const title = (data?.title as string) || ''
          if (title) setDeviceTitle(title)
          const ts = typeof serverTimeRes === 'number' ? serverTimeRes : (serverTimeRes as { serverTime?: number })?.serverTime
          if (ts != null) setServerTime(ts)
          setDeviceId(null)
        })
        .catch((err) => {
          setError(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed'))
        })
        .finally(() => setLoading(false))
      return
    }

    if (isSoftwareDashboard) {
      Promise.all([
        thingsBoardApi.getDashboard(dashboardId),
        thingsBoardApi.visitDashboard(dashboardId),
        thingsBoardApi.getServerTime(),
      ])
        .then(([dashboardRes, , serverTimeRes]) => {
          const data = dashboardRes as Record<string, unknown>
          const title = (data?.title as string) || ''
          if (title) setDeviceTitle(title)
          const ts = typeof serverTimeRes === 'number' ? serverTimeRes : (serverTimeRes as { serverTime?: number })?.serverTime
          if (ts != null) setServerTime(ts)
          setDeviceId(null)
        })
        .catch((err) => {
          setError(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed'))
        })
        .finally(() => setLoading(false))
      return
    }

    const resolvedDeviceId = DASHBOARD_TO_DEVICE_ID[dashboardId] ?? dashboardId
    const findPayload = buildEntitiesQueryFindPayload(resolvedDeviceId)
    Promise.allSettled([
      thingsBoardApi.getDashboard(dashboardId),
      thingsBoardApi.visitDashboard(dashboardId),
      thingsBoardApi.getTenantDashboards({ pageSize: 100, page: 0 }),
      thingsBoardApi.entitiesQueryFind(findPayload),
    ]).then((results) => {
      setLoading(false)
      const dashboardResult = results[0]
      if (dashboardResult.status === 'rejected') {
        setError(dashboardResult.reason?.response?.data?.message ?? dashboardResult.reason?.message ?? t('common.loadFailed'))
        return
      }
      const data = dashboardResult.status === 'fulfilled' ? (dashboardResult.value as Record<string, unknown>) : null
      const title = (data as { title?: string })?.title
      if (title) setDeviceTitle(title)
      const id = getDeviceIdFromDashboard(data, dashboardId) ?? dashboardId
      setDeviceId(id)
    })
  }, [dashboardId, t])

  const openEditCardModal = (key: 'temp' | 'humidity', currentTitle: string) => {
    setEditingCardKey(key)
    setEditingCardTitle(currentTitle)
    setEditCardModalOpen(true)
  }

  const handleEditCardOk = () => {
    if (!editingCardKey) {
      setEditCardModalOpen(false)
      return
    }
    if (editingCardKey === 'temp') {
      setTempTitle(editingCardTitle || 'Temperature')
    } else {
      setHumidityTitle(editingCardTitle || 'humidity')
    }
    setEditCardModalOpen(false)
  }

  const handleEditCardCancel = () => {
    setEditCardModalOpen(false)
  }

  const handleExportCard = (key: 'temp' | 'humidity') => {
    message.info(
      key === 'temp'
        ? t('energyDeviceDashboard.exportTemperature', 'Đang xuất dữ liệu nhiệt độ (demo)')
        : t('energyDeviceDashboard.exportHumidity', 'Đang xuất dữ liệu độ ẩm (demo)'),
    )
  }

  const handleDeleteCard = (key: 'temp' | 'humidity') => {
    if (key === 'temp') {
      setShowTempCard(false)
    } else {
      setShowHumidityCard(false)
    }
  }

  const handlePowerClick = () => {
    const id = deviceId ?? dashboardId
    if (!id) {
      message.warning(t('energyDeviceDashboard.noDeviceId', 'Không có device id'))
      return
    }
    const next = !powerOn
    setPowerLoading(true)
    thingsBoardApi
      .postDeviceSharedScope(id, { power: next ? 'on' : 'off' })
      .then(() => {
        setPowerOn(next)
        message.success(next ? t('energyDeviceDashboard.powerOn', 'Đã bật') : t('energyDeviceDashboard.powerOff', 'Đã tắt'))
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))
      })
      .finally(() => setPowerLoading(false))
  }

  const handleContinuousToggleClick = () => {
    const id = deviceId ?? dashboardId
    if (!id) {
      message.warning(t('energyDeviceDashboard.noDeviceId', 'Không có device id'))
      return
    }
    if (continuousToggle) {
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current)
        continuousIntervalRef.current = null
      }
      setContinuousToggle(false)
      message.info(t('energyDeviceDashboard.continuousStopped', 'Đã dừng bật/tắt liên tục'))
      return
    }
    setContinuousToggle(true)
    let next = !powerOn
    const tick = () => {
      thingsBoardApi
        .postDeviceSharedScope(id, { power: next ? 'on' : 'off' })
        .then(() => setPowerOn(next))
        .catch((err) => {
          message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))
          if (continuousIntervalRef.current) {
            clearInterval(continuousIntervalRef.current)
            continuousIntervalRef.current = null
          }
          setContinuousToggle(false)
        })
      next = !next
    }
    tick()
    continuousIntervalRef.current = setInterval(tick, 1000)
  }

  useEffect(() => {
    return () => {
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current)
      }
      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current)
      }
      if (scheduleOffTimeoutRef.current) {
        clearTimeout(scheduleOffTimeoutRef.current)
      }
    }
  }, [])

  const openScheduleModal = () => {
    const id = deviceId ?? dashboardId
    if (!id) {
      message.warning(t('energyDeviceDashboard.noDeviceId', 'Không có device id'))
      return
    }
    setScheduleModalOpen(true)
    setSchedulePickerValue(null)
    setScheduleModalLoading(true)
    thingsBoardApi
      .getServerTime()
      .then((res) => {
        const serverTimeMs = typeof res === 'number' ? res : (res && typeof res === 'object' && 'serverTime' in res ? (res as { serverTime?: number }).serverTime : null)
        const ts = serverTimeMs ?? Date.now()
        setSchedulePickerValue(dayjs(ts))
      })
      .catch(() => setSchedulePickerValue(dayjs()))
      .finally(() => setScheduleModalLoading(false))
  }

  const handleScheduleConfirm = () => {
    const id = deviceId ?? dashboardId
    const when = schedulePickerValue
    if (!id || !when) {
      message.warning(t('energyDeviceDashboard.selectScheduleTime', 'Chọn giờ hẹn bật'))
      return
    }
    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current)
      scheduleTimeoutRef.current = null
    }
    const targetMs = when.valueOf()
    const delay = targetMs - Date.now()
    const timeStr = when.format('YYYY-MM-DD HH:mm:ss')

    const fireOn = () => {
      thingsBoardApi
        .postDeviceSharedScope(id, { power: 'on' })
        .then(() => {
          setPowerOn(true)
          setScheduledAt(null)
          message.success(t('energyDeviceDashboard.scheduledOnFired', 'Đã bật theo giờ hẹn'))
        })
        .catch((err) => {
          message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))
          setScheduledAt(null)
        })
      scheduleTimeoutRef.current = null
    }

    if (delay <= 0) {
      fireOn()
      setScheduleModalOpen(false)
      return
    }
    setScheduledAt(targetMs)
    scheduleTimeoutRef.current = setTimeout(fireOn, delay)
    setScheduleModalOpen(false)
    message.success(t('energyDeviceDashboard.scheduledOnSet', 'Đã hẹn bật lúc {{time}}', { time: timeStr }))
  }

  const cancelScheduledOn = () => {
    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current)
      scheduleTimeoutRef.current = null
    }
    setScheduledAt(null)
    message.info(t('energyDeviceDashboard.scheduledOnCancelled', 'Đã hủy hẹn bật'))
  }

  const openScheduleOffModal = () => {
    const id = deviceId ?? dashboardId
    if (!id) {
      message.warning(t('energyDeviceDashboard.noDeviceId', 'Không có device id'))
      return
    }
    setScheduleOffModalOpen(true)
    setScheduleOffPickerValue(null)
    setScheduleOffModalLoading(true)
    thingsBoardApi
      .getServerTime()
      .then((res) => {
        const serverTimeMs = typeof res === 'number' ? res : (res && typeof res === 'object' && 'serverTime' in res ? (res as { serverTime?: number }).serverTime : null)
        const ts = serverTimeMs ?? Date.now()
        setScheduleOffPickerValue(dayjs(ts))
      })
      .catch(() => setScheduleOffPickerValue(dayjs()))
      .finally(() => setScheduleOffModalLoading(false))
  }

  const handleScheduleOffConfirm = () => {
    const id = deviceId ?? dashboardId
    const when = scheduleOffPickerValue
    if (!id || !when) {
      message.warning(t('energyDeviceDashboard.selectScheduleOffTime', 'Chọn giờ hẹn tắt'))
      return
    }
    if (scheduleOffTimeoutRef.current) {
      clearTimeout(scheduleOffTimeoutRef.current)
      scheduleOffTimeoutRef.current = null
    }
    const targetMs = when.valueOf()
    const delay = targetMs - Date.now()
    const timeStr = when.format('YYYY-MM-DD HH:mm:ss')

    const fireOff = () => {
      thingsBoardApi
        .postDeviceSharedScope(id, { power: 'off' })
        .then(() => {
          setPowerOn(false)
          setScheduledOffAt(null)
          message.success(t('energyDeviceDashboard.scheduledOffFired', 'Đã tắt theo giờ hẹn'))
        })
        .catch((err) => {
          message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))
          setScheduledOffAt(null)
        })
      scheduleOffTimeoutRef.current = null
    }

    if (delay <= 0) {
      fireOff()
      setScheduleOffModalOpen(false)
      return
    }
    setScheduledOffAt(targetMs)
    scheduleOffTimeoutRef.current = setTimeout(fireOff, delay)
    setScheduleOffModalOpen(false)
    message.success(t('energyDeviceDashboard.scheduledOffSet', 'Đã hẹn tắt lúc {{time}}', { time: timeStr }))
  }

  const cancelScheduledOff = () => {
    if (scheduleOffTimeoutRef.current) {
      clearTimeout(scheduleOffTimeoutRef.current)
      scheduleOffTimeoutRef.current = null
    }
    setScheduledOffAt(null)
    message.info(t('energyDeviceDashboard.scheduledOffCancelled', 'Đã hủy hẹn tắt'))
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-red-600">{error}</p>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/energy-device-dashboard')}>
            {t('energyDeviceDashboard.backToList', 'Quay lại danh sách')}
          </Button>
        </div>
      </PageContainer>
    )
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Spin size="large" />
          <p>{t('energyDeviceDashboard.loadingDashboard', 'Đang tải bảng điều khiển...')}</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div
        className={`flex flex-col gap-4 ${
          isRuleEngineDashboard || isSoftwareLikeDashboard || isTasmotaEnergyDashboard
            ? 'max-w-full'
            : isTempHumidityDashboard
            ? 'max-w-4xl'
            : 'max-w-2xl'
        }`}
      >
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/energy-device-dashboard')}
          className="energy-back-btn self-start"
        >
          {t('energyDeviceDashboard.backToList', 'Quay lại danh sách')}
        </Button>

        {isRuleEngineDashboard ? (
          /* Rule Engine Statistics */
          <div className="energy-rule-engine-wrap">
            <div className="energy-device-view-title-bar">
              {deviceTitle || t('energyDeviceDashboard.ruleEngineStatistics', 'Rule Engine Statistics')}
            </div>
            <div className="energy-sensor-toolbar">
              <Select
                suffixIcon={<DownOutlined />}
                value="rule-engine"
                style={{ minWidth: 220 }}
                options={[
                  {
                    value: 'rule-engine',
                    label: t('energyDeviceDashboard.ruleEngineStatistics', 'Rule Engine Statistics'),
                  },
                ]}
              />
              <span className="energy-sensor-realtime">
                <ClockCircleOutlined /> Realtime - last 1 minute
                {serverTime != null && (
                  <span className="energy-sensor-server-time">
                    {' '}
                    ({dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss')})
                  </span>
                )}
              </span>
              <Button type="text" icon={<FullscreenOutlined />} aria-label="Fullscreen" />
              <Button type="default" icon={<EditOutlined />} size="small">
                {t('energyDeviceDashboard.editMode', 'Edit mode')}
              </Button>
              <Button type="text" icon={<DownloadOutlined />} aria-label="Download" />
              <Button type="text" icon={<SyncOutlined />} aria-label="Refresh" onClick={() => message.info(t('energyDeviceDashboard.refresh', 'Refresh'))} />
            </div>
            <div className="energy-rule-engine-charts">
              <div className="energy-rule-engine-chart-card">
                <div className="energy-rule-engine-chart-title">Queue Stats</div>
                <div className="energy-rule-engine-chart-subtitle">Realtime - last 5 minutes</div>
                <div className="energy-rule-engine-chart-placeholder" />
              </div>
              <div className="energy-rule-engine-chart-card">
                <div className="energy-rule-engine-chart-title">Processing Failures and Timeouts</div>
                <div className="energy-rule-engine-chart-subtitle">Realtime - last 5 minutes</div>
                <div className="energy-rule-engine-chart-placeholder" />
              </div>
            </div>
            <div className="energy-rule-engine-exceptions">
              <div className="energy-rule-engine-exceptions-header">
                <span className="energy-rule-engine-exceptions-title">Exceptions</span>
                <span className="energy-rule-engine-chart-subtitle">Realtime - last 1 day</span>
              </div>
              <Tabs
                defaultActiveKey="high"
                size="small"
                items={[
                  { key: 'high', label: 'HighPriority_tb-node-0' },
                  { key: 'main', label: 'Main_tb-node-0' },
                ]}
              />
              <Table
                dataSource={[]}
                columns={[
                  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', sorter: true },
                  { title: 'Rule Chain', dataIndex: 'ruleChain', key: 'ruleChain' },
                  { title: 'Rule Node', dataIndex: 'ruleNode', key: 'ruleNode' },
                  { title: 'Latest Error', dataIndex: 'latestError', key: 'latestError' },
                ]}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} items` }}
                locale={{ emptyText: t('common.noData', 'No data found') }}
              />
            </div>
          </div>
        ) : isTasmotaEnergyDashboard ? (
          /* Bảng thống kê năng lượng Tasmota */
          (() => {
            const powerCardBg = thingsBoardApi.getImageUrl('/api/images/system/power_consumption_card_background.png')
            const chartCardBg = thingsBoardApi.getImageUrl('/api/images/system/power_consumption_chart_card_background.png')
            const powerVal = 31
            const reactivePowerVal = 34
            const apparentPowerVal = 46
            const currentVal = 0.16
            const powerFactorVal = 0.69
            const lastUpdateSec = 60
            const lastUpdateText =
              lastUpdateSec >= 60
                ? t('energyDeviceDashboard.minutesAgo', { count: Math.floor(lastUpdateSec / 60) })
                : t('energyDeviceDashboard.secondsAgo', { count: lastUpdateSec })
            return (
              <div className="energy-tasmota-wrap">
                <div className="energy-device-view-title-bar">
                  {deviceTitle || t('energyDeviceDashboard.tasmotaEnergyStats')}
                </div>
                <div className="energy-sensor-toolbar">
                  <Select
                    suffixIcon={<DownOutlined />}
                    value="realtime-1h"
                    style={{ minWidth: 220 }}
                    options={[{ value: 'realtime-1h', label: t('energyDeviceDashboard.realtimeLast1Hour') }]}
                  />
                  <Button type="text" icon={<PictureOutlined />} aria-label={t('common.image')} />
                  <Button type="default" icon={<EditOutlined />} size="small">
                    {t('energyDeviceDashboard.editMode')}
                  </Button>
                  <Button type="text" icon={<DownloadOutlined />} aria-label={t('common.download')} />
                  <Button type="text" icon={<FullscreenOutlined />} aria-label={t('common.fullscreen')} />
                  {serverTime != null && (
                    <span className="energy-sensor-server-time" style={{ marginLeft: 8 }}>
                      {dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  )}
                </div>
                <div className="energy-tasmota-cards">
                  <div className="energy-tasmota-card" style={{ backgroundImage: `url(${powerCardBg})` }}>
                    <div className="energy-tasmota-card-header">
                      <ThunderboltOutlined className="energy-tasmota-card-icon" />
                      <span className="energy-tasmota-card-label">{t('energyDeviceDashboard.power')}</span>
                    </div>
                    <div className="energy-tasmota-card-meta">{t('energyDeviceDashboard.lastUpdateAgo', { time: lastUpdateText })}</div>
                    <div className="energy-tasmota-card-value">{powerVal} kW</div>
                  </div>
                  <div className="energy-tasmota-card" style={{ backgroundImage: `url(${powerCardBg})` }}>
                    <div className="energy-tasmota-card-header">
                      <ThunderboltOutlined className="energy-tasmota-card-icon" />
                      <span className="energy-tasmota-card-label">{t('energyDeviceDashboard.reactivePower')}</span>
                    </div>
                    <div className="energy-tasmota-card-meta">{t('energyDeviceDashboard.lastUpdateAgo', { time: lastUpdateText })}</div>
                    <div className="energy-tasmota-card-value">{reactivePowerVal} VAR</div>
                  </div>
                  <div className="energy-tasmota-card" style={{ backgroundImage: `url(${powerCardBg})` }}>
                    <div className="energy-tasmota-card-header">
                      <ThunderboltOutlined className="energy-tasmota-card-icon" />
                      <span className="energy-tasmota-card-label">{t('energyDeviceDashboard.apparentPower')}</span>
                    </div>
                    <div className="energy-tasmota-card-meta">{t('energyDeviceDashboard.lastUpdateAgo', { time: lastUpdateText })}</div>
                    <div className="energy-tasmota-card-value">{apparentPowerVal} VA</div>
                  </div>
                </div>
                <div className="energy-tasmota-gauges">
                  <div className="energy-tasmota-gauge-card">
                    <Button
                      type="text"
                      icon={<FullscreenOutlined />}
                      className="energy-tasmota-gauge-fullscreen-btn"
                      onClick={() => setTasmotaGaugeFullScreen('current')}
                      aria-label={t('energyDeviceDashboard.gaugesFullScreen')}
                    />
                    <TasmotaCurrentGaugeEcharts
                      value={currentVal}
                      max={5}
                      compact
                      titleLabel={t('energyDeviceDashboard.current')}
                      unitLabel={t('energyDeviceDashboard.unitA')}
                    />
                  </div>
                  <div className="energy-tasmota-gauge-card">
                    <Button
                      type="text"
                      icon={<FullscreenOutlined />}
                      className="energy-tasmota-gauge-fullscreen-btn"
                      onClick={() => setTasmotaGaugeFullScreen('pf')}
                      aria-label={t('energyDeviceDashboard.gaugesFullScreen')}
                    />
                    <TasmotaPowerFactorGaugeEcharts
                      value={powerFactorVal}
                      compact
                      titleLabel={t('energyDeviceDashboard.powerFactor')}
                      unitLabel={t('energyDeviceDashboard.unitPF')}
                    />
                  </div>
                </div>
                <Modal
                  open={tasmotaGaugeFullScreen !== null}
                  onCancel={() => setTasmotaGaugeFullScreen(null)}
                  footer={null}
                  width="100%"
                  styles={{ body: { padding: 24 } }}
                  wrapClassName="energy-tasmota-gauges-fullscreen-modal"
                  closable
                  closeIcon={<CloseOutlined />}
                >
                  <div className="energy-tasmota-gauge-fullscreen-single">
                    {tasmotaGaugeFullScreen === 'current' && (
                      <TasmotaCurrentGaugeEcharts
                        value={currentVal}
                        max={5}
                        fullScreen
                        titleLabel={t('energyDeviceDashboard.current')}
                        unitLabel={t('energyDeviceDashboard.unitA')}
                      />
                    )}
                    {tasmotaGaugeFullScreen === 'pf' && (
                      <TasmotaPowerFactorGaugeEcharts
                        value={powerFactorVal}
                        fullScreen
                        titleLabel={t('energyDeviceDashboard.powerFactor')}
                        unitLabel={t('energyDeviceDashboard.unitPF')}
                      />
                    )}
                  </div>
                </Modal>
                <div className="energy-tasmota-power-consumption" style={{ backgroundImage: `url(${chartCardBg})` }}>
                  <div className="energy-tasmota-power-consumption-header">
                    <ThunderboltOutlined className="energy-tasmota-power-consumption-icon" />
                    <span className="energy-tasmota-power-consumption-label">{t('energyDeviceDashboard.powerConsumption')}</span>
                  </div>
                  <div className="energy-tasmota-power-consumption-meta">{t('energyDeviceDashboard.currentMonthSoFar')}</div>
                  <div className="energy-tasmota-power-consumption-meta">cau_noi</div>
                  <div className="energy-tasmota-power-consumption-value-row">
                    <span className="energy-tasmota-power-consumption-value">0.2 kW</span>
                    <span className="energy-tasmota-power-consumption-na">
                      <span>{t('energyDeviceDashboard.na')}</span>
                      <span className="energy-tasmota-power-consumption-na-unit">kWh</span>
                    </span>
                  </div>
                  <div className="energy-tasmota-power-consumption-meta energy-tasmota-power-consumption-last">
                    {t('energyDeviceDashboard.lastUpdateAgo', { time: lastUpdateText })}
                  </div>
                </div>
              </div>
            )
          })()
        ) : isSoftwareLikeDashboard ? (
          /* Software OTA - Device list */
          <div className="energy-software-wrap">
            <div className="energy-device-view-title-bar">
              {deviceTitle || 'Device list'}
            </div>
            <div className="energy-sensor-toolbar">
              <Button type="default" size="small">
                Filters
              </Button>
              <span className="energy-sensor-realtime">
                <ClockCircleOutlined /> Realtime - last 1 minute
                {serverTime != null && (
                  <span className="energy-sensor-server-time">
                    {' '}
                    ({dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss')})
                  </span>
                )}
              </span>
              <Button type="default" icon={<EditOutlined />} size="small">
                {t('energyDeviceDashboard.editMode', 'Edit mode')}
              </Button>
              <Button type="text" icon={<FullscreenOutlined />} aria-label="Fullscreen" />
            </div>
            <div className="energy-software-main">
              <div className="energy-software-table">
                <div className="energy-software-table-title">Devices</div>
                <Table
                  dataSource={[]}
                  columns={[
                    { title: 'Device', dataIndex: 'device', key: 'device' },
                    { title: 'Current SW title', dataIndex: 'currentSwTitle', key: 'currentSwTitle' },
                    { title: 'Current SW version', dataIndex: 'currentSwVersion', key: 'currentSwVersion' },
                    { title: 'Target SW title', dataIndex: 'targetSwTitle', key: 'targetSwTitle' },
                    { title: 'Target SW version', dataIndex: 'targetSwVersion', key: 'targetSwVersion' },
                    { title: 'Target SW set time', dataIndex: 'targetSwSetTime', key: 'targetSwSetTime' },
                    { title: 'Progress', dataIndex: 'progress', key: 'progress' },
                    { title: 'Status', dataIndex: 'status', key: 'status' },
                  ]}
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} items` }}
                  locale={{ emptyText: t('common.noData', 'No data found') }}
                />
              </div>
              <div className="energy-software-side">
                {[
                  { key: 'waiting', label: 'Device Waiting' },
                  { key: 'updating', label: 'Device Updating' },
                  { key: 'failed', label: 'Device Failed' },
                  { key: 'updated', label: 'Device Updated' },
                ].map((item) => (
                  <div key={item.key} className="energy-software-stat-card">
                    <div className="energy-software-stat-value">0</div>
                    <div className="energy-software-stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isTempHumidityDashboard ? (
          /* Cảm biến nhiệt độ và độ ẩm */
          <div className="energy-outlet-wrap">
            <div className="energy-device-view-title-bar">
              {deviceTitle || t('energyDeviceDashboard.tempHumiditySensor', 'Cảm biến nhiệt độ và độ ẩm')}
            </div>
            <div className="energy-sensor-toolbar">
              <Select
                suffixIcon={<DownOutlined />}
                value="temp-humidity"
                style={{ minWidth: 180 }}
                options={[{ value: 'temp-humidity', label: t('energyDeviceDashboard.tempAndHumidity', 'Nhiệt độ và độ ẩm') }]}
              />
              <span className="energy-sensor-realtime">
                <ClockCircleOutlined /> Realtime - last 1 hour
                {serverTime != null && (
                  <span className="energy-sensor-server-time"> ({dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss')})</span>
                )}
              </span>
              <Button
                type={sensorEditMode ? 'primary' : 'default'}
                icon={<EditOutlined />}
                size="small"
                onClick={() => setSensorEditMode((prev) => !prev)}
              >
                {t('energyDeviceDashboard.editMode', 'Edit mode')}
              </Button>
              <Button type="text" icon={<DownloadOutlined />} aria-label="Download" />
              <Button type="text" icon={<FullscreenOutlined />} aria-label="Fullscreen" />
            </div>
            <div className="energy-sensor-cards">
              {showTempCard && (
                <div className="energy-sensor-card">
                  {sensorEditMode && (
                    <div className="energy-sensor-card-actions">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        aria-label="Edit card"
                        onClick={() => openEditCardModal('temp', tempTitle)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        aria-label="Export card"
                        onClick={() => handleExportCard('temp')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        aria-label="Delete card"
                        onClick={() => handleDeleteCard('temp')}
                      />
                    </div>
                  )}
                  <div className="energy-sensor-card-main">
                    <div className="energy-sensor-card-left">
                      <div className="energy-sensor-card-icon">
                        <FireOutlined />
                      </div>
                      <div className="energy-sensor-card-text">
                        <div className="energy-sensor-card-title">{tempTitle}</div>
                        <div className="energy-sensor-card-meta">
                          {t('energyDeviceDashboard.lastUpdate', 'Last update')} Just now
                        </div>
                      </div>
                    </div>
                    <div className="energy-sensor-card-value">25.75 °C</div>
                  </div>
                </div>
              )}
              {showHumidityCard && (
                <div className="energy-sensor-card">
                  {sensorEditMode && (
                    <div className="energy-sensor-card-actions">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        aria-label="Edit card"
                        onClick={() => openEditCardModal('humidity', humidityTitle)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DownloadOutlined />}
                        aria-label="Export card"
                        onClick={() => handleExportCard('humidity')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        aria-label="Delete card"
                        onClick={() => handleDeleteCard('humidity')}
                      />
                    </div>
                  )}
                  <div className="energy-sensor-card-main">
                    <div className="energy-sensor-card-left">
                      <div className="energy-sensor-card-icon">
                        <CloudOutlined />
                      </div>
                      <div className="energy-sensor-card-text">
                        <div className="energy-sensor-card-title">{humidityTitle}</div>
                        <div className="energy-sensor-card-meta">
                          {t('energyDeviceDashboard.lastUpdate', 'Last update')} Just now
                        </div>
                      </div>
                    </div>
                    <div className="energy-sensor-card-value">71.42 %</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
        /* Ổ cắm điện: title + card */
        <div className="energy-outlet-wrap">
          <div className="energy-device-view-title-bar">
            {deviceTitle || t('energyDeviceDashboard.dashboardView', 'Bảng điều khiển thiết bị')}
          </div>
          <div className="energy-device-view-card">
            <div className="energy-device-view-card-label">{t('energyDeviceDashboard.power', 'Power')}</div>
            <div className="energy-device-view-controls">
            <button
              type="button"
              onClick={handlePowerClick}
              disabled={powerLoading || continuousToggle}
              className={`energy-device-view-power-btn ${powerOn ? 'energy-device-view-power-on' : ''}`}
              aria-pressed={powerOn}
            >
              {powerLoading ? '...' : powerOn ? t('energyDeviceDashboard.on', 'ON') : t('energyDeviceDashboard.off', 'OFF')}
            </button>
            <Button
              type={continuousToggle ? 'primary' : 'default'}
              danger={continuousToggle}
              icon={<SyncOutlined spin={continuousToggle} />}
              onClick={handleContinuousToggleClick}
              disabled={powerLoading}
            >
              {continuousToggle ? t('energyDeviceDashboard.stopContinuous', 'Dừng') : t('energyDeviceDashboard.continuousToggle', 'Bật/tắt liên tục')}
            </Button>
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              onClick={openScheduleModal}
              disabled={powerLoading || continuousToggle}
            >
              {t('energyDeviceDashboard.setOnByServerTime', 'Đặt giờ bật (theo server)')}
            </Button>
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              onClick={openScheduleOffModal}
              disabled={powerLoading || continuousToggle}
            >
              {t('energyDeviceDashboard.setOffByServerTime', 'Hẹn giờ tắt (theo server)')}
            </Button>
            </div>
            {scheduledAt != null && (
              <div className="energy-device-view-scheduled">
                <ClockCircleOutlined />
                <span>{t('energyDeviceDashboard.scheduledOnAt', 'Sẽ bật lúc {{time}}', { time: dayjs(scheduledAt).format('YYYY-MM-DD HH:mm:ss') })}</span>
                <Button type="link" size="small" danger onClick={cancelScheduledOn}>
                  {t('energyDeviceDashboard.cancelSchedule', 'Hủy hẹn')}
                </Button>
              </div>
            )}
            {scheduledOffAt != null && (
              <div className="energy-device-view-scheduled">
                <ClockCircleOutlined />
                <span>{t('energyDeviceDashboard.scheduledOffAt', 'Sẽ tắt lúc {{time}}', { time: dayjs(scheduledOffAt).format('YYYY-MM-DD HH:mm:ss') })}</span>
                <Button type="link" size="small" danger onClick={cancelScheduledOff}>
                  {t('energyDeviceDashboard.cancelSchedule', 'Hủy hẹn')}
                </Button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <Modal
        title={t('energyDeviceDashboard.scheduleOnTitle', 'Chọn giờ hẹn bật')}
        open={scheduleModalOpen}
        onOk={handleScheduleConfirm}
        onCancel={() => setScheduleModalOpen(false)}
        okText={t('common.confirm', 'Xác nhận')}
        cancelText={t('common.cancel', 'Hủy')}
        confirmLoading={false}
      >
        <div className="py-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('energyDeviceDashboard.scheduleTimeLabel', 'Giờ bật (theo server)')}
          </label>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value={schedulePickerValue}
            onChange={(v) => setSchedulePickerValue(v)}
            disabled={scheduleModalLoading}
            style={{ width: '100%' }}
            placeholder={t('energyDeviceDashboard.selectTime', 'Chọn ngày giờ')}
          />
        </div>
      </Modal>
      <Modal
        title={t('energyDeviceDashboard.scheduleOffTitle', 'Chọn giờ hẹn tắt')}
        open={scheduleOffModalOpen}
        onOk={handleScheduleOffConfirm}
        onCancel={() => setScheduleOffModalOpen(false)}
        okText={t('common.confirm', 'Xác nhận')}
        cancelText={t('common.cancel', 'Hủy')}
        confirmLoading={false}
      >
        <div className="py-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('energyDeviceDashboard.scheduleOffTimeLabel', 'Giờ tắt (theo server)')}
          </label>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value={scheduleOffPickerValue}
            onChange={(v) => setScheduleOffPickerValue(v)}
            disabled={scheduleOffModalLoading}
            style={{ width: '100%' }}
            placeholder={t('energyDeviceDashboard.selectTime', 'Chọn ngày giờ')}
          />
        </div>
      </Modal>
      <Modal
        open={editCardModalOpen}
        title={t('energyDeviceDashboard.editCardTitle', 'Chỉnh sửa tiêu đề')}
        okText={t('common.save', 'Lưu')}
        cancelText={t('common.cancel', 'Hủy')}
        onOk={handleEditCardOk}
        onCancel={handleEditCardCancel}
        destroyOnClose
      >
        <Input
          value={editingCardTitle}
          onChange={(e) => setEditingCardTitle(e.target.value)}
          placeholder={t('energyDeviceDashboard.cardTitlePlaceholder', 'Nhập tiêu đề mới')}
        />
      </Modal>
    </PageContainer>
  )
}
