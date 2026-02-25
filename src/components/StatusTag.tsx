import { Tag } from 'antd'
import type { ReactNode } from 'react'

export interface StatusConfig {
  color: string
  label: string
  icon?: ReactNode
}

interface StatusTagProps {
  status: string
  config: Record<string, StatusConfig>
  className?: string
}

export default function StatusTag({ status, config, className }: StatusTagProps) {
  const cfg = config[status]
  if (!cfg) return <Tag>{status}</Tag>

  return (
    <Tag
      color={cfg.color}
      icon={cfg.icon}
      className={['status-tag', className].filter(Boolean).join(' ')}
    >
      {cfg.label}
    </Tag>
  )
}
