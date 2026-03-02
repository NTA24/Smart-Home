import { useTranslation } from 'react-i18next'
import { SafetyCertificateOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'

export default function FireAlarmManagement() {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.title', 'Quản lý thiết bị báo cháy')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
        titleIcon={<SafetyCertificateOutlined className="text-primary text-xl" />}
      />
      <ContentCard>
        <div className="py-12 text-center text-secondary">
          {t('fireAlarm.placeholder', 'Nội dung quản lý thiết bị báo cháy sẽ được bổ sung tại đây.')}
        </div>
      </ContentCard>
    </PageContainer>
  )
}
