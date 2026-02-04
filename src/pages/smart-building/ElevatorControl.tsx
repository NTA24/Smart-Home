import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function ElevatorControl() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.elevatorControl')}</Title>
      <p>{t('menu.elevatorControl')} — content coming soon.</p>
    </Card>
  )
}
