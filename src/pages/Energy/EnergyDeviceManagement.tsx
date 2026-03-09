import { Card, Row, Col, Typography, Button } from 'antd'
import {
  ArrowLeftOutlined,
  ControlOutlined,
  CloudOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { PageContainer, PageHeader } from '@/components'
import EnergyMeterPage from './EnergyMeterPage'
import HvacAssetPage from './HvacAssetPage'
import IaqSensorPage from './IaqSensorPage'
import EnergyAggregatePage from './EnergyAggregatePage'
import EnergyMvPage from './EnergyMvPage'
import EnergyDeviceConfigPage from './EnergyDeviceConfigPage'

const { Text } = Typography

const BASE = '/energy-device-management'

type TabKey = 'meters' | 'hvac' | 'iaq' | 'aggregates' | 'mv' | 'config'

const pathToKey: Record<string, TabKey> = {
  'energy-meters': 'meters',
  'hvac-assets': 'hvac',
  'iaq-sensors': 'iaq',
  'energy-aggregates': 'aggregates',
  'energy-mv': 'mv',
  'device-config': 'config',
}

const tabCards: { key: TabKey; path: string; icon: React.ReactNode; titleKey: string; descKey: string; color?: string }[] = [
  { key: 'meters', path: 'energy-meters', icon: <ThunderboltOutlined />, titleKey: 'energyDeviceManagement.metersTitle', descKey: 'energyDeviceManagement.metersDesc', color: '#faad14' },
  { key: 'hvac', path: 'hvac-assets', icon: <ControlOutlined />, titleKey: 'menu.hvacAssets', descKey: 'energyDeviceManagement.hvacDesc', color: '#1890ff' },
  { key: 'iaq', path: 'iaq-sensors', icon: <CloudOutlined />, titleKey: 'menu.iaqSensors', descKey: 'energyDeviceManagement.iaqDesc', color: '#52c41a' },
  { key: 'aggregates', path: 'energy-aggregates', icon: <BarChartOutlined />, titleKey: 'menu.energyAggregates', descKey: 'energyDeviceManagement.aggregatesDesc', color: '#722ed1' },
  { key: 'mv', path: 'energy-mv', icon: <DatabaseOutlined />, titleKey: 'menu.energyMv', descKey: 'energyDeviceManagement.mvDesc', color: '#13c2c2' },
  { key: 'config', path: 'device-config', icon: <SettingOutlined />, titleKey: 'energyDeviceManagement.configTitle', descKey: 'energyDeviceManagement.configDesc', color: '#eb2f96' },
]

export default function EnergyDeviceManagement() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const pathname = location.pathname.replace(/\/$/, '')
  const segment = pathname.startsWith(BASE + '/') ? pathname.slice(BASE.length + 1) : null
  const activeKey = segment && pathToKey[segment] ? pathToKey[segment] : null

  const renderContent = () => {
    switch (activeKey) {
      case 'meters':
        return <EnergyMeterPage embedded />
      case 'hvac':
        return <HvacAssetPage embedded />
      case 'iaq':
        return <IaqSensorPage embedded />
      case 'aggregates':
        return <EnergyAggregatePage embedded />
      case 'mv':
        return <EnergyMvPage embedded />
      case 'config':
        return <EnergyDeviceConfigPage />
      default:
        return null
    }
  }

  const subtitleStr = t('energyDeviceManagement.subtitle')
  const subtitleParts = subtitleStr.split(/,|\s+và\s+/).map((s) => s.trim()).filter(Boolean)

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.energyDeviceManagement')}
        icon={<ThunderboltOutlined />}
        subtitle={
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8 }}>
            {subtitleParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </span>
        }
      />

      {activeKey === null ? (
        <Row gutter={[16, 16]}>
          {tabCards.map(({ key, path, icon, titleKey, descKey, color }) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Card
                hoverable
                className="h-full cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(`${BASE}/${path}`)}
                style={{ borderColor: color, borderWidth: 2 }}
              >
                <div className="flex flex-col gap-2">
                  <span style={{ fontSize: 32, color }}>{icon}</span>
                  <Text strong className="text-base">
                    {t(titleKey)}
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {t(descKey)}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div>
          <Card
            size="small"
            className="mb-4"
            style={{ background: '#fafafa' }}
          >
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(BASE)}
              className="energy-back-btn"
            >
              {t('energyDeviceManagement.backToCards')}
            </Button>
          </Card>
          {renderContent()}
        </div>
      )}
    </PageContainer>
  )
}
