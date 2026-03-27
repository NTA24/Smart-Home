import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { CSSProperties } from 'react'
import type { EChartsOption } from 'echarts'

interface PieChartProps {
  title: string
  data: { name: string; value: number }[]
  height?: number
  showLegend?: boolean
  innerRadius?: string
  outerRadius?: string
  centerText?: string
  cardStyle?: CSSProperties
}

export default function PieChartImpl({
  title,
  data,
  height = 300,
  showLegend = true,
  innerRadius = '40%',
  outerRadius = '70%',
  centerText,
  cardStyle,
}: PieChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: showLegend
      ? {
          orient: 'vertical',
          right: 4,
          top: 'center',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 12,
          },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: [innerRadius, outerRadius],
        center: showLegend ? ['32%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: !!centerText,
          position: 'center',
          formatter: (params) => (params.dataIndex === 0 ? (centerText || '') : ''),
          fontSize: 36,
          fontWeight: 700,
          color: '#262626',
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data,
      },
    ],
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    animationDuration: 800,
    animationEasing: 'cubicInOut',
    animationDurationUpdate: 600,
    animationEasingUpdate: 'cubicInOut',
  }

  if (!title) {
    return <ReactECharts option={option} style={{ height }} />
  }

  return (
    <Card title={title} variant="borderless" style={cardStyle}>
      <ReactECharts option={option} style={{ height }} />
    </Card>
  )
}
