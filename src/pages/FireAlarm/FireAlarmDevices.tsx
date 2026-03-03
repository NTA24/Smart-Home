import { Row, Col, Typography, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Text, Title } = Typography

export default function FireAlarmDevices() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab3', 'Quản lý thiết bị')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab3', 'Quản lý thiết bị')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text type="secondary">{t('fireAlarm.tab3Desc', 'Thêm / sửa / xoá thiết bị. Theo dõi online/offline, RSSI, pin, firmware. Remote config nếu thiết bị hỗ trợ.')}</Text>
          </Col>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.deviceTypes', 'Loại thiết bị')}</Title>
            <Space wrap>
              {['smoke_detector', 'heat_detector', 'manual_call_point', 'control_panel'].map((k) => (
                <Tag key={k}>{t(`fireAlarm.device_${k}`, k)}</Tag>
              ))}
            </Space>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
