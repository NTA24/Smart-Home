import { useState } from 'react'
import { Tabs, Input, Button, Card, Row, Col, Avatar, Typography, Space, List, Badge, Modal, Form, message, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  BellOutlined,
  CloudOutlined,
  MailOutlined,
  FolderOutlined,
  UserOutlined,
  CopyOutlined,
  PlusOutlined,
  DownOutlined,
  SettingOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { PageContainer, ContentCard } from '@/components'
import { getVisitorsFromAccessLogs, type VisitorFromLog } from './accessLogData'

const { Text } = Typography

/** Dữ liệu khách ra vào lấy từ nhật ký (Access Logs). */
const TODAY_VISITORS = getVisitorsFromAccessLogs()

export default function VisitorManagement() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('today')
  const [detailTab, setDetailTab] = useState('profiles')
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorFromLog | null>(TODAY_VISITORS[0])
  const [search, setSearch] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const filteredToday = TODAY_VISITORS.filter(
    (v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenInvite = () => setInviteModalOpen(true)
  const handleCloseInvite = () => {
    setInviteModalOpen(false)
    form.resetFields()
  }
  const handleInviteSubmit = () => {
    form.validateFields().then(() => {
      const values = form.getFieldsValue()
      console.log('Invite submitted', values)
      setInviteModalOpen(false)
      form.resetFields()
      message.success(t('visitorManagement.inviteSuccess', 'Đã gửi lời mời thành công'))
    }).catch(() => {})
  }

  return (
    <PageContainer className="visitor-mgmt-page">
      <div className="visitor-mgmt-header flex items-center justify-between">
        <h1>{t('visitorManagement.title', 'Visitor Management')}</h1>
        <Space size="middle">
          <Badge count={5} size="small">
            <Button type="text" icon={<BellOutlined />} onClick={() => message.info(t('visitorManagement.notifications', 'Thông báo'))} />
          </Badge>
          <Badge count={5} size="small">
            <Button type="text" icon={<CloudOutlined />} onClick={() => message.info(t('visitorManagement.cloudSync', 'Đồng bộ đám mây'))} />
          </Badge>
          <Button type="text" icon={<MailOutlined />} onClick={() => message.info(t('visitorManagement.messages', 'Tin nhắn'))} />
          <Button type="text" icon={<FolderOutlined />} onClick={() => message.info(t('visitorManagement.files', 'Tài liệu'))} />
          <Avatar size="small" icon={<UserOutlined />} className="cursor-pointer" />
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
                  className={`cursor-pointer ${selectedVisitor?.key === item.key ? 'visitor-mgmt-item-active' : ''} ${item.isVip ? 'visitor-mgmt-item-vip' : ''}`}
                  onClick={() => setSelectedVisitor(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="access-logs-avatar-wrap">
                        <Avatar size={40} src={item.face} icon={<UserOutlined />} />
                        {item.isVip && (
                          <span className="access-logs-avatar-crown access-logs-avatar-crown--lg">
                            <CrownOutlined />
                          </span>
                        )}
                      </div>
                    }
                    title={<span>{item.isVip && <CrownOutlined className="text-amber-500 mr-1" />}{item.name}</span>}
                    description={item.visitTime}
                  />
                </List.Item>
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            {selectedVisitor ? (
              <ContentCard className={`visitor-mgmt-detail-card ${selectedVisitor.isVip ? 'visitor-mgmt-detail-card-vip' : ''}`}>
                <div className="flex flex-wrap items-start gap-12 visitor-mgmt-profile-row">
                  <div className="access-logs-avatar-wrap">
                    <Avatar size={64} src={selectedVisitor.face} icon={<UserOutlined />} />
                    {selectedVisitor.isVip && (
                      <span className="access-logs-avatar-crown access-logs-avatar-crown--xl">
                        <CrownOutlined />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="visitor-mgmt-name flex items-center gap-8 flex-wrap">
                      {selectedVisitor.name}
                      {selectedVisitor.isVip && (
                        <Tag color="gold" icon={<CrownOutlined />}>VIP</Tag>
                      )}
                    </div>
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
                      <Text type="secondary" className="text-xs">{t('visitorManagement.verified', 'Đã xác thực')}</Text>
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
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleOpenInvite}>{t('visitorManagement.inviteVisitor', 'Invite Visitor')}</Button>
          </div>
        </ContentCard>
      )}

      <Modal
        title={t('visitorManagement.inviteVisitor', 'Mời khách')}
        open={inviteModalOpen}
        onCancel={handleCloseInvite}
        onOk={handleInviteSubmit}
        okText={t('visitorManagement.sendInvite', 'Gửi lời mời')}
        cancelText={t('common.cancel', 'Hủy')}
        width={480}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-16">
          <Form.Item name="name" label={t('visitorManagement.inviteName', 'Họ tên khách')} rules={[{ required: true, message: t('common.required', 'Bắt buộc') }]}>
            <Input placeholder={t('visitorManagement.inviteNamePlaceholder', 'Nhập họ tên')} />
          </Form.Item>
          <Form.Item name="email" label={t('common.email', 'Email')} rules={[{ required: true, type: 'email', message: t('common.invalidEmail', 'Email không hợp lệ') }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="hostUnit" label={t('visitorManagement.hostUnit', 'Đơn vị chủ nhà')} rules={[{ required: true }]}>
            <Input placeholder={t('visitorManagement.hostUnitPlaceholder', 'Căn / Phòng')} />
          </Form.Item>
          <Form.Item name="slot" label={t('visitorManagement.slot', 'Thời gian')} rules={[{ required: true }]}>
            <Input placeholder={t('visitorManagement.slotPlaceholder', 'VD: 20/04 14:00-16:00')} />
          </Form.Item>
          <Form.Item name="accessScope" label={t('visitorManagement.accessScope', 'Phạm vi ra vào')}>
            <Input placeholder={t('visitorManagement.accessScopePlaceholder', 'Sảnh, Tầng 12')} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
