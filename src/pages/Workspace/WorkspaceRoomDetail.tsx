import { useState } from 'react'
import {
  Card, Row, Col, Tag, Typography, Space, Button, Slider, Switch, Descriptions, Badge,
  Timeline, Tooltip, Segmented, Statistic, Divider,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftOutlined, TeamOutlined, ClockCircleOutlined, EnvironmentOutlined,
  ThunderboltOutlined, CloudOutlined, SoundOutlined, BulbOutlined,
  PoweroffOutlined, DesktopOutlined, VideoCameraOutlined, ExperimentOutlined,
  ToolOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined,
  FieldTimeOutlined, WarningOutlined, FileTextOutlined, EyeOutlined,
  ExpandOutlined, StopOutlined, ControlOutlined, WifiOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

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
  const [vcOn, setVcOn] = useState(false)
  const [volume, setVolume] = useState(40)
  const [outletOn, setOutletOn] = useState(true)
  const [curtainOpen, setCurtainOpen] = useState(false)

  const co2Color = mockRoom.co2 < 600 ? '#52c41a' : mockRoom.co2 < 800 ? '#faad14' : '#ff4d4f'

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Space size={12} align="center">
              <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />
              <Title level={4} style={{ margin: 0 }}>{t('wsDetail.room')} {mockRoom.id}</Title>
              <Tag color="blue" style={{ borderRadius: 12 }}>{t('wsDetail.statusInUse')}</Tag>
            </Space>
            <div style={{ marginTop: 8, marginLeft: 40 }}>
              <Space size={16} wrap>
                <Text type="secondary"><EnvironmentOutlined style={{ marginRight: 4 }} />{t('wsDetail.floor')} {mockRoom.floor}</Text>
                <Text type="secondary"><TeamOutlined style={{ marginRight: 4 }} />{t('wsDetail.capacity')} {mockRoom.capacity}</Text>
                <Text type="secondary">{t('wsDetail.equip')}: {mockRoom.equipment.join(', ')}</Text>
              </Space>
            </div>
            <div style={{ marginTop: 4, marginLeft: 40 }}>
              <Space size={16}>
                <Text><TeamOutlined style={{ color: '#1890ff', marginRight: 4 }} />{t('wsDetail.occupancy')}: <Text strong>{mockRoom.occupancy}</Text> {t('wsDetail.pplSensor')}</Text>
                <Text type="secondary"><ClockCircleOutlined style={{ marginRight: 4 }} />{t('wsDetail.lastUpdate')}: {mockRoom.lastUpdate}</Text>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* Live Metrics + Current Booking */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={<span><ExperimentOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsDetail.liveMetrics')}</span>}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title={t('wsDetail.temp')} value={mockRoom.temp} suffix="°C" valueStyle={{ fontSize: 22 }} prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />} />
              </Col>
              <Col span={8}>
                <Statistic title={t('wsDetail.humidity')} value={mockRoom.humidity} suffix="%" valueStyle={{ fontSize: 22 }} prefix={<CloudOutlined style={{ color: '#1890ff' }} />} />
              </Col>
              <Col span={8}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>CO₂</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text strong style={{ fontSize: 22, color: co2Color }}>{mockRoom.co2}</Text>
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
                  <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDetail.doorMotion')}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={mockRoom.doorClosed ? 'green' : 'red'}>{t('wsDetail.door')}: {mockRoom.doorClosed ? t('wsDetail.closed') : t('wsDetail.open')}</Tag>
                    <Tag color={mockRoom.motionActive ? 'blue' : 'default'}>{t('wsDetail.motion')}: {mockRoom.motionActive ? t('wsDetail.active') : t('wsDetail.inactive')}</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%', background: '#f6ffed', borderColor: '#b7eb8f' }}
            title={<span><ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{t('wsDetail.currentBooking')}</span>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={t('wsDetail.time')}><Text strong>{mockRoom.booking.time}</Text></Descriptions.Item>
              <Descriptions.Item label={t('wsDetail.title')}>{mockRoom.booking.title}</Descriptions.Item>
              <Descriptions.Item label={t('wsDetail.host')}>{mockRoom.booking.host}</Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              <Button type="primary" ghost icon={<ExpandOutlined />}>{t('wsDetail.extend')}</Button>
              <Button danger icon={<StopOutlined />}>{t('wsDetail.endNow')}</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Scenes & Controls */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}
        title={<span><ControlOutlined style={{ color: '#722ed1', marginRight: 8 }} />{t('wsDetail.scenesControls')}</span>}>
        {/* Scene Buttons */}
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>{t('wsDetail.scenes')}:</Text>
          <Space wrap>
            {sceneButtons.map(s => (
              <Button key={s.key} type={activeScene === s.key ? 'primary' : 'default'} icon={s.icon}
                onClick={() => setActiveScene(s.key)}
                style={activeScene === s.key ? {} : { borderColor: '#d9d9d9' }}>
                {t(s.label)}
              </Button>
            ))}
          </Space>
        </div>

        {/* Controls Grid */}
        <Row gutter={[24, 20]}>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDetail.light')}</Text>
            <Slider value={lightLevel} onChange={setLightLevel} min={0} max={100} tooltip={{ formatter: (v) => `${v}%` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDetail.acTemp')}</Text>
            <Slider value={acTemp} onChange={setAcTemp} min={16} max={30} marks={{ 16: '16°', 24: '24°', 30: '30°' }} tooltip={{ formatter: (v) => `${v}°C` }} />
          </Col>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDetail.curtain')}</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button type={curtainOpen ? 'primary' : 'default'} onClick={() => setCurtainOpen(true)}>{t('wsDetail.open')}</Button>
                <Button type={!curtainOpen ? 'primary' : 'default'} onClick={() => setCurtainOpen(false)}>{t('wsDetail.close')}</Button>
              </Space>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space><DesktopOutlined /><Text>TV/VC</Text></Space>
              <Switch checked={tvOn} onChange={setTvOn} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('wsDetail.volume')}</Text>
            <Slider value={volume} onChange={setVolume} min={0} max={100} size="small" />
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space><PoweroffOutlined /><Text>{t('wsDetail.outlet')}</Text></Space>
              <Switch checked={outletOn} onChange={setOutletOn} />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Device Health + Timeline */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={<span><WifiOutlined style={{ color: '#52c41a', marginRight: 8 }} />{t('wsDetail.deviceHealth')}</span>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {mockDevices.map(d => (
                <Tag key={d.name}
                  icon={d.status === 'online' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={d.status === 'online' ? 'success' : 'error'}
                  style={{ padding: '6px 12px', fontSize: 13, borderRadius: 8 }}>
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
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
            title={<span><FieldTimeOutlined style={{ color: '#1890ff', marginRight: 8 }} />{t('wsDetail.timeline')}</span>}>
            <Timeline
              items={mockTimeline.map(e => ({
                color: e.color,
                children: (
                  <div>
                    <Text strong style={{ marginRight: 8, fontSize: 12 }}>{e.time}</Text>
                    <Text style={{ fontSize: 13 }}>{t(e.event)}</Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
