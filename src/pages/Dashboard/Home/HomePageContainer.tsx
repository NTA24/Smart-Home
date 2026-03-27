import { useState, useMemo } from 'react'
import { Tag, Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  CloudServerOutlined,
  BankOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useShallow } from 'zustand/react/shallow'
import { useHomeNavigationStore } from '@/stores'
import type { StepKey } from './homeTypes'
import { useHomeSelectionFlow } from './hooks/useHomeSelectionFlow'
import { HomeHero } from './components/HomeHero'
import { HomeTenantsPanel } from './components/HomeTenantsPanel'
import { HomeCampusesPanel } from './components/HomeCampusesPanel'
import { HomeBuildingsPanel } from './components/HomeBuildingsPanel'
import './home.css'

const { Title: SectionTitle } = Typography

/**
 * Trang chọn Tenant → Campus → Building: layout + flow; CRUD theo từng bước trong panel riêng (mount có điều kiện).
 */
export default function HomePageContainer() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const { step, tenants, campuses, buildings, selectedTenant, selectedCampus } = useHomeNavigationStore(
    useShallow((s) => ({
      step: s.step,
      tenants: s.tenants,
      campuses: s.campuses,
      buildings: s.buildings,
      selectedTenant: s.selectedTenant,
      selectedCampus: s.selectedCampus,
    })),
  )

  const flow = useHomeSelectionFlow(setLoading)

  const stepConfig = useMemo(
    () =>
      ({
        tenants: {
          icon: <CloudServerOutlined className="home_hero-icon text-white" />,
          title: t('home.selectTenant'),
          subtitle: t('home.selectTenantDesc'),
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        campuses: {
          icon: <BankOutlined style={{ fontSize: 32, color: '#fff' }} />,
          title: t('home.selectCampus'),
          subtitle: `${t('home.tenant')}: ${selectedTenant?.name || ''}`,
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
        buildings: {
          icon: <HomeOutlined style={{ fontSize: 32, color: '#fff' }} />,
          title: t('home.selectBuilding'),
          subtitle: `${t('home.campus')}: ${selectedCampus?.name || ''}`,
          color: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)',
        },
      }) satisfies Record<
        StepKey,
        { icon: React.ReactNode; title: string; subtitle: string; color: string }
      >,
    [t, selectedTenant?.name, selectedCampus?.name],
  )

  const showBlockingSpinner =
    loading &&
    !(
      (step === 'tenants' && tenants.length > 0) ||
      (step === 'campuses' && campuses.length > 0) ||
      (step === 'buildings' && buildings.length > 0)
    )

  return (
    <div className="home_root">
      <HomeHero
        step={step}
        stepConfig={stepConfig}
        onBreadcrumbTenant={flow.navigateToTenantRoot}
        onBreadcrumbCampus={flow.navigateToCampusOnly}
      />

      <div className="home_content">
        {step !== 'tenants' && (
          <div className="home_back-wrap">
            <Tag
              icon={<ArrowLeftOutlined />}
              color="default"
              className="home_back-tag cursor-pointer"
              onClick={() => !loading && flow.goBack()}
              style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              {t('apiTest.back')}
            </Tag>
          </div>
        )}

        <SectionTitle level={4} className="home_section-title">
          {step === 'tenants' && t('home.tenantList')}
          {step === 'campuses' && t('home.campusList')}
          {step === 'buildings' && t('home.buildingList')}
        </SectionTitle>

        <Spin spinning={showBlockingSpinner}>
          {step === 'tenants' && (
            <HomeTenantsPanel setLoading={setLoading} loading={loading} flow={flow} />
          )}
          {step === 'campuses' && <HomeCampusesPanel loading={loading} flow={flow} />}
          {step === 'buildings' && <HomeBuildingsPanel loading={loading} flow={flow} />}
        </Spin>
      </div>
    </div>
  )
}
