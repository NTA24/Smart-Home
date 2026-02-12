import { useState } from 'react'
import { Row, Col, Card, Typography, Select, Tag, Badge, Tabs } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ThunderboltOutlined,
  TeamOutlined,
  WarningOutlined,
  ToolOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  RiseOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { PieChart, LineChart } from '@/components'
import { useBuildingStore } from '@/stores'
import building3dImage from '@/assets/building-3d.png'

const { Text } = Typography

// Stat Card with Icon
function StatCard({
  icon,
  iconBg,
  title,
  value,
  unit,
  subText,
  trend,
  trendUp,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  unit?: string
  subText?: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card 
      size="small" 
      style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block' }}>{title}</Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e' }}>{value}</span>
            {unit && <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>{unit}</span>}
          </div>
          {subText && (
            <div style={{ fontSize: 11, color: trendUp !== undefined ? (trendUp ? '#52c41a' : '#f5222d') : '#8c8c8c', marginTop: 2 }}>
              {trendUp !== undefined && (trendUp ? '▲ ' : '▼ ')}
              {subText}
              {trend && (
                <span style={{ marginLeft: 6 }}>
                  {trend}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Alarm Count Badge
function AlarmCount({ count, label, color, bgColor }: { count: number; label: string; color: string; bgColor: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 8, 
        background: bgColor, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        margin: '0 auto 4px'
      }}>
        {count}
      </div>
      <Text style={{ fontSize: 10, color: '#8c8c8c' }}>{label}</Text>
    </div>
  )
}

// Alert Item
function AlertItem({ 
  type, 
  title, 
  location, 
  status,
  extra
}: { 
  type: 'A' | 'B'
  title: string
  location: string
  status?: string
  extra?: string
}) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 10, 
      padding: '10px 0',
      borderBottom: '1px solid #f5f5f5'
    }}>
      <div style={{ 
        width: 24, 
        height: 24, 
        borderRadius: 4, 
        background: type === 'A' ? '#ff4d4f' : '#faad14',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0
      }}>
        {type}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{location}</div>
        {extra && <div style={{ fontSize: 10, color: '#bfbfbf', marginTop: 2 }}>{extra}</div>}
      </div>
      {status && (
        <Tag color="green" style={{ fontSize: 10, margin: 0 }}>● {status}</Tag>
      )}
    </div>
  )
}

// Zone Info Card
function ZoneInfo({ zone, temp, power, co2 }: { zone: string; temp: string; power: string; co2?: string }) {
  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 8, 
      padding: 10, 
      border: '1px solid #e8e8e8',
      fontSize: 11
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <EnvironmentOutlined style={{ color: '#1890ff' }} />
        <span style={{ fontWeight: 600 }}>{zone}</span>
      </div>
      <div style={{ color: '#8c8c8c' }}>
        🌡 {temp} &nbsp; ⚡ {power}
        {co2 && <span> &nbsp; CO2: {co2}</span>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()
  const [activeTab, setActiveTab] = useState('energy')

  // Energy breakdown data
  const energyBreakdownData = [
    { name: 'HVAC', value: 64, color: '#1890ff' },
    { name: 'Lighting', value: 20, color: '#faad14' },
    { name: 'Plug Load', value: 10, color: '#52c41a' },
    { name: 'Other', value: 6, color: '#722ed1' },
  ]

  // Asset health chart data
  const assetCategories = ['2:00', '6:00', '10:00', '14:00', '16:00', '2']
  const assetSeries = [
    { name: 'kWh', data: [80, 120, 180, 220, 200, 160], color: '#1890ff' }
  ]

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header with Filters */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EnvironmentOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <Select defaultValue="main" style={{ width: 180 }} size="middle">
              <Select.Option value="main">{t('dashboard.mainOfficeBuilding')}</Select.Option>
              <Select.Option value="tower">Viettel Tower</Select.Option>
            </Select>
          </div>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">{t('dashboard.allFloors')}</Select.Option>
            <Select.Option value="1">{t('dashboard.floor')} 1</Select.Option>
            <Select.Option value="2">{t('dashboard.floor')} 2</Select.Option>
          </Select>
          <Select defaultValue="today" style={{ width: 100 }}>
            <Select.Option value="today">{t('dashboard.today')}</Select.Option>
            <Select.Option value="week">{t('dashboard.thisWeek')}</Select.Option>
          </Select>
          <Select defaultValue="10" style={{ width: 100 }}>
            <Select.Option value="10">10 {t('dashboard.day')}</Select.Option>
            <Select.Option value="30">30 {t('dashboard.day')}</Select.Option>
          </Select>
          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
            <ClockCircleOutlined /> {t('dashboard.lastUpdated')}: 11:25
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[t('menu.energy'), t('menu.comfort'), t('menu.safety'), t('menu.operations')].map((tab, i) => (
            <Tag 
              key={tab}
              color={i === 0 ? 'blue' : undefined}
              style={{ 
                cursor: 'pointer', 
                padding: '4px 12px',
                borderRadius: 6,
                fontWeight: i === 0 ? 600 : 400
              }}
            >
              {tab}
            </Tag>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<ThunderboltOutlined />}
            iconBg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            title={t('dashboard.powerNow')}
            value="168"
            unit="kW"
            subText={`${t('dashboard.peak')}: 264 kW`}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<ThunderboltOutlined />}
            iconBg="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            title={t('dashboard.todayEnergy')}
            value="1,542"
            unit="kWh"
            subText={t('dashboard.sinceYesterday', { percent: '5,2' })}
            trendUp={true}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <StatCard
            icon={<TeamOutlined />}
            iconBg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            title={t('dashboard.occupancyNow')}
            value="432"
            unit={t('dashboard.people')}
            subText={`${t('dashboard.utilization')}: 67%`}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small" style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px 20px' }}>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{t('dashboard.iaqComfortIndex')}</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e' }}>92</span>
              <Tag color="success" style={{ borderRadius: 12, fontWeight: 600 }}>{t('dashboard.good')}</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small" style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px 20px' }}>
            <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{t('dashboard.openAlarms')}</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <AlarmCount count={3} label={t('dashboard.critical')} color="#fff" bgColor="#ff4d4f" />
              <AlarmCount count={3} label={t('dashboard.high')} color="#fff" bgColor="#fa8c16" />
              <AlarmCount count={2} label={t('dashboard.med')} color="#fff" bgColor="#fadb14" />
              <AlarmCount count={6} label={t('dashboard.low')} color="#1890ff" bgColor="#e6f7ff" />
              <AlarmCount count={15} label="" color="#8c8c8c" bgColor="#f5f5f5" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card size="small" style={{ borderRadius: 16, height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} bodyStyle={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{t('dashboard.workOrders')}</Text>
              <a style={{ fontSize: 11 }}>{t('dashboard.viewDetails')}</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div>
                <span style={{ 
                  background: '#52c41a', 
                  color: '#fff', 
                  padding: '2px 8px', 
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600 
                }}>5</span>
                <span style={{ fontSize: 12, marginLeft: 4 }}>5 {t('dashboard.open')}</span>
              </div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 600 }}>2</span>
                <span style={{ fontSize: 11, color: '#ff4d4f', marginLeft: 4 }}>{t('dashboard.overdue')}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[12, 12]} style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Left - Building Visualization */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Card 
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 16 }}
          >
            {/* Header with Building icon and Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EnvironmentOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{t('dashboard.building')}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[t('dashboard.occupancy'), t('dashboard.temperature'), 'CO₂', t('dashboard.power')].map((tab, i) => (
                  <Tag 
                    key={tab}
                    color={i === 0 ? 'blue' : undefined}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: i === 0 ? 'none' : '1px solid #e8e8e8',
                      fontSize: 12
                    }}
                  >
                    {tab}
                  </Tag>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', color: '#8c8c8c' }}>⋮</span>
            </div>

            {/* Floor Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Tag style={{ 
                padding: '4px 12px', 
                borderRadius: 20,
                background: '#f5f5f5',
                border: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ fontSize: 12 }}>①</span> {t('dashboard.first')}
              </Tag>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#8c8c8c' }}>🚩</span>
                <span style={{ color: '#8c8c8c' }}>❄️</span>
                <span style={{ color: '#8c8c8c' }}>📊</span>
              </div>
            </div>

            {/* Temperature Scale */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#8c8c8c' }}>&lt; 20°C</span>
              <div style={{ 
                flex: 1,
                maxWidth: 120,
                height: 6, 
                borderRadius: 3,
                background: 'linear-gradient(90deg, #1890ff 0%, #faad14 50%, #ff4d4f 100%)'
              }} />
              <span style={{ fontSize: 11, color: '#1890ff' }}>±74.7°C</span>
            </div>

            {/* 3D Building Visualization with Overlays */}
            <div style={{ 
              borderRadius: 12, 
              overflow: 'hidden',
              position: 'relative',
              background: '#f8fafc'
            }}>
              <img 
                src={building3dImage} 
                alt="Building 3D View" 
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  display: 'block'
                }} 
              />
              
              {/* Overlay Info Cards */}
              <div style={{ 
                position: 'absolute', 
                top: '20%', 
                left: '25%',
                background: '#fff',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '2px solid #faad14'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ 
                    background: '#faad14', 
                    color: '#fff', 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    fontSize: 10,
                    fontWeight: 600
                  }}>24%</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>26 kW</span>
                </div>
                <div style={{ fontSize: 11, color: '#52c41a', marginTop: 2 }}>{t('dashboard.occupied')} 10 {t('dashboard.people')}</div>
              </div>

              <div style={{ 
                position: 'absolute', 
                top: '15%', 
                right: '15%',
                background: '#fff',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '2px solid #52c41a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>23 kW</span>
                </div>
                <div style={{ fontSize: 11, color: '#52c41a', marginTop: 2 }}>{t('dashboard.occupied')} 8 {t('dashboard.people')}</div>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '35%', 
                left: '10%',
                background: '#1890ff',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>22 {t('dashboard.people')}</span>
                </div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.9 }}>{t('dashboard.occupied')} 12 {t('dashboard.people')}</div>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: '30%', 
                left: '40%',
                background: '#13c2c2',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>14 {t('dashboard.people')}</span>
                </div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.9 }}>{t('dashboard.occupied')} 12 {t('dashboard.people')}</div>
              </div>

              {/* Zone Info Panel */}
              <div style={{ 
                position: 'absolute', 
                bottom: 12, 
                right: 12,
                background: '#fff',
                borderRadius: 10,
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: 12,
                minWidth: 160
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{t('dashboard.zone')} A</span>
                  </div>
                  <span style={{ color: '#52c41a', fontSize: 11, fontWeight: 500 }}>⚡ 4:07 E</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  color: '#52c41a', 
                  marginBottom: 8,
                  padding: '4px 8px',
                  background: '#f6ffed',
                  borderRadius: 6
                }}>
                  <span>🌡</span>
                  <span style={{ fontWeight: 500 }}>23.3°C / ≈ 74°F</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#8c8c8c' }}>{t('dashboard.power')}</span>
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>5.9 kW</span>
                  </div>
                  <div style={{ 
                    background: '#e6f7ff', 
                    padding: '2px 6px', 
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#1890ff',
                    fontWeight: 500
                  }}>
                    📊 5%
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Temperature Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  width: 40,
                  height: 6, 
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)'
                }} />
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>&gt; 20°C</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  width: 40,
                  height: 6, 
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #faad14 0%, #ff4d4f 100%)'
                }} />
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>≈ 25°C</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Center - Alerts & Energy */}
        <Col xs={24} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Live Alerts Feed */}
          <Card 
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.liveAlertsFeed')}</span>}
            extra={<a>&gt;</a>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12, flex: 1 }}
            bodyStyle={{ padding: 12 }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag color="red">{t('dashboard.critical')}</Tag>
              <Tag>{t('dashboard.high')}</Tag>
              <Tag color="green">✓ {t('dashboard.acknowledged')}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>
              🕐 2 Apm -234
            </div>

            {/* HVAC Stats */}
            <div style={{ 
              background: '#f5f7fa', 
              borderRadius: 8, 
              padding: 12,
              marginBottom: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Badge status="processing" />
                <span style={{ fontWeight: 600 }}>{t('dashboard.hvac')}</span>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>24 kWh</span>
                <Tag color="blue" style={{ marginLeft: 'auto' }}>▲ 88%</Tag>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>1,542 kWh</div>
            </div>

            {/* Energy Legend */}
            <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
              <span><span style={{ color: '#1890ff' }}>■</span> {t('dashboard.hvac')}</span>
              <span><span style={{ color: '#faad14' }}>■</span> {t('dashboard.lighting')}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, marginTop: 4 }}>
              <span><span style={{ color: '#52c41a' }}>■</span> 20% kWh</span>
              <span><span style={{ color: '#722ed1' }}>■</span> {t('dashboard.other')}</span>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <a style={{ fontSize: 11 }}>{t('dashboard.today')} &gt;</a>
            </div>
          </Card>

          {/* Bottom Stats */}
          <Card 
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={8}>
              <Col span={8} style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>2</div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.technicians')}</div>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <ToolOutlined style={{ fontSize: 18, color: '#faad14' }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>9</div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.pendingTasks')}</div>
              </Col>
              <Col span={8} style={{ textAlign: 'center' }}>
                <WarningOutlined style={{ fontSize: 18, color: '#ff4d4f' }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>2</div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.urgentAlerts')}</div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right - Alerts List */}
        <Col xs={24} lg={6} style={{ display: 'flex' }}>
          <Card 
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <AlertItem 
              type="A" 
              title={t('dashboard.waterLeakDetected')} 
              location={`B4 ${t('dashboard.electricalRoom')}`}
              status={t('dashboard.open')}
            />
            <AlertItem 
              type="A" 
              title={t('dashboard.highCo2Level')} 
              location={t('dashboard.meetingRoomB')}
              extra="⚡ 7 kWh"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.ahuFaultChillerPumpFail')} 
              location={`B1 AHU-2 - ${t('dashboard.ticketInProgress')}`}
              extra="⏱ 5 in age"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.ahuFaultChillerPumpFail')} 
              location={`B1 AHU-2 - ${t('dashboard.ticketInProgress')}`}
              extra="⏱ 5 in age"
            />
            <AlertItem 
              type="B" 
              title={t('dashboard.accessDeniedRepeatedly')} 
              location={t('dashboard.lobbyMainEntrance')}
              status={t('dashboard.open')}
            />

          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[12, 12]} style={{ marginTop: 12, display: 'flex', alignItems: 'stretch' }}>
        {/* Asset Health */}
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card 
            title={<><span style={{ fontWeight: 600 }}>{t('dashboard.assetHealth')}</span> <Tag>{t('dashboard.today')}</Tag></>}
            extra={<div><Tag>KW</Tag> <Tag color="blue">kWh</Tag></div>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>
              <span style={{ color: '#1890ff' }}>●</span> {t('dashboard.kwhAccumulated')} &nbsp;
              <span style={{ color: '#52c41a' }}>●</span> kWh ■ {t('dashboard.kwhAccumulated')}
            </div>
            <LineChart title="" categories={assetCategories} series={assetSeries} height={120} showArea={true} />
            <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>
              &gt; 00°C
            </div>
          </Card>
        </Col>

        {/* Energy Breakdown */}
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card 
            title={<><span style={{ fontWeight: 600 }}>{t('dashboard.energyBreakdown')}</span></>}
            extra={<span style={{ fontSize: 11, color: '#8c8c8c' }}>{t('dashboard.today')} ☁</span>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Text style={{ fontSize: 11, color: '#8c8c8c' }}>{t('dashboard.todaysEnergy')}</Text>
            <Row gutter={12} style={{ marginTop: 8 }}>
              <Col span={14}>
                <div style={{ fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span><span style={{ color: '#1890ff' }}>■</span> {t('dashboard.hvac')}</span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>64%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span><span style={{ color: '#faad14' }}>■</span> {t('dashboard.lighting')}</span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>20%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span><span style={{ color: '#52c41a' }}>■</span> {t('dashboard.plugLoad')}</span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>10%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><span style={{ color: '#722ed1' }}>■</span> {t('dashboard.other')}</span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>6%</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <PieChart title="" data={energyBreakdownData} height={130} showLegend={false} innerRadius="50%" outerRadius="85%" />
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: 8, color: '#8c8c8c' }}>304 kWh</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#52c41a' }}>1,542 kWh</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* HVAC Performance */}
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card 
            title={<span style={{ fontWeight: 600 }}>{t('dashboard.hvacPerformance')}</span>}
            extra={<span style={{ fontSize: 14 }}>✏ ○</span>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>23<span style={{ fontSize: 14 }}>°C</span></div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>▲ O%T</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>23.6<span style={{ fontSize: 14 }}>°C</span></div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>
              {t('dashboard.setpoint')}: &lt;23°C
            </div>
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.ahus')}</div>
                  <div style={{ fontWeight: 600 }}>🏃 4/5 {t('dashboard.running')}</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.chillers')}</div>
                  <div style={{ fontWeight: 600 }}>🏃 2/2 {t('dashboard.running')}</div>
                </div>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12, fontSize: 11, color: '#8c8c8c' }}>
              <span>🔧 4.05</span>
              <span>📊 23</span>
              <span>📁 13</span>
            </div>
          </Card>
        </Col>

        {/* Parking & EV Charging */}
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card 
            title={<><span style={{ fontWeight: 600 }}>{t('dashboard.parkingEvCharging')}</span></>}
            style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%' }}
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{t('dashboard.availableSpots')}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>85</div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{t('dashboard.totalInOut')}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>178</div>
              </Col>
            </Row>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8, padding: '8px', background: '#f5f7fa', borderRadius: 6 }}>
              {t('dashboard.vehiclesIn')}: <strong>178</strong> | {t('dashboard.vehiclesOutLabel')}: <strong>162</strong>
            </div>
            
            {/* EV Charging Status */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>{t('dashboard.evChargingStatus')}</div>
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                justifyContent: 'center'
              }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ 
                    width: 36, 
                    height: 24, 
                    background: i <= 3 ? '#1890ff' : '#e8e8e8',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CarOutlined style={{ color: i <= 3 ? '#fff' : '#8c8c8c', fontSize: 14 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6, fontSize: 10, color: '#8c8c8c' }}>
                <span><span style={{ color: '#1890ff' }}>●</span> {t('dashboard.charging')}: 3</span>
                <span><span style={{ color: '#e8e8e8' }}>●</span> {t('dashboard.availableChargers')}: 2</span>
              </div>
            </div>
            
            {/* Summary */}
            <Row gutter={8} style={{ marginTop: 12 }}>
              <Col span={12}>
                <div style={{ background: '#f5f7fa', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.totalVehicles')}</div>
                  <div style={{ fontWeight: 600 }}>🚗 252</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#e6f7ff', borderRadius: 6, padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8c8c8c' }}>{t('dashboard.evPower')}</div>
                  <div style={{ fontWeight: 600, color: '#1890ff' }}>⚡ 262 kW</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
