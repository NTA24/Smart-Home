import { memo } from 'react'
import { Row, Col, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { EnvironmentOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard, BarChart, LineChart, PieChart } from '@/components'
import { useBuildingStore } from '@/stores'
import { useNavigate } from 'react-router'

const { Text, Title } = Typography

function Dashboard() {
  const { t } = useTranslation()
  const selectedBuilding = useBuildingStore((s) => s.selectedBuilding)
  const navigate = useNavigate()

  return (
    <PageContainer>
      <Title level={3} className="dashboard_page-title">
        {t('menu.dashboard')}
      </Title>

      <PageHeader
        title={selectedBuilding?.name || t('dashboard.mainOfficeBuilding')}
        icon={
          <div className="dashboard_header-icon">
            <EnvironmentOutlined className="text-white text-lg" />
          </div>
        }
      />

      {/* Layout 3 cột: Camera / Con người / Bãi đỗ xe – Building – IoT / Năng lượng / Môi trường */}
      <Row gutter={[16, 16]} className="dashboard_main-row">
        {/* Cột trái: Camera / Con người / Bãi đỗ xe */}
        <Col xs={24} lg={6}>
          <ContentCard
            className="dashboard_card cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/camera-live')}
          >
            <Title level={4}>{t('dashboard.camera', 'Camera')}</Title>
            <div className="mt-2">
              <PieChart
                title=""
                data={[
                  { name: t('dashboard.activeCameras', 'Đang hoạt động'), value: 28 },
                  { name: t('dashboard.inactiveCameras', 'Không hoạt động'), value: 2 },
                ]}
                height={180}
                showLegend={true}
                innerRadius="55%"
                outerRadius="80%"
                centerText="28"
              />
              <div className="mt-2">
                <Text type="secondary">28 / 30 {t('dashboard.devices', 'thiết bị')}</Text>
              </div>
            </div>
          </ContentCard>

          <ContentCard
            className="dashboard_card mt-16 cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/people-report-overview')}
          >
            <Title level={4}>{t('dashboard.people', 'Người')}</Title>
            <div className="mt-2">
              <Text className="dashboard_stat-label">
                {t('dashboard.todayVisitors', 'Lượt ra/vào hôm nay')}
              </Text>
              <Title level={3} style={{ marginTop: 4 }}>300</Title>
              <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                <Text type="success">+5% {t('dashboard.vsYesterday', 'so với hôm qua')}</Text>
              </div>
              <div className="mt-4">
                <BarChart
                  title=""
                  categories={[t('dashboard.visitors', 'Người lạ'), t('dashboard.residents', 'Cư dân')]}
                  series={[
                    // Người lạ (hàng trên)
                    { name: t('dashboard.visitors', 'Người lạ'), data: [150, 0], color: '#52c41a' },
                    // Cư dân (hàng dưới)
                    { name: t('dashboard.residents', 'Cư dân'), data: [0, 150], color: '#1890ff' },
                  ]}
                  horizontal
                  height={160}
                />
              </div>
            </div>
          </ContentCard>

          <ContentCard
            className="dashboard_card mt-16 cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/parking')}
          >
            <Title level={4}>{t('dashboard.parking', 'Bãi đỗ xe')}</Title>
            <div className="mt-2">
              <Text className="dashboard_stat-label">
                {t('dashboard.parkingAvailable', 'Chỗ trống còn lại')}
              </Text>
              <Title level={3} style={{ marginTop: 4 }}>50</Title>
              <Text type="secondary">
                {t('dashboard.parkingTotal', 'Tổng chỗ đỗ')}: 300
              </Text>
              <div className="mt-4">
                <BarChart
                  title=""
                  categories={[
                    t('dashboard.parkingResident', 'Xe cư dân'),
                    t('dashboard.parkingTicket', 'Vé lượt'),
                  ]}
                  series={[
                    {
                      name: t('dashboard.current', 'Đã đỗ'),
                      data: [500, 200],
                      color: '#1890ff',
                    },
                    {
                      name: t('dashboard.capacity', 'Sức chứa'),
                      data: [700, 700],
                      color: '#d9d9d9',
                    },
                  ]}
                  horizontal
                  height={160}
                />
              </div>
            </div>
          </ContentCard>
        </Col>

        {/* Cột giữa: Building */}
        <Col xs={24} lg={12}>
          <ContentCard className="dashboard_card" bodyStyle={{ padding: 16 }}>
            <Title level={4}>{t('dashboard.building', 'Tòa nhà')}</Title>
            <div className="flex flex-col gap-3 mt-4">
              {['Block A', 'Block B', 'Block C', 'Block D'].map((label) => (
                <ContentCard key={label} size="small">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <div
                      style={{
                        flex: 1,
                        height: 10,
                        marginLeft: 12,
                        marginRight: 12,
                        borderRadius: 999,
                        background:
                          'linear-gradient(90deg,#52c41a 0%,#52c41a 40%,#faad14 40%,#faad14 70%,#ff4d4f 70%,#ff4d4f 100%)',
                      }}
                    />
                    <Text type="secondary">{t('dashboard.devices', 'Thiết bị')}</Text>
                  </div>
                </ContentCard>
              ))}
            </div>
          </ContentCard>
        </Col>

        {/* Cột phải: Thiết bị IoT / Năng lượng / Môi trường */}
        <Col xs={24} lg={6}>
          <ContentCard
            className="dashboard_card cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/energy-device-management')}
          >
            <Title level={4}>{t('dashboard.iotDevices', 'Thiết bị IoT')}</Title>
            <div className="mt-2">
              <PieChart
                title=""
                data={[
                  { name: t('dashboard.active', 'Đang hoạt động'), value: 300 },
                  { name: t('dashboard.inactive', 'Không hoạt động'), value: 1 },
                ]}
                height={180}
                showLegend={true}
                innerRadius="55%"
                outerRadius="80%"
                centerText="300"
              />
              <div className="mt-2">
                <Text type="secondary">
                  300 / 301 {t('dashboard.devices', 'thiết bị')}
                </Text>
              </div>
            </div>
          </ContentCard>

          <ContentCard
            className="dashboard_card mt-16 cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/energy-monitoring')}
          >
            <Title level={4}>{t('dashboard.energy', 'Năng lượng')}</Title>
            <div className="mt-2">
              <LineChart
                title=""
                categories={['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']}
                series={[
                  {
                    name: 'kWh',
                    data: [120, 130, 125, 140, 150, 155, 148],
                    color: '#faad14',
                  },
                ]}
                height={170}
                showArea
              />
              <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                <Text type="success">+10% {t('dashboard.vsYesterday', 'so với hôm qua')}</Text>
              </div>
            </div>
          </ContentCard>

          <ContentCard
            className="dashboard_card mt-16 cursor-pointer"
            bodyStyle={{ padding: 16 }}
            onClick={() => navigate('/iaq-telemetry')}
          >
            <Title level={4}>{t('dashboard.environment', 'Môi trường')}</Title>
            <div className="mt-2">
              <Text className="dashboard_stat-label">
                {t('dashboard.tempHumidity', 'Nhiệt độ / độ ẩm')}
              </Text>
              <Title level={3} style={{ marginTop: 4 }}>AQI 42 • 24°C • 60%</Title>
              <div className="mt-4">
                <BarChart
                  title=""
                  categories={[
                    'AQI',
                    t('dashboard.temperature', 'Nhiệt độ'),
                    t('dashboard.humidity', 'Độ ẩm'),
                    'HVAC',
                  ]}
                  data={[42, 24, 60, 80]}
                  color="#73d13d"
                  height={180}
                />
              </div>
            </div>
          </ContentCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

export default memo(Dashboard)
