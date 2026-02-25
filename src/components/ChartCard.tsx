import ContentCard from './ContentCard'
import type { ReactNode, CSSProperties } from 'react'

interface ChartCardProps {
  title?: ReactNode
  titleIcon?: ReactNode
  titleIconColor?: string
  extra?: ReactNode
  height?: number | string
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export default function ChartCard({
  title,
  titleIcon,
  titleIconColor,
  extra,
  children,
  style,
}: ChartCardProps) {
  return (
    <ContentCard
      title={title}
      titleIcon={titleIcon}
      titleIconColor={titleIconColor}
      titleExtra={extra}
      style={style}
    >
      {children}
    </ContentCard>
  )
}
