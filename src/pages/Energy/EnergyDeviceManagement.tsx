import { useTranslation } from 'react-i18next'
import { PageContainer, ContentCard } from '@/components'

export default function EnergyDeviceManagement() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <ContentCard title={t('menu.energyDeviceManagement')}>
        <p>{t('menu.energyDeviceManagement')} — content coming soon.</p>
      </ContentCard>
    </PageContainer>
  )
}
