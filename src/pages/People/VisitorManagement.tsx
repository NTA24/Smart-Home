import { useState } from 'react'
import { Tabs, Input, Button, Card, Row, Col, Avatar, Typography, Space, List, Badge, Modal, Form, message } from 'antd'
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
} from '@ant-design/icons'
import { PageContainer, ContentCard } from '@/components'

const { Text } = Typography

const FACE_IMAGES = [
  '/security-faces/stored-face-1.png',
  '/security-faces/stored-face-2.png',
  '/security-faces/stored-face-3.png',
  '/security-faces/stored-face-4.png',
  '/security-faces/stored-face-5.png',
  '/security-faces/stored-face-6.png',
  '/security-faces/stored-face-7.png',
]

const TODAY_VISITORS_RAW = [
  { key: '1', name: 'Ông Dũng Nguyễn', email: 'nguyendung@company.com', visitTime: '20/04 10:12:00', hostUnit: 'Trần Linh (ABC)', accessScope: 'Sảnh, Tầng 15', slot: '25/04, 20:46 - 21:00', type: 'Đến trong ngày', qrCode: 'QRX2345', status: 'CHECKEDIN' },
  { key: '2', name: 'Ms. Ngọc Trần', email: 'ngoctran@mail.com', visitTime: '20/04 09:30:00', hostUnit: 'Căn A-1201', accessScope: 'Sảnh, Tầng 12', slot: '20/04 14:00-16:00', type: 'Đặt trước', qrCode: 'QRX2346', status: 'PENDING' },
  { key: '3', name: 'Giao hàng GHN', email: '-', visitTime: '20/04 10:00:00', hostUnit: 'Căn B-0302', accessScope: 'Chỉ sảnh', slot: '10:00-10:30', type: 'Một lần', qrCode: 'QRX2347', status: 'CHECKOUT' },
]

const TODAY_VISITORS = TODAY_VISITORS_RAW.map((v, i) => ({
  ...v,
  face: FACE_IMAGES[Number(v.key) % FACE_IMAGES.length] ?? FACE_IMAGES[i % FACE_IMAGES.length],
}))

export default function VisitorManagement() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('today')
  const [detailTab, setDetailTab] = useState('profiles')
  const [selectedVisitor, setSelectedVisitor] = useState<typeof TODAY_VISITORS[0] | null>(TODAY_VISITORS[0])
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
                  className={`cursor-pointer ${selectedVisitor?.key === item.key ? 'visitor-mgmt-item-active' : ''}`}
                  onClick={() => setSelectedVisitor(item)}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={40} src={item.face} icon={<UserOutlined />} />}
                    title={item.name}
                    description={item.visitTime}
                  />
                </List.Item>
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            {selectedVisitor ? (
              <ContentCard className="visitor-mgmt-detail-card">
                <div className="flex flex-wrap items-start gap-12 visitor-mgmt-profile-row">
                  <Avatar size={64} src={selectedVisitor.face} icon={<UserOutlined />} />
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
