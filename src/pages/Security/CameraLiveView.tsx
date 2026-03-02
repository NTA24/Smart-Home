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
  Pagination,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  VideoCameraOutlined,
  SoundOutlined,
  AudioMutedOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { ContentCard } from '@/components'
import { useBuildingStore } from '@/stores'
import mpegts from 'mpegts.js'
import Hls from 'hls.js'
import { getWebPlayableStreamCandidates, getYoutubeEmbedUrl } from '@/utils/streamUrl'
import { DEMO_CAMERAS } from './cameraConfig'

const { Title, Text } = Typography

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
const YOUTUBE_MIN_LOADING_MS = 4000

const cameras: Camera[] = [
  ...DEMO_CAMERAS,
  { id: 'CAM-11', name: 'Camera 11',   location: '—',      floor: '1F', status: 'offline', type: 'indoor',  resolution: '1080p' },
  { id: 'CAM-12', name: 'Garden Area', location: 'Garden', floor: '1F', status: 'offline', type: 'ptz',     resolution: '4K'    },
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

function isEmbedPageUrl(streamUrl: string): boolean {
  const u = (streamUrl || '').trim().toLowerCase()
  try {
    const host = new URL(u).hostname.toLowerCase()
    return host.includes('earthcam.net') || host.includes('earthcam.com') || host.includes('skylinewebcams.com')
  } catch {
    return false
  }
}

type GridLayout = '2x2' | '3x3' | '4x4'

function CameraStreamPlayer({
  streamUrl,
  cameraId,
  muted,
  t,
  onStreamError,
}: {
  streamUrl: string
  cameraId: string
  muted: boolean
  t: any
  onStreamError?: (hasError: boolean) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [_activeSource, setActiveSource] = useState('')
  const [youtubeLoading, setYoutubeLoading] = useState(false)
  const [youtubeLoaded, setYoutubeLoaded] = useState(false)
  const youtubeLoadStartRef = useRef(0)
  const youtubeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const youtubeEmbed = getYoutubeEmbedUrl(streamUrl)

  useEffect(() => {
    if (youtubeHideTimerRef.current) {
      clearTimeout(youtubeHideTimerRef.current)
      youtubeHideTimerRef.current = null
    }
    const enabled = Boolean(youtubeEmbed)
    setYoutubeLoading(enabled)
    setYoutubeLoaded(false)
    if (enabled) youtubeLoadStartRef.current = Date.now()
    return () => {
      if (youtubeHideTimerRef.current) {
        clearTimeout(youtubeHideTimerRef.current)
        youtubeHideTimerRef.current = null
      }
    }
  }, [youtubeEmbed, streamUrl])

  useEffect(() => {
    if (!youtubeEmbed || !youtubeLoaded) return
    const elapsed = Date.now() - youtubeLoadStartRef.current
    const remain = Math.max(0, YOUTUBE_MIN_LOADING_MS - elapsed)
    if (remain === 0) {
      setYoutubeLoading(false)
      return
    }
    youtubeHideTimerRef.current = setTimeout(() => {
      setYoutubeLoading(false)
      youtubeHideTimerRef.current = null
    }, remain)
    return () => {
      if (youtubeHideTimerRef.current) {
        clearTimeout(youtubeHideTimerRef.current)
        youtubeHideTimerRef.current = null
      }
    }
  }, [youtubeEmbed, youtubeLoaded])

  useEffect(() => {
    if (youtubeEmbed || isEmbedPageUrl(streamUrl)) return
    const videoEl = videoRef.current
    const playableCandidates = getWebPlayableStreamCandidates(streamUrl)
    if (!videoEl) return
    if (playableCandidates.length === 0) {
      setStreamError(t('cameraLive.lostConnection', 'Mất kết nối'))
      onStreamError?.(true)
      return
    }

    setStreamError(null)
    onStreamError?.(false)
    setActiveSource('')
    let player: mpegts.Player | null = null
    let hls: Hls | null = null
    let disposed = false
    let loadTimeout: ReturnType<typeof setTimeout> | null = null

    const clearLoadTimeout = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
    }

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
        setStreamError(t('cameraLive.lostConnection', 'Mất kết nối'))
        onStreamError?.(true)
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
            clearLoadTimeout()
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
          playResult.then(() => clearLoadTimeout()).catch(() => trySourceAt(index + 1))
        }
        player.on(mpegts.Events.ERROR, () => {
          clearLoadTimeout()
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

    loadTimeout = setTimeout(() => {
      if (disposed) return
      clearLoadTimeout()
      setStreamError(t('cameraLive.lostConnection', 'Mất kết nối'))
      onStreamError?.(true)
      cleanupCurrent()
    }, 12000)

    try {
      trySourceAt(0)
    } catch {
      clearLoadTimeout()
      setStreamError(t('cameraLive.lostConnection', 'Mất kết nối'))
      onStreamError?.(true)
    }

    return () => {
      disposed = true
      clearLoadTimeout()
      cleanupCurrent()
    }
  }, [streamUrl, t, youtubeEmbed, onStreamError])

  if (youtubeEmbed) {
    return (
      <div className="security_yt-crop-wrap security_yt-crop-wrap--full">
        <iframe
          src={youtubeEmbed}
          title={cameraId}
          style={{ visibility: youtubeLoading ? 'hidden' : 'visible' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setYoutubeLoaded(true)}
        />
        {youtubeLoading && (
          <div className="security_yt-loading-overlay">
            <div className="security_yt-spinner" />
            <Text className="security_yt-loading-text">Loading stream...</Text>
          </div>
        )}
      </div>
    )
  }

  if (isEmbedPageUrl(streamUrl)) {
    return (
      <div className="camera_feed-embed-wrap camera_feed-embed-wrap--full">
        <iframe
          src={streamUrl}
          title={cameraId}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <>
      <video ref={videoRef} className="camera_feed-video-element" autoPlay muted={muted} playsInline controls={false} />
      {streamError && (
        <div className="camera_feed-stream-error camera_feed-stream-error--signal">
          <CloseCircleOutlined className="camera_feed-stream-error-icon" />
          <div className="camera_feed-stream-error-text">{streamError}</div>
        </div>
      )}
    </>
  )
}

function CameraFeed({
  camera,
  t,
  compact,
}: {
  camera: Camera
  t: any
  compact?: boolean
}) {
  const [hasStreamError, setHasStreamError] = useState(false)
  const normalizedStatus = camera.status === 'offline' || hasStreamError ? 'offline' : 'online'
  const stCfg = statusConfig[normalizedStatus]
  const [muted, setMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    const el = videoBoxRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
      return
    }
    el.requestFullscreen().catch(() => {})
  }

  return (
    <ContentCard
      size="small"
      className="camera_feed-card"
      styles={{ body: { padding: 0 } }}
    >
      <div
        ref={videoBoxRef}
        className={`camera_feed-video ${normalizedStatus === 'offline' ? 'camera_feed-video--offline' : 'camera_feed-video--live'} ${compact ? 'camera_feed-video--h140' : 'camera_feed-video--h180'}`}
      >
        {camera.status === 'offline' ? (
          <div className="text-center">
            <CloseCircleOutlined className="text-4xl text-danger mb-8" />
            <div className="text-danger text-sm">{t('cameraLive.signalLost', 'Signal Lost')}</div>
          </div>
        ) : (
          <>
            {camera.streamUrl ? (
              <CameraStreamPlayer
                streamUrl={camera.streamUrl}
                cameraId={camera.id}
                muted={muted}
                t={t}
                onStreamError={setHasStreamError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <VideoCameraOutlined className="camera_feed-no-stream-icon" />
                <span className="text-11 text-muted">{t('cameraLive.noStreamUrl', 'Chưa cấu hình URL stream')}</span>
              </div>
            )}

            <div className="camera_feed-controls">
              <Tooltip title={isFullscreen ? t('cameraLive.exitFullscreen', 'Thoát toàn màn hình') : t('cameraLive.fullscreen', 'Fullscreen')}>
                <Button
                  size="small"
                  type="text"
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
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

            <div className="camera_feed-name-overlay">
              {camera.id}
            </div>
          </>
        )}
      </div>

      <div className={compact ? 'camera_feed-info-bar--compact' : 'camera_feed-info-bar'}>
        <div className="flex-between">
          <div className="flex-1 min-w-0">
            <Text strong className={`camera_feed-name-truncate ${compact ? 'text-11' : 'text-base'}`}>
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

export default function CameraLiveView() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [gridLayout, setGridLayout] = useState<GridLayout>('3x3')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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
        const overrideUrl = typeof override?.streamUrl === 'string' ? override.streamUrl.trim() : ''
        const streamUrl = overrideUrl || (typeof camera.streamUrl === 'string' ? camera.streamUrl.trim() : '') || undefined
        return { ...camera, streamUrl: streamUrl || undefined }
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

  const onlineCount = configuredCameras.filter(c => normalizeStatus(c.status) === 'online').length
  const offlineCount = configuredCameras.filter(c => c.status === 'offline').length

  return (
    <div className="p-0">
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
    </div>
  )
}
