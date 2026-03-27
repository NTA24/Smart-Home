import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { EChartsOption } from 'echarts'

export interface BarChartSeries {
  name: string
  data: number[]
  color: string
}

interface BarChartProps {
  title: string
  categories: string[]
  data?: number[]
  height?: number
  color?: string
  horizontal?: boolean
  /** Multiple series (e.g. Cư dân / Khách lạ) – stacked bar; ignores data/color when set */
  series?: BarChartSeries[]
  cardStyle?: React.CSSProperties
}

export default function BarChartImpl({
  title,
  categories,
  data = [],
  height = 300,
  color = '#1890ff',
  horizontal = false,
  series: seriesProp,
  cardStyle,
}: BarChartProps) {
  const useSeries = Array.isArray(seriesProp) && seriesProp.length > 0
  const radius = horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
  const emphasisStyle = {
    itemStyle: {
      shadowBlur: 8,
      shadowOffsetY: 2,
      shadowColor: 'rgba(0,0,0,0.12)',
    },
  }
  const seriesConfig = useSeries
    ? seriesProp!.map((s) => ({
        name: s.name,
        type: 'bar' as const,
        data: s.data,
        barMaxWidth: 28,
        barGap: '20%',
        itemStyle: { color: s.color, borderRadius: radius },
        emphasis: emphasisStyle,
      }))
    : [
        {
          name: '',
          type: 'bar' as const,
          data,
          barWidth: '60%',
          itemStyle: { color, borderRadius: radius },
          emphasis: emphasisStyle,
        },
      ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: 'rgba(0,0,0,0.04)' },
      },
      textStyle: { fontSize: 13 },
      borderRadius: 8,
      padding: [8, 12],
    },
    legend: useSeries
      ? {
          bottom: 0,
          data: seriesProp!.map((s) => s.name),
          textStyle: { fontSize: 13, color: '#555' },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 20,
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: useSeries ? 40 : '3%',
      top: '8%',
      containLabel: true,
    },
    xAxis: horizontal
      ? { type: 'value', splitLine: { lineStyle: { color: '#f5f5f5' } } }
      : {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: '#e0e0e0' } },
          axisTick: { show: false },
          axisLabel: { color: '#888', fontSize: 11 },
        },
    yAxis: horizontal
      ? { type: 'category', data: categories, axisTick: { show: false } }
      : {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } },
          axisLabel: { color: '#aaa', fontSize: 11 },
        },
    series: seriesConfig,
    animationDuration: 800,
    animationEasing: 'cubicInOut',
    animationDurationUpdate: 600,
    animationEasingUpdate: 'cubicInOut',
    animationDelayUpdate: (idx: number) => idx * 30,
  }

  if (!title) {
    return <ReactECharts option={option} style={{ height }} notMerge />
  }

  return (
    <Card title={title} variant="borderless" style={cardStyle}>
      <ReactECharts option={option} style={{ height }} notMerge />
    </Card>
  )
}
