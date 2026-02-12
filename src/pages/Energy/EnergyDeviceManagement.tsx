import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function EnergyDeviceManagement() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.energyDeviceManagement')}</Title>
      <p>{t('menu.energyDeviceManagement')} — content coming soon.</p>
    </Card>
  )
}
