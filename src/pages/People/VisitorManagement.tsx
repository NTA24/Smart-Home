import { useState } from 'react'
import { Tabs, Input, Button, Card, Row, Col, Avatar, Typography, Space, List, Badge } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  TeamOutlined,
  BellOutlined,
  CloudOutlined,
  MailOutlined,
  FolderOutlined,
  UserOutlined,
  CopyOutlined,
  PlusOutlined,
  DownOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { PageContainer, ContentCard } from '@/components'

const { Text } = Typography

const TODAY_VISITORS = [
  { key: '1', name: 'Mr. Dung Nguyen', email: 'nguyendung@company.com', visitTime: 'Apr 20 10:12:00', hostUnit: 'Tran Linh (ABC)', accessScope: 'Lobby, Floor 15', slot: 'Apr 25, 20:46 - 21:00', type: 'Day Of Arrival', qrCode: 'QRX2345', status: 'CHECKEDIN' },
  { key: '2', name: 'Ms. Ngoc Tran', email: 'ngoctran@mail.com', visitTime: 'Apr 20 09:30:00', hostUnit: 'Apt A-1201', accessScope: 'Lobby, Floor 12', slot: 'Apr 20 14:00-16:00', type: 'Pre-booked', qrCode: 'QRX2346', status: 'PENDING' },
  { key: '3', name: 'Delivery GHN', email: '-', visitTime: 'Apr 20 10:00:00', hostUnit: 'Apt B-0302', accessScope: 'Lobby only', slot: '10:00-10:30', type: 'One-time', qrCode: 'QRX2347', status: 'CHECKOUT' },
]

export default function VisitorManagement() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('today')
  const [detailTab, setDetailTab] = useState('profiles')
  const [selectedVisitor, setSelectedVisitor] = useState<typeof TODAY_VISITORS[0] | null>(TODAY_VISITORS[0])
  const [search, setSearch] = useState('')

  const filteredToday = TODAY_VISITORS.filter(
    (v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageContainer className="visitor-mgmt-page">
      <div className="visitor-mgmt-header flex items-center justify-between">
        <h1>{t('visitorManagement.title', 'Visitor Management')}</h1>
        <Space size="middle">
          <Badge count={5} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
          <Badge count={5} size="small">
            <Button type="text" icon={<CloudOutlined />} />
          </Badge>
          <Button type="text" icon={<MailOutlined />} />
          <Button type="text" icon={<FolderOutlined />} />
          <Avatar size="small" icon={<UserOutlined />} />
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="visitor-mgmt-tabs"
        items={[
          { key: 'today', label: t('visitorManagement.todaysVisitors', "Today's Visitors") },
          { key: 'prebookings', label: <span>{t('visitorManagement.preBookings', 'Pre-Bookings')} <DownOutlined className="text-xs" /></span> },
          { key: 'invite', label: t('visitorManagement.inviteVisitor', 'Invite Visitor') },
        ]}
      />

      {activeTab === 'today' && (
        <div className="flex gap-20 flex-col lg:flex-row">
          <div className="w-full lg:w-80 flex-shrink-0 visitor-mgmt-list-wrap">
            <Input placeholder={t('common.search', 'Search')} value={search} onChange={(e) => setSearch(e.target.value)} allowClear className="visitor-mgmt-search mb-12" />
            <List
              size="small"
              className="visitor-mgmt-list"
              dataSource={filteredToday}
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer ${selectedVisitor?.key === item.key ? 'visitor-mgmt-item-active' : ''}`}
                  onClick={() => setSelectedVisitor(item)}
                >
                  <List.Item.Meta title={item.name} description={item.visitTime} />
                </List.Item>
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            {selectedVisitor ? (
              <ContentCard className="visitor-mgmt-detail-card">
                <div className="flex flex-wrap items-start gap-12 visitor-mgmt-profile-row">
                  <Avatar size={64} icon={<UserOutlined />} />
                  <div className="flex-1 min-w-0">
                    <div className="visitor-mgmt-name">{selectedVisitor.name}</div>
                    <div className="visitor-mgmt-meta">{selectedVisitor.visitTime}</div>
                    <div className="flex flex-wrap items-center gap-8">
                      <Text type="secondary">{selectedVisitor.email}</Text>
                      <Button type="text" size="small" icon={<CopyOutlined />} />
                      <Button size="small" className="visitor-mgmt-stopover-btn">{t('visitorManagement.stopover', 'Stopover')}</Button>
                    </div>
                  </div>
                </div>
                <Tabs
                  activeKey={detailTab}
                  onChange={setDetailTab}
                  size="small"
                  tabBarExtraContent={
                    <Space>
                      <Text type="secondary" className="text-xs">As proven</Text>
                      <Button type="text" size="small" icon={<SettingOutlined />} />
                    </Space>
                  }
                  items={[
                    { key: 'profiles', label: t('visitorManagement.profiles', 'Profiles') },
                    { key: 'credentials', label: t('visitorManagement.credentialsRoles', 'Credentials & Roles') },
                    { key: 'accessHistory', label: t('visitorManagement.accessHistory', 'Access History') },
                  ]}
                />
                {detailTab === 'profiles' && (
                  <Card size="small" className="mt-12 visitor-mgmt-profile-card">
                    <Row gutter={24}>
                      <Col xs={24} md={14}>
                        <div className="mb-8"><Text strong>{t('visitorManagement.inviteName', 'Invite')} {selectedVisitor.name}</Text></div>
                        <div className="mb-4 text-sm"><Text type="secondary">{t('visitorManagement.date', 'Date')}:</Text> {selectedVisitor.slot}</div>
                        <div className="mb-4 text-sm"><Text type="secondary">{t('visitorManagement.type', 'Type')}:</Text> {selectedVisitor.type}</div>
                        <div className="text-sm"><Text type="secondary">{t('visitorManagement.locations', 'Locations')}:</Text> {selectedVisitor.accessScope}</div>
                      </Col>
                      <Col xs={24} md={10}>
                        <div className="text-center">
                          <div className="mb-8 text-sm font-medium">{t('visitorManagement.qrTitle', 'QR Access')}</div>
                          <div className="visitor-mgmt-qr-wrap">
                            <img src="/qr-access.png" alt={t('visitorManagement.qrTitle', 'QR Access')} className="visitor-mgmt-qr-img" />
                          </div>
                          <div className="visitor-mgmt-qr-code">{selectedVisitor.qrCode}</div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}
                {detailTab === 'credentials' && (
                  <div className="mt-12 py-12 text-secondary">{t('visitorManagement.credentialsRoles', 'Credentials & Roles')} – {t('common.noData')}</div>
                )}
                {detailTab === 'accessHistory' && (
                  <div className="mt-12 py-12 text-secondary">{t('visitorManagement.accessHistory', 'Access History')} – {t('common.noData')}</div>
                )}
              </ContentCard>
            ) : (
              <ContentCard className="visitor-mgmt-empty-card"><div className="py-24 text-center">{t('visitorManagement.selectVisitor', 'Select a visitor')}</div></ContentCard>
            )}
          </div>
        </div>
      )}

      {activeTab === 'prebookings' && (
        <ContentCard>
          <div className="py-16 text-secondary text-center">{t('visitorManagement.preBookings', 'Pre-Bookings')} – {t('common.noData')}</div>
        </ContentCard>
      )}

      {activeTab === 'invite' && (
        <ContentCard>
          <div className="text-center py-24 visitor-mgmt-invite-cta">
            <Button type="primary" size="large" icon={<PlusOutlined />}>{t('visitorManagement.inviteVisitor', 'Invite Visitor')}</Button>
          </div>
        </ContentCard>
      )}
    </PageContainer>
  )
}
