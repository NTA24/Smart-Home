import { useState } from 'react'
import {
  Card,
  Typography,
  Select,
  Switch,
  Tag,
  Row,
  Col,
  Drawer,
  Descriptions,
  Badge,
  Space,
  Tooltip,
  Button,
} from 'antd'
import {
  CarOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

type SlotStatus = 'free' | 'occupied' | 'reserved' | 'faulty'

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
  faulty: { color: '#8c8c8c', bg: '#f5f5f5', label: 'faulty' },
}

const ZONES = ['A', 'B', 'C']
const FLOORS = ['B1', 'B2', 'B3']

// Generate mock slots
function generateSlots(): ParkingSlot[] {
  const slots: ParkingSlot[] = []
  const statuses: SlotStatus[] = ['free', 'occupied', 'reserved', 'faulty']
  const plates = ['51A-123.45', '30G-789.01', '29B-456.78', '51H-222.33', '30A-444.55', '29C-666.77']
  let idx = 0
  for (const zone of ZONES) {
    for (const floor of FLOORS) {
      const count = 12 + Math.floor(Math.random() * 8)
      for (let i = 1; i <= count; i++) {
        const status = statuses[Math.floor(Math.random() * 10) < 5 ? 0 : Math.floor(Math.random() * 10) < 8 ? 1 : Math.floor(Math.random() * 10) < 9 ? 2 : 3]
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

const allSlots = generateSlots()

export default function ParkingMap() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [selectedFloor, setSelectedFloor] = useState<string>('B2')
  const [vehicleFilter, setVehicleFilter] = useState<string>('all')
  const [showSensors, setShowSensors] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)

  const filteredSlots = allSlots.filter(s => {
    if (selectedFloor !== 'all' && s.floor !== selectedFloor) return false
    if (selectedZone !== 'all' && s.zone !== selectedZone) return false
    if (vehicleFilter === 'car' && s.vehicleType !== 'car') return false
    if (vehicleFilter === 'motorbike' && s.vehicleType !== 'motorbike') return false
    return true
  })

  // Group by zone
  const groupedByZone: Record<string, ParkingSlot[]> = {}
  filteredSlots.forEach(s => {
    if (!groupedByZone[s.zone]) groupedByZone[s.zone] = []
    groupedByZone[s.zone].push(s)
  })

  const stats = {
    free: filteredSlots.filter(s => s.status === 'free').length,
    occupied: filteredSlots.filter(s => s.status === 'occupied').length,
    reserved: filteredSlots.filter(s => s.status === 'reserved').length,
    faulty: filteredSlots.filter(s => s.status === 'faulty').length,
  }

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
    setDrawerOpen(true)
  }

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined />
            {t('parkingMap.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('parkingMap.allSites')}
          </Text>
        </div>
        <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <FilterOutlined style={{ color: '#8c8c8c' }} />
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Zone</Text>
            <Select value={selectedZone} onChange={setSelectedZone} style={{ width: 100, marginLeft: 8 }}
              options={[{ value: 'all', label: t('parkingMap.allZones') }, ...ZONES.map(z => ({ value: z, label: `Zone ${z}` }))]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('parkingMap.floor')}</Text>
            <Select value={selectedFloor} onChange={setSelectedFloor} style={{ width: 100, marginLeft: 8 }}
              options={[{ value: 'all', label: t('parkingMap.allFloors') }, ...FLOORS.map(f => ({ value: f, label: f }))]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>{t('parkingMap.vehicle')}</Text>
            <Select value={vehicleFilter} onChange={setVehicleFilter} style={{ width: 130, marginLeft: 8 }}
              options={[
                { value: 'all', label: t('parkingMap.allVehicles') },
                { value: 'car', label: `🚗 ${t('parking.car')}` },
                { value: 'motorbike', label: `🏍️ ${t('parking.motorcycle')}` },
              ]}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Switch size="small" checked={showSensors} onChange={setShowSensors} />
            <Text style={{ fontSize: 12 }}>{t('parkingMap.showSensors')}</Text>
          </div>
        </div>
      </Card>

      {/* Legend + Stats */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '10px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Space size={20}>
            {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: cfg.color }} />
                <Text style={{ fontSize: 12 }}>{t(`parkingMap.${cfg.label}`)}</Text>
                <Badge count={stats[key]} style={{ backgroundColor: cfg.color, fontSize: 10 }} overflowCount={999} />
              </div>
            ))}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('common.total')}: {filteredSlots.length} {t('parkingMap.slots')}
          </Text>
        </div>
      </Card>

      {/* Grid Map */}
      {Object.entries(groupedByZone).sort().map(([zone, slots]) => (
        <Card
          key={zone}
          bordered={false}
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              {selectedFloor !== 'all' ? selectedFloor : ''} – Zone {zone}
              <Tag color="blue" style={{ borderRadius: 8, marginLeft: 8 }}>{slots.length} {t('parkingMap.slots')}</Tag>
            </span>
          }
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {slots.map(slot => {
              const cfg = STATUS_CONFIG[slot.status]
              return (
                <Tooltip
                  key={slot.id}
                  title={
                    <div style={{ fontSize: 11 }}>
                      <div><strong>{slot.code}</strong> – {t(`parkingMap.${cfg.label}`)}</div>
                      {slot.plate && <div>🚗 {slot.plate}</div>}
                      {slot.entryTime && <div>⏰ {slot.entryTime}</div>}
                      {slot.reservation && <div>📋 {slot.reservation}</div>}
                      {slot.status === 'faulty' && showSensors && <div>⚠️ Sensor fault</div>}
                    </div>
                  }
                >
                  <div
                    onClick={() => handleSlotClick(slot)}
                    style={{
                      width: 56,
                      height: 40,
                      borderRadius: 6,
                      background: cfg.bg,
                      border: `2px solid ${cfg.color}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 8px ${cfg.color}40` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: 'monospace' }}>
                      {slot.code}
                    </Text>
                    {slot.status === 'occupied' && (
                      <CarOutlined style={{ fontSize: 10, color: cfg.color }} />
                    )}
                    {slot.status === 'faulty' && showSensors && (
                      <WarningOutlined style={{ position: 'absolute', top: 2, right: 2, fontSize: 9, color: '#ff4d4f' }} />
                    )}
                  </div>
                </Tooltip>
              )
            })}
          </div>
        </Card>
      ))}

      {/* Detail Drawer */}
      <Drawer
        title={
          selectedSlot ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_CONFIG[selectedSlot.status].color }} />
              {selectedSlot.id}
            </span>
          ) : ''
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
                <Tag color={STATUS_CONFIG[selectedSlot.status].color} style={{ borderRadius: 8 }}>
                  {t(`parkingMap.${STATUS_CONFIG[selectedSlot.status].label}`)}
                </Tag>
              </Descriptions.Item>
              {selectedSlot.plate && (
                <Descriptions.Item label={t('parking.plateNumber')}>
                  <Text strong style={{ fontFamily: 'monospace', color: '#1890ff', fontSize: 15 }}>
                    {selectedSlot.plate}
                  </Text>
                </Descriptions.Item>
              )}
              {selectedSlot.entryTime && (
                <Descriptions.Item label={t('parkingMap.entryTime')}>{selectedSlot.entryTime}</Descriptions.Item>
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
      </Drawer>
    </div>
  )
}
