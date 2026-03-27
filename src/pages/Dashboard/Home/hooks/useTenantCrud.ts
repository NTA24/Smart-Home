import { useState, useEffect } from 'react'
import { Form, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { tenantApi } from '@/services'
import type { Tenant } from '@/services'
import { useHomeNavigationStore } from '@/stores'
import { errorMessageFromUnknown, isAntdFormValidationError } from '@/utils/crudErrors'

type SetLoading = (v: boolean) => void

export function useTenantCrud(setLoading: SetLoading) {
  const { t } = useTranslation()
  const { tenants, setTenants } = useHomeNavigationStore(
    useShallow((s) => ({ tenants: s.tenants, setTenants: s.setTenants })),
  )

  const [tenantModalOpen, setTenantModalOpen] = useState(false)
  const [tenantModalMode, setTenantModalMode] = useState<'create' | 'edit'>('create')
  const [tenantEditing, setTenantEditing] = useState<Tenant | null>(null)
  const [tenantSaving, setTenantSaving] = useState(false)
  const [tenantForm] = Form.useForm()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (useHomeNavigationStore.getState().tenants.length === 0) setLoading(true)
      try {
        const res = await tenantApi.getList({ limit: 50, offset: 0 })
        if (!cancelled) setTenants(res?.items || [])
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        if (!cancelled) message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount: initial tenant list
  }, [])

  const openCreateTenant = () => {
    setTenantModalMode('create')
    setTenantEditing(null)
    tenantForm.resetFields()
    tenantForm.setFieldsValue({ status: 'ACTIVE' })
    setTenantModalOpen(true)
  }

  const openEditTenant = (tenant: Tenant) => {
    setTenantModalMode('edit')
    setTenantEditing(tenant)
    tenantForm.setFieldsValue({
      name: tenant.name,
      status: tenant.status || 'ACTIVE',
    })
    setTenantModalOpen(true)
  }

  const closeTenantModal = () => {
    setTenantModalOpen(false)
    setTenantEditing(null)
    tenantForm.resetFields()
  }

  const handleSaveTenant = async () => {
    try {
      const values = await tenantForm.validateFields()
      setTenantSaving(true)

      if (tenantModalMode === 'create') {
        const created = await tenantApi.create({
          name: values.name,
          status: values.status,
        })
        setTenants([created, ...tenants])
        message.success('Đã thêm khách thuê')
      } else if (tenantEditing) {
        const updated = await tenantApi.update(tenantEditing.id, {
          name: values.name,
          status: values.status,
        })
        setTenants(tenants.map((item) => (item.id === tenantEditing.id ? updated : item)))
        message.success('Đã cập nhật khách thuê')
      }

      closeTenantModal()
    } catch (e: unknown) {
      if (isAntdFormValidationError(e)) return
      message.error(`Không lưu được khách thuê: ${errorMessageFromUnknown(e)}`)
    } finally {
      setTenantSaving(false)
    }
  }

  const handleDeleteTenant = async (tenant: Tenant) => {
    try {
      await tenantApi.delete(tenant.id)
      setTenants(tenants.filter((item) => item.id !== tenant.id))
      message.success('Đã xóa khách thuê')
    } catch (e: unknown) {
      message.error(`Không xóa được khách thuê: ${errorMessageFromUnknown(e)}`)
    }
  }

  return {
    tenants,
    tenantModalOpen,
    tenantModalMode,
    tenantEditing,
    tenantSaving,
    tenantForm,
    openCreateTenant,
    openEditTenant,
    closeTenantModal,
    handleSaveTenant,
    handleDeleteTenant,
  }
}
