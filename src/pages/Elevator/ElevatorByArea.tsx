import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function ElevatorByArea() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.elevatorByArea')}</Title>
      <p>{t('menu.elevatorByArea')} — content coming soon.</p>
    </Card>
  )
}
