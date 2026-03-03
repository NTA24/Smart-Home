import { Row, Col, Typography, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Text, Title } = Typography

export default function FireAlarmEvents() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab2', 'Sự kiện & cảnh báo')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab2', 'Sự kiện & cảnh báo')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">{t('fireAlarm.tab2Desc', 'Popup + âm thanh cảnh báo khi có cháy. Highlight vị trí trên sơ đồ. Ghi log thời gian chính xác.')}</Text>
          </Col>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.eventTypes', 'Loại sự kiện')}</Title>
            <Space wrap>
              {['fire_alarm', 'pre_alarm', 'fault', 'tamper', 'power_loss', 'battery_low'].map((k) => (
                <Tag key={k}>{t(`fireAlarm.event_${k}`, k)}</Tag>
              ))}
            </Space>
          </Col>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.actions', 'Thao tác (theo quyền)')}</Title>
            <Space wrap>
              <Tag color="blue">{t('fireAlarm.ack', 'Acknowledge')}</Tag>
              <Tag color="orange">{t('fireAlarm.silence', 'Silence')}</Tag>
              <Tag color="green">{t('fireAlarm.reset', 'Reset')}</Tag>
            </Space>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
