import { useState, useEffect, useMemo } from 'react'
import { Row, Col, Table, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import ReactECharts from 'echarts-for-react'
import buildingImage from '../assets/building.png'
import backgroundImage from '../assets/background.png'

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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
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
    <div style={{
      position: 'relative',
      height: '100%',
      minHeight: 360,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Center glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 100, 200, 0.3) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Left tech arcs */}
      <div style={{
        position: 'absolute',
        left: '-12%',
        top: '8%',
        width: 250,
        height: 350,
        border: '2.5px solid transparent',
        borderLeftColor: 'rgba(0, 200, 255, 0.6)',
        borderRadius: '50%',
        animation: 'arcRotate 12s linear infinite',
        boxShadow: '-2px 0 15px rgba(0, 200, 255, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        left: '-18%',
        top: '3%',
        width: 300,
        height: 400,
        border: '2px solid transparent',
        borderLeftColor: 'rgba(0, 180, 255, 0.4)',
        borderRadius: '50%',
        animation: 'arcRotate 18s linear infinite reverse',
      }} />

      {/* Right tech arcs */}
      <div style={{
        position: 'absolute',
        right: '-12%',
        top: '8%',
        width: 250,
        height: 350,
        border: '2.5px solid transparent',
        borderRightColor: 'rgba(0, 200, 255, 0.6)',
        borderRadius: '50%',
        animation: 'arcRotate 12s linear infinite reverse',
        boxShadow: '2px 0 15px rgba(0, 200, 255, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        right: '-18%',
        top: '3%',
        width: 300,
        height: 400,
        border: '2px solid transparent',
        borderRightColor: 'rgba(0, 180, 255, 0.4)',
        borderRadius: '50%',
        animation: 'arcRotate 18s linear infinite',
      }} />

      {/* Platform rings */}
      <div style={{
        position: 'absolute',
        bottom: '3%',
        left: '50%',
        transform: 'translateX(-50%) perspective(500px) rotateX(75deg)',
        width: '95%',
        height: 140,
        borderRadius: '50%',
        border: '2.5px solid rgba(0, 200, 255, 0.7)',
        boxShadow: '0 0 50px rgba(0, 200, 255, 0.5), inset 0 0 50px rgba(0, 150, 255, 0.2)',
        animation: 'platformPulse 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-1%',
        left: '50%',
        transform: 'translateX(-50%) perspective(500px) rotateX(75deg)',
        width: '110%',
        height: 180,
        borderRadius: '50%',
        border: '2px solid rgba(0, 180, 255, 0.5)',
        animation: 'platformPulse 3s ease-in-out infinite 0.5s',
      }} />

      {/* Main building image */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 520,
        animation: 'buildingFloat 5s ease-in-out infinite',
      }}>
        <img
          src={buildingImage}
          alt="3D Building"
          style={{
            width: '100%',
            height: 'auto',
            filter: 'drop-shadow(0 0 40px rgba(0, 200, 255, 0.6)) drop-shadow(0 0 80px rgba(0, 150, 255, 0.4))',
          }}
        />
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
const GlowCard: React.FC<{ title?: string; icon?: string; children: React.ReactNode; style?: React.CSSProperties; headerRight?: React.ReactNode }> = ({ title, icon, children, style, headerRight }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(0, 50, 100, 0.7) 0%, rgba(0, 25, 60, 0.9) 100%)',
    border: '1px solid rgba(0, 180, 255, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 0 25px rgba(0, 150, 255, 0.2), inset 0 1px 0 rgba(0, 200, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    ...style
  }}>
    {title && (
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid rgba(0, 180, 255, 0.3)',
        background: 'linear-gradient(90deg, rgba(0, 120, 200, 0.4) 0%, rgba(0, 80, 150, 0.2) 50%, transparent 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <Text style={{ color: '#00d4ff', fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textShadow: '0 0 10px rgba(0, 200, 255, 0.5)' }}>{title}</Text>
        </div>
        {headerRight}
      </div>
    )}
    <div style={{ padding: 10 }}>{children}</div>
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
    { title: '', dataIndex: 'name', key: 'name', render: (v: string) => <Text style={{ color: '#8ecae6', fontSize: 10 }}>{v}</Text> },
    { title: '[℃]', dataIndex: 'temp', key: 'temp', width: 55, align: 'center' as const, render: (v: string) => <Text style={{ color: '#00d4ff', fontSize: 10 }}>{v}</Text> },
    { title: '[W]', dataIndex: 'power', key: 'power', width: 55, align: 'center' as const, render: (v: string) => <Text style={{ color: '#00d4ff', fontSize: 10 }}>{v}</Text> },
    { title: 'CO₂[%]', dataIndex: 'co2', key: 'co2', width: 65, align: 'center' as const, render: (v: string) => <Text style={{ color: '#00d4ff', fontSize: 10 }}>{v}</Text> },
  ]

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: 'calc(100vh - 112px)',
      padding: 16,
      margin: -24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <FloatingParticles />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 14, position: 'relative', zIndex: 10 }}>
        <Text style={{
          color: '#00d4ff',
          fontSize: 26,
          fontWeight: 'bold',
          textShadow: '0 0 30px rgba(0, 200, 255, 0.7)',
          letterSpacing: 6,
        }}>
          {t('energyCenter.title')}
        </Text>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <Text style={{ color: '#4a9fcf', fontSize: 16 }}>◀</Text>
          <Text style={{ color: '#8ecae6', fontSize: 14 }}>{dateInfo.date}</Text>
          <Text style={{ color: '#00d4ff', fontSize: 14, fontWeight: 600 }}>{dateInfo.day}</Text>
          <Text style={{ color: '#00ffff', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' }}>{dateInfo.time}</Text>
          <Text style={{ color: '#4a9fcf', fontSize: 16 }}>▶</Text>
        </div>
      </div>

      <Row gutter={[10, 10]} style={{ position: 'relative', zIndex: 10 }}>
        {/* Left Column */}
        <Col xs={24} lg={6}>
          <GlowCard title={t('energyCenter.monthlyPowerStats')} icon="⚡">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #faad14, #d48806)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22 }}>⚡</span>
              </div>
              <div>
                <Text style={{ color: '#8ecae6', fontSize: 11, display: 'block' }}>{t('energyCenter.monthlyTotalPower')}</Text>
                <Text style={{ color: '#00d4ff', fontSize: 26, fontWeight: 'bold' }}>166.4<span style={{ fontSize: 12, color: '#6ab8e0' }}>kWh</span></Text>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Text style={{ color: '#8ecae6', fontSize: 10, display: 'block', marginBottom: 4 }}>{t('energyCenter.monthlySubEnergy')}</Text>
              <div style={{ display: 'flex', height: 26, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0, 150, 255, 0.4)' }}>
                <div style={{ flex: 7, background: 'linear-gradient(90deg, #1890ff, #40a9ff)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>{t('energyCenter.acPower')} 70.00 kWh</Text>
                </div>
                <div style={{ flex: 2, background: 'linear-gradient(90deg, #52c41a, #73d13d)' }} />
                <div style={{ flex: 1, background: 'linear-gradient(90deg, #faad14, #ffc53d)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #1890ff, #096dd9)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>❄️</span>
              </div>
              <div>
                <Text style={{ color: '#8ecae6', fontSize: 11, display: 'block' }}>{t('energyCenter.todayUsage')}</Text>
                <Text style={{ color: '#00d4ff', fontSize: 20, fontWeight: 'bold' }}>18.2<span style={{ fontSize: 12, color: '#6ab8e0' }}>kWh</span></Text>
              </div>
            </div>
          </GlowCard>

          <GlowCard title={t('energyCenter.realtimeMonitoring')} style={{ marginTop: 10 }}>
            <ReactECharts option={realtimeChartOption} style={{ height: 140 }} />
          </GlowCard>

          <GlowCard title={t('energyCenter.energyComparison')} style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '40%', position: 'relative' }}>
                <ReactECharts option={comparisonChartOption} style={{ height: 120 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Text style={{ color: '#52c41a', fontSize: 10 }}>QoQ</Text>
                  <Text style={{ color: '#52c41a', fontSize: 12, fontWeight: 'bold', display: 'block' }}>▲+23.63%</Text>
                </div>
              </div>
              <div style={{ width: '60%', paddingLeft: 10 }}>
                <Text style={{ color: '#8ecae6', fontSize: 10, display: 'block', marginBottom: 10 }}>{t('energyCenter.totalElectricity')}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 14, height: 14, background: '#00d4ff', borderRadius: 3 }} />
                  <Text style={{ color: '#8ecae6', fontSize: 10 }}>2026: 481,380kWh</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, background: '#faad14', borderRadius: 3 }} />
                  <Text style={{ color: '#8ecae6', fontSize: 10 }}>2025: 389,200kWh</Text>
                </div>
              </div>
            </div>
          </GlowCard>
        </Col>

        {/* Center Column */}
        <Col xs={24} lg={12}>
          <div style={{ height: 360 }}>
            <Building3D />
          </div>

          <Row gutter={10} style={{ marginTop: 10 }}>
            <Col span={12}>
              <GlowCard title={t('energyCenter.subsystemParams')}>
                <Row gutter={[6, 6]} style={{ marginBottom: 8 }}>
                  {[
                    { label: 'kW/m²', value: '0.01', sub: t('energyCenter.dailyAvgEnergy') },
                    { label: 'kW', value: '0.00', sub: t('energyCenter.realtimeCooling') },
                    { label: 'kW', value: '1.20', sub: t('energyCenter.realtimePower') },
                  ].map((item, i) => (
                    <Col span={8} key={i}>
                      <div style={{ background: 'rgba(0, 80, 140, 0.5)', padding: '6px 4px', borderRadius: 4, textAlign: 'center' }}>
                        <Text style={{ color: '#00d4ff', fontSize: 15, fontWeight: 'bold', display: 'block' }}>{item.value}<span style={{ fontSize: 8, color: '#6ab8e0' }}>{item.label}</span></Text>
                        <Text style={{ color: '#6ab8e0', fontSize: 8 }}>{item.sub}</Text>
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
                      <div style={{ background: 'rgba(0, 70, 120, 0.4)', padding: '4px', borderRadius: 4, textAlign: 'center' }}>
                        <Text style={{ color: '#6ab8e0', fontSize: 8, display: 'block' }}>{item.label}</Text>
                        <Text style={{ color: item.color || '#00d4ff', fontSize: 12 }}>{item.value}<span style={{ fontSize: 9 }}>{item.unit}</span></Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </GlowCard>
            </Col>
            <Col span={12}>
              <GlowCard title={t('energyCenter.subsystemEnergy')}>
                <Table columns={subsystemColumns} dataSource={subsystemData} pagination={false} size="small" className="dark-table-compact" />
              </GlowCard>
            </Col>
          </Row>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={6}>
          <GlowCard title={t('energyCenter.acEnergyStats')} icon="❄️">
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: '#6ab8e0', fontSize: 10 }}>{t('energyCenter.chillerEER')}</Text>
                  <ReactECharts option={gaugeChartOption(0)} style={{ height: 100 }} />
                  <Text style={{ color: '#6ab8e0', fontSize: 9 }}>kW/kW</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: '#6ab8e0', fontSize: 10 }}>{t('energyCenter.systemLoad')}</Text>
                  <ReactECharts option={gaugeChartOption(0)} style={{ height: 100 }} />
                  <Text style={{ color: '#6ab8e0', fontSize: 9 }}>%</Text>
                </div>
              </Col>
            </Row>
          </GlowCard>

          <GlowCard title={t('energyCenter.eerTimeCurve')} style={{ marginTop: 10 }}>
            <ReactECharts option={hourlyChartOption} style={{ height: 90 }} />
          </GlowCard>

          <GlowCard title={t('energyCenter.loadTimeCurve')} style={{ marginTop: 10 }}>
            <ReactECharts option={hourlyChartOption} style={{ height: 90 }} />
          </GlowCard>

          <GlowCard title={t('energyCenter.hourlyConsumption')} style={{ marginTop: 10 }}>
            <ReactECharts option={hourlyChartOption} style={{ height: 90 }} />
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
