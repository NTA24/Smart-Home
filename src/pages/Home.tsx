import { useState, useEffect } from 'react'
import { Card, Tag, Row, Col, Typography, Spin, Breadcrumb, Empty, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  AlertOutlined,
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

// Building images pool
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

  // Shared navigation store
  const {
    step, setStep,
    tenants, setTenants,
    campuses, setCampuses,
    buildings, setBuildings,
    selectedTenant, setSelectedTenant: setSelectedTenantState,
    selectedCampus, setSelectedCampus: setSelectedCampusState,
  } = useHomeNavigationStore()

  const [loading, setLoading] = useState(false)

  // Fetch tenants on mount
  useEffect(() => { fetchTenants() }, [])

  const fetchTenants = async () => {
    setLoading(true)
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
    setLoading(true)
    try {
      const res = await campusApi.getList({ limit: 50, offset: 0 })
      setCampuses(res?.items || [])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCampus = async (campus: Campus) => {
    setSelectedCampusState(campus)
    setStep('buildings')
    setLoading(true)
    try {
      const res = await buildingApi.getList({ limit: 50, offset: 0 })
      setBuildings(res?.items || [])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBuilding = (building: Building) => {
    // Save to store
    setSelectedBuilding({
      id: building.id,
      name: building.name,
      code: building.code,
      campus_id: building.campus_id,
      building_type: building.building_type,
      status: building.status,
      created_at: building.created_at,
      updated_at: building.updated_at,
    })
    // Add dashboard tab and navigate
    const tab: Tab = { key: '/dashboard', labelKey: 'menu.dashboard', closable: false }
    addTab(tab)
    navigate('/dashboard')
  }

  const goBack = () => {
    if (step === 'buildings') {
      setStep('campuses')
      setBuildings([])
      setSelectedCampusState(null)
    } else if (step === 'campuses') {
      setStep('tenants')
      setCampuses([])
      setSelectedTenantState(null)
    }
  }

  // Step info for hero
  const stepConfig = {
    tenants: {
      icon: <CloudServerOutlined style={{ fontSize: 32, color: '#fff' }} />,
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
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Hero Section */}
      <div
        style={{
          background: current.color,
          padding: '48px 40px',
          textAlign: 'center',
          borderRadius: '0 0 24px 24px',
          marginBottom: 32,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <Breadcrumb
            style={{ display: 'inline-flex' }}
            items={[
              {
                title: (
                  <span
                    style={{ color: step === 'tenants' ? '#fff' : 'rgba(255,255,255,0.7)', cursor: step !== 'tenants' ? 'pointer' : 'default' }}
                    onClick={() => { if (step !== 'tenants') { setStep('tenants'); setCampuses([]); setBuildings([]); setSelectedTenantState(null); setSelectedCampusState(null) } }}
                  >
                    <CloudServerOutlined /> {t('home.tenant')}
                  </span>
                ),
              },
              ...(step !== 'tenants'
                ? [{
                    title: (
                      <span
                        style={{ color: step === 'campuses' ? '#fff' : 'rgba(255,255,255,0.7)', cursor: step === 'buildings' ? 'pointer' : 'default' }}
                        onClick={() => { if (step === 'buildings') { setStep('campuses'); setBuildings([]); setSelectedCampusState(null) } }}
                      >
                        <BankOutlined /> {selectedTenant?.name}
                      </span>
                    ),
                  }]
                : []),
              ...(step === 'buildings'
                ? [{
                    title: (
                      <span style={{ color: '#fff' }}>
                        <HomeOutlined /> {selectedCampus?.name}
                      </span>
                    ),
                  }]
                : []),
            ]}
          />
        </div>

        {current.icon}
        <Title level={2} style={{ color: '#fff', marginBottom: 8, marginTop: 12, fontWeight: 600 }}>
          {current.title}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
          {current.subtitle}
        </Text>

        {/* Stats */}
        <Row gutter={24} style={{ marginTop: 32, maxWidth: 600, margin: '32px auto 0' }}>
          <Col xs={8}>
            <Card style={{ borderRadius: 12, textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bodyStyle={{ padding: '20px 12px' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 6 }} />
              <Title level={3} style={{ margin: '4px 0 2px' }}>{tenants.length}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('home.tenant')}</Text>
            </Card>
          </Col>
          <Col xs={8}>
            <Card style={{ borderRadius: 12, textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bodyStyle={{ padding: '20px 12px' }}>
              <BankOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 6 }} />
              <Title level={3} style={{ margin: '4px 0 2px' }}>{campuses.length}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('home.campus')}</Text>
            </Card>
          </Col>
          <Col xs={8}>
            <Card style={{ borderRadius: 12, textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bodyStyle={{ padding: '20px 12px' }}>
              <HomeOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 6 }} />
              <Title level={3} style={{ margin: '4px 0 2px' }}>{buildings.length}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('home.building')}</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Content */}
      <div style={{ padding: '0 40px 40px' }}>
        {/* Back button */}
        {step !== 'tenants' && (
          <div style={{ marginBottom: 16 }}>
            <Tag
              icon={<ArrowLeftOutlined />}
              color="default"
              style={{ cursor: 'pointer', fontSize: 14, padding: '4px 12px' }}
              onClick={goBack}
            >
              {t('apiTest.back')}
            </Tag>
          </div>
        )}

        <Title level={4} style={{ marginBottom: 24, color: '#1a1a1a' }}>
          {step === 'tenants' && t('home.tenantList')}
          {step === 'campuses' && t('home.campusList')}
          {step === 'buildings' && t('home.buildingList')}
        </Title>

        <Spin spinning={loading}>
          {/* Tenants */}
          {step === 'tenants' && (
            <Row gutter={[24, 24]}>
              {tenants.length === 0 && !loading && <Col span={24}><Empty description={t('apiTest.noData')} /></Col>}
              {tenants.map((tenant) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={tenant.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectTenant(tenant)}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}>
                        <CloudServerOutlined style={{ fontSize: 28, color: '#fff' }} />
                      </div>
                      <Title level={5} style={{ marginBottom: 4 }}>{tenant.name}</Title>
                      <Tag>{tenant.code}</Tag>
                      <div style={{ marginTop: 12 }}>
                        <Tag color={tenant.status === 'ACTIVE' ? 'green' : 'red'}>{tenant.status}</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                        {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : ''}
                      </Text>
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
                <Col xs={24} sm={12} lg={8} xl={6} key={campus.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectCampus(campus)}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={buildingImages[i % buildingImages.length]}
                        alt={campus.name}
                        style={{ width: '100%', height: 140, objectFit: 'cover' }}
                      />
                      <Tag
                        color={campus.status === 'ACTIVE' ? 'green' : 'red'}
                        style={{ position: 'absolute', top: 12, right: 12, borderRadius: 4, border: 'none', fontWeight: 500 }}
                      >
                        {campus.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                      </Tag>
                    </div>
                    <div style={{ padding: 20 }}>
                      <Title level={5} style={{ marginBottom: 4 }}>{campus.name}</Title>
                      <Tag color="blue">{campus.code}</Tag>
                      {campus.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                          <Text type="secondary" style={{ fontSize: 13 }}>{campus.address}</Text>
                        </div>
                      )}
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
                <Col xs={24} sm={12} lg={8} key={building.id}>
                  <Card
                    hoverable
                    onClick={() => handleSelectBuilding(building)}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Building Image */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={buildingImages[i % buildingImages.length]}
                        alt={building.name}
                        style={{ width: '100%', height: 160, objectFit: 'cover' }}
                      />
                      <Tag
                        color={building.status === 'ACTIVE' ? 'green' : 'red'}
                        style={{ position: 'absolute', top: 12, right: 12, borderRadius: 4, border: 'none', fontWeight: 500 }}
                      >
                        {building.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                      </Tag>
                    </div>

                    {/* Building Info */}
                    <div style={{ padding: 20 }}>
                      <Title level={5} style={{ marginBottom: 8 }}>{building.name}</Title>

                      {/* Stats Row */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        <Tag
                          icon={<AppstoreOutlined />}
                          style={{ background: '#f0f5ff', border: 'none', color: '#1890ff', borderRadius: 6, padding: '4px 10px' }}
                        >
                          {building.code}
                        </Tag>
                        {building.building_type && (
                          <Tag
                            icon={<BuildOutlined />}
                            style={{ background: '#f6ffed', border: 'none', color: '#52c41a', borderRadius: 6, padding: '4px 10px' }}
                          >
                            {building.building_type}
                          </Tag>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {building.created_at ? new Date(building.created_at).toLocaleDateString() : ''}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </div>
    </div>
  )
}
