import { useState } from 'react'
import { Form, message } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import { buildingApi } from '@/services'
import type { Building } from '@/services'
import { useHomeNavigationStore } from '@/stores'
import { errorMessageFromUnknown, isAntdFormValidationError } from '@/utils/crudErrors'

export function useBuildingCrud() {
  const { buildings, setBuildings, selectedCampus } = useHomeNavigationStore(
    useShallow((s) => ({
      buildings: s.buildings,
      setBuildings: s.setBuildings,
      selectedCampus: s.selectedCampus,
    })),
  )

  const [buildingModalOpen, setBuildingModalOpen] = useState(false)
  const [buildingModalMode, setBuildingModalMode] = useState<'create' | 'edit'>('create')
  const [buildingEditing, setBuildingEditing] = useState<Building | null>(null)
  const [buildingSaving, setBuildingSaving] = useState(false)
  const [buildingForm] = Form.useForm()

  const openCreateBuilding = () => {
    if (!selectedCampus) {
      message.warning('Vui lòng chọn khu viên trước')
      return
    }
    setBuildingModalMode('create')
    setBuildingEditing(null)
    buildingForm.resetFields()
    buildingForm.setFieldsValue({ status: 'ACTIVE' })
    setBuildingModalOpen(true)
  }

  const openEditBuilding = (building: Building) => {
    setBuildingModalMode('edit')
    setBuildingEditing(building)
    buildingForm.setFieldsValue({
      name: building.name,
      code: building.code,
      building_type: building.building_type,
      status: building.status || 'ACTIVE',
    })
    setBuildingModalOpen(true)
  }

  const closeBuildingModal = () => {
    setBuildingModalOpen(false)
    setBuildingEditing(null)
    buildingForm.resetFields()
  }

  const handleSaveBuilding = async () => {
    if (!selectedCampus && buildingModalMode === 'create') return
    try {
      const values = await buildingForm.validateFields()
      setBuildingSaving(true)
      if (buildingModalMode === 'create') {
        const created = await buildingApi.create({
          campus_id: selectedCampus!.id,
          name: values.name,
          code: values.code,
          building_type: values.building_type,
          status: values.status,
        })
        setBuildings([created, ...buildings])
        message.success('Đã thêm tòa nhà')
      } else if (buildingEditing) {
        const updated = await buildingApi.update(buildingEditing.id, {
          name: values.name,
          code: values.code,
          building_type: values.building_type,
          status: values.status,
        })
        setBuildings(buildings.map((item) => (item.id === buildingEditing.id ? updated : item)))
        message.success('Đã cập nhật tòa nhà')
      }
      closeBuildingModal()
    } catch (e: unknown) {
      if (isAntdFormValidationError(e)) return
      message.error(`Không lưu được tòa nhà: ${errorMessageFromUnknown(e)}`)
    } finally {
      setBuildingSaving(false)
    }
  }

  const handleDeleteBuilding = async (building: Building) => {
    try {
      await buildingApi.delete(building.id)
      setBuildings(buildings.filter((item) => item.id !== building.id))
      message.success('Đã xóa tòa nhà')
    } catch (e: unknown) {
      message.error(`Không xóa được tòa nhà: ${errorMessageFromUnknown(e)}`)
    }
  }

  return {
    buildings,
    selectedCampus,
    buildingModalOpen,
    buildingModalMode,
    buildingEditing,
    buildingSaving,
    buildingForm,
    openCreateBuilding,
    openEditBuilding,
    closeBuildingModal,
    handleSaveBuilding,
    handleDeleteBuilding,
  }
}
