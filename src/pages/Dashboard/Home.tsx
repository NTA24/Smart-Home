import { useState, useEffect } from 'react'
import { Card, Tag, Row, Col, Typography, Spin, Breadcrumb, Empty, message, Button, Space, Modal, Form, Input, Select, Popconfirm } from 'antd'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  BuildOutlined,
  CloudServerOutlined,
  BankOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { tenantApi, campusApi, buildingApi } from '@/services'
import type { Tenant, Campus, Building } from '@/services'
import { useBuildingStore, useTabStore, useHomeNavigationStore } from '@/stores'
import type { Tab } from '@/stores'

const { Title, Text } = Typography

const buildingImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1577985043696-8bd54d9f093f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop',
]

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setSelectedBuilding } = useBuildingStore()
  const { addTab } = useTabStore()

  const {
    step, setStep,
    tenants, setTenants,
    campuses, setCampuses,
    buildings, setBuildings,
    selectedTenant, setSelectedTenant: setSelectedTenantState,
    selectedCampus, setSelectedCampus: setSelectedCampusState,
  } = useHomeNavigationStore()

  const [loading, setLoading] = useState(false)
  const [tenantModalOpen, setTenantModalOpen] = useState(false)
  const [tenantModalMode, setTenantModalMode] = useState<'create' | 'edit'>('create')
  const [tenantEditing, setTenantEditing] = useState<Tenant | null>(null)
  const [tenantSaving, setTenantSaving] = useState(false)
  const [tenantForm] = Form.useForm()
  const [campusModalOpen, setCampusModalOpen] = useState(false)
  const [campusModalMode, setCampusModalMode] = useState<'create' | 'edit'>('create')
  const [campusEditing, setCampusEditing] = useState<Campus | null>(null)
  const [campusSaving, setCampusSaving] = useState(false)
  const [campusForm] = Form.useForm()
  const [buildingModalOpen, setBuildingModalOpen] = useState(false)
  const [buildingModalMode, setBuildingModalMode] = useState<'create' | 'edit'>('create')
  const [buildingEditing, setBuildingEditing] = useState<Building | null>(null)
  const [buildingSaving, setBuildingSaving] = useState(false)
  const [buildingForm] = Form.useForm()

  useEffect(() => { fetchTenants() }, [])

  const fetchTenants = async () => {
    if (tenants.length === 0) setLoading(true)
    try {
      const res = await tenantApi.getList({ limit: 50, offset: 0 })
      setTenants(res?.items || [])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenantState(tenant)
    setStep('campuses')
    navigate('/home/campus')
    setCampuses([])
    setBuildings([])
    setSelectedCampusState(null)
    setLoading(true)
    try {
      const res = await campusApi.getListByTenantId(tenant.id)
      const list = Array.isArray(res) ? res : (res?.items ?? [])
      setCampuses(list.map((c) => ({ ...c, status: 'ACTIVE' })))
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const openCreateTenant = () => {
    setTenantModalMode('create')
    setTenantEditing(null)
    tenantForm.resetFields()
    tenantForm.setFieldsValue({ status: 'ACTIVE' })
    setTenantModalOpen(true)
  }

  const openEditTenant = (tenant: Tenant) => {
    setTenantModalMode('edit')
    setTenantEditing(tenant)
    tenantForm.setFieldsValue({
      name: tenant.name,
      status: tenant.status || 'ACTIVE',
    })
    setTenantModalOpen(true)
  }

  const handleSaveTenant = async () => {
    try {
      const values = await tenantForm.validateFields()
      setTenantSaving(true)

      if (tenantModalMode === 'create') {
        try {
          const created = await tenantApi.create({
            name: values.name,
            status: values.status,
          })
          setTenants([created, ...tenants])
        } catch {
          const fallbackTenant: Tenant = {
            id: `tenant-${Date.now()}`,
            name: values.name,
            status: values.status,
            created_at: new Date().toISOString(),
          }
          setTenants([fallbackTenant, ...tenants])
        }
        message.success('Đã thêm khách thuê')
      } else if (tenantEditing) {
        try {
          const updated = await tenantApi.update(tenantEditing.id, {
            name: values.name,
            status: values.status,
          })
          setTenants(tenants.map(item => (item.id === tenantEditing.id ? updated : item)))
        } catch {
          setTenants(tenants.map(item => (
            item.id === tenantEditing.id
              ? { ...item, name: values.name, status: values.status, updated_at: new Date().toISOString() }
              : item
          )))
        }
        message.success('Đã cập nhật khách thuê')
      }

      setTenantModalOpen(false)
      setTenantEditing(null)
      tenantForm.resetFields()
    } finally {
      setTenantSaving(false)
    }
  }

  const handleDeleteTenant = async (tenant: Tenant) => {
    try {
      await tenantApi.delete(tenant.id)
    } catch {
    }
    setTenants(tenants.filter(item => item.id !== tenant.id))
    message.success('Đã xóa khách thuê')
  }

  const handleSelectCampus = async (campus: Campus) => {
    setSelectedCampusState(campus)
    setStep('buildings')
    navigate('/home/building')
    setBuildings([])
    setLoading(true)
    try {
      const res = await buildingApi.getListByCampusId(campus.id)
      const list = Array.isArray(res) ? res : (res?.items ?? [])
      setBuildings(list.map((b) => ({ ...b, status: 'ACTIVE' })))
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const openCreateCampus = () => {
    if (!selectedTenant) {
      message.warning('Vui lòng chọn khách thuê trước')
      return
    }
    setCampusModalMode('create')
    setCampusEditing(null)
    campusForm.resetFields()
    campusForm.setFieldsValue({ status: 'ACTIVE' })
    setCampusModalOpen(true)
  }

  const openEditCampus = (campus: Campus) => {
    setCampusModalMode('edit')
    setCampusEditing(campus)
    campusForm.setFieldsValue({
      name: campus.name,
      address: campus.address,
      status: campus.status || 'ACTIVE',
    })
    setCampusModalOpen(true)
  }

  const handleSaveCampus = async () => {
    if (!selectedTenant && campusModalMode === 'create') return
    try {
      const values = await campusForm.validateFields()
      setCampusSaving(true)
      if (campusModalMode === 'create') {
        try {
          const created = await campusApi.create({
            tenant_id: selectedTenant!.id,
            name: values.name,
            address: values.address,
            status: values.status,
          })
          setCampuses([created, ...campuses])
        } catch {
          const fallbackCampus: Campus = {
            id: `campus-${Date.now()}`,
            tenant_id: selectedTenant!.id,
            name: values.name,
            address: values.address,
            status: values.status,
            created_at: new Date().toISOString(),
          }
          setCampuses([fallbackCampus, ...campuses])
        }
        message.success('Đã thêm khu viên')
      } else if (campusEditing) {
        try {
          const updated = await campusApi.update(campusEditing.id, {
            name: values.name,
            address: values.address,
            status: values.status,
          })
          setCampuses(campuses.map(item => (item.id === campusEditing.id ? updated : item)))
        } catch {
          setCampuses(campuses.map(item => (
            item.id === campusEditing.id
              ? { ...item, name: values.name, address: values.address, status: values.status, updated_at: new Date().toISOString() }
              : item
          )))
        }
        message.success('Đã cập nhật khu viên')
      }
      setCampusModalOpen(false)
      setCampusEditing(null)
      campusForm.resetFields()
    } finally {
      setCampusSaving(false)
    }
  }

  const handleDeleteCampus = async (campus: Campus) => {
    try {
      await campusApi.delete(campus.id)
    } catch {
    }
    setCampuses(campuses.filter(item => item.id !== campus.id))
    message.success('Đã xóa khu viên')
  }

  const openCreateBuilding = () => {
    if (!selectedCampus) {
      message.warning('Vui lòng chọn khu viên trước')
      return
    }
    setBuildingModalMode('create')
    setBuildingEditing(null)
    buildingForm.resetFields()
    buildingForm.setFieldsValue({ status: 'ACTIVE' })
    setBuildingModalOpen(true)
  }

  const openEditBuilding = (building: Building) => {
    setBuildingModalMode('edit')
    setBuildingEditing(building)
    buildingForm.setFieldsValue({
      name: building.name,
      code: building.code,
      building_type: building.building_type,
      status: building.status || 'ACTIVE',
    })
    setBuildingModalOpen(true)
  }

  const handleSaveBuilding = async () => {
    if (!selectedCampus && buildingModalMode === 'create') return
    try {
      const values = await buildingForm.validateFields()
      setBuildingSaving(true)
      if (buildingModalMode === 'create') {
        try {
          const created = await buildingApi.create({
            campus_id: selectedCampus!.id,
            name: values.name,
            code: values.code,
            building_type: values.building_type,
            status: values.status,
          })
          setBuildings([created, ...buildings])
        } catch {
          const fallbackBuilding: Building = {
            id: `building-${Date.now()}`,
            campus_id: selectedCampus!.id,
            name: values.name,
            code: values.code,
            building_type: values.building_type,
            status: values.status,
            created_at: new Date().toISOString(),
          }
          setBuildings([fallbackBuilding, ...buildings])
        }
        message.success('Đã thêm tòa nhà')
      } else if (buildingEditing) {
        try {
          const updated = await buildingApi.update(buildingEditing.id, {
            name: values.name,
            code: values.code,
            building_type: values.building_type,
            status: values.status,
          })
          setBuildings(buildings.map(item => (item.id === buildingEditing.id ? updated : item)))
        } catch {
          setBuildings(buildings.map(item => (
            item.id === buildingEditing.id
              ? { ...item, name: values.name, code: values.code, building_type: values.building_type, status: values.status, updated_at: new Date().toISOString() }
              : item
          )))
        }
        message.success('Đã cập nhật tòa nhà')
      }
      setBuildingModalOpen(false)
      setBuildingEditing(null)
      buildingForm.resetFields()
    } finally {
      setBuildingSaving(false)
    }
  }

  const handleDeleteBuilding = async (building: Building) => {
    try {
      await buildingApi.delete(building.id)
    } catch {
    }
    setBuildings(buildings.filter(item => item.id !== building.id))
    message.success('Đã xóa tòa nhà')
  }

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding({
      id: building.id,
      name: building.name,
      code: building.code,
      campus_id: building.campus_id,
      building_type: building.building_type,
      status: building.status ?? '',
      created_at: building.created_at,
      updated_at: building.updated_at,
    })
    const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
    addTab(tab)
    navigate('/dashboard')
  }

  const goBack = () => {
    if (step === 'buildings') {
      setStep('campuses')
      navigate('/home/campus')
      setBuildings([])
      setSelectedCampusState(null)
    } else if (step === 'campuses') {
      setStep('tenants')
      navigate('/home/tenant')
      setCampuses([])
      setSelectedTenantState(null)
    }
  }

  const stepConfig = {
    tenants: {
      icon: <CloudServerOutlined className="home_hero-icon text-white" />,
      title: t('home.selectTenant'),
      subtitle: t('home.selectTenantDesc'),
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    campuses: {
      icon: <BankOutlined style={{ fontSize: 32, color: '#fff' }} />,
      title: t('home.selectCampus'),
      subtitle: `${t('home.tenant')}: ${selectedTenant?.name || ''}`,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    buildings: {
      icon: <HomeOutlined style={{ fontSize: 32, color: '#fff' }} />,
      title: t('home.selectBuilding'),
      subtitle: `${t('home.campus')}: ${selectedCampus?.name || ''}`,
      color: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)',
    },
  }

  const current = stepConfig[step]

  return (
    <div className="home_root">
      {/* Hero Section */}
      <div className="home_hero" style={{ background: current.color }}>
        {/* Breadcrumb */}
        <div className="home_breadcrumb-wrap">
          <Breadcrumb
            className="home_breadcrumb"
            items={[
              {
                title: (
                  <span
                    className={step !== 'tenants' ? 'cursor-pointer' : ''}
                    style={{ color: step === 'tenants' ? '#fff' : 'rgba(255,255,255,0.7)' }}
                    onClick={() => { if (step !== 'tenants') { setStep('tenants'); navigate('/home/tenant'); setCampuses([]); setBuildings([]); setSelectedTenantState(null); setSelectedCampusState(null) } }}
                  >
                    <CloudServerOutlined /> {t('home.tenant')}
                  </span>
                ),
              },
              ...(step !== 'tenants'
                ? [{
                    title: (
                      <span
                        className={step === 'buildings' ? 'cursor-pointer' : ''}
                        style={{ color: step === 'campuses' ? '#fff' : 'rgba(255,255,255,0.7)' }}
                        onClick={() => { if (step === 'buildings') { setStep('campuses'); navigate('/home/campus'); setBuildings([]); setSelectedCampusState(null) } }}
                      >
                        <BankOutlined /> {selectedTenant?.name}
                      </span>
                    ),
                  }]
                : []),
              ...(step === 'buildings'
                ? [{
                    title: (
                    <span className="text-white">
                      <HomeOutlined /> {selectedCampus?.name}
                    </span>
                    ),
                  }]
                : []),
            ]}
          />
        </div>

        {current.icon}
        <Title level={2} className="home_hero-title">
          {current.title}
        </Title>
        <Text className="home_hero-subtitle">
          {current.subtitle}
        </Text>

        {/* Stats */}
        <Row gutter={24} className="home_stats-row">
          <Col xs={8}>
            <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
              <CheckCircleOutlined className="home_stat-icon text-success" />
              <Title level={3} className="home_stat-value">{tenants.length}</Title>
              <Text type="secondary" className="home_stat-label">{t('home.tenant')}</Text>
            </Card>
          </Col>
          <Col xs={8}>
            <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
              <BankOutlined className="home_stat-icon text-primary" />
              <Title level={3} className="home_stat-value">{campuses.length}</Title>
              <Text type="secondary" className="home_stat-label">{t('home.campus')}</Text>
            </Card>
          </Col>
          <Col xs={8}>
            <Card className="home_stat-card text-center border-none" bodyStyle={{ padding: '20px 12px' }}>
              <HomeOutlined className="home_stat-icon text-warning" />
              <Title level={3} className="home_stat-value">{buildings.length}</Title>
              <Text type="secondary" className="home_stat-label">{t('home.building')}</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Content */}
      <div className="home_content">
        {/* Back button */}
        {step !== 'tenants' && (
          <div className="home_back-wrap">
            <Tag
              icon={<ArrowLeftOutlined />}
              color="default"
              className="home_back-tag cursor-pointer"
              onClick={() => !loading && goBack()}
              style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              {t('apiTest.back')}
            </Tag>
          </div>
        )}

        <Title level={4} className="home_section-title">
          {step === 'tenants' && t('home.tenantList')}
          {step === 'campuses' && t('home.campusList')}
          {step === 'buildings' && t('home.buildingList')}
        </Title>
        {step === 'tenants' && (
          <div className="mb-12">
            <Button type="primary" onClick={openCreateTenant} disabled={loading}>
              Thêm khách thuê
            </Button>
          </div>
        )}
        {step === 'campuses' && (
          <div className="mb-12">
            <Button type="primary" onClick={openCreateCampus} disabled={loading}>
              Thêm khu viên
            </Button>
          </div>
        )}
        {step === 'buildings' && (
          <div className="mb-12">
            <Button type="primary" onClick={openCreateBuilding} disabled={loading}>
              Thêm tòa nhà
            </Button>
          </div>
        )}

        <Spin spinning={loading && !((step === 'tenants' && tenants.length > 0) || (step === 'campuses' && campuses.length > 0) || (step === 'buildings' && buildings.length > 0))}>
          {/* Tenants */}
          {step === 'tenants' && (
            <Row className="home_tenant-row" gutter={[24, 24]}>
              {tenants.length === 0 && !loading && <Col span={24}><Empty description={t('apiTest.noData')} /></Col>}
              {tenants.map((tenant) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={tenant.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectTenant(tenant)}
                    className="home_entity-card"
                  >
                    <div className="home_entity-body">
                      <div className="home_entity-avatar">
                        <CloudServerOutlined className="text-white text-2xl" />
                      </div>
                      <Title level={5} className="mb-4">{tenant.name}</Title>
                      <Tag>{(tenant as { code?: string }).code ?? tenant.slug ?? ''}</Tag>
                      <div className="mt-12">
                        <Tag color={tenant.status === 'ACTIVE' ? 'green' : 'red'}>{tenant.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}</Tag>
                      </div>
                      <Text type="secondary" className="text-sm block mt-8 mb-12">
                        {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : ''}
                      </Text>
                      <div className="mt-12">
                        <Space>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditTenant(tenant)
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                          <Popconfirm
                            title="Xóa khách thuê"
                            description="Bạn có chắc muốn xóa khách thuê này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={(e) => {
                              e?.stopPropagation?.()
                              handleDeleteTenant(tenant)
                            }}
                            onCancel={(e) => e?.stopPropagation?.()}
                          >
                            <Button
                              danger
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Campuses */}
          {step === 'campuses' && (
            <Row gutter={[24, 24]}>
              {campuses.length === 0 && !loading && <Col span={24}><Empty description={t('apiTest.noData')} /></Col>}
              {campuses.map((campus, i) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={String(campus?.id ?? i)}>
                  <Card
                    hoverable
                    onClick={() => handleSelectCampus(campus)}
                    className="home_entity-card"
                    bodyStyle={{ padding: 0 }}
                  >
                    <div className="home_campus-img-wrap">
                      <img
                        src={buildingImages[i % buildingImages.length]}
                        alt={campus.name}
                        className="home_campus-img"
                      />
                      <Tag
                        color={campus.status === 'ACTIVE' ? 'green' : 'red'}
                        className="home_campus-status-tag font-medium"
                      >
                        {campus.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                      </Tag>
                    </div>
                    <div className="home_campus-info">
                      <Title level={5} className="mb-4">{campus.name}</Title>
                      <Tag color="blue">{(campus as { code?: string }).code ?? ''}</Tag>
                      {campus.address && (
                        <div className="flex items-center gap-6 mt-8">
                          <EnvironmentOutlined className="text-muted text-base" />
                          <Text type="secondary" className="text-base">{campus.address}</Text>
                        </div>
                      )}
                      <div className="mt-12">
                        <Space>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditCampus(campus)
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                          <Popconfirm
                            title="Xóa khu viên"
                            description="Bạn có chắc muốn xóa khu viên này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={(e) => {
                              e?.stopPropagation?.()
                              handleDeleteCampus(campus)
                            }}
                            onCancel={(e) => e?.stopPropagation?.()}
                          >
                            <Button
                              danger
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Buildings */}
          {step === 'buildings' && (
            <Row gutter={[24, 24]}>
              {buildings.length === 0 && !loading && <Col span={24}><Empty description={t('apiTest.noData')} /></Col>}
              {buildings.map((building, i) => (
                <Col xs={24} sm={12} lg={8} key={String(building?.id ?? i)}>
                  <Card
                    hoverable
                    onClick={() => handleSelectBuilding(building)}
                    className="home_entity-card"
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Building Image */}
                    <div className="home_building-img-wrap">
                      <img
                        src={buildingImages[i % buildingImages.length]}
                        alt={building.name}
                        className="home_building-img"
                      />
                      <Tag
                        color={building.status === 'ACTIVE' ? 'green' : 'red'}
                        className="home_building-status-tag font-medium"
                      >
                        {building.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                      </Tag>
                    </div>

                    {/* Building Info */}
                    <div className="home_building-info">
                      <Title level={5} className="mb-8">{building.name}</Title>

                      {/* Stats Row */}
                      <div className="home_building-tags">
                        <Tag icon={<AppstoreOutlined />} className="home_building-tag-blue">
                          {building.code}
                        </Tag>
                        {building.building_type && (
                          <Tag icon={<BuildOutlined />} className="home_building-tag-green">
                            {building.building_type}
                          </Tag>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="home_building-footer">
                        <Text type="secondary" className="text-sm">
                          {building.created_at ? new Date(building.created_at).toLocaleDateString() : ''}
                        </Text>
                      </div>
                      <div className="mt-12">
                        <Space>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditBuilding(building)
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                          <Popconfirm
                            title="Xóa tòa nhà"
                            description="Bạn có chắc muốn xóa tòa nhà này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={(e) => {
                              e?.stopPropagation?.()
                              handleDeleteBuilding(building)
                            }}
                            onCancel={(e) => e?.stopPropagation?.()}
                          >
                            <Button
                              danger
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </div>
      <Modal
        title={tenantModalMode === 'create' ? 'Thêm khách thuê' : 'Chỉnh sửa khách thuê'}
        open={tenantModalOpen}
        onCancel={() => {
          setTenantModalOpen(false)
          setTenantEditing(null)
          tenantForm.resetFields()
        }}
        onOk={handleSaveTenant}
        confirmLoading={tenantSaving}
        okText={tenantModalMode === 'create' ? 'Thêm' : 'Lưu'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={tenantForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách thuê"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách thuê' }]}
          >
            <Input placeholder="Nhập tên khách thuê" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Không hoạt động' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={campusModalMode === 'create' ? 'Thêm khu viên' : 'Chỉnh sửa khu viên'}
        open={campusModalOpen}
        onCancel={() => {
          setCampusModalOpen(false)
          setCampusEditing(null)
          campusForm.resetFields()
        }}
        onOk={handleSaveCampus}
        confirmLoading={campusSaving}
        okText={campusModalMode === 'create' ? 'Thêm' : 'Lưu'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={campusForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khu viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu viên' }]}
          >
            <Input placeholder="Nhập tên khu viên" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ khu viên" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Không hoạt động' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={buildingModalMode === 'create' ? 'Thêm tòa nhà' : 'Chỉnh sửa tòa nhà'}
        open={buildingModalOpen}
        onCancel={() => {
          setBuildingModalOpen(false)
          setBuildingEditing(null)
          buildingForm.resetFields()
        }}
        onOk={handleSaveBuilding}
        confirmLoading={buildingSaving}
        okText={buildingModalMode === 'create' ? 'Thêm' : 'Lưu'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={buildingForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên tòa nhà"
            rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà' }]}
          >
            <Input placeholder="Nhập tên tòa nhà" />
          </Form.Item>
          <Form.Item name="code" label="Mã tòa nhà">
            <Input placeholder="Nhập mã tòa nhà" />
          </Form.Item>
          <Form.Item name="building_type" label="Loại tòa nhà">
            <Input placeholder="Nhập loại tòa nhà" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select
              options={[
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Không hoạt động' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
