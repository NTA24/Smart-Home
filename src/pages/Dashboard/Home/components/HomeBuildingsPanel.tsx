import { useBuildingCrud } from '../hooks/useBuildingCrud'
import { BuildingStep } from './BuildingStep'
import { BuildingCrudModal } from './BuildingCrudModal'
import type { HomeSelectionFlow } from '../homeFlowTypes'

type Props = {
  loading: boolean
  flow: Pick<HomeSelectionFlow, 'handleSelectBuilding'>
}

export function HomeBuildingsPanel({ loading, flow }: Props) {
  const buildingCrud = useBuildingCrud()

  return (
    <>
      <BuildingStep
        buildings={buildingCrud.buildings}
        loading={loading}
        onSelect={flow.handleSelectBuilding}
        onCreate={buildingCrud.openCreateBuilding}
        onEdit={buildingCrud.openEditBuilding}
        onDelete={buildingCrud.handleDeleteBuilding}
      />
      <BuildingCrudModal
        open={buildingCrud.buildingModalOpen}
        mode={buildingCrud.buildingModalMode}
        saving={buildingCrud.buildingSaving}
        form={buildingCrud.buildingForm}
        onOk={buildingCrud.handleSaveBuilding}
        onCancel={buildingCrud.closeBuildingModal}
      />
    </>
  )
}
