import { useState } from 'react'
import {
  Row,
  Col,
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
  ToolOutlined,
  WifiOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard, FilterBar } from '@/components'
import { useBuildingStore } from '@/stores'

const { Text } = Typography
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
    <ContentCard
      size="small"
      className="item_kpi-card"
      bodyStyle={{ padding: '20px' }}
    >
      <div className="item_kpi-row">
        <div
          className="item_kpi-icon-box"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <Text type="secondary" className="text-sm">{title}</Text>
          <div className="item_kpi-value-row">
            <span className="item_kpi-value">
              {value}
            </span>
            {suffix && (
              <span className="text-md font-medium text-muted">{suffix}</span>
            )}
          </div>
          {subText && (
            <Text className="text-11 mt-2" style={{ color: subColor || '#8c8c8c' }}>
              {subText}
            </Text>
          )}
        </div>
      </div>
    </ContentCard>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function ItemControl() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [_siteFilter, setSiteFilter] = useState('all')
  const [_floorFilter, setFloorFilter] = useState('all')

  return (
    <PageContainer>
      <PageHeader
        title={`${t('smartCabinet.title', 'Smart Lockers')} / ${t('smartCabinet.dashboard', 'Dashboard')}`}
        icon={<LockOutlined />}
        subtitle={`${selectedBuilding?.name || 'All sites'} — ${t('smartCabinet.lastUpdated', 'Last updated')}: ${new Date().toLocaleTimeString()}`}
        actions={
          <FilterBar>
            <Select
              defaultValue="all"
              className="vehicle_filter-select-w120"
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
              className="vehicle_filter-select-w120"
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
              className="vehicle_filter-select-w120"
              size="small"
              onChange={setFloorFilter}
              options={[
                { value: 'all', label: t('smartCabinet.allFloors', 'All Floors') },
                { value: '1', label: 'Floor 1' },
                { value: '2', label: 'Floor 2' },
                { value: '3', label: 'Floor 3' },
              ]}
            />
            <RangePicker size="small" className="energy_input-w260" />
            <Button size="small" icon={<ExportOutlined />}>
              {t('smartCabinet.export', 'Export')}
            </Button>
            <Tooltip title={t('smartCabinet.refresh', 'Refresh')}>
              <Button size="small" icon={<ReloadOutlined />} />
            </Tooltip>
          </FilterBar>
        }
      />

      {/* ── KPI Cards ────────────────────────────────── */}
      <Row gutter={[16, 16]} className="mb-20">
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
      <Row gutter={[16, 16]} className="mb-20">
        {/* Alerts */}
        <Col xs={24} lg={12}>
          <ContentCard
            title={<>{t('smartCabinet.alerts', 'Alerts')} <Text type="secondary" className="font-normal text-sm">({t('smartCabinet.attentionRequired', 'attention required')})</Text></>}
            titleIcon={<ExclamationCircleOutlined className="text-danger" />}
            size="small"
            className="rounded-xl h-full"
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="flex-col gap-12 flex">
              {alertKeys.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-12 rounded-md"
                  style={{
                    padding: '12px 16px',
                    background: alert.severity === 'critical' ? '#fff2f0' : '#fffbe6',
                    border: `1px solid ${alert.severity === 'critical' ? '#ffccc7' : '#ffe58f'}`,
                  }}
                >
                  <Badge
                    color={alert.color}
                    styles={{ indicator: { width: 10, height: 10 } }}
                  />
                  <Text className="flex-1 text-base font-medium">{t(alert.textKey)}</Text>
                  <Tag
                    color={alert.severity === 'critical' ? 'red' : 'orange'}
                    className="m-0 rounded-sm text-xs uppercase"
                  >
                    {t(`smartCabinet.${alert.severity}`)}
                  </Tag>
                </div>
              ))}
            </div>
          </ContentCard>
        </Col>

        {/* Health Overview */}
        <Col xs={24} lg={12}>
          <ContentCard
            title={t('smartCabinet.healthOverview', 'Health Overview')}
            titleIcon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            size="small"
            style={{ borderRadius: 16, height: '100%' }}
            bodyStyle={{ padding: '16px 20px' }}
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
          </ContentCard>
        </Col>
      </Row>

      {/* ── Recent Activities & Locker Grid ──────────── */}
      <Row gutter={[16, 16]}>
        {/* Recent Activities */}
        <Col xs={24} lg={10}>
          <ContentCard
            title={<>{t('smartCabinet.recentActivities', 'Recent Activities')} <Text type="secondary" className="font-normal text-sm">({t('smartCabinet.timeline', 'timeline')})</Text></>}
            titleIcon={<ClockCircleOutlined className="text-primary" />}
            size="small"
            className="rounded-xl h-full"
            bodyStyle={{ padding: '16px 20px', maxHeight: 420, overflowY: 'auto' }}
          >
            <Timeline
              items={activityKeys.map((act) => ({
                color: act.tagColor === 'red' ? 'red' : act.tagColor === 'green' ? 'green' : 'blue',
                children: (
                  <div className="flex items-start gap-8 flex-wrap">
                    <Tag
                      className="m-0 rounded-4 text-11 font-semibold font-mono text-center"
                      style={{ minWidth: 44 }}
                    >
                      {act.time}
                    </Tag>
                    <Text className="text-base flex-1">{t(act.textKey)}</Text>
                    <Tag
                      color={act.tagColor}
                      className="m-0 rounded-4 text-xs"
                    >
                      {t(act.tagKey)}
                    </Tag>
                  </div>
                ),
              }))}
            />
          </ContentCard>
        </Col>

        {/* Locker Grid */}
        <Col xs={24} lg={14}>
          <ContentCard
            title={<>{t('smartCabinet.lockerOverview', 'Locker Overview')} <Text type="secondary" className="font-normal text-sm">({kpiData.totalLockers} {t('smartCabinet.units', 'units')})</Text></>}
            titleIcon={<AppstoreOutlined style={{ color: '#722ed1' }} />}
            size="small"
            className="rounded-xl h-full"
            bodyStyle={{ padding: '16px 20px' }}
          >
            <Row gutter={[10, 10]}>
              {lockerList.map((locker) => (
                <Col xs={12} sm={8} md={6} key={locker.id}>
                  <div
                    className="rounded-lg cursor-pointer transition-all"
                    style={{
                      padding: '14px 12px',
                      background: !locker.online
                        ? 'linear-gradient(135deg, #fff2f0 0%, #ffebe8 100%)'
                        : locker.issues > 0
                        ? 'linear-gradient(135deg, #fffbe6 0%, #fff7e0 100%)'
                        : 'linear-gradient(135deg, #f6ffed 0%, #eeffdf 100%)',
                      border: `1px solid ${
                        !locker.online ? '#ffccc7' : locker.issues > 0 ? '#ffe58f' : '#b7eb8f'
                      }`,
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
                    <div className="flex-between mb-8">
                      <Text strong className="text-md">
                        {locker.online ? (
                          <UnlockOutlined className="mr-4 text-success" />
                        ) : (
                          <LockOutlined className="mr-4 text-danger" />
                        )}
                        {locker.id}
                      </Text>
                      <Badge
                        status={locker.online ? 'success' : 'error'}
                        text={
                          <span className="text-xs">
                            {locker.online
                              ? t('smartCabinet.online', 'Online')
                              : t('smartCabinet.offline', 'Offline')}
                          </span>
                        }
                      />
                    </div>

                    {/* Occupancy */}
                    <div className="mb-6">
                      <div className="flex-between text-11 text-muted mb-2">
                        <span>{t('smartCabinet.occupancy', 'Occupancy')}</span>
                        <span className="font-semibold item_text-dark">{locker.occupancy}%</span>
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
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
