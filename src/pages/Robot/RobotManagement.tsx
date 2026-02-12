import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function RobotManagement() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.robotManagement')}</Title>
      <p>{t('menu.robotManagement')} — content coming soon.</p>
    </Card>
  )
}
