import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  Badge,
  Button,
  Tooltip,
  Segmented,
  Empty,
  Modal,
  Pagination,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  VideoCameraOutlined,
  SoundOutlined,
  AudioMutedOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { ContentCard } from '@/components'
import { useBuildingStore } from '@/stores'
import mpegts from 'mpegts.js'
import Hls from 'hls.js'
import { getWebPlayableStreamCandidates, resolveCameraStreamUrl } from '@/utils/streamUrl'

const { Title, Text } = Typography

// ─── Mock Camera Data ───────────────────────────────────────
interface Camera {
  id: string
  name: string
  location: string
  floor: string
  status: 'online' | 'offline' | 'recording'
  type: 'indoor' | 'outdoor' | 'ptz'
  resolution: string
  streamUrl?: string
}

interface CameraOverrideConfig {
  id: string
  enabled?: boolean
  streamUrl?: string
}

const CAMERA_ITEMS_STORAGE_KEY = 'securityCamera.itemConfig'

const cameras: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Lobby Main Entrance',
    location: 'Lobby A',
    floor: '1F',
    status: 'recording',
    type: 'indoor',
    resolution: '1080p',
    streamUrl: 'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8',
  },
  {
    id: 'CAM-02',
    name: 'Parking Gate A',
    location: 'Parking',
    floor: 'B1',
    status: 'recording',
    type: 'outdoor',
    resolution: '4K',
    streamUrl: resolveCameraStreamUrl('/hls/699e639f021a61a13ee1ce32/index.m3u8'),
  },
  { id: 'CAM-03', name: 'Elevator Hall 1F', location: 'Elevator', floor: '1F', status: 'online', type: 'indoor', resolution: '1080p' },
  { id: 'CAM-04', name: 'Office Floor 3', location: 'Office', floor: '3F', status: 'recording', type: 'indoor', resolution: '1080p' },
  { id: 'CAM-05', name: 'Rooftop', location: 'Rooftop', floor: 'RF', status: 'online', type: 'outdoor', resolution: '4K' },
  { id: 'CAM-06', name: 'Server Room', location: 'Server', floor: 'B1', status: 'recording', type: 'indoor', resolution: '1080p' },
  { id: 'CAM-07', name: 'Parking Gate B', location: 'Parking', floor: 'B1', status: 'offline', type: 'outdoor', resolution: '1080p' },
  { id: 'CAM-08', name: 'Meeting Room 5F', location: 'Meeting', floor: '5F', status: 'online', type: 'ptz', resolution: '1080p' },
  { id: 'CAM-09', name: 'Fire Escape Stair', location: 'Stairwell', floor: '2F', status: 'recording', type: 'indoor', resolution: '720p' },
  { id: 'CAM-10', name: 'Loading Dock', location: 'Dock', floor: '1F', status: 'recording', type: 'outdoor', resolution: '4K' },
  { id: 'CAM-11', name: 'Lobby Side Entrance', location: 'Lobby B', floor: '1F', status: 'online', type: 'indoor', resolution: '1080p' },
  { id: 'CAM-12', name: 'Garden Area', location: 'Garden', floor: '1F', status: 'online', type: 'ptz', resolution: '4K' },
]

function readCameraOverrides(): CameraOverrideConfig[] {
  try {
    const raw = localStorage.getItem(CAMERA_ITEMS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CameraOverrideConfig[]) : []
  } catch {
    return []
  }
}

const statusConfig = {
  online: { color: '#52c41a', label: 'online' },
  offline: { color: '#ff4d4f', label: 'offline' },
}

type GridLayout = '2x2' | '3x3' | '4x4'

function CameraStreamPlayer({
  streamUrl,
  cameraId,
  muted,
  t,
}: {
  streamUrl: string
  cameraId: string
  muted: boolean
  t: any
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState('')

  useEffect(() => {
    const videoEl = videoRef.current
    const playableCandidates = getWebPlayableStreamCandidates(streamUrl)
    if (!videoEl || playableCandidates.length === 0) return

    setStreamError(null)
    setActiveSource('')
    let player: mpegts.Player | null = null
    let hls: Hls | null = null
    let disposed = false

    const cleanupCurrent = () => {
      if (hls) {
        hls.destroy()
        hls = null
      }
      if (player) {
        player.pause()
        player.unload()
        player.detachMediaElement()
        player.destroy()
        player = null
      }
      videoEl.removeAttribute('src')
      videoEl.load()
    }

    const trySourceAt = (index: number) => {
      if (disposed) return
      if (index >= playableCandidates.length) {
        setStreamError(t('cameraLive.streamFailed', 'Unable to decode this stream source'))
        return
      }

      const source = playableCandidates[index]
      setActiveSource(source)
      cleanupCurrent()

      const isHlsStream = source.includes('.m3u8')
      const isWsStream = source.startsWith('ws://') || source.startsWith('wss://')
      const isMp4Stream = source.includes('.mp4')

      if (isHlsStream) {
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true })
          hls.loadSource(source)
          hls.attachMedia(videoEl)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const playResult = videoEl.play()
            if (playResult && typeof playResult.then === 'function') {
              playResult.catch(() => {})
            }
          })
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data?.fatal) return
            cleanupCurrent()
            trySourceAt(index + 1)
          })
          return
        }

        if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          videoEl.src = source
          const playResult = videoEl.play()
          if (playResult && typeof playResult.then === 'function') {
            playResult.catch(() => trySourceAt(index + 1))
          }
          return
        }

        trySourceAt(index + 1)
        return
      }

      if (isWsStream) {
        if (!mpegts.isSupported()) {
          trySourceAt(index + 1)
          return
        }

        player = mpegts.createPlayer(
          { type: 'flv', url: source, isLive: true, hasAudio: false },
          { enableWorker: true, lazyLoad: false, stashInitialSize: 128 },
        )
        player.attachMediaElement(videoEl)
        player.load()
        const playResult = player.play()
        if (playResult && typeof playResult.then === 'function') {
          playResult.catch(() => trySourceAt(index + 1))
        }
        player.on(mpegts.Events.ERROR, () => {
          cleanupCurrent()
          trySourceAt(index + 1)
        })
        return
      }

      if (isMp4Stream) {
        videoEl.src = source
        const playResult = videoEl.play()
        if (playResult && typeof playResult.then === 'function') {
          playResult.catch(() => trySourceAt(index + 1))
        }
        videoEl.onerror = () => {
          videoEl.onerror = null
          trySourceAt(index + 1)
        }
        return
      }

      trySourceAt(index + 1)
    }

    try {
      trySourceAt(0)
    } catch {
      setStreamError(t('cameraLive.streamFailed', 'Unable to decode this stream source'))
    }

    return () => {
      disposed = true
      cleanupCurrent()
    }
  }, [streamUrl, t])

  return (
    <>
      <video ref={videoRef} className="camera_feed-video-element" autoPlay muted={muted} playsInline controls={false} />
      {streamError && (
        <div className="camera_feed-stream-error">
          <div className="camera_feed-stream-error-title">{cameraId}</div>
          <div>{streamError}</div>
          {activeSource ? <div className="text-11 mt-4">{activeSource}</div> : null}
        </div>
      )}
    </>
  )
}

// ─── Camera Feed Card ───────────────────────────────────────
function CameraFeed({
  camera,
  t,
  compact,
  onPreview,
}: {
  camera: Camera
  t: any
  compact?: boolean
  onPreview: (camera: Camera) => void
}) {
  const normalizedStatus = camera.status === 'offline' ? 'offline' : 'online'
  const stCfg = statusConfig[normalizedStatus]
  const [muted, setMuted] = useState(true)
  const videoBoxRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    const el = videoBoxRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
      return
    }
    el.requestFullscreen().catch(() => {
      // Ignore fullscreen errors silently for unsupported/blocked browsers.
    })
  }

  return (
    <ContentCard
      size="small"
      className="camera_feed-card"
      styles={{ body: { padding: 0 } }}
    >
      {/* Video area placeholder */}
      <div
        ref={videoBoxRef}
        className={`camera_feed-video ${camera.status === 'offline' ? 'camera_feed-video--offline' : 'camera_feed-video--live'}`}
        style={{ height: compact ? 140 : 180 }}
        onClick={() => onPreview(camera)}
      >
        {camera.status === 'offline' ? (
          <div className="text-center">
            <CloseCircleOutlined className="text-4xl text-danger mb-8" />
            <div className="text-danger text-sm">{t('cameraLive.signalLost', 'Signal Lost')}</div>
          </div>
        ) : (
          <>
            {camera.streamUrl ? (
              <CameraStreamPlayer streamUrl={camera.streamUrl} cameraId={camera.id} muted={muted} t={t} />
            ) : (
              <VideoCameraOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }} />
            )}

            {/* Timestamp */}
            <div className="camera_feed-timestamp">
              {new Date().toLocaleTimeString()} · {camera.resolution}
            </div>

            {/* Controls overlay */}
            <div className="camera_feed-controls">
              <Tooltip title={t('cameraLive.fullscreen', 'Fullscreen')}>
                <Button
                  size="small"
                  type="text"
                  icon={<FullscreenOutlined />}
                  className="camera_feed-btn-overlay"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                />
              </Tooltip>
              <Tooltip title={muted ? t('cameraLive.unmute', 'Unmute') : t('cameraLive.mute', 'Mute')}>
                <Button
                  size="small"
                  type="text"
                  icon={muted ? <AudioMutedOutlined /> : <SoundOutlined />}
                  className="camera_feed-btn-overlay"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMuted((v) => !v)
                  }}
                />
              </Tooltip>
            </div>

            {/* Camera name overlay */}
            <div className="camera_feed-name-overlay">
              {camera.id}
            </div>
          </>
        )}
      </div>

      {/* Info bar */}
      <div className={compact ? 'camera_feed-info-bar--compact' : 'camera_feed-info-bar'}>
        <div className="flex-between">
          <div className="flex-1 min-w-0">
            <Text strong className={compact ? 'text-11' : 'text-base'} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {camera.name}
            </Text>
            <div className="flex items-center gap-4 text-11 text-muted mt-2">
              <EnvironmentOutlined />
              <span>{camera.location} · {camera.floor}</span>
            </div>
          </div>
          <Badge
            status={normalizedStatus === 'offline' ? 'error' : 'success'}
            text={<span className="text-11">{t(`cameraLive.${stCfg.label}`, stCfg.label)}</span>}
          />
        </div>
      </div>
    </ContentCard>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function CameraLiveView() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [gridLayout, setGridLayout] = useState<GridLayout>('3x3')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewCamera, setPreviewCamera] = useState<Camera | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [configVersion, setConfigVersion] = useState(0)

  const configuredCameras = useMemo(() => {
    const overrideMap = new Map(readCameraOverrides().map(item => [item.id, item]))
    return cameras
      .filter(camera => {
        const override = overrideMap.get(camera.id)
        return override?.enabled !== false
      })
      .map(camera => {
        const override = overrideMap.get(camera.id)
        const streamUrl = typeof override?.streamUrl === 'string' ? override.streamUrl.trim() : ''
        return streamUrl ? { ...camera, streamUrl } : camera
      })
  }, [configVersion])

  const floors = [...new Set(configuredCameras.map(c => c.floor))]

  const normalizeStatus = (status: Camera['status']) => (status === 'offline' ? 'offline' : 'online')

  const filteredCameras = configuredCameras.filter(c => {
    if (floorFilter !== 'all' && c.floor !== floorFilter) return false
    if (statusFilter !== 'all' && normalizeStatus(c.status) !== statusFilter) return false
    return true
  })

  const colSpan = gridLayout === '2x2' ? 12 : gridLayout === '3x3' ? 8 : 6
  const pageSize = gridLayout === '2x2' ? 4 : gridLayout === '3x3' ? 9 : 16
  const totalPages = Math.max(1, Math.ceil(filteredCameras.length / pageSize))
  const visibleCameras = filteredCameras.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [gridLayout, floorFilter, statusFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Summary
  const onlineCount = configuredCameras.filter(c => normalizeStatus(c.status) === 'online').length
  const offlineCount = configuredCameras.filter(c => c.status === 'offline').length

  return (
    <div className="p-0">
      {/* Header */}
      <div className="camera_header">
        <div>
          <Title level={4} className="m-0 flex items-center gap-8">
            <EyeOutlined />
            {t('cameraLive.title', 'Live View')}
          </Title>
          <Text type="secondary" className="text-sm">
            {selectedBuilding?.name || t('cameraLive.allSites', 'All sites')} — {onlineCount} {t('cameraLive.online', 'online')}, {offlineCount} {t('cameraLive.offline', 'offline')}
          </Text>
        </div>

        <div className="flex items-center gap-10 flex-wrap">
          <Segmented
            value={gridLayout}
            onChange={(val) => setGridLayout(val as GridLayout)}
            options={[
              { value: '2x2', label: '2×2' },
              { value: '3x3', label: '3×3' },
              { value: '4x4', label: '4×4' },
            ]}
            className="vehicle_segmented"
          />
          <div className="camera_divider-v" />
          <Select
            value={floorFilter}
            className="vehicle_filter-select-w120"
            size="small"
            onChange={setFloorFilter}
            options={[
              { value: 'all', label: t('cameraLive.allFloors', 'All Floors') },
              ...floors.map(f => ({ value: f, label: f })),
            ]}
          />
          <Select
            value={statusFilter}
            className="vehicle_filter-select-w130"
            size="small"
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: t('cameraLive.allStatus', 'All Status') },
              { value: 'online', label: t('cameraLive.online', 'Online') },
              { value: 'offline', label: t('cameraLive.offline', 'Offline') },
            ]}
          />
          <Tooltip title={t('cameraLive.refresh', 'Refresh')}>
            <Button size="small" icon={<ReloadOutlined />} onClick={() => setConfigVersion(v => v + 1)} />
          </Tooltip>
        </div>
      </div>

      {/* Camera Grid */}
      {filteredCameras.length === 0 ? (
        <Card className="camera_empty-card">
          <Empty description={t('cameraLive.noCameras', 'No cameras found')} />
        </Card>
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {visibleCameras.map((camera) => (
            <Col xs={24} sm={12} lg={colSpan} key={camera.id}>
              <CameraFeed
                camera={camera}
                t={t}
                compact={gridLayout === '4x4'}
                onPreview={setPreviewCamera}
              />
            </Col>
            ))}
          </Row>
          {filteredCameras.length > pageSize && (
            <div className="mt-12 flex justify-end">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredCameras.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={!!previewCamera}
        onCancel={() => setPreviewCamera(null)}
        footer={null}
        width={1000}
        destroyOnClose
        title={previewCamera ? `${previewCamera.name} (${previewCamera.id})` : ''}
      >
        {previewCamera && (
          <div className="camera_feed-video camera_feed-video--live" style={{ height: 560 }}>
            {previewCamera.status === 'offline' ? (
              <div className="text-center">
                <CloseCircleOutlined className="text-4xl text-danger mb-8" />
                <div className="text-danger text-sm">{t('cameraLive.signalLost', 'Signal Lost')}</div>
              </div>
            ) : previewCamera.streamUrl ? (
              <CameraStreamPlayer
                streamUrl={previewCamera.streamUrl}
                cameraId={previewCamera.id}
                muted={false}
                t={t}
              />
            ) : (
              <VideoCameraOutlined style={{ fontSize: 52, color: 'rgba(255,255,255,0.2)' }} />
            )}
            <div className="camera_feed-timestamp">
              {new Date().toLocaleTimeString()} · {previewCamera.resolution}
            </div>
            <div className="camera_feed-name-overlay">
              {previewCamera.location} · {previewCamera.floor}
            </div>
          </div>
        )}
      </Modal>

      {/* Pulse animation for REC indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
