import { DashboardOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ContentCard, PageContainer, PageHeader } from '@/components'
import { DashboardListPage } from './src/app/modules/home/pages/dashboard/DashboardListPage'

export default function EnergyDeviceDashboardPage() {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.deviceDashboard')}
        icon={<DashboardOutlined />}
        subtitle={t('energyDeviceDashboard.homeDashboards')}
      />
      <ContentCard>
        <DashboardListPage />
      </ContentCard>
    </PageContainer>
  )
}
