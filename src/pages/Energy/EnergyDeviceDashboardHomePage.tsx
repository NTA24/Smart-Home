import { useEffect, useState } from 'react'
import { PageContainer, ContentCard } from '@/components'
import { Card, Row, Col, Button, List, Typography, Space, Spin, message, Tag } from 'antd'
import { PlusOutlined, RightOutlined, StarOutlined, StarFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { thingsBoardApi } from '@/services'
import { useNavigate } from 'react-router'

dayjs.extend(relativeTime)

const { Title, Text } = Typography

interface UserDashboardItem {
  id?: { id?: string } | string | null
  title?: string | null
  starred?: boolean
  /** timestamp millis of last visit */
  lastVisited?: number
}

function getId(raw: UserDashboardItem): string {
  const id = raw.id
  if (!id) return ''
  if (typeof id === 'string') return id
  if (typeof id === 'object' && 'id' in id && typeof (id as { id?: string }).id === 'string') {
    return (id as { id: string }).id
  }
  return ''
}

function extractUsageCount(obj: unknown): number | undefined {
  if (typeof obj === 'number') return obj
  if (obj && typeof obj === 'object') {
    const anyObj = obj as { value?: number; limit?: number; current?: number }
    if (typeof anyObj.value === 'number') return anyObj.value
    if (typeof anyObj.current === 'number') return anyObj.current
  }
  return undefined
}

function extractSettingsItems(raw: unknown): Array<Record<string, unknown>> {
  if (!raw) return []
  const anyRaw = raw as { jsonValue?: unknown; value?: unknown }
  const root = anyRaw.jsonValue ?? anyRaw.value ?? raw

  if (Array.isArray(root)) return root as Array<Record<string, unknown>>

  if (root && typeof root === 'object') {
    const obj = root as { cards?: unknown; items?: unknown; links?: unknown }
    if (Array.isArray(obj.cards)) return obj.cards as Array<Record<string, unknown>>
    if (Array.isArray(obj.items)) return obj.items as Array<Record<string, unknown>>
    if (Array.isArray(obj.links)) return obj.links as Array<Record<string, unknown>>
  }

  return []
}

export default function EnergyDeviceDashboardHomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [home, setHome] = useState<Record<string, unknown> | null>(null)
  const [serverTime, setServerTime] = useState<number | null>(null)
  const [dashboards, setDashboards] = useState<UserDashboardItem[]>([])
  const [usage, setUsage] = useState<Record<string, unknown> | null>(null)
  const [quickLinks, setQuickLinks] = useState<Array<Record<string, unknown>>>([])
  const [docLinks, setDocLinks] = useState<Array<Record<string, unknown>>>([])

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      thingsBoardApi.getDashboardHome(),
      thingsBoardApi.getServerTime(),
      thingsBoardApi.getUserDashboards(),
      thingsBoardApi.getUsage(),
      thingsBoardApi.getUserSettings('QUICK_LINKS'),
      thingsBoardApi.getUserSettings('DOC_LINKS'),
    ])
      .then((results) => {
        const [homeRes, serverTimeRes, dashboardsRes, usageRes, quickRes, docRes] = results

        if (homeRes.status === 'fulfilled') {
          setHome(homeRes.value as Record<string, unknown>)
        }
        if (serverTimeRes.status === 'fulfilled') {
          const v = serverTimeRes.value as number | { serverTime?: number }
          setServerTime(typeof v === 'number' ? v : v?.serverTime ?? null)
        }
        if (dashboardsRes.status === 'fulfilled') {
          const raw = dashboardsRes.value as
            | { last?: Array<UserDashboardItem>; starred?: Array<UserDashboardItem> }
            | Array<UserDashboardItem>
          let list: Array<UserDashboardItem> = []

          if (Array.isArray(raw)) {
            list = raw
          } else if (raw && typeof raw === 'object') {
            list = raw.last ?? []
          }

          setDashboards(
            list.map((item) => ({
              ...item,
              // chuẩn hóa id và title đề phòng null
              id: item.id ?? undefined,
              title: item.title ?? undefined,
            }))
          )
        }
        if (usageRes.status === 'fulfilled') {
          setUsage(usageRes.value as Record<string, unknown>)
        }
        if (quickRes.status === 'fulfilled') {
          setQuickLinks(extractSettingsItems(quickRes.value))
        }
        if (docRes.status === 'fulfilled') {
          setDocLinks(extractSettingsItems(docRes.value))
        }
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => setLoading(false))
  }, [t])

  const devicesInactive = (home?.inactiveDevices as number) ?? 0
  const devicesActive = (home?.activeDevices as number) ?? 0
  const devicesTotal =
    (home?.totalDevices as number) ??
    extractUsageCount((usage as { devices?: unknown } | null)?.devices) ??
    devicesInactive +
      devicesActive

  const criticalAlarms = (home?.criticalAlarms as number) ?? 0

  const lastViewedDashboards = dashboards.slice(0, 7)

  const serverTimeText = serverTime ? dayjs(serverTime).format('YYYY-MM-DD HH:mm:ss') : '—'

  const handleStarDashboard = (item: UserDashboardItem) => {
    const id = getId(item)
    if (!id) return
    thingsBoardApi
      .starDashboard(id)
      .then(() => {
        setDashboards((prev) =>
          prev.map((d) =>
            getId(d) === id
              ? {
                  ...d,
                  starred: true,
                }
              : d
          )
        )
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.saveFailed', 'Lưu thất bại'))
      })
  }

  const handleVisitDashboard = (item: UserDashboardItem) => {
    const id = getId(item)
    if (!id) return
    thingsBoardApi
      .visitDashboard(id)
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed', 'Tải thất bại'))
      })
      .finally(() => {
        navigate(`/energy-device-dashboard/${id}`)
      })
  }

  return (
    <PageContainer className="device-dashboard-home">
      <Spin spinning={loading}>
        {/* Row 1: Devices + Alarms full width */}
        <Row gutter={[16, 16]} className="device-dashboard-home-row">
          <Col span={24}>
            <Row gutter={[16, 16]} className="device-dashboard-home-row">
              <Col span={16} className="device-dashboard-home-col">
                <Card
                  className="device-dashboard-home-card"
                  title={t('energyDeviceDashboard.homeDevices', 'Devices')}
                  extra={
                    <Space>
                      <Button size="small">{t('energyDeviceDashboard.viewDocs', 'View docs')}</Button>
                      <Button type="primary" size="small" icon={<PlusOutlined />}>
                        {t('energyDeviceDashboard.addDevice', 'Add device')}
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <ContentCard>
                        <Title level={5}>{t('energyDeviceDashboard.inactive', 'Inactive')}</Title>
                        <Title>{devicesInactive}</Title>
                      </ContentCard>
                    </Col>
                    <Col span={8}>
                      <ContentCard>
                        <Title level={5}>{t('energyDeviceDashboard.active', 'Active')}</Title>
                        <Title>{devicesActive}</Title>
                      </ContentCard>
                    </Col>
                    <Col span={8}>
                      <ContentCard>
                        <Title level={5}>{t('energyDeviceDashboard.total', 'Total')}</Title>
                        <Title>{devicesTotal}</Title>
                      </ContentCard>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8} className="device-dashboard-home-col">
                <Card title={t('energyDeviceDashboard.alarms', 'Alarms')} className="device-dashboard-home-card">
                  <ContentCard>
                    <Title level={5}>{t('energyDeviceDashboard.critical', 'Critical')}</Title>
                    <Title type={criticalAlarms > 0 ? 'danger' : undefined}>{criticalAlarms}</Title>
                    <Text type="secondary">
                      {t('energyDeviceDashboard.assignedToMe', 'Assigned to me')}: {(home?.assignedAlarms as number) ?? 0}
                    </Text>
                  </ContentCard>
                </Card>
              </Col>
            </Row>

            {/* Row 2: Dashboards + Activity full width */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }} className="device-dashboard-home-row">
              <Col span={12} className="device-dashboard-home-col">
                <Card
                  className="device-dashboard-home-card"
                  title={t('energyDeviceDashboard.homeDashboards', 'Dashboards')}
                  extra={<Button size="small">{t('energyDeviceDashboard.addDashboard', 'Add dashboard')}</Button>}
                >
                  <List
                    dataSource={lastViewedDashboards}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            key="star"
                            type="text"
                            icon={
                              item.starred ? (
                                <StarFilled style={{ color: '#faad14' }} />
                              ) : (
                                <StarOutlined />
                              )
                            }
                            onClick={() => handleStarDashboard(item)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <a
                              onClick={() => handleVisitDashboard(item)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.title || getId(item) || '-'}
                            </a>
                          }
                          description={
                            <Text type="secondary">
                              {item.lastVisited
                                ? dayjs(item.lastVisited).fromNow()
                                : t('energyDeviceDashboard.never', 'Never')}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: t('energyDeviceDashboard.noDashboards', 'No dashboards found') }}
                  />
                </Card>
              </Col>
              <Col span={12} className="device-dashboard-home-col">
                <Card title={t('energyDeviceDashboard.activity', 'Activity')} className="device-dashboard-home-card">
                  <Text type="secondary">
                    {t('energyDeviceDashboard.activityPlaceholder', 'History - last 30 days')}
                  </Text>
                  <div style={{ height: 160, marginTop: 16, borderRadius: 8, background: '#f5f5f5' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {t('energyDeviceDashboard.serverTime', 'Server time')}: {serverTimeText}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

          </Col>
        </Row>

        {/* Row 3: Quick links + Documentation + Usage full width */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }} className="device-dashboard-home-row">
          <Col span={8} className="device-dashboard-home-col">
            <Card title={t('energyDeviceDashboard.quickLinks', 'Quick links')} className="device-dashboard-home-card">
              <Row gutter={[8, 8]}>
                {quickLinks.length === 0 ? (
                  <Col span={24}>
                    <Text type="secondary">
                      {t('energyDeviceDashboard.noQuickLinks', 'No quick links')}
                    </Text>
                  </Col>
                ) : (
                  quickLinks.map((item, idx) => (
                    <Col key={idx} span={24}>
                      <ContentCard>
                        <Space>
                          <RightOutlined />
                          <Text>{(item.title as string) ?? (item.name as string) ?? '-'}</Text>
                        </Space>
                      </ContentCard>
                    </Col>
                  ))
                )}
              </Row>
            </Card>
          </Col>
          <Col span={8} className="device-dashboard-home-col">
            <Card title={t('energyDeviceDashboard.documentation', 'Documentation')} className="device-dashboard-home-card">
              <Row gutter={[8, 8]}>
                {docLinks.length === 0 ? (
                  <Col span={24}>
                    <Text type="secondary">
                      {t('energyDeviceDashboard.noDocLinks', 'No documentation links')}
                    </Text>
                  </Col>
                ) : (
                  docLinks.map((item, idx) => (
                    <Col key={idx} span={24}>
                      <ContentCard>
                        <Space>
                          <RightOutlined />
                          <Text>{(item.title as string) ?? (item.name as string) ?? '-'}</Text>
                        </Space>
                      </ContentCard>
                    </Col>
                  ))
                )}
              </Row>
            </Card>
          </Col>
          <Col span={8} className="device-dashboard-home-col">
            <Card title={t('energyDeviceDashboard.usage', 'Usage')} className="device-dashboard-home-card">
              <List size="small">
                <List.Item>
                  <Space>
                    <Tag color="blue">Devices</Tag>
                    <Text>
                      {extractUsageCount((usage as { devices?: unknown } | null)?.devices) ??
                        (home?.totalDevices as number | undefined) ??
                        0}
                    </Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Space>
                    <Tag color="green">Assets</Tag>
                    <Text>
                      {extractUsageCount((usage as { assets?: unknown } | null)?.assets) ?? 0}
                    </Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Space>
                    <Tag color="purple">Users</Tag>
                    <Text>
                      {extractUsageCount((usage as { users?: unknown } | null)?.users) ?? 0}
                    </Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Space>
                    <Tag color="cyan">Dashboards</Tag>
                    <Text>
                      {extractUsageCount((usage as { dashboards?: unknown } | null)?.dashboards) ?? 0}
                    </Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Space>
                    <Tag color="orange">Customers</Tag>
                    <Text>
                      {extractUsageCount((usage as { customers?: unknown } | null)?.customers) ?? 0}
                    </Text>
                  </Space>
                </List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      </Spin>
    </PageContainer>
  )
}
