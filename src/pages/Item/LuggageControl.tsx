import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Title } = Typography

export default function LuggageControl() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader title={t('menu.luggageControl')} />
      <ContentCard>
        <Title level={4}>{t('menu.luggageControl')}</Title>
        <p>{t('menu.luggageControl')} — content coming soon.</p>
      </ContentCard>
    </PageContainer>
  )
}
