import { useEffect, useState, useRef } from 'react'
import { Card, Row, Col, Typography, Button, Table, Tag, Modal, Select, Input, Space, Dropdown, Form, Upload, Steps, Switch, Segmented, Spin, message, Collapse, Tabs, DatePicker, Checkbox } from 'antd'
import type { MenuProps } from 'antd'
import {
  SettingOutlined,
  DesktopOutlined,
  BankOutlined,
  BarChartOutlined,
  ApiOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  FileAddOutlined,
  UploadOutlined,
  CopyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CloseOutlined,
  EditOutlined,
  PictureOutlined,
  LinkOutlined,
  ShareAltOutlined,
  UserOutlined,
  ExportOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FullscreenOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { PageContainer, ContentCard } from '@/components'
import { thingsBoardApi, type ThingsBoardDeviceInfo, type ThingsBoardAssetInfo, type ThingsBoardAssetProfileInfosResponse, type ThingsBoardEntityViewInfo, type SaveDeviceBody } from '@/services'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

const { Title, Text } = Typography

function generateToken(length = 20): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const sections = [
  { key: 'devices', icon: DesktopOutlined, titleKey: 'energyDeviceConfig.devices', descKey: 'energyDeviceConfig.devicesDesc', color: '#1890ff' },
  { key: 'assets', icon: BankOutlined, titleKey: 'energyDeviceConfig.assets', descKey: 'energyDeviceConfig.assetsDesc', color: '#52c41a' },
  { key: 'entityViews', icon: BarChartOutlined, titleKey: 'energyDeviceConfig.entityViews', descKey: 'energyDeviceConfig.entityViewsDesc', color: '#722ed1' },
  { key: 'gateways', icon: ApiOutlined, titleKey: 'energyDeviceConfig.gateways', descKey: 'energyDeviceConfig.gatewaysDesc', color: '#fa8c16' },
] as const

type ActiveSection = (typeof sections)[number]['key'] | null

export default function EnergyDeviceConfigPage() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
  const [devices, setDevices] = useState<ThingsBoardDeviceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [selectedDeviceRowKeys, setSelectedDeviceRowKeys] = useState<React.Key[]>([])
  const [deviceAssignModalOpen, setDeviceAssignModalOpen] = useState(false)
  const [deviceMakePublicModalOpen, setDeviceMakePublicModalOpen] = useState(false)
  const [deviceMakePublicDeviceName, setDeviceMakePublicDeviceName] = useState('')
  const [deviceMakePublicDeviceIds, setDeviceMakePublicDeviceIds] = useState<string[]>([])
  const [deviceMakePrivateModalOpen, setDeviceMakePrivateModalOpen] = useState(false)
  const [deviceMakePrivateDeviceName, setDeviceMakePrivateDeviceName] = useState('')
  const [deviceMakePrivateDeviceIds, setDeviceMakePrivateDeviceIds] = useState<string[]>([])
  const [deviceUnassignModalOpen, setDeviceUnassignModalOpen] = useState(false)
  const [deviceCredentialsModalOpen, setDeviceCredentialsModalOpen] = useState(false)
  const [deviceCredentialsDevice, setDeviceCredentialsDevice] = useState<ThingsBoardDeviceInfo | null>(null)
  const [deviceCredentialsType, setDeviceCredentialsType] = useState<'accessToken' | 'x509' | 'mqttBasic'>('accessToken')
  const [deviceCredAccessToken, setDeviceCredAccessToken] = useState('')
  const [deviceCredX509, setDeviceCredX509] = useState('')
  const [deviceCredClientId, setDeviceCredClientId] = useState('')
  const [deviceCredUserName, setDeviceCredUserName] = useState('')
  const [deviceCredPassword, setDeviceCredPassword] = useState('')
  const [deviceDeleteModalOpen, setDeviceDeleteModalOpen] = useState(false)
  const [deviceDeleteDeviceName, setDeviceDeleteDeviceName] = useState('')
  const [assets, setAssets] = useState<ThingsBoardAssetInfo[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsTotal, setAssetsTotal] = useState(0)
  const [assetsPage, setAssetsPage] = useState(0)
  const [assetsPageSize, setAssetsPageSize] = useState(10)
  const [assetSearchText, setAssetSearchText] = useState('')
  const [assetProfileId, setAssetProfileId] = useState<string>('')
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false)
  const [importAssetsModalOpen, setImportAssetsModalOpen] = useState(false)
  const [selectAssetProfileModalOpen, setSelectAssetProfileModalOpen] = useState(false)
  const [assetProfileList, setAssetProfileList] = useState<Array<{ id: string; name: string }>>([])
  const [assetProfileListLoading, setAssetProfileListLoading] = useState(false)
  const [assetProfileFilterOptions, setAssetProfileFilterOptions] = useState<Array<{ value: string; label: string }>>([])
  const [selectedAssetRowKeys, setSelectedAssetRowKeys] = useState<React.Key[]>([])
  const [assetAssignModalOpen, setAssetAssignModalOpen] = useState(false)
  const [assetMakePublicModalOpen, setAssetMakePublicModalOpen] = useState(false)
  const [assetMakePublicIds, setAssetMakePublicIds] = useState<string[]>([])
  const [assetMakePublicName, setAssetMakePublicName] = useState('')
  const [assetMakePrivateModalOpen, setAssetMakePrivateModalOpen] = useState(false)
  const [assetMakePrivateIds, setAssetMakePrivateIds] = useState<string[]>([])
  const [assetMakePrivateName, setAssetMakePrivateName] = useState('')
  const [assetUnassignModalOpen, setAssetUnassignModalOpen] = useState(false)
  const [assetDeleteModalOpen, setAssetDeleteModalOpen] = useState(false)
  const [assetDeleteName, setAssetDeleteName] = useState('')
  const [entityViews, setEntityViews] = useState<ThingsBoardEntityViewInfo[]>([])
  const [entityViewsLoading, setEntityViewsLoading] = useState(false)
  const [entityViewsTotal, setEntityViewsTotal] = useState(0)
  const [entityViewsPage, setEntityViewsPage] = useState(0)
  const [entityViewsPageSize, setEntityViewsPageSize] = useState(10)
  const [entityViewTypeFilter, setEntityViewTypeFilter] = useState<string>('')
  const [entityViewSearchText, setEntityViewSearchText] = useState('')
  const [entityViewTypeOptions, setEntityViewTypeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [addEntityViewModalOpen, setAddEntityViewModalOpen] = useState(false)
  const [addEntityViewForm] = Form.useForm()
  const [addEntityViewTypeOptions, setAddEntityViewTypeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [addEntityViewTypeOptionsLoading, setAddEntityViewTypeOptionsLoading] = useState(false)
  const [addEntityViewTargetDeviceOptions, setAddEntityViewTargetDeviceOptions] = useState<Array<{ value: string; label: string }>>([])
  const [addEntityViewTargetAssetOptions, setAddEntityViewTargetAssetOptions] = useState<Array<{ value: string; label: string }>>([])
  const [addEntityViewTargetDeviceLoading, setAddEntityViewTargetDeviceLoading] = useState(false)
  const [addEntityViewTargetAssetLoading, setAddEntityViewTargetAssetLoading] = useState(false)
  const addEntityViewTargetType = Form.useWatch('targetEntityType', addEntityViewForm)
  const [selectedEntityViewRowKeys, setSelectedEntityViewRowKeys] = useState<React.Key[]>([])
  const [entityViewAssignModalOpen, setEntityViewAssignModalOpen] = useState(false)
  const [entityViewMakePublicModalOpen, setEntityViewMakePublicModalOpen] = useState(false)
  const [entityViewMakePublicIds, setEntityViewMakePublicIds] = useState<string[]>([])
  const [entityViewMakePublicName, setEntityViewMakePublicName] = useState('')
  const [entityViewMakePrivateModalOpen, setEntityViewMakePrivateModalOpen] = useState(false)
  const [entityViewMakePrivateIds, setEntityViewMakePrivateIds] = useState<string[]>([])
  const [entityViewMakePrivateName, setEntityViewMakePrivateName] = useState('')
  const [entityViewUnassignModalOpen, setEntityViewUnassignModalOpen] = useState(false)
  const [entityViewDeleteModalOpen, setEntityViewDeleteModalOpen] = useState(false)
  const [entityViewDeleteName, setEntityViewDeleteName] = useState('')
  const [serverTime, setServerTime] = useState<number | null>(null)
  const [gateways, setGateways] = useState<Array<{ id: string; createdTime: number; name: string; status: 'Active' | 'Inactive'; enabledConnectors: number; version?: string }>>([])
  const [gatewaysLoading, setGatewaysLoading] = useState(false)
  const [gatewaySearchText, setGatewaySearchText] = useState('')
  const [launchCommandModalOpen, setLaunchCommandModalOpen] = useState(false)
  const [launchCommandGateway, setLaunchCommandGateway] = useState<{ id: string; name: string } | null>(null)
  const [generalConfigModalOpen, setGeneralConfigModalOpen] = useState(false)
  const [generalConfigGateway, setGeneralConfigGateway] = useState<{ id: string; name: string } | null>(null)
  const [generalConfigTab, setGeneralConfigTab] = useState<'general' | 'logs' | 'storage' | 'grpc' | 'statistics' | 'other'>('general')
  const [generalConfigMode, setGeneralConfigMode] = useState<'basic' | 'advanced'>('basic')
  const [connectorsModalOpen, setConnectorsModalOpen] = useState(false)
  const [connectorsGateway, setConnectorsGateway] = useState<{ id: string; name: string } | null>(null)
  const [connectorsLoading, setConnectorsLoading] = useState(false)
  const [connectorData, setConnectorData] = useState<{
    active_connectors?: unknown
    inactive_connectors?: unknown
    Version?: unknown
    serverScope?: Record<string, unknown>
    sharedScope?: Record<string, unknown>
  } | null>(null)
  const [addConnectorModalOpen, setAddConnectorModalOpen] = useState(false)
  const [addConnectorForm] = Form.useForm()
  const [gatewayDeleteModalOpen, setGatewayDeleteModalOpen] = useState(false)
  const [gatewayDeleteGateway, setGatewayDeleteGateway] = useState<{ id: string; name: string } | null>(null)
  const [addGatewayModalOpen, setAddGatewayModalOpen] = useState(false)
  const [addGatewayForm] = Form.useForm()
  const [gatewayDeviceProfileOptions, setGatewayDeviceProfileOptions] = useState<Array<{ value: string; label: string }>>([])
  const [gatewayDeviceProfileOptionsLoading, setGatewayDeviceProfileOptionsLoading] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [filterProfile, setFilterProfile] = useState<string>('all')
  const [filterState, setFilterState] = useState<string>('any')
  const [searchText, setSearchText] = useState('')
  const [addDeviceModalOpen, setAddDeviceModalOpen] = useState(false)
  const [addDeviceStep, setAddDeviceStep] = useState(0)
  const [importDeviceModalOpen, setImportDeviceModalOpen] = useState(false)
  const [editDeviceProfileModalOpen, setEditDeviceProfileModalOpen] = useState(false)
  const [editProfileLoading, setEditProfileLoading] = useState(false)
  const [addDeviceForm] = Form.useForm()
  const [addAssetForm] = Form.useForm()
  const [editProfileForm] = Form.useForm()
  const credentialsType = Form.useWatch('credentialsType', addDeviceForm)
  const editProvisionType = Form.useWatch('provisionType', editProfileForm)
  const editTransportType = Form.useWatch('transportType', editProfileForm)

  /** Device profile image: Set link panel + link value; Browse = file picker */
  const [showSetLinkInput, setShowSetLinkInput] = useState(false)
  const [profileImageLink, setProfileImageLink] = useState('')
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null)
  const profileImageFileInputRef = useRef<HTMLInputElement>(null)
  const editingProfileIdRef = useRef<string | null>(null)

  const resetProfileImageState = () => {
    setShowSetLinkInput(false)
    setProfileImageLink('')
    setProfileImagePreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
  }

  /** Options cho form Edit device profile — load khi mở từng dropdown */
  type ProfileOptionKey = 'defaultRuleChain' | 'mobileDashboard' | 'queue' | 'defaultEdgeRuleChain' | 'assignedFirmware' | 'assignedSoftware'
  const [profileOptions, setProfileOptions] = useState<Record<ProfileOptionKey, { value: string; label: string }[]>>({
    defaultRuleChain: [],
    mobileDashboard: [],
    queue: [],
    defaultEdgeRuleChain: [],
    assignedFirmware: [],
    assignedSoftware: [],
  })
  const [profileOptionsLoaded, setProfileOptionsLoaded] = useState<Record<ProfileOptionKey, boolean>>({
    defaultRuleChain: false,
    mobileDashboard: false,
    queue: false,
    defaultEdgeRuleChain: false,
    assignedFirmware: false,
    assignedSoftware: false,
  })
  const [profileOptionsLoading, setProfileOptionsLoading] = useState<Record<ProfileOptionKey, boolean>>({
    defaultRuleChain: false,
    mobileDashboard: false,
    queue: false,
    defaultEdgeRuleChain: false,
    assignedFirmware: false,
    assignedSoftware: false,
  })

  /** UUID mặc định cho profile "default" khi gọi API device profile */
  const DEFAULT_DEVICE_PROFILE_ID = 'cf6a5600-1aa3-11f1-8db1-5df566826c84'

  /** Lấy id từ entity (API có thể trả id là string hoặc object { id, entityType }) */
  const getEntityId = (entity: { id?: string | { id?: string }; [key: string]: unknown }): string =>
    typeof entity?.id === 'string' ? entity.id : (entity?.id as { id?: string } | undefined)?.id ?? ''

  const toRuleChainOpts = (data: { id?: string | { id?: string }; name?: string }[] = []) =>
    (data || []).map((x) => ({ value: getEntityId(x), label: (x as { name?: string }).name ?? getEntityId(x) })).filter((o) => o.value)
  const toDashboardOpts = (data: { id?: string | { id?: string }; title?: string }[] = []) =>
    (data || []).map((x) => ({ value: getEntityId(x), label: (x as { title?: string }).title ?? getEntityId(x) })).filter((o) => o.value)
  const toQueueOpts = (data: { id?: string | { id?: string }; name?: string }[] = []) =>
    (data || []).map((x) => ({ value: getEntityId(x), label: (x as { name?: string }).name ?? getEntityId(x) })).filter((o) => o.value)
  const toOtaOpts = (data: { id?: string | { id?: string }; title?: string; name?: string }[] = []) =>
    (data || []).map((x) => ({ value: getEntityId(x), label: (x as { title?: string; name?: string }).title ?? (x as { name?: string }).name ?? getEntityId(x) })).filter((o) => o.value)

  /** Gọi API khi mở dropdown; không có data thì set giá trị dropdown = null */
  const fetchDropdownOptions = (key: ProfileOptionKey, profileId: string) => {
    if (profileOptionsLoaded[key]) return
    setProfileOptionsLoading((prev) => ({ ...prev, [key]: true }))
    const formFieldByKey: Record<ProfileOptionKey, string> = {
      defaultRuleChain: 'defaultRuleChain',
      mobileDashboard: 'mobileDashboard',
      queue: 'queue',
      defaultEdgeRuleChain: 'defaultEdgeRuleChain',
      assignedFirmware: 'assignedFirmware',
      assignedSoftware: 'assignedSoftware',
    }
    const fieldName = formFieldByKey[key]
    const run = (): Promise<{ value: string; label: string }[]> => {
      switch (key) {
        case 'defaultRuleChain':
          return thingsBoardApi.getRuleChains({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC', type: 'CORE' }).then((r) => toRuleChainOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; name?: string }[]))
        case 'mobileDashboard':
          return thingsBoardApi.getTenantDashboards({ pageSize: 25, page: 0, sortProperty: 'title', sortOrder: 'ASC' }).then((r) => toDashboardOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; title?: string }[]))
        case 'queue':
          return thingsBoardApi.getQueues({ pageSize: 10, page: 0, sortProperty: 'name', sortOrder: 'ASC', serviceType: 'TB_RULE_ENGINE' }).then((r) => toQueueOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; name?: string }[]))
        case 'defaultEdgeRuleChain':
          return thingsBoardApi.getRuleChains({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC', type: 'EDGE' }).then((r) => toRuleChainOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; name?: string }[]))
        case 'assignedFirmware':
          return thingsBoardApi.getOtaPackages(profileId, 'FIRMWARE', { pageSize: 50, page: 0, sortProperty: 'title', sortOrder: 'ASC' }).then((r) => toOtaOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; title?: string; name?: string }[]))
        case 'assignedSoftware':
          return thingsBoardApi.getOtaPackages(profileId, 'SOFTWARE', { pageSize: 50, page: 0, sortProperty: 'title', sortOrder: 'ASC' }).then((r) => toOtaOpts((r as { data?: unknown[] })?.data as { id?: string | { id?: string }; title?: string; name?: string }[]))
        default:
          return Promise.resolve([])
      }
    }
    run()
      .then((opts) => {
        setProfileOptions((prev) => ({ ...prev, [key]: opts }))
        setProfileOptionsLoaded((prev) => ({ ...prev, [key]: true }))
        if (opts.length === 0) editProfileForm.setFieldValue(fieldName, null)
      })
      .catch(() => {
        setProfileOptionsLoaded((prev) => ({ ...prev, [key]: true }))
        editProfileForm.setFieldValue(fieldName, null)
      })
      .finally(() => setProfileOptionsLoading((prev) => ({ ...prev, [key]: false })))
  }

  const fetchDeviceInfos = (p = page, size = pageSize) => {
    setLoading(true)
    const params: Parameters<typeof thingsBoardApi.getDeviceInfos>[0] = {
      pageSize: size,
      page: p,
      sortProperty: 'createdTime',
      sortOrder: 'DESC',
    }
    if (searchText.trim()) params.textSearch = searchText.trim()
    if (filterState === 'active') params.active = true
    if (filterState === 'inactive') params.active = false
    if (filterProfile !== 'all') params.deviceProfileId = filterProfile
    thingsBoardApi
      .getDeviceInfos(params)
      .then((res) => {
        setDevices(res?.data ?? [])
        setTotal(res?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Không tải được dữ liệu'))
        setDevices([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (activeSection === 'devices') {
      fetchDeviceInfos(0, pageSize)
      setPage(0)
    }
  }, [activeSection])

  const fetchAssetInfos = (p = assetsPage, size = assetsPageSize) => {
    setAssetsLoading(true)
    const params: Parameters<typeof thingsBoardApi.getAssetInfos>[0] = {
      pageSize: size,
      page: p,
      sortProperty: 'createdTime',
      sortOrder: 'DESC',
    }
    if (assetSearchText.trim()) params.textSearch = assetSearchText.trim()
    if (assetProfileId) params.assetProfileId = assetProfileId
    thingsBoardApi
      .getAssetInfos(params)
      .then((res) => {
        setAssets(res?.data ?? [])
        setAssetsTotal(res?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Không tải được dữ liệu'))
        setAssets([])
        setAssetsTotal(0)
      })
      .finally(() => setAssetsLoading(false))
  }

  const fetchEntityViewInfos = (p = entityViewsPage, size = entityViewsPageSize) => {
    setEntityViewsLoading(true)
    const params: Record<string, unknown> = {
      pageSize: size,
      page: p,
      sortProperty: 'createdTime',
      sortOrder: 'DESC',
    }
    if (entityViewSearchText.trim()) params.textSearch = entityViewSearchText.trim()
    if (entityViewTypeFilter) params.type = entityViewTypeFilter
    thingsBoardApi
      .getEntityViewInfos(params)
      .then((res) => {
        setEntityViews(res?.data ?? [])
        setEntityViewsTotal(res?.totalElements ?? 0)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Không tải được dữ liệu'))
        setEntityViews([])
        setEntityViewsTotal(0)
      })
      .finally(() => setEntityViewsLoading(false))
  }

  useEffect(() => {
    if (activeSection === 'assets') {
      fetchAssetInfos(0, assetsPageSize)
      setAssetsPage(0)
      thingsBoardApi
        .getAssetProfileInfos({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC' })
        .then((res: ThingsBoardAssetProfileInfosResponse) => {
          const data = res?.data ?? []
          const list = data.map((p) => {
            const idVal = p?.id
            const value = (typeof idVal === 'object' && idVal && 'id' in idVal ? (idVal as { id?: string }).id : idVal) ?? ''
            return { value, label: p?.name ?? '' }
          }).filter((p) => p.value)
          setAssetProfileFilterOptions([{ value: 'all', label: t('energyDeviceConfig.all', 'All') }, ...list])
        })
        .catch(() => setAssetProfileFilterOptions([{ value: 'all', label: t('energyDeviceConfig.all', 'All') }]))
    }
    if (activeSection === 'entityViews') {
      fetchEntityViewInfos(0, entityViewsPageSize)
      setEntityViewsPage(0)
      thingsBoardApi
        .getEntityViewTypes()
        .then((res) => {
          const list = Array.isArray(res) ? res : (res && typeof res === 'object' && 'data' in res ? (res as { data?: string[] }).data : []) ?? []
          setEntityViewTypeOptions([
            { value: '', label: t('energyDeviceConfig.all', 'All') },
            ...list.filter(Boolean).map((typeName) => ({ value: typeName, label: typeName })),
          ])
        })
        .catch(() => setEntityViewTypeOptions([{ value: '', label: t('energyDeviceConfig.all', 'All') }]))
    }
    if (activeSection === 'gateways') {
      thingsBoardApi
        .getServerTime()
        .then((res) => {
          const time = typeof res === 'number' ? res : (res && typeof res === 'object' && 'serverTime' in res ? (res as { serverTime?: number }).serverTime : null)
          setServerTime(typeof time === 'number' ? time : null)
        })
        .catch(() => setServerTime(null))
      setGateways([
        { id: '1', createdTime: Date.now() - 86400 * 2, name: 'Home Assistant', status: 'Active', enabledConnectors: 0, version: '' },
      ])
    }
  }, [activeSection])

  useEffect(() => {
    setSelectedDeviceRowKeys([])
    setSelectedAssetRowKeys([])
    setSelectedEntityViewRowKeys([])
  }, [activeSection])

  useEffect(() => {
    if (!connectorsModalOpen || !connectorsGateway?.id) return
    const deviceId = connectorsGateway.id
    setConnectorsLoading(true)
    setConnectorData(null)
    Promise.all([
      thingsBoardApi.getDeviceAttributesByScope(deviceId, 'SHARED_SCOPE', { key: 'active_connectors' }),
      thingsBoardApi.getDeviceAttributesByScope(deviceId, 'SERVER_SCOPE', { key: 'inactive_connectors' }),
      thingsBoardApi.getDeviceAttributesByScope(deviceId, 'CLIENT_SCOPE', { key: 'Version' }),
      thingsBoardApi.getDeviceAttributesByScope(deviceId, 'SERVER_SCOPE'),
      thingsBoardApi.getDeviceAttributesByScope(deviceId, 'SHARED_SCOPE'),
    ])
      .then(([active, inactive, version, serverScope, sharedScope]) => {
        setConnectorData({
          active_connectors: active,
          inactive_connectors: inactive,
          Version: version,
          serverScope: typeof serverScope === 'object' && serverScope !== null ? (serverScope as Record<string, unknown>) : undefined,
          sharedScope: typeof sharedScope === 'object' && sharedScope !== null ? (sharedScope as Record<string, unknown>) : undefined,
        })
      })
      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed')))
      .finally(() => setConnectorsLoading(false))
  }, [connectorsModalOpen, connectorsGateway?.id, t])

  useEffect(() => {
    if (!addGatewayModalOpen) return
    setGatewayDeviceProfileOptionsLoading(true)
    thingsBoardApi
      .getDeviceProfileNames(false)
      .then((res) => {
        const list = Array.isArray(res) ? res : []
        setGatewayDeviceProfileOptions(
          list.map((p: { id?: { id?: string }; name?: string } | string) => {
            const item = typeof p === 'string' ? { id: undefined, name: p } : p
            const id = (item as { id?: { id?: string } }).id?.id ?? (item as { id?: string }).id ?? (item as { name?: string }).name ?? (typeof p === 'string' ? p : '')
            const name = (item as { name?: string }).name ?? (typeof p === 'string' ? p : '')
            return { value: id, label: name || id }
          })
        )
      })
      .catch(() => setGatewayDeviceProfileOptions([]))
      .finally(() => setGatewayDeviceProfileOptionsLoading(false))
  }, [addGatewayModalOpen])

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    const nextPage = (pagination.current ?? 1) - 1
    const nextSize = pagination.pageSize ?? pageSize
    setPage(nextPage)
    setPageSize(nextSize)
    fetchDeviceInfos(nextPage, nextSize)
  }

  const handleAssetsTableChange = (pagination: { current?: number; pageSize?: number }) => {
    const nextPage = (pagination.current ?? 1) - 1
    const nextSize = pagination.pageSize ?? assetsPageSize
    setAssetsPage(nextPage)
    setAssetsPageSize(nextSize)
    fetchAssetInfos(nextPage, nextSize)
  }

  const handleEntityViewTableChange = (pagination: { current?: number; pageSize?: number }) => {
    const nextPage = (pagination.current ?? 1) - 1
    const nextSize = pagination.pageSize ?? entityViewsPageSize
    setEntityViewsPage(nextPage)
    setEntityViewsPageSize(nextSize)
    fetchEntityViewInfos(nextPage, nextSize)
  }

  const handleFilterUpdate = () => {
    setFilterModalOpen(false)
    setPage(0)
    fetchDeviceInfos(0, pageSize)
  }

  const handleFilterReset = () => {
    setFilterProfile('all')
    setFilterState('any')
  }

  const handleAddDevice = () => {
    const baseFields: string[] = ['name', 'deviceProfileId']
    const credentialFields = addDeviceStep === 1
      ? (credentialsType === 'accessToken'
          ? ['accessToken']
          : credentialsType === 'x509'
            ? ['x509Certificate']
            : ['mqttClientId', 'mqttUserName'])
      : []
    addDeviceForm.validateFields([...baseFields, ...credentialFields]).then((values) => {
      const deviceProfileId = values.deviceProfileId
        ? { id: values.deviceProfileId, entityType: 'DEVICE_PROFILE' as const }
        : undefined
      const body: SaveDeviceBody = {
        name: values.name,
        type: values.type || 'default',
        label: values.label || undefined,
        deviceProfileId,
        version: 0,
        additionalInfo: {},
        deviceData: {
          configuration: { type: 'string' },
          transportConfiguration: {
            type: 'string',
            powerMode: 'PSM',
            psmActivityTimer: 0,
            edrxCycle: 0,
            pagingTransmissionWindow: 0,
          },
        },
      }
      if (values.isGateway === true) (body as Record<string, unknown>).gateway = true
      thingsBoardApi
        .saveDevice(body)
        .then(() => {
          message.success(t('energyDeviceConfig.deviceCreated', 'Thiết bị đã được tạo'))
          addDeviceForm.resetFields()
          setAddDeviceStep(0)
          setAddDeviceModalOpen(false)
          fetchDeviceInfos(page, pageSize)
        })
        .catch((err) => {
          message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed', 'Không thể tạo thiết bị'))
        })
    })
  }

  const openAddDeviceModal = () => {
    setAddDeviceStep(0)
    addDeviceForm.resetFields()
    setAddDeviceModalOpen(true)
  }

  const openAddAssetModal = () => {
    addAssetForm.resetFields()
    addAssetForm.setFieldsValue({ assetProfileName: 'default', assetProfileId: undefined })
    thingsBoardApi
      .getAssetProfileInfo('default')
      .then((info: Record<string, unknown>) => {
        const idObj = info?.id as { id?: string } | undefined
        const id = typeof idObj?.id === 'string' ? idObj.id : (info?.id as string)
        if (id) addAssetForm.setFieldValue('assetProfileId', id)
      })
      .catch(() => {})
    setAddAssetModalOpen(true)
  }

  const openSelectAssetProfileModal = () => {
    setAssetProfileListLoading(true)
    setAssetProfileList([])
    thingsBoardApi
      .getAssetProfileInfos({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC' })
      .then((res: ThingsBoardAssetProfileInfosResponse) => {
        const data = res?.data ?? []
        const list = data.map((p) => {
          const idVal = p?.id
          const id = (typeof idVal === 'object' && idVal && 'id' in idVal ? (idVal as { id?: string }).id : idVal) ?? ''
          return { id, name: p?.name ?? '' }
        }).filter((p) => p.id)
        setAssetProfileList(list)
      })
      .catch(() => setAssetProfileList([]))
      .finally(() => setAssetProfileListLoading(false))
    setSelectAssetProfileModalOpen(true)
  }

  const goToCredentialsStep = () => {
    addDeviceForm.validateFields(['name', 'deviceProfileId']).then(() => {
      addDeviceForm.setFieldsValue({
        credentialsType: 'accessToken',
        accessToken: generateToken(),
      })
      setAddDeviceStep(1)
    })
  }

  const copyAccessToken = () => {
    const token = addDeviceForm.getFieldValue('accessToken') || ''
    if (token) {
      navigator.clipboard.writeText(token).then(() => message.success(t('energyDeviceConfig.copied', 'Đã copy')))
    }
  }

  const generateAccessToken = () => addDeviceForm.setFieldValue('accessToken', generateToken())
  const generateMqttClientId = () => addDeviceForm.setFieldValue('mqttClientId', generateToken(16))
  const generateMqttUsername = () => addDeviceForm.setFieldValue('mqttUserName', generateToken(12))
  const generateMqttPassword = () => addDeviceForm.setFieldValue('mqttPassword', generateToken(16))

  /** Device có customer thật (customerId.id hoặc customerTitle), tránh coi {} là có customer */
  const deviceHasCustomer = (d: ThingsBoardDeviceInfo) => {
    const cid = d?.customerId
    const idOk = cid && (typeof cid === 'object' && cid !== null && 'id' in cid ? (cid as { id?: string }).id : String(cid).trim())
    const titleOk = d?.customerTitle && String(d.customerTitle).trim()
    return !!(idOk || titleOk)
  }

  const assetHasCustomer = (a: ThingsBoardAssetInfo) => {
    const cid = a?.customerId
    const idOk = cid && (typeof cid === 'object' && cid !== null && 'id' in cid ? (cid as { id?: string }).id : String(cid).trim())
    const titleOk = a?.customerTitle && String(a.customerTitle).trim()
    return !!(idOk || titleOk)
  }

  const entityViewHasCustomer = (e: ThingsBoardEntityViewInfo) => {
    const cid = e?.customerId
    const idOk = cid && (typeof cid === 'object' && cid !== null && 'id' in cid ? (cid as { id?: string }).id : String(cid).trim())
    const titleOk = e?.customerTitle && String(e.customerTitle).trim()
    return !!(idOk || titleOk)
  }

  const addDeviceMenuItems: MenuProps['items'] = [
    {
      key: 'add-new',
      icon: <FileAddOutlined />,
      label: t('energyDeviceConfig.addNewDevice', 'Add new device'),
      onClick: openAddDeviceModal,
    },
    {
      key: 'import',
      icon: <UploadOutlined />,
      label: t('energyDeviceConfig.importDevice', 'Import device'),
      onClick: () => setImportDeviceModalOpen(true),
    },
  ]

  if (activeSection === 'devices') {
    return (
      <PageContainer>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => setActiveSection(null)}
          className="energy-back-btn mb-2"
        >
          {t('energyDeviceManagement.backToConfigList')}
        </Button>
        <ContentCard
          title={t('energyDeviceConfig.devices')}
          titleIcon={<DesktopOutlined />}
          titleIconColor="#1890ff"
          className="energy-device-config-section-card"
          extra={
            <Space wrap>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterModalOpen(true)}
              >
                {t('energyDeviceConfig.deviceFilter', 'Device filter')}
              </Button>
              <Space.Compact>
                <Input
                  placeholder={t('common.search', 'Tìm kiếm')}
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={() => { setPage(0); fetchDeviceInfos(0, pageSize) }}
                  allowClear
                  style={{ width: 180 }}
                />
                <Button onClick={() => { setPage(0); fetchDeviceInfos(0, pageSize) }}>
                  {t('common.search', 'Tìm kiếm')}
                </Button>
              </Space.Compact>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => fetchDeviceInfos(page, pageSize)}
                loading={loading}
                title={t('common.refresh', 'Làm mới')}
              />
              <Dropdown menu={{ items: addDeviceMenuItems }} trigger={['click']}>
                <Button type="primary" icon={<PlusOutlined />}>
                  {t('common.add', 'Thêm')}
                </Button>
              </Dropdown>
            </Space>
          }
        >
          <Modal
            title={t('energyDeviceConfig.deviceFilter', 'Device filter')}
            open={filterModalOpen}
            onCancel={() => setFilterModalOpen(false)}
            footer={
              <Space>
                <Button onClick={handleFilterReset}>{t('common.reset', 'Reset')}</Button>
                <Button onClick={() => setFilterModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
                <Button type="primary" onClick={handleFilterUpdate}>
                  {t('energyDeviceConfig.update', 'Update')}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <label className="block text-sm text-secondary mb-1">{t('energyDeviceConfig.deviceProfile')}</label>
                <Select
                  value={filterProfile}
                  onChange={setFilterProfile}
                  style={{ width: '100%' }}
                  allowClear
                  placeholder={t('energyDeviceConfig.all', 'All')}
                  options={[
                    { value: 'all', label: t('energyDeviceConfig.all', 'All') },
                    { value: 'default', label: 'default' },
                    { value: 'tasmota', label: 'tasmota' },
                    { value: 'thermostat', label: 'thermostat' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">{t('energyDeviceConfig.deviceState')}</label>
                <Select
                  value={filterState}
                  onChange={setFilterState}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'any', label: t('energyDeviceConfig.any', 'Any') },
                    { value: 'active', label: t('energyDeviceConfig.active') },
                    { value: 'inactive', label: t('energyDeviceConfig.inactive') },
                  ]}
                />
              </div>
            </Space>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.addNewDevice', 'Add new device')}
            open={addDeviceModalOpen}
            onCancel={() => { setAddDeviceModalOpen(false); setAddDeviceStep(0); addDeviceForm.resetFields() }}
            footer={null}
            destroyOnClose
            width={560}
            className="add-device-modal"
          >
            <Steps
              current={addDeviceStep}
              size="small"
              className="add-device-steps mb-4"
              items={[
                { title: t('energyDeviceConfig.stepDeviceDetails') },
                { title: t('energyDeviceConfig.stepCredentials'), subTitle: `(${t('energyDeviceConfig.optional')})` },
              ]}
            />
            <Form form={addDeviceForm} layout="vertical" initialValues={{ deviceProfileId: 'default', isGateway: false }}>
              {addDeviceStep === 0 && (
                <>
                  <Form.Item name="name" label={t('energyDeviceConfig.name') + ' *'} rules={[{ required: true, message: t('common.required', 'Bắt buộc') }]}>
                    <Input placeholder={t('energyDeviceConfig.deviceNamePlaceholder', 'Tên thiết bị')} />
                  </Form.Item>
                  <Form.Item name="label" label={t('energyDeviceConfig.label')}>
                    <Input placeholder={t('energyDeviceConfig.labelPlaceholder', 'Nhãn (tùy chọn)')} />
                  </Form.Item>
                  <Form.Item name="deviceProfileId" label={t('energyDeviceConfig.deviceProfile') + ' *'} rules={[{ required: true, message: t('common.required', 'Bắt buộc') }]}>
                    <Input
                      placeholder={t('energyDeviceConfig.deviceProfilePlaceholder', 'Chọn device profile')}
                      readOnly
                      className="add-device-profile-input"
                      suffix={
                        <Space size={4}>
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => addDeviceForm.setFieldValue('deviceProfileId', undefined)}
                            aria-label={t('common.clear', 'Xóa')}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                              const raw = addDeviceForm.getFieldValue('deviceProfileId')
                              const profileId = raw === 'default' || !raw ? DEFAULT_DEVICE_PROFILE_ID : raw
                              editingProfileIdRef.current = profileId
                              setEditProfileLoading(true)
                              setEditDeviceProfileModalOpen(true)
                              setProfileImageLink('')
                              setProfileOptions({ defaultRuleChain: [], mobileDashboard: [], queue: [], defaultEdgeRuleChain: [], assignedFirmware: [], assignedSoftware: [] })
                              setProfileOptionsLoaded({ defaultRuleChain: false, mobileDashboard: false, queue: false, defaultEdgeRuleChain: false, assignedFirmware: false, assignedSoftware: false })
                              const refId = (v: unknown): string | undefined => {
                                if (typeof v === 'string') return v || undefined
                                const o = v as { id?: string | { id?: string } } | undefined
                                const id = o?.id
                                if (typeof id === 'string') return id
                                if (id && typeof id === 'object' && typeof (id as { id?: string }).id === 'string') return (id as { id: string }).id
                                return undefined
                              }
                              thingsBoardApi
                                .getDeviceProfile(profileId)
                                .then((profileRes) => {
                                  const data = (profileRes || {}) as Record<string, unknown>
                                  editProfileForm.setFieldsValue({
                                    profileName: (data?.name as string) ?? raw ?? 'default',
                                    profileDescription: (data?.description as string) ?? '',
                                    defaultRuleChain: null,
                                    mobileDashboard: null,
                                    queue: null,
                                    defaultEdgeRuleChain: null,
                                    assignedFirmware: null,
                                    assignedSoftware: null,
                                    transportType: (data?.transportType as string) ?? 'DEFAULT',
                                    provisionType: (data?.provisionType as string) ?? 'DISABLED',
                                    provisionDeviceKey: (data?.provisionDeviceKey as string) ?? '',
                                    provisionDeviceSecret: (data?.provisionDeviceSecret as string) ?? '',
                                    provisionCreateNewDevices: (data?.profileData as { provisionConfiguration?: { allowCreateNewDevicesByX509?: boolean } })?.provisionConfiguration?.allowCreateNewDevicesByX509 ?? false,
                                    provisionCertificatePem: (data?.profileData as { provisionConfiguration?: { certificate?: string } })?.provisionConfiguration?.certificate ?? '',
                                    provisionCnRegex: (data?.profileData as { provisionConfiguration?: { certificateValuePattern?: string } })?.provisionConfiguration?.certificateValuePattern ?? '(.*)',
                                    mqttSparkplugEon: (data?.profileData as { transportConfiguration?: { sparkplug?: boolean } })?.transportConfiguration?.sparkplug ?? false,
                                    mqttTelemetryTopicFilter: (data?.profileData as { transportConfiguration?: { telemetryTopicFilter?: string } })?.transportConfiguration?.telemetryTopicFilter ?? 'v1/devices/me/telemetry',
                                    mqttAttributesPublishTopicFilter: (data?.profileData as { transportConfiguration?: { attributesPublishTopicFilter?: string } })?.transportConfiguration?.attributesPublishTopicFilter ?? 'v1/devices/me/attributes',
                                    mqttAttributesSubscribeTopicFilter: (data?.profileData as { transportConfiguration?: { attributesSubscribeTopicFilter?: string } })?.transportConfiguration?.attributesSubscribeTopicFilter ?? 'v1/devices/me/attributes',
                                    mqttDevicePayload: (data?.profileData as { transportConfiguration?: { devicePayloadType?: string } })?.transportConfiguration?.devicePayloadType ?? 'JSON',
                                    mqttSendPubackOnValidationFailure: (data?.profileData as { transportConfiguration?: { sendAckOnValidationFailure?: boolean } })?.transportConfiguration?.sendAckOnValidationFailure ?? false,
                                    coapDeviceType: (data?.profileData as { transportConfiguration?: { coapDeviceTypeConfiguration?: { coapDeviceType?: string } } })?.transportConfiguration?.coapDeviceTypeConfiguration?.coapDeviceType ?? 'DEFAULT',
                                    coapDevicePayload: (data?.profileData as { transportConfiguration?: { coapDeviceTypeConfiguration?: { transportPayloadTypeConfiguration?: { transportPayloadType?: string } } } })?.transportConfiguration?.coapDeviceTypeConfiguration?.transportPayloadTypeConfiguration?.transportPayloadType ?? 'JSON',
                                    coapPowerSavingMode: (data?.profileData as { transportConfiguration?: { clientSettings?: { powerMode?: string } } })?.transportConfiguration?.clientSettings?.powerMode ?? 'DRX',
                                    lwm2mObjectList: (data?.profileData as { transportConfiguration?: { objectList?: string } })?.transportConfiguration?.objectList ?? '',
                                    lwm2mInitAttrTelAsObs: (data?.profileData as { transportConfiguration?: { observeAttr?: { initAttrTelAsObsStrategy?: boolean } } })?.transportConfiguration?.observeAttr?.initAttrTelAsObsStrategy ?? false,
                                    lwm2mObserveStrategy: (data?.profileData as { transportConfiguration?: { observeAttr?: { observeStrategy?: string } } })?.transportConfiguration?.observeAttr?.observeStrategy ?? 'SINGLE',
                                    lwm2mIncludeBootstrapServerUpdates: (data?.profileData as { transportConfiguration?: { bootstrap?: { bootstrapServerUpdate?: boolean } } })?.transportConfiguration?.bootstrap?.bootstrapServerUpdate ?? false,
                                    lwm2mUseObject19ForOta: (data?.profileData as { transportConfiguration?: { otaUpdate?: { useObject19?: boolean } } })?.transportConfiguration?.otaUpdate?.useObject19 ?? false,
                                    lwm2mFirmwareUpdateStrategy: (data?.profileData as { transportConfiguration?: { firmwareUpdateStrategy?: string } })?.transportConfiguration?.firmwareUpdateStrategy ?? 'OBJECT_5_RESOURCE_0',
                                    lwm2mSoftwareUpdateStrategy: (data?.profileData as { transportConfiguration?: { softwareUpdateStrategy?: string } })?.transportConfiguration?.softwareUpdateStrategy ?? 'OBJECT_9_RESOURCE_2',
                                    lwm2mPowerSavingMode: (data?.profileData as { transportConfiguration?: { clientSettings?: { powerMode?: string } } })?.transportConfiguration?.clientSettings?.powerMode ?? 'DRX',
                                    lwm2mDefaultObjectVersion: (data?.profileData as { transportConfiguration?: { defaultObjectVersion?: string } })?.transportConfiguration?.defaultObjectVersion ?? '1.0',
                                    lwm2mJsonConfig: typeof (data?.profileData as { transportConfiguration?: { jsonConfig?: string } })?.transportConfiguration?.jsonConfig === 'string' ? (data?.profileData as { transportConfiguration?: { jsonConfig?: string } })?.transportConfiguration?.jsonConfig : JSON.stringify({ observeAttr: { observe: [], attribute: [], telemetry: [], keyName: {}, attributeLwm2m: {}, initAttrTelAsObsStrategy: false, observeStrategy: 'SINGLE' } }, null, 2),
                                    snmpTimeout: (data?.profileData as { transportConfiguration?: { timeout?: number } })?.transportConfiguration?.timeout ?? 500,
                                    snmpRetries: (data?.profileData as { transportConfiguration?: { retries?: number } })?.transportConfiguration?.retries ?? 0,
                                    snmpScope: (data?.profileData as { transportConfiguration?: { communicationConfigs?: { scope?: string }[] } })?.transportConfiguration?.communicationConfigs?.[0]?.scope ?? 'CLIENT',
                                    snmpQueryingFrequencyMs: (data?.profileData as { transportConfiguration?: { communicationConfigs?: { queryingFrequencyMs?: number }[] } })?.transportConfiguration?.communicationConfigs?.[0]?.queryingFrequencyMs ?? 5000,
                                    snmpMappings: (data?.profileData as { transportConfiguration?: { communicationConfigs?: { mappings?: { dataType?: string; dataKey?: string; oid?: string }[] }[] } })?.transportConfiguration?.communicationConfigs?.[0]?.mappings ?? [],
                                  })
                                  setProfileImageLink((data?.image as string) ?? '')
                                })
                                .catch((err) => {
                                  message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed'))
                                  setEditDeviceProfileModalOpen(false)
                                })
                                .finally(() => setEditProfileLoading(false))
                            }}
                            aria-label={t('energyDeviceConfig.editDeviceProfile', 'Edit device profile')}
                          />
                        </Space>
                      }
                    />
                  </Form.Item>
                  <Form.Item name="isGateway" label={t('energyDeviceConfig.isGateway', 'Is gateway')} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="assignToCustomer" label={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}>
                    <Select allowClear placeholder={t('energyDeviceConfig.assignToCustomerPlaceholder', 'Chọn customer (tùy chọn)')} options={[]} />
                  </Form.Item>
                  <Form.Item name="description" label={t('energyDeviceConfig.description', 'Description')}>
                    <Input.TextArea rows={3} placeholder={t('energyDeviceConfig.descriptionPlaceholder', 'Mô tả thiết bị')} />
                  </Form.Item>
                </>
              )}
              {addDeviceStep === 1 && (
                <>
                  <Form.Item name="credentialsType" label={t('energyDeviceConfig.credentialsType')}>
                    <Segmented
                      block
                      className="add-device-credentials-tabs"
                      options={[
                        { value: 'accessToken', label: t('energyDeviceConfig.accessToken') },
                        { value: 'x509', label: 'X.509' },
                        { value: 'mqttBasic', label: t('energyDeviceConfig.mqttBasic', 'MQTT Basic') },
                      ]}
                      onChange={(v) => {
                        if (v === 'accessToken') addDeviceForm.setFieldValue('accessToken', addDeviceForm.getFieldValue('accessToken') || generateToken())
                      }}
                    />
                  </Form.Item>
                  <div className="add-device-credentials-content">
                    {credentialsType === 'accessToken' && (
                      <Form.Item name="accessToken" label={t('energyDeviceConfig.accessToken') + ' *'} rules={[{ required: true, message: t('common.required') }]}>
                        <Input
                          addonAfter={
                            <Button type="text" size="small" icon={<CopyOutlined />} onClick={copyAccessToken} title={t('energyDeviceConfig.copy', 'Copy')} />
                          }
                        />
                      </Form.Item>
                    )}
                    {credentialsType === 'x509' && (
                      <Form.Item name="x509Certificate" label={t('energyDeviceConfig.certificatePem', 'Certificate in PEM format') + ' *'} rules={[{ required: true, message: t('common.required') }]}>
                        <Input.TextArea rows={6} placeholder={t('energyDeviceConfig.certificatePemPlaceholder', 'Certificate in PEM format*')} />
                      </Form.Item>
                    )}
                    {credentialsType === 'mqttBasic' && (
                      <>
                        <Form.Item
                          name="mqttClientId"
                          label={t('energyDeviceConfig.clientId', 'Client ID')}
                          rules={[
                            {
                              validator: (_, value) => {
                                const username = addDeviceForm.getFieldValue('mqttUserName')
                                if (!value && !username) return Promise.reject(new Error(t('energyDeviceConfig.mqttClientIdOrUserRequired', 'Client ID and/or User Name are necessary.')))
                                return Promise.resolve()
                              },
                            },
                          ]}
                        >
                          <Input
                            placeholder={t('energyDeviceConfig.clientId', 'Client ID')}
                            addonAfter={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={generateMqttClientId} />}
                          />
                        </Form.Item>
                        <Form.Item
                          name="mqttUserName"
                          label={t('energyDeviceConfig.userName', 'User Name')}
                          rules={[
                            {
                              validator: (_, value) => {
                                const clientId = addDeviceForm.getFieldValue('mqttClientId')
                                if (!value && !clientId) return Promise.reject(new Error(t('energyDeviceConfig.mqttClientIdOrUserRequired', 'Client ID and/or User Name are necessary.')))
                                return Promise.resolve()
                              },
                            },
                          ]}
                        >
                          <Input
                            placeholder={t('energyDeviceConfig.userName', 'User Name')}
                            addonAfter={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={generateMqttUsername} />}
                          />
                        </Form.Item>
                        <Form.Item name="mqttPassword" label={t('energyDeviceConfig.password', 'Password')}>
                          <Input.Password
                            placeholder={t('energyDeviceConfig.password', 'Password')}
                            iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                            addonAfter={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={generateMqttPassword} />}
                          />
                        </Form.Item>
                      </>
                    )}
                  </div>
                </>
              )}
            </Form>
            <div className="flex justify-between mt-4">
              <div>
                {addDeviceStep === 1 && (
                  <Button onClick={() => setAddDeviceStep(0)}>{t('energyDeviceConfig.back', 'Back')}</Button>
                )}
              </div>
              <Space>
                <Button onClick={() => { setAddDeviceModalOpen(false); setAddDeviceStep(0); addDeviceForm.resetFields() }}>
                  {t('common.cancel')}
                </Button>
                {addDeviceStep === 0 ? (
                  <>
                    <Button type="primary" onClick={handleAddDevice}>
                      {t('common.add', 'Thêm')}
                    </Button>
                    <Button onClick={goToCredentialsStep}>
                      {t('energyDeviceConfig.nextPage', 'Trang tiếp theo')}
                    </Button>
                  </>
                ) : (
                  <Button type="primary" onClick={handleAddDevice}>
                    {t('common.add', 'Thêm')}
                  </Button>
                )}
              </Space>
            </div>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.editDeviceProfile', 'Edit device profile')}
            open={editDeviceProfileModalOpen}
            onCancel={() => { setEditDeviceProfileModalOpen(false); resetProfileImageState() }}
            onOk={() => {
              editProfileForm.validateFields().then((values) => {
                const profileId = editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID
                setEditProfileLoading(true)
                thingsBoardApi
                  .getDeviceProfile(profileId)
                  .then((current) => {
                    const existing = (current || {}) as Record<string, unknown>
                    const toRef = (id: string | undefined, entityType: 'RULE_CHAIN' | 'DASHBOARD' | 'OTA_PACKAGE') =>
                      id ? { id, entityType } : null
                    const existingProfileData = (existing.profileData ?? {}) as Record<string, unknown>
                    const provisionConfig = (existingProfileData.provisionConfiguration ?? {}) as Record<string, unknown>
                    const transportConfig = (existingProfileData.transportConfiguration ?? {}) as Record<string, unknown>
                    if (values.provisionType === 'X509_CERTIFICATE_CHAIN') {
                      provisionConfig.allowCreateNewDevicesByX509 = values.provisionCreateNewDevices ?? false
                      provisionConfig.certificate = values.provisionCertificatePem ?? ''
                      provisionConfig.certificateValuePattern = values.provisionCnRegex ?? '(.*)'
                    }
                    if (values.transportType === 'MQTT') {
                      transportConfig.type = 'MQTT'
                      transportConfig.sparkplug = values.mqttSparkplugEon ?? false
                      transportConfig.telemetryTopicFilter = values.mqttTelemetryTopicFilter ?? 'v1/devices/me/telemetry'
                      transportConfig.attributesPublishTopicFilter = values.mqttAttributesPublishTopicFilter ?? 'v1/devices/me/attributes'
                      transportConfig.attributesSubscribeTopicFilter = values.mqttAttributesSubscribeTopicFilter ?? 'v1/devices/me/attributes'
                      transportConfig.devicePayloadType = values.mqttDevicePayload ?? 'JSON'
                      transportConfig.sendAckOnValidationFailure = values.mqttSendPubackOnValidationFailure ?? false
                    }
                    if (values.transportType === 'COAP') {
                      transportConfig.type = 'COAP'
                      transportConfig.coapDeviceTypeConfiguration = {
                        coapDeviceType: values.coapDeviceType ?? 'DEFAULT',
                        transportPayloadTypeConfiguration: { transportPayloadType: values.coapDevicePayload ?? 'JSON' },
                      }
                      transportConfig.clientSettings = {
                        powerMode: values.coapPowerSavingMode ?? 'DRX',
                        psmActivityTimer: (transportConfig.clientSettings as { psmActivityTimer?: number })?.psmActivityTimer ?? 0,
                        edrxCycle: (transportConfig.clientSettings as { edrxCycle?: number })?.edrxCycle ?? 0,
                        pagingTransmissionWindow: (transportConfig.clientSettings as { pagingTransmissionWindow?: number })?.pagingTransmissionWindow ?? 0,
                      }
                    }
                    if (values.transportType === 'LWM2M') {
                      transportConfig.type = 'LWM2M'
                      transportConfig.objectList = values.lwm2mObjectList ?? ''
                      transportConfig.observeAttr = {
                        ...((transportConfig.observeAttr as Record<string, unknown>) ?? {}),
                        initAttrTelAsObsStrategy: values.lwm2mInitAttrTelAsObs ?? false,
                        observeStrategy: values.lwm2mObserveStrategy ?? 'SINGLE',
                      }
                      transportConfig.bootstrap = { bootstrapServerUpdate: values.lwm2mIncludeBootstrapServerUpdates ?? false }
                      transportConfig.otaUpdate = { useObject19: values.lwm2mUseObject19ForOta ?? false }
                      transportConfig.firmwareUpdateStrategy = values.lwm2mFirmwareUpdateStrategy ?? 'OBJECT_5_RESOURCE_0'
                      transportConfig.softwareUpdateStrategy = values.lwm2mSoftwareUpdateStrategy ?? 'OBJECT_9_RESOURCE_2'
                      transportConfig.clientSettings = { ...((transportConfig.clientSettings as Record<string, unknown>) ?? {}), powerMode: values.lwm2mPowerSavingMode ?? 'DRX' }
                      transportConfig.defaultObjectVersion = values.lwm2mDefaultObjectVersion ?? '1.0'
                      try {
                        transportConfig.jsonConfig = typeof values.lwm2mJsonConfig === 'string' && values.lwm2mJsonConfig.trim() ? JSON.parse(values.lwm2mJsonConfig) : undefined
                      } catch {
                        transportConfig.jsonConfig = undefined
                      }
                    }
                    if (values.transportType === 'SNMP') {
                      transportConfig.type = 'SNMP'
                      transportConfig.timeout = Number(values.snmpTimeout) ?? 500
                      transportConfig.retries = Number(values.snmpRetries) ?? 0
                      transportConfig.communicationConfigs = [
                        {
                          scope: values.snmpScope ?? 'CLIENT',
                          queryingFrequencyMs: Number(values.snmpQueryingFrequencyMs) ?? 5000,
                          mappings: (values.snmpMappings as { dataType?: string; dataKey?: string; oid?: string }[] | undefined) ?? [],
                        },
                      ]
                    }
                    const body: Record<string, unknown> = {
                      ...existing,
                      id: { id: profileId, entityType: 'DEVICE_PROFILE' },
                      name: values.profileName,
                      description: (values.profileDescription ?? existing.description ?? '') as string,
                      image: (profileImageLink?.trim() || (existing.image as string) || '') as string,
                      type: (existing.type ?? 'DEFAULT') as string,
                      transportType: (values.transportType ?? existing.transportType ?? 'DEFAULT') as string,
                      provisionType: (values.provisionType ?? existing.provisionType ?? 'DISABLED') as string,
                      defaultRuleChainId: toRef(values.defaultRuleChain, 'RULE_CHAIN') ?? existing.defaultRuleChainId ?? null,
                      defaultDashboardId: toRef(values.mobileDashboard, 'DASHBOARD') ?? existing.defaultDashboardId ?? null,
                      defaultQueueName: (existing.defaultQueueName ?? '') as string,
                      provisionDeviceKey: (values.provisionDeviceKey ?? existing.provisionDeviceKey ?? '') as string,
                      provisionDeviceSecret: (values.provisionDeviceSecret ?? (existing as { provisionDeviceSecret?: string }).provisionDeviceSecret ?? '') as string,
                      firmwareId: toRef(values.assignedFirmware, 'OTA_PACKAGE') ?? existing.firmwareId ?? null,
                      softwareId: toRef(values.assignedSoftware, 'OTA_PACKAGE') ?? existing.softwareId ?? null,
                      defaultEdgeRuleChainId: toRef(values.defaultEdgeRuleChain, 'RULE_CHAIN') ?? existing.defaultEdgeRuleChainId ?? null,
                      version: existing.version ?? 0,
                      default: existing.default ?? true,
                      profileData: { ...existingProfileData, provisionConfiguration: provisionConfig, transportConfiguration: transportConfig },
                    }
                    return thingsBoardApi.saveDeviceProfile(body)
                  })
                  .then(() => {
                    addDeviceForm.setFieldValue('deviceProfileId', values.profileName)
                    setEditDeviceProfileModalOpen(false)
                    editProfileForm.resetFields()
                    resetProfileImageState()
                    message.success(t('common.saved', 'Đã lưu'))
                  })
                  .catch((err) => {
                    message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed', 'Lưu thất bại'))
                  })
                  .finally(() => setEditProfileLoading(false))
              })
            }}
            okText={t('common.save')}
            cancelText={t('common.cancel')}
            width={560}
            rootClassName="edit-device-profile-modal-wrap"
            className="edit-device-profile-modal"
            destroyOnClose
          >
            <Spin spinning={editProfileLoading} tip={t('common.loading', 'Đang tải...')}>
            <Form form={editProfileForm} layout="vertical" className="mt-2">
              <Form.Item name="profileName" label={t('energyDeviceConfig.name') + ' *'} rules={[{ required: true }]}>
                <Input placeholder="default" />
              </Form.Item>
              <Form.Item name="defaultRuleChain" label={t('energyDeviceConfig.defaultRuleChain', 'Default rule chain')}>
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.selectOption')}
                  options={profileOptions.defaultRuleChain}
                  loading={profileOptionsLoading.defaultRuleChain}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('defaultRuleChain', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item name="mobileDashboard" label={t('energyDeviceConfig.mobileDashboard', 'Mobile dashboard')}>
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.usedByMobile', 'Used by mobile application as a device details dashboard')}
                  options={profileOptions.mobileDashboard}
                  loading={profileOptionsLoading.mobileDashboard}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('mobileDashboard', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item name="queue" label={t('energyDeviceConfig.queue', 'Queue')}>
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.selectOption')}
                  options={profileOptions.queue}
                  loading={profileOptionsLoading.queue}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('queue', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item
                name="defaultEdgeRuleChain"
                label={t('energyDeviceConfig.defaultRuleChain', 'Default edge rule chain')}
                extra={t('energyDeviceConfig.defaultEdgeRuleChainExtra', 'Used on edge as rule chain to process incoming data for devices of this device profile')}
              >
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.defaultEdgeRuleChain', 'Default edge rule chain')}
                  options={profileOptions.defaultEdgeRuleChain}
                  loading={profileOptionsLoading.defaultEdgeRuleChain}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('defaultEdgeRuleChain', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item
                name="assignedFirmware"
                label={t('energyDeviceConfig.assignedFirmware', 'Assigned firmware')}
                extra={t('energyDeviceConfig.assignedFirmwareExtra', 'Choose firmware that will be distributed to the devices')}
              >
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.assignedFirmware', 'Assigned firmware')}
                  options={profileOptions.assignedFirmware}
                  loading={profileOptionsLoading.assignedFirmware}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('assignedFirmware', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item
                name="assignedSoftware"
                label={t('energyDeviceConfig.assignedSoftware', 'Assigned software')}
                extra={t('energyDeviceConfig.assignedSoftwareExtra', 'Choose software that will be distributed to the devices')}
              >
                <Select
                  allowClear
                  placeholder={t('energyDeviceConfig.assignedSoftware', 'Assigned software')}
                  options={profileOptions.assignedSoftware}
                  loading={profileOptionsLoading.assignedSoftware}
                  onDropdownVisibleChange={(open) => open && fetchDropdownOptions('assignedSoftware', editingProfileIdRef.current || DEFAULT_DEVICE_PROFILE_ID)}
                />
              </Form.Item>
              <Form.Item label={t('energyDeviceConfig.deviceProfileImage', 'Device profile image')}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="add-device-profile-image-placeholder">
                    {profileImagePreviewUrl || profileImageLink ? (
                      <img src={profileImagePreviewUrl || profileImageLink} alt="" className="add-device-profile-image-preview" onError={() => setProfileImagePreviewUrl(null)} />
                    ) : (
                      t('energyDeviceConfig.noImageSelected', 'No image selected')
                    )}
                  </div>
                  {showSetLinkInput ? (
                    <div className="add-device-profile-image-link-wrap">
                      <span className="add-device-profile-image-link-label">{t('energyDeviceConfig.imageLink', 'Image link')}</span>
                      <Input
                        value={profileImageLink}
                        onChange={(e) => setProfileImageLink(e.target.value)}
                        placeholder={t('energyDeviceConfig.imageLinkPlaceholder', 'Set')}
                        suffix={
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => { setShowSetLinkInput(false); setProfileImageLink('') }}
                            aria-label={t('common.clear')}
                          />
                        }
                        className="add-device-profile-image-link-input"
                      />
                    </div>
                  ) : (
                    <Space>
                      <Button
                        type="default"
                        icon={<PictureOutlined />}
                        onClick={() => profileImageFileInputRef.current?.click()}
                      >
                        {t('energyDeviceConfig.browseFromGallery', 'Browse from gallery')}
                      </Button>
                      <Button type="default" icon={<LinkOutlined />} onClick={() => setShowSetLinkInput(true)}>
                        {t('energyDeviceConfig.setLink', 'Set link')}
                      </Button>
                    </Space>
                  )}
                </div>
                <input
                  ref={profileImageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setProfileImagePreviewUrl((prev) => { if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
                      setProfileImageLink('')
                      setShowSetLinkInput(false)
                    }
                    e.target.value = ''
                  }}
                  aria-hidden
                />
              </Form.Item>
              <Form.Item name="profileDescription" label={t('energyDeviceConfig.description')}>
                <Input.TextArea rows={3} placeholder={t('energyDeviceConfig.defaultDeviceProfile', 'Default device profile.')} />
              </Form.Item>
              <Form.Item name="transportType" label={t('energyDeviceConfig.transportType', 'Transport type') + ' *'}>
                <Select
                  placeholder={t('energyDeviceConfig.selectOption')}
                  options={[
                    { value: 'DEFAULT', label: t('energyDeviceConfig.transportDefault', 'Default') },
                    { value: 'MQTT', label: 'MQTT' },
                    { value: 'COAP', label: 'CoAP' },
                    { value: 'LWM2M', label: 'LWM2M' },
                    { value: 'SNMP', label: 'SNMP' },
                  ]}
                />
              </Form.Item>
              {editTransportType === 'MQTT' && (
                <Collapse
                  ghost
                  defaultActiveKey={['transportConfig']}
                  items={[
                    {
                      key: 'transportConfig',
                      label: t('energyDeviceConfig.transportConfiguration', 'Transport configuration'),
                      children: (
                        <>
                          <Form.Item name="mqttSparkplugEon" label={t('energyDeviceConfig.mqttSparkplugEonLabel', 'MQTT Sparkplug B Edge of Network (EoN) node.')} valuePropName="checked">
                            <Switch />
                          </Form.Item>
                          <Form.Item
                            name="mqttTelemetryTopicFilter"
                            label={t('energyDeviceConfig.telemetryTopicFilter', 'Telemetry topic filter') + ' *'}
                            rules={[{ required: true }]}
                            initialValue="v1/devices/me/telemetry"
                          >
                            <Input placeholder="v1/devices/me/telemetry" />
                          </Form.Item>
                          <Form.Item
                            name="mqttAttributesPublishTopicFilter"
                            label={t('energyDeviceConfig.attributesPublishTopicFilter', 'Attributes publish topic filter') + ' *'}
                            rules={[{ required: true }]}
                            initialValue="v1/devices/me/attributes"
                          >
                            <Input placeholder="v1/devices/me/attributes" />
                          </Form.Item>
                          <Form.Item
                            name="mqttAttributesSubscribeTopicFilter"
                            label={t('energyDeviceConfig.attributesSubscribeTopicFilter', 'Attributes subscribe topic filter') + ' *'}
                            rules={[{ required: true }]}
                            initialValue="v1/devices/me/attributes"
                          >
                            <Input placeholder="v1/devices/me/attributes" />
                          </Form.Item>
                          <Typography.Text type="secondary" className="block mb-2" style={{ fontSize: '12px' }}>
                            {t('energyDeviceConfig.mqttTopicWildcardsHint', 'Single `[+]` and multi-level `[#]` wildcards supported. `[+]` is suitable for any topic filter level. Ex.: v1/devices/+/telemetry. `[#]` can replace the topic filter itself and must be the last symbol. Ex.: # or v1/devices/me/#')}
                          </Typography.Text>
                          <Form.Item
                            name="mqttDevicePayload"
                            label={t('energyDeviceConfig.mqttDevicePayload', 'MQTT device payload')}
                            initialValue="JSON"
                          >
                            <Select
                              options={[
                                { value: 'JSON', label: 'JSON' },
                                { value: 'PROTOBUF', label: 'Protobuf' },
                              ]}
                            />
                          </Form.Item>
                          <Form.Item
                            name="mqttSendPubackOnValidationFailure"
                            label={t('energyDeviceConfig.mqttSendPubackLabel', 'Send PUBACK on PUBLISH message validation failure')}
                            valuePropName="checked"
                            extra={t('energyDeviceConfig.mqttSendPubackHint', 'By default, the platform will close the MQTT session on message validation failure. When enabled, the platform will send publish acknowledgment instead of closing the session.')}
                          >
                            <Switch />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]}
                />
              )}
              {editTransportType === 'COAP' && (
                <Collapse
                  ghost
                  defaultActiveKey={['transportConfigCoap']}
                  items={[
                    {
                      key: 'transportConfigCoap',
                      label: t('energyDeviceConfig.transportConfiguration', 'Transport configuration'),
                      children: (
                        <>
                          <Form.Item
                            name="coapDeviceType"
                            label={t('energyDeviceConfig.coapDeviceType', 'CoAP device type')}
                            initialValue="DEFAULT"
                          >
                            <Select
                              options={[
                                { value: 'DEFAULT', label: t('energyDeviceConfig.transportDefault', 'Default') },
                                { value: 'EFENTO_NB_IOT', label: t('energyDeviceConfig.coapDeviceTypeEfento', 'Efento NB-IoT') },
                              ]}
                            />
                          </Form.Item>
                          <Form.Item
                            name="coapDevicePayload"
                            label={t('energyDeviceConfig.coapDevicePayload', 'CoAP device payload')}
                            initialValue="JSON"
                          >
                            <Select
                              options={[
                                { value: 'JSON', label: 'JSON' },
                                { value: 'PROTOBUF', label: 'Protobuf' },
                              ]}
                            />
                          </Form.Item>
                          <Form.Item
                            name="coapPowerSavingMode"
                            label={t('energyDeviceConfig.coapPowerSavingMode', 'Power Saving Mode')}
                            initialValue="DRX"
                          >
                            <Select
                              options={[
                                { value: 'PSM', label: t('energyDeviceConfig.powerSavingPsm', 'Power Saving Mode (PSM)') },
                                { value: 'DRX', label: t('energyDeviceConfig.powerSavingDrx', 'Discontinuous Reception (DRX)') },
                                { value: 'EDRX', label: t('energyDeviceConfig.powerSavingEdrx', 'Extended Discontinuous Reception (eDRX)') },
                              ]}
                            />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]}
                />
              )}
              {editTransportType === 'LWM2M' && (
                <Collapse
                  ghost
                  defaultActiveKey={['transportConfigLwm2m']}
                  items={[
                    {
                      key: 'transportConfigLwm2m',
                      label: t('energyDeviceConfig.transportConfiguration', 'Transport configuration'),
                      children: (
                        <Tabs
                          className="edit-device-profile-lwm2m-tabs"
                          items={[
                            {
                              key: 'lwm2mModel',
                              label: t('energyDeviceConfig.lwm2mTabModel', 'LWM2M Model'),
                              children: (
                                <>
                                  <Form.Item name="lwm2mObjectList" label={t('energyDeviceConfig.lwm2mObjectList', 'Object list')}>
                                    <Input.TextArea rows={2} placeholder="e.g. 1,2,3,5,9" />
                                  </Form.Item>
                                  <Form.Item name="lwm2mInitAttrTelAsObs" label={t('energyDeviceConfig.lwm2mInitAttrTelAsObs', 'Initialize attributes and telemetry using Observe strategy')} valuePropName="checked">
                                    <Switch />
                                  </Form.Item>
                                  <Form.Item name="lwm2mObserveStrategy" label={t('energyDeviceConfig.lwm2mObserveStrategy', 'Observe strategy')} initialValue="SINGLE">
                                    <Select
                                      options={[
                                        { value: 'SINGLE', label: t('energyDeviceConfig.lwm2mObserveSingle', 'Single') },
                                        { value: 'MULTIPLE', label: t('energyDeviceConfig.lwm2mObserveMultiple', 'Multiple') },
                                      ]}
                                    />
                                  </Form.Item>
                                </>
                              ),
                            },
                            {
                              key: 'bootstrap',
                              label: t('energyDeviceConfig.lwm2mTabBootstrap', 'Bootstrap'),
                              children: (
                                <>
                                  <Form.Item name="lwm2mIncludeBootstrapServerUpdates" label={t('energyDeviceConfig.lwm2mIncludeBootstrapServerUpdates', 'Include Bootstrap Server updates')} valuePropName="checked">
                                    <Switch />
                                  </Form.Item>
                                  <Button type="primary" size="small" className="mb-2">
                                    {t('energyDeviceConfig.lwm2mAddServer', 'Add LwM2M server')}
                                  </Button>
                                </>
                              ),
                            },
                            {
                              key: 'otherSettings',
                              label: t('energyDeviceConfig.lwm2mTabOtherSettings', 'Other settings'),
                              children: (
                                <>
                                  <Form.Item name="lwm2mUseObject19ForOta" label={t('energyDeviceConfig.lwm2mUseObject19ForOta', 'Use Object 19 for OTA file metadata (checksum, size, version, name)')} valuePropName="checked">
                                    <Switch />
                                  </Form.Item>
                                  <Form.Item name="lwm2mFirmwareUpdateStrategy" label={t('energyDeviceConfig.lwm2mFirmwareUpdateStrategy', 'Firmware update strategy')} initialValue="OBJECT_5_RESOURCE_0">
                                    <Select
                                      options={[
                                        { value: 'OBJECT_5_RESOURCE_0', label: t('energyDeviceConfig.lwm2mFirmwareStrategyPackage', 'Push firmware update as binary file using Object 5 and Resource 0 (Package)') },
                                      ]}
                                    />
                                  </Form.Item>
                                  <Form.Item name="lwm2mSoftwareUpdateStrategy" label={t('energyDeviceConfig.lwm2mSoftwareUpdateStrategy', 'Software update strategy')} initialValue="OBJECT_9_RESOURCE_2">
                                    <Select
                                      options={[
                                        { value: 'OBJECT_9_RESOURCE_2', label: t('energyDeviceConfig.lwm2mSoftwareStrategyPackage', 'Push binary file using Object 9 and Resource 2 (Package)') },
                                      ]}
                                    />
                                  </Form.Item>
                                  <Form.Item name="lwm2mPowerSavingMode" label={t('energyDeviceConfig.coapPowerSavingMode', 'Power Saving Mode')} initialValue="DRX">
                                    <Select
                                      options={[
                                        { value: 'PSM', label: t('energyDeviceConfig.powerSavingPsm', 'Power Saving Mode (PSM)') },
                                        { value: 'DRX', label: t('energyDeviceConfig.powerSavingDrx', 'Discontinuous Reception (DRX)') },
                                        { value: 'EDRX', label: t('energyDeviceConfig.powerSavingEdrx', 'Extended Discontinuous Reception (eDRX)') },
                                      ]}
                                    />
                                  </Form.Item>
                                  <Form.Item name="lwm2mDefaultObjectVersion" label={t('energyDeviceConfig.lwm2mDefaultObjectVersion', 'Default Object Version (Attribute)')} initialValue="1.0">
                                    <Select
                                      options={[
                                        { value: '1.0', label: '1.0' },
                                      ]}
                                    />
                                  </Form.Item>
                                </>
                              ),
                            },
                            {
                              key: 'jsonConfig',
                              label: t('energyDeviceConfig.lwm2mTabJsonConfig', 'Json Config Profile Device'),
                              children: (
                                <Form.Item name="lwm2mJsonConfig" label="LWM2M">
                                  <Input.TextArea
                                    rows={12}
                                    placeholder={'{\n  "observeAttr": {\n    "observe": [],\n    "attribute": [],\n    "telemetry": [],\n    "keyName": {},\n    "attributeLwm2m": {},\n    "initAttrTelAsObsStrategy": false,\n    "observeStrategy": "SINGLE"\n  }\n}'}
                                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                                  />
                                </Form.Item>
                              ),
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              )}
              {editTransportType === 'SNMP' && (
                <Collapse
                  ghost
                  defaultActiveKey={['transportConfigSnmp', 'snmpCommConfigs']}
                  items={[
                    {
                      key: 'transportConfigSnmp',
                      label: t('energyDeviceConfig.transportConfiguration', 'Transport configuration'),
                      children: (
                        <>
                          <Form.Item name="snmpTimeout" label={t('energyDeviceConfig.snmpTimeout', 'Timeout, ms') + ' *'} initialValue={500} rules={[{ required: true }]}>
                            <Input type="number" min={1} placeholder="500" />
                          </Form.Item>
                          <Form.Item name="snmpRetries" label={t('energyDeviceConfig.snmpRetries', 'Retries') + ' *'} initialValue={0} rules={[{ required: true }]}>
                            <Input type="number" min={0} placeholder="0" />
                          </Form.Item>
                        </>
                      ),
                    },
                    {
                      key: 'snmpCommConfigs',
                      label: t('energyDeviceConfig.snmpCommunicationConfigs', 'Communication configs'),
                      children: (
                        <>
                          <Form.Item name="snmpScope" label={t('energyDeviceConfig.snmpScope', 'Scope')} initialValue="CLIENT">
                            <Select options={[{ value: 'CLIENT', label: t('energyDeviceConfig.snmpScopeClient', 'Client') }]} />
                          </Form.Item>
                          <Form.Item name="snmpQueryingFrequencyMs" label={t('energyDeviceConfig.snmpQueryingFrequency', 'Querying frequency, ms') + ' *'} initialValue={5000} rules={[{ required: true }]}>
                            <Input type="number" min={1} placeholder="5000" />
                          </Form.Item>
                          <Form.List name="snmpMappings">
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(({ key, name, ...rest }) => (
                                  <Row key={key} gutter={8} align="middle" className="mb-2">
                                    <Col span={6}>
                                      <Form.Item {...rest} name={[name, 'dataType']} label={t('energyDeviceConfig.snmpDataType', 'Data type')} rules={[{ required: true }]}>
                                        <Select placeholder={t('energyDeviceConfig.selectOption')} options={[{ value: 'STRING', label: t('energyDeviceConfig.snmpDataTypeString', 'String') }, { value: 'INTEGER', label: 'Integer' }, { value: 'DOUBLE', label: 'Double' }]} />
                                      </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                      <Form.Item {...rest} name={[name, 'dataKey']} label={t('energyDeviceConfig.snmpDataKey', 'Data key') + ' *'} rules={[{ required: true }]}>
                                        <Input placeholder="" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                      <Form.Item {...rest} name={[name, 'oid']} label={t('energyDeviceConfig.snmpOid', 'OID') + ' *'} rules={[{ required: true }]}>
                                        <Input placeholder="" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                      <Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(name)} aria-label={t('common.clear')} />
                                    </Col>
                                  </Row>
                                ))}
                                <Button type="dashed" onClick={() => add()} block className="mb-2">
                                  + {t('energyDeviceConfig.snmpAddMapping', 'Add mapping')}
                                </Button>
                              </>
                            )}
                          </Form.List>
                          <Button type="dashed" block>{'+ ' + t('energyDeviceConfig.snmpAddCommunicationConfig', 'Add communication config')}</Button>
                        </>
                      ),
                    },
                  ]}
                />
              )}
              <Collapse
                ghost
                items={[
                  {
                    key: 'deviceProvisioning',
                    label: t('energyDeviceConfig.deviceProvisioning', 'Device provisioning'),
                    children: (
                      <>
                        <Form.Item name="provisionType" label={t('energyDeviceConfig.provisionStrategy', 'Provision strategy') + ' *'}>
                          <Select
                            placeholder={t('energyDeviceConfig.selectOption')}
                            options={[
                              { value: 'DISABLED', label: t('energyDeviceConfig.provisionDisabled', 'Disabled') },
                              { value: 'ALLOW_CREATE', label: t('energyDeviceConfig.provisionAllowCreate', 'Allow to create new devices') },
                              { value: 'CHECK_PRE_PROVISIONED', label: t('energyDeviceConfig.provisionCheckPreProvisioned', 'Check for pre-provisioned devices') },
                              { value: 'X509_CERTIFICATE_CHAIN', label: t('energyDeviceConfig.provisionX509', 'X509 Certificates Chain') },
                            ]}
                          />
                        </Form.Item>
                        {(editProvisionType === 'ALLOW_CREATE' || editProvisionType === 'CHECK_PRE_PROVISIONED') && (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="provisionDeviceKey" label={t('energyDeviceConfig.provisionDeviceKey', 'Provision device key') + ' *'}>
                                <Input
                                  placeholder={t('energyDeviceConfig.provisionDeviceKeyPlaceholder', 'Provision device key')}
                                  suffix={
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<CopyOutlined />}
                                      onClick={() => {
                                        const v = editProfileForm.getFieldValue('provisionDeviceKey')
                                        if (v) navigator.clipboard?.writeText(v).then(() => message.success(t('energyDeviceConfig.copied', 'Copied')))
                                      }}
                                      title={t('energyDeviceConfig.copy', 'Copy')}
                                    />
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="provisionDeviceSecret" label={t('energyDeviceConfig.provisionDeviceSecret', 'Provision device secret') + ' *'}>
                                <Input
                                  placeholder={t('energyDeviceConfig.provisionDeviceSecretPlaceholder', 'Provision device secret')}
                                  suffix={
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<CopyOutlined />}
                                      onClick={() => {
                                        const v = editProfileForm.getFieldValue('provisionDeviceSecret')
                                        if (v) navigator.clipboard?.writeText(v).then(() => message.success(t('energyDeviceConfig.copied', 'Copied')))
                                      }}
                                      title={t('energyDeviceConfig.copy', 'Copy')}
                                    />
                                  }
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        )}
                        {editProvisionType === 'X509_CERTIFICATE_CHAIN' && (
                          <>
                            <Form.Item name="provisionCreateNewDevices" label={t('energyDeviceConfig.createNewDevices', 'Create new devices')} valuePropName="checked">
                              <Switch />
                            </Form.Item>
                            <Form.Item name="provisionCertificatePem" label={t('energyDeviceConfig.certificatePemFormat', 'Certificate in PEM format') + ' *'}>
                              <Input.TextArea rows={4} placeholder={t('energyDeviceConfig.certificatePemPlaceholder', 'PEM certificate content')} />
                            </Form.Item>
                            <Form.Item name="provisionCnRegex" label={t('energyDeviceConfig.cnRegexVariable', 'CN Regular Expression variable') + ' *'} initialValue="(.*)">
                              <Input placeholder="(.*)" />
                            </Form.Item>
                          </>
                        )}
                      </>
                    ),
                  },
                ]}
              />
            </Form>
            </Spin>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.importDevice', 'Import device')}
            open={importDeviceModalOpen}
            onCancel={() => setImportDeviceModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setImportDeviceModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="import" type="primary" icon={<UploadOutlined />}>{t('energyDeviceConfig.import', 'Import')}</Button>,
            ]}
            destroyOnClose
          >
            <Upload.Dragger
              accept=".json,.csv"
              multiple={false}
              beforeUpload={() => false}
              maxCount={1}
              className="mt-2"
            >
              <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} /></p>
              <p className="ant-upload-text">{t('energyDeviceConfig.importDragText', 'Kéo thả file hoặc bấm để chọn')}</p>
              <p className="ant-upload-hint">{t('energyDeviceConfig.importHint', 'Hỗ trợ JSON, CSV')}</p>
            </Upload.Dragger>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.assignDevicesToCustomer', 'Assign Device(s) To Customer')}
            open={deviceAssignModalOpen}
            onCancel={() => setDeviceAssignModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setDeviceAssignModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="assign" type="primary">{t('energyDeviceConfig.assign', 'Assign')}</Button>,
            ]}
          >
            <p className="mb-3">{t('energyDeviceConfig.selectCustomerToAssign', 'Please select the customer to assign the device(s)')}</p>
            <Select placeholder={t('energyDeviceConfig.customerRequired', 'Customer*')} style={{ width: '100%' }} options={[]} allowClear />
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeDevicePublicConfirmTitle', 'Are you sure you want to make the device \'{{name}}\' public?', { name: deviceMakePublicDeviceName || '—' })}
            open={deviceMakePublicModalOpen}
            onCancel={() => { setDeviceMakePublicModalOpen(false); setDeviceMakePublicDeviceName(''); setDeviceMakePublicDeviceIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setDeviceMakePublicModalOpen(false); setDeviceMakePublicDeviceName(''); setDeviceMakePublicDeviceIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button
                key="yes"
                type="primary"
                onClick={() => {
                  const ids = deviceMakePublicDeviceIds
                  setDeviceMakePublicModalOpen(false)
                  setDeviceMakePublicDeviceName('')
                  setDeviceMakePublicDeviceIds([])
                  setSelectedDeviceRowKeys([])
                  if (ids.length === 0) return
                  Promise.all(ids.map((id) => thingsBoardApi.makeDevicePublic(id)))
                    .then(() => { message.success(t('common.saved')); fetchDeviceInfos(page, pageSize) })
                    .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                }}
              >
                {t('common.yes', 'Yes')}
              </Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeDevicePublicConfirmMessage', 'After the confirmation the device and all its data will be made public and accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeDevicePrivateConfirmTitle', 'Are you sure you want to make the device \'{{name}}\' private?', { name: deviceMakePrivateDeviceName || '—' })}
            open={deviceMakePrivateModalOpen}
            onCancel={() => { setDeviceMakePrivateModalOpen(false); setDeviceMakePrivateDeviceName(''); setDeviceMakePrivateDeviceIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setDeviceMakePrivateModalOpen(false); setDeviceMakePrivateDeviceName(''); setDeviceMakePrivateDeviceIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button
                key="yes"
                type="primary"
                onClick={() => {
                  const ids = deviceMakePrivateDeviceIds
                  setDeviceMakePrivateModalOpen(false)
                  setDeviceMakePrivateDeviceName('')
                  setDeviceMakePrivateDeviceIds([])
                  setSelectedDeviceRowKeys([])
                  if (ids.length === 0) return
                  Promise.all(ids.map((id) => thingsBoardApi.makeDevicePrivate(id)))
                    .then(() => { message.success(t('common.saved')); fetchDeviceInfos(page, pageSize) })
                    .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                }}
              >
                {t('common.yes', 'Yes')}
              </Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeDevicePrivateConfirmMessage', 'After the confirmation the device and all its data will be made private and won\'t be accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.unassignDeviceConfirm', 'Unassign device?')}
            open={deviceUnassignModalOpen}
            onCancel={() => setDeviceUnassignModalOpen(false)}
            footer={[
              <Button key="no" onClick={() => setDeviceUnassignModalOpen(false)}>{t('common.no', 'No')}</Button>,
              <Button
                key="yes"
                type="primary"
                onClick={() => {
                  const ids = selectedDeviceRowKeys.map((k) => String(k))
                  setDeviceUnassignModalOpen(false)
                  setSelectedDeviceRowKeys([])
                  if (ids.length === 0) return
                  Promise.all(ids.map((id) => thingsBoardApi.unassignDeviceFromCustomer(id)))
                    .then(() => { message.success(t('common.saved')); fetchDeviceInfos(page, pageSize) })
                    .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                }}
              >
                {t('common.yes', 'Yes')}
              </Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.unassignDeviceConfirmMessage', 'After the confirmation the device will be unassigned and won\'t be accessible by the customer.')}</p>
          </Modal>
          <Modal
            className="device-credentials-modal"
            title={t('energyDeviceConfig.deviceCredentials', 'Device Credentials')}
            open={deviceCredentialsModalOpen}
            onCancel={() => {
              setDeviceCredentialsModalOpen(false)
              setDeviceCredentialsDevice(null)
              setDeviceCredentialsType('accessToken')
              setDeviceCredAccessToken('')
              setDeviceCredX509('')
              setDeviceCredClientId('')
              setDeviceCredUserName('')
              setDeviceCredPassword('')
            }}
            footer={[
              <Button key="cancel" onClick={() => { setDeviceCredentialsModalOpen(false); setDeviceCredentialsDevice(null); setDeviceCredentialsType('accessToken'); setDeviceCredAccessToken(''); setDeviceCredX509(''); setDeviceCredClientId(''); setDeviceCredUserName(''); setDeviceCredPassword('') }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button
                key="save"
                type="primary"
                disabled={
                  deviceCredentialsType === 'accessToken' ? !deviceCredAccessToken?.trim() :
                  deviceCredentialsType === 'x509' ? !deviceCredX509?.trim() :
                  !(deviceCredClientId?.trim() || deviceCredUserName?.trim())
                }
                onClick={() => { message.info(t('common.saved')); setDeviceCredentialsModalOpen(false); setDeviceCredentialsDevice(null); fetchDeviceInfos(page, pageSize) }}
              >
                {t('common.save', 'Save')}
              </Button>,
            ]}
            width={480}
          >
            <div className="device-credentials-modal-body">
              <div className="device-credentials-label">{t('energyDeviceConfig.credentialsType', 'Credentials type')}</div>
              <Segmented
                block
                className="device-credentials-segmented"
                value={deviceCredentialsType}
                onChange={(v) => setDeviceCredentialsType((v as 'accessToken' | 'x509' | 'mqttBasic') || 'accessToken')}
                options={[
                  { label: t('energyDeviceConfig.accessToken', 'Access token'), value: 'accessToken' },
                  { label: 'X.509', value: 'x509' },
                  { label: t('energyDeviceConfig.mqttBasic', 'MQTT Basic'), value: 'mqttBasic' },
                ]}
              />
              {deviceCredentialsType === 'accessToken' && (
                <div className="device-credentials-field mt-3">
                  <Input
                    placeholder={t('energyDeviceConfig.accessToken', 'Access token') + '*'}
                    value={deviceCredAccessToken}
                    onChange={(e) => setDeviceCredAccessToken(e.target.value)}
                    suffix={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => setDeviceCredAccessToken(generateToken())} title={t('common.refresh', 'Refresh')} />}
                  />
                </div>
              )}
              {deviceCredentialsType === 'x509' && (
                <div className="device-credentials-field mt-3">
                  <Input.TextArea
                    placeholder={t('energyDeviceConfig.certificatePemPlaceholder', 'Certificate in PEM format*')}
                    value={deviceCredX509}
                    onChange={(e) => setDeviceCredX509(e.target.value)}
                    rows={6}
                    className="device-credentials-textarea"
                  />
                </div>
              )}
              {deviceCredentialsType === 'mqttBasic' && (
                <div className="device-credentials-mqtt mt-3">
                  <div className="device-credentials-field">
                    <Input
                      placeholder={t('energyDeviceConfig.clientId', 'Client ID')}
                      value={deviceCredClientId}
                      onChange={(e) => setDeviceCredClientId(e.target.value)}
                      suffix={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => setDeviceCredClientId(generateToken(16))} title={t('common.refresh', 'Refresh')} />}
                    />
                  </div>
                  <div className="device-credentials-field">
                    <Input
                      placeholder={t('energyDeviceConfig.userName', 'User Name')}
                      value={deviceCredUserName}
                      onChange={(e) => setDeviceCredUserName(e.target.value)}
                      suffix={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => setDeviceCredUserName(generateToken(12))} title={t('common.refresh', 'Refresh')} />}
                    />
                  </div>
                  <div className="device-credentials-field">
                    <Input.Password
                      placeholder={t('energyDeviceConfig.password', 'Password')}
                      value={deviceCredPassword}
                      onChange={(e) => setDeviceCredPassword(e.target.value)}
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      suffix={<Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => setDeviceCredPassword(generateToken(12))} title={t('common.refresh', 'Refresh')} />}
                    />
                  </div>
                  {!(deviceCredClientId?.trim() || deviceCredUserName?.trim()) && (
                    <div className="device-credentials-mqtt-error">{t('energyDeviceConfig.mqttClientIdOrUserRequired', 'Client ID and/or User Name are necessary.')}</div>
                  )}
                </div>
              )}
            </div>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.deleteDeviceConfirmTitle', 'Are you sure you want to delete the device \'{{name}}\'?', { name: deviceDeleteDeviceName || '—' })}
            open={deviceDeleteModalOpen}
            onCancel={() => setDeviceDeleteModalOpen(false)}
            footer={[
              <Button key="no" onClick={() => setDeviceDeleteModalOpen(false)}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" danger onClick={() => { setDeviceDeleteModalOpen(false); message.info(t('common.saved')); fetchDeviceInfos(page, pageSize); setSelectedDeviceRowKeys([]) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.deleteDeviceConfirmMessage', 'Be careful, after the confirmation the device and all related data will become unrecoverable.')}</p>
          </Modal>
          {selectedDeviceRowKeys.length > 0 && (
            <div className="energy-toolbar-bulk-actions flex flex-wrap items-center mb-3">
              <Button
                disabled={devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some(deviceHasCustomer)}
                onClick={() => setDeviceAssignModalOpen(true)}
              >
                {t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
              </Button>
              <Button
                disabled={selectedDeviceRowKeys.length > 0 && devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).every((d) => d.customerIsPublic)}
                onClick={() => {
                  const ids = selectedDeviceRowKeys.map((k) => String(k))
                  const firstId = ids[0]
                  const firstDevice = devices.find((d) => (d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) === firstId)
                  setDeviceMakePublicDeviceIds(ids)
                  setDeviceMakePublicDeviceName(firstDevice?.name ?? firstId ?? '—')
                  setDeviceMakePublicModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
              </Button>
              <Button
                disabled={!devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some((d) => d.customerIsPublic)}
                onClick={() => {
                  const selectedDevs = devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? ''))
                  const publicIds = selectedDevs.filter((d) => d.customerIsPublic).map((d) => (d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')
                  const first = selectedDevs.find((d) => d.customerIsPublic)
                  setDeviceMakePrivateDeviceIds(publicIds)
                  setDeviceMakePrivateDeviceName(first?.name ?? publicIds[0] ?? '—')
                  setDeviceMakePrivateModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
              </Button>
              <Space size="middle" className="energy-toolbar-icon-group">
                <Button
                type="text"
                icon={<ShareAltOutlined />}
                title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                disabled={selectedDeviceRowKeys.length > 0 && devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some((d) => d.customerIsPublic)}
                onClick={() => {
                  const ids = selectedDeviceRowKeys.map((k) => String(k))
                  const firstId = ids[0]
                  const firstDevice = devices.find((d) => (d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) === firstId)
                  setDeviceMakePublicDeviceIds(ids)
                  setDeviceMakePublicDeviceName(firstDevice?.name ?? firstId ?? '—')
                  setDeviceMakePublicModalOpen(true)
                }}
              />
                <Button
                type="text"
                icon={<UserOutlined />}
                title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                disabled={devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some(deviceHasCustomer)}
                onClick={() => setDeviceAssignModalOpen(true)}
              />
                <Button
                type="text"
                icon={<ExportOutlined />}
                title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                disabled={!devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some((d) => deviceHasCustomer(d) && !d.customerIsPublic && !!(d.customerTitle && String(d.customerTitle).trim()))}
                onClick={() => setDeviceUnassignModalOpen(true)}
              />
                <Button
                type="text"
                icon={<LockOutlined />}
                title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                disabled={!devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')).some((d) => d.customerIsPublic)}
                onClick={() => {
                  const selectedDevs = devices.filter((d) => selectedDeviceRowKeys.includes((d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? ''))
                  const publicIds = selectedDevs.filter((d) => d.customerIsPublic).map((d) => (d.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id: string }).id : (d.id as string)) ?? '')
                  const first = selectedDevs.find((d) => d.customerIsPublic)
                  setDeviceMakePrivateDeviceIds(publicIds)
                  setDeviceMakePrivateDeviceName(first?.name ?? publicIds[0] ?? '—')
                  setDeviceMakePrivateModalOpen(true)
                }}
              />
                <Button
                type="text"
                icon={<SafetyCertificateOutlined />}
                title={t('energyDeviceConfig.manageCredentials', 'Manage credentials')}
                onClick={() => {
                  setDeviceCredentialsType('accessToken')
                  setDeviceCredAccessToken('')
                  setDeviceCredX509('')
                  setDeviceCredClientId('')
                  setDeviceCredUserName('')
                  setDeviceCredPassword('')
                  setDeviceCredentialsModalOpen(true)
                }}
              />
                <Button type="text" danger icon={<DeleteOutlined />} title={t('energyDeviceConfig.delete', 'Delete')} onClick={() => setDeviceDeleteModalOpen(true)} />
              </Space>
            </div>
          )}
          <Table<ThingsBoardDeviceInfo>
            rowKey={(r) => r.id?.id ?? String(Math.random())}
            loading={loading}
            dataSource={devices}
            rowSelection={{
              selectedRowKeys: selectedDeviceRowKeys,
              onChange: (keys) => setSelectedDeviceRowKeys(keys),
            }}
            pagination={{
              current: page + 1,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (n) => t('common.totalItems', { count: n }),
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            columns={[
              {
                title: t('energyDeviceConfig.createdTime'),
                dataIndex: 'createdTime',
                key: 'createdTime',
                width: 170,
                sortOrder: 'descend' as const,
                render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
              },
              {
                title: t('energyDeviceConfig.name'),
                dataIndex: 'name',
                key: 'name',
                width: 170,
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.deviceProfile'),
                dataIndex: 'deviceProfileName',
                key: 'deviceProfileName',
                width: 200,
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.label'),
                dataIndex: 'label',
                key: 'label',
                width: 100,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.state'),
                dataIndex: 'active',
                key: 'state',
                width: 100,
                render: (active: boolean) => (
                  <Tag color={active ? 'green' : 'red'}>
                    {active ? t('energyDeviceConfig.active') : t('energyDeviceConfig.inactive')}
                  </Tag>
                ),
              },
              {
                title: t('energyDeviceConfig.customer'),
                dataIndex: 'customerTitle',
                key: 'customerTitle',
                width: 120,
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.public', 'Public'),
                dataIndex: 'customerIsPublic',
                key: 'customerIsPublic',
                width: 80,
                render: (v: boolean) => <Checkbox checked={!!v} disabled />,
              },
              {
                title: t('energyDeviceConfig.isGateway', 'Is gateway'),
                dataIndex: 'gateway',
                key: 'gateway',
                width: 100,
                render: (v: boolean) => <Checkbox checked={!!v} disabled />,
              },
              {
                title: '',
                key: 'actions',
                width: 220,
                fixed: 'right' as const,
                render: (_, record) => {
                  const deviceId = record?.id && typeof record.id === 'object' && 'id' in record ? (record.id as { id: string }).id : (record?.id as string)
                  const deviceName = record?.name ?? ''
                  const isPublic = !!record?.customerIsPublic
                  const cid = record?.customerId
                  const hasCustomerId = cid && (typeof cid === 'object' && cid !== null && 'id' in cid ? (cid as { id?: string }).id : String(cid).trim())
                  const hasCustomerTitle = !!(record?.customerTitle && String(record.customerTitle).trim())
                  const hasCustomer = !!(hasCustomerId || hasCustomerTitle)
                  const disableMakePublic = isPublic
                  const disableUnassign = !hasCustomer || isPublic || !hasCustomerTitle
                  return (
                    <Space size={4} className="device-config-table-actions">
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                        disabled={disableMakePublic}
                        onClick={() => {
                          if (disableMakePublic) return
                          setDeviceMakePublicDeviceIds([deviceId])
                          setDeviceMakePublicDeviceName(deviceName)
                          setDeviceMakePublicModalOpen(true)
                        }}
                      />
                      <Button
                        type="text"
                        icon={<UserOutlined />}
                        title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                        disabled={hasCustomer}
                        onClick={() => { setSelectedDeviceRowKeys([deviceId]); setDeviceAssignModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<ExportOutlined />}
                        title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                        disabled={disableUnassign}
                        onClick={() => {
                          if (disableUnassign) return
                          setSelectedDeviceRowKeys([deviceId])
                          setDeviceUnassignModalOpen(true)
                        }}
                      />
                      <Button
                        type="text"
                        icon={<LockOutlined />}
                        title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                        disabled={!isPublic}
                        onClick={() => {
                          if (!isPublic) return
                          setDeviceMakePrivateDeviceIds([deviceId])
                          setDeviceMakePrivateDeviceName(deviceName)
                          setDeviceMakePrivateModalOpen(true)
                        }}
                      />
                      <Button
                      type="text"
                      icon={<SafetyCertificateOutlined />}
                      title={t('energyDeviceConfig.manageCredentials', 'Manage credentials')}
                      onClick={() => {
                        setDeviceCredentialsDevice(record)
                        setDeviceCredentialsType('accessToken')
                        setDeviceCredAccessToken('')
                        setDeviceCredX509('')
                        setDeviceCredClientId('')
                        setDeviceCredUserName('')
                        setDeviceCredPassword('')
                        setDeviceCredentialsModalOpen(true)
                      }}
                    />
                      <Button type="text" danger icon={<DeleteOutlined />} title={t('energyDeviceConfig.delete', 'Delete')} onClick={() => { setSelectedDeviceRowKeys([deviceId]); setDeviceDeleteDeviceName(deviceName); setDeviceDeleteModalOpen(true) }} />
                    </Space>
                  )
                },
              },
            ]}
          />
        </ContentCard>
      </PageContainer>
    )
  }

  if (activeSection === 'assets') {
    return (
      <PageContainer>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => setActiveSection(null)}
          className="energy-back-btn mb-2"
        >
          {t('energyDeviceManagement.backToConfigList')}
        </Button>
        <ContentCard
          title={t('energyDeviceConfig.assets')}
          titleIcon={<BankOutlined />}
          titleIconColor="#52c41a"
          extra={
            <Space wrap align="center">
              <Select
                value={assetProfileId || 'all'}
                onChange={(v) => { setAssetProfileId(v === 'all' || v == null ? '' : v); setAssetsPage(0); fetchAssetInfos(0, assetsPageSize) }}
                allowClear
                style={{ width: 160 }}
                options={assetProfileFilterOptions.length ? assetProfileFilterOptions : [{ value: 'all', label: t('energyDeviceConfig.all', 'All') }]}
                placeholder={t('energyDeviceConfig.assetProfile', 'Asset profile')}
              />
              <Dropdown
                menu={{
                  items: [
                    { key: 'add-new-asset', icon: <FileAddOutlined />, label: t('energyDeviceConfig.addNewAsset', 'Add new asset'), onClick: openAddAssetModal },
                    { key: 'import-assets', icon: <UploadOutlined />, label: t('energyDeviceConfig.importAssets', 'Import assets'), onClick: () => setImportAssetsModalOpen(true) },
                  ],
                }}
                trigger={['click']}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  {t('common.add', 'Thêm')}
                </Button>
              </Dropdown>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={() => fetchAssetInfos(assetsPage, assetsPageSize)}
                loading={assetsLoading}
                title={t('common.refresh', 'Làm mới')}
              />
              <Space.Compact>
                <Input
                  placeholder={t('common.search', 'Tìm kiếm')}
                  prefix={<SearchOutlined />}
                  value={assetSearchText}
                  onChange={(e) => setAssetSearchText(e.target.value)}
                  onPressEnter={() => { setAssetsPage(0); fetchAssetInfos(0, assetsPageSize) }}
                  allowClear
                  style={{ width: 180 }}
                />
                <Button onClick={() => { setAssetsPage(0); fetchAssetInfos(0, assetsPageSize) }}>
                  {t('common.search', 'Tìm kiếm')}
                </Button>
              </Space.Compact>
            </Space>
          }
        >
          {selectedAssetRowKeys.length > 0 && (
            <div className="energy-toolbar-bulk-actions flex flex-wrap items-center mb-3">
              <Button
                disabled={assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).some(assetHasCustomer)}
                onClick={() => setAssetAssignModalOpen(true)}
              >
                {t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
              </Button>
              <Button
                disabled={assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).every((a) => a.customerIsPublic)}
                onClick={() => {
                  const selected = assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key))
                  const ids = selected.map((a) => (a.id?.id ?? (a.id as string) ?? '')).filter(Boolean)
                  setAssetMakePublicIds(ids)
                  setAssetMakePublicName(selected[0]?.name ?? ids[0] ?? '—')
                  setAssetMakePublicModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
              </Button>
              <Button
                disabled={!assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).some((a) => a.customerIsPublic)}
                onClick={() => {
                  const selected = assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key))
                  const publicIds = selected.filter((a) => a.customerIsPublic).map((a) => (a.id?.id ?? (a.id as string) ?? '')).filter(Boolean)
                  setAssetMakePrivateIds(publicIds)
                  setAssetMakePrivateName(selected.find((a) => a.customerIsPublic)?.name ?? publicIds[0] ?? '—')
                  setAssetMakePrivateModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
              </Button>
              <Space size="middle" className="energy-toolbar-icon-group">
                <Button
                  type="text"
                  icon={<ShareAltOutlined />}
                  title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                  disabled={assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).every((a) => a.customerIsPublic)}
                  onClick={() => {
                    const selected = assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key))
                    setAssetMakePublicIds(selected.map((a) => (a.id?.id ?? (a.id as string) ?? '')).filter(Boolean))
                    setAssetMakePublicName(selected[0]?.name ?? '—')
                    setAssetMakePublicModalOpen(true)
                  }}
                />
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                  disabled={assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).some(assetHasCustomer)}
                  onClick={() => setAssetAssignModalOpen(true)}
                />
                <Button
                  type="text"
                  icon={<ExportOutlined />}
                  title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                  disabled={!assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).some((a) => assetHasCustomer(a) && !a.customerIsPublic && !!(a.customerTitle && String(a.customerTitle).trim()))}
                  onClick={() => setAssetUnassignModalOpen(true)}
                />
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                  disabled={!assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key)).some((a) => a.customerIsPublic)}
                  onClick={() => {
                    const selected = assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key))
                    const publicIds = selected.filter((a) => a.customerIsPublic).map((a) => (a.id?.id ?? (a.id as string) ?? '')).filter(Boolean)
                    setAssetMakePrivateIds(publicIds)
                    setAssetMakePrivateName(selected.find((a) => a.customerIsPublic)?.name ?? '—')
                    setAssetMakePrivateModalOpen(true)
                  }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title={t('energyDeviceConfig.delete', 'Delete')}
                  onClick={() => {
                    const selected = assets.filter((a) => selectedAssetRowKeys.includes((a.id?.id ?? (a.id as string) ?? '') as React.Key))
                    setAssetDeleteName(selected.length === 1 ? (selected[0]?.name ?? '—') : `${selected.length} assets`)
                    setAssetDeleteModalOpen(true)
                  }}
                />
              </Space>
            </div>
          )}
          <Table<ThingsBoardAssetInfo>
            rowKey={(r) => r.id?.id ?? (typeof r.id === 'string' ? r.id : '') ?? String(Math.random())}
            loading={assetsLoading}
            dataSource={assets}
            rowSelection={{
              selectedRowKeys: selectedAssetRowKeys,
              onChange: (keys) => setSelectedAssetRowKeys(keys),
            }}
            pagination={{
              current: assetsPage + 1,
              pageSize: assetsPageSize,
              total: assetsTotal,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (n) => t('common.totalItems', { count: n }),
            }}
            onChange={handleAssetsTableChange}
            scroll={{ x: 800 }}
            columns={[
              {
                title: t('energyDeviceConfig.createdTime'),
                dataIndex: 'createdTime',
                key: 'createdTime',
                width: 170,
                sortOrder: 'descend' as const,
                render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
              },
              {
                title: t('energyDeviceConfig.name'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.assetProfile'),
                dataIndex: 'assetProfileName',
                key: 'assetProfileName',
                width: 140,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.label'),
                dataIndex: 'label',
                key: 'label',
                width: 100,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.customer'),
                dataIndex: 'customerTitle',
                key: 'customerTitle',
                width: 120,
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.public', 'Public'),
                dataIndex: 'customerIsPublic',
                key: 'customerIsPublic',
                width: 80,
                render: (v: boolean) => <Checkbox checked={!!v} disabled />,
              },
              {
                title: '',
                key: 'actions',
                width: 220,
                fixed: 'right' as const,
                render: (_, record: ThingsBoardAssetInfo) => {
                  const assetId = (record?.id && typeof record.id === 'object' && 'id' in record ? (record.id as { id: string }).id : (record?.id as string)) ?? ''
                  const assetName = record?.name ?? ''
                  const isPublic = !!record?.customerIsPublic
                  const hasCustomer = assetHasCustomer(record)
                  const hasCustomerTitle = !!(record?.customerTitle && String(record.customerTitle).trim())
                  const disableUnassign = !hasCustomer || isPublic || !hasCustomerTitle
                  return (
                    <Space size={4} className="device-config-table-actions">
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                        disabled={isPublic}
                        onClick={() => { setSelectedAssetRowKeys([assetId]); setAssetMakePublicIds([assetId]); setAssetMakePublicName(assetName); setAssetMakePublicModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<UserOutlined />}
                        title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                        disabled={hasCustomer}
                        onClick={() => { setSelectedAssetRowKeys([assetId]); setAssetAssignModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<ExportOutlined />}
                        title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                        disabled={disableUnassign}
                        onClick={() => { if (disableUnassign) return; setSelectedAssetRowKeys([assetId]); setAssetUnassignModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<LockOutlined />}
                        title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                        disabled={!isPublic}
                        onClick={() => { if (!isPublic) return; setAssetMakePrivateIds([assetId]); setAssetMakePrivateName(assetName); setAssetMakePrivateModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title={t('energyDeviceConfig.delete', 'Delete')}
                        onClick={() => { setSelectedAssetRowKeys([assetId]); setAssetDeleteName(assetName); setAssetDeleteModalOpen(true) }}
                      />
                    </Space>
                  )
                },
              },
            ]}
          />
          <Modal
            title={t('energyDeviceConfig.assignDevicesToCustomer', 'Assign Device(s) To Customer')}
            open={assetAssignModalOpen}
            onCancel={() => setAssetAssignModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setAssetAssignModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="assign" type="primary" onClick={() => { message.info(t('common.saved')); setAssetAssignModalOpen(false); setSelectedAssetRowKeys([]); fetchAssetInfos(assetsPage, assetsPageSize) }}>{t('energyDeviceConfig.assign', 'Assign')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.selectCustomerToAssign', 'Select customer to assign')}</p>
            <Select placeholder={t('energyDeviceConfig.customerRequired', 'Customer required')} style={{ width: '100%' }} options={[]} />
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeAssetPublicConfirmTitle', 'Are you sure you want to make the asset \'{{name}}\' public?', { name: assetMakePublicName || '—' })}
            open={assetMakePublicModalOpen}
            onCancel={() => { setAssetMakePublicModalOpen(false); setAssetMakePublicName(''); setAssetMakePublicIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setAssetMakePublicModalOpen(false); setAssetMakePublicName(''); setAssetMakePublicIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = assetMakePublicIds; setAssetMakePublicModalOpen(false); setAssetMakePublicName(''); setAssetMakePublicIds([]); setSelectedAssetRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.makeAssetPublic(id))).then(() => { message.success(t('common.saved')); fetchAssetInfos(assetsPage, assetsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeAssetPublicConfirmMessage', 'After the confirmation the asset and all its data will be made public and accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeAssetPrivateConfirmTitle', 'Are you sure you want to make the asset \'{{name}}\' private?', { name: assetMakePrivateName || '—' })}
            open={assetMakePrivateModalOpen}
            onCancel={() => { setAssetMakePrivateModalOpen(false); setAssetMakePrivateName(''); setAssetMakePrivateIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setAssetMakePrivateModalOpen(false); setAssetMakePrivateName(''); setAssetMakePrivateIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = assetMakePrivateIds; setAssetMakePrivateModalOpen(false); setAssetMakePrivateName(''); setAssetMakePrivateIds([]); setSelectedAssetRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.unassignAssetFromCustomer(id))).then(() => { message.success(t('common.saved')); fetchAssetInfos(assetsPage, assetsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeAssetPrivateConfirmMessage', 'After the confirmation the asset and all its data will be made private and won\'t be accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.unassignAssetConfirm', 'Unassign asset?')}
            open={assetUnassignModalOpen}
            onCancel={() => setAssetUnassignModalOpen(false)}
            footer={[
              <Button key="no" onClick={() => setAssetUnassignModalOpen(false)}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = selectedAssetRowKeys.map((k) => String(k)); setAssetUnassignModalOpen(false); setSelectedAssetRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.unassignAssetFromCustomer(id))).then(() => { message.success(t('common.saved')); fetchAssetInfos(assetsPage, assetsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.unassignAssetConfirmMessage', 'After the confirmation the asset will be unassigned and won\'t be accessible by the customer.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.deleteAssetConfirmTitle', 'Are you sure you want to delete the asset \'{{name}}\'?', { name: assetDeleteName || '—' })}
            open={assetDeleteModalOpen}
            onCancel={() => { setAssetDeleteModalOpen(false); setAssetDeleteName('') }}
            footer={[
              <Button key="no" onClick={() => { setAssetDeleteModalOpen(false); setAssetDeleteName('') }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" danger onClick={() => { const ids = selectedAssetRowKeys.map((k) => String(k)); setAssetDeleteModalOpen(false); setAssetDeleteName(''); setSelectedAssetRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.deleteAsset(id))).then(() => { message.success(t('common.saved')); fetchAssetInfos(assetsPage, assetsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.deleteAssetConfirmMessage', 'Be careful, after the confirmation the asset and all related data will become unrecoverable.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.addAsset', 'Add asset')}
            open={addAssetModalOpen}
            onCancel={() => { setAddAssetModalOpen(false); addAssetForm.resetFields() }}
            destroyOnClose
            width={560}
            footer={[
              <Button key="cancel" onClick={() => { setAddAssetModalOpen(false); addAssetForm.resetFields() }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button
                key="add"
                type="primary"
                onClick={() => {
                  addAssetForm.validateFields().then((values) => {
                    const profileId = addAssetForm.getFieldValue('assetProfileId')
                    if (!profileId) {
                      message.error(t('energyDeviceConfig.assetProfileRequired', 'Vui lòng chọn Asset profile'))
                      return
                    }
                    thingsBoardApi
                      .createAsset({
                        name: values.name,
                        type: values.type || 'Building',
                        label: values.label,
                        assetProfileId: { id: profileId, entityType: 'ASSET_PROFILE' },
                        version: 0,
                        additionalInfo: values.description ? { description: values.description } : {},
                        ...(values.assignToCustomer ? { customerId: { id: values.assignToCustomer, entityType: 'CUSTOMER' } } : {}),
                      })
                      .then((created) => {
                        message.success(t('common.saved', 'Đã lưu'))
                        setAddAssetModalOpen(false)
                        addAssetForm.resetFields()
                        const rawId = created && (created as Record<string, unknown>).id
                        const assetId = typeof rawId === 'string'
                          ? rawId
                          : rawId && typeof rawId === 'object' && 'id' in rawId
                            ? (rawId as { id: string }).id
                            : null
                        if (assetId) {
                          thingsBoardApi.getAssetInfo(assetId).finally(() => {
                            fetchAssetInfos(0, assetsPageSize)
                            setAssetsPage(0)
                          })
                        } else {
                          fetchAssetInfos(0, assetsPageSize)
                          setAssetsPage(0)
                        }
                      })
                      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                  })
                }}
              >
                {t('common.add', 'Thêm')}
              </Button>,
            ]}
          >
            <Form form={addAssetForm} layout="vertical" initialValues={{ assetProfileName: 'default' }}>
              <Form.Item name="name" label={t('energyDeviceConfig.name') + ' *'} rules={[{ required: true, message: t('common.required', 'Bắt buộc') }]}>
                <Input placeholder={t('energyDeviceConfig.assetNamePlaceholder', 'Tên asset')} />
              </Form.Item>
              <Form.Item name="label" label={t('energyDeviceConfig.label')}>
                <Input placeholder={t('energyDeviceConfig.labelPlaceholder', 'Nhãn (tùy chọn)')} />
              </Form.Item>
              <Form.Item name="assetProfileName" label={t('energyDeviceConfig.assetProfile') + ' *'} rules={[{ required: true, message: t('common.required', 'Bắt buộc') }]}>
                <Input
                  readOnly
                  className="add-device-profile-input"
                  placeholder={t('energyDeviceConfig.assetProfilePlaceholder', 'Chọn asset profile')}
                  suffix={
                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => { addAssetForm.setFieldsValue({ assetProfileName: undefined, assetProfileId: undefined }) }}
                        aria-label={t('common.clear', 'Xóa')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={openSelectAssetProfileModal}
                        aria-label={t('energyDeviceConfig.selectAssetProfile', 'Chọn asset profile')}
                      />
                    </Space>
                  }
                />
              </Form.Item>
              <Form.Item name="assetProfileId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="assignToCustomer" label={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}>
                <Select allowClear placeholder={t('energyDeviceConfig.assignToCustomerPlaceholder', 'Chọn customer (tùy chọn)')} options={[]} />
              </Form.Item>
              <Form.Item name="description" label={t('energyDeviceConfig.description', 'Description')}>
                <Input.TextArea rows={3} placeholder={t('energyDeviceConfig.descriptionPlaceholder', 'Mô tả')} />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.selectAssetProfile', 'Chọn asset profile')}
            open={selectAssetProfileModalOpen}
            onCancel={() => setSelectAssetProfileModalOpen(false)}
            footer={[
              <Button key="close" onClick={() => setSelectAssetProfileModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
            ]}
            destroyOnClose
          >
            <Spin spinning={assetProfileListLoading}>
              <Select
                style={{ width: '100%' }}
                placeholder={t('energyDeviceConfig.assetProfilePlaceholder', 'Chọn asset profile')}
                options={assetProfileList.map((p) => ({ value: p.id, label: p.name }))}
                onSelect={(id) => {
                  const item = assetProfileList.find((p) => p.id === id)
                  if (item) {
                    addAssetForm.setFieldsValue({ assetProfileId: item.id, assetProfileName: item.name })
                    setSelectAssetProfileModalOpen(false)
                  }
                }}
                showSearch
                filterOption={(input, opt) => (opt?.label ?? '').toString().toLowerCase().includes((input || '').toLowerCase())}
              />
            </Spin>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.importAssets', 'Import assets')}
            open={importAssetsModalOpen}
            onCancel={() => setImportAssetsModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setImportAssetsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="import" type="primary" icon={<UploadOutlined />}>{t('energyDeviceConfig.import', 'Import')}</Button>,
            ]}
            destroyOnClose
          >
            <Upload.Dragger accept=".json,.csv" multiple={false} beforeUpload={() => false} maxCount={1} className="mt-2">
              <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 48, color: '#52c41a' }} /></p>
              <p className="ant-upload-text">{t('energyDeviceConfig.importDragText', 'Kéo thả file hoặc bấm để chọn')}</p>
              <p className="ant-upload-hint">{t('energyDeviceConfig.importHint', 'Hỗ trợ JSON, CSV')}</p>
            </Upload.Dragger>
          </Modal>
        </ContentCard>
      </PageContainer>
    )
  }

  if (activeSection === 'entityViews') {
    return (
      <PageContainer>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => setActiveSection(null)}
          className="energy-back-btn mb-2"
        >
          {t('energyDeviceManagement.backToConfigList')}
        </Button>
        <ContentCard
          title={t('energyDeviceConfig.entityViews')}
          titleIcon={<BarChartOutlined />}
          titleIconColor="#722ed1"
          extra={
            <Space wrap align="center">
              <Select
                value={entityViewTypeFilter}
                onChange={(v) => {
                  setEntityViewTypeFilter(v ?? '')
                  setEntityViewsPage(0)
                  fetchEntityViewInfos(0, entityViewsPageSize)
                }}
                style={{ width: 180 }}
                options={entityViewTypeOptions.length ? entityViewTypeOptions : [{ value: '', label: t('energyDeviceConfig.all', 'All') }]}
                placeholder={t('energyDeviceConfig.entityViewType', 'Entity view type')}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddEntityViewModalOpen(true)}>
                {t('common.add', 'Thêm')}
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={() => fetchEntityViewInfos(entityViewsPage, entityViewsPageSize)}
                loading={entityViewsLoading}
                title={t('common.refresh', 'Làm mới')}
              />
              <Space.Compact>
                <Input
                  placeholder={t('common.search', 'Tìm kiếm')}
                  prefix={<SearchOutlined />}
                  value={entityViewSearchText}
                  onChange={(e) => setEntityViewSearchText(e.target.value)}
                  onPressEnter={() => { setEntityViewsPage(0); fetchEntityViewInfos(0, entityViewsPageSize) }}
                  allowClear
                  style={{ width: 180 }}
                />
                <Button onClick={() => { setEntityViewsPage(0); fetchEntityViewInfos(0, entityViewsPageSize) }}>
                  {t('common.search', 'Tìm kiếm')}
                </Button>
              </Space.Compact>
            </Space>
          }
        >
          {selectedEntityViewRowKeys.length > 0 && (
            <div className="energy-toolbar-bulk-actions flex flex-wrap items-center mb-3">
              <Button
                disabled={entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).some(entityViewHasCustomer)}
                onClick={() => setEntityViewAssignModalOpen(true)}
              >
                {t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
              </Button>
              <Button
                disabled={entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).every((e) => e.customerIsPublic)}
                onClick={() => {
                  const selected = entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key))
                  const ids = selected.map((e) => (e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '').filter(Boolean)
                  setEntityViewMakePublicIds(ids)
                  setEntityViewMakePublicName(selected[0]?.name ?? ids[0] ?? '—')
                  setEntityViewMakePublicModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
              </Button>
              <Button
                disabled={!entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).some((e) => e.customerIsPublic)}
                onClick={() => {
                  const selected = entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key))
                  const publicIds = selected.filter((e) => e.customerIsPublic).map((e) => (e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '').filter(Boolean)
                  setEntityViewMakePrivateIds(publicIds)
                  setEntityViewMakePrivateName(selected.find((e) => e.customerIsPublic)?.name ?? publicIds[0] ?? '—')
                  setEntityViewMakePrivateModalOpen(true)
                }}
              >
                {t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
              </Button>
              <Space size="middle" className="energy-toolbar-icon-group">
                <Button
                  type="text"
                  icon={<ShareAltOutlined />}
                  title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                  disabled={entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).every((e) => e.customerIsPublic)}
                  onClick={() => {
                    const selected = entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key))
                    setEntityViewMakePublicIds(selected.map((e) => (e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '').filter(Boolean))
                    setEntityViewMakePublicName(selected[0]?.name ?? '—')
                    setEntityViewMakePublicModalOpen(true)
                  }}
                />
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                  disabled={entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).some(entityViewHasCustomer)}
                  onClick={() => setEntityViewAssignModalOpen(true)}
                />
                <Button
                  type="text"
                  icon={<ExportOutlined />}
                  title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                  disabled={!entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).some((e) => entityViewHasCustomer(e) && !e.customerIsPublic && !!(e.customerTitle && String(e.customerTitle).trim()))}
                  onClick={() => setEntityViewUnassignModalOpen(true)}
                />
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                  disabled={!entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key)).some((e) => e.customerIsPublic)}
                  onClick={() => {
                    const selected = entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key))
                    const publicIds = selected.filter((e) => e.customerIsPublic).map((e) => (e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '').filter(Boolean)
                    setEntityViewMakePrivateIds(publicIds)
                    setEntityViewMakePrivateName(selected.find((e) => e.customerIsPublic)?.name ?? '—')
                    setEntityViewMakePrivateModalOpen(true)
                  }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title={t('energyDeviceConfig.delete', 'Delete')}
                  onClick={() => {
                    const selected = entityViews.filter((e) => selectedEntityViewRowKeys.includes(((e.id?.id ?? (typeof e.id === 'string' ? e.id : '')) ?? '') as React.Key))
                    setEntityViewDeleteName(selected.length === 1 ? (selected[0]?.name ?? '—') : `${selected.length} entity views`)
                    setEntityViewDeleteModalOpen(true)
                  }}
                />
              </Space>
            </div>
          )}
          <Table<ThingsBoardEntityViewInfo>
            rowKey={(r) => r.id?.id ?? (typeof r.id === 'string' ? r.id : '') ?? String(Math.random())}
            loading={entityViewsLoading}
            dataSource={entityViews}
            rowSelection={{
              selectedRowKeys: selectedEntityViewRowKeys,
              onChange: (keys) => setSelectedEntityViewRowKeys(keys),
            }}
            pagination={{
              current: entityViewsPage + 1,
              pageSize: entityViewsPageSize,
              total: entityViewsTotal,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (n) => t('common.totalItems', { count: n }),
            }}
            onChange={handleEntityViewTableChange}
            scroll={{ x: 800 }}
            columns={[
              {
                title: t('energyDeviceConfig.createdTime'),
                dataIndex: 'createdTime',
                key: 'createdTime',
                width: 170,
                sortOrder: 'descend' as const,
                render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
              },
              {
                title: t('energyDeviceConfig.name'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.entityViewType', 'Entity view type'),
                dataIndex: 'type',
                key: 'type',
                width: 160,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.customer'),
                dataIndex: 'customerTitle',
                key: 'customerTitle',
                width: 120,
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.public', 'Public'),
                dataIndex: 'customerIsPublic',
                key: 'customerIsPublic',
                width: 80,
                render: (v: boolean) => <Checkbox checked={!!v} disabled />,
              },
              {
                title: '',
                key: 'actions',
                width: 220,
                fixed: 'right' as const,
                render: (_, record: ThingsBoardEntityViewInfo) => {
                  const evId = (record?.id && typeof record.id === 'object' && 'id' in record ? (record.id as { id: string }).id : (record?.id as string)) ?? ''
                  const evName = record?.name ?? ''
                  const isPublic = !!record?.customerIsPublic
                  const hasCustomer = entityViewHasCustomer(record)
                  const hasCustomerTitle = !!(record?.customerTitle && String(record.customerTitle).trim())
                  const disableUnassign = !hasCustomer || isPublic || !hasCustomerTitle
                  return (
                    <Space size={4} className="device-config-table-actions">
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        title={t('energyDeviceConfig.makeDevicePublic', 'Make device public')}
                        disabled={isPublic}
                        onClick={() => { setSelectedEntityViewRowKeys([evId]); setEntityViewMakePublicIds([evId]); setEntityViewMakePublicName(evName); setEntityViewMakePublicModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<UserOutlined />}
                        title={t('energyDeviceConfig.assignToCustomer', 'Assign to customer')}
                        disabled={hasCustomer}
                        onClick={() => { setSelectedEntityViewRowKeys([evId]); setEntityViewAssignModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<ExportOutlined />}
                        title={t('energyDeviceConfig.unassignFromCustomer', 'Unassign from customer')}
                        disabled={disableUnassign}
                        onClick={() => { if (disableUnassign) return; setSelectedEntityViewRowKeys([evId]); setEntityViewUnassignModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        icon={<LockOutlined />}
                        title={t('energyDeviceConfig.makeDevicePrivate', 'Make device private')}
                        disabled={!isPublic}
                        onClick={() => { if (!isPublic) return; setEntityViewMakePrivateIds([evId]); setEntityViewMakePrivateName(evName); setEntityViewMakePrivateModalOpen(true) }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title={t('energyDeviceConfig.delete', 'Delete')}
                        onClick={() => { setSelectedEntityViewRowKeys([evId]); setEntityViewDeleteName(evName); setEntityViewDeleteModalOpen(true) }}
                      />
                    </Space>
                  )
                },
              },
            ]}
          />
          <Modal
            title={t('energyDeviceConfig.assignDevicesToCustomer', 'Assign Device(s) To Customer')}
            open={entityViewAssignModalOpen}
            onCancel={() => setEntityViewAssignModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setEntityViewAssignModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="assign" type="primary" onClick={() => { message.info(t('common.saved')); setEntityViewAssignModalOpen(false); setSelectedEntityViewRowKeys([]); fetchEntityViewInfos(entityViewsPage, entityViewsPageSize) }}>{t('energyDeviceConfig.assign', 'Assign')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.selectCustomerToAssign', 'Select customer to assign')}</p>
            <Select placeholder={t('energyDeviceConfig.customerRequired', 'Customer required')} style={{ width: '100%' }} options={[]} />
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeEntityViewPublicConfirmTitle', 'Are you sure you want to make the entity view \'{{name}}\' public?', { name: entityViewMakePublicName || '—' })}
            open={entityViewMakePublicModalOpen}
            onCancel={() => { setEntityViewMakePublicModalOpen(false); setEntityViewMakePublicName(''); setEntityViewMakePublicIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setEntityViewMakePublicModalOpen(false); setEntityViewMakePublicName(''); setEntityViewMakePublicIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = entityViewMakePublicIds; setEntityViewMakePublicModalOpen(false); setEntityViewMakePublicName(''); setEntityViewMakePublicIds([]); setSelectedEntityViewRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.makeEntityViewPublic(id))).then(() => { message.success(t('common.saved')); fetchEntityViewInfos(entityViewsPage, entityViewsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeEntityViewPublicConfirmMessage', 'After the confirmation the entity view and all its data will be made public and accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.makeEntityViewPrivateConfirmTitle', 'Are you sure you want to make the entity view \'{{name}}\' private?', { name: entityViewMakePrivateName || '—' })}
            open={entityViewMakePrivateModalOpen}
            onCancel={() => { setEntityViewMakePrivateModalOpen(false); setEntityViewMakePrivateName(''); setEntityViewMakePrivateIds([]) }}
            footer={[
              <Button key="no" onClick={() => { setEntityViewMakePrivateModalOpen(false); setEntityViewMakePrivateName(''); setEntityViewMakePrivateIds([]) }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = entityViewMakePrivateIds; setEntityViewMakePrivateModalOpen(false); setEntityViewMakePrivateName(''); setEntityViewMakePrivateIds([]); setSelectedEntityViewRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.unassignEntityViewFromCustomer(id))).then(() => { message.success(t('common.saved')); fetchEntityViewInfos(entityViewsPage, entityViewsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.makeEntityViewPrivateConfirmMessage', 'After the confirmation the entity view and all its data will be made private and won\'t be accessible by others.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.unassignEntityViewConfirm', 'Unassign entity view?')}
            open={entityViewUnassignModalOpen}
            onCancel={() => setEntityViewUnassignModalOpen(false)}
            footer={[
              <Button key="no" onClick={() => setEntityViewUnassignModalOpen(false)}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" onClick={() => { const ids = selectedEntityViewRowKeys.map((k) => String(k)); setEntityViewUnassignModalOpen(false); setSelectedEntityViewRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.unassignEntityViewFromCustomer(id))).then(() => { message.success(t('common.saved')); fetchEntityViewInfos(entityViewsPage, entityViewsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.unassignEntityViewConfirmMessage', 'After the confirmation the entity view will be unassigned and won\'t be accessible by the customer.')}</p>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.deleteEntityViewConfirmTitle', 'Are you sure you want to delete the entity view \'{{name}}\'?', { name: entityViewDeleteName || '—' })}
            open={entityViewDeleteModalOpen}
            onCancel={() => { setEntityViewDeleteModalOpen(false); setEntityViewDeleteName('') }}
            footer={[
              <Button key="no" onClick={() => { setEntityViewDeleteModalOpen(false); setEntityViewDeleteName('') }}>{t('common.no', 'No')}</Button>,
              <Button key="yes" type="primary" danger onClick={() => { const ids = selectedEntityViewRowKeys.map((k) => String(k)); setEntityViewDeleteModalOpen(false); setEntityViewDeleteName(''); setSelectedEntityViewRowKeys([]); if (ids.length) Promise.all(ids.map((id) => thingsBoardApi.deleteEntityView(id))).then(() => { message.success(t('common.saved')); fetchEntityViewInfos(entityViewsPage, entityViewsPageSize) }).catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed'))) }}>{t('common.yes', 'Yes')}</Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.deleteEntityViewConfirmMessage', 'Be careful, after the confirmation the entity view and all related data will become unrecoverable.')}</p>
          </Modal>
          <Modal
            className="add-entity-view-modal"
            title={t('energyDeviceConfig.addEntityView', 'Add entity view')}
            open={addEntityViewModalOpen}
            onCancel={() => { setAddEntityViewModalOpen(false); addEntityViewForm.resetFields() }}
            destroyOnClose
            width={560}
            footer={[
              <Button key="cancel" onClick={() => { setAddEntityViewModalOpen(false); addEntityViewForm.resetFields() }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button
                key="add"
                type="primary"
                onClick={() => {
                  addEntityViewForm.validateFields().then((values) => {
                    const entityType = values.targetEntityType as 'DEVICE' | 'ASSET'
                    const entityId = values.targetEntityId?.trim()
                    if (!entityId) {
                      message.error(t('energyDeviceConfig.targetEntityIdRequired', 'Target entity ID is required'))
                      return
                    }
                    const startMs = values.startTime ? (values.startTime as Dayjs).valueOf() : 0
                    const endMs = values.endTime ? (values.endTime as Dayjs).valueOf() : 0
                    const clientAttr = values.clientAttributes?.trim() ? values.clientAttributes.split(',').map((s: string) => s.trim()).filter(Boolean) : []
                    const sharedAttr = values.sharedAttributes?.trim() ? values.sharedAttributes.split(',').map((s: string) => s.trim()).filter(Boolean) : []
                    const serverAttr = values.serverAttributes?.trim() ? values.serverAttributes.split(',').map((s: string) => s.trim()).filter(Boolean) : []
                    const timeseries = values.timeseries?.trim() ? values.timeseries.split(',').map((s: string) => s.trim()).filter(Boolean) : []
                    thingsBoardApi
                      .createEntityView({
                        name: values.name,
                        type: values.entityViewType,
                        entityId: { id: entityId, entityType },
                        keys: {
                          timeseries: timeseries.length ? timeseries : undefined,
                          attributes: (clientAttr.length || sharedAttr.length || serverAttr.length)
                            ? { cs: clientAttr.length ? clientAttr : undefined, ss: sharedAttr.length ? sharedAttr : undefined, sh: serverAttr.length ? serverAttr : undefined }
                            : undefined,
                        },
                        startTimeMs: startMs || undefined,
                        endTimeMs: endMs || undefined,
                        version: 0,
                        additionalInfo: values.description ? { description: values.description } : {},
                      })
                      .then(() => {
                        message.success(t('common.saved', 'Đã lưu'))
                        setAddEntityViewModalOpen(false)
                        addEntityViewForm.resetFields()
                        fetchEntityViewInfos(entityViewsPage, entityViewsPageSize)
                      })
                      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                  })
                }}
              >
                {t('common.add', 'Thêm')}
              </Button>,
            ]}
          >
            <Form form={addEntityViewForm} layout="vertical">
              <Form.Item name="name" label={t('energyDeviceConfig.name') + ' *'} rules={[{ required: true, message: t('energyDeviceConfig.nameRequired', 'Name is required.') }]}>
                <Input placeholder={t('energyDeviceConfig.entityViewNamePlaceholder', 'Entity view name')} />
              </Form.Item>
              <Form.Item name="entityViewType" label={t('energyDeviceConfig.entityViewType', 'Entity view type') + ' *'} rules={[{ required: true, message: t('energyDeviceConfig.entityViewTypeRequired', 'Entity view type is required.') }]}>
                <Select
                  placeholder={t('energyDeviceConfig.selectEntityViewType', 'Select entity view type')}
                  options={addEntityViewTypeOptions}
                  loading={addEntityViewTypeOptionsLoading}
                  onDropdownVisibleChange={(open) => {
                    if (open && !addEntityViewTypeOptionsLoading) {
                      setAddEntityViewTypeOptionsLoading(true)
                      thingsBoardApi
                        .getEntityViewTypes()
                        .then((res) => {
                          const list = Array.isArray(res) ? res : (res && typeof res === 'object' && 'data' in res ? (res as { data?: string[] }).data : []) ?? []
                          setAddEntityViewTypeOptions(list.filter(Boolean).map((typeName) => ({ value: typeName, label: typeName })))
                        })
                        .catch(() => setAddEntityViewTypeOptions([]))
                        .finally(() => setAddEntityViewTypeOptionsLoading(false))
                    }
                  }}
                  showSearch
                  filterOption={(input, opt) => (opt?.label ?? '').toString().toLowerCase().includes((input || '').toLowerCase())}
                />
              </Form.Item>
              <Text strong className="add-entity-view-section-label">{t('energyDeviceConfig.targetEntity', 'Target entity')}</Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="targetEntityType" label={t('energyDeviceConfig.type', 'Type') + ' *'} rules={[{ required: true, message: t('energyDeviceConfig.entityTypeRequired', 'Entity type is required.') }]}>
                    <Select
                      placeholder={t('energyDeviceConfig.selectEntityType', 'Select entity type')}
                      options={[
                        { value: 'DEVICE', label: t('energyDeviceConfig.device', 'Device') },
                        { value: 'ASSET', label: t('energyDeviceConfig.asset', 'Asset') },
                      ]}
                      onChange={() => addEntityViewForm.setFieldValue('targetEntityId', undefined)}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {addEntityViewTargetType === 'DEVICE' && (
                    <Form.Item
                      name="targetEntityId"
                      label={t('energyDeviceConfig.device', 'Device') + ' *'}
                      rules={[{ required: true, message: t('energyDeviceConfig.deviceRequired', 'Device is required.') }]}
                    >
                      <Select
                        placeholder={t('energyDeviceConfig.selectDevice', 'Select device')}
                        options={addEntityViewTargetDeviceOptions}
                        loading={addEntityViewTargetDeviceLoading}
                        onDropdownVisibleChange={(open) => {
                          if (open && !addEntityViewTargetDeviceLoading) {
                            setAddEntityViewTargetDeviceLoading(true)
                            thingsBoardApi
                              .getDeviceInfos({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC' })
                              .then((res) => {
                                const data = res?.data ?? []
                                const list = data.map((d) => {
                                  const id = d?.id && typeof d.id === 'object' && 'id' in d ? (d.id as { id?: string }).id : (d?.id as string)
                                  return { value: id ?? '', label: d?.name ?? id ?? '—' }
                                }).filter((o) => o.value)
                                setAddEntityViewTargetDeviceOptions(list)
                              })
                              .catch(() => setAddEntityViewTargetDeviceOptions([]))
                              .finally(() => setAddEntityViewTargetDeviceLoading(false))
                          }
                        }}
                        showSearch
                        filterOption={(input, opt) => (opt?.label ?? '').toString().toLowerCase().includes((input || '').toLowerCase())}
                      />
                    </Form.Item>
                  )}
                  {addEntityViewTargetType === 'ASSET' && (
                    <Form.Item
                      name="targetEntityId"
                      label={t('energyDeviceConfig.asset', 'Asset') + ' *'}
                      rules={[{ required: true, message: t('energyDeviceConfig.assetRequired', 'Asset is required.') }]}
                    >
                      <Select
                        placeholder={t('energyDeviceConfig.selectAsset', 'Select asset')}
                        options={addEntityViewTargetAssetOptions}
                        loading={addEntityViewTargetAssetLoading}
                        onDropdownVisibleChange={(open) => {
                          if (open && !addEntityViewTargetAssetLoading) {
                            setAddEntityViewTargetAssetLoading(true)
                            thingsBoardApi
                              .getAssetInfos({ pageSize: 50, page: 0, sortProperty: 'name', sortOrder: 'ASC' })
                              .then((res) => {
                                const data = res?.data ?? []
                                const list = data.map((a) => {
                                  const id = a?.id && typeof a.id === 'object' && 'id' in a ? (a.id as { id?: string }).id : (a?.id as string)
                                  return { value: id ?? '', label: a?.name ?? id ?? '—' }
                                }).filter((o) => o.value)
                                setAddEntityViewTargetAssetOptions(list)
                              })
                              .catch(() => setAddEntityViewTargetAssetOptions([]))
                              .finally(() => setAddEntityViewTargetAssetLoading(false))
                          }
                        }}
                        showSearch
                        filterOption={(input, opt) => (opt?.label ?? '').toString().toLowerCase().includes((input || '').toLowerCase())}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>
              <Collapse
                className="add-entity-view-collapse"
                items={[
                  {
                    key: 'attributes',
                    label: t('energyDeviceConfig.attributesPropagation', 'Attributes propagation'),
                    children: (
                      <>
                        <p className="text-secondary text-sm mb-2">{t('energyDeviceConfig.attributesPropagationHint', 'Entity View will automatically copy specified attributes from Target Entity. For performance reasons target entity attributes are not propagated on each change.')}</p>
                        <Form.Item name="clientAttributes" label={t('energyDeviceConfig.clientAttributes', 'Client attributes')}>
                          <Input placeholder={t('energyDeviceConfig.clientAttributesPlaceholder', 'Comma-separated keys')} />
                        </Form.Item>
                        <Form.Item name="sharedAttributes" label={t('energyDeviceConfig.sharedAttributes', 'Shared attributes')}>
                          <Input placeholder={t('energyDeviceConfig.sharedAttributesPlaceholder', 'Comma-separated keys')} />
                        </Form.Item>
                        <Form.Item name="serverAttributes" label={t('energyDeviceConfig.serverAttributes', 'Server attributes')}>
                          <Input placeholder={t('energyDeviceConfig.serverAttributesPlaceholder', 'Comma-separated keys')} />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: 'timeseries',
                    label: t('energyDeviceConfig.timeSeriesData', 'Time series data'),
                    children: (
                      <>
                        <p className="text-secondary text-sm mb-2">{t('energyDeviceConfig.timeSeriesDataHint', 'Configure time series data keys of the target entity that will be accessible to the entity view. This time series data is read-only.')}</p>
                        <Form.Item name="timeseries" label={t('energyDeviceConfig.timeseries', 'Time series')}>
                          <Input placeholder={t('energyDeviceConfig.timeseriesPlaceholder', 'Comma-separated keys')} />
                        </Form.Item>
                      </>
                    ),
                  },
                ]}
              />
              <Form.Item name="startTime" label={t('energyDeviceConfig.startTime', 'Start time')}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item name="endTime" label={t('energyDeviceConfig.endTime', 'End time')}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" className="w-full" />
              </Form.Item>
              <Form.Item name="description" label={t('energyDeviceConfig.description', 'Description')}>
                <Input.TextArea rows={3} placeholder={t('energyDeviceConfig.descriptionPlaceholder', 'Mô tả')} />
              </Form.Item>
            </Form>
          </Modal>
        </ContentCard>
      </PageContainer>
    )
  }

  if (activeSection === 'gateways') {
    const gatewayList = gatewaySearchText.trim()
      ? gateways.filter((g) => g.name.toLowerCase().includes(gatewaySearchText.trim().toLowerCase()))
      : gateways
    const serverTimeLabel = serverTime != null
      ? dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss')
      : '—'
    return (
      <PageContainer>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => setActiveSection(null)}
          className="energy-back-btn energy-back-btn-indent mb-2"
        >
          {t('energyDeviceManagement.backToConfigList')}
        </Button>
        <div className="energy-gateway-banner">
          <span className="energy-gateway-banner-title">{t('energyDeviceConfig.gatewayList', 'Gateway List')}</span>
          <Space className="energy-gateway-banner-meta">
            <ClockCircleOutlined />
            <span>{t('energyDeviceConfig.realtimeLast15', 'Realtime - last 15 minutes')}</span>
            <span className="energy-gateway-banner-time">({serverTimeLabel})</span>
            <Button type="text" icon={<FullscreenOutlined />} className="energy-gateway-banner-fullscreen" aria-label="Fullscreen" />
          </Space>
        </div>
        <ContentCard
          className="energy-gateway-card"
          title={t('energyDeviceConfig.gatewayList', 'Gateway list')}
          titleIcon={<ApiOutlined />}
          titleIconColor="#fa8c16"
          extra={
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { addGatewayForm.resetFields(); setAddGatewayModalOpen(true); }}>
                {t('common.add', 'Add')}
              </Button>
              <Input
                placeholder={t('common.search', 'Search')}
                prefix={<SearchOutlined />}
                value={gatewaySearchText}
                onChange={(e) => setGatewaySearchText(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </Space>
          }
        >
          <Table
            rowKey="id"
            loading={gatewaysLoading}
            dataSource={gatewayList}
            pagination={false}
            scroll={{ x: 700 }}
            columns={[
              {
                title: t('energyDeviceConfig.createdTime', 'Created time'),
                dataIndex: 'createdTime',
                key: 'createdTime',
                width: 180,
                render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
              },
              {
                title: t('energyDeviceConfig.gatewayName', 'Gateway name'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (v: string) => v || '—',
              },
              {
                title: t('energyDeviceConfig.status', 'Status'),
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (status: string) => (
                  <Tag color={status === 'Active' ? 'green' : 'default'} className="rounded-full">
                    {status}
                  </Tag>
                ),
              },
              {
                title: t('energyDeviceConfig.enabledConnectors', 'Enabled Connectors'),
                dataIndex: 'enabledConnectors',
                key: 'enabledConnectors',
                width: 160,
                render: (n: number) => String(n ?? 0),
              },
              {
                title: t('energyDeviceConfig.version', 'Version'),
                dataIndex: 'version',
                key: 'version',
                width: 100,
                render: (v: string) => v || '—',
              },
              {
                title: '',
                key: 'actions',
                width: 160,
                fixed: 'right' as const,
                render: (_, record) => (
                  <Space size={4} className="device-config-table-actions">
                    <Button type="text" icon={<CodeOutlined />} title={t('energyDeviceConfig.launchCommand', 'Launch command')} onClick={() => { setLaunchCommandGateway({ id: record.id, name: record.name }); setLaunchCommandModalOpen(true) }} />
                    <Button type="text" icon={<SettingOutlined />} title={t('energyDeviceConfig.generalConfiguration', 'General Configuration')} onClick={() => { setGeneralConfigGateway({ id: record.id, name: record.name }); setGeneralConfigTab('general'); setGeneralConfigMode('basic'); setGeneralConfigModalOpen(true) }} />
                    <Button type="text" icon={<ApiOutlined />} title={t('energyDeviceConfig.connectors', 'Connectors')} onClick={() => { setConnectorsGateway({ id: record.id, name: record.name }); setConnectorData(null); setConnectorsModalOpen(true) }} />
                    <Button type="text" danger icon={<DeleteOutlined />} title={t('energyDeviceConfig.delete', 'Delete')} onClick={() => { setGatewayDeleteGateway({ id: record.id, name: record.name }); setGatewayDeleteModalOpen(true) }} />
                  </Space>
                ),
              },
            ]}
          />
          <Modal
            title={t('energyDeviceConfig.addGateway', 'Add gateway')}
            open={addGatewayModalOpen}
            onCancel={() => { setAddGatewayModalOpen(false); addGatewayForm.resetFields() }}
            footer={[
              <Button key="cancel" onClick={() => { setAddGatewayModalOpen(false); addGatewayForm.resetFields() }}>
                {t('common.cancel', 'Cancel')}
              </Button>,
              <Button
                key="create"
                type="primary"
                onClick={() => {
                  addGatewayForm.validateFields().then((values) => {
                    const deviceProfileId = values.deviceProfileId
                      ? { id: values.deviceProfileId, entityType: 'DEVICE_PROFILE' as const }
                      : undefined
                    const body: SaveDeviceBody = {
                      name: values.name,
                      type: 'Gateway',
                      label: undefined,
                      deviceProfileId,
                      version: 0,
                      additionalInfo: {},
                      deviceData: {
                        configuration: { type: 'string' },
                        transportConfiguration: {
                          type: 'string',
                          powerMode: 'PSM',
                          psmActivityTimer: 0,
                          edrxCycle: 0,
                          pagingTransmissionWindow: 0,
                        },
                      },
                    }
                    ;(body as Record<string, unknown>).gateway = true
                    thingsBoardApi
                      .saveDevice(body)
                      .then((created) => {
                        message.success(t('energyDeviceConfig.gatewayCreated', 'Gateway created'))
                        setAddGatewayModalOpen(false)
                        addGatewayForm.resetFields()
                        const newId = (created as { id?: { id?: string } })?.id?.id ?? (created as { id?: string })?.id
                        const newName = (created as { name?: string })?.name ?? values.name
                        const createdTime = (created as { createdTime?: number })?.createdTime ?? Date.now()
                        if (newId) setGateways((prev) => [{ id: newId, createdTime, name: newName, status: 'Active', enabledConnectors: 0, version: '' }, ...prev])
                      })
                      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                  })
                }}
              >
                {t('energyDeviceConfig.create', 'Create')}
              </Button>,
            ]}
          >
            <Form form={addGatewayForm} layout="vertical">
              <Form.Item
                name="name"
                label={t('energyDeviceConfig.gatewayNameLabel', 'Name')}
                rules={[{ required: true, message: t('energyDeviceConfig.gatewayNameRequired', 'Gateway name is required.') }]}
              >
                <Input placeholder={t('energyDeviceConfig.gatewayNamePlaceholder', 'Gateway name')} />
              </Form.Item>
              <Form.Item
                name="deviceProfileId"
                label={t('energyDeviceConfig.deviceProfile', 'Device profile')}
                rules={[{ required: true, message: t('energyDeviceConfig.deviceTypeRequired', 'Device type is required.') }]}
              >
                <Select
                  placeholder={t('energyDeviceConfig.selectDeviceProfile', 'Select device profile')}
                  options={gatewayDeviceProfileOptions}
                  loading={gatewayDeviceProfileOptionsLoading}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title={
              <Space>
                {t('energyDeviceConfig.launchCommand', 'Launch command')}
                <Button type="text" size="small" icon={<QuestionCircleOutlined />} aria-label={t('common.help', 'Help')} />
              </Space>
            }
            open={launchCommandModalOpen}
            onCancel={() => { setLaunchCommandModalOpen(false); setLaunchCommandGateway(null) }}
            footer={[<Button key="close" onClick={() => { setLaunchCommandModalOpen(false); setLaunchCommandGateway(null) }}>{t('common.close', 'Close')}</Button>]}
            width={560}
          >
            <Text type="secondary" className="block mb-4">{t('energyDeviceConfig.launchCommandDesc', 'Use the following instruction to run IoT Gateway in Docker compose with credentials for selected device.')}</Text>
            <div className="space-y-4">
              <div>
                <Text strong className="block mb-1">1. {t('energyDeviceConfig.installClientTools', 'Install necessary client tools')}</Text>
                <Text type="secondary" className="block text-sm mb-2">{t('energyDeviceConfig.installClientToolsDesc', 'Use the instructions to download, install and setup docker compose.')}</Text>
                <Button icon={<FileAddOutlined />}>{t('energyDeviceConfig.documentation', 'Documentation')}</Button>
              </div>
              <div>
                <Text strong className="block mb-1">2. {t('energyDeviceConfig.downloadConfigFile', 'Download configuration file')}</Text>
                <Text type="secondary" className="block text-sm mb-2">{t('energyDeviceConfig.downloadConfigFileDesc', 'Download docker-compose.yml for your gateway.')}</Text>
                <Button icon={<DownloadOutlined />}>{t('energyDeviceConfig.download', 'Download')}</Button>
              </div>
              <div>
                <Text strong className="block mb-1">3. {t('energyDeviceConfig.launchGateway', 'Launch gateway')}</Text>
                <Text type="secondary" className="block text-sm mb-2">{t('energyDeviceConfig.launchGatewayDesc', 'Start the gateway using the following command in the terminal from folder with docker-compose.yml file.')}</Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input readOnly value="docker compose up" />
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => { navigator.clipboard.writeText('docker compose up'); message.success(t('energyDeviceConfig.copied', 'Copied')) }}
                  >
                    {t('energyDeviceConfig.copy', 'Copy')}
                  </Button>
                </Space.Compact>
              </div>
            </div>
          </Modal>
          <Modal
            title={
              <div className="flex items-center justify-between w-full pr-6">
                <span>{t('energyDeviceConfig.generalConfiguration', 'General Configuration')}</span>
                <Space>
                  <Segmented
                    size="small"
                    value={generalConfigMode}
                    onChange={(v) => setGeneralConfigMode((v as 'basic' | 'advanced') || 'basic')}
                    options={[
                      { label: t('energyDeviceConfig.basic', 'Basic'), value: 'basic' },
                      { label: t('energyDeviceConfig.advanced', 'Advanced'), value: 'advanced' },
                    ]}
                  />
                </Space>
              </div>
            }
            open={generalConfigModalOpen}
            onCancel={() => { setGeneralConfigModalOpen(false); setGeneralConfigGateway(null) }}
            footer={[
              <Button key="cancel" onClick={() => { setGeneralConfigModalOpen(false); setGeneralConfigGateway(null) }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button key="save" type="primary">{t('common.save', 'Save')}</Button>,
            ]}
            width={640}
            styles={{ body: { paddingTop: 0 } }}
          >
            <Tabs
              activeKey={generalConfigTab}
              onChange={(k) => setGeneralConfigTab((k as typeof generalConfigTab) || 'general')}
              items={[
                { key: 'general', label: t('energyDeviceConfig.general', 'General') },
                { key: 'logs', label: t('energyDeviceConfig.logs', 'Logs') },
                { key: 'storage', label: t('energyDeviceConfig.storage', 'Storage') },
                { key: 'grpc', label: 'GRPC' },
                { key: 'statistics', label: t('energyDeviceConfig.statistics', 'Statistics') },
                { key: 'other', label: t('energyDeviceConfig.other', 'Other') },
              ]}
            />
            {generalConfigMode === 'advanced' ? (
              <div className="mt-3">
                <Space className="mb-2">
                  <Button size="small">{t('energyDeviceConfig.tidy', 'Tidy')}</Button>
                  <Button size="small">{t('energyDeviceConfig.mini', 'Mini')}</Button>
                </Space>
                <Input.TextArea
                  rows={14}
                  value={JSON.stringify({ thingsboard: { host: 'things.iot-platform.io.vn', port: 1883, remoteShell: false, remoteConfiguration: true }, security: { type: 'usernamePassword', clientId: '', username: '', password: '' }, storage: { type: 'memory' } }, null, 2)}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            ) : (
              <div className="mt-4">
                {generalConfigTab === 'general' && (
                  <>
                    <div className="mb-4">
                      <Text strong className="block mb-2">{t('energyDeviceConfig.remoteConfiguration', 'Remote Configuration')}</Text>
                      <Space direction="vertical" className="w-full">
                        <div className="flex items-center justify-between"><span>{t('energyDeviceConfig.remoteConfiguration', 'Remote Configuration')}</span><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><span>{t('energyDeviceConfig.remoteShell', 'Remote shell')}</span><Switch /></div>
                        <Form layout="vertical" className="mt-2">
                          <Form.Item label={t('energyDeviceConfig.platformHost', 'Platform host') + ' *'}>
                            <Input defaultValue="things.iot-platform.io.vn" />
                          </Form.Item>
                          <Form.Item label={t('energyDeviceConfig.platformPort', 'Platform port') + ' *'}>
                            <Input defaultValue="1883" />
                          </Form.Item>
                        </Form>
                      </Space>
                    </div>
                    <div>
                      <Text strong className="block mb-2">{t('energyDeviceConfig.security', 'Security')}</Text>
                      <Segmented
                        block
                        options={[
                          { label: t('energyDeviceConfig.accessToken', 'Access token'), value: 'token' },
                          { label: 'TLS + Access Token', value: 'tls' },
                          { label: t('energyDeviceConfig.usernamePassword', 'Username and Password'), value: 'password' },
                        ]}
                        defaultValue="password"
                        className="mb-3"
                      />
                      <Form layout="vertical">
                        <Form.Item label={t('energyDeviceConfig.clientId', 'Client ID')}><Input placeholder="Client ID" /></Form.Item>
                        <Form.Item label={t('energyDeviceConfig.userName', 'User Name')}><Input placeholder="Username" /></Form.Item>
                        <Form.Item label={t('energyDeviceConfig.password', 'Password')}><Input.Password placeholder="Password" /></Form.Item>
                      </Form>
                    </div>
                  </>
                )}
                {generalConfigTab === 'logs' && (
                  <div className="py-4">
                    <Form layout="vertical">
                      <Form.Item label={t('energyDeviceConfig.dateFormat', 'Date format') + ' *'}>
                        <Input defaultValue="%Y-%m-%d %H:%M:%S" />
                      </Form.Item>
                      <Form.Item label={t('energyDeviceConfig.logFormat', 'Log format') + ' *'}>
                        <Input.TextArea rows={2} defaultValue="%(asctime)s.%(msecs)03d - |%(levelname)s| - [%(filename)s] - %(module)s - %(funcName)s - %(lineno)d - %(message)s" />
                      </Form.Item>
                      <div className="flex items-center justify-between">
                        <span>{t('energyDeviceConfig.remoteLogging', 'Remote logging')}</span>
                        <Switch />
                      </div>
                      <Text strong className="block mt-3">{t('energyDeviceConfig.localLogging', 'Local logging')}</Text>
                      <Tabs size="small" items={[{ key: 'service', label: t('energyDeviceConfig.service', 'Service') }, { key: 'connector', label: t('energyDeviceConfig.connector', 'Connector') }]} />
                    </Form>
                  </div>
                )}
                {generalConfigTab === 'storage' && (
                  <div className="py-4">
                    <Text strong className="block mb-2">{t('energyDeviceConfig.storage', 'Storage')}</Text>
                    <p className="text-secondary text-sm mb-3">{t('energyDeviceConfig.storageDesc', 'Provides configuration for saving incoming data before it is sent to the platform.')}</p>
                    <Segmented block options={[{ label: t('energyDeviceConfig.memoryStorage', 'Memory storage'), value: 'memory' }, { label: t('energyDeviceConfig.fileStorage', 'File storage'), value: 'file' }, { label: 'SQLITE', value: 'sqlite' }]} defaultValue="memory" className="mb-3" />
                    <Form layout="vertical">
                      <Form.Item label={t('energyDeviceConfig.readRecordCountInStorage', 'Read record count in storage')}><Input defaultValue="100" /></Form.Item>
                      <Form.Item label={t('energyDeviceConfig.maximumRecordsInStorage', 'Maximum records in storage')}><Input defaultValue="100000" /></Form.Item>
                    </Form>
                  </div>
                )}
                {generalConfigTab === 'grpc' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3"><Text strong>GRPC</Text><Switch defaultChecked /></div>
                    <Form layout="vertical">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Server port *"><Input defaultValue="9595" /></Form.Item>
                          <Form.Item label="Keep alive (in ms) *"><Input defaultValue="10000" /></Form.Item>
                          <Form.Item label="Max pings without data *"><Input defaultValue="0" /></Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Keep alive timeout (in ms) *"><Input defaultValue="5000" /></Form.Item>
                          <Form.Item label="Min time between pings (in ms) *"><Input defaultValue="10000" /></Form.Item>
                          <Form.Item label="Min ping interval without data (in ms) *"><Input defaultValue="5000" /></Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                )}
                {generalConfigTab === 'statistics' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3"><Text strong>{t('energyDeviceConfig.statistics', 'Statistics')}</Text><Switch defaultChecked /></div>
                    <Form layout="vertical">
                      <Form.Item label={t('energyDeviceConfig.statisticSendPeriodSec', 'Statistic send period (in sec)') + ' *'}><Input defaultValue="3600" /></Form.Item>
                      <Form.Item label={t('energyDeviceConfig.customSendPeriodSec', 'Custom send period (in sec)') + ' *'}><Input defaultValue="3600" /></Form.Item>
                    </Form>
                    <Text strong className="block mt-3">{t('energyDeviceConfig.commands', 'Commands')}</Text>
                    <p className="text-secondary text-sm mb-2">{t('energyDeviceConfig.commandsDesc', 'Commands for collecting additional statistic.')}</p>
                    <Button size="small">{t('energyDeviceConfig.addCommand', 'Add command')}</Button>
                  </div>
                )}
                {generalConfigTab === 'other' && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <Text strong>{t('energyDeviceConfig.checkingDeviceActivity', 'Checking device activity')}</Text>
                      <Switch />
                    </div>
                    <Text strong className="block mb-2">{t('energyDeviceConfig.advanced', 'Advanced')}</Text>
                    <Form layout="vertical">
                      <Form.Item label={t('energyDeviceConfig.minPackSendDelayMs', 'Min pack send delay (in ms)') + ' *'}><Input defaultValue="50" /></Form.Item>
                      <Form.Item label="QoS"><Select defaultValue="1" style={{ width: '100%' }} options={[{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }]} /></Form.Item>
                      <Form.Item label={t('energyDeviceConfig.checkConnectorsConfigSec', 'Check connectors configuration (in sec)') + ' *'}><Input defaultValue="60" /></Form.Item>
                      <Form.Item label={t('energyDeviceConfig.maxPayloadSizeBytes', 'Max payload size in bytes') + ' *'}><Input defaultValue="8196" /></Form.Item>
                      <Form.Item label={t('energyDeviceConfig.minPacketSizeToSend', 'Min packet size to send') + ' *'}><Input defaultValue="500" /></Form.Item>
                    </Form>
                  </div>
                )}
              </div>
            )}
          </Modal>
          <Modal
            title={
              <span>
                {t('energyDeviceConfig.gatewayList', 'Gateway List')} &gt; {t('energyDeviceConfig.connectors', 'Connectors')}
              </span>
            }
            open={connectorsModalOpen}
            onCancel={() => { setConnectorsModalOpen(false); setConnectorsGateway(null); setConnectorData(null) }}
            footer={[<Button key="close" onClick={() => { setConnectorsModalOpen(false); setConnectorsGateway(null); setConnectorData(null) }}>{t('common.close', 'Close')}</Button>]}
            width={720}
          >
            <Spin spinning={connectorsLoading}>
              <Row gutter={16}>
                <Col span={10}>
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
                    style={{ minHeight: 200, borderColor: 'var(--ant-colorBorder)' }}
                    onClick={() => setAddConnectorModalOpen(true)}
                  >
                    <PlusOutlined style={{ fontSize: 32, color: 'var(--ant-colorTextSecondary)' }} />
                    <Text type="secondary" className="mt-2">{t('energyDeviceConfig.addConnector', 'Add connector')}</Text>
                  </div>
                </Col>
                <Col span={14}>
                  <Text strong className="block mb-2">{t('energyDeviceConfig.configuration', 'Configuration')}</Text>
                  {connectorData ? (
                    <div className="text-sm space-y-1">
                      <div><Text type="secondary">active_connectors:</Text> {JSON.stringify(connectorData.active_connectors)}</div>
                      <div><Text type="secondary">inactive_connectors:</Text> {JSON.stringify(connectorData.inactive_connectors)}</div>
                      <div><Text type="secondary">Version:</Text> {JSON.stringify(connectorData.Version)}</div>
                      {connectorData.serverScope && Object.keys(connectorData.serverScope).length > 0 && (
                        <div><Text type="secondary">SERVER_SCOPE:</Text> <pre className="mt-1 p-2 rounded text-xs overflow-auto max-h-24" style={{ background: '#f5f5f5' }}>{JSON.stringify(connectorData.serverScope, null, 2)}</pre></div>
                      )}
                      {connectorData.sharedScope && Object.keys(connectorData.sharedScope).length > 0 && (
                        <div><Text type="secondary">SHARED_SCOPE:</Text> <pre className="mt-1 p-2 rounded text-xs overflow-auto max-h-24" style={{ background: '#f5f5f5' }}>{JSON.stringify(connectorData.sharedScope, null, 2)}</pre></div>
                      )}
                    </div>
                  ) : (
                    <Text type="secondary">{t('energyDeviceConfig.selectConnectorToDisplayConfig', 'Select connector to display config')}</Text>
                  )}
                </Col>
              </Row>
            </Spin>
          </Modal>
          <Modal
            title={
              <Space>
                {t('energyDeviceConfig.addConnector', 'Add connector')}
                <Button type="text" size="small" icon={<QuestionCircleOutlined />} aria-label={t('common.help', 'Help')} />
              </Space>
            }
            open={addConnectorModalOpen}
            onCancel={() => { setAddConnectorModalOpen(false); addConnectorForm.resetFields() }}
            footer={[
              <Button key="cancel" onClick={() => { setAddConnectorModalOpen(false); addConnectorForm.resetFields() }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button
                key="add"
                type="primary"
                onClick={() => {
                  addConnectorForm.validateFields().then((values) => {
                    const deviceId = connectorsGateway?.id
                    if (!deviceId) { message.error(t('energyDeviceConfig.selectGatewayFirst', 'Please open Connectors from a gateway first')); return }
                    const payload = {
                      name: values.name,
                      type: values.type,
                      loggingLevel: values.loggingLevel,
                      fillConfigurationWithDefaults: values.fillConfigurationWithDefaults,
                      sendDataOnlyOnChange: values.sendDataOnlyOnChange,
                    }
                    Promise.all([
                      thingsBoardApi.saveDeviceAttributesByScope(deviceId, 'SHARED_SCOPE', payload as Record<string, string | number | boolean | unknown>),
                      thingsBoardApi.saveDeviceAttributesByScope(deviceId, 'SERVER_SCOPE', payload as Record<string, string | number | boolean | unknown>),
                    ])
                      .then(() => {
                        message.success(t('common.saved'))
                        setAddConnectorModalOpen(false)
                        addConnectorForm.resetFields()
                        if (connectorsGateway?.id) {
                          setConnectorData(null)
                          const id = connectorsGateway.id
                          Promise.all([
                            thingsBoardApi.getDeviceAttributesByScope(id, 'SHARED_SCOPE'),
                            thingsBoardApi.getDeviceAttributesByScope(id, 'SERVER_SCOPE'),
                            thingsBoardApi.getDeviceAttributesByScope(id, 'SHARED_SCOPE', { key: 'active_connectors' }),
                            thingsBoardApi.getDeviceAttributesByScope(id, 'SERVER_SCOPE', { key: 'inactive_connectors' }),
                            thingsBoardApi.getDeviceAttributesByScope(id, 'CLIENT_SCOPE', { key: 'Version' }),
                          ]).then(([sharedScope, serverScope, active, inactive, version]) => {
                            setConnectorData({
                              active_connectors: active,
                              inactive_connectors: inactive,
                              Version: version,
                              serverScope: typeof serverScope === 'object' && serverScope !== null ? (serverScope as Record<string, unknown>) : undefined,
                              sharedScope: typeof sharedScope === 'object' && sharedScope !== null ? (sharedScope as Record<string, unknown>) : undefined,
                            })
                          }).catch(() => {})
                        }
                      })
                      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                  })
                }}
              >
                {t('common.add', 'Add')}
              </Button>,
            ]}
            width={480}
          >
            <Form form={addConnectorForm} layout="vertical" initialValues={{ type: 'MQTT', loggingLevel: 'INFO', fillConfigurationWithDefaults: true, sendDataOnlyOnChange: false }}>
              <Form.Item name="type" label={t('energyDeviceConfig.type', 'Type')}>
                <Select options={[{ value: 'MQTT', label: 'MQTT' }, { value: 'HTTP', label: 'HTTP' }, { value: 'Modbus', label: 'Modbus' }]} />
              </Form.Item>
              <Form.Item name="name" label={t('energyDeviceConfig.name') + ' *'} rules={[{ required: true, message: t('common.required') }]}>
                <Input placeholder={t('energyDeviceConfig.set', 'Set')} />
              </Form.Item>
              <Form.Item name="loggingLevel" label={t('energyDeviceConfig.loggingLevel', 'Logging level')}>
                <Select options={[{ value: 'INFO', label: 'INFO' }, { value: 'DEBUG', label: 'DEBUG' }, { value: 'WARN', label: 'WARN' }, { value: 'ERROR', label: 'ERROR' }]} />
              </Form.Item>
              <Form.Item name="fillConfigurationWithDefaults" label={t('energyDeviceConfig.fillConfigurationWithDefaults', 'Fill configuration with default values')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="sendDataOnlyOnChange" label={t('energyDeviceConfig.sendDataOnlyOnChange', 'Send data only on change')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title={t('energyDeviceConfig.deleteGatewayConfirmTitle', 'Are you sure you want to delete the gateway device \'{{name}}\'?', { name: gatewayDeleteGateway?.name ?? '—' })}
            open={gatewayDeleteModalOpen}
            onCancel={() => { setGatewayDeleteModalOpen(false); setGatewayDeleteGateway(null) }}
            footer={[
              <Button key="cancel" onClick={() => { setGatewayDeleteModalOpen(false); setGatewayDeleteGateway(null) }}>{t('common.cancel', 'Cancel')}</Button>,
              <Button
                key="delete"
                type="primary"
                danger
                onClick={() => {
                  const gw = gatewayDeleteGateway
                  if (!gw?.id) return
                  setGatewayDeleteModalOpen(false)
                  setGatewayDeleteGateway(null)
                  thingsBoardApi
                    .deleteDevice(gw.id)
                    .then(() => {
                      message.success(t('common.saved'))
                      setGateways((prev) => prev.filter((g) => g.id !== gw.id))
                    })
                    .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed')))
                }}
              >
                {t('energyDeviceConfig.delete', 'Delete')}
              </Button>,
            ]}
          >
            <p>{t('energyDeviceConfig.deleteGatewayConfirmMessage', 'Be careful, after the confirmation, the device and all related data will become unrecoverable!')}</p>
          </Modal>
        </ContentCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="energy-device-config-hero">
        <h1 className="energy-device-config-hero-title">
          <SettingOutlined className="energy-device-config-hero-icon" />
          {t('energyDeviceManagement.configTitle')}
        </h1>
        <p className="energy-device-config-hero-desc">
          {t('energyDeviceManagement.configDesc')}
        </p>
      </div>

      <Row gutter={[20, 20]} className="energy-device-config-cards">
        {sections.map(({ key, icon: Icon, titleKey, descKey, color }) => (
          <Col xs={24} sm={12} lg={6} key={key}>
            <Card
              hoverable
              className="energy-device-config-card"
              style={{ ['--card-color' as string]: color }}
              onClick={() => (key === 'devices' ? setActiveSection('devices') : key === 'assets' ? setActiveSection('assets') : setActiveSection(key))}
            >
              <div className="energy-device-config-card-inner">
                <span className="energy-device-config-card-icon">
                  <Icon />
                </span>
                <Text strong className="energy-device-config-card-title">
                  {t(titleKey)}
                </Text>
                <Text type="secondary" className="energy-device-config-card-desc">
                  {t(descKey)}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  )
}
