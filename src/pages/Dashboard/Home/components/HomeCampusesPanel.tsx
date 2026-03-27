import { useCampusCrud } from '../hooks/useCampusCrud'
import { CampusStep } from './CampusStep'
import { CampusCrudModal } from './CampusCrudModal'
import type { HomeSelectionFlow } from '../homeFlowTypes'

type Props = {
  loading: boolean
  flow: Pick<HomeSelectionFlow, 'handleSelectCampus'>
}

export function HomeCampusesPanel({ loading, flow }: Props) {
  const campusCrud = useCampusCrud()

  return (
    <>
      <CampusStep
        campuses={campusCrud.campuses}
        loading={loading}
        onSelect={flow.handleSelectCampus}
        onCreate={campusCrud.openCreateCampus}
        onEdit={campusCrud.openEditCampus}
        onDelete={campusCrud.handleDeleteCampus}
      />
      <CampusCrudModal
        open={campusCrud.campusModalOpen}
        mode={campusCrud.campusModalMode}
        saving={campusCrud.campusSaving}
        form={campusCrud.campusForm}
        onOk={campusCrud.handleSaveCampus}
        onCancel={campusCrud.closeCampusModal}
      />
    </>
  )
}
