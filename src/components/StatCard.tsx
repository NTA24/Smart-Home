import { Card, Statistic, theme } from 'antd'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  prefix?: ReactNode
  suffix?: string
  icon?: ReactNode
  iconBgColor?: string
  trend?: {
    value: number
    isUp: boolean
  }
}

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  icon,
  iconBgColor = '#1890ff',
}: StatCardProps) {
  const { token } = theme.useToken()

  return (
    <Card className="stat-card" bordered={false}>
      <div className="stat-card_content">
        {icon && (
          <div className="stat-card_icon" style={{ background: iconBgColor }}>
            {icon}
          </div>
        )}
        <div className="stat-card_body">
          <div className="stat-card_label" style={{ color: token.colorTextSecondary }}>
            {title}
          </div>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              fontSize: 24,
              fontWeight: 600,
              color: token.colorTextHeading,
            }}
          />
        </div>
      </div>
    </Card>
  )
}
