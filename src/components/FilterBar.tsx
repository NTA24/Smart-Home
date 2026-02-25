import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { CSSProperties, ReactNode } from 'react'

/* ── SearchInput ── */

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  width?: number | string
  allowClear?: boolean
  style?: CSSProperties
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  width = 260,
  allowClear = true,
  style,
}: SearchInputProps) {
  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ width, ...style }}
      allowClear={allowClear}
    />
  )
}

/* ── FilterBar ── */

interface FilterBarProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function FilterBar({ children, className, style }: FilterBarProps) {
  return (
    <div className={['filter-bar', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
