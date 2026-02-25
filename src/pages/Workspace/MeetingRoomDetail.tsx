import { useEffect, useState } from 'react'
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
  WarningOutlined, AudioOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageContainer, ContentCard } from '@/components'
import { getMeetingDetailControls, saveMeetingDetailControls } from '@/services/mockPersistence'

const { Title, Text } = Typography

interface DeviceStatus { name: string; status: 'online' | 'offline'; icon: React.ReactNode }

const mockRoom = {
  id: 'Phòng họp lớn A', building: 'Tòa A', floor: '5', capacity: 20, status: 'in-use' as const,
  equipment: ['Projector', 'VC System', 'Whiteboard', 'Audio', 'Sensors'],
  occupancy: 12, lastUpdate: '5s',
  temp: 23, humidity: 52, co2: 750, noise: 42, energy: 2.4,
  doorClosed: true, motionActive: true,
  booking: { time: '10:00–11:30', title: 'Sprint Planning Q2', host: 'Minh Tuấn' },
}

const mockDevices: DeviceStatus[] = [
  { name: 'HVAC', status: 'online', icon: <ThunderboltOutlined /> },
  { name: 'Projector', status: 'online', icon: <DesktopOutlined /> },
  { name: 'Audio System', status: 'online', icon: <AudioOutlined /> },
  { name: 'VC Camera', status: 'offline', icon: <VideoCameraOutlined /> },
  { name: 'Lights', status: 'online', icon: <BulbOutlined /> },
]

const mockTimeline = [
  { time: '09:50', event: 'meeting.evPreCool', color: 'blue' },
  { time: '09:58', event: 'meeting.evCheckIn', color: 'green' },
  { time: '10:02', event: 'meeting.evSceneMeeting', color: 'blue' },
  { time: '10:15', event: 'meeting.evProjectorOn', color: 'green' },
  { time: '10:30', event: 'meeting.evVcCameraOffline', color: 'red' },
  { time: '10:31', event: 'meeting.evTicketCreated', color: 'orange' },
]

const sceneButtons = [
  { key: 'meeting', label: 'meeting.sceneMeeting', icon: <TeamOutlined /> },
  { key: 'presentation', label: 'meeting.scenePresentation', icon: <DesktopOutlined /> },
  { key: 'videocall', label: 'meeting.sceneVideoCall', icon: <VideoCameraOutlined /> },
  { key: 'brainstorm', label: 'meeting.sceneBrainstorm', icon: <ExperimentOutlined /> },
]

export default function MeetingRoomDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const initialControls = getMeetingDetailControls({
    activeScene: 'meeting',
    lightLevel: 70,
    acTemp: 23,
    tvOn: false,
    projectorOn: true,
    audioOn: true,
    volume: 55,
  })
  const [activeScene, setActiveScene] = useState(initialControls.activeScene)
  const [lightLevel, setLightLevel] = useState(initialControls.lightLevel)
  const [acTemp, setAcTemp] = useState(initialControls.acTemp)
  const [tvOn, setTvOn] = useState(initialControls.tvOn)
  const [projectorOn, setProjectorOn] = useState(initialControls.projectorOn)
  const [audioOn, setAudioOn] = useState(initialControls.audioOn)
  const [volume, setVolume] = useState(initialControls.volume)

  const co2Color = mockRoom.co2 < 600 ? '#52c41a' : mockRoom.co2 < 800 ? '#faad14' : '#ff4d4f'

  useEffect(() => {
    saveMeetingDetailControls({
      activeScene,
      lightLevel,
      acTemp,
      tvOn,
      projectorOn,
      audioOn,
      volume,
    })
  }, [activeScene, lightLevel, acTemp, tvOn, projectorOn, audioOn, volume])

  return (
    <PageContainer>
      {/* Header */}
      <ContentCard className="workspace_filter-mb">
        <div className="workspace_header-row">
          <div>
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />
              <Title level={4} className="workspace_title-m0">{mockRoom.id}</Title>
              <Tag color="blue" className="workspace_tag-radius-12">{t('meeting.statusInUse')}</Tag>
            </Space>
            <div className="workspace_meta-mt">
              <Space size={16} wrap>
                <Text type="secondary"><EnvironmentOutlined className="workspace_icon-mr-4" />{mockRoom.building} – {t('meeting.floor')} {mockRoom.floor}</Text>
                <Text type="secondary"><TeamOutlined className="workspace_icon-mr-4" />{t('meeting.capacity')} {mockRoom.capacity}</Text>
                <Text type="secondary">{t('meeting.equip')}: {mockRoom.equipment.join(', ')}</Text>
              </Space>
            </div>
            <div className="workspace_meta-mt-4">
              <Space size={16}>
                <Text><TeamOutlined className="text-primary workspace_icon-mr-4" />{t('meeting.occupancy')}: <Text strong>{mockRoom.occupancy}</Text> {t('meeting.pplSensor')}</Text>
                <Text type="secondary"><ClockCircleOutlined className="workspace_icon-mr-4" />{t('meeting.lastUpdate')}: {mockRoom.lastUpdate}</Text>
              </Space>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Live Metrics + Current Booking */}
      <Row gutter={[16, 16]} className="mb-16">
        <Col xs={24} lg={14}>
          <ContentCard title={t('meeting.liveMetrics')} titleIcon={<ExperimentOutlined />} className="workspace_card-h-full">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('meeting.temp')} value={mockRoom.temp} suffix="°C" valueStyle={{ fontSize: 22 }} prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />} />
              </Col>
              <Col span={8}>
                <Statistic title={t('meeting.humidity')} value={mockRoom.humidity} suffix="%" valueStyle={{ fontSize: 22 }} prefix={<CloudOutlined style={{ color: '#1890ff' }} />} />
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
                <Statistic title={t('meeting.noise')} value={mockRoom.noise} suffix="dB" valueStyle={{ fontSize: 18, color: '#595959' }} prefix={<SoundOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title={t('meeting.energy')} value={mockRoom.energy} suffix="kWh" valueStyle={{ fontSize: 18, color: '#595959' }} prefix={<ThunderboltOutlined />} />
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary" className="text-sm">{t('meeting.doorMotion')}</Text>
                  <div className="mt-4">
                    <Tag color={mockRoom.doorClosed ? 'green' : 'red'}>{t('meeting.door')}: {mockRoom.doorClosed ? t('meeting.closed') : t('meeting.open')}</Tag>
                    <Tag color={mockRoom.motionActive ? 'blue' : 'default'}>{t('meeting.motion')}: {mockRoom.motionActive ? t('meeting.active') : t('meeting.inactive')}</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </ContentCard>
        </Col>
        <Col xs={24} lg={10}>
          <ContentCard title={t('meeting.currentBooking')} titleIcon={<ClockCircleOutlined />} titleIconColor="#52c41a" className="workspace_card-h-full workspace_booking-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('meeting.time')}><Text strong>{mockRoom.booking.time}</Text></Descriptions.Item>
              <Descriptions.Item label={t('meeting.title')}>{mockRoom.booking.title}</Descriptions.Item>
              <Descriptions.Item label={t('meeting.organizer')}>{mockRoom.booking.host}</Descriptions.Item>
            </Descriptions>
            <Divider className="workspace_divider-my" />
            <Space>
              <Button type="primary" ghost icon={<ExpandOutlined />}>{t('meeting.extend')}</Button>
              <Button danger icon={<StopOutlined />}>{t('meeting.endNow')}</Button>
            </Space>
          </ContentCard>
        </Col>
      </Row>

      {/* Scenes & Controls */}
      <ContentCard title={t('meeting.scenesControls')} titleIcon={<ControlOutlined />} titleIconColor="#722ed1" className="workspace_filter-mb">
        <div className="workspace_scenes-mb">
          <Text type="secondary" className="workspace_scenes-label">{t('meeting.scenes')}:</Text>
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

        <Row gutter={[24, 20]}>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('meeting.light')}</Text>
            <Slider value={lightLevel} onChange={setLightLevel} min={0} max={100} tooltip={{ formatter: (v) => `${v}%` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('meeting.acTemp')}</Text>
            <Slider value={acTemp} onChange={setAcTemp} min={16} max={30} marks={{ 16: '16°', 24: '24°', 30: '30°' }} tooltip={{ formatter: (v) => `${v}°C` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" className="text-sm">{t('meeting.volume')}</Text>
            <Slider value={volume} onChange={setVolume} min={0} max={100} tooltip={{ formatter: (v) => `${v}%` }} />
          </Col>
          <Col xs={12} sm={6}>
            <div className="workspace_control-row">
              <Space><DesktopOutlined /><Text>TV</Text></Space>
              <Switch checked={tvOn} onChange={setTvOn} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="workspace_control-row">
              <Space><DesktopOutlined /><Text>{t('meeting.projector')}</Text></Space>
              <Switch checked={projectorOn} onChange={setProjectorOn} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="workspace_control-row">
              <Space><AudioOutlined /><Text>{t('meeting.audio')}</Text></Space>
              <Switch checked={audioOn} onChange={setAudioOn} />
            </div>
          </Col>
        </Row>
      </ContentCard>

      {/* Device Health + Timeline */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ContentCard title={t('meeting.deviceHealth')} titleIcon={<WifiOutlined />} titleIconColor="#52c41a" className="workspace_card-h-full">
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
              <Button icon={<ToolOutlined />} size="small">{t('meeting.runDiagnostic')}</Button>
              <Button icon={<FileTextOutlined />} size="small" type="primary" ghost>{t('meeting.createTicket')}</Button>
            </Space>
          </ContentCard>
        </Col>
        <Col xs={24} lg={12}>
          <ContentCard title={t('meeting.timeline')} titleIcon={<FieldTimeOutlined />} className="workspace_card-h-full">
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
