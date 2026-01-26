import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { EChartsOption } from 'echarts'

interface LineChartProps {
  title: string
  categories: string[]
  series: {
    name: string
    data: number[]
    color?: string
  }[]
  height?: number
  showArea?: boolean
}

export default function LineChart({
  title,
  categories,
  series,
  height = 300,
  showArea = false,
}: LineChartProps) {
  const defaultColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
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
    yAxis: {
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
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: s.color || defaultColors[index % defaultColors.length],
      },
      itemStyle: {
        color: s.color || defaultColors[index % defaultColors.length],
      },
      areaStyle: showArea
        ? {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color:
                    (s.color || defaultColors[index % defaultColors.length]) +
                    '40',
                },
                {
                  offset: 1,
                  color:
                    (s.color || defaultColors[index % defaultColors.length]) +
                    '05',
                },
              ],
            },
          }
        : undefined,
    })),
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
