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
  Timeline,
  Progress,
  Tooltip,
  DatePicker,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  AppstoreOutlined,
  ExportOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  ToolOutlined,
  WifiOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// ─── Mock Data ──────────────────────────────────────────────
const kpiData = {
  totalLockers: 12,
  totalCells: 480,
  occupancyPercent: 68,
  incidents: 7,
}

const alertKeys = [
  { color: '#ff4d4f', textKey: 'smartCabinet.alert1', severity: 'critical' },
  { color: '#faad14', textKey: 'smartCabinet.alert2', severity: 'warning' },
  { color: '#ff4d4f', textKey: 'smartCabinet.alert3', severity: 'critical' },
]

const healthOverview = {
  online: 11,
  offline: 1,
  doorJam: 2,
  openFail: 1,
  firmwareOutdated: 4,
}

const activityKeys = [
  { time: '10:32', textKey: 'smartCabinet.activity1', tagKey: 'smartCabinet.tagQR', tagColor: 'blue' },
  { time: '10:28', textKey: 'smartCabinet.activity2', tagKey: 'smartCabinet.tagDelivery', tagColor: 'green' },
  { time: '10:20', textKey: 'smartCabinet.activity3', tagKey: 'smartCabinet.tagLogged', tagColor: 'orange' },
  { time: '10:11', textKey: 'smartCabinet.activity4', tagKey: 'smartCabinet.tagAlert', tagColor: 'red' },
  { time: '10:05', textKey: 'smartCabinet.activity5', tagKey: 'smartCabinet.tagSystem', tagColor: 'purple' },
  { time: '09:58', textKey: 'smartCabinet.activity6', tagKey: 'smartCabinet.tagExpired', tagColor: 'volcano' },
]

const lockerList = [
  { id: 'L-1', cells: 40, online: true, occupancy: 75, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-2', cells: 40, online: true, occupancy: 82, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-3', cells: 40, online: false, occupancy: 60, issues: 1, firmware: 'v2.3.0' },
  { id: 'L-4', cells: 40, online: true, occupancy: 55, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-5', cells: 40, online: true, occupancy: 90, issues: 1, firmware: 'v2.4.1' },
  { id: 'L-6', cells: 40, online: true, occupancy: 45, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-7', cells: 40, online: true, occupancy: 70, issues: 0, firmware: 'v2.3.0' },
  { id: 'L-8', cells: 40, online: true, occupancy: 65, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-9', cells: 40, online: true, occupancy: 50, issues: 1, firmware: 'v2.3.0' },
  { id: 'L-10', cells: 40, online: true, occupancy: 72, issues: 0, firmware: 'v2.3.0' },
  { id: 'L-11', cells: 40, online: true, occupancy: 80, issues: 0, firmware: 'v2.4.1' },
  { id: 'L-12', cells: 40, online: true, occupancy: 63, issues: 0, firmware: 'v2.4.1' },
]

// ─── KPI Card ───────────────────────────────────────────────
function KpiCard({
  icon,
  iconBg,
  title,
  value,
  suffix,
  subText,
  subColor,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  suffix?: string
  subText?: string
  subColor?: string
}) {
  return (
    <Card
      size="small"
      style={{
        borderRadius: 16,
        height: '100%',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      styles={{ body: { padding: '20px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
              {value}
            </span>
            {suffix && (
              <span style={{ fontSize: 14, fontWeight: 500, color: '#8c8c8c' }}>{suffix}</span>
            )}
          </div>
          {subText && (
            <Text style={{ fontSize: 11, color: subColor || '#8c8c8c', marginTop: 2 }}>
              {subText}
            </Text>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function ItemControl() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [_siteFilter, setSiteFilter] = useState('all')
  const [_floorFilter, setFloorFilter] = useState('all')

  return (
    <div style={{ padding: 0 }}>
      {/* ── Header ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LockOutlined />
            {t('smartCabinet.title', 'Smart Lockers')} / {t('smartCabinet.dashboard', 'Dashboard')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {selectedBuilding?.name || 'All sites'} — {t('smartCabinet.lastUpdated', 'Last updated')}: {new Date().toLocaleTimeString()}
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            size="small"
            onChange={setSiteFilter}
            options={[
              { value: 'all', label: t('smartCabinet.allSites', 'All Sites') },
              { value: 'site-a', label: 'Site A' },
              { value: 'site-b', label: 'Site B' },
            ]}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            size="small"
            placeholder={t('smartCabinet.building', 'Building')}
            options={[
              { value: 'all', label: t('smartCabinet.allBuildings', 'All Buildings') },
              { value: 'b1', label: 'Building 1' },
              { value: 'b2', label: 'Building 2' },
            ]}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            size="small"
            onChange={setFloorFilter}
            options={[
              { value: 'all', label: t('smartCabinet.allFloors', 'All Floors') },
              { value: '1', label: 'Floor 1' },
              { value: '2', label: 'Floor 2' },
              { value: '3', label: 'Floor 3' },
            ]}
          />
          <RangePicker size="small" style={{ width: 220 }} />
          <Button size="small" icon={<ExportOutlined />}>
            {t('smartCabinet.export', 'Export')}
          </Button>
          <Tooltip title={t('smartCabinet.refresh', 'Refresh')}>
            <Button size="small" icon={<ReloadOutlined />} />
          </Tooltip>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<LockOutlined />}
            iconBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title={t('smartCabinet.totalLockers', 'Total Lockers')}
            value={kpiData.totalLockers}
            subText={`${healthOverview.online} ${t('smartCabinet.online', 'online')}, ${healthOverview.offline} ${t('smartCabinet.offline', 'offline')}`}
            subColor="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<AppstoreOutlined />}
            iconBg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            title={t('smartCabinet.totalCells', 'Total Cells')}
            value={kpiData.totalCells}
            subText={`${Math.round(kpiData.totalCells * kpiData.occupancyPercent / 100)} ${t('smartCabinet.inUse', 'in use')}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<SyncOutlined />}
            iconBg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            title={t('smartCabinet.occupancy', 'Occupancy %')}
            value={kpiData.occupancyPercent}
            suffix="%"
            subText={`↑ 3% ${t('smartCabinet.vsYesterday', 'vs yesterday')}`}
            subColor="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<WarningOutlined />}
            iconBg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            title={t('smartCabinet.incidents', 'Incidents')}
            value={kpiData.incidents}
            suffix={t('smartCabinet.open', 'open')}
            subText={`2 ${t('smartCabinet.critical', 'critical')}, 5 ${t('smartCabinet.warning', 'warning')}`}
            subColor="#ff4d4f"
          />
        </Col>
      </Row>

      {/* ── Alerts & Health Overview ─────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Alerts */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                {t('smartCabinet.alerts', 'Alerts')}
                <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                  ({t('smartCabinet.attentionRequired', 'attention required')})
                </Text>
              </span>
            }
            size="small"
            style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alertKeys.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: alert.severity === 'critical' ? '#fff2f0' : '#fffbe6',
                    border: `1px solid ${alert.severity === 'critical' ? '#ffccc7' : '#ffe58f'}`,
                  }}
                >
                  <Badge
                    color={alert.color}
                    styles={{ indicator: { width: 10, height: 10 } }}
                  />
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t(alert.textKey)}</Text>
                  <Tag
                    color={alert.severity === 'critical' ? 'red' : 'orange'}
                    style={{ margin: 0, borderRadius: 6, fontSize: 10, textTransform: 'uppercase' }}
                  >
                    {t(`smartCabinet.${alert.severity}`)}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Health Overview */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                {t('smartCabinet.healthOverview', 'Health Overview')}
              </span>
            }
            size="small"
            style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={[12, 16]}>
              {[
                {
                  label: t('smartCabinet.online', 'Online'),
                  value: healthOverview.online,
                  icon: <WifiOutlined />,
                  color: '#52c41a',
                  bg: '#f6ffed',
                },
                {
                  label: t('smartCabinet.offline', 'Offline'),
                  value: healthOverview.offline,
                  icon: <CloseCircleOutlined />,
                  color: '#ff4d4f',
                  bg: '#fff2f0',
                },
                {
                  label: t('smartCabinet.doorJam', 'Door Jam'),
                  value: healthOverview.doorJam,
                  icon: <ToolOutlined />,
                  color: '#faad14',
                  bg: '#fffbe6',
                },
                {
                  label: t('smartCabinet.openFail', 'Open Fail'),
                  value: healthOverview.openFail,
                  icon: <CloseCircleOutlined />,
                  color: '#ff7a45',
                  bg: '#fff7e6',
                },
                {
                  label: t('smartCabinet.firmwareOutdated', 'Firmware Outdated'),
                  value: healthOverview.firmwareOutdated,
                  icon: <ExclamationCircleOutlined />,
                  color: '#722ed1',
                  bg: '#f9f0ff',
                },
              ].map((item, idx) => (
                <Col xs={12} sm={8} key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: item.bg,
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <div style={{ fontSize: 18, color: item.color }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: item.color, lineHeight: 1 }}>
                        {item.value}
                      </div>
                      <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{item.label}</Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Recent Activities & Locker Grid ──────────── */}
      <Row gutter={[16, 16]}>
        {/* Recent Activities */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#1890ff' }} />
                {t('smartCabinet.recentActivities', 'Recent Activities')}
                <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                  ({t('smartCabinet.timeline', 'timeline')})
                </Text>
              </span>
            }
            size="small"
            style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '16px 20px', maxHeight: 420, overflowY: 'auto' } }}
          >
            <Timeline
              items={activityKeys.map((act) => ({
                color: act.tagColor === 'red' ? 'red' : act.tagColor === 'green' ? 'green' : 'blue',
                children: (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        minWidth: 44,
                        textAlign: 'center',
                      }}
                    >
                      {act.time}
                    </Tag>
                    <Text style={{ fontSize: 13, flex: 1 }}>{t(act.textKey)}</Text>
                    <Tag
                      color={act.tagColor}
                      style={{ margin: 0, borderRadius: 4, fontSize: 10 }}
                    >
                      {t(act.tagKey)}
                    </Tag>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* Locker Grid */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AppstoreOutlined style={{ color: '#722ed1' }} />
                {t('smartCabinet.lockerOverview', 'Locker Overview')}
                <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                  ({kpiData.totalLockers} {t('smartCabinet.units', 'units')})
                </Text>
              </span>
            }
            size="small"
            style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={[10, 10]}>
              {lockerList.map((locker) => (
                <Col xs={12} sm={8} md={6} key={locker.id}>
                  <div
                    style={{
                      borderRadius: 12,
                      padding: '14px 12px',
                      background: !locker.online
                        ? 'linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%)'
                        : locker.issues > 0
                        ? 'linear-gradient(135deg, #fffbe6 0%, #fff7e0 100%)'
                        : 'linear-gradient(135deg, #f6ffed 0%, #eeffdf 100%)',
                      border: `1px solid ${
                        !locker.online ? '#ffccc7' : locker.issues > 0 ? '#ffe58f' : '#b7eb8f'
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <Text strong style={{ fontSize: 14 }}>
                        {locker.online ? (
                          <UnlockOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                        ) : (
                          <LockOutlined style={{ marginRight: 4, color: '#ff4d4f' }} />
                        )}
                        {locker.id}
                      </Text>
                      <Badge
                        status={locker.online ? 'success' : 'error'}
                        text={
                          <span style={{ fontSize: 10 }}>
                            {locker.online
                              ? t('smartCabinet.online', 'Online')
                              : t('smartCabinet.offline', 'Offline')}
                          </span>
                        }
                      />
                    </div>

                    {/* Occupancy */}
                    <div style={{ marginBottom: 6 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          color: '#8c8c8c',
                          marginBottom: 2,
                        }}
                      >
                        <span>{t('smartCabinet.occupancy', 'Occupancy')}</span>
                        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{locker.occupancy}%</span>
                      </div>
                      <Progress
                        percent={locker.occupancy}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          locker.occupancy > 85
                            ? '#ff4d4f'
                            : locker.occupancy > 60
                            ? '#faad14'
                            : '#52c41a'
                        }
                      />
                    </div>

                    {/* Footer info */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 10,
                        color: '#8c8c8c',
                      }}
                    >
                      <span>{locker.cells} cells</span>
                      <span>{locker.firmware}</span>
                    </div>

                    {/* Issues badge */}
                    {locker.issues > 0 && (
                      <Tag
                        color="warning"
                        style={{
                          margin: '6px 0 0',
                          borderRadius: 4,
                          fontSize: 10,
                        }}
                      >
                        <WarningOutlined /> {locker.issues} {t('smartCabinet.issue', 'issue')}
                      </Tag>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
