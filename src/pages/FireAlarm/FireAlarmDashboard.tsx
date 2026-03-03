import { Row, Col, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import {
  CheckCircleOutlined,
  FireOutlined,
  WarningOutlined,
  MinusCircleOutlined,
  BellOutlined,
  AppstoreOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard, StatCard } from '@/components'

const STATUS_CARDS = [
  { key: 'normal', color: '#52c41a', Icon: CheckCircleOutlined, count: 128 },
  { key: 'fire', color: '#ff4d4f', Icon: FireOutlined, count: 3 },
  { key: 'fault', color: '#faad14', Icon: WarningOutlined, count: 5 },
  { key: 'offline', color: '#8c8c8c', Icon: MinusCircleOutlined, count: 7 },
] as const

const DEVICE_ICONS = {
  device_smoke_detector: FireOutlined,
  device_heat_detector: WarningOutlined,
  device_manual_call_point: BellOutlined,
  device_control_panel: AppstoreOutlined,
} as const

const DEVICE_ROWS = [
  { deviceKey: 'device_smoke_detector', typeKey: 'device_smoke_detector', locationKey: 'location_office101', status: 'normal' },
  { deviceKey: 'device_heat_detector', typeKey: 'device_heat_detector', locationKey: 'location_serverRoom', status: 'fault' },
  { deviceKey: 'device_manual_call_point', typeKey: 'device_manual_call_point', locationKey: 'location_hallway2', status: 'fire' },
  { deviceKey: 'device_control_panel', typeKey: 'device_control_panel', locationKey: 'location_lobby', status: 'offline' },
]

export default function FireAlarmDashboard() {
  const { t } = useTranslation()

  const columns: ColumnsType<typeof DEVICE_ROWS[0]> = [
    {
      title: t('fireAlarm.device', 'Device'),
      dataIndex: 'deviceKey',
      key: 'device',
      render: (_, record) => {
        const Icon = (DEVICE_ICONS as Record<string, typeof ApiOutlined>)[record.deviceKey] ?? ApiOutlined
        return (
          <span className="flex items-center gap-2">
            <Icon style={{ color: 'var(--ant-color-text-secondary)' }} />
            {t(`fireAlarm.${record.deviceKey}`, record.deviceKey)}
          </span>
        )
      },
    },
    {
      title: t('common.type', 'Type'),
      dataIndex: 'typeKey',
      key: 'type',
      render: (key: string) => t(`fireAlarm.${key}`, key),
    },
    {
      title: t('common.location', 'Location'),
      dataIndex: 'locationKey',
      key: 'location',
      render: (key: string) => t(`fireAlarm.${key}`, key),
    },
    {
      title: t('common.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={status === 'fire' ? { color: '#ff4d4f', fontWeight: 600 } : undefined}>
          {t(`fireAlarm.status_${status}`, status)}
        </span>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('fireAlarm.dashboardTitle', 'Fire Alarm Monitoring Dashboard')}
        subtitle={t('fireAlarm.subtitle', 'Monitor and manage the fire alarm system')}
      />

      <Row gutter={[16, 16]} className="mb-4">
        {STATUS_CARDS.map(({ key, color, Icon, count }) => (
          <Col xs={24} sm={12} md={6} key={key}>
            <StatCard
              title={t(`fireAlarm.status_${key}`, key)}
              value={count}
              suffix={t('fireAlarm.devicesSuffix', ' Devices')}
              icon={<Icon style={{ color: '#fff', fontSize: 20 }} />}
              iconBgColor={color}
            />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col flex="0 0 auto">
          <span className="text-secondary mr-2">{t('fireAlarm.buildingLabel', 'Building')}:</span>
        </Col>
        <Col xs={24} md={6}>
          <Select placeholder={t('fireAlarm.selectBuilding', 'Select Building')} style={{ width: '100%' }} allowClear />
        </Col>
        <Col xs={24} md={6}>
          <Select placeholder={t('fireAlarm.selectFloor', 'Select Floor')} style={{ width: '100%' }} allowClear />
        </Col>
        <Col xs={24} md={6}>
          <Select placeholder={t('fireAlarm.selectZone', 'Select Zone')} style={{ width: '100%' }} allowClear />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ContentCard title={t('fireAlarm.deviceStatus', 'Device Status')}>
            <Table
              size="small"
              rowKey="deviceKey"
              columns={columns}
              dataSource={DEVICE_ROWS}
              pagination={false}
            />
          </ContentCard>
        </Col>
        <Col xs={24} lg={12}>
          <ContentCard title={t('fireAlarm.floorMap', 'Floor Map')}>
            <div className="fire-alarm-floor-map">
              <svg className="fire-alarm-floor-svg" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid meet">
                {/* Walls / room outlines – thin gray lines */}
                <defs>
                  <pattern id="floor-fill" patternUnits="userSpaceOnUse" width="8" height="8">
                    <path d="M0 0h8v8H0z" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
                  </pattern>
                  <symbol id="icon-fan" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="currentColor" strokeWidth="1" />
                    <path d="M7 7l3 3M14 14l3 3M14 7l-3 3M7 14l3-3" stroke="currentColor" strokeWidth="1" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </symbol>
                  <symbol id="icon-smoke" viewBox="0 0 20 20">
                    <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1" />
                    <path d="M10 6l-2 4h4l-2-4z" fill="currentColor" opacity="0.8" />
                  </symbol>
                  <symbol id="icon-panel" viewBox="0 0 48 24">
                    <rect x="2" y="4" width="44" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="24" y="16" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor" fontFamily="system-ui,sans-serif">PANEL</text>
                  </symbol>
                  <symbol id="icon-manual" viewBox="0 0 20 20">
                    <rect x="2" y="2" width="16" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="6" y="8" width="8" height="4" rx="1" fill="currentColor" />
                  </symbol>
                </defs>
                {/* Rooms */}
                <rect x="10" y="10" width="85" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="105" y="10" width="85" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="200" y="10" width="90" height="70" fill="#ff4d4f" stroke="#ff7875" strokeWidth="1" />
                <rect x="300" y="10" width="90" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="10" y="90" width="85" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="105" y="90" width="85" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="200" y="90" width="90" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="300" y="90" width="90" height="70" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                {/* Corridor (horizontal) */}
                <rect x="10" y="168" width="380" height="42" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                {/* Bottom rooms */}
                <rect x="10" y="218" width="120" height="92" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="140" y="218" width="120" height="92" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                <rect x="270" y="218" width="120" height="92" fill="url(#floor-fill)" stroke="#d9d9d9" strokeWidth="1" />
                {/* Door arcs */}
                <path d="M95 78 Q105 78 105 88" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M190 78 Q200 78 200 88" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M290 78 Q300 78 300 88" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M95 168 Q105 168 105 158" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M200 168 Q210 168 210 158" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M130 210 Q130 218 140 218" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                <path d="M260 210 Q260 218 270 218" fill="none" stroke="#d9d9d9" strokeWidth="1" />
                {/* Flame in alarm room (upper-middle) */}
                <g transform="translate(245, 45)">
                  <path d="M0 -18 Q8 -8 6 4 Q4 12 0 18 Q-4 12 -6 4 Q-8 -8 0 -18z" fill="#fff" opacity="0.95" />
                </g>
                {/* Fans (4) – top-left, below it, lower-mid-left, mid-right below fire */}
                <use href="#icon-fan" x="35" y="35" width="28" height="28" className="fire-alarm-device-icon" />
                <use href="#icon-fan" x="35" y="115" width="28" height="28" className="fire-alarm-device-icon" />
                <use href="#icon-fan" x="125" y="195" width="28" height="28" className="fire-alarm-device-icon" />
                <use href="#icon-fan" x="315" y="115" width="28" height="28" className="fire-alarm-device-icon" />
                {/* PANEL (2) – left room, bottom-right */}
                <use href="#icon-panel" x="42" y="228" width="56" height="28" className="fire-alarm-device-icon" />
                <use href="#icon-panel" x="302" y="258" width="56" height="28" className="fire-alarm-device-icon" />
                {/* Smoke detectors – top-right, bottom-middle */}
                <use href="#icon-smoke" x="325" y="35" width="24" height="24" className="fire-alarm-device-icon" />
                <use href="#icon-smoke" x="198" y="228" width="24" height="24" className="fire-alarm-device-icon" />
                {/* Manual pull station – right of fire zone */}
                <use href="#icon-manual" x="298" y="48" width="24" height="24" className="fire-alarm-device-icon" />
              </svg>
            </div>
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
