import { useEffect, useState } from 'react'
import {
  Typography,
  Select,
  Tag,
  Descriptions,
  Badge,
  Space,
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

const ZONES = ['A', 'B', 'C']
const FLOORS = ['B1', 'B2', 'B3']

// Generate mock slots
function generateSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  const statuses: SlotStatus[] = ['free', 'occupied', 'reserved']
  const plates = ['51A-123.45', '30G-789.01', '29B-456.78', '51H-222.33', '30A-444.55', '29C-666.77']
  let idx = 0
  for (const zone of ZONES) {
    for (const floor of FLOORS) {
      const count = 12 + Math.floor(Math.random() * 8)
      for (let i = 1; i <= count; i++) {
        const status = statuses[Math.floor(Math.random() * 10) < 5 ? 0 : Math.floor(Math.random() * 10) < 8 ? 1 : 2]
        const code = `${zone}${String(i).padStart(2, '0')}`
        slots.push({
          id: `${floor}-${code}`,
          zone,
          floor,
          code,
          status,
          vehicleType: status === 'occupied' ? (Math.random() > 0.3 ? 'car' : 'motorbike') : undefined,
          plate: status === 'occupied' ? plates[idx++ % plates.length] : undefined,
          entryTime: status === 'occupied' ? `${7 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
          reservation: status === 'reserved' ? `RES-${1000 + Math.floor(Math.random() * 9000)}` : undefined,
        })
      }
    }
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
    selectedZone: string
    selectedFloor: string
    vehicleFilter: string
    plateQuery: string
  }>({
    selectedZone: 'all',
    selectedFloor: 'B2',
    vehicleFilter: 'all',
    plateQuery: '',
  })
  const [allSlots] = useState<ParkingSlot[]>(() =>
    getVehicleSlots<any>(generateSlots()).map((slot: any) => ({
      ...slot,
      status: normalizeSlotStatus(slot?.status),
    })),
  )
  const [selectedZone, setSelectedZone] = useState<string>(persistedFilters.selectedZone)
  const [selectedFloor, setSelectedFloor] = useState<string>(persistedFilters.selectedFloor)
  const [vehicleFilter, setVehicleFilter] = useState<string>(persistedFilters.vehicleFilter)
  const [plateQuery, setPlateQuery] = useState<string>(persistedFilters.plateQuery || '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)

  useEffect(() => {
    saveVehicleSlots(allSlots)
  }, [allSlots])

  useEffect(() => {
    saveVehicleMapFilters({
      selectedZone,
      selectedFloor,
      vehicleFilter,
      plateQuery,
    })
  }, [selectedZone, selectedFloor, vehicleFilter, plateQuery])

  const filteredSlots = allSlots.filter(s => {
    const plateKeyword = (plateQuery || '').trim().toLowerCase()
    if (selectedFloor !== 'all' && s.floor !== selectedFloor) return false
    if (selectedZone !== 'all' && s.zone !== selectedZone) return false
    if (vehicleFilter === 'car' && s.vehicleType !== 'car') return false
    if (vehicleFilter === 'motorbike' && s.vehicleType !== 'motorbike') return false
    if (plateKeyword && !(s.plate || '').toLowerCase().includes(plateKeyword)) return false
    return true
  })

  // Group by zone -> floor (for all/all view)
  const groupedByZoneFloor: Record<string, Record<string, ParkingSlot[]>> = {}
  filteredSlots.forEach((slot) => {
    if (!groupedByZoneFloor[slot.zone]) groupedByZoneFloor[slot.zone] = {}
    if (!groupedByZoneFloor[slot.zone][slot.floor]) groupedByZoneFloor[slot.zone][slot.floor] = []
    groupedByZoneFloor[slot.zone][slot.floor].push(slot)
  })

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
            <Text type="secondary" className="text-11">Zone</Text>
            <Select value={selectedZone} onChange={setSelectedZone} className="vehicle_filter-select-w100 vehicle_filter-select-ml"
              options={[{ value: 'all', label: t('parkingMap.allZones') }, ...ZONES.map(z => ({ value: z, label: `Zone ${z}` }))]}
            />
          </div>
          <div>
            <Text type="secondary" className="text-11">{t('parkingMap.floor')}</Text>
            <Select value={selectedFloor} onChange={setSelectedFloor} className="vehicle_filter-select-w100 vehicle_filter-select-ml"
              options={[{ value: 'all', label: t('parkingMap.allFloors') }, ...FLOORS.map(f => ({ value: f, label: f }))]}
            />
          </div>
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

      {/* Legend + Stats */}
      <ContentCard className="mb-16" bodyStyle={{ padding: '10px 20px' }}>
        <div className="flex-between flex-wrap gap-12">
          <Space size={20}>
            {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([key, cfg]) => (
              <div key={key} className="vehicle_legend-item">
                <div className="vehicle_legend-dot" style={{ background: cfg.color }} />
                <Text className="text-sm">{t(`parkingMap.${cfg.label}`)}</Text>
                <Badge count={stats[key]} className="text-xs" style={{ backgroundColor: cfg.color }} overflowCount={999} />
              </div>
            ))}
          </Space>
          <Text type="secondary" className="text-sm">
            {t('common.total')}: {filteredSlots.length} {t('parkingMap.slots')}
          </Text>
        </div>
      </ContentCard>

      {/* Grid Map */}
      {Object.entries(groupedByZoneFloor).sort().map(([zone, floors]) => {
        const zoneSlots = Object.values(floors).flat()
        const floorEntries = Object.entries(floors).sort(([a], [b]) => a.localeCompare(b))
        return (
          <ContentCard
            key={zone}
            className="mb-16"
            title={
              <>
                Zone {zone}
                <Tag color="blue" className="vehicle_tag-rounded-8 ml-4">{zoneSlots.length} {t('parkingMap.slots')}</Tag>
              </>
            }
            titleIcon={<EnvironmentOutlined />}
            titleIconColor="#1890ff"
            bodyStyle={{ padding: '16px 20px' }}
          >
            {floorEntries.map(([floor, slots]) => (
              <div key={`${zone}-${floor}`} className="mb-12">
                {(selectedZone === 'all' && selectedFloor === 'all') && (
                  <div className="mb-8">
                    <Text strong className="text-sm">{floor}</Text>
                    <Tag color="default" className="vehicle_tag-rounded-8 ml-6">{slots.length}</Tag>
                  </div>
                )}
                <div className="vehicle_slot-grid">
                  {slots.map(slot => {
                    const cfg = STATUS_CONFIG[slot.status]
                    return (
                      <div key={slot.id} className="flex flex-col items-center gap-2">
                        <div
                          onClick={() => handleSlotClick(slot)}
                          className="vehicle_slot-cell"
                          style={{
                            background: cfg.bg,
                            border: `2px solid ${cfg.color}`,
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'
                            ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 8px ${cfg.color}40`
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
                            ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                          }}
                        >
                          <Text className="text-11 font-bold font-mono" style={{ color: cfg.color }}>
                            {slot.code}
                          </Text>
                          {slot.status === 'occupied' && (
                            <CarOutlined className="text-xs" style={{ color: cfg.color }} />
                          )}
                        </div>
                        {slot.status === 'occupied' && slot.plate && (
                          <div className="text-center">
                            <Text className="text-11 font-mono block">{slot.plate}</Text>
                            {slot.entryTime && (
                              <Text type="secondary" className="text-11 block">
                                {t('parkingMap.parkedDuration', 'Đã đỗ')}: {getParkedDuration(slot.entryTime)}
                              </Text>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </ContentCard>
        )
      })}

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
