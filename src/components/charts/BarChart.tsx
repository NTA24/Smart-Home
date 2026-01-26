import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { EChartsOption } from 'echarts'

interface BarChartProps {
  title: string
  categories: string[]
  data: number[]
  height?: number
  color?: string
  horizontal?: boolean
}

export default function BarChart({
  title,
  categories,
  data,
  height = 300,
  color = '#1890ff',
  horizontal = false,
}: BarChartProps) {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: horizontal
      ? {
          type: 'value',
        }
      : {
          type: 'category',
          data: categories,
          axisLine: {
            lineStyle: {
              color: '#d9d9d9',
            },
          },
          axisLabel: {
            color: '#666',
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: categories,
        }
      : {
          type: 'value',
          axisLine: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0',
            },
          },
        },
    series: [
      {
        type: 'bar',
        data: data,
        barWidth: '60%',
        itemStyle: {
          color: color,
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
        },
      },
    ],
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
