import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

export default function ElevatorByArea() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader title={t('menu.elevatorByArea')} />
      <ContentCard title={t('menu.elevatorByArea')}>
        <Typography.Paragraph>{t('menu.elevatorByArea')} — content coming soon.</Typography.Paragraph>
      </ContentCard>
    </PageContainer>
  )
}
