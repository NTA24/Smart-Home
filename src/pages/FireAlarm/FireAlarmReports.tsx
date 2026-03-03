import { Row, Col } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

export default function FireAlarmReports() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab5', 'Báo cáo & thống kê')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab5', 'Báo cáo & thống kê')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ul className="list-disc pl-5 text-secondary">
              <li>{t('fireAlarm.report_history', 'Lịch sử báo cháy theo ngày / tuần / tháng')}</li>
              <li>{t('fireAlarm.report_stats', 'Thống kê số lần báo cháy, false alarm, thời gian phản hồi')}</li>
              <li>{t('fireAlarm.report_export', 'Export Excel / PDF')}</li>
              <li>{t('fireAlarm.report_audit', 'Audit log theo user')}</li>
            </ul>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
