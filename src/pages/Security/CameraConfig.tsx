import { useMemo, useState } from 'react'
import { Button, Input, InputNumber, Select, Space, Switch, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ContentCard, PageContainer, PageHeader } from '@/components'

const { Text } = Typography

import type { RtspConversionMode } from '@/utils/streamUrl'

type CameraProtocol = 'hls' | 'ws-flv'

interface CameraGlobalConfig {
  defaultProtocol: CameraProtocol
  retryLimit: number
  bufferMs: number
  autoReconnect: boolean
  rtspConversionMode: RtspConversionMode
  rtspHlsPort: number
  rtspProxyBaseUrl: string
}

interface CameraItemConfig {
  id: string
  name: string
  floor: string
  enabled: boolean
  protocol: CameraProtocol
  streamUrl: string
}

const STORAGE_KEY_GLOBAL = 'securityCamera.globalConfig'
const STORAGE_KEY_ITEMS = 'securityCamera.itemConfig'

const defaultGlobalConfig: CameraGlobalConfig = {
  defaultProtocol: 'hls',
  retryLimit: 3,
  bufferMs: 1200,
  autoReconnect: true,
  rtspConversionMode: 'wss-proxy',
  rtspHlsPort: 8888,
  rtspProxyBaseUrl: 'wss://yuanqu.smartmk.cn:19993/proxy',
}

const seedCameraItems: CameraItemConfig[] = [
  { id: 'CAM-01', name: 'Lobby Main Entrance', floor: '1F', enabled: true, protocol: 'hls', streamUrl: 'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8' },
  { id: 'CAM-02', name: 'Parking Gate A', floor: 'B1', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-03', name: 'Elevator Hall 1F', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-04', name: 'Office Floor 3', floor: '3F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-05', name: 'Rooftop', floor: 'RF', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-06', name: 'Server Room', floor: 'B1', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-07', name: 'Parking Gate B', floor: 'B1', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-08', name: 'Meeting Room 5F', floor: '5F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-09', name: 'Fire Escape Stair', floor: '2F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-10', name: 'Loading Dock', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-11', name: 'Lobby Side Entrance', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '' },
  { id: 'CAM-12', name: 'Garden Area', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '' },
]

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function normalizeItems(items: CameraItemConfig[] | null): CameraItemConfig[] {
  if (!Array.isArray(items) || items.length === 0) return seedCameraItems
  const mapById = new Map(items.map(item => [item.id, item]))
  return seedCameraItems.map(seed => {
    const current = mapById.get(seed.id)
    if (!current) return seed
    return {
      ...seed,
      ...current,
      protocol: current.protocol === 'ws-flv' ? 'ws-flv' : 'hls',
      streamUrl: typeof current.streamUrl === 'string' ? current.streamUrl : '',
      enabled: current.enabled !== false,
    }
  })
}

export default function CameraConfig() {
  const { t } = useTranslation()
  const [globalConfig, setGlobalConfig] = useState<CameraGlobalConfig>(() => {
    const stored = readJson<Partial<CameraGlobalConfig>>(STORAGE_KEY_GLOBAL)
    return {
      defaultProtocol: stored?.defaultProtocol === 'ws-flv' ? 'ws-flv' : 'hls',
      retryLimit: typeof stored?.retryLimit === 'number' ? stored.retryLimit : defaultGlobalConfig.retryLimit,
      bufferMs: typeof stored?.bufferMs === 'number' ? stored.bufferMs : defaultGlobalConfig.bufferMs,
      autoReconnect: typeof stored?.autoReconnect === 'boolean' ? stored.autoReconnect : defaultGlobalConfig.autoReconnect,
      rtspConversionMode:
        stored?.rtspConversionMode === 'hls-direct' ? 'hls-direct' : 'wss-proxy',
      rtspHlsPort:
        typeof stored?.rtspHlsPort === 'number' && stored.rtspHlsPort > 0
          ? stored.rtspHlsPort
          : defaultGlobalConfig.rtspHlsPort,
      rtspProxyBaseUrl:
        typeof stored?.rtspProxyBaseUrl === 'string' && stored.rtspProxyBaseUrl.trim()
          ? stored.rtspProxyBaseUrl.trim()
          : defaultGlobalConfig.rtspProxyBaseUrl,
    }
  })
  const [cameraItems, setCameraItems] = useState<CameraItemConfig[]>(() => normalizeItems(readJson<CameraItemConfig[]>(STORAGE_KEY_ITEMS)))
  const [msgApi, msgContextHolder] = message.useMessage()

  const enabledCount = useMemo(() => cameraItems.filter(item => item.enabled).length, [cameraItems])

  const updateCameraItem = (id: string, patch: Partial<CameraItemConfig>) => {
    setCameraItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)))
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(globalConfig))
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(cameraItems))
    msgApi.success(t('cameraConfig.saved', 'Da luu cau hinh camera'))
  }

  const handleReset = () => {
    setGlobalConfig(defaultGlobalConfig)
    setCameraItems(seedCameraItems)
    localStorage.removeItem(STORAGE_KEY_GLOBAL)
    localStorage.removeItem(STORAGE_KEY_ITEMS)
    msgApi.success(t('cameraConfig.resetDone', 'Da dat lai cau hinh mac dinh'))
  }

  const columns: ColumnsType<CameraItemConfig> = [
    {
      title: t('cameraConfig.camera', 'Camera'),
      key: 'camera',
      render: (_, record) => (
        <div>
          <div>{record.name}</div>
          <Text type="secondary" className="text-12">{record.id} · {record.floor}</Text>
        </div>
      ),
      width: 220,
    },
    {
      title: t('cameraConfig.enabled', 'Kich hoat'),
      key: 'enabled',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => updateCameraItem(record.id, { enabled: checked })}
        />
      ),
    },
    {
      title: t('cameraConfig.protocol', 'Giao thuc'),
      key: 'protocol',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.protocol}
          onChange={(value) => updateCameraItem(record.id, { protocol: value as CameraProtocol })}
          options={[
            { value: 'hls', label: 'HLS' },
            { value: 'ws-flv', label: 'WS-FLV' },
          ]}
        />
      ),
    },
    {
      title: t('cameraConfig.streamUrl', 'Duong dan stream'),
      key: 'streamUrl',
      render: (_, record) => (
        <Input
          value={record.streamUrl}
          placeholder={t('cameraConfig.streamUrlPlaceholder', 'Nhap URL stream (m3u8 / wss://...)')}
          onChange={(event) => updateCameraItem(record.id, { streamUrl: event.target.value })}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      {msgContextHolder}
      <PageHeader
        title={t('cameraConfig.title', 'Cau hinh camera')}
        icon={<SettingOutlined />}
        subtitle={t('cameraConfig.subtitle', 'Thiet lap thong so cho he thong camera an ninh')}
        actions={
          <Space>
            <Button onClick={handleReset}>{t('cameraConfig.resetConfig', 'Dat lai')}</Button>
            <Button type="primary" onClick={handleSave}>{t('cameraConfig.saveConfig', 'Luu cau hinh')}</Button>
          </Space>
        }
      />

      <ContentCard title={t('cameraConfig.stream', 'Cau hinh luong phat')}>
        <Space direction="vertical" size={12} className="w-full">
          <div>
            <Text>{t('cameraConfig.defaultProtocol', 'Giao thuc mac dinh')}</Text>
            <Select
              className="w-full mt-4"
              value={globalConfig.defaultProtocol}
              onChange={(value) => setGlobalConfig(prev => ({ ...prev, defaultProtocol: value as CameraProtocol }))}
              options={[
                { value: 'hls', label: 'HLS (.m3u8)' },
                { value: 'ws-flv', label: 'WS-FLV (wss://)' },
              ]}
            />
          </div>
          <div>
            <Text>{t('cameraConfig.retryLimit', 'So lan thu lai')}</Text>
            <InputNumber
              min={1}
              max={10}
              value={globalConfig.retryLimit}
              onChange={(value) => setGlobalConfig(prev => ({ ...prev, retryLimit: Number(value) || 1 }))}
              className="w-full mt-4"
            />
          </div>
          <div>
            <Text>{t('cameraConfig.bufferMs', 'Bo dem phat (ms)')}</Text>
            <InputNumber
              min={200}
              max={10000}
              step={100}
              value={globalConfig.bufferMs}
              onChange={(value) => setGlobalConfig(prev => ({ ...prev, bufferMs: Number(value) || 200 }))}
              className="w-full mt-4"
            />
          </div>
          <div className="flex items-center gap-8">
            <Switch
              checked={globalConfig.autoReconnect}
              onChange={(checked) => setGlobalConfig(prev => ({ ...prev, autoReconnect: checked }))}
            />
            <Text>{t('cameraConfig.autoReconnect', 'Tu dong ket noi lai')}</Text>
          </div>
          <div>
            <Text>{t('cameraConfig.rtspConversionMode', 'Chế độ chuyển đổi RTSP')}</Text>
            <Select
              className="w-full mt-4"
              value={globalConfig.rtspConversionMode}
              onChange={(value) =>
                setGlobalConfig((prev) => ({ ...prev, rtspConversionMode: value as 'hls-direct' | 'wss-proxy' }))
              }
              options={[
                { value: 'hls-direct', label: 'HLS trực tiếp (rtsp → http://host:port/path/index.m3u8)' },
                { value: 'wss-proxy', label: 'WSS Proxy (rtsp → wss://proxy/host:port/openUrl/path)' },
              ]}
            />
          </div>
          {globalConfig.rtspConversionMode === 'hls-direct' ? (
            <div>
              <Text>{t('cameraConfig.rtspHlsPort', 'HLS port (mặc định 8888)')}</Text>
              <InputNumber
                min={1}
                max={65535}
                value={globalConfig.rtspHlsPort}
                onChange={(value) =>
                  setGlobalConfig((prev) => ({ ...prev, rtspHlsPort: Number(value) || 8888 }))
                }
                className="w-full mt-4"
              />
            </div>
          ) : (
            <div>
              <Text>{t('cameraConfig.rtspProxyBaseUrl', 'RTSP proxy base URL')}</Text>
              <Input
                value={globalConfig.rtspProxyBaseUrl}
                onChange={(event) =>
                  setGlobalConfig((prev) => ({ ...prev, rtspProxyBaseUrl: event.target.value }))
                }
                placeholder="wss://yuanqu.smartmk.cn:19993/proxy"
                className="mt-4"
              />
            </div>
          )}
        </Space>
      </ContentCard>

      <ContentCard
        title={t('cameraConfig.byCamera', 'Cau hinh theo camera')}
        titleExtra={
          <Text type="secondary">
            {enabledCount}/{cameraItems.length} {t('cameraConfig.activeCameras', 'camera dang kich hoat')}
          </Text>
        }
      >
        <Table<CameraItemConfig>
          rowKey="id"
          columns={columns}
          dataSource={cameraItems}
          pagination={false}
          scroll={{ x: 920 }}
        />
      </ContentCard>

      <ContentCard title={t('cameraConfig.permissions', 'Quyen va bao mat')}>
        <Text type="secondary">
          {t(
            'cameraConfig.permissionsNote',
            'Cau hinh phan quyen xem camera theo khu vuc/tang va chinh sach luu tru ban ghi.'
          )}
        </Text>
      </ContentCard>
    </PageContainer>
  )
}
