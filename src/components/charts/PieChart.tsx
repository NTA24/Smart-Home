import { lazy, Suspense, type ComponentProps } from 'react'
import { Spin } from 'antd'

const PieChartImpl = lazy(() => import('./PieChartImpl'))

type Props = ComponentProps<typeof PieChartImpl>

export default function PieChart(props: Props) {
  const h = props.height ?? 300
  return (
    <Suspense
      fallback={
        <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      }
    >
      <PieChartImpl {...props} />
    </Suspense>
  )
}
