import { useEffect, useState } from 'react'
import {
  Typography,
  Select,
  Tag,
  Descriptions,
  Input,
  Button,
} from 'antd'
import {
  CarOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  FilterBar,
  DetailDrawer,
} from '@/components'
import { useBuildingStore } from '@/stores'
import {
  getVehicleMapFilters,
  getVehicleSlots,
  saveVehicleMapFilters,
  saveVehicleSlots,
} from '@/services/mockPersistence'

const { Text } = Typography

type SlotStatus = 'free' | 'occupied' | 'reserved'

interface ParkingSlot {
  id: string
  zone: string
  floor: string
  code: string
  status: SlotStatus
  vehicleType?: 'car' | 'motorbike'
  plate?: string
  entryTime?: string
  reservation?: string
}

const STATUS_CONFIG: Record<SlotStatus, { color: string; bg: string; label: string }> = {
  free: { color: '#52c41a', bg: '#f6ffed', label: 'free' },
  occupied: { color: '#f5222d', bg: '#fff1f0', label: 'occupied' },
  reserved: { color: '#faad14', bg: '#fffbe6', label: 'reserved' },
}

// Generate mock slots
function generateSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  const statuses: SlotStatus[] = ['free', 'occupied', 'reserved']
  const plates = ['51A-123.45', '30G-789.01', '29B-456.78', '51H-222.33', '30A-444.55', '29C-666.77']
  let idx = 0
  const count = 100
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * 10) < 5 ? 0 : Math.floor(Math.random() * 10) < 8 ? 1 : 2]
    const code = `${i <= 50 ? 'A' : 'B'}${String(i <= 50 ? i : i - 50).padStart(2, '0')}`
    slots.push({
      id: `B1-${code}`,
      zone: 'A',
      floor: 'B1',
      code,
      status,
      vehicleType: status === 'occupied' ? (Math.random() > 0.3 ? 'car' : 'motorbike') : undefined,
      plate: status === 'occupied' ? plates[idx++ % plates.length] : undefined,
      entryTime: status === 'occupied' ? `${7 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
      reservation: status === 'reserved' ? `RES-${1000 + Math.floor(Math.random() * 9000)}` : undefined,
    })
  }
  return slots
}

function normalizeSlotStatus(status: unknown): SlotStatus {
  if (status === 'free' || status === 'occupied' || status === 'reserved') return status
  return 'reserved'
}

export default function ParkingMap() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const persistedFilters = getVehicleMapFilters<{
    vehicleFilter: string
    plateQuery: string
  }>({
    vehicleFilter: 'all',
    plateQuery: '',
  })
  const [allSlots] = useState<ParkingSlot[]>(() =>
    getVehicleSlots<any>(generateSlots()).map((slot: any) => ({
      ...slot,
      status: normalizeSlotStatus(slot?.status),
    })),
  )
  const [vehicleFilter, setVehicleFilter] = useState<string>(persistedFilters.vehicleFilter)
  const [plateQuery, setPlateQuery] = useState<string>(persistedFilters.plateQuery || '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)

  useEffect(() => {
    saveVehicleSlots(allSlots)
  }, [allSlots])

  useEffect(() => {
    saveVehicleMapFilters({
      vehicleFilter,
      plateQuery,
    })
  }, [vehicleFilter, plateQuery])

  const filteredSlots = allSlots.filter(s => {
    const plateKeyword = (plateQuery || '').trim().toLowerCase()
    if (vehicleFilter === 'car' && s.vehicleType !== 'car') return false
    if (vehicleFilter === 'motorbike' && s.vehicleType !== 'motorbike') return false
    if (plateKeyword && !(s.plate || '').toLowerCase().includes(plateKeyword)) return false
    return true
  })

  const mapSlots = filteredSlots.slice(0, 100)
  const topRow = mapSlots.slice(0, 16)
  const bottomRow = mapSlots.slice(16, 32)
  const leftCol = mapSlots.slice(32, 44)
  const rightCol = mapSlots.slice(44, 56)
  const centerLeft = mapSlots.slice(56, 68)
  const centerRight = mapSlots.slice(68, 80)
  const innerTop = mapSlots.slice(80, 90)
  const innerBottom = mapSlots.slice(90, 100)

  const stats = {
    free: filteredSlots.filter(s => s.status === 'free').length,
    occupied: filteredSlots.filter(s => s.status === 'occupied').length,
    reserved: filteredSlots.filter(s => s.status === 'reserved').length,
  }

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
    setDrawerOpen(true)
  }

  const getParkedDuration = (entryTime?: string) => {
    if (!entryTime) return null
    const [hourStr, minuteStr] = entryTime.split(':')
    const hour = Number(hourStr)
    const minute = Number(minuteStr)
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null

    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const entryMinutes = hour * 60 + minute
    let diff = nowMinutes - entryMinutes
    if (diff < 0) diff += 24 * 60

    const h = Math.floor(diff / 60)
    const m = diff % 60
    return `${h}h ${String(m).padStart(2, '0')}m`
  }

  const renderSlot = (slot: ParkingSlot, vertical = false) => {
    const cfg = STATUS_CONFIG[slot.status]
    const w = vertical ? 34 : 48
    const h = vertical ? 48 : 34
    return (
      <button
        key={slot.id}
        type="button"
        onClick={() => handleSlotClick(slot)}
        style={{
          width: w,
          height: h,
          background: cfg.bg,
          border: `2px solid ${cfg.color}`,
          borderRadius: 3,
          cursor: 'pointer',
          transition: 'all 120ms ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          position: 'relative',
          outline: selectedSlot?.id === slot.id ? `2px solid #1677ff` : 'none',
          outlineOffset: 1,
        }}
        title={`${slot.code} - ${t(`parkingMap.${cfg.label}`)}`}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 8px ${cfg.color}88`
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <span style={{ color: cfg.color, lineHeight: 1, fontSize: 9, fontWeight: 700, fontFamily: 'monospace' }}>
          {slot.code}
        </span>
        {slot.status === 'occupied' && (
          <CarOutlined style={{ color: cfg.color, fontSize: 9 }} />
        )}
      </button>
    )
  }

  const renderHRow = (slots: ParkingSlot[]) => (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
      {slots.map((s) => renderSlot(s, false))}
    </div>
  )

  const renderVCol = (slots: ParkingSlot[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {slots.map((s) => renderSlot(s, true))}
    </div>
  )

  const renderCenterBlock = (slots: ParkingSlot[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
      {slots.map((s) => renderSlot(s, false))}
    </div>
  )

  const roadDash: React.CSSProperties = {
    background: 'repeating-linear-gradient(90deg, #fbbf24 0px, #fbbf24 14px, transparent 14px, transparent 24px)',
    height: 2,
    width: '100%',
    opacity: 0.6,
  }

  const roadDashV: React.CSSProperties = {
    background: 'repeating-linear-gradient(180deg, #fbbf24 0px, #fbbf24 14px, transparent 14px, transparent 24px)',
    width: 2,
    height: '100%',
    opacity: 0.6,
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('parkingMap.title')}
        icon={<EnvironmentOutlined />}
        subtitle={selectedBuilding?.name || t('parkingMap.allSites')}
        actions={<Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>}
      />

      {/* Filters */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
        <FilterBar className="gap-16">
          <FilterOutlined className="text-muted" />
          <div>
            <Text type="secondary" className="text-11">{t('parkingMap.vehicle')}</Text>
            <Select value={vehicleFilter} onChange={setVehicleFilter} className="vehicle_filter-select-w130 vehicle_filter-select-ml"
              options={[
                { value: 'all', label: t('parkingMap.allVehicles') },
                { value: 'car', label: `🚗 ${t('parking.car')}` },
                { value: 'motorbike', label: `🏍️ ${t('parking.motorcycle')}` },
              ]}
            />
          </div>
          <div>
            <Text type="secondary" className="text-11">{t('parking.plateNumber')}</Text>
            <Input
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
              placeholder="51A-123.45"
              className="vehicle_filter-select-w130 vehicle_filter-select-ml"
              allowClear
            />
          </div>
        </FilterBar>
      </ContentCard>


      {/* Parking Map */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }} className="mb-16">
        {/* Map floor */}
        <div
          style={{
            flex: 1,
            background: '#3a3f47',
            borderRadius: 10,
            padding: 16,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          {mapSlots.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>{t('common.noData')}</Text>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Top row */}
              {renderHRow(topRow)}

              {/* Road separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={roadDash} />
              </div>

              {/* Middle section: left col | center blocks | right col */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                {/* Left column (vertical) */}
                {renderVCol(leftCol)}

                {/* Road + center blocks */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Center area: two parking blocks separated by facility */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'stretch', flex: 1 }}>
                    {/* Left center block */}
                    {renderCenterBlock(centerLeft)}

                    {/* Vertical road dash */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px' }}>
                      <div style={roadDashV} />
                    </div>

                    {/* Building / facility area */}
                    <div
                      style={{
                        flex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        minHeight: 140,
                        minWidth: 180,
                      }}
                    >
                      <div style={{
                        flex: 1,
                        border: '1.5px solid #64748b',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: 12,
                      }}>
                        <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
                          TÒA NHÀ CHÍNH
                        </span>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 6,
                            background: '#374151', border: '1px solid #6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 2,
                          }}>
                            <span style={{ fontSize: 16 }}>🛗</span>
                            <span style={{ color: '#d1d5db', fontSize: 8, fontWeight: 600 }}>Thang máy</span>
                          </div>
                          <div style={{
                            width: 44, height: 44, borderRadius: 6,
                            background: '#374151', border: '1px solid #6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 2,
                          }}>
                            <span style={{ fontSize: 16 }}>🚪</span>
                            <span style={{ color: '#d1d5db', fontSize: 8, fontWeight: 600 }}>Sảnh chính</span>
                          </div>
                          <div style={{
                            width: 44, height: 44, borderRadius: 6,
                            background: '#374151', border: '1px solid #6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 2,
                          }}>
                            <span style={{ fontSize: 16 }}>🪜</span>
                            <span style={{ color: '#d1d5db', fontSize: 8, fontWeight: 600 }}>Cầu thang</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vertical road dash */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px' }}>
                      <div style={roadDashV} />
                    </div>

                    {/* Right center block */}
                    {renderCenterBlock(centerRight)}
                  </div>

                  {/* Inner parking rows */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <div style={roadDash} />
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: 2 }}>
                    <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
                      ← → {t('parkingMap.trafficFlow', 'LÀN GIAO THÔNG NỘI BỘ')}
                    </span>
                  </div>
                  {renderHRow(innerTop)}
                  <div style={{ height: 4 }} />
                  {renderHRow(innerBottom)}
                </div>

                {/* Right column (vertical) */}
                {renderVCol(rightCol)}
              </div>

              {/* Road separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={roadDash} />
              </div>

              {/* Bottom row */}
              {renderHRow(bottomRow)}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div
          style={{
            width: 230,
            borderRadius: 10,
            background: '#fff',
            border: '1px solid #e5e7eb',
            padding: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Text strong className="block mb-10">
            {t('parkingMap.infoPanel', 'Thông tin đỗ xe')}
          </Text>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([key, cfg]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}33`,
                }}
              >
                <div className="flex items-center gap-6">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                  <Text className="text-sm">{t(`parkingMap.${cfg.label}`)}</Text>
                </div>
                <Text strong style={{ color: cfg.color, fontSize: 16 }}>{stats[key]}</Text>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 10,
              borderRadius: 8,
              background: '#fafafa',
              border: '1px solid #f0f0f0',
            }}
          >
            <Text type="secondary" className="text-11 block mb-6">
              {t('parkingMap.selectedSlot', 'Ô đang chọn')}
            </Text>
            {selectedSlot ? (
              <>
                <div className="flex items-center gap-8">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: STATUS_CONFIG[selectedSlot.status].color, boxShadow: `0 0 6px ${STATUS_CONFIG[selectedSlot.status].color}80` }} />
                  <Text strong>{selectedSlot.id}</Text>
                  <Tag color={STATUS_CONFIG[selectedSlot.status].color} className="vehicle_tag-rounded-8" style={{ marginLeft: 'auto' }}>
                    {t(`parkingMap.${STATUS_CONFIG[selectedSlot.status].label}`)}
                  </Tag>
                </div>
                {selectedSlot.plate && (
                  <Text className="block mt-8 font-mono text-primary">{selectedSlot.plate}</Text>
                )}
                {selectedSlot.entryTime && (
                  <Text type="secondary" className="block text-11 mt-4">
                    {t('parkingMap.parkedDuration', 'Đã đỗ')}: {getParkedDuration(selectedSlot.entryTime)}
                  </Text>
                )}
              </>
            ) : (
              <Text type="secondary" className="text-12">{t('parkingMap.clickSlotHint', 'Bấm vào ô để xem chi tiết')}</Text>
            )}
          </div>

          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <Text type="secondary" className="text-11">
              {t('common.total')}: <Text strong>{filteredSlots.length}</Text> {t('parkingMap.slots')}
            </Text>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer
        title={
          selectedSlot ? (
            <span className="vehicle_drawer-title">
              <div className="vehicle_slot-dot" style={{ background: STATUS_CONFIG[selectedSlot.status].color }} />
              {selectedSlot.id}
            </span>
          ) : undefined
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={380}
      >
        {selectedSlot && (
          <div>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('parkingMap.slotCode')}>{selectedSlot.code}</Descriptions.Item>
              <Descriptions.Item label="Zone">{selectedSlot.zone}</Descriptions.Item>
              <Descriptions.Item label={t('parkingMap.floor')}>{selectedSlot.floor}</Descriptions.Item>
              <Descriptions.Item label={t('common.status')}>
                <Tag color={STATUS_CONFIG[selectedSlot.status].color} className="vehicle_tag-rounded-8">
                  {t(`parkingMap.${STATUS_CONFIG[selectedSlot.status].label}`)}
                </Tag>
              </Descriptions.Item>
              {selectedSlot.plate && (
                <Descriptions.Item label={t('parking.plateNumber')}>
                  <Text strong className="font-mono text-primary text-lg">
                    {selectedSlot.plate}
                  </Text>
                </Descriptions.Item>
              )}
              {selectedSlot.entryTime && (
                <Descriptions.Item label={t('parkingMap.entryTime')}>{selectedSlot.entryTime}</Descriptions.Item>
              )}
              {selectedSlot.entryTime && (
                <Descriptions.Item label={t('parkingMap.parkedDuration', 'Đã đỗ')}>
                  {getParkedDuration(selectedSlot.entryTime)}
                </Descriptions.Item>
              )}
              {selectedSlot.vehicleType && (
                <Descriptions.Item label={t('parkingMap.vehicle')}>
                  {selectedSlot.vehicleType === 'car' ? `🚗 ${t('parking.car')}` : `🏍️ ${t('parking.motorcycle')}`}
                </Descriptions.Item>
              )}
              {selectedSlot.reservation && (
                <Descriptions.Item label={t('parkingMap.reservation')}>{selectedSlot.reservation}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </DetailDrawer>
    </PageContainer>
  )
}
