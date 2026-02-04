import { useState, useEffect } from 'react'
import { Typography, Badge, Tag, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  AlertOutlined,
  CameraOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CloseOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import securityBg from '../assets/security-bg-2.png'
import alertIcon from '../assets/alert-icon.png'
import cameraItemIcon from '../assets/camera-item.png'
import cameraIcon from '../assets/camera-icon.png'
import cameraPreview from '../assets/camera-preview.png'

const { Text } = Typography

// Panel component with glass effect
const GlassPanel: React.FC<{
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
  titleRight?: React.ReactNode
}> = ({ title, icon, children, style, titleRight }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(0, 40, 80, 0.85) 0%, rgba(0, 20, 50, 0.9) 100%)',
    border: '1px solid rgba(0, 150, 255, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    ...style
  }}>
    <div style={{
      padding: '6px 12px',
      borderBottom: '1px solid rgba(0, 150, 255, 0.3)',
      background: 'linear-gradient(90deg, rgba(0, 100, 180, 0.5) 0%, transparent 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={{ color: '#00d4ff', fontSize: 12, fontWeight: 600 }}>{title}</Text>
      </div>
      {titleRight}
    </div>
    <div style={{ padding: 8 }}>{children}</div>
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
  <div style={{
    position: 'relative',
    padding: '8px 12px 8px 34px',
    borderBottom: '1px solid rgba(0, 120, 180, 0.35)',
    background: 'rgba(6, 35, 70, 0.35)',
  }}>
    <div style={{
      position: 'absolute',
      left: 6,
      top: 10,
      width: 16,
      height: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src={alertIcon}
        alt=""
        style={{
          width: 16,
          height: 16,
          filter: 'drop-shadow(0 0 4px rgba(255, 77, 79, 0.7))',
        }}
      />
    </div>

    {/* Content */}
    <div style={{ minWidth: 0, paddingRight: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{
          color: '#e6f2ff',
          fontSize: 12,
          fontWeight: 500,
        }}>{camera}</Text>
        <Text style={{ color: '#ff6b6b', fontSize: 11 }}>{type}</Text>
      </div>
      <Text style={{
        color: '#8ecae6',
        fontSize: 10,
        display: 'block',
        marginTop: 2,
      }}>{location}</Text>
      <Text style={{ color: '#5a9fcf', fontSize: 9 }}>{time}</Text>
    </div>

    {/* Camera icon on right */}
    <div
      onClick={(e) => {
        e.stopPropagation()
        onCameraClick?.()
      }}
      style={{
        position: 'absolute',
        right: 8,
        top: 10,
        width: 18,
        height: 18,
        borderRadius: 3,
        background: 'rgba(0, 120, 180, 0.35)',
        border: '1px solid rgba(120, 200, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 6px rgba(0, 160, 255, 0.35)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
      <img
        src={cameraIcon}
        alt=""
        style={{ width: 14, height: 14, display: 'block' }}
      />
    </div>
  </div>
)

// Camera video modal component
const CameraVideoModal: React.FC<{
  visible: boolean
  camera: string
  time: string
  onClose: () => void
}> = ({ visible, camera, time, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (visible) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }
  }, [visible])

  const formatTime = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${days[date.getDay()]} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={420}
      styles={{
        content: {
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
        },
        mask: {
          background: 'rgba(0, 10, 30, 0.85)',
        }
      }}
    >
      <div style={{
        background: 'linear-gradient(180deg, #0a2a4a 0%, #061a30 100%)',
        border: '1px solid rgba(0, 150, 255, 0.5)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(0, 80, 140, 0.6) 0%, rgba(0, 50, 100, 0.4) 100%)',
          borderBottom: '1px solid rgba(0, 150, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600 }}>{camera}</Text>
          <CloseOutlined
            onClick={onClose}
            style={{
              color: '#8ecae6',
              fontSize: 14,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
          />
        </div>

        {/* Video area */}
        <div style={{
          position: 'relative',
          height: 240,
          background: 'linear-gradient(135deg, #1a2a3a 0%, #0a1520 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Play button */}
          <PlayCircleOutlined style={{
            fontSize: 64,
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            filter: 'drop-shadow(0 0 20px rgba(0, 150, 255, 0.5))',
          }} />

          {/* Timestamp overlay */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '4px 8px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 3,
          }}>
            <Text style={{ color: '#00ff88', fontSize: 11, fontFamily: 'monospace' }}>
              {formatTime(currentTime)}
            </Text>
          </div>

          {/* Camera name overlay */}
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            padding: '4px 8px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 3,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 11 }}>
              {camera}
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Scrolling alarm list component
const ScrollingAlarmList: React.FC<{
  alarms: Array<{
    camera: string
    location: string
    time: string
    type: string
  }>
  onCameraClick: (camera: string, time: string) => void
}> = ({ alarms, onCameraClick }) => {
  const [offset, setOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const itemHeight = 64

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % (alarms.length * 2))
    }, 3000) // Scroll every 3 seconds
    return () => clearInterval(timer)
  }, [alarms.length, isPaused])

  // Duplicate alarms for seamless loop
  const displayAlarms = [...alarms, ...alarms]

  return (
    <div
      style={{
        height: 240,
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{
        position: 'absolute',
        left: 14,
        top: 8,
        bottom: 8,
        borderLeft: '1px dashed rgba(0, 200, 255, 0.35)',
      }} />
      <div style={{
        transform: `translateY(-${offset * itemHeight}px)`,
        transition: 'transform 0.8s ease-in-out',
      }}>
        {displayAlarms.map((alarm, i) => (
          <VideoAlarmItem
            key={i}
            {...alarm}
            onCameraClick={() => onCameraClick(alarm.camera, alarm.time)}
          />
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
}> = ({ label, sublabel, isLive, camId }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimestamp = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }

  return (
    <div style={{
      background: 'rgba(0, 40, 80, 0.6)',
      border: '1px solid rgba(0, 150, 255, 0.4)',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Camera preview area */}
      <div style={{
        height: 140,
        position: 'relative',
        backgroundImage: `url(${cameraPreview})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Timestamp overlay */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: 6,
          padding: '2px 6px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 2,
        }}>
          <Text style={{ color: '#00ff88', fontSize: 9, fontFamily: 'monospace' }}>
            {formatTimestamp(currentTime)}
          </Text>
        </div>

        {/* Live badge */}
        {isLive && (
          <div style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: '#ff4d4f',
            borderRadius: 2,
            padding: '2px 6px',
          }}>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: 600 }}>LIVE</Text>
          </div>
        )}

        {/* Camera ID overlay */}
        <div style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          padding: '2px 6px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 2,
        }}>
          <Text style={{ color: '#ffffff', fontSize: 9 }}>
            {camId || label.split(' - ')[1]}
          </Text>
        </div>
      </div>

      {/* Info bar */}
      <div style={{
        padding: '6px 8px',
        background: 'linear-gradient(180deg, rgba(0, 50, 90, 0.9) 0%, rgba(0, 30, 60, 0.95) 100%)',
        borderTop: '1px solid rgba(0, 150, 255, 0.3)',
      }}>
        <Text style={{ color: '#00d4ff', fontSize: 10, fontWeight: 500, display: 'block' }}>{label}</Text>
        {sublabel && <Text style={{ color: '#8ecae6', fontSize: 9 }}>{sublabel}</Text>}
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
}> = ({ tag, tagColor, location, time }) => (
  <div style={{
    width: 70,
    flexShrink: 0,
    background: 'rgba(0, 40, 80, 0.6)',
    border: '1px solid rgba(0, 150, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  }}>
    <div style={{
      height: 70,
      background: 'linear-gradient(135deg, #2a4a6c 0%, #1d3850 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <UserOutlined style={{ fontSize: 28, color: '#4a7a9c', opacity: 0.6 }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: tagColor,
        padding: '1px 4px',
        textAlign: 'center',
      }}>
        <Text style={{ color: '#fff', fontSize: 8 }}>{tag}</Text>
      </div>
    </div>
    <div style={{ padding: '3px 4px', background: 'rgba(0, 30, 60, 0.8)' }}>
      <Text style={{ color: '#8ecae6', fontSize: 7, display: 'block' }}>{location}</Text>
      <Text style={{ color: '#5a9fcf', fontSize: 7 }}>{time}</Text>
    </div>
  </div>
)

// Scrolling capture list component
const ScrollingCaptureList: React.FC<{
  captures: Array<{
    tag: string
    tagColor: string
    location: string
    time: string
  }>
}> = ({ captures }) => {
  const [offset, setOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const itemWidth = 76 // 70px width + 6px gap

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % captures.length)
    }, 2000) // Scroll every 2 seconds
    return () => clearInterval(timer)
  }, [captures.length, isPaused])

  // Duplicate captures for seamless loop
  const displayCaptures = [...captures, ...captures, ...captures]

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{
        display: 'flex',
        gap: 6,
        transform: `translateX(-${offset * itemWidth}px)`,
        transition: 'transform 0.5s ease-in-out',
      }}>
        {displayCaptures.map((cap, i) => (
          <FaceCapture key={i} {...cap} />
        ))}
      </div>
    </div>
  )
}

export default function SecurityMonitoring() {
  const { t } = useTranslation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [videoModal, setVideoModal] = useState<{ visible: boolean; camera: string; time: string }>({
    visible: false,
    camera: '',
    time: ''
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCameraClick = (camera: string, time: string) => {
    setVideoModal({ visible: true, camera, time })
  }

  const handleCloseModal = () => {
    setVideoModal({ visible: false, camera: '', time: '' })
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

  // Sample data - Video alarms
  const alarms = [
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:34', type: 'Regional invasion' },
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:33', type: 'Regional invasion' },
    { camera: 'CAM-BF-32 (Increased)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:18:32', type: 'Regional invasion' },
    { camera: 'CAM-A1-15 (Main)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:15:20', type: 'Motion detected' },
    { camera: 'CAM-C3-08 (Lobby)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:12:45', type: 'Regional invasion' },
    { camera: 'CAM-D2-22 (Parking)', location: 'Viettel Headquarters Building Park', time: '2026-02-04 09:08:18', type: 'Access violation' },
  ]

  const captures = [
    { tag: 'Strangers', tagColor: '#1890ff', location: 'Area, Building 2, 2F', time: '2026-02-04 09:18:41' },
    { tag: 'Strangers', tagColor: '#1890ff', location: 'Office Area, Building 2, 3F', time: '2026-02-04 09:18:36' },
    { tag: 'Strangers', tagColor: '#1890ff', location: 'Office Area, Building 2, 2F', time: '2026-02-04 09:18:31' },
    { tag: 'Strangers', tagColor: '#ff4d4f', location: 'Office Area, Building 2, 2F', time: '2026-02-04 09:18:28' },
  ]

  const cameras = [
    { label: 'Main Gate - CAM-01', sublabel: 'Vehicle entrance monitoring', camId: '1-1F-01' },
    { label: 'Lobby - CAM-02', sublabel: 'Reception area surveillance', camId: '1-2F-05' },
    { label: 'Parking B1 - CAM-03', sublabel: 'Underground parking exit', camId: 'B1-P-12' },
  ]

  return (
    <div style={{
      minHeight: 'calc(100vh - 112px)',
      margin: -24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${securityBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.9)',
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,20,40,0.3) 0%, rgba(0,20,40,0.1) 50%, rgba(0,20,40,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '12px 0',
        background: 'linear-gradient(180deg, rgba(0, 40, 80, 0.9) 0%, rgba(0, 30, 60, 0.7) 100%)',
        borderBottom: '2px solid rgba(0, 150, 255, 0.5)',
      }}>
        <Text style={{
          color: '#00d4ff',
          fontSize: 24,
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(0, 200, 255, 0.5)',
          letterSpacing: 4,
        }}>
          {t('security.title', 'Security monitoring center')}
        </Text>
        <div style={{ marginTop: 6 }}>
          <Text style={{ color: '#5a9fcf', fontSize: 13 }}>◀ </Text>
          <Text style={{ color: '#8ecae6', fontSize: 13 }}>{dateTime.date}</Text>
          <Text style={{ color: '#00d4ff', fontSize: 13, margin: '0 12px' }}>{dateTime.day}</Text>
          <Text style={{
            color: '#00ffff',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
          }}>{dateTime.time}</Text>
          <Text style={{ color: '#5a9fcf', fontSize: 13 }}> ▶</Text>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        padding: 12,
        gap: 12,
        height: 'calc(100vh - 180px)',
      }}>
        {/* Left Column */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Video Alarm */}
          <GlassPanel
            title={t('security.videoAlarm', 'Video alarm')}
            icon={<AlertOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />}
            style={{ flex: 1 }}
          >
            <ScrollingAlarmList alarms={alarms} onCameraClick={handleCameraClick} />
          </GlassPanel>

          {/* Smart Snapshots */}
          <GlassPanel
            title={t('security.smartSnapshots', 'Smart snapshots')}
            icon={<CameraOutlined style={{ color: '#1890ff', fontSize: 14 }} />}
            titleRight={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="processing" style={{ fontSize: 9, margin: 0 }}>2-2F-32 (Increased)</Tag>
                <Tag color="success" style={{ fontSize: 9, margin: 0 }}>Online</Tag>
              </div>
            }
          >
            <div style={{
              background: 'rgba(0, 60, 100, 0.4)',
              padding: 8,
              borderRadius: 4,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <UserOutlined style={{ color: '#faad14', fontSize: 16 }} />
              <Text style={{ color: '#8ecae6', fontSize: 11 }}>
                {t('security.personnelToday', 'Number of Permanent Personnel Today')}:
              </Text>
              <Badge count={14} style={{ backgroundColor: '#faad14' }} />
              <Text style={{ color: '#8ecae6', fontSize: 10 }}>{t('security.people', 'people')}</Text>
            </div>
            <div style={{
              height: 100,
              background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2840 100%)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 150, 255, 0.3)',
              position: 'relative',
            }}>
              <CameraOutlined style={{ fontSize: 32, color: '#3a7ca5', opacity: 0.4 }} />
              <div style={{ position: 'absolute', top: 4, left: 4 }}>
                <Text style={{ color: '#faad14', fontSize: 9 }}>Mo-TM {t('security.meetingRoom', 'Meeting Room')}</Text>
              </div>
              <div style={{ position: 'absolute', top: 4, right: 4 }}>
                <Text style={{ color: '#00d4ff', fontSize: 9 }}>09:30:11</Text>
              </div>
            </div>
          </GlassPanel>

          {/* Capture Record */}
          <GlassPanel
            title={t('security.captureRecord', 'Capture record')}
            icon={<UserOutlined style={{ color: '#52c41a', fontSize: 14 }} />}
          >
            <ScrollingCaptureList captures={captures} />
          </GlassPanel>
        </div>

        {/* Center - Empty space for building view */}
        <div style={{ flex: 1 }} />

        {/* Right Column */}
        <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Dynamic Video */}
          <GlassPanel
            title={t('security.dynamicVideo', 'Dynamic video of entrances and exits')}
            icon={<EnvironmentOutlined style={{ color: '#52c41a', fontSize: 14 }} />}
            titleRight={
              <Text style={{ color: '#8ecae6', fontSize: 9 }}>Viettel Headquarters Building Park</Text>
            }
          >
            <div style={{
              marginBottom: 8,
              background: 'rgba(0, 60, 100, 0.4)',
              padding: '6px 10px',
              borderRadius: 4,
            }}>
              <Text style={{ color: '#00d4ff', fontSize: 11, fontWeight: 500, display: 'block' }}>
                Building A - Floor 1F
              </Text>
              <Text style={{ color: '#8ecae6', fontSize: 9 }}>
                3 cameras active • Real-time monitoring
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cameras.map((cam, i) => (
                <CameraThumbnail key={i} {...cam} isLive={i === 0} />
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 50, 100, 0.3);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 150, 255, 0.5);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 150, 255, 0.7);
        }
      `}</style>

      {/* Camera Video Modal */}
      <CameraVideoModal
        visible={videoModal.visible}
        camera={videoModal.camera}
        time={videoModal.time}
        onClose={handleCloseModal}
      />
    </div>
  )
}
