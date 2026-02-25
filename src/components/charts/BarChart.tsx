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
}

export default function BarChart({
  title,
  categories,
  data = [],
  height = 300,
  color = '#1890ff',
  horizontal = false,
  series: seriesProp,
}: BarChartProps) {
  const useSeries = Array.isArray(seriesProp) && seriesProp.length > 0
  const seriesConfig = useSeries
    ? seriesProp!.map((s) => ({
        name: s.name,
        type: 'bar' as const,
        data: s.data,
        itemStyle: { color: s.color, borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      }))
    : [
        {
          name: '',
          type: 'bar' as const,
          data,
          barWidth: '60%',
          itemStyle: {
            color,
            borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        },
      ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
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
      ? { type: 'value' }
      : {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: '#d9d9d9' } },
          axisLabel: { color: '#666' },
        },
    yAxis: horizontal
      ? { type: 'category', data: categories }
      : {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
        },
    series: seriesConfig,
  }

  if (!title) {
    return <ReactECharts option={option} style={{ height }} notMerge />
  }

  return (
    <Card title={title} bordered={false}>
      <ReactECharts option={option} style={{ height }} notMerge />
    </Card>
  )
}
