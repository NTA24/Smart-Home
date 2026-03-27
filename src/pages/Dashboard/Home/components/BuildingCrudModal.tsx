import { Modal, Form, Input, Select } from 'antd'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  saving: boolean
  form: ReturnType<typeof Form.useForm>[0]
  onOk: () => void
  onCancel: () => void
}

export function BuildingCrudModal({ open, mode, saving, form, onOk, onCancel }: Props) {
  return (
    <Modal
      title={mode === 'create' ? 'Thêm tòa nhà' : 'Chỉnh sửa tòa nhà'}
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
          label="Tên tòa nhà"
          rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà' }]}
        >
          <Input placeholder="Nhập tên tòa nhà" />
        </Form.Item>
        <Form.Item name="code" label="Mã tòa nhà">
          <Input placeholder="Nhập mã tòa nhà" />
        </Form.Item>
        <Form.Item name="building_type" label="Loại tòa nhà">
          <Input placeholder="Nhập loại tòa nhà" />
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
