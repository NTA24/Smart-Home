import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title } = Typography

export default function PersonnelManagement() {
  const { t } = useTranslation()
  return (
    <Card>
      <Title level={4}>{t('menu.personnelManagement')}</Title>
      <p>{t('menu.personnelManagement')} — content coming soon.</p>
    </Card>
  )
}
