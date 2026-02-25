import type { CSSProperties, ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  centered?: boolean
  className?: string
  style?: CSSProperties
}

export default function PageContainer({ children, centered, className, style }: PageContainerProps) {
  const cls = ['page-container', centered && 'page-container--centered', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}
