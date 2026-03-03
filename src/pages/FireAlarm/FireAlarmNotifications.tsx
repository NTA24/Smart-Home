import { Row, Col, Typography, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { WifiOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Text, Title } = Typography

export default function FireAlarmNotifications() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab6', 'Thông báo đa kênh')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab6', 'Thông báo đa kênh')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.channels', 'Kênh thông báo')}</Title>
            <Space wrap>
              {['email', 'sms', 'push_mobile', 'web'].map((k) => (
                <Tag key={k} icon={<WifiOutlined />}>{t(`fireAlarm.channel_${k}`, k)}</Tag>
              ))}
              <Tag>{t('fireAlarm.integration', 'Telegram / Zalo')}</Tag>
            </Space>
          </Col>
          <Col span={24}>
            <Text type="secondary">{t('fireAlarm.tab6Desc', 'Cấu hình gửi theo loại sự kiện, khung giờ, vai trò.')}</Text>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
