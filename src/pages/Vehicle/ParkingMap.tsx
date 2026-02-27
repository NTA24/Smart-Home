import { useEffect, useMemo, useRef, useState } from 'react'
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

function generateUniquePlates(count: number): string[] {
  const prefixes = ['29A', '29B', '29C', '29D', '29G', '29H', '30A', '30B', '30D', '30E', '30F', '30G', '30H', '30K', '30L', '51A', '51B', '51C', '51D', '51F', '51G', '51H']
  const used = new Set<string>()
  const plates: string[] = []
  while (plates.length < count) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const num1 = String(100 + Math.floor(Math.random() * 900))
    const num2 = String(10 + Math.floor(Math.random() * 90))
    const plate = `${prefix}-${num1}.${num2}`
    if (!used.has(plate)) {
      used.add(plate)
      plates.push(plate)
    }
  }
  return plates
}

function generateSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  const statuses: SlotStatus[] = ['free', 'occupied', 'reserved']
  const count = 94
  const tempStatuses: SlotStatus[] = []
  for (let i = 0; i < count; i++) {
    tempStatuses.push(statuses[Math.floor(Math.random() * 10) < 5 ? 0 : Math.floor(Math.random() * 10) < 8 ? 1 : 2])
  }
  const occupiedCount = tempStatuses.filter(s => s === 'occupied').length
  const uniquePlates = generateUniquePlates(occupiedCount)
  let plateIdx = 0

  for (let i = 1; i <= count; i++) {
    const status = tempStatuses[i - 1]
    const code = `${i <= 50 ? 'A' : 'B'}${String(i <= 50 ? i : i - 50).padStart(2, '0')}`
    slots.push({
      id: `B1-${code}`,
      zone: 'A',
      floor: 'B1',
      code,
      status,
      vehicleType: status === 'occupied' ? (Math.random() > 0.3 ? 'car' : 'motorbike') : undefined,
      plate: status === 'occupied' ? uniquePlates[plateIdx++] : undefined,
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
    getVehicleSlots<any>(generateSlots()).map((slot: any) => {
      const status = normalizeSlotStatus(slot?.status)
      const vehicleType =
        status === 'occupied'
          ? (slot?.vehicleType === 'car' || slot?.vehicleType === 'motorbike'
            ? slot.vehicleType
            : (Math.random() > 0.5 ? 'car' : 'motorbike'))
          : undefined
      return { ...slot, status, vehicleType }
    }),
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
    if (vehicleFilter === 'car' && s.vehicleType !== 'car') return false
    if (vehicleFilter === 'motorbike' && s.vehicleType !== 'motorbike') return false
    return true
  })

  const searchResultSlots = plateSearchApplied.trim()
    ? allSlots.filter(s => (s.plate || '').toLowerCase().replace(/\s/g, '').includes(plateSearchApplied.trim().toLowerCase().replace(/\s/g, '')))
    : []

  const highlightedIds = useMemo(() => {
    if (searchResultSlots.length > 0) return new Set(searchResultSlots.map(s => s.id))
    if (vehicleFilter !== 'all' && filteredSlots.length > 0) return new Set(filteredSlots.map(s => s.id))
    return new Set<string>()
  }, [searchResultSlots, vehicleFilter, filteredSlots])

  const mapSlots = allSlots.slice(0, 94)
  let _si = 0
  const take = (n: number) => { const s = mapSlots.slice(_si, _si + n); _si += n; return s }
  const p1  = take(22)
  const p2  = take(6), p3  = take(6)
  const p4  = take(6), p5  = take(6)
  const p6  = take(6), p7  = take(6)
  const p8  = take(6), p9  = take(6)
  const p10 = take(6), p11 = take(6)
  const p12 = take(6), p13 = take(6)

  const stats = {
    free: allSlots.filter(s => s.status === 'free').length,
    occupied: allSlots.filter(s => s.status === 'occupied').length,
    reserved: allSlots.filter(s => s.status === 'reserved').length,
  }

  type BuildingKey = 'A' | 'B' | 'C'
  const [selectedBuildingKey, setSelectedBuildingKey] = useState<BuildingKey | null>(null)
  const buildingARef = useRef<HTMLDivElement>(null)
  const buildingBRef = useRef<HTMLDivElement>(null)
  const buildingCRef = useRef<HTMLDivElement>(null)
  const buildingRefs = useMemo(
    () => ({ A: buildingARef, B: buildingBRef, C: buildingCRef }) as const,
    [],
  )

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const buildingRef = useRef<HTMLDivElement>(null)

  interface PathRoute { id: string; pts: [number, number][] }
  const [pathRoutes, setPathRoutes] = useState<PathRoute[]>([])

  const pathTargetIds = useMemo(() => {
    if (plateSearchApplied.trim() && searchResultSlots.length > 0) {
      const target = selectedSlot && searchResultSlots.some(s => s.id === selectedSlot.id)
        ? selectedSlot.id
        : searchResultSlots[0].id
      return new Set([target])
    }
    if (selectedBuildingKey && selectedSlot) return new Set([selectedSlot.id])
    // Khi filter theo loại xe (có xe): vẽ đường đi tới các ô được highlight, tối đa 10 ô
    if (highlightedIds.size > 0) return new Set([...highlightedIds].slice(0, 10))
    return new Set<string>()
  }, [plateSearchApplied, searchResultSlots, selectedBuildingKey, selectedSlot, highlightedIds])

  const highlightedIdsRef = useRef(highlightedIds)
  highlightedIdsRef.current = highlightedIds
  const pathTargetIdsRef = useRef(pathTargetIds)
  pathTargetIdsRef.current = pathTargetIds

  useEffect(() => {
    const run = () => {
      const container = mapContainerRef.current
      const bldRow = buildingRef.current
      const ids = pathTargetIdsRef.current
      if (!container || ids.size === 0) { setPathRoutes([]); return }

      const c = container.getBoundingClientRect()
      const rel = (el: Element) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top, t: r.top - c.top, b: r.bottom - c.top, l: r.left - c.left, r: r.right - c.left }
      }

      const startEl = selectedBuildingKey && buildingRefs[selectedBuildingKey].current
        ? buildingRefs[selectedBuildingKey].current
        : bldRow
      if (!startEl) { setPathRoutes([]); return }
      const bld = rel(startEl)
      // Đường đi chỉ chạy theo vạch vàng ngang: 4 làn .parkmap_lane-h (roadH0–roadH3) + làn trong block .parkmap_block-lane
      const lanes = Array.from(container.querySelectorAll('.parkmap_lane-h'))
      if (lanes.length < 4) { setPathRoutes([]); return }

      const hYs = lanes.map(el => rel(el).y).sort((a, b) => a - b)
      const [roadH0, roadH1, roadH2, roadH3] = hYs

      const gapXs: number[] = []
      container.querySelectorAll('.parkmap_3col').forEach(row => {
        const children = Array.from(row.children) as HTMLElement[]
        for (let i = 0; i < children.length - 1; i++) {
          const rA = children[i].getBoundingClientRect()
          const rB = children[i + 1].getBoundingClientRect()
          gapXs.push((rA.right + rB.left) / 2 - c.left)
        }
      })
      const uniqueGaps = [...new Set(gapXs.map(x => Math.round(x)))].sort((a, b) => a - b)
      const gapL = uniqueGaps[0] ?? bld.x - 80
      const gapR = uniqueGaps[uniqueGaps.length - 1] ?? bld.x + 80
      // Chọn gap gần tòa: ô bên phải tòa (vd B36) → gapR để đi gần; ô bên trái tòa → gapL
      const pickGap = (sx: number) => (sx > bld.x ? gapR : gapL)

      const getBlockLaneY = (slotEl: Element): number | null => {
        const block = slotEl.closest('.parkmap_block')
        if (!block) return null
        const lane = block.querySelector('.parkmap_block-lane')
        if (!lane) return null
        return rel(lane).y
      }

      const routes: PathRoute[] = []
      ids.forEach((slotId) => {
        const el = container.querySelector(`[data-slot-id="${slotId}"]`)
        if (!el) return
        const s = rel(el)
        const pts: [number, number][] = [[bld.x, bld.y]]
        const laneY = getBlockLaneY(el)
        const gapX = pickGap(s.x)
        // Đoạn ngang chỉ trên vạch vàng: roadH0|roadH1|roadH2|roadH3 hoặc lane trong block; đoạn dọc chỉ tại bld.x hoặc gapX.
        if (s.y < roadH0) {
          pts.push([bld.x, roadH1], [bld.x, roadH0], [s.x, roadH0], [s.x, s.y])
        } else if (s.y < roadH1) {
          if (laneY != null) {
            pts.push([bld.x, roadH1], [gapX, roadH1], [gapX, laneY], [s.x, laneY], [s.x, s.y])
          } else {
            pts.push([bld.x, roadH1], [s.x, roadH1], [s.x, s.y])
          }
        } else if (s.y > roadH3) {
          if (laneY != null) {
            pts.push([bld.x, roadH2], [gapX, roadH2], [gapX, laneY], [s.x, laneY], [s.x, s.y])
          } else {
            pts.push([bld.x, roadH2], [s.x, roadH2], [s.x, s.y])
          }
        } else if (s.y > roadH2) {
          if (laneY != null) {
            pts.push([bld.x, roadH2], [gapX, roadH2], [gapX, laneY], [s.x, laneY], [s.x, s.y])
          } else {
            pts.push([bld.x, roadH2], [s.x, roadH2], [s.x, s.y])
          }
        } else {
          // Ô nằm giữa (band building): vẫn đi theo vạch vàng — road → gap → lane → ô
          const roadY = s.y < bld.y ? roadH1 : roadH2
          if (laneY != null) {
            pts.push([bld.x, roadY], [gapX, roadY], [gapX, laneY], [s.x, laneY], [s.x, s.y])
          } else {
            pts.push([bld.x, roadY], [s.x, roadY], [s.x, s.y])
          }
        }
        routes.push({ id: slotId, pts })
      })
      setPathRoutes(routes)
    }
    const timer = setTimeout(run, 250)
    return () => clearTimeout(timer)
  }, [pathTargetIds, selectedBuildingKey])

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
    const isHighlighted = highlightedIds.has(slot.id)
    return (
      <button
        key={slot.id}
        type="button"
        data-slot-id={slot.id}
        className={`vehicle_slot-cell${isHighlighted ? ' vehicle_slot-led' : ''}`}
        onClick={() => handleSlotClick(slot)}
        style={{
          width: w,
          height: h,
          background: cfg.bg,
          border: isHighlighted ? '2px solid transparent' : `2px solid ${cfg.color}`,
          borderRadius: 3,
          cursor: 'pointer',
          transition: isHighlighted ? 'background 120ms ease' : 'all 120ms ease',
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
          if (!isHighlighted) {
            e.currentTarget.style.boxShadow = `0 0 8px ${cfg.color}88`
            e.currentTarget.style.transform = 'scale(1.08)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isHighlighted) {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'scale(1)'
          }
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

  const renderRow = (slots: ParkingSlot[]) => (
    <div className="parkmap_slot-row">
      {slots.map((s) => renderSlot(s, false))}
    </div>
  )

  const ParkBlock = ({ upper, lower, label }: { upper: ParkingSlot[]; lower: ParkingSlot[]; label: string }) => (
    <div className="parkmap_block">
      <div className="parkmap_block-label">{label}</div>
      {renderRow(upper)}
      <div className="parkmap_block-lane">
        <div className="parkmap_block-lane-dash" />
      </div>
      {renderRow(lower)}
    </div>
  )

  const RoadH = () => (
    <div className="parkmap_lane-h" data-road="h">
      <div className="parkmap_lane-dash" />
    </div>
  )

  const RoadV = () => (
    <div className="parkmap_lane-v" data-road="v" aria-hidden>
      <div className="parkmap_lane-v-dash" />
    </div>
  )

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
              {t('common.total')}: <Text strong>{allSlots.length}</Text> {t('parkingMap.slots')}
            </Text>
          </div>
        </div>
      </ContentCard>

      {/* Parking Map */}
      <div className="mb-16">
        <div className="parkmap_container" ref={mapContainerRef} style={{ position: 'relative' }}>
          {pathRoutes.length > 0 && (
            <svg className="parkmap_svg-overlay">
              <defs>
                <marker id="parkmap-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#1677ff" />
                </marker>
              </defs>
              {pathRoutes.map((route) => {
                const d = route.pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
                const last = route.pts[route.pts.length - 1]
                const first = route.pts[0]
                return (
                  <g key={route.id}>
                    <polyline
                      points={route.pts.map(p => p.join(',')).join(' ')}
                      className="parkmap_path-glow"
                    />
                    <path d={d} className="parkmap_path-line" markerEnd="url(#parkmap-arrow)" />
                    <circle cx={first[0]} cy={first[1]} r="5" fill="#1677ff" className="parkmap_path-dot" />
                    <circle cx={last[0]} cy={last[1]} r="4" fill="#ff4d4f" stroke="#fff" strokeWidth="1.5" />
                  </g>
                )
              })}
            </svg>
          )}
          {mapSlots.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>{t('common.noData')}</Text>
          ) : (
            <div className="parkmap_layout">
              {/* ── P1: Top strip ── */}
              <div className="parkmap_topstrip">
                <div className="parkmap_block-label">P1</div>
                {renderRow(p1)}
              </div>

              <RoadH />

              {/* ── Upper parking: 3 blocks + đường vàng giữa các P ── */}
              <div className="parkmap_3col parkmap_3col--parking parkmap_3col--with-vlanes" data-road="top">
                <ParkBlock upper={p2} lower={p3} label="P2" />
                <RoadV />
                <ParkBlock upper={p4} lower={p5} label="P3" />
                <RoadV />
                <ParkBlock upper={p6} lower={p7} label="P4" />
              </div>

              <RoadH />

              {/* ── Buildings: A, B, C (cùng grid 5 cột như hàng P để đường vàng thẳng hàng) ── */}
              <div className="parkmap_3col parkmap_3col--buildings parkmap_3col--with-vlanes" ref={buildingRef} data-road="mid">
                <div
                  ref={buildingARef}
                  role="button"
                  tabIndex={0}
                  className={`parkmap_bldg ${selectedBuildingKey === 'A' ? 'parkmap_bldg--selected' : ''}`}
                  onClick={() => setSelectedBuildingKey(k => (k === 'A' ? null : 'A'))}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBuildingKey(k => (k === 'A' ? null : 'A')); } }}
                  aria-pressed={selectedBuildingKey === 'A'}
                  aria-label="Tòa A"
                >
                  <span className="parkmap_bldg-name">A</span>
                  <span className="parkmap_bldg-sub">TÒA NHÀ A</span>
                </div>
                <RoadV />
                <div
                  ref={buildingBRef}
                  role="button"
                  tabIndex={0}
                  className={`parkmap_bldg ${(selectedBuildingKey === null || selectedBuildingKey === 'B') ? 'parkmap_bldg--main' : ''} ${selectedBuildingKey === 'B' ? 'parkmap_bldg--selected' : ''}`}
                  onClick={() => setSelectedBuildingKey(k => (k === 'B' ? null : 'B'))}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBuildingKey(k => (k === 'B' ? null : 'B')); } }}
                  aria-pressed={selectedBuildingKey === 'B'}
                  aria-label="Tòa B"
                >
                  <span className="parkmap_bldg-name">B</span>
                  <span className="parkmap_bldg-sub">TÒA NHÀ CHÍNH</span>
                </div>
                <RoadV />
                <div
                  ref={buildingCRef}
                  role="button"
                  tabIndex={0}
                  className={`parkmap_bldg ${selectedBuildingKey === 'C' ? 'parkmap_bldg--selected' : ''}`}
                  onClick={() => setSelectedBuildingKey(k => (k === 'C' ? null : 'C'))}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedBuildingKey(k => (k === 'C' ? null : 'C')); } }}
                  aria-pressed={selectedBuildingKey === 'C'}
                  aria-label="Tòa C"
                >
                  <span className="parkmap_bldg-name">C</span>
                  <span className="parkmap_bldg-sub">TÒA NHÀ C</span>
                </div>
              </div>

              <RoadH />

              {/* ── Lower parking: 3 blocks + đường vàng giữa các P ── */}
              <div className="parkmap_3col parkmap_3col--parking parkmap_3col--with-vlanes" data-road="bottom">
                <ParkBlock upper={p8} lower={p9} label="P5" />
                <RoadV />
                <ParkBlock upper={p10} lower={p11} label="P6" />
                <RoadV />
                <ParkBlock upper={p12} lower={p13} label="P7" />
              </div>

              <RoadH />

              {/* ── Entrance / Exit ── */}
              <div className="parkmap_entrance-row">
                <div className="parkmap_entrance">
                  <div className="parkmap_entrance-arrow">↑</div>
                  <span>{t('parkingMap.entrance', 'LỐI VÀO')}</span>
                </div>
                <div className="parkmap_entrance">
                  <div className="parkmap_entrance-arrow">↓</div>
                  <span>{t('parkingMap.exit', 'LỐI RA')}</span>
                </div>
              </div>
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
