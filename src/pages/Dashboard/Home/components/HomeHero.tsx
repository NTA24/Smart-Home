import { Breadcrumb, Row, Col, Card, Typography } from 'antd'
import {
  CheckCircleOutlined,
  CloudServerOutlined,
  BankOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { StepKey } from '../homeTypes'
import { useShallow } from 'zustand/react/shallow'
import { useHomeNavigationStore } from '@/stores'

const { Title, Text } = Typography

type HeroConfig = {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
}

type Props = {
  step: StepKey
  stepConfig: Record<StepKey, HeroConfig>
  onBreadcrumbTenant: () => void
  onBreadcrumbCampus: () => void
}

export function HomeHero({ step, stepConfig, onBreadcrumbTenant, onBreadcrumbCampus }: Props) {
  const { t } = useTranslation()
  const { tenants, campuses, buildings, selectedTenant, selectedCampus } = useHomeNavigationStore(
    useShallow((s) => ({
      tenants: s.tenants,
      campuses: s.campuses,
      buildings: s.buildings,
      selectedTenant: s.selectedTenant,
      selectedCampus: s.selectedCampus,
    })),
  )
  const current = stepConfig[step]

  return (
    <div className="home_hero" style={{ background: current.color }}>
      <div className="home_breadcrumb-wrap">
        <Breadcrumb
          className="home_breadcrumb"
          items={[
            {
              title: (
                <span
                  className={step !== 'tenants' ? 'cursor-pointer' : ''}
                  style={{ color: step === 'tenants' ? '#fff' : 'rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    if (step !== 'tenants') onBreadcrumbTenant()
                  }}
                >
                  <CloudServerOutlined /> {t('home.tenant')}
                </span>
              ),
            },
            ...(step !== 'tenants'
              ? [
                  {
                    title: (
                      <span
                        className={step === 'buildings' ? 'cursor-pointer' : ''}
                        style={{ color: step === 'campuses' ? '#fff' : 'rgba(255,255,255,0.7)' }}
                        onClick={() => {
                          if (step === 'buildings') onBreadcrumbCampus()
                        }}
                      >
                        <BankOutlined /> {selectedTenant?.name}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(step === 'buildings'
              ? [
                  {
                    title: (
                      <span className="text-white">
                        <HomeOutlined /> {selectedCampus?.name}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>

      {current.icon}
      <Title level={2} className="home_hero-title">
        {current.title}
      </Title>
      <Text className="home_hero-subtitle">{current.subtitle}</Text>

      <Row gutter={24} className="home_stats-row">
        <Col xs={8}>
          <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
            <CheckCircleOutlined className="home_stat-icon text-success" />
            <Title level={3} className="home_stat-value">
              {tenants.length}
            </Title>
            <Text type="secondary" className="home_stat-label">
              {t('home.tenant')}
            </Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
            <BankOutlined className="home_stat-icon text-primary" />
            <Title level={3} className="home_stat-value">
              {campuses.length}
            </Title>
            <Text type="secondary" className="home_stat-label">
              {t('home.campus')}
            </Text>
          </Card>
        </Col>
        <Col xs={8}>
          <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
            <HomeOutlined className="home_stat-icon text-warning" />
            <Title level={3} className="home_stat-value">
              {buildings.length}
            </Title>
            <Text type="secondary" className="home_stat-label">
              {t('home.building')}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
