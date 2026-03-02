import { useMemo, useState } from 'react'
import { Button, Input, InputNumber, Modal, Select, Space, Switch, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ContentCard, PageContainer, PageHeader } from '../../components'

const { Text } = Typography

import type { RtspConversionMode } from '../../utils/streamUrl'

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
  viewPermission?: string
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
  rtspProxyBaseUrl: '',
}

const seedCameraItems: CameraItemConfig[] = [
  { id: 'CAM-01', name: 'Lobby Main Entrance', floor: '1F', enabled: true, protocol: 'hls', streamUrl: 'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8', viewPermission: '' },
  { id: 'CAM-02', name: 'Parking Gate A', floor: 'B1', enabled: true, protocol: 'ws-flv', streamUrl: '', viewPermission: '' },
  { id: 'CAM-03', name: 'Elevator Hall 1F', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-04', name: 'Office Floor 3', floor: '3F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-05', name: 'Rooftop', floor: 'RF', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-06', name: 'Server Room', floor: 'B1', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-07', name: 'Parking Gate B', floor: 'B1', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-08', name: '1BKOP_CSV04', floor: '1F', enabled: true, protocol: 'hls', streamUrl: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP-CSV04.stream/playlist.m3u8', viewPermission: '' },
  { id: 'CAM-09', name: 'Fire Escape Stair', floor: '2F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-10', name: 'Loading Dock', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-11', name: 'Lobby Side Entrance', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
  { id: 'CAM-12', name: 'Garden Area', floor: '1F', enabled: true, protocol: 'hls', streamUrl: '', viewPermission: '' },
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

function toStr(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return String(v)
}

function normalizeItems(items: CameraItemConfig[] | null): CameraItemConfig[] {
  if (!Array.isArray(items) || items.length === 0) return seedCameraItems
  const mapById = new Map(items.map(item => [toStr(item.id), item]))
  return seedCameraItems.map(seed => {
    const current = mapById.get(seed.id)
    if (!current) return seed
    return {
      id: seed.id,
      name: toStr(current.name),
      floor: toStr(current.floor),
      enabled: current.enabled !== false,
      protocol: current.protocol === 'ws-flv' ? 'ws-flv' : 'hls',
      streamUrl: typeof current.streamUrl === 'string' ? current.streamUrl : '',
      viewPermission: typeof current.viewPermission === 'string' ? current.viewPermission : '',
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
  const [editingCamera, setEditingCamera] = useState<CameraItemConfig | null>(null)
  const [editForm, setEditForm] = useState<Partial<CameraItemConfig>>({})

  const enabledCount = useMemo(() => cameraItems.filter(item => item.enabled).length, [cameraItems])

  const updateCameraItem = (id: string, patch: Partial<CameraItemConfig>) => {
    const sid = toStr(id)
    setCameraItems(prev => prev.map(item => (toStr(item.id) === sid ? { ...item, ...patch } : item)))
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

  const openEditModal = (record: CameraItemConfig) => {
    setEditingCamera(record)
    setEditForm({
      name: toStr(record.name),
      floor: toStr(record.floor),
      enabled: record.enabled,
      protocol: record.protocol === 'ws-flv' ? 'ws-flv' : 'hls',
      streamUrl: toStr(record.streamUrl),
      viewPermission: toStr(record.viewPermission ?? ''),
    })
  }

  const closeEditModal = () => {
    setEditingCamera(null)
    setEditForm({})
  }

  const saveEditModal = () => {
    if (!editingCamera) return
    updateCameraItem(toStr(editingCamera.id), {
      name: editForm.name ?? editingCamera.name,
      floor: editForm.floor ?? editingCamera.floor,
      enabled: editForm.enabled ?? editingCamera.enabled,
      protocol: (editForm.protocol as CameraProtocol) ?? editingCamera.protocol,
      streamUrl: editForm.streamUrl ?? editingCamera.streamUrl,
      viewPermission: editForm.viewPermission ?? editingCamera.viewPermission ?? '',
    })
    msgApi.success(t('cameraConfig.editSaved', 'Đã cập nhật thông tin camera'))
    closeEditModal()
  }

  const columns: ColumnsType<CameraItemConfig> = [
    {
      title: t('cameraConfig.camera', 'Camera'),
      key: 'camera',
      render: (_, record) => (
        <div>
          <div>{toStr(record.name)}</div>
          <Text type="secondary" className="text-12">{toStr(record.id)} · {toStr(record.floor)}</Text>
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
          checked={!!record.enabled}
          onChange={(checked) => updateCameraItem(toStr(record.id), { enabled: checked })}
        />
      ),
    },
    {
      title: t('cameraConfig.protocol', 'Giao thuc'),
      key: 'protocol',
      width: 150,
      render: (_, record) => (
        <Select
          value={record.protocol === 'ws-flv' ? 'ws-flv' : 'hls'}
          onChange={(value) => updateCameraItem(toStr(record.id), { protocol: value as CameraProtocol })}
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
          value={toStr(record.streamUrl)}
          placeholder={t('cameraConfig.streamUrlPlaceholder', 'Nhap URL stream (m3u8 / wss://...)')}
          onChange={(event) => updateCameraItem(toStr(record.id), { streamUrl: event.target.value })}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
        >
          {t('cameraConfig.edit', 'Chỉnh sửa')}
        </Button>
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
            <Text>{t('cameraConfig.rtspConversionMode')}</Text>
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
          {globalConfig.rtspConversionMode === 'hls-direct' && (
            <div>
              <Text>{t('cameraConfig.rtspHlsPort')}</Text>
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
          )}
          {globalConfig.rtspConversionMode === 'wss-proxy' && (
            <div>
              <Text>{t('cameraConfig.rtspProxyBaseUrl')}</Text>
              <Input
                className="w-full mt-4"
                value={globalConfig.rtspProxyBaseUrl}
                onChange={(e) =>
                  setGlobalConfig((prev) => ({ ...prev, rtspProxyBaseUrl: e.target.value.trim() }))
                }
                placeholder="wss://your-proxy.com:19993/proxy"
              />
              {cameraItems.some((c) => String(c.streamUrl || '').trim().toLowerCase().startsWith('rtsp://')) && !globalConfig.rtspProxyBaseUrl?.trim() && (
                <Text type="warning" className="block mt-4 text-sm">
                  {t('cameraConfig.rtspProxyRequired', 'Có camera dùng URL RTSP. Để phát qua WebSocket, nhập URL Proxy WSS ở trên rồi bấm Lưu cấu hình.')}
                </Text>
              )}
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
          rowKey={(record) => toStr(record.id)}
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

      <Modal
        title={t('cameraConfig.editCamera', 'Chỉnh sửa thông tin camera')}
        open={editingCamera != null}
        onCancel={closeEditModal}
        onOk={saveEditModal}
        okText={t('cameraConfig.save', 'Lưu')}
        cancelText={t('cameraConfig.cancel', 'Hủy')}
        width={520}
        destroyOnClose
      >
        {editingCamera && (
          <Space direction="vertical" size={12} className="w-full camcfg_modal-space">
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.cameraId', 'Mã camera')}</Text>
              <Text strong>{toStr(editingCamera.id)}</Text>
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.name', 'Tên')}</Text>
              <Input
                value={toStr(editForm.name ?? '')}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('cameraConfig.namePlaceholder', 'Tên camera')}
                className="w-full"
              />
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.floor', 'Tầng')}</Text>
              <Input
                value={toStr(editForm.floor ?? '')}
                onChange={(e) => setEditForm(prev => ({ ...prev, floor: e.target.value }))}
                placeholder="1F, B1, ..."
                className="w-full"
              />
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.streamUrl', 'Đường dẫn stream')}</Text>
              <Input
                value={toStr(editForm.streamUrl ?? '')}
                onChange={(e) => setEditForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                placeholder={t('cameraConfig.streamUrlPlaceholder', 'Nhập URL stream (m3u8 / wss/...)')}
                className="w-full"
              />
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.enabled', 'Kích hoạt')}</Text>
              <div className="camcfg_switch-row">
                <Switch
                  checked={editForm.enabled ?? editingCamera.enabled}
                  onChange={(checked) => setEditForm(prev => ({ ...prev, enabled: checked }))}
                />
                <Text className="camcfg_switch-label">
                  {(editForm.enabled ?? editingCamera.enabled)
                    ? t('cameraConfig.statusOn', 'Đang bật')
                    : t('cameraConfig.statusOff', 'Đang tắt')}
                </Text>
              </div>
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.protocol', 'Giao thức')}</Text>
              <Select
                value={(editForm.protocol ?? editingCamera.protocol) === 'ws-flv' ? 'ws-flv' : 'hls'}
                onChange={(value) => setEditForm(prev => ({ ...prev, protocol: value as CameraProtocol }))}
                options={[
                  { value: 'hls', label: 'HLS' },
                  { value: 'ws-flv', label: 'WS-FLV' },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <Text type="secondary" className="block mb-1">{t('cameraConfig.viewPermission', 'Phân quyền')}</Text>
              <Select
                mode="multiple"
                value={
                  toStr(editForm.viewPermission ?? editingCamera.viewPermission ?? '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)
                }
                onChange={(vals: string[]) => setEditForm(prev => ({ ...prev, viewPermission: vals.join(', ') }))}
                options={[
                  { value: 'user1', label: 'user1' },
                  { value: 'user2', label: 'user2' },
                  { value: 'user3', label: 'user3' },
                  { value: 'user4', label: 'user4' },
                  { value: 'user5', label: 'user5' },
                ]}
                placeholder={t('cameraConfig.viewPermissionPlaceholder', 'Chọn quyền xem')}
                className="w-full"
              />
            </div>
          </Space>
        )}
      </Modal>
    </PageContainer>
  )
}
