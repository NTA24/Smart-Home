import { Skeleton } from 'antd'

/**
 * Skeleton hiển thị trong lúc lazy-loaded page đang tải.
 */
export default function PageSkeleton() {
  return (
    <div className="page-skeleton">
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  )
}
