import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function LuggageControl() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.luggageControl')}</Title>
      <p>{t('menu.luggageControl')} — content coming soon.</p>
    </Card>
  )
}
