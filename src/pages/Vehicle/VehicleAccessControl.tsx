import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, Select, Space, Typography, Tag, Badge, DatePicker, Input, Modal, Spin, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { ContentCard, DataTable } from '@/components'
import { getVehicleLiveEntranceEntries, getVehicleLiveExitEntries, getVehicleManagementConfig } from '@/services/mockPersistence'
import { parkingEventsApi, type ParkingEventItem } from '@/services'
import LiveEntrance from './LiveEntrance'
import LiveExit from './LiveExit'

function mapEventToRow(ev: ParkingEventItem, direction: 'entrance' | 'exit'): {
  key: string
  direction: 'entrance' | 'exit'
  time: string
  plate: string
  type: string
  status: string
  operator: string
  fee: number | null
  occurredAt: string
} {
  const ts = ev.ts ?? ''
  const occurredAt = ts || dayjs().toISOString()
  const time = dayjs(ts).isValid() ? dayjs(ts).format('HH:mm:ss') : '—'
  return {
    key: `${direction}-${ev.id ?? Math.random().toString(36).slice(2)}`,
    direction,
    time,
    plate: ev.plate_no ?? '—',
    type: 'Car',
    status: (ev.status ?? 'OK').toLowerCase(),
    operator: 'Auto',
    fee: direction === 'exit' ? null : null,
    occurredAt,
  }
}

const SPOT_PREVIEW_IMAGE = '/parking-spot-preview.png'

type GateMode = 'entrance' | 'exit'

const { Text } = Typography

export default function VehicleAccessControl() {
  const { t } = useTranslation()
  const gateOptions = useMemo(
    () => [
      { id: 'gate-1', mode: 'entrance' as GateMode, status: 'online' as const },
      { id: 'gate-2', mode: 'entrance' as GateMode, status: 'online' as const },
      { id: 'gate-exit-1', mode: 'exit' as GateMode, status: 'online' as const },
      { id: 'gate-exit-2', mode: 'exit' as GateMode, status: 'online' as const },
    ],
    [],
  )
  const vehicleConfig = getVehicleManagementConfig<{ defaultEntryGate: string; defaultExitGate: string }>({
    defaultEntryGate: gateOptions[0].id,
    defaultExitGate: 'gate-exit-1',
  })
  const [selectedGateId, setSelectedGateId] = useState(
    gateOptions.some((gate) => gate.id === vehicleConfig.defaultEntryGate)
      ? vehicleConfig.defaultEntryGate
      : gateOptions[0].id,
  )
  const [recentVersion, setRecentVersion] = useState(0)
  const [directionFilter, setDirectionFilter] = useState<'all' | 'entrance' | 'exit'>('all')
  const [plateKeyword, setPlateKeyword] = useState('')
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [previewImageOpen, setPreviewImageOpen] = useState(false)
  const [apiEntranceRows, setApiEntranceRows] = useState<Array<ReturnType<typeof mapEventToRow>>>([])
  const [apiExitRows, setApiExitRows] = useState<Array<ReturnType<typeof mapEventToRow>>>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const selectedGate = gateOptions.find((gate) => gate.id === selectedGateId) || gateOptions[0]
  const mode = selectedGate.mode

  const fetchEvents = useCallback(() => {
    setEventsLoading(true)
    const from = timeRange?.[0]?.toISOString()
    const to = timeRange?.[1]?.toISOString()
    const plate = plateKeyword.trim() || undefined
    Promise.all([
      parkingEventsApi.getEntranceList({ from, to, plate, limit: 100, offset: 0 }),
      parkingEventsApi.getExitList({ from, to, plate, limit: 100, offset: 0 }),
    ])
      .then(([entranceRes, exitRes]) => {
        const inItems = entranceRes?.items ?? []
        const outItems = exitRes?.items ?? []
        setApiEntranceRows(inItems.map((ev) => mapEventToRow(ev, 'entrance')))
        setApiExitRows(outItems.map((ev) => mapEventToRow(ev, 'exit')))
      })
      .catch(() => {
        setApiEntranceRows([])
        setApiExitRows([])
      })
      .finally(() => setEventsLoading(false))
  }, [timeRange, plateKeyword])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const entranceSeed = useMemo(
    () => [
      { key: 'in-1', time: '08:30:25', plate: '51A-123.45', type: 'Car', status: 'confirmed', operator: 'Nguyen Van A', occurredAt: `${dayjs().format('YYYY-MM-DD')} 08:30:25` },
      { key: 'in-2', time: '08:28:10', plate: '30G-789.01', type: 'Motorcycle', status: 'manual', operator: 'Auto', occurredAt: `${dayjs().format('YYYY-MM-DD')} 08:28:10` },
      { key: 'in-3', time: '08:20:00', plate: '30A-444.55', type: 'Motorcycle', status: 'blocked', operator: 'Tran Van B', occurredAt: `${dayjs().format('YYYY-MM-DD')} 08:20:00` },
    ],
    [],
  )
  const exitSeed = useMemo(
    () => [
      { key: 'out-1', time: '10:45:20', plate: '51A-123.45', type: 'Car', fee: 25000, status: 'paid', operator: 'Auto', occurredAt: `${dayjs().format('YYYY-MM-DD')} 10:45:20` },
      { key: 'out-2', time: '10:42:15', plate: '30G-789.01', type: 'Motorcycle', fee: 5000, status: 'paid', operator: 'Auto', occurredAt: `${dayjs().format('YYYY-MM-DD')} 10:42:15` },
      { key: 'out-3', time: '10:35:30', plate: '51H-222.33', type: 'Car', fee: 25000, status: 'pending', operator: 'Nguyen Van A', occurredAt: `${dayjs().format('YYYY-MM-DD')} 10:35:30` },
    ],
    [],
  )

  const mockEntranceRows = useMemo(
    () =>
      getVehicleLiveEntranceEntries<any>(entranceSeed).map((item: any) => ({
        key: `in-${item.key}`,
        direction: 'entrance' as const,
        time: item.time,
        plate: item.plate,
        type: item.type,
        status: item.status,
        operator: item.operator,
        fee: null as number | null,
        occurredAt: item.occurredAt || (item as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${item.time}`,
      })),
    [entranceSeed],
  )
  const mockExitRows = useMemo(
    () =>
      getVehicleLiveExitEntries<any>(exitSeed).map((item: any) => ({
        key: `out-${item.key}`,
        direction: 'exit' as const,
        time: item.time,
        plate: item.plate,
        type: item.type,
        status: item.status,
        operator: item.operator,
        fee: item.fee ?? null,
        occurredAt: item.occurredAt || (item as { occuredAt?: string }).occuredAt || `${dayjs().format('YYYY-MM-DD')} ${item.time}`,
      })),
    [exitSeed],
  )

  const recentRows = useMemo(() => {
    const fromApi = [...apiEntranceRows, ...apiExitRows]
    const source = fromApi.length > 0 ? fromApi : [...mockEntranceRows, ...mockExitRows]
    return source
      .filter((row) => {
        if (directionFilter !== 'all' && row.direction !== directionFilter) return false
        if (plateKeyword.trim() && !row.plate.toLowerCase().includes(plateKeyword.trim().toLowerCase())) return false
        if (timeRange) {
          const ts = dayjs(row.occurredAt)
          if (ts.isBefore(timeRange[0]) || ts.isAfter(timeRange[1])) return false
        }
        return true
      })
      .sort((a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf())
  }, [apiEntranceRows, apiExitRows, mockEntranceRows, mockExitRows, directionFilter, plateKeyword, timeRange, recentVersion])

  const recentColumns = useMemo(
    () => [
      {
        title: t('liveEntrance.time'),
        dataIndex: 'occurredAt',
        key: 'occurredAt',
        width: 170,
        render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: t('menu.vehicleAccessControl', 'Kiểm soát phương tiện ra vào'),
        dataIndex: 'direction',
        key: 'direction',
        width: 120,
        render: (value: 'entrance' | 'exit') => (
          <Tag color={value === 'entrance' ? 'blue' : 'orange'}>
            {value === 'entrance' ? t('menu.liveEntrance') : t('menu.liveExit')}
          </Tag>
        ),
      },
      { title: t('liveEntrance.plate'), dataIndex: 'plate', key: 'plate', width: 130 },
      {
        title: t('liveEntrance.lastCapture'),
        dataIndex: 'direction',
        key: 'snapshot',
        width: 130,
        render: (_value: 'entrance' | 'exit', _row: { plate: string }) => (
          <button
            type="button"
            onClick={() => setPreviewImageOpen(true)}
            style={{
              display: 'block',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              padding: 0,
              overflow: 'hidden',
              width: 100,
              height: 56,
              cursor: 'pointer',
              background: '#fafafa',
            }}
          >
            <img
              src={SPOT_PREVIEW_IMAGE}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ),
      },
      {
        title: t('liveEntrance.type'),
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (value: string) => (value === 'Car' ? t('parking.car') : value === 'Motorcycle' ? t('parking.motorcycle') : value),
      },
      {
        title: t('liveEntrance.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (value: string) => {
          const map: Record<string, string> = {
            confirmed: t('liveEntrance.confirmed'),
            manual: t('liveEntrance.manual'),
            blocked: t('liveEntrance.blocked'),
            paid: t('liveExit.paid'),
            pending: t('liveExit.pending'),
            exception: t('liveExit.exception'),
          }
          return map[value] || value
        },
      },
      {
        title: t('liveEntrance.operator'),
        dataIndex: 'operator',
        key: 'operator',
        width: 140,
        render: (value: string) => (value === 'Auto' ? t('vehicleAccessControl.operatorAuto') : value),
      },
      {
        title: t('liveExit.fee'),
        dataIndex: 'fee',
        key: 'fee',
        width: 120,
        render: (value: number | null) => (value == null ? '—' : `${value.toLocaleString('vi-VN')}đ`),
      },
    ],
    [t],
  )

  return (
    <>
      <Card size="small" className="mb-12">
        <Space align="center" wrap>
          <Text type="secondary">{t('menu.vehicleAccessControl', 'Kiểm soát phương tiện ra vào')}:</Text>
          <Select
            value={selectedGateId}
            onChange={setSelectedGateId}
            className="vehicle_select-min"
            options={gateOptions.map((gate) => ({
              value: gate.id,
              label: (
                <span className="flex items-center gap-6">
                  <Badge status={gate.status === 'online' ? 'success' : 'error'} />
                  {gate.mode === 'entrance'
                    ? `${t('menu.liveEntrance')} ${gate.id === 'gate-1' ? '1' : '2'}`
                    : `${t('menu.liveExit')} ${gate.id === 'gate-exit-1' ? '1' : '2'}`}
                </span>
              ),
            }))}
          />
        </Space>
      </Card>

      {mode === 'entrance'
        ? (
          <LiveEntrance
            hideRecentTable
            hideGateSelector
            forcedGateId={selectedGateId}
            embedded
            onEntryAdded={() => setRecentVersion((v) => v + 1)}
          />
        )
        : (
          <LiveExit
            hideRecentTable
            hideGateSelector
            forcedGateId={selectedGateId}
            embedded
            onExitAdded={() => setRecentVersion((v) => v + 1)}
          />
        )}

      <ContentCard
        title={<>{t('vehicleAccessControl.recentTitle')} ({recentRows.length})</>}
        className="mt-12"
      >
        <div className="mb-12 flex items-center gap-8 flex-wrap">
          <Select
            value={directionFilter}
            onChange={(value) => setDirectionFilter(value as 'all' | 'entrance' | 'exit')}
            className="vehicle_filter-select-w130"
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'entrance', label: t('menu.liveEntrance') },
              { value: 'exit', label: t('menu.liveExit') },
            ]}
          />
          <Input
            value={plateKeyword}
            onChange={(e) => setPlateKeyword(e.target.value.toUpperCase())}
            placeholder={t('parking.plateNumber')}
            className="vehicle_filter-select-w130"
            allowClear
          />
          <DatePicker.RangePicker
            showTime
            value={timeRange}
            onChange={(value) => {
              if (value && value[0] && value[1]) {
                setTimeRange([value[0], value[1]])
                return
              }
              setTimeRange(null)
            }}
          />
          <Button type="primary" size="small" onClick={fetchEvents} loading={eventsLoading}>
            {t('parkingMap.refresh', 'Làm mới')}
          </Button>
        </div>
        <Spin spinning={eventsLoading}>
          <DataTable
            columns={recentColumns}
            dataSource={recentRows}
            pageSize={10}
            total={recentRows.length}
            size="small"
            scroll={{ x: 900 }}
            className="rounded"
          />
        </Spin>
      </ContentCard>

      <Modal
        title={t('parkingMap.spotPreview', 'Ảnh chỗ đỗ')}
        open={previewImageOpen}
        onCancel={() => setPreviewImageOpen(false)}
        footer={null}
        width={720}
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <img
            src={SPOT_PREVIEW_IMAGE}
            alt={t('parkingMap.spotPreview', 'Ảnh chỗ đỗ')}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #eee' }}
          />
        </div>
      </Modal>
    </>
  )
}
