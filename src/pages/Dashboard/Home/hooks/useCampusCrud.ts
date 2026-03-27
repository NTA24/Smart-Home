import { useState } from 'react'
import { Form, message } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { campusApi } from '@/services'
import type { Campus } from '@/services'
import { useHomeNavigationStore } from '@/stores'
import { errorMessageFromUnknown, isAntdFormValidationError } from '@/utils/crudErrors'

export function useCampusCrud() {
  const { campuses, setCampuses, selectedTenant } = useHomeNavigationStore(
    useShallow((s) => ({
      campuses: s.campuses,
      setCampuses: s.setCampuses,
      selectedTenant: s.selectedTenant,
    })),
  )

  const [campusModalOpen, setCampusModalOpen] = useState(false)
  const [campusModalMode, setCampusModalMode] = useState<'create' | 'edit'>('create')
  const [campusEditing, setCampusEditing] = useState<Campus | null>(null)
  const [campusSaving, setCampusSaving] = useState(false)
  const [campusForm] = Form.useForm()

  const openCreateCampus = () => {
    if (!selectedTenant) {
      message.warning('Vui lòng chọn khách thuê trước')
      return
    }
    setCampusModalMode('create')
    setCampusEditing(null)
    campusForm.resetFields()
    campusForm.setFieldsValue({ status: 'ACTIVE' })
    setCampusModalOpen(true)
  }

  const openEditCampus = (campus: Campus) => {
    setCampusModalMode('edit')
    setCampusEditing(campus)
    campusForm.setFieldsValue({
      name: campus.name,
      address: campus.address,
      status: campus.status || 'ACTIVE',
    })
    setCampusModalOpen(true)
  }

  const closeCampusModal = () => {
    setCampusModalOpen(false)
    setCampusEditing(null)
    campusForm.resetFields()
  }

  const handleSaveCampus = async () => {
    if (!selectedTenant && campusModalMode === 'create') return
    try {
      const values = await campusForm.validateFields()
      setCampusSaving(true)
      if (campusModalMode === 'create') {
        const created = await campusApi.create({
          tenant_id: selectedTenant!.id,
          name: values.name,
          address: values.address,
          status: values.status,
        })
        setCampuses([created, ...campuses])
        message.success('Đã thêm khu viên')
      } else if (campusEditing) {
        const updated = await campusApi.update(campusEditing.id, {
          name: values.name,
          address: values.address,
          status: values.status,
        })
        setCampuses(campuses.map((item) => (item.id === campusEditing.id ? updated : item)))
        message.success('Đã cập nhật khu viên')
      }
      closeCampusModal()
    } catch (e: unknown) {
      if (isAntdFormValidationError(e)) return
      message.error(`Không lưu được khu viên: ${errorMessageFromUnknown(e)}`)
    } finally {
      setCampusSaving(false)
    }
  }

  const handleDeleteCampus = async (campus: Campus) => {
    try {
      await campusApi.delete(campus.id)
      setCampuses(campuses.filter((item) => item.id !== campus.id))
      message.success('Đã xóa khu viên')
    } catch (e: unknown) {
      message.error(`Không xóa được khu viên: ${errorMessageFromUnknown(e)}`)
    }
  }

  return {
    campuses,
    selectedTenant,
    campusModalOpen,
    campusModalMode,
    campusEditing,
    campusSaving,
    campusForm,
    openCreateCampus,
    openEditCampus,
    closeCampusModal,
    handleSaveCampus,
    handleDeleteCampus,
  }
}
