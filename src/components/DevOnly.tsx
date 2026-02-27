import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface DevOnlyProps {
  children: ReactNode
}

/**
 * Bọc bất kỳ component nào chỉ muốn hiển thị trong môi trường development.
 * Trong production build, tự động redirect về /dashboard.
 *
 * Dùng kết hợp với devOnly: true trong routeConfig để:
 * 1. Không bundle code vào production (lazy import bị tree-shaken)
 * 2. Redirect ngay cả khi ai đó gõ URL thẳng
 */
export default function DevOnly({ children }: DevOnlyProps) {
  if (!import.meta.env.DEV) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
