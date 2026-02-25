import { useEffect, useState } from 'react'
import {
  Typography,
  Select,
  Tag,
  Descriptions,
  Input,
  Button,
  Modal,
} from 'antd'
import {
  CarOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  DetailDrawer,
} from '@/components'
import { useBuildingStore } from '@/stores'
import {
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
  const [allSlots] = useState<ParkingSlot[]>(() =>
    getVehicleSlots<any>(generateSlots()).map((slot: any) => ({
      ...slot,
      status: normalizeSlotStatus(slot?.status),
    })),
  )
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')
  const [plateInput, setPlateInput] = useState<string>('')
  const [plateSearchApplied, setPlateSearchApplied] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [spotImageModalOpen, setSpotImageModalOpen] = useState(false)

  useEffect(() => {
    saveVehicleSlots(allSlots)
  }, [allSlots])

  useEffect(() => {
    saveVehicleMapFilters({
      vehicleFilter,
      plateQuery: plateSearchApplied,
    })
  }, [vehicleFilter, plateSearchApplied])


  const applyPlateSearch = () => {
    const q = plateInput.trim()
    setPlateSearchApplied(q)
    saveVehicleMapFilters({
      vehicleFilter,
      plateQuery: q,
    })
  }

  const filteredSlots = allSlots.filter(s => {
    const plateKeyword = (plateSearchApplied || '').trim().toLowerCase()
    if (vehicleFilter === 'car' && s.vehicleType !== 'car') return false
    if (vehicleFilter === 'motorbike' && s.vehicleType !== 'motorbike') return false
    if (plateKeyword && !(s.plate || '').toLowerCase().replace(/\s/g, '').includes(plateKeyword.replace(/\s/g, ''))) return false
    return true
  })

  const searchResultSlots = plateSearchApplied.trim()
    ? filteredSlots.filter(s => (s.plate || '').toLowerCase().replace(/\s/g, '').includes(plateSearchApplied.trim().toLowerCase().replace(/\s/g, '')))
    : []

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
    if (plateSearchApplied.trim() && searchResultSlots.some(s => s.id === slot.id)) {
      setSpotImageModalOpen(true)
    }
  }

  const closeDetailAndModal = () => {
    setDrawerOpen(false)
    setSpotImageModalOpen(false)
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
        className="vehicle_slot-cell"
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

      {/* Filters - một hàng thẳng */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <FilterOutlined className="text-muted" style={{ fontSize: 16 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" className="text-11" style={{ width: 72, flexShrink: 0 }}>{t('parkingMap.vehicle')}</Text>
            <Select
              value={vehicleFilter}
              onChange={setVehicleFilter}
              size="small"
              style={{ width: 140 }}
              options={[
                { value: 'all', label: t('parkingMap.allVehicles') },
                { value: 'car', label: `🚗 ${t('parking.car')}` },
                { value: 'motorbike', label: `🏍️ ${t('parking.motorcycle')}` },
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" className="text-11" style={{ width: 72, flexShrink: 0 }}>{t('parking.plateNumber')}</Text>
            <Input
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
              onPressEnter={applyPlateSearch}
              placeholder="51A-123.45"
              size="small"
              style={{ width: 140 }}
              allowClear
              onClear={() => { setPlateInput(''); setPlateSearchApplied('') }}
            />
            <Button type="primary" size="small" icon={<SearchOutlined />} onClick={applyPlateSearch}>
              {t('parkingMap.search', 'Tìm kiếm')}
            </Button>
          </div>
        </div>
      </ContentCard>

      {/* Kết quả tìm kiếm biển số */}
      {plateSearchApplied.trim() && searchResultSlots.length > 0 && (
        <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
          <Text type="secondary" className="text-11 block mb-8">
            {t('parkingMap.searchResults', 'Kết quả tìm kiếm')} ({searchResultSlots.length})
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {searchResultSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleSlotClick(slot)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `2px solid ${STATUS_CONFIG[slot.status].color}`,
                  background: STATUS_CONFIG[slot.status].bg,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 2px 12px ${STATUS_CONFIG[slot.status].color}40`
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: STATUS_CONFIG[slot.status].color }}>
                  {slot.code}
                </span>
                {slot.plate && (
                  <span style={{ fontFamily: 'monospace', color: '#333' }}>{slot.plate}</span>
                )}
                <Tag color={STATUS_CONFIG[slot.status].color} className="vehicle_tag-rounded-8">
                  {t(`parkingMap.${STATUS_CONFIG[slot.status].label}`)}
                </Tag>
              </button>
            ))}
          </div>
          <Text type="secondary" className="text-11 block mt-8">
            {t('parkingMap.clickToViewImage', 'Bấm vào ô để xem ảnh chỗ đỗ')}
          </Text>
        </ContentCard>
      )}

      {plateSearchApplied.trim() && searchResultSlots.length === 0 && (
        <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
          <Text type="secondary">{t('parkingMap.noPlateResult', 'Không tìm thấy xe với biển số này.')}</Text>
        </ContentCard>
      )}

      {/* Thông tin đỗ xe - trên cùng */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '12px 20px' }}>
        <Text strong className="block mb-10">
          {t('parkingMap.infoPanel', 'Thông tin đỗ xe')}
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([key, cfg]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}33`,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                <Text className="text-sm">{t(`parkingMap.${cfg.label}`)}</Text>
                <Text strong style={{ color: cfg.color, fontSize: 16 }}>{stats[key]}</Text>
              </div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Text type="secondary" className="text-sm">
              {t('common.total')}: <Text strong>{filteredSlots.length}</Text> {t('parkingMap.slots')}
            </Text>
          </div>
        </div>
      </ContentCard>

      {/* Parking Map - full width */}
      <div className="mb-16">
        <div
          style={{
            width: '100%',
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
        onClose={closeDetailAndModal}
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

      {/* Modal ảnh chỗ đỗ (khi bấm vào ô kết quả tìm kiếm) */}
      <Modal
        title={selectedSlot ? `${selectedSlot.id} — ${selectedSlot.plate || ''}` : t('parkingMap.spotPreview', 'Ảnh chỗ đỗ')}
        open={spotImageModalOpen}
        onCancel={closeDetailAndModal}
        footer={null}
        width={720}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <img
            src="/parking-spot-preview.png"
            alt={t('parkingMap.spotPreview', 'Ảnh chỗ đỗ')}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #eee' }}
          />
        </div>
      </Modal>
    </PageContainer>
  )
}
