import { Row, Col, Card, Typography, Progress, theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  HomeOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BankOutlined,
  CloudOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { PieChart, BarChart, LineChart, GaugeChart } from '@/components'
import { useTabStore } from '@/stores'

const { Text } = Typography

// Component for View Details link
function ViewDetailsLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <a onClick={onClick} style={{ fontSize: 12, color: '#1890ff', cursor: 'pointer' }}>
      {label}
    </a>
  )
}

// Info Card Component
function InfoCard({
  icon,
  iconBg,
  title,
  value,
  suffix,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  suffix?: string
}) {
  const { token } = theme.useToken()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: token.colorTextSecondary, fontSize: 13 }}>{title}</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          {value}
          {suffix && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { addTab } = useTabStore()
  const { t } = useTranslation()

  const navigateToDetail = (path: string, label: string) => {
    addTab({ key: path, label, closable: true })
    navigate(path)
  }

  // Data for charts
  const enterpriseData = [
    { name: t('dashboard.enterprise'), value: 5.5 },
    { name: t('dashboard.enterprise'), value: 5.6 },
  ]

  const alarmCategories = ['Fire', 'Smoke', 'Gas', 'Door', 'Heat', 'Motion']
  const alarmData = [95000, 85000, 75000, 45000, 35000, 25000]

  const visitorCategories = ['06:00~08:00', '10:00~12:00', '14:00~16:00', '18:00~20:00', '22:00~00:00']
  const visitorSeries = [{ name: t('dashboard.visitorsToday'), data: [0, 0, 1, 0, 0], color: '#1890ff' }]

  const equipmentCategories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const equipmentSeries = [
    { name: t('common.online'), data: [400, 380, 420, 450, 410, 390, 420, 430, 400, 380, 410, 420], color: '#52c41a' },
    { name: t('common.offline'), data: [100, 120, 80, 50, 90, 110, 80, 70, 100, 120, 90, 80], color: '#faad14' },
    { name: t('common.alarm'), data: [20, 30, 25, 15, 20, 25, 20, 15, 20, 25, 20, 15], color: '#f5222d' },
  ]

  return (
    <div style={{ background: '#f0f2f5', margin: -16, padding: 16 }}>
      {/* Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={8}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.parkInfo')}</span></>}
            bordered={false}
            bodyStyle={{ padding: 16 }}
          >
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <InfoCard icon={<CalendarOutlined />} iconBg="#52c41a" title={t('dashboard.parkCreation')} value="2021" suffix={t('dashboard.year')} />
              </Col>
              <Col span={12}>
                <InfoCard icon={<EnvironmentOutlined />} iconBg="#52c41a" title={t('dashboard.areaOfLand')} value="15000.42" suffix={t('dashboard.squareMeters')} />
              </Col>
              <Col span={12}>
                <InfoCard icon={<BankOutlined />} iconBg="#1890ff" title={t('dashboard.building')} value="4" suffix={t('dashboard.buildings')} />
              </Col>
            </Row>
            <div style={{ marginTop: 24, borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <InfoCard icon={<HomeOutlined />} iconBg="#1890ff" title={t('dashboard.enterprise')} value="18" suffix={t('dashboard.enterprises')} />
                </Col>
                <Col span={8}>
                  <InfoCard icon={<TeamOutlined />} iconBg="#1890ff" title={t('dashboard.personnel')} value="1242" suffix={t('dashboard.people')} />
                </Col>
                <Col span={8}>
                  <InfoCard icon={<TeamOutlined />} iconBg="#faad14" title={t('dashboard.occupancyRate')} value="100" suffix="%" />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.parkSupport')}</span></>}
            bordered={false}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text>{t('dashboard.offices')}</Text>
                <div style={{ flex: 1, height: 20, background: '#1890ff', borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>38 {t('dashboard.rooms')}</Text>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: token.colorTextSecondary }}>{t('dashboard.newEnergyParking')}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid #1890ff' }} />
                <Text strong>16 {t('dashboard.spots')}</Text>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>{t('dashboard.parkingSpots')}</Text>
                <Text strong>355 {t('dashboard.spots')}</Text>
              </div>
              <Progress percent={88.9} strokeColor="#1890ff" />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.enterpriseProportion')}</span></>}
            bordered={false}
            bodyStyle={{ padding: 16 }}
          >
            <PieChart title="" data={enterpriseData} height={180} showLegend={true} />
          </Card>
        </Col>
      </Row>

      {/* Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.vehicleDynamics')}</span></>}
            bordered={false}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 140, height: 140, borderRadius: '50%', 
                border: '12px solid #e8e8e8', borderTopColor: '#1890ff', borderRightColor: '#1890ff', borderBottomColor: '#1890ff',
                margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              }}>
                <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>{t('dashboard.availableSpots')}</Text>
                <Text style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>47</Text>
              </div>
            </div>
            <Row gutter={16} style={{ marginTop: 24, textAlign: 'center' }}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CarOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{t('dashboard.vehiclesIn')}</div>
                    <div style={{ fontWeight: 600 }}><span style={{ fontSize: 20 }}>185</span> {t('dashboard.vehicles')}</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CarOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  <div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{t('dashboard.vehiclesOut')}</div>
                    <div style={{ fontWeight: 600 }}><span style={{ fontSize: 20 }}>87</span> {t('dashboard.vehicles')}</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.alarmStatistics')}</span></>}
            extra={<ViewDetailsLink onClick={() => navigateToDetail('/alarm-statistics', t('menu.alarmStatistics'))} label={t('common.viewDetails')} />}
            bordered={false}
          >
            <BarChart title="" categories={alarmCategories} data={alarmData} height={220} color="#1890ff" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.energyConsumption')}</span></>}
            extra={<ViewDetailsLink onClick={() => navigateToDetail('/energy-monitoring', t('menu.energyMonitoring'))} label={t('common.viewDetails')} />}
            bordered={false}
          >
            <GaugeChart title="" value={10.80} max={2000} unit=" kW/h" height={180} color="#1890ff" />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudOutlined style={{ color: '#faad14' }} />
                  <div>
                    <div style={{ fontSize: 11, color: token.colorTextSecondary }}>{t('dashboard.airConditioning')}</div>
                    <div style={{ fontWeight: 500 }}>10.00kWh</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BulbOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <div style={{ fontSize: 11, color: token.colorTextSecondary }}>{t('dashboard.lighting')}</div>
                    <div style={{ fontWeight: 500 }}>0.00kWh</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.visitorDistribution')}</span></>}
            extra={<ViewDetailsLink onClick={() => navigateToDetail('/visitor-distribution', t('menu.visitorDistribution'))} label={t('common.viewDetails')} />}
            bordered={false}
          >
            <LineChart title="" categories={visitorCategories} series={visitorSeries} height={250} />
          </Card>
        </Col>
      </Row>

      {/* Row 3 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.equipmentOperation')}</span></>}
            extra={<ViewDetailsLink onClick={() => navigateToDetail('/equipment-operation', t('menu.equipmentOperation'))} label={t('common.viewDetails')} />}
            bordered={false}
          >
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52c41a' }} />
                  <Text>{t('common.online')}:</Text>
                  <Text strong style={{ color: '#52c41a' }}>539</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#faad14' }} />
                  <Text>{t('common.offline')}:</Text>
                  <Text strong style={{ color: '#faad14' }}>149</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5222d' }} />
                  <Text>{t('common.alarm')}:</Text>
                  <Text strong style={{ color: '#f5222d' }}>13369132</Text>
                </div>
              </Col>
            </Row>
            <LineChart title="" categories={equipmentCategories} series={equipmentSeries} height={200} showArea={false} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<><span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>{t('dashboard.electricityComparison')}</span></>}
            extra={
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                  <option>{t('dashboard.byYear')}</option>
                  <option>{t('dashboard.byMonth')}</option>
                </select>
                <select style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
            }
            bordered={false}
          >
            <Row gutter={24}>
              <Col span={10}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 160, height: 160, borderRadius: '50%', 
                    border: '20px solid #e8e8e8', borderTopColor: '#1890ff', borderRightColor: '#52c41a',
                    margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                  }}>
                    <Text style={{ color: '#1890ff', fontWeight: 600 }}>2026</Text>
                    <Text style={{ color: '#52c41a', fontWeight: 600 }}>2025</Text>
                  </div>
                </div>
              </Col>
              <Col span={14}>
                <div style={{ padding: '20px 0' }}>
                  <Text strong style={{ fontSize: 16 }}>{t('dashboard.totalBattery')}</Text>
                  <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#1890ff' }} />
                      <Text>In 2025: <strong>481380.75kWh</strong></Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, background: '#52c41a' }} />
                      <Text>In 2026: <strong>2050.6kWh</strong></Text>
                    </div>
                  </div>
                  <div>
                    <Text>{t('dashboard.monthOnMonth')} </Text>
                    <Text style={{ color: '#f5222d', fontWeight: 600 }}>↓-99.57%</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
