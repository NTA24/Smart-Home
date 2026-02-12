import { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  Tag,
  Button,
  Tooltip,
  DatePicker,
  Slider,
  Timeline,
  Empty,
  Badge,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  DownloadOutlined,
  ScissorOutlined,
  FullscreenOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

// ─── Mock Data ──────────────────────────────────────────────
interface Camera {
  id: string
  name: string
  location: string
  floor: string
}

const cameras: Camera[] = [
  { id: 'CAM-01', name: 'Lobby Main Entrance', location: 'Lobby A', floor: '1F' },
  { id: 'CAM-02', name: 'Parking Gate A', location: 'Parking', floor: 'B1' },
  { id: 'CAM-03', name: 'Elevator Hall 1F', location: 'Elevator', floor: '1F' },
  { id: 'CAM-04', name: 'Office Floor 3', location: 'Office', floor: '3F' },
  { id: 'CAM-05', name: 'Rooftop', location: 'Rooftop', floor: 'RF' },
  { id: 'CAM-06', name: 'Server Room', location: 'Server', floor: 'B1' },
  { id: 'CAM-07', name: 'Parking Gate B', location: 'Parking', floor: 'B1' },
  { id: 'CAM-08', name: 'Meeting Room 5F', location: 'Meeting', floor: '5F' },
  { id: 'CAM-09', name: 'Fire Escape Stair', location: 'Stairwell', floor: '2F' },
  { id: 'CAM-10', name: 'Loading Dock', location: 'Dock', floor: '1F' },
]

interface PlaybackEvent {
  time: string
  type: 'motion' | 'alert' | 'person' | 'vehicle'
  description: string
}

const mockEvents: PlaybackEvent[] = [
  { time: '08:15:32', type: 'person', description: 'Person detected at entrance' },
  { time: '09:02:11', type: 'vehicle', description: 'Vehicle entered gate A' },
  { time: '09:45:08', type: 'motion', description: 'Motion detected in corridor' },
  { time: '10:12:45', type: 'alert', description: 'Unauthorized access attempt' },
  { time: '10:30:22', type: 'person', description: 'Group of 5 entered lobby' },
  { time: '11:05:17', type: 'vehicle', description: 'Vehicle exited gate A' },
  { time: '11:48:33', type: 'motion', description: 'Motion in restricted area' },
  { time: '12:15:09', type: 'alert', description: 'Door held open too long' },
]

const eventConfig = {
  motion: { color: '#faad14', tagColor: 'warning' },
  alert: { color: '#ff4d4f', tagColor: 'error' },
  person: { color: '#1890ff', tagColor: 'processing' },
  vehicle: { color: '#52c41a', tagColor: 'success' },
}

// ─── Main Component ─────────────────────────────────────────
export default function CameraPlayback() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [selectedCamera, setSelectedCamera] = useState(cameras[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(42) // percentage of timeline

  const currentCam = cameras.find(c => c.id === selectedCamera) || cameras[0]

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined />
            {t('cameraPlayback.title', 'Playback')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('cameraPlayback.allSites', 'All sites')} — {t('cameraPlayback.reviewRecordings', 'Review camera recordings')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Select
            value={selectedCamera}
            style={{ width: 200 }}
            size="small"
            onChange={setSelectedCamera}
            options={cameras.map(c => ({
              value: c.id,
              label: `${c.id} - ${c.name}`,
            }))}
          />
          <DatePicker size="small" style={{ width: 140 }} />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Main Playback Area */}
        <Col xs={24} lg={17}>
          {/* Video Player */}
          <Card
            size="small"
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}
          >
            {/* Video area */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 100%)',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                borderRadius: '14px 14px 0 0',
              }}
            >
              <VideoCameraOutlined style={{ fontSize: 60, color: 'rgba(255,255,255,0.1)' }} />

              {/* Camera info overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Tag
                  style={{
                    margin: 0,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {currentCam.id}
                </Tag>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                  {currentCam.name}
                </span>
              </div>

              {/* Timestamp overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  color: '#fff',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                2026-02-06 {`${8 + Math.floor(currentTime * 14 / 100)}`.padStart(2, '0')}:{`${Math.floor(Math.random() * 60)}`.padStart(2, '0')}:00
              </div>

              {/* Play button overlay */}
              {!isPlaying && (
                <div
                  onClick={() => setIsPlaying(true)}
                  style={{
                    position: 'absolute',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(24,144,255,0.7)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)' }}
                >
                  <PlayCircleOutlined style={{ fontSize: 32, color: '#fff' }} />
                </div>
              )}

              {/* Fullscreen button */}
              <Tooltip title={t('cameraPlayback.fullscreen', 'Fullscreen')}>
                <Button
                  size="small"
                  type="text"
                  icon={<FullscreenOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: 6,
                  }}
                />
              </Tooltip>
            </div>

            {/* Playback Controls */}
            <div style={{ padding: '12px 20px' }}>
              {/* Timeline slider */}
              <Slider
                value={currentTime}
                onChange={setCurrentTime}
                tooltip={{ formatter: (val) => `${8 + Math.floor((val || 0) * 14 / 100)}:00` }}
                styles={{
                  track: { background: '#1890ff' },
                }}
              />

              {/* Control buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tooltip title={t('cameraPlayback.backward', 'Backward 10s')}>
                    <Button size="small" icon={<FastBackwardOutlined />} type="text" />
                  </Tooltip>
                  <Tooltip title={t('cameraPlayback.prevFrame', 'Previous frame')}>
                    <Button size="small" icon={<StepBackwardOutlined />} type="text" />
                  </Tooltip>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ width: 40, height: 40 }}
                  />
                  <Tooltip title={t('cameraPlayback.nextFrame', 'Next frame')}>
                    <Button size="small" icon={<StepForwardOutlined />} type="text" />
                  </Tooltip>
                  <Tooltip title={t('cameraPlayback.forward', 'Forward 10s')}>
                    <Button size="small" icon={<FastForwardOutlined />} type="text" />
                  </Tooltip>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Speed selector */}
                  <Text type="secondary" style={{ fontSize: 11 }}>{t('cameraPlayback.speed', 'Speed')}:</Text>
                  {speedOptions.map((spd) => (
                    <Button
                      key={spd}
                      size="small"
                      type={playbackSpeed === spd ? 'primary' : 'default'}
                      onClick={() => setPlaybackSpeed(spd)}
                      style={{ minWidth: 36, fontSize: 11, borderRadius: 6 }}
                    >
                      {spd}×
                    </Button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tooltip title={t('cameraPlayback.snapshot', 'Snapshot')}>
                    <Button size="small" icon={<CameraOutlined />} type="text" />
                  </Tooltip>
                  <Tooltip title={t('cameraPlayback.clip', 'Clip')}>
                    <Button size="small" icon={<ScissorOutlined />} type="text" />
                  </Tooltip>
                  <Tooltip title={t('cameraPlayback.download', 'Download')}>
                    <Button size="small" icon={<DownloadOutlined />} type="text" />
                  </Tooltip>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline bar with event markers */}
          <Card
            size="small"
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('cameraPlayback.timelineBar', 'Recording Timeline')}
              </span>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '12px 20px' } }}
          >
            {/* 24h timeline bar */}
            <div style={{ position: 'relative', height: 32, background: '#f5f5f5', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              {/* Recorded segments */}
              <div style={{ position: 'absolute', left: '0%', width: '35%', height: '100%', background: 'rgba(24,144,255,0.3)', borderRadius: '6px 0 0 6px' }} />
              <div style={{ position: 'absolute', left: '40%', width: '25%', height: '100%', background: 'rgba(24,144,255,0.3)' }} />
              <div style={{ position: 'absolute', left: '70%', width: '20%', height: '100%', background: 'rgba(24,144,255,0.3)' }} />

              {/* Event markers */}
              {[15, 28, 38, 52, 61, 73, 82, 88].map((pos, i) => (
                <Tooltip key={i} title={mockEvents[i]?.description || 'Event'}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${pos}%`,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background: eventConfig[mockEvents[i]?.type || 'motion'].color,
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  />
                </Tooltip>
              ))}

              {/* Current position */}
              <div
                style={{
                  position: 'absolute',
                  left: `${currentTime}%`,
                  top: -2,
                  bottom: -2,
                  width: 3,
                  background: '#1890ff',
                  zIndex: 3,
                  borderRadius: 2,
                  boxShadow: '0 0 6px rgba(24,144,255,0.5)',
                }}
              />

              {/* Hour labels */}
              {[0, 4, 8, 12, 16, 20, 24].map((h) => (
                <div
                  key={h}
                  style={{
                    position: 'absolute',
                    left: `${(h / 24) * 100}%`,
                    bottom: 2,
                    fontSize: 8,
                    color: '#999',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {`${h}`.padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 8, borderRadius: 2, background: 'rgba(24,144,255,0.3)' }} />
                <Text type="secondary">{t('cameraPlayback.recorded', 'Recorded')}</Text>
              </div>
              {Object.entries(eventConfig).map(([type, cfg]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 3, height: 12, borderRadius: 1, background: cfg.color }} />
                  <Text type="secondary">{t(`cameraPlayback.event_${type}`, type)}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Sidebar: Events & Camera list */}
        <Col xs={24} lg={7}>
          {/* Events */}
          <Card
            size="small"
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                {t('cameraPlayback.events', 'Events')}
                <Badge count={mockEvents.length} size="small" style={{ marginLeft: 4 }} />
              </span>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}
            styles={{ body: { padding: '12px 16px', maxHeight: 320, overflowY: 'auto' } }}
          >
            <Timeline
              items={mockEvents.map((evt) => ({
                color: eventConfig[evt.type].color,
                children: (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                    <Tag style={{ margin: 0, borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: 'monospace', minWidth: 56, textAlign: 'center' }}>
                      {evt.time}
                    </Tag>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12 }}>{t(`cameraPlayback.evt_${evt.type}`, evt.description)}</Text>
                      <Tag
                        color={eventConfig[evt.type].tagColor as string}
                        style={{ margin: '2px 0 0', borderRadius: 4, fontSize: 9 }}
                      >
                        {t(`cameraPlayback.event_${evt.type}`, evt.type)}
                      </Tag>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>

          {/* Camera Quick Switch */}
          <Card
            size="small"
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <VideoCameraOutlined style={{ color: '#722ed1' }} />
                {t('cameraPlayback.cameraList', 'Camera List')}
              </span>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '8px 0', maxHeight: 300, overflowY: 'auto' } }}
          >
            {cameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => setSelectedCamera(cam.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  background: selectedCamera === cam.id ? '#e6f7ff' : 'transparent',
                  borderLeft: selectedCamera === cam.id ? '3px solid #1890ff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedCamera !== cam.id) e.currentTarget.style.background = '#fafafa'
                }}
                onMouseLeave={(e) => {
                  if (selectedCamera !== cam.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                <VideoCameraOutlined style={{ color: selectedCamera === cam.id ? '#1890ff' : '#8c8c8c', fontSize: 14 }} />
                <div style={{ flex: 1 }}>
                  <Text strong={selectedCamera === cam.id} style={{ fontSize: 12, color: selectedCamera === cam.id ? '#1890ff' : '#333' }}>
                    {cam.id}
                  </Text>
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                    <EnvironmentOutlined /> {cam.location} · {cam.floor}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
