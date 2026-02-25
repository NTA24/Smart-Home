import { useState, useEffect, useMemo } from 'react'
import { Row, Col, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components'
import ReactECharts from 'echarts-for-react'
import buildingImage from '../../assets/building.png'
import backgroundImage from '../../assets/background.png'

const { Text } = Typography

// Falling particles component - smooth falling animation
const FloatingParticles = () => {
  // Snowflakes falling
  const snowflakes = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: `snow-${i}`,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6, // 6-12px
      opacity: 0.4 + Math.random() * 0.4,
      duration: 15 + Math.random() * 20, // 15-35s fall time
      delay: Math.random() * 15,
      drift: -20 + Math.random() * 40, // horizontal drift
    })), []
  )

  // Sparkles/stars falling
  const sparkles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: `sparkle-${i}`,
      left: Math.random() * 100,
      size: 4 + Math.random() * 4, // 4-8px
      opacity: 0.3 + Math.random() * 0.4,
      duration: 12 + Math.random() * 18, // 12-30s
      delay: Math.random() * 12,
      drift: -15 + Math.random() * 30,
    })), []
  )

  // Tiny dots falling fast
  const dots = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: `dot-${i}`,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 2, // 1.5-3.5px
      opacity: 0.2 + Math.random() * 0.4,
      duration: 8 + Math.random() * 12, // 8-20s
      delay: Math.random() * 10,
      color: Math.random() > 0.6 ? '#ffffff' : '#00d4ff',
    })), []
  )

  return (
    <div className="edc_particles">
      {/* Falling dots */}
      {dots.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -10,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `fallDot ${p.duration}s linear ${p.delay}s infinite`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Falling snowflakes */}
      {snowflakes.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -20,
            fontSize: p.size,
            color: '#4dd4ff',
            filter: 'drop-shadow(0 0 4px rgba(0, 200, 255, 0.6))',
            animation: `fallSnow ${p.duration}s linear ${p.delay}s infinite`,
            ['--drift' as string]: `${p.drift}px`,
            opacity: p.opacity,
          }}
        >
          ❄
        </div>
      ))}

      {/* Falling sparkles */}
      {sparkles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: -15,
            fontSize: p.size,
            color: '#80e0ff',
            filter: 'drop-shadow(0 0 3px rgba(100, 220, 255, 0.5))',
            animation: `fallSparkle ${p.duration}s linear ${p.delay}s infinite`,
            ['--drift' as string]: `${p.drift}px`,
            opacity: p.opacity,
          }}
        >
          ✧
        </div>
      ))}

      <style>{`
        @keyframes fallDot {
          0% { transform: translateY(0); opacity: 0; }
          5% { opacity: 0.6; }
          95% { opacity: 0.6; }
          100% { transform: translateY(calc(100vh + 20px)); opacity: 0; }
        }
        @keyframes fallSnow {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          5% { opacity: 0.7; }
          50% { transform: translateY(50vh) translateX(var(--drift, 20px)) rotate(180deg); }
          95% { opacity: 0.7; }
          100% { transform: translateY(calc(100vh + 30px)) translateX(calc(var(--drift, 20px) * 2)) rotate(360deg); opacity: 0; }
        }
        @keyframes fallSparkle {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          5% { opacity: 0.6; }
          25% { transform: translateY(25vh) translateX(calc(var(--drift, 15px) * 0.5)) scale(1.2); }
          50% { transform: translateY(50vh) translateX(var(--drift, 15px)) scale(0.8); }
          75% { transform: translateY(75vh) translateX(calc(var(--drift, 15px) * 1.5)) scale(1.1); }
          95% { opacity: 0.6; }
          100% { transform: translateY(calc(100vh + 25px)) translateX(calc(var(--drift, 15px) * 2)) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// 3D Building Component with enhanced effects
const Building3D = () => {
  return (
    <div className="edc_building-wrap">
      <div className="edc_center-glow" />
      <div className="edc_tech-arc edc_tech-arc--left-inner" />
      <div className="edc_tech-arc edc_tech-arc--left-outer" />
      <div className="edc_tech-arc edc_tech-arc--right-inner" />
      <div className="edc_tech-arc edc_tech-arc--right-outer" />
      <div className="edc_platform-ring edc_platform-ring--inner" />
      <div className="edc_platform-ring edc_platform-ring--outer" />
      <div className="edc_building-main">
        <img src={buildingImage} alt="3D Building" className="edc_building-img" />
      </div>

      <style>{`
        @keyframes arcRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes platformPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes buildingFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}

// Glowing card component
const GlowCard: React.FC<{ title?: string; icon?: string; children: React.ReactNode; style?: React.CSSProperties; className?: string; headerRight?: React.ReactNode }> = ({ title, icon, children, style, className, headerRight }) => (
  <div className={['edc_glow-card', className].filter(Boolean).join(' ')} style={style}>
    {title && (
      <div className="edc_glow-header">
        <div className="edc_glow-header-left">
          {icon && <span className="text-md">{icon}</span>}
          <Text className="edc_glow-title">{title}</Text>
        </div>
        {headerRight}
      </div>
    )}
    <div className="edc_glow-body">{children}</div>
  </div>
)

export default function EnergyDataCenter() {
  const { t } = useTranslation()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      day: t(`energyCenter.${dayKeys[date.getDay()]}`),
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    }
  }

  const dateInfo = formatDate(currentTime)

  // Chart options
  const realtimeChartOption = {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 15, bottom: 25, left: 45 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0, 30, 60, 0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    xAxis: {
      type: 'category',
      data: ['1:00', '4:00', '7:00', '10:00', '13:00', '16:00', '19:00', '22:00'],
      axisLine: { lineStyle: { color: '#1a5a7e' } },
      axisLabel: { color: '#6ab8e0', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#6ab8e0', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 150, 255, 0.15)', type: 'dashed' } }
    },
    series: [{
      data: [0.5, 0.8, 1.2, 1.8, 2.5, 3.0, 2.2, 1.5],
      type: 'line',
      smooth: true,
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0, 200, 255, 0.6)' }, { offset: 1, color: 'rgba(0, 100, 255, 0.02)' }] } },
      lineStyle: { color: '#00d4ff', width: 3, shadowColor: 'rgba(0, 200, 255, 0.6)', shadowBlur: 15 },
      itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 2 }
    }]
  }

  const comparisonChartOption = {
    backgroundColor: 'transparent',
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '50%'],
      label: { show: false },
      data: [
        { value: 70, name: '2026', itemStyle: { color: '#00d4ff' } },
        { value: 30, name: '2025', itemStyle: { color: '#faad14' } }
      ]
    }]
  }

  const gaugeChartOption = (value: number) => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 10,
      radius: '90%',
      center: ['50%', '55%'],
      progress: { show: true, width: 12, itemStyle: { color: '#52c41a' } },
      axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(0, 100, 150, 0.3)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      detail: { fontSize: 28, fontWeight: 'bold', color: '#52c41a', offsetCenter: [0, '-5%'], formatter: '{value}' },
      data: [{ value }]
    }]
  })

  const hourlyChartOption = {
    backgroundColor: 'transparent',
    grid: { top: 15, right: 8, bottom: 25, left: 30 },
    xAxis: {
      type: 'category',
      data: ['14:45', '15:00', '15:15', '15:30'],
      axisLine: { lineStyle: { color: '#1a5a7e' } },
      axisLabel: { color: '#6ab8e0', fontSize: 8 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#6ab8e0', fontSize: 8 },
      splitLine: { lineStyle: { color: 'rgba(0, 150, 255, 0.12)', type: 'dashed' } }
    },
    series: [{ data: [0.1, 0.15, 0.12, 0.18], type: 'bar', barWidth: 14, itemStyle: { color: '#00d4ff', borderRadius: [2, 2, 0, 0] } }]
  }

  const subsystemData = [
    { key: '1', icon: '❄️', name: t('energyCenter.coldWaterSupply'), temp: '1.20', power: '0.00', co2: '100.00' },
    { key: '2', icon: '💧', name: t('energyCenter.coldWaterReturn'), temp: '0.00', power: '0.00', co2: '0.00' },
    { key: '3', icon: '🌊', name: t('energyCenter.coolingWaterSupply'), temp: '0.00', power: '0.00', co2: '0.00' },
    { key: '4', icon: '♻️', name: t('energyCenter.coolingWaterReturn'), temp: '0.00', power: '0.00', co2: '0.00' },
    { key: '5', icon: '🧊', name: t('energyCenter.coolingTower'), temp: '0.00', power: '0.00', co2: '0.00' },
  ]

  const subsystemColumns = [
    { title: '', dataIndex: 'icon', key: 'icon', width: 28, render: (v: string) => <span>{v}</span> },
    { title: '', dataIndex: 'name', key: 'name', render: (v: string) => <Text className="text-xs edc_text-light">{v}</Text> },
    { title: '[℃]', dataIndex: 'temp', key: 'temp', width: 55, align: 'center' as const, render: (v: string) => <Text className="text-cyan text-xs">{v}</Text> },
    { title: '[W]', dataIndex: 'power', key: 'power', width: 55, align: 'center' as const, render: (v: string) => <Text className="text-cyan text-xs">{v}</Text> },
    { title: 'CO₂[%]', dataIndex: 'co2', key: 'co2', width: 65, align: 'center' as const, render: (v: string) => <Text className="text-cyan text-xs">{v}</Text> },
  ]

  return (
    <div className="edc_root" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <FloatingParticles />

      {/* Header */}
      <div className="edc_header">
        <Text className="edc_title">
          {t('energyCenter.title')}
        </Text>
        <div className="edc_date-row">
          <Text className="text-lg edc_text-nav">◀</Text>
          <Text className="text-md edc_text-light">{dateInfo.date}</Text>
          <Text className="text-md text-cyan font-semibold">{dateInfo.day}</Text>
          <Text className="text-2xl font-bold font-mono text-aqua">{dateInfo.time}</Text>
          <Text className="text-lg edc_text-nav">▶</Text>
        </div>
      </div>

      <Row gutter={[10, 10]} className="edc_content">
        {/* Left Column */}
        <Col xs={24} lg={6}>
          <GlowCard title={t('energyCenter.monthlyPowerStats')} icon="⚡">
            <div className="edc_stat-row">
              <div className="edc_stat-icon-box edc_stat-icon-box--yellow">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <Text className="text-11 block edc_text-light">{t('energyCenter.monthlyTotalPower')}</Text>
                <Text className="text-2xl font-bold text-cyan">166.4<span className="text-sm edc_text-light2">kWh</span></Text>
              </div>
            </div>
            <div className="mb-12">
              <Text className="text-xs block mb-4 edc_text-light">{t('energyCenter.monthlySubEnergy')}</Text>
              <div className="edc_progress-bar-wrap">
                <div className="edc_progress-segment-7">
                  <Text className="text-white text-xs">{t('energyCenter.acPower')} 70.00 kWh</Text>
                </div>
                <div className="edc_progress-segment-2" />
                <div className="edc_progress-segment-1" />
              </div>
            </div>
            <div className="edc_stat-row">
              <div className="edc_stat-icon-box edc_stat-icon-box--blue">
                <span className="text-2xl">❄️</span>
              </div>
              <div>
                <Text className="text-11 block edc_text-light">{t('energyCenter.todayUsage')}</Text>
                <Text className="text-2xl font-bold text-cyan">18.2<span className="text-sm edc_text-light2">kWh</span></Text>
              </div>
            </div>
          </GlowCard>

          <GlowCard title={t('energyCenter.realtimeMonitoring')} className="mt-10">
            <ReactECharts option={realtimeChartOption} className="edc_chart-140" />
          </GlowCard>

          <GlowCard title={t('energyCenter.energyComparison')} className="mt-10">
            <div className="flex items-center">
              <div className="relative edc_w-40">
                <ReactECharts option={comparisonChartOption} className="edc_chart-120" />
                <div className="edc_pie-center">
                  <Text className="text-success text-xs">QoQ</Text>
                  <Text className="text-success text-sm font-bold block">▲+23.63%</Text>
                </div>
              </div>
              <div className="edc_w-60">
                <Text className="text-xs block mb-8 edc_text-light">{t('energyCenter.totalElectricity')}</Text>
                <div className="flex items-center gap-8 mb-4">
                  <div className="edc_comparison-legend rounded-sm edc_legend-cyan" />
                  <Text className="text-xs edc_text-light">2026: 481,380kWh</Text>
                </div>
                <div className="flex items-center gap-8">
                  <div className="edc_comparison-legend rounded-sm edc_legend-orange" />
                  <Text className="text-xs edc_text-light">2025: 389,200kWh</Text>
                </div>
              </div>
            </div>
          </GlowCard>
        </Col>

        {/* Center Column */}
        <Col xs={24} lg={12}>
          <div className="edc_building-wrap edc_building-360">
            <Building3D />
          </div>

          <Row gutter={10} className="mt-8">
            <Col span={12}>
              <GlowCard title={t('energyCenter.subsystemParams')}>
                <Row gutter={[6, 6]} className="mb-8">
                  {[
                    { label: 'kW/m²', value: '0.01', sub: t('energyCenter.dailyAvgEnergy') },
                    { label: 'kW', value: '0.00', sub: t('energyCenter.realtimeCooling') },
                    { label: 'kW', value: '1.20', sub: t('energyCenter.realtimePower') },
                  ].map((item, i) => (
                    <Col span={8} key={i}>
                      <div className="edc_subsystem-param-cell">
                        <Text className="text-cyan font-bold block text-lg">{item.value}<span className="text-xs edc_text-light2">{item.label}</span></Text>
                        <Text className="text-xs edc_text-light2">{item.sub}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
                <Row gutter={[6, 6]}>
                  {[
                    { label: t('energyCenter.chilledSupplyTemp'), value: '11.12', unit: '°C' },
                    { label: t('energyCenter.chilledReturnTemp'), value: '10.77', unit: '°C' },
                    { label: t('energyCenter.chilledTempDiff'), value: '-0.35', unit: '°C', color: '#ff4d4f' },
                  ].map((item, i) => (
                    <Col span={8} key={i}>
                      <div className="edc_subsystem-temp-cell">
                        <Text className="text-xs block edc_text-light2">{item.label}</Text>
                        <Text className="text-sm" style={{ color: item.color || '#00d4ff' }}>{item.value}<span className="text-xs">{item.unit}</span></Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </GlowCard>
            </Col>
            <Col span={12}>
              <GlowCard title={t('energyCenter.subsystemEnergy')}>
                <DataTable columns={subsystemColumns} dataSource={subsystemData} pagination={false} size="small" className="dark-table-compact" />
              </GlowCard>
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={6}>
          <GlowCard title={t('energyCenter.acEnergyStats')} icon="❄️">
            <Row gutter={8}>
              <Col span={12}>
                <div className="edc_gauge-wrap">
                  <Text className="text-xs edc_text-light2">{t('energyCenter.chillerEER')}</Text>
                  <ReactECharts option={gaugeChartOption(0)} className="edc_chart-100" />
                  <Text className="edc_unit-text">kW/kW</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="edc_gauge-wrap">
                  <Text className="text-xs edc_text-light2">{t('energyCenter.systemLoad')}</Text>
                  <ReactECharts option={gaugeChartOption(0)} className="edc_chart-100" />
                  <Text className="edc_unit-text">%</Text>
                </div>
              </Col>
            </Row>
          </GlowCard>

          <GlowCard title={t('energyCenter.eerTimeCurve')} className="mt-10">
            <ReactECharts option={hourlyChartOption} className="edc_chart-90" />
          </GlowCard>

          <GlowCard title={t('energyCenter.loadTimeCurve')} className="mt-10">
            <ReactECharts option={hourlyChartOption} className="edc_chart-90" />
          </GlowCard>

          <GlowCard title={t('energyCenter.hourlyConsumption')} className="mt-10">
            <ReactECharts option={hourlyChartOption} className="edc_chart-90" />
          </GlowCard>
        </Col>
      </Row>

      <style>{`
        .dark-table-compact .ant-table { background: transparent !important; }
        .dark-table-compact .ant-table-thead > tr > th { background: rgba(0, 70, 120, 0.6) !important; color: #6ab8e0 !important; border-bottom: 1px solid rgba(0, 150, 255, 0.3) !important; padding: 4px 5px !important; font-size: 9px !important; }
        .dark-table-compact .ant-table-tbody > tr > td { background: transparent !important; border-bottom: 1px solid rgba(0, 150, 255, 0.15) !important; padding: 4px 5px !important; }
        .dark-table-compact .ant-table-tbody > tr:hover > td { background: rgba(0, 100, 160, 0.4) !important; }
        .dark-table-compact .ant-table-cell { color: #8ecae6 !important; }
        .dark-table-compact .ant-table-cell::before { display: none !important; }
      `}</style>
    </div>
  )
}
