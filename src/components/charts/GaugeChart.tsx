import ReactECharts from 'echarts-for-react'
import { Card } from 'antd'
import type { EChartsOption } from 'echarts'

interface GaugeChartProps {
  title: string
  value: number
  max?: number
  unit?: string
  height?: number
  color?: string
}

export default function GaugeChart({
  title,
  value,
  max = 100,
  unit = '%',
  height = 250,
  color = '#1890ff',
}: GaugeChartProps) {
  const option: EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: max,
        splitNumber: 5,
        itemStyle: {
          color: color,
        },
        progress: {
          show: true,
          width: 20,
          itemStyle: {
            color: color,
          },
        },
        pointer: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#f0f0f0']],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          borderRadius: 8,
          offsetCenter: [0, '0%'],
          fontSize: 28,
          fontWeight: 'bold',
          formatter: `{value}${unit}`,
          color: 'inherit',
        },
        data: [
          {
            value: value,
          },
        ],
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
