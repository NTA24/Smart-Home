import { Modal, Form, Button, Space } from 'antd'
import type { FormInstance, ModalProps } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

interface CrudModalProps extends Omit<ModalProps, 'onOk' | 'title'> {
  title?: ReactNode
  isEdit?: boolean
  form: FormInstance
  onSubmit: (values: any) => void
  onClose: () => void
  loading?: boolean
  children: ReactNode
  width?: number | string
}

export default function CrudModal({
  title,
  isEdit,
  form,
  onSubmit,
  onClose,
  loading,
  children,
  width,
  ...rest
}: CrudModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      title={title ?? (isEdit ? t('apiTest.edit') : t('apiTest.create'))}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={width}
      {...rest}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {children}
        <Form.Item className="crud-modal_footer">
          <Space>
            <Button onClick={onClose}>{t('apiTest.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? t('apiTest.update') : t('apiTest.create')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
