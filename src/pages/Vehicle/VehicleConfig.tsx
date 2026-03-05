import { useCallback, useEffect, useState } from 'react'
import { Button, Form, InputNumber, Select, Space, Switch, Typography, message, Spin } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ContentCard, PageContainer, PageHeader } from '@/components'
import { useHomeNavigationStore } from '@/stores'
import { getVehicleManagementConfig, getVehiclePricingConfig, saveVehicleManagementConfig, saveVehiclePricingConfig } from '@/services/mockPersistence'
import { parkingConfigApi, parkingPricingApi, type ParkingConfigItem, type ParkingPricingItem } from '@/services'

const { Text } = Typography

interface VehicleConfigState {
  autoOpenBarrierAfterPaid: boolean
  freeExitMinutes: number
  maxPlateRetries: number
  defaultEntryGate: string
  defaultExitGate: string
}

export interface VehiclePricingConfigItem {
  vehicleType: 'Car' | 'Motorcycle' | 'Truck'
  hourlyRate: number
  dailyRate: number
}

const defaultConfig: VehicleConfigState = {
  autoOpenBarrierAfterPaid: true,
  freeExitMinutes: 10,
  maxPlateRetries: 3,
  defaultEntryGate: 'gate-1',
  defaultExitGate: 'gate-exit-1',
}

const defaultPricingConfig: VehiclePricingConfigItem[] = [
  { vehicleType: 'Car', hourlyRate: 15000, dailyRate: 180000 },
  { vehicleType: 'Motorcycle', hourlyRate: 5000, dailyRate: 60000 },
  { vehicleType: 'Truck', hourlyRate: 30000, dailyRate: 320000 },
]

const VEHICLE_TYPES: VehiclePricingConfigItem['vehicleType'][] = ['Car', 'Motorcycle', 'Truck']

type PriceMode = 'hourly' | 'daily'

function mapApiConfigToState(c: ParkingConfigItem | null): VehicleConfigState {
  if (!c) return defaultConfig
  return {
    autoOpenBarrierAfterPaid: c.auto_open_barrier_after_paid ?? defaultConfig.autoOpenBarrierAfterPaid,
    freeExitMinutes: c.free_exit_minutes ?? defaultConfig.freeExitMinutes,
    maxPlateRetries: c.max_plate_retries ?? defaultConfig.maxPlateRetries,
    defaultEntryGate: c.default_entry_gate ?? defaultConfig.defaultEntryGate,
    defaultExitGate: c.default_exit_gate ?? defaultConfig.defaultExitGate,
  }
}

function mapApiPricingToItems(items: ParkingPricingItem[]): VehiclePricingConfigItem[] {
  const byType = new Map<string, VehiclePricingConfigItem>()
  VEHICLE_TYPES.forEach((vt) => {
    byType.set(vt, { vehicleType: vt, hourlyRate: 0, dailyRate: 0 })
  })
  items.forEach((p) => {
    const vt = (p.vehicle_type ?? '').toUpperCase()
    const key = vt === 'CAR' ? 'Car' : vt === 'MOTORCYCLE' || vt === 'MOTOR' ? 'Motorcycle' : vt === 'TRUCK' ? 'Truck' : null
    if (key && byType.has(key)) {
      byType.set(key, {
        vehicleType: key,
        hourlyRate: p.hourly_rate ?? 0,
        dailyRate: p.daily_rate ?? 0,
      })
    }
  })
  return VEHICLE_TYPES.map((vt) => byType.get(vt)!)
}

export default function VehicleConfig() {
  const { t } = useTranslation()
  const tenantId = useHomeNavigationStore((s) => s.selectedTenant?.id)
  const [config, setConfig] = useState<VehicleConfigState>(
    () => getVehicleManagementConfig<VehicleConfigState>(defaultConfig),
  )
  const [priceMode, setPriceMode] = useState<PriceMode>('hourly')
  const [pricingConfig, setPricingConfig] = useState<VehiclePricingConfigItem[]>(
    () => getVehiclePricingConfig<VehiclePricingConfigItem[]>(defaultPricingConfig),
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msgApi, contextHolder] = message.useMessage()

  const fetchConfigAndPricing = useCallback(() => {
    if (!tenantId) return
    setLoading(true)
    Promise.all([
      parkingConfigApi.get(tenantId).catch(() => null),
      parkingPricingApi.getList({ tenant_id: tenantId }).then((r) => r.items ?? []).catch(() => []),
    ])
      .then(([cfg, pricingItems]) => {
        setConfig(mapApiConfigToState(cfg))
        setPricingConfig(mapApiPricingToItems(pricingItems).length > 0 ? mapApiPricingToItems(pricingItems) : defaultPricingConfig)
      })
      .finally(() => setLoading(false))
  }, [tenantId])

  useEffect(() => {
    if (tenantId) fetchConfigAndPricing()
    else {
      setConfig(getVehicleManagementConfig<VehicleConfigState>(defaultConfig))
      setPricingConfig(getVehiclePricingConfig<VehiclePricingConfigItem[]>(defaultPricingConfig))
    }
  }, [tenantId, fetchConfigAndPricing])

  const saveConfig = () => {
    saveVehicleManagementConfig(config)
    saveVehiclePricingConfig(pricingConfig)
    if (tenantId) {
      setSaving(true)
      Promise.all([
        parkingConfigApi.update({
          tenant_id: tenantId,
          auto_open_barrier_after_paid: config.autoOpenBarrierAfterPaid,
          free_exit_minutes: config.freeExitMinutes,
          max_plate_retries: config.maxPlateRetries,
          default_entry_gate: config.defaultEntryGate,
          default_exit_gate: config.defaultExitGate,
        }),
        parkingPricingApi.upsert({
          tenant_id: tenantId,
          items: pricingConfig.map((p) => ({
            vehicle_type: p.vehicleType,
            hourly_rate: p.hourlyRate,
            daily_rate: p.dailyRate,
          })),
        }),
      ])
        .then(() => msgApi.success(t('vehicleConfig.saved', 'Đã lưu cấu hình phương tiện')))
        .catch(() => msgApi.error(t('vehicleConfig.saveError', 'Lưu cấu hình thất bại')))
        .finally(() => setSaving(false))
    } else {
      msgApi.success(t('vehicleConfig.saved', 'Đã lưu cấu hình phương tiện'))
    }
  }

  const resetConfig = () => {
    if (tenantId) {
      setSaving(true)
      parkingConfigApi
        .reset(tenantId)
        .then((cfg) => {
          setConfig(mapApiConfigToState(cfg))
          setPricingConfig(defaultPricingConfig)
          msgApi.success(t('vehicleConfig.resetDone', 'Đã đặt lại cấu hình mặc định'))
        })
        .catch(() => {
          setConfig(defaultConfig)
          setPricingConfig(defaultPricingConfig)
          saveVehicleManagementConfig(defaultConfig)
          saveVehiclePricingConfig(defaultPricingConfig)
          msgApi.success(t('vehicleConfig.resetDone', 'Đã đặt lại cấu hình mặc định'))
        })
        .finally(() => setSaving(false))
    } else {
      setConfig(defaultConfig)
      setPricingConfig(defaultPricingConfig)
      saveVehicleManagementConfig(defaultConfig)
      saveVehiclePricingConfig(defaultPricingConfig)
      msgApi.success(t('vehicleConfig.resetDone', 'Đã đặt lại cấu hình mặc định'))
    }
  }

  const vehicleTypeLabelMap: Record<VehiclePricingConfigItem['vehicleType'], string> = {
    Car: t('parking.car'),
    Motorcycle: t('parking.motorcycle'),
    Truck: t('liveEntrance.truck', 'Xe tải'),
  }

  return (
    <PageContainer>
      {contextHolder}
      <PageHeader
        title={t('vehicleConfig.title', 'Cấu hình phương tiện')}
        subtitle={tenantId ? t('vehicleConfig.subtitle', 'Thiết lập tham số cho hệ thống kiểm soát phương tiện') : t('vehicleConfig.selectTenantHint', 'Chọn tenant từ trang chủ để đồng bộ cấu hình với server')}
        icon={<SettingOutlined />}
        actions={(
          <Space>
            <Button onClick={resetConfig} disabled={saving}>{t('common.reset', 'Đặt lại')}</Button>
            <Button type="primary" onClick={saveConfig} loading={saving}>{t('vehicleConfig.save', 'Lưu cấu hình')}</Button>
          </Space>
        )}
      />

      <Spin spinning={loading}>
      <ContentCard title={t('vehicleConfig.general', 'Cấu hình chung')}>
        <Form layout="vertical">
          <Form.Item label={t('vehicleConfig.autoOpenBarrierAfterPaid', 'Tự động mở barrier sau thanh toán')}>
            <Switch
              checked={config.autoOpenBarrierAfterPaid}
              onChange={(checked) => setConfig(prev => ({ ...prev, autoOpenBarrierAfterPaid: checked }))}
            />
          </Form.Item>

          <Form.Item label={t('vehicleConfig.freeExitMinutes', 'Thời gian miễn phí (phút)')}>
            <InputNumber
              min={0}
              max={120}
              value={config.freeExitMinutes}
              onChange={(value) => setConfig(prev => ({ ...prev, freeExitMinutes: Number(value) || 0 }))}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label={t('vehicleConfig.maxPlateRetries', 'Số lần thử nhận diện biển số')}>
            <InputNumber
              min={1}
              max={10}
              value={config.maxPlateRetries}
              onChange={(value) => setConfig(prev => ({ ...prev, maxPlateRetries: Number(value) || 1 }))}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </ContentCard>

      <ContentCard title={t('vehicleConfig.defaultGates', 'Cổng mặc định')}>
        <Form layout="vertical">
          <Form.Item label={t('vehicleConfig.defaultEntryGate', 'Cổng vào mặc định')}>
            <Select
              value={config.defaultEntryGate}
              onChange={(value) => setConfig(prev => ({ ...prev, defaultEntryGate: value }))}
              options={[
                { value: 'gate-1', label: t('vehicleConfig.gateEntry1') },
                { value: 'gate-2', label: t('vehicleConfig.gateEntry2') },
              ]}
            />
          </Form.Item>
          <Form.Item label={t('vehicleConfig.defaultExitGate', 'Cổng ra mặc định')}>
            <Select
              value={config.defaultExitGate}
              onChange={(value) => setConfig(prev => ({ ...prev, defaultExitGate: value }))}
              options={[
                { value: 'gate-exit-1', label: t('vehicleConfig.gateExit1') },
                { value: 'gate-exit-2', label: t('vehicleConfig.gateExit2') },
              ]}
            />
          </Form.Item>
        </Form>
        <Text type="secondary">
          {t('vehicleConfig.note', 'Các thiết lập này dùng cho giao diện demo và được lưu trên trình duyệt hiện tại.')}
        </Text>
      </ContentCard>

      <ContentCard title={t('vehicleConfig.pricingTitle', 'Cấu hình giá đỗ xe')}>
        <div className="mb-12 flex items-center justify-between gap-12">
          <Text type="secondary">{t('vehicleConfig.pricingDesc', 'Thiết lập đơn giá theo loại xe')}</Text>
          <Select
            value={priceMode}
            onChange={(value) => setPriceMode(value as PriceMode)}
            style={{ width: 160 }}
            options={[
              { value: 'hourly', label: t('vehicleConfig.byHour', 'Theo giờ') },
              { value: 'daily', label: t('vehicleConfig.byDay', 'Theo ngày') },
            ]}
          />
        </div>
        <div
          className="mb-8"
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            columnGap: 12,
            alignItems: 'center',
          }}
        >
          <Text strong>{t('vehicleConfig.vehicleType', 'Loại xe')}</Text>
          <Text strong>{priceMode === 'hourly' ? t('vehicleConfig.pricePerHour', 'Giá theo giờ') : t('vehicleConfig.pricePerDay', 'Giá theo ngày')}</Text>
        </div>
        <Space direction="vertical" className="w-full" size={10}>
          {pricingConfig.map((item, index) => (
            <div
              key={item.vehicleType}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                columnGap: 12,
                alignItems: 'center',
              }}
            >
              <Text>{vehicleTypeLabelMap[item.vehicleType]}</Text>
              {priceMode === 'hourly' ? (
                <InputNumber
                  min={0}
                  step={1000}
                  value={item.hourlyRate}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  addonAfter="đ"
                  onChange={(value) => {
                    const next = [...pricingConfig]
                    next[index] = { ...next[index], hourlyRate: Number(value) || 0 }
                    setPricingConfig(next)
                  }}
                />
              ) : (
                <InputNumber
                  min={0}
                  step={1000}
                  value={item.dailyRate}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  addonAfter="đ"
                  onChange={(value) => {
                    const next = [...pricingConfig]
                    next[index] = { ...next[index], dailyRate: Number(value) || 0 }
                    setPricingConfig(next)
                  }}
                />
              )}
            </div>
          ))}
        </Space>
      </ContentCard>
      </Spin>
    </PageContainer>
  )
}
