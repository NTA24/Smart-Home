import { Row, Col } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

export default function FireAlarmMaintenance() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab7', 'Bảo trì & kiểm tra định kỳ')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab7', 'Bảo trì & kiểm tra định kỳ')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ul className="list-disc pl-5 text-secondary">
              <li>{t('fireAlarm.maint_schedule', 'Lập lịch test thiết bị')}</li>
              <li>{t('fireAlarm.maint_remind', 'Nhắc lịch bảo trì / kiểm định')}</li>
              <li>{t('fireAlarm.maint_log', 'Log lịch sử bảo trì')}</li>
              <li>{t('fireAlarm.maint_drill', 'Thiết lập kịch bản diễn tập')}</li>
            </ul>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
