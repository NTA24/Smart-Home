import { Row, Col, Typography, Tag, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Title } = Typography

export default function FireAlarmRoles() {
  const { t } = useTranslation()
  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.tab4', 'Phân quyền người dùng')}
        subtitle={t('fireAlarm.subtitle', 'Giám sát và quản lý hệ thống thiết bị báo cháy')}
      />
      <ContentCard title={t('fireAlarm.tab4', 'Phân quyền người dùng')}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.roles', 'Vai trò')}</Title>
            <Space wrap>
              {['super_admin', 'tenant_admin', 'operator', 'viewer'].map((k) => (
                <Tag key={k} color="blue">{t(`fireAlarm.role_${k}`, k)}</Tag>
              ))}
            </Space>
          </Col>
          <Col span={24}>
            <Title level={5}>{t('fireAlarm.permissions', 'Phân quyền theo chức năng')}</Title>
            <ul className="list-disc pl-5 text-secondary">
              <li>{t('fireAlarm.perm_viewLog', 'Xem log')}</li>
              <li>{t('fireAlarm.perm_resetDevice', 'Reset thiết bị')}</li>
              <li>{t('fireAlarm.perm_exportReport', 'Export báo cáo')}</li>
              <li>{t('fireAlarm.perm_systemConfig', 'Cấu hình hệ thống')}</li>
            </ul>
          </Col>
        </Row>
      </ContentCard>
    </PageContainer>
  )
}
