import { useState } from 'react'
import {
  Row, Col, Tag, Typography, Space, Button, Slider, Switch, Descriptions,
  Timeline, Statistic, Divider,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftOutlined, TeamOutlined, ClockCircleOutlined, EnvironmentOutlined,
  ThunderboltOutlined, CloudOutlined, SoundOutlined, BulbOutlined,
  PoweroffOutlined, DesktopOutlined, VideoCameraOutlined, ExperimentOutlined,
  ToolOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FieldTimeOutlined, FileTextOutlined,
  ExpandOutlined, StopOutlined, ControlOutlined, WifiOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { PageContainer, ContentCard } from '@/components'

const { Title, Text } = Typography

interface DeviceStatus { name: string; status: 'online' | 'offline'; icon: React.ReactNode }

const mockRoom = {
  id: 'A-1201', floor: '12', capacity: 10, status: 'in-use' as const,
  equipment: ['TV', 'VC', 'Whiteboard', 'Sensors'],
  occupancy: 7, lastUpdate: '3s',
  temp: 24, humidity: 55, co2: 900, noise: 48, energy: 1.2,
  doorClosed: true, motionActive: true,
  booking: { time: '09:30–10:30', title: 'Weekly Sync', host: 'An' },
}

const mockDevices: DeviceStatus[] = [
  { name: 'HVAC', status: 'online', icon: <ThunderboltOutlined /> },
  { name: 'Lights', status: 'online', icon: <BulbOutlined /> },
  { name: 'Curtain', status: 'online', icon: <CloudOutlined /> },
  { name: 'VC', status: 'offline', icon: <VideoCameraOutlined /> },
]

const mockTimeline = [
  { time: '09:20', event: 'wsDetail.evPreCool', color: 'blue' },
  { time: '09:29', event: 'wsDetail.evCheckIn', color: 'green' },
  { time: '09:31', event: 'wsDetail.evSceneMeeting', color: 'blue' },
  { time: '09:45', event: 'wsDetail.evVcOffline', color: 'red' },
  { time: '09:46', event: 'wsDetail.evTicketCreated', color: 'orange' },
]

const sceneButtons = [
  { key: 'meeting', label: 'wsDetail.sceneMeeting', icon: <TeamOutlined /> },
  { key: 'presentation', label: 'wsDetail.scenePresentation', icon: <DesktopOutlined /> },
  { key: 'videocall', label: 'wsDetail.sceneVideoCall', icon: <VideoCameraOutlined /> },
  { key: 'brainstorm', label: 'wsDetail.sceneBrainstorm', icon: <ExperimentOutlined /> },
]

export default function WorkspaceRoomDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeScene, setActiveScene] = useState('meeting')
  const [lightLevel, setLightLevel] = useState(65)
  const [acTemp, setAcTemp] = useState(24)
  const [tvOn, setTvOn] = useState(true)
  const [_vcOn, _setVcOn] = useState(false)
  const [volume, setVolume] = useState(40)
  const [outletOn, setOutletOn] = useState(true)
  const [curtainOpen, setCurtainOpen] = useState(false)

  const co2Color = mockRoom.co2 < 600 ? '#52c41a' : mockRoom.co2 < 800 ? '#faad14' : '#ff4d4f'

  return (
    <PageContainer>
      {/* Header */}
      <ContentCard className="workspace_filter-mb">
        <div className="workspace_header-row">
          <div>
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />
              <Title level={4} className="workspace_title-m0">{t('wsDetail.room')} {mockRoom.id}</Title>
              <Tag color="blue" className="workspace_tag-radius-12">{t('wsDetail.statusInUse')}</Tag>
            </Space>
            <div className="workspace_meta-mt">
              <Space size={16} wrap>
                <Text type="secondary"><EnvironmentOutlined className="workspace_icon-mr-4" />{t('wsDetail.floor')} {mockRoom.floor}</Text>
                <Text type="secondary"><TeamOutlined className="workspace_icon-mr-4" />{t('wsDetail.capacity')} {mockRoom.capacity}</Text>
                <Text type="secondary">{t('wsDetail.equip')}: {mockRoom.equipment.join(', ')}</Text>
              </Space>
            </div>
            <div className="workspace_meta-mt-4">
              <Space size={16}>
                <Text><TeamOutlined className="text-primary workspace_icon-mr-4" />{t('wsDetail.occupancy')}: <Text strong>{mockRoom.occupancy}</Text> {t('wsDetail.pplSensor')}</Text>
                <Text type="secondary"><ClockCircleOutlined className="workspace_icon-mr-4" />{t('wsDetail.lastUpdate')}: {mockRoom.lastUpdate}</Text>
              </Space>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Live Metrics + Current Booking */}
      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} lg={14}>
          <ContentCard title={t('wsDetail.liveMetrics')} titleIcon={<ExperimentOutlined />} className="workspace_card-h-full">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('wsDetail.temp')} value={mockRoom.temp} suffix="°C" valueStyle={{ fontSize: 22 }} prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />} />
              </Col>
              <Col span={8}>
                <Statistic title={t('wsDetail.humidity')} value={mockRoom.humidity} suffix="%" valueStyle={{ fontSize: 22 }} prefix={<CloudOutlined style={{ color: '#1890ff' }} />} />
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary" className="text-sm">CO₂</Text>
                  <div className="workspace_co2-row">
                    <Text strong className="text-2xl" style={{ color: co2Color }}>{mockRoom.co2}</Text>
                    <Text type="secondary">ppm</Text>
                    <WarningOutlined style={{ color: co2Color }} />
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <Statistic title={t('wsDetail.noise')} value={mockRoom.noise} suffix="dB" valueStyle={{ fontSize: 18, color: '#595959' }} prefix={<SoundOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title={t('wsDetail.energy')} value={mockRoom.energy} suffix="kWh" valueStyle={{ fontSize: 18, color: '#595959' }} prefix={<ThunderboltOutlined />} />
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary" className="text-sm">{t('wsDetail.doorMotion')}</Text>
                  <div className="mt-4">
                    <Tag color={mockRoom.doorClosed ? 'green' : 'red'}>{t('wsDetail.door')}: {mockRoom.doorClosed ? t('wsDetail.closed') : t('wsDetail.open')}</Tag>
                    <Tag color={mockRoom.motionActive ? 'blue' : 'default'}>{t('wsDetail.motion')}: {mockRoom.motionActive ? t('wsDetail.active') : t('wsDetail.inactive')}</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>
        <Col xs={24} lg={10}>
          <ContentCard title={t('wsDetail.currentBooking')} titleIcon={<ClockCircleOutlined />} titleIconColor="#52c41a" className="workspace_card-h-full workspace_booking-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('wsDetail.time')}><Text strong>{mockRoom.booking.time}</Text></Descriptions.Item>
              <Descriptions.Item label={t('wsDetail.title')}>{mockRoom.booking.title}</Descriptions.Item>
              <Descriptions.Item label={t('wsDetail.host')}>{mockRoom.booking.host}</Descriptions.Item>
            </Descriptions>
            <Divider className="workspace_divider-my" />
            <Space>
              <Button type="primary" ghost icon={<ExpandOutlined />}>{t('wsDetail.extend')}</Button>
              <Button danger icon={<StopOutlined />}>{t('wsDetail.endNow')}</Button>
            </Space>
          </ContentCard>
        </Col>
      </Row>

      {/* Scenes & Controls */}
      <ContentCard title={t('wsDetail.scenesControls')} titleIcon={<ControlOutlined />} titleIconColor="#722ed1" className="workspace_filter-mb">
        {/* Scene Buttons */}
        <div className="workspace_scenes-mb">
          <Text type="secondary" className="workspace_scenes-label">{t('wsDetail.scenes')}:</Text>
          <Space wrap>
            {sceneButtons.map(s => (
              <Button key={s.key} type={activeScene === s.key ? 'primary' : 'default'} icon={s.icon}
                onClick={() => setActiveScene(s.key)}
                className={activeScene !== s.key ? 'workspace_btn-border-default' : undefined}>
                {t(s.label)}
              </Button>
            ))}
          </Space>
        </div>

        {/* Controls Grid */}
        <Row gutter={[24, 20]}>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('wsDetail.light')}</Text>
            <Slider value={lightLevel} onChange={setLightLevel} min={0} max={100} tooltip={{ formatter: (v) => `${v}%` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('wsDetail.acTemp')}</Text>
            <Slider value={acTemp} onChange={setAcTemp} min={16} max={30} marks={{ 16: '16°', 24: '24°', 30: '30°' }} tooltip={{ formatter: (v) => `${v}°C` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('wsDetail.curtain')}</Text>
            <div className="mt-8">
              <Space>
                <Button type={curtainOpen ? 'primary' : 'default'} onClick={() => setCurtainOpen(true)}>{t('wsDetail.open')}</Button>
                <Button type={!curtainOpen ? 'primary' : 'default'} onClick={() => setCurtainOpen(false)}>{t('wsDetail.close')}</Button>
              </Space>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="workspace_control-row">
              <Space><DesktopOutlined /><Text>TV/VC</Text></Space>
              <Switch checked={tvOn} onChange={setTvOn} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" className="text-sm">{t('wsDetail.volume')}</Text>
            <Slider value={volume} onChange={setVolume} min={0} max={100} />
          </Col>
          <Col xs={12} sm={6}>
            <div className="workspace_control-row">
              <Space><PoweroffOutlined /><Text>{t('wsDetail.outlet')}</Text></Space>
              <Switch checked={outletOn} onChange={setOutletOn} />
            </div>
          </Col>
        </Row>
      </ContentCard>

      {/* Device Health + Timeline */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ContentCard title={t('wsDetail.deviceHealth')} titleIcon={<WifiOutlined />} titleIconColor="#52c41a" className="workspace_card-h-full">
            <div className="workspace_device-tags">
              {mockDevices.map(d => (
                <Tag key={d.name}
                  icon={d.status === 'online' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={d.status === 'online' ? 'success' : 'error'}
                  className="workspace_device-tag">
                  <Space size={4}>
                    {d.icon}
                    <span>{d.name}: {d.status === 'online' ? 'Online' : 'Offline'}</span>
                    {d.status === 'offline' && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  </Space>
                </Tag>
              ))}
            </div>
            <Space>
              <Button icon={<ToolOutlined />} size="small">{t('wsDetail.runDiagnostic')}</Button>
              <Button icon={<FileTextOutlined />} size="small" type="primary" ghost>{t('wsDetail.createTicket')}</Button>
            </Space>
          </ContentCard>
        </Col>
        <Col xs={24} lg={12}>
          <ContentCard title={t('wsDetail.timeline')} titleIcon={<FieldTimeOutlined />} className="workspace_card-h-full">
            <Timeline
              items={mockTimeline.map(e => ({
                color: e.color,
                children: (
                  <div>
                    <Text strong className="workspace_timeline-time">{e.time}</Text>
                    <Text className="text-base">{t(e.event)}</Text>
                  </div>
                ),
              }))}
            />
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
