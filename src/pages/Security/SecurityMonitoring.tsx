import { useState, useEffect, useRef, useMemo } from 'react'
import { Typography, Tag, Modal, Button, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  AlertOutlined,
  CameraOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import securityBg from '../../assets/security-bg-2.png'
import alertIcon from '../../assets/alert-icon.png'
import cameraIcon from '../../assets/camera-icon.png'
import cameraPreview from '../../assets/camera-preview.png'
import Hls from 'hls.js'
import mpegts from 'mpegts.js'
import { getWebPlayableStreamCandidates, getYoutubeEmbedUrl, isYoutubeUrl, resolveCameraStreamUrl } from '@/utils/streamUrl'

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

// Panel component with glass effect
const GlassPanel: React.FC<{
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
  titleRight?: React.ReactNode
  className?: string
}> = ({ title, icon, children, style, titleRight, className }) => (
  <div className={['security_glass-panel', className].filter(Boolean).join(' ')} style={style}>
    <div className="security_glass-header">
      <div className="security_glass-header-left">
        {icon}
        <Text className="security_glass-title">{title}</Text>
      </div>
      {titleRight}
    </div>
    <div className="security_glass-body">{children}</div>
  </div>
)

// Video alarm item - matching reference design
const VideoAlarmItem: React.FC<{
  camera: string
  location: string
  time: string
  type: string
  onCameraClick?: () => void
}> = ({ camera, location, time, type, onCameraClick }) => (
  <div className="security_alarm-item">
    <div className="security_alarm-icon-wrap">
      <img src={alertIcon} alt="" className="security_alarm-icon" />
    </div>

    <div className="security_alarm-content min-w-0">
      <div className="security_alarm-row">
        <Text className="text-sm font-medium security_text-alarm">{camera}</Text>
        <Text className="text-11 security_text-red">{type}</Text>
      </div>
      <Text className="text-xs block mt-2 security_text-light">{location}</Text>
      <Text className="font-mono security_alarm-time">{time}</Text>
    </div>

    <div
      onClick={(e) => { e.stopPropagation(); onCameraClick?.() }}
      className="security_alarm-camera-btn"
    >
      <img src={cameraIcon} alt="" className="block security_camera-icon-sm" />
    </div>
  </div>
)

// Camera video modal component
const CameraVideoModal: React.FC<{
  visible: boolean
  camera: string
  time: string
  streamUrl?: string
  onClose: () => void
}> = ({ visible, camera, streamUrl, onClose }) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamError, setStreamError] = useState(false)
  const youtubeEmbed = getYoutubeEmbedUrl(streamUrl)

  useEffect(() => {
    if (!visible) return
    setStreamError(false)
    if (isYoutubeUrl(streamUrl)) return
    const videoEl = videoRef.current
    const playableCandidates = getWebPlayableStreamCandidates(streamUrl)
    if (!videoEl || playableCandidates.length === 0) {
      setStreamError(true)
      return
    }

    let hls: Hls | null = null
    let player: mpegts.Player | null = null
    let disposed = false
    const cleanupCurrent = () => {
      if (hls) hls.destroy()
      hls = null
      if (player) {
        player.pause()
        player.unload()
        player.detachMediaElement()
        player.destroy()
      }
      player = null
      videoEl.removeAttribute('src')
      videoEl.load()
    }

    const trySourceAt = (index: number) => {
      if (disposed) return
      if (index >= playableCandidates.length) {
        setStreamError(true)
        return
      }
      const source = playableCandidates[index]
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

      if (isWsStream && mpegts.isSupported()) {
        player = mpegts.createPlayer(
          { type: 'flv', url: source, isLive: true, hasAudio: false },
          { enableWorker: true, lazyLoad: false },
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
      setStreamError(true)
    }

    return () => {
      disposed = true
      cleanupCurrent()
    }
  }, [visible, streamUrl])

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={920}
      styles={{
        content: { padding: 0, background: 'transparent', boxShadow: 'none' },
        mask: { background: 'rgba(0, 10, 30, 0.85)' }
      }}
    >
      <div className="security_modal-wrap">
        <div className="security_modal-header">
          <Text className="text-cyan text-md font-semibold">{camera}</Text>
          <CloseOutlined
            onClick={onClose}
            className="text-muted cursor-pointer p-4 rounded transition-all text-md"
          />
        </div>
        <div className="security_modal-video-area">
          {youtubeEmbed ? (
            <div className="security_yt-crop-wrap">
              <iframe
                src={youtubeEmbed}
                title={camera}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : streamUrl ? (
            <>
              <video
                ref={videoRef}
                className="camera_feed-video-element"
                autoPlay
                muted
                playsInline
                controls={false}
              />
              {streamError && (
                <div className="camera_feed-stream-error camera_feed-stream-error--signal security_modal-stream-error">
                  <CloseCircleOutlined className="camera_feed-stream-error-icon" />
                  <div className="camera_feed-stream-error-text">{t('cameraLive.lostConnection', 'Mất kết nối')}</div>
                </div>
              )}
            </>
          ) : (
            <PlayCircleOutlined className="security_play-icon cursor-pointer transition-all text-4xl opacity-90" />
          )}
          {!youtubeEmbed && (
          <div className="security_camera-name-overlay">
            <Text className="text-white text-11">{camera}</Text>
          </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// Scrolling alarm list component
const ScrollingAlarmList: React.FC<{
  alarms: Array<{ camera: string; location: string; time: string; type: string }>
  onCameraClick: (camera: string, time: string) => void
}> = ({ alarms, onCameraClick }) => {
  const [offset, setOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const itemHeight = 64

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % (alarms.length * 2))
    }, 3000)
    return () => clearInterval(timer)
  }, [alarms.length, isPaused])

  const displayAlarms = [...alarms, ...alarms]

  return (
    <div
      className="security_scroll-list"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="security_scroll-track" />
      <div style={{ transform: `translateY(-${offset * itemHeight}px)`, transition: 'transform 0.8s ease-in-out' }}>
        {displayAlarms.map((alarm, i) => (
          <VideoAlarmItem key={i} {...alarm} onCameraClick={() => onCameraClick(alarm.camera, alarm.time)} />
        ))}
      </div>
    </div>
  )
}

// Camera thumbnail component
const CameraThumbnail: React.FC<{
  label: string
  sublabel?: string
  isLive?: boolean
  camId?: string
  streamUrl?: string
  onClick?: () => void
}> = ({ label, sublabel, isLive, camId, streamUrl, onClick }) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamError, setStreamError] = useState(false)
  const youtubeEmbed = getYoutubeEmbedUrl(streamUrl)

  useEffect(() => {
    setStreamError(false)
    if (isYoutubeUrl(streamUrl)) return
    const videoEl = videoRef.current
    const playableCandidates = getWebPlayableStreamCandidates(streamUrl)
    if (!videoEl || playableCandidates.length === 0) {
      setStreamError(true)
      return
    }

    let hls: Hls | null = null
    let player: mpegts.Player | null = null
    let disposed = false
    const cleanupCurrent = () => {
      if (hls) {
        hls.destroy()
      }
      hls = null
      if (player) {
        player.pause()
        player.unload()
        player.detachMediaElement()
        player.destroy()
      }
      player = null
      videoEl.removeAttribute('src')
      videoEl.load()
    }

    const trySourceAt = (index: number) => {
      if (disposed) return
      if (index >= playableCandidates.length) {
        setStreamError(true)
        return
      }
      const source = playableCandidates[index]
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

      if (isWsStream && mpegts.isSupported()) {
        player = mpegts.createPlayer(
          { type: 'flv', url: source, isLive: true, hasAudio: false },
          { enableWorker: true, lazyLoad: false },
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
      setStreamError(true)
    }

    return () => {
      disposed = true
      cleanupCurrent()
    }
  }, [streamUrl])

  return (
    <div
      className="security_thumbnail-card"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div
        className="security_thumbnail-preview"
        style={!streamUrl ? { backgroundImage: `url(${cameraPreview})` } : undefined}
      >
        {youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            title={label}
            className="camera_feed-video-element security_thumbnail-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : streamUrl ? (
          <>
            <video
              ref={videoRef}
              className="camera_feed-video-element"
              autoPlay
              muted
              playsInline
              controls={false}
            />
            {streamError && (
              <div className="camera_feed-stream-error camera_feed-stream-error--signal">
                <CloseCircleOutlined className="camera_feed-stream-error-icon" />
                <div className="camera_feed-stream-error-text">{t('cameraLive.lostConnection', 'Mất kết nối')}</div>
              </div>
            )}
          </>
        ) : null}
        {isLive && (
          <div className="security_thumbnail-live-badge">
            <Text className="security_cam-live-text">LIVE</Text>
          </div>
        )}
        <div className="security_thumbnail-cam-id">
          <Text className="security_cam-id-text">{camId || label.split(' - ')[1]}</Text>
        </div>
      </div>
      <div className="security_thumbnail-info">
        <Text className="security_cam-info-label">{label}</Text>
        {sublabel && <Text className="security_cam-info-sub">{sublabel}</Text>}
      </div>
    </div>
  )
}

// Face capture item
const FaceCapture: React.FC<{
  tag: string
  tagColor: string
  location: string
  time: string
  image?: string
}> = ({ tag, tagColor, location, time, image }) => (
  <div className="security_face-card">
    <div className="security_face-avatar">
      {image ? (
        <img src={image} alt="" className="security_face-img" />
      ) : (
        <UserOutlined className="opacity-60 security_text-blue-dark" style={{ fontSize: 28 }} />
      )}
      <div className="security_face-tag-bar" style={{ background: tagColor }}>
        <Text className="text-white text-xs">{tag}</Text>
      </div>
    </div>
    <div className="security_face-info">
      <Text className="block security_face-location">{location}</Text>
      <Text className="security_face-time">{time}</Text>
    </div>
  </div>
)

// Scrolling capture list component
const ScrollingCaptureList: React.FC<{
  captures: Array<{ tag: string; tagColor: string; location: string; time: string; image?: string }>
}> = ({ captures }) => {
  const [offset, setOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const itemWidth = 76

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % captures.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [captures.length, isPaused])

  const displayCaptures = [...captures, ...captures, ...captures]

  return (
    <div
      className="overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex gap-6"
        style={{ transform: `translateX(-${offset * itemWidth}px)`, transition: 'transform 0.5s ease-in-out' }}
      >
        {displayCaptures.map((cap, i) => (
          <FaceCapture key={i} {...cap} />
        ))}
      </div>
    </div>
  )
}

// Snapshot video box (plays stream in Smart snapshots panel)
const SnapshotVideo: React.FC<{
  streamUrl: string
  onClick?: () => void
  onVideoRef?: (el: HTMLVideoElement | null) => void
}> = ({ streamUrl, onClick, onVideoRef }) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamError, setStreamError] = useState(false)
  const youtubeEmbed = getYoutubeEmbedUrl(streamUrl)

  useEffect(() => {
    setStreamError(false)
    if (isYoutubeUrl(streamUrl)) return
    const videoEl = videoRef.current
    const playableCandidates = getWebPlayableStreamCandidates(streamUrl)
    if (!videoEl || playableCandidates.length === 0) {
      setStreamError(true)
      return
    }

    let hls: Hls | null = null
    let player: mpegts.Player | null = null
    let disposed = false
    const cleanupCurrent = () => {
      if (hls) hls.destroy()
      hls = null
      if (player) {
        player.pause()
        player.unload()
        player.detachMediaElement()
        player.destroy()
      }
      player = null
      videoEl.removeAttribute('src')
      videoEl.load()
    }

    const trySourceAt = (index: number) => {
      if (disposed) return
      if (index >= playableCandidates.length) {
        setStreamError(true)
        return
      }
      const source = playableCandidates[index]
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
            if (playResult && typeof playResult.then === 'function') playResult.catch(() => {})
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
          if (playResult && typeof playResult.then === 'function') playResult.catch(() => trySourceAt(index + 1))
          return
        }
        trySourceAt(index + 1)
        return
      }

      if (isWsStream && mpegts.isSupported()) {
        player = mpegts.createPlayer(
          { type: 'flv', url: source, isLive: true, hasAudio: false },
          { enableWorker: true, lazyLoad: false },
        )
        player.attachMediaElement(videoEl)
        player.load()
        const playResult = player.play()
        if (playResult && typeof playResult.then === 'function') playResult.catch(() => trySourceAt(index + 1))
        player.on(mpegts.Events.ERROR, () => {
          cleanupCurrent()
          trySourceAt(index + 1)
        })
        return
      }

      if (isMp4Stream) {
        videoEl.src = source
        const playResult = videoEl.play()
        if (playResult && typeof playResult.then === 'function') playResult.catch(() => trySourceAt(index + 1))
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
      setStreamError(true)
    }
    return () => {
      disposed = true
      cleanupCurrent()
    }
  }, [streamUrl])

  if (youtubeEmbed) {
    return (
      <div
        className="security_snapshot-placeholder"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        style={onClick ? { cursor: 'pointer' } : undefined}
      >
        <div className="security_yt-crop-wrap" style={{ width: '100%', height: '100%' }}>
          <iframe
            src={youtubeEmbed}
            title="snapshot-camera"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className="security_snapshot-placeholder"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <video
        ref={el => {
          (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el
          onVideoRef?.(el)
        }}
        className="camera_feed-video-element"
        autoPlay
        muted
        playsInline
        controls={false}
      />
      {streamError && (
        <div className="camera_feed-stream-error camera_feed-stream-error--signal">
          <CloseCircleOutlined className="camera_feed-stream-error-icon" />
          <div className="camera_feed-stream-error-text">{t('cameraLive.lostConnection', 'Mất kết nối')}</div>
        </div>
      )}
    </div>
  )
}

export default function SecurityMonitoring() {
  const { t } = useTranslation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const snapshotVideoRef = useRef<HTMLVideoElement | null>(null)
  const [videoModal, setVideoModal] = useState<{ visible: boolean; camera: string; time: string; streamUrl?: string }>({
    visible: false, camera: '', time: '', streamUrl: undefined,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCaptureSnapshot = () => {
    const video = snapshotVideoRef.current
    if (!video || video.readyState < 2) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `snapshot-${Date.now()}.png`
    a.click()
  }

  const handleCameraClick = (camera: string, time: string, streamUrl?: string) => {
    setVideoModal({ visible: true, camera, time, streamUrl })
  }

  const handleCloseModal = () => {
    setVideoModal({ visible: false, camera: '', time: '', streamUrl: undefined })
  }

  const formatDateTime = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      day: days[date.getDay()],
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    }
  }

  const dateTime = formatDateTime(currentTime)

  const alarms = [
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:34', type: 'Regional invasion' },
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:33', type: 'Regional invasion' },
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:32', type: 'Regional invasion' },
    { camera: 'CAM-A1-15 (Main)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:15:20', type: 'Motion detected' },
    { camera: 'CAM-C3-08 (Lobby)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:12:45', type: 'Regional invasion' },
    { camera: 'CAM-D2-22 (Parking)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:08:18', type: 'Access violation' },
  ]

  const captureColors = { strangers: '#ff4d4f', familiar: '#1890ff' } as const
  const captureRows = [
    { tagKey: 'strangers' as const, location: 'Area, Building 2, 2F', time: '2026-02-04 09:18:41' },
    { tagKey: 'familiar' as const, location: 'Office Area, Building 2, 3F', time: '2026-02-04 09:18:36' },
    { tagKey: 'strangers' as const, location: 'Office Area, Building 2, 2F', time: '2026-02-04 09:18:31' },
    { tagKey: 'familiar' as const, location: 'Office Area, Building 2, 2F', time: '2026-02-04 09:18:28' },
    { tagKey: 'familiar' as const, location: 'Sảnh tầng 1, Tòa A', time: '2026-02-23 08:15:22', image: '/security-faces/stored-face-1.png' },
    { tagKey: 'familiar' as const, location: 'Cổng vào, Tòa B', time: '2026-02-23 08:42:11', image: '/security-faces/stored-face-2.png' },
    { tagKey: 'familiar' as const, location: 'Văn phòng, Tòa B 2F', time: '2026-02-23 09:01:05', image: '/security-faces/stored-face-3.png' },
    { tagKey: 'familiar' as const, location: 'Sảnh tầng trệt', time: '2026-02-23 09:18:33', image: '/security-faces/stored-face-4.png' },
    { tagKey: 'familiar' as const, location: 'Khu họp, Tòa C', time: '2026-02-23 10:05:44', image: '/security-faces/stored-face-5.png' },
    { tagKey: 'familiar' as const, location: 'Hành lang 2F, Tòa A', time: '2026-02-23 10:22:18', image: '/security-faces/stored-face-6.png' },
    { tagKey: 'familiar' as const, location: 'Lobby, Tòa chính', time: '2026-02-23 11:00:02', image: '/security-faces/stored-face-7.png' },
  ]

  const captureRowsWithFaces = useMemo(
    () =>
      captureRows.map((row) => ({
        ...row,
        image: FACE_IMAGES[Math.floor(Math.random() * FACE_IMAGES.length)],
      })),
    [],
  )

  const captures = captureRowsWithFaces.map(row => ({
    tag: t(`security.${row.tagKey}`),
    tagColor: captureColors[row.tagKey],
    location: row.location,
    time: row.time,
    image: row.image,
  }))

  const cameras = [
    {
      label: 'Main Gate - CAM-01',
      sublabel: 'Vehicle entrance monitoring',
      camId: '1-1F-01',
      streamUrl: 'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8',
    },
    {
      label: 'Lobby - CAM-02',
      sublabel: 'Reception area surveillance',
      camId: '1-2F-05',
      streamUrl: resolveCameraStreamUrl('/hls/699e639f021a61a13ee1ce32/index.m3u8'),
    },
    {
      label: '1BKOP_CSV01 - CAM-03',
      sublabel: 'Highway Traffic',
      camId: 'B1-P-12',
      streamUrl: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
    },
  ]
  const [selectedSnapshotCamId, setSelectedSnapshotCamId] = useState(cameras[1]?.camId ?? cameras[0]?.camId ?? '')
  const selectedSnapshotCam =
    cameras.find((cam) => cam.camId === selectedSnapshotCamId) ?? cameras[0]

  return (
    <div className="security_root">
      <div className="security_bg" style={{ backgroundImage: `url(${securityBg})` }} />
      <div className="security_overlay" />

      <div className="security_header">
        <Text className="security_title">{t('security.title', 'Security monitoring center')}</Text>
        <div className="security_date-row">
          <Text className="text-base security_nav-arrow">◀ </Text>
          <Text className="text-base security_text-light">{dateTime.date}</Text>
          <Text className="text-base text-cyan security_date-separator">{dateTime.day}</Text>
          <Text className="text-lg font-bold font-mono security_text-aqua">{dateTime.time}</Text>
          <Text className="text-base security_nav-arrow"> ▶</Text>
        </div>
      </div>

      <div className="security_main">
        <div className="security_left-col">
          <GlassPanel
            title={t('security.videoAlarm', 'Video alarm')}
            icon={<AlertOutlined className="text-danger text-md" />}
            style={{ flex: 1 }}
          >
            <ScrollingAlarmList
              alarms={alarms}
              onCameraClick={() => handleCameraClick(cameras[1].label, dateTime.time, cameras[1].streamUrl)}
            />
          </GlassPanel>

          <GlassPanel
            className="security_quick-snapshot-panel"
            title={t('security.smartSnapshots', 'Quick snapshot')}
            icon={<CameraOutlined className="text-primary text-md" />}
            titleRight={
              <div className="security_glass-header-right">
                <div className="security_snapshot-top-row">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CameraOutlined />}
                    onClick={e => { e.stopPropagation(); handleCaptureSnapshot() }}
                    className="security_snapshot-capture-btn"
                  >
                    {t('security.screenshot', 'Chụp màn hình')}
                  </Button>
                  <Tag color="success" className="tag--no-margin text-xs">Online</Tag>
                </div>
                <span className="security_header-tags-same-row">
                  <Select
                    size="small"
                    value={selectedSnapshotCamId}
                    onChange={setSelectedSnapshotCamId}
                    className="security_snapshot-cam-select"
                    options={cameras.map((cam) => ({
                      value: cam.camId,
                      label: `${cam.camId} · ${cam.label}`,
                    }))}
                  />
                </span>
              </div>
            }
          >
            <SnapshotVideo
              streamUrl={selectedSnapshotCam.streamUrl!}
              onVideoRef={el => { snapshotVideoRef.current = el }}
              onClick={() => handleCameraClick(selectedSnapshotCam.label, dateTime.time, selectedSnapshotCam.streamUrl)}
            />
          </GlassPanel>

          <GlassPanel
            title={t('security.captureRecord', 'Capture record')}
            icon={<UserOutlined className="text-success text-md" />}
          >
            <ScrollingCaptureList captures={captures} />
          </GlassPanel>
        </div>

        <div className="flex-1" />

        <div className="security_right-col">
          <GlassPanel
            title={t('security.dynamicVideo', 'Dynamic video of entrances and exits')}
            icon={<EnvironmentOutlined className="text-success text-md" />}
            titleRight={<Text className="text-xs security_text-light">Viettel Headquarters Building Park</Text>}
          >
            <div className="security_dynamic-header">
              <Text className="text-cyan text-11 font-medium block">Building A - Floor 1F</Text>
              <Text className="text-xs security_text-light">3 cameras active • Real-time monitoring</Text>
            </div>
            <div className="flex flex-col gap-8">
              {cameras.map((cam, i) => (
                <CameraThumbnail
                  key={i}
                  {...cam}
                  isLive={i === 0}
                  onClick={cam.streamUrl ? () => handleCameraClick(cam.label, dateTime.time, cam.streamUrl) : undefined}
                />
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0, 50, 100, 0.3); border-radius: 2px; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 150, 255, 0.5); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 150, 255, 0.7); }
      `}</style>

      <CameraVideoModal
        visible={videoModal.visible}
        camera={videoModal.camera}
        time={videoModal.time}
        streamUrl={videoModal.streamUrl}
        onClose={handleCloseModal}
      />
    </div>
  )
}
