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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: iconBgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: token.colorTextSecondary,
              fontSize: 14,
              marginBottom: 8,
            }}
          >
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
