import { Typography } from 'antd'
import type { ReactNode } from 'react'

const { Title, Text } = Typography

interface PageHeaderProps {
  title: ReactNode
  icon?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function PageHeader({ title, icon, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={['page-header', className].filter(Boolean).join(' ')}>
      <div>
        <Title level={4} className="page-header_title">
          {icon}
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" className="page-header_subtitle">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <div className="page-header_actions">{actions}</div>}
    </div>
  )
}
