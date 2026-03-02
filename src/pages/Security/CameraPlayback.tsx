import { useState } from 'react'
import {
  Row,
  Col,
  Typography,
  Select,
  Tag,
  Button,
  Tooltip,
  DatePicker,
  Slider,
  Timeline,
  Badge,
  Modal,
  Input,
  message,
  Spin,
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
  ClockCircleOutlined,
  HistoryOutlined,
  CameraOutlined,
  HighlightOutlined,
} from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { useBuildingStore } from '@/stores'
import { api } from '@/services'

const { Text } = Typography

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

export default function CameraPlayback() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [selectedCamera, setSelectedCamera] = useState(cameras[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(42)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)

  const handleAiSearch = async () => {
    const text = (aiQuery || '').trim()
    if (!text) {
      message.warning(t('cameraPlayback.aiSearchEmpty', 'Vui lòng nhập nội dung cần tìm'))
      return
    }
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await api.post('/test-api/chat', { text }) as unknown as { result?: string }
      const result = res?.result != null ? String(res.result) : (typeof res === 'string' ? res : '')
      setAiResult(result || t('cameraPlayback.aiNoResult', 'Không có kết quả'))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      message.error(t('cameraPlayback.aiError', 'Lỗi kết nối AI') + ': ' + msg)
      setAiResult(null)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiCancel = () => {
    setAiQuery('')
    setAiResult(null)
    setAiAssistantOpen(false)
  }

  const currentCam = cameras.find(c => c.id === selectedCamera) || cameras[0]

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <PageContainer>
      <PageHeader
        title={t('cameraPlayback.title', 'Playback')}
        icon={<HistoryOutlined />}
        subtitle={`${selectedBuilding?.name || t('cameraPlayback.allSites', 'All sites')} — ${t('cameraPlayback.reviewRecordings', 'Review camera recordings')}`}
        actions={
          <>
            <Tooltip title={t('cameraPlayback.aiAssistant', 'Trợ lý AI – Tìm kiếm nội dung trong bản ghi')}>
              <Button
                type="default"
                size="small"
                icon={<HighlightOutlined className="camera_playback-ai-btn-icon" />}
                onClick={() => setAiAssistantOpen(true)}
                className="camera_playback-ai-btn"
              >
                {t('cameraPlayback.aiSearch', 'Tìm kiếm nội dung dựa trên AI')}
              </Button>
            </Tooltip>
            <Select
              value={selectedCamera}
              className="camera_playback-select-w200"
              size="small"
              onChange={setSelectedCamera}
              options={cameras.map(c => ({
                value: c.id,
                label: `${c.id} - ${c.name}`,
              }))}
            />
            <DatePicker size="small" className="energy_input-w180" />
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={17}>
          <ContentCard
            size="small"
            className="camera_card-rounded camera_card-mb"
            styles={{ body: { padding: 0 } }}
          >
            <div className="camera_video-area">
              <VideoCameraOutlined className="camera_video-icon" />
              <div className="camera_overlay-tag-wrap">
                <Tag className="camera_overlay-tag">
                  {currentCam.id}
                </Tag>
                <span className="camera_overlay-name">
                  {currentCam.name}
                </span>
              </div>
              <div className="camera_overlay-timestamp">
                2026-02-06 {`${8 + Math.floor(currentTime * 14 / 100)}`.padStart(2, '0')}:{`${Math.floor(Math.random() * 60)}`.padStart(2, '0')}:00
              </div>
              {!isPlaying && (
                <div className="camera_playback-play-overlay" onClick={() => setIsPlaying(true)}>
                  <PlayCircleOutlined className="camera_playback-play-icon" />
                </div>
              )}
              <Tooltip title={t('cameraPlayback.fullscreen', 'Fullscreen')}>
                <Button
                  size="small"
                  type="text"
                  icon={<FullscreenOutlined />}
                  className="camera_playback-fullscreen-btn"
                />
              </Tooltip>
            </div>

            <div className="camera_playback-controls-pad">
              <Slider
                value={currentTime}
                onChange={setCurrentTime}
                tooltip={{ formatter: (val) => `${8 + Math.floor((val || 0) * 14 / 100)}:00` }}
                styles={{
                  track: { background: '#1890ff' },
                }}
              />
              <div className="camera_controls-row">
                <div className="camera_controls-left">
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
                    className="camera_play-circle"
                  />
                  <Tooltip title={t('cameraPlayback.nextFrame', 'Next frame')}>
                    <Button size="small" icon={<StepForwardOutlined />} type="text" />
                  </Tooltip>
                  <Tooltip title={t('cameraPlayback.forward', 'Forward 10s')}>
                    <Button size="small" icon={<FastForwardOutlined />} type="text" />
                  </Tooltip>
                </div>

                <div className="camera_controls-right">
                  <Text type="secondary" className="camera_speed-label">{t('cameraPlayback.speed', 'Speed')}:</Text>
                  {speedOptions.map((spd) => (
                    <Button
                      key={spd}
                      size="small"
                      type={playbackSpeed === spd ? 'primary' : 'default'}
                      onClick={() => setPlaybackSpeed(spd)}
                      className="camera_speed-btn"
                    >
                      {spd}×
                    </Button>
                  ))}
                </div>

                <div className="camera_controls-actions">
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
          </ContentCard>

          <ContentCard
            size="small"
            title={t('cameraPlayback.timelineBar', 'Recording Timeline')}
            titleIcon={<ClockCircleOutlined className="text-primary" />}
            className="camera_card-rounded"
            bodyStyle={{ padding: '12px 20px' }}
          >
            <div className="camera_timeline-bar">
              <div className="camera_timeline-segment camera_timeline-segment--first" style={{ left: '0%', width: '35%' }} />
              <div className="camera_timeline-segment" style={{ left: '40%', width: '25%' }} />
              <div className="camera_timeline-segment" style={{ left: '70%', width: '20%' }} />
              {[15, 28, 38, 52, 61, 73, 82, 88].map((pos, i) => (
                <Tooltip key={i} title={mockEvents[i]?.description || 'Event'}>
                  <div
                    className="absolute top-0 bottom-0 cursor-pointer"
                    style={{
                      left: `${pos}%`,
                      width: 3,
                      background: eventConfig[mockEvents[i]?.type || 'motion'].color,
                      zIndex: 2,
                    }}
                  />
                </Tooltip>
              ))}
              <div className="camera_timeline-current" style={{ left: `${currentTime}%` }} />
              {[0, 4, 8, 12, 16, 20, 24].map((h) => (
                <div key={h} className="camera_timeline-hour absolute text-xs" style={{ left: `${(h / 24) * 100}%` }}>
                  {`${h}`.padStart(2, '0')}:00
                </div>
              ))}
            </div>
            <div className="camera_timeline-legend">
              <div className="camera_timeline-legend-item">
                <div className="camera_timeline-legend-rect" />
                <Text type="secondary">{t('cameraPlayback.recorded', 'Recorded')}</Text>
              </div>
              {Object.entries(eventConfig).map(([type, cfg]) => (
                <div key={type} className="camera_timeline-legend-item">
                  <div className="camera_timeline-legend-marker" style={{ background: cfg.color }} />
                  <Text type="secondary">{t(`cameraPlayback.event_${type}`, type)}</Text>
                </div>
              ))}
            </div>
          </ContentCard>
        </Col>
        <Col xs={24} lg={7}>
          <ContentCard
            size="small"
            title={<>{t('cameraPlayback.events', 'Events')} <Badge count={mockEvents.length} size="small" className="ml-4" /></>}
            titleIcon={<ClockCircleOutlined className="text-warning" />}
            className="camera_card-rounded camera_card-mb"
            bodyStyle={{ padding: '12px 16px', maxHeight: 620, minHeight: 620, overflowY: 'auto' }}
          >
            <Timeline
              items={mockEvents.map((evt) => ({
                color: eventConfig[evt.type].color,
                children: (
                  <div className="camera_event-item">
                    <Tag className="camera_event-time-tag">
                      {evt.time}
                    </Tag>
                    <div className="flex-1">
                      <Text className="text-sm">{t(`cameraPlayback.evt_${evt.type}`, evt.description)}</Text>
                      <Tag
                        color={eventConfig[evt.type].tagColor as string}
                        className="camera_event-tag-sm"
                      >
                        {t(`cameraPlayback.event_${evt.type}`, evt.type)}
                      </Tag>
                    </div>
                  </div>
                ),
              }))}
            />
          </ContentCard>

        </Col>
      </Row>

      <Modal
        title={
          <span>
            <HighlightOutlined className="camera_playback-ai-title-icon" />
            {t('cameraPlayback.aiAssistantTitle', 'Trợ lý AI – Tìm kiếm trong bản ghi')}
          </span>
        }
        open={aiAssistantOpen}
        onCancel={handleAiCancel}
        footer={
          <div className="flex justify-end gap-8">
            <Button onClick={handleAiCancel}>
              {t('cameraPlayback.aiCancel', 'Hủy bỏ')}
            </Button>
            <Button type="primary" icon={<HighlightOutlined />} loading={aiLoading} onClick={handleAiSearch}>
              {t('cameraPlayback.aiSearchButton', 'Tìm kiếm')}
            </Button>
          </div>
        }
        width={520}
        centered
        destroyOnClose
      >
        <div className="mb-12">
          <Input
            placeholder={t('cameraPlayback.aiSearchPlaceholder', 'Mô tả nội dung cần tìm (người, xe, hành động...)')}
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onPressEnter={handleAiSearch}
            allowClear
            size="large"
            disabled={aiLoading}
            className="camera_playback-ai-input"
          />
        </div>
        <div className="text-secondary text-sm mb-12">
          {t('cameraPlayback.aiAssistantHint', 'Nhập mô tả để AI tìm các đoạn tương ứng trong bản ghi camera đã chọn.')}
        </div>
        {aiLoading && (
          <div className="flex justify-center py-16">
            <Spin tip={t('cameraPlayback.aiSearching', 'Đang tìm kiếm...')} />
          </div>
        )}
        {!aiLoading && aiResult != null && (
          <div className="camera_playback-result-box">
            <Text strong className="text-sm block mb-8">{t('cameraPlayback.aiResultLabel', 'Kết quả')}:</Text>
            <Text className="text-sm whitespace-pre-wrap">{aiResult}</Text>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
