import { useState } from 'react'
import { Button, Form, InputNumber, Select, Space, Switch, Typography, message } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ContentCard, PageContainer, PageHeader } from '@/components'
import { getVehicleManagementConfig, saveVehicleManagementConfig } from '@/services/mockPersistence'

const { Text } = Typography

interface VehicleConfigState {
  autoOpenBarrierAfterPaid: boolean
  freeExitMinutes: number
  maxPlateRetries: number
  defaultEntryGate: string
  defaultExitGate: string
}

const defaultConfig: VehicleConfigState = {
  autoOpenBarrierAfterPaid: true,
  freeExitMinutes: 10,
  maxPlateRetries: 3,
  defaultEntryGate: 'gate-1',
  defaultExitGate: 'gate-exit-1',
}

export default function VehicleConfig() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<VehicleConfigState>(
    () => getVehicleManagementConfig<VehicleConfigState>(defaultConfig),
  )
  const [msgApi, contextHolder] = message.useMessage()

  const saveConfig = () => {
    saveVehicleManagementConfig(config)
    msgApi.success(t('vehicleConfig.saved', 'Đã lưu cấu hình phương tiện'))
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
    saveVehicleManagementConfig(defaultConfig)
    msgApi.success(t('vehicleConfig.resetDone', 'Đã đặt lại cấu hình mặc định'))
  }

  return (
    <PageContainer>
      {contextHolder}
      <PageHeader
        title={t('vehicleConfig.title', 'Cấu hình phương tiện')}
        subtitle={t('vehicleConfig.subtitle', 'Thiết lập tham số cho hệ thống kiểm soát phương tiện')}
        icon={<SettingOutlined />}
        actions={(
          <Space>
            <Button onClick={resetConfig}>{t('common.reset', 'Đặt lại')}</Button>
            <Button type="primary" onClick={saveConfig}>{t('vehicleConfig.save', 'Lưu cấu hình')}</Button>
          </Space>
        )}
      />

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
                { value: 'gate-1', label: 'Cổng vào 1' },
                { value: 'gate-2', label: 'Cổng vào 2' },
              ]}
            />
          </Form.Item>
          <Form.Item label={t('vehicleConfig.defaultExitGate', 'Cổng ra mặc định')}>
            <Select
              value={config.defaultExitGate}
              onChange={(value) => setConfig(prev => ({ ...prev, defaultExitGate: value }))}
              options={[
                { value: 'gate-exit-1', label: 'Cổng ra 1' },
                { value: 'gate-exit-2', label: 'Cổng ra 2' },
              ]}
            />
          </Form.Item>
        </Form>
        <Text type="secondary">
          {t('vehicleConfig.note', 'Các thiết lập này dùng cho giao diện demo và được lưu trên trình duyệt hiện tại.')}
        </Text>
      </ContentCard>
    </PageContainer>
  )
}
