import { useTenantCrud } from '../hooks/useTenantCrud'
import { TenantStep } from './TenantStep'
import { TenantCrudModal } from './TenantCrudModal'
import type { HomeSelectionFlow } from '../homeFlowTypes'

type Props = {
  setLoading: (v: boolean) => void
  loading: boolean
  flow: Pick<HomeSelectionFlow, 'handleSelectTenant'>
}

/** Chỉ mount khi step === tenants — giảm phạm vi hook CRUD và re-render. */
export function HomeTenantsPanel({ setLoading, loading, flow }: Props) {
  const tenantCrud = useTenantCrud(setLoading)

  return (
    <>
      <TenantStep
        tenants={tenantCrud.tenants}
        loading={loading}
        onSelect={flow.handleSelectTenant}
        onCreate={tenantCrud.openCreateTenant}
        onEdit={tenantCrud.openEditTenant}
        onDelete={tenantCrud.handleDeleteTenant}
      />
      <TenantCrudModal
        open={tenantCrud.tenantModalOpen}
        mode={tenantCrud.tenantModalMode}
        saving={tenantCrud.tenantSaving}
        form={tenantCrud.tenantForm}
        onOk={tenantCrud.handleSaveTenant}
        onCancel={tenantCrud.closeTenantModal}
      />
    </>
  )
}
