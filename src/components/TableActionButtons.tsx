import { Button, Space, Popconfirm } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

interface TableActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  deleteConfirmTitle?: string
}

export default function TableActionButtons({
  onView,
  onEdit,
  onDelete,
  deleteConfirmTitle,
}: TableActionButtonsProps) {
  const { t } = useTranslation()

  return (
    <Space size="small">
      {onView && (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={onView} />
      )}
      {onEdit && (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={onEdit} />
      )}
      {onDelete && (
        <Popconfirm
          title={deleteConfirmTitle || t('apiTest.confirmDelete')}
          onConfirm={onDelete}
          okText={t('apiTest.yes')}
          cancelText={t('apiTest.no')}
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )}
    </Space>
  )
}
