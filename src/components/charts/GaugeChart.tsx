import { lazy, Suspense, type ComponentProps } from 'react'
import { Spin } from 'antd'

const GaugeChartImpl = lazy(() => import('./GaugeChartImpl'))

type Props = ComponentProps<typeof GaugeChartImpl>

export default function GaugeChart(props: Props) {
  const h = props.height ?? 250
  return (
    <Suspense
      fallback={
        <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      }
    >
      <GaugeChartImpl {...props} />
    </Suspense>
  )
}
