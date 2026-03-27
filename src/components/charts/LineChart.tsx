import { lazy, Suspense, type ComponentProps } from 'react'
import { Spin } from 'antd'

const LineChartImpl = lazy(() => import('./LineChartImpl'))

type Props = ComponentProps<typeof LineChartImpl>

export default function LineChart(props: Props) {
  const h = props.height ?? 300
  return (
    <Suspense
      fallback={
        <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      }
    >
      <LineChartImpl {...props} />
    </Suspense>
  )
}
