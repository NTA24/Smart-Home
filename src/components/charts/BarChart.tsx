import { lazy, Suspense, type ComponentProps } from 'react'
import { Spin } from 'antd'

export type { BarChartSeries } from './BarChartImpl'

const BarChartImpl = lazy(() => import('./BarChartImpl'))

type Props = ComponentProps<typeof BarChartImpl>

export default function BarChart(props: Props) {
  const h = props.height ?? 300
  return (
    <Suspense
      fallback={
        <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      }
    >
      <BarChartImpl {...props} />
    </Suspense>
  )
}
