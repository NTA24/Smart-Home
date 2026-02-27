import { Spin } from 'antd'

export interface PageLoadingProps {
  /** Text hiển thị dưới spinner (không truyền thì chỉ có icon xoay) */
  tip?: string
  /** Chiều cao tối thiểu vùng loading (px) */
  minHeight?: number
  /** Class name cho wrapper */
  className?: string
}

/**
 * Loading chung: một spinner xoay ở giữa (khi click chuyển trang chưa load xong).
 */
export default function PageLoading({ tip, minHeight = 280, className }: PageLoadingProps) {
  return (
    <div
      className={`page-loading ${className ?? ''}`.trim()}
      style={minHeight !== 280 ? { minHeight } : undefined}
      role="status"
      aria-live="polite"
      aria-label={tip ?? 'Loading'}
    >
      <Spin size="large" tip={tip} />
    </div>
  )
}
