import { Modal, Form, Input, Select } from 'antd'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  saving: boolean
  form: ReturnType<typeof Form.useForm>[0]
  onOk: () => void
  onCancel: () => void
}

export function TenantCrudModal({ open, mode, saving, form, onOk, onCancel }: Props) {
  return (
    <Modal
      title={mode === 'create' ? 'Thêm khách thuê' : 'Chỉnh sửa khách thuê'}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={saving}
      okText={mode === 'create' ? 'Thêm' : 'Lưu'}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên khách thuê"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách thuê' }]}
        >
          <Input placeholder="Nhập tên khách thuê" />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
          <Select
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'INACTIVE', label: 'Không hoạt động' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
