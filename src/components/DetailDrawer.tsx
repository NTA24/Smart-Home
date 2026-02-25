import { Drawer } from 'antd'
import type { DrawerProps } from 'antd'
import type { ReactNode } from 'react'

interface DetailDrawerProps extends Omit<DrawerProps, 'onClose'> {
  onClose: () => void
  children?: ReactNode
}

export default function DetailDrawer({
  width = 480,
  onClose,
  children,
  ...rest
}: DetailDrawerProps) {
  return (
    <Drawer width={width} onClose={onClose} {...rest}>
      {children}
    </Drawer>
  )
}
