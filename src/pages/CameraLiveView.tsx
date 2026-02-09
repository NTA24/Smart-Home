import { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Select,
  Tag,
  Badge,
  Button,
  Tooltip,
  Segmented,
  Empty,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  VideoCameraOutlined,
  ExpandOutlined,
  SoundOutlined,
  FullscreenOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

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
}

const cameras: Camera[] = [
  { id: 'CAM-01', name: 'Lobby Main Entrance', location: 'Lobby A', floor: '1F', status: 'recording', type: 'indoor', resolution: '1080p' },
  { id: 'CAM-02', name: 'Parking Gate A', location: 'Parking', floor: 'B1', status: 'recording', type: 'outdoor', resolution: '4K' },
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

const statusConfig = {
  online: { color: '#52c41a', label: 'online' },
  offline: { color: '#ff4d4f', label: 'offline' },
  recording: { color: '#1890ff', label: 'recording' },
}

type GridLayout = '2x2' | '3x3' | '4x4'

// ─── Camera Feed Card ───────────────────────────────────────
function CameraFeed({ camera, t, compact }: { camera: Camera; t: (key: string, fallback?: string) => string; compact?: boolean }) {
  const stCfg = statusConfig[camera.status]

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        height: '100%',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Video area placeholder */}
      <div
        style={{
          background: camera.status === 'offline'
            ? 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 100%)',
          height: compact ? 140 : 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {camera.status === 'offline' ? (
          <div style={{ textAlign: 'center' }}>
            <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 8 }} />
            <div style={{ color: '#ff4d4f', fontSize: 12 }}>{t('cameraLive.signalLost', 'Signal Lost')}</div>
          </div>
        ) : (
          <>
            {/* Simulated camera view */}
            <VideoCameraOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }} />

            {/* Recording indicator */}
            {camera.status === 'recording' && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(255, 0, 0, 0.8)',
                  borderRadius: 4,
                  padding: '2px 8px',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>REC</span>
              </div>
            )}

            {/* Timestamp */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                color: 'rgba(255,255,255,0.7)',
                fontSize: 10,
                fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 6px',
                borderRadius: 3,
              }}
            >
              {new Date().toLocaleTimeString()} · {camera.resolution}
            </div>

            {/* Controls overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                display: 'flex',
                gap: 4,
              }}
            >
              <Tooltip title={t('cameraLive.fullscreen', 'Fullscreen')}>
                <Button
                  size="small"
                  type="text"
                  icon={<FullscreenOutlined />}
                  style={{ color: '#fff', background: 'rgba(0,0,0,0.4)', borderRadius: 4, width: 26, height: 26 }}
                />
              </Tooltip>
              <Tooltip title={t('cameraLive.sound', 'Sound')}>
                <Button
                  size="small"
                  type="text"
                  icon={<SoundOutlined />}
                  style={{ color: '#fff', background: 'rgba(0,0,0,0.4)', borderRadius: 4, width: 26, height: 26 }}
                />
              </Tooltip>
            </div>

            {/* Camera name overlay */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#fff',
                fontSize: 10,
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 8px',
                borderRadius: 3,
              }}
            >
              {camera.id}
            </div>
          </>
        )}
      </div>

      {/* Info bar */}
      <div style={{ padding: compact ? '8px 10px' : '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: compact ? 11 : 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {camera.name}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>
              <EnvironmentOutlined />
              <span>{camera.location} · {camera.floor}</span>
            </div>
          </div>
          <Badge
            status={camera.status === 'offline' ? 'error' : camera.status === 'recording' ? 'processing' : 'success'}
            text={<span style={{ fontSize: 10 }}>{t(`cameraLive.${stCfg.label}`, stCfg.label)}</span>}
          />
        </div>
      </div>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function CameraLiveView() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [gridLayout, setGridLayout] = useState<GridLayout>('3x3')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const floors = [...new Set(cameras.map(c => c.floor))]

  const filteredCameras = cameras.filter(c => {
    if (floorFilter !== 'all' && c.floor !== floorFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  const colSpan = gridLayout === '2x2' ? 12 : gridLayout === '3x3' ? 8 : 6

  // Summary
  const onlineCount = cameras.filter(c => c.status !== 'offline').length
  const recordingCount = cameras.filter(c => c.status === 'recording').length
  const offlineCount = cameras.filter(c => c.status === 'offline').length

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined />
            {t('cameraLive.title', 'Live View')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || t('cameraLive.allSites', 'All sites')} — {onlineCount} {t('cameraLive.online', 'online')}, {recordingCount} {t('cameraLive.recording', 'recording')}, {offlineCount} {t('cameraLive.offline', 'offline')}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Segmented
            value={gridLayout}
            onChange={(val) => setGridLayout(val as GridLayout)}
            options={[
              { value: '2x2', label: '2×2' },
              { value: '3x3', label: '3×3' },
              { value: '4x4', label: '4×4' },
            ]}
            style={{ background: '#f0f0f0', borderRadius: 10, padding: 2, fontWeight: 600 }}
          />
          <div style={{ width: 1, height: 24, background: '#e0e0e0' }} />
          <Select
            value={floorFilter}
            style={{ width: 120 }}
            size="small"
            onChange={setFloorFilter}
            options={[
              { value: 'all', label: t('cameraLive.allFloors', 'All Floors') },
              ...floors.map(f => ({ value: f, label: f })),
            ]}
          />
          <Select
            value={statusFilter}
            style={{ width: 130 }}
            size="small"
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: t('cameraLive.allStatus', 'All Status') },
              { value: 'online', label: t('cameraLive.online', 'Online') },
              { value: 'recording', label: t('cameraLive.recording', 'Recording') },
              { value: 'offline', label: t('cameraLive.offline', 'Offline') },
            ]}
          />
          <Tooltip title={t('cameraLive.refresh', 'Refresh')}>
            <Button size="small" icon={<ReloadOutlined />} />
          </Tooltip>
        </div>
      </div>

      {/* Camera Grid */}
      {filteredCameras.length === 0 ? (
        <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Empty description={t('cameraLive.noCameras', 'No cameras found')} />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {filteredCameras.map((camera) => (
            <Col xs={24} sm={12} lg={colSpan} key={camera.id}>
              <CameraFeed camera={camera} t={t} compact={gridLayout === '4x4'} />
            </Col>
          ))}
        </Row>
      )}

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
