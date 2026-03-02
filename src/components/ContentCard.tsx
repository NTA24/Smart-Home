import { Card } from 'antd'
import type { CardProps } from 'antd'
import type { ReactNode } from 'react'

interface ContentCardProps extends Omit<CardProps, 'title'> {
  title?: ReactNode
  titleIcon?: ReactNode
  titleIconColor?: string
  titleExtra?: ReactNode
  children?: ReactNode
}

export default function ContentCard({
  title,
  titleIcon,
  titleIconColor = '#1890ff',
  titleExtra,
  children,
  className,
  ...rest
}: ContentCardProps) {
  const cardTitle = title ? (
    <span className="content-card_title">
      {titleIcon && <span style={{ color: titleIconColor }}>{titleIcon}</span>}
      {title}
    </span>
  ) : undefined

  return (
    <Card
      variant="borderless"
      className={['content-card', className].filter(Boolean).join(' ')}
      title={cardTitle}
      extra={titleExtra}
      {...rest}
    >
      {children}
    </Card>
  )
}
