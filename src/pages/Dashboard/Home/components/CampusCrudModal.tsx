import { Modal, Form, Input, Select } from 'antd'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  saving: boolean
  form: ReturnType<typeof Form.useForm>[0]
  onOk: () => void
  onCancel: () => void
}

export function CampusCrudModal({ open, mode, saving, form, onOk, onCancel }: Props) {
  return (
    <Modal
      title={mode === 'create' ? 'Thêm khu viên' : 'Chỉnh sửa khu viên'}
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
          label="Tên khu viên"
          rules={[{ required: true, message: 'Vui lòng nhập tên khu viên' }]}
        >
          <Input placeholder="Nhập tên khu viên" />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Nhập địa chỉ khu viên" />
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
