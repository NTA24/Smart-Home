import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { EChartsOption } from 'echarts'

interface PieChartProps {
  title: string
  data: { name: string; value: number }[]
  height?: number
  showLegend?: boolean
  innerRadius?: string
  outerRadius?: string
}

export default function PieChart({
  title,
  data,
  height = 300,
  showLegend = true,
  innerRadius = '40%',
  outerRadius = '70%',
}: PieChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: showLegend
      ? {
          orient: 'vertical',
          right: 10,
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
        center: showLegend ? ['35%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data,
      },
    ],
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
  }

  // If no title, render chart only
  if (!title) {
    return <ReactECharts option={option} style={{ height }} />
  }

  return (
    <Card title={title} bordered={false}>
      <ReactECharts option={option} style={{ height }} />
    </Card>
  )
}
