import { useState, useEffect } from 'react'
import { Button, Input, Space, Table, Checkbox, message, Modal, Select, Drawer, Tabs, Form, Switch } from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  RollbackOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
  CopyOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { PageContainer, ContentCard } from '@/components'
import { thingsBoardApi } from '@/services'
import dayjs from 'dayjs'

interface DashboardItem {
  id?: { id?: string }
  createdTime?: number
  title?: string
  customerId?: { id?: string }
  customerTitle?: string
  customerIsPublic?: boolean
  public?: boolean
  // Some TB APIs return assigned customers array with public flag
  assignedCustomers?: Array<{ title?: string; public?: boolean }>
}

function getDashboardId(r: DashboardItem): string {
  if (!r?.id) return ''
  return typeof r.id === 'object' && r.id !== null && 'id' in r ? (r.id as { id?: string }).id ?? '' : String(r.id)
}

function dashboardHasCustomer(d: DashboardItem): boolean {
  const cid = d?.customerId
  const hasId = cid && (typeof cid === 'object' && cid !== null && 'id' in cid ? (cid as { id?: string }).id : String(cid).trim())
  const hasTitle = d?.customerTitle && String(d.customerTitle).trim()
  const hasAssigned =
    Array.isArray((d as unknown as { assignedCustomers?: Array<unknown> }).assignedCustomers) &&
    (d as unknown as { assignedCustomers?: Array<unknown> }).assignedCustomers!.length > 0
  return !!(hasId || hasTitle || hasAssigned)
}

function dashboardIsPublic(d: DashboardItem): boolean {
  const direct = typeof d.customerIsPublic === 'boolean' ? d.customerIsPublic : (d as { public?: boolean }).public
  if (typeof direct === 'boolean') return direct

  const fromAssigned =
    Array.isArray(d.assignedCustomers) && d.assignedCustomers.some((c) => !!c.public)

  const title =
    d.customerTitle ||
    (Array.isArray(d.assignedCustomers) && d.assignedCustomers[0]?.title) ||
    ''
  const fromTitle = title && title.toLowerCase() === 'public'

  return !!(fromAssigned || fromTitle)
}

export default function EnergyDeviceDashboardPage() {
  const { t } = useTranslation()
  const [dashboards, setDashboards] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignCustomerId, setAssignCustomerId] = useState<string | null>(null)
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([])
  const [makePublicModalOpen, setMakePublicModalOpen] = useState(false)
  const [makePublicName, setMakePublicName] = useState('')
  const [makePublicIds, setMakePublicIds] = useState<string[]>([])
  const [makePrivateModalOpen, setMakePrivateModalOpen] = useState(false)
  const [makePrivateName, setMakePrivateName] = useState('')
  const [makePrivateIds, setMakePrivateIds] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteName, setDeleteName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [assignLoading, setAssignLoading] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsDashboard, setDetailsDashboard] = useState<{ id: string; title: string } | null>(null)
  const [detailsTab, setDetailsTab] = useState('details')
  const [detailsForm] = Form.useForm()

  const fetchDashboards = (p = page, size = pageSize) => {
    setLoading(true)
    thingsBoardApi
      .getTenantDashboards({
        pageSize: size,
        page: p,
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
      })
      .then((res) => {
        const data = (res?.data ?? []) as DashboardItem[]
        setDashboards(data)
        setTotal((res as { totalElements?: number }).totalElements ?? data.length)
      })
      .catch((err) => {
        message.error(err?.response?.data?.message ?? err?.message ?? t('common.loadFailed'))
        setDashboards([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboards(0, pageSize)
  }, [])

  const filteredData = searchText.trim()
    ? dashboards.filter((d) => (d.title ?? '').toLowerCase().includes(searchText.trim().toLowerCase()))
    : dashboards

  const exportToExcel = () => {
    const headers = [
      t('energyDeviceDashboard.createdTime', 'Created time'),
      t('energyDeviceDashboard.deviceName', 'Tên thiết bị'),
      t('energyDeviceDashboard.assignedToCustomers', 'Assigned to customers'),
      t('energyDeviceDashboard.public', 'Public'),
    ]
    const rows = filteredData.map((d) => [
      d.createdTime ? dayjs(d.createdTime).format('YYYY-MM-DD HH:mm:ss') : '—',
      d.title ?? '—',
      d.customerTitle ?? '—',
      dashboardIsPublic(d) ? t('common.yes', 'Có') : t('common.no', 'Không'),
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, t('energyDeviceDashboard.sheetName', 'Thiết bị'))
    const fileName = `thiet-bi_${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`
    XLSX.writeFile(wb, fileName)
    message.success(t('energyDeviceDashboard.exportSuccess', 'Đã xuất file Excel'))
  }

  const selectedDashboards = filteredData.filter((d) => selectedRowKeys.includes(getDashboardId(d)))
  const anyPublic = selectedDashboards.some(dashboardIsPublic)
  const anyHasCustomer = selectedDashboards.some(dashboardHasCustomer)

  const handleMakePublic = () => {
    const ids = makePublicIds.length ? makePublicIds : selectedDashboards.map(getDashboardId).filter(Boolean)
    Promise.all(ids.map((id) => thingsBoardApi.makeDashboardPublic(id)))
      .then(() => {
        message.success(t('energyDeviceDashboard.makePublicSuccess', 'Đã chuyển thiết bị sang công khai'))
        setMakePublicModalOpen(false)
        setMakePublicIds([])
        fetchDashboards(page, pageSize)
        setSelectedRowKeys([])
      })
      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.error')))
  }

  const handleMakePrivate = () => {
    const ids = makePrivateIds.length
      ? makePrivateIds
      : selectedDashboards.filter(dashboardIsPublic).map(getDashboardId).filter(Boolean)
    Promise.all(ids.map((id) => thingsBoardApi.makeDashboardPrivate(id)))
      .then(() => {
        message.success(t('energyDeviceDashboard.makePrivateSuccess', 'Đã chuyển thiết bị sang riêng tư'))
        setMakePrivateModalOpen(false)
        setMakePrivateIds([])
        fetchDashboards(page, pageSize)
        setSelectedRowKeys([])
      })
      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.error')))
  }

  const handleAssign = () => {
    if (!assignCustomerId) {
      message.warning(t('energyDeviceDashboard.selectCustomer', 'Chọn khách hàng'))
      return
    }
    const ids = selectedDashboards.map(getDashboardId).filter(Boolean)
    setAssignLoading(true)
    Promise.all(ids.map((id) => thingsBoardApi.assignDashboardToCustomer(assignCustomerId, id)))
      .then(() => {
        message.success(t('energyDeviceDashboard.assignSuccess', 'Đã gán thiết bị cho khách hàng'))
        setAssignModalOpen(false)
        setAssignCustomerId(null)
        fetchDashboards(page, pageSize)
        setSelectedRowKeys([])
      })
      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.error')))
      .finally(() => setAssignLoading(false))
  }

  const handleDelete = (id: string) => {
    thingsBoardApi
      .deleteDashboard(id)
      .then(() => {
        message.success(t('energyDeviceDashboard.deleteSuccess', 'Đã xóa thiết bị'))
        setDeleteModalOpen(false)
        setDeleteId(null)
        fetchDashboards(page, pageSize)
        setSelectedRowKeys((k) => k.filter((key) => key !== id))
      })
      .catch((err) => message.error(err?.response?.data?.message ?? err?.message ?? t('common.error')))
  }

  const openAssignModal = () => {
    setAssignModalOpen(true)
    thingsBoardApi
      .getCustomers({ pageSize: 100 })
      .then((res: { data?: Array<{ id?: { id?: string }; title?: string }> }) => {
        const list = (res?.data ?? []) as Array<{ id?: { id?: string }; title?: string }>
        setCustomerOptions(
          list.map((c) => ({
            value: (c.id && typeof c.id === 'object' && 'id' in c ? (c.id as { id?: string }).id : String(c.id)) ?? '',
            label: (c as { title?: string }).title ?? (c as { name?: string }).name ?? '',
          }))
        )
      })
      .catch(() => setCustomerOptions([]))
  }

  const actionCol = {
    title: '',
    key: 'actions',
    width: 220,
    fixed: 'right' as const,
    render: (_: unknown, record: DashboardItem) => {
      const id = getDashboardId(record)
      const name = record?.title ?? id
      const isPublic = dashboardIsPublic(record)
      const hasCustomer = dashboardHasCustomer(record)
      return (
        <Space size={4} wrap>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            title={t('energyDeviceDashboard.download', 'Tải xuống')}
            onClick={exportToExcel}
          />
          <Button
            type="text"
            icon={<ShareAltOutlined />}
            title={t('energyDeviceDashboard.makePublic', 'Chuyển sang công khai')}
            disabled={isPublic}
            onClick={() => {
              setMakePublicIds([id])
              setMakePublicName(name)
              setMakePublicModalOpen(true)
            }}
          />
          <Button
            type="text"
            icon={<RollbackOutlined />}
            title={t('energyDeviceDashboard.makePrivate', 'Chuyển sang riêng tư')}
            disabled={!isPublic}
            onClick={() => {
              setMakePrivateIds([id])
              setMakePrivateName(name)
              setMakePrivateModalOpen(true)
            }}
          />
          <Button
            type="text"
            icon={<UserOutlined />}
            title={t('energyDeviceDashboard.assignToCustomer', 'Gán cho khách hàng')}
            disabled={hasCustomer}
            onClick={() => {
              setSelectedRowKeys([id])
              openAssignModal()
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            title={t('energyDeviceDashboard.dashboardDetails', 'Chi tiết thiết bị')}
            onClick={() => {
              setDetailsDashboard({ id, title: name })
              detailsForm.setFieldsValue({ title: name, description: '', hideInMobile: false, mobileOrder: undefined })
              setDetailsTab('details')
              setDetailsOpen(true)
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title={t('energyDeviceConfig.delete', 'Xóa')}
            onClick={() => {
              setDeleteId(id)
              setDeleteName(name)
              setDeleteModalOpen(true)
            }}
          />
        </Space>
      )
    },
  }

  return (
    <PageContainer>
      <ContentCard
        title={t('energyDeviceDashboard.title', 'Bảng điều khiển thiết bị')}
        extra={
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />}>
              {t('common.add', 'Thêm')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchDashboards(page, pageSize)}
              loading={loading}
              title={t('common.refresh', 'Làm mới')}
            />
            <Space.Compact>
              <Input
                placeholder={t('common.search', 'Tìm kiếm')}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </Space.Compact>
          </Space>
        }
      >
        {selectedRowKeys.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={exportToExcel}
            >
              {t('energyDeviceDashboard.exportDashboard', 'Export device')}
            </Button>
            <Space size={4} wrap>
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                title={t('energyDeviceDashboard.makePublic', 'Make device public')}
                disabled={selectedDashboards.every(dashboardIsPublic)}
                onClick={() => {
                  const ids = selectedDashboards.map(getDashboardId).filter(Boolean)
                  setMakePublicIds(ids)
                  setMakePublicName(selectedDashboards[0]?.title ?? ids[0] ?? '—')
                  setMakePublicModalOpen(true)
                }}
              />
              <Button
                type="text"
                icon={<RollbackOutlined />}
                title={t('energyDeviceDashboard.makePrivate', 'Make device private')}
                disabled={!anyPublic}
                onClick={() => {
                  const ids = selectedDashboards.filter(dashboardIsPublic).map(getDashboardId).filter(Boolean)
                  setMakePrivateIds(ids)
                  setMakePrivateName(selectedDashboards.find(dashboardIsPublic)?.title ?? ids[0] ?? '—')
                  setMakePrivateModalOpen(true)
                }}
              />
              <Button
                type="text"
                icon={<UserOutlined />}
                title={t('energyDeviceDashboard.assignToCustomer', 'Assign to customer')}
                disabled={anyHasCustomer}
                onClick={openAssignModal}
              />
              <Button
                type="text"
                icon={<EditOutlined />}
                title={t('energyDeviceDashboard.dashboardDetails', 'Device details')}
                onClick={() => {
                  const d = selectedDashboards[0]
                  if (d) {
                    setDetailsDashboard({ id: getDashboardId(d), title: d.title ?? '' })
                    detailsForm.setFieldsValue({ title: d.title ?? '', description: '', hideInMobile: false, mobileOrder: undefined })
                    setDetailsTab('details')
                    setDetailsOpen(true)
                  }
                }}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                title={t('energyDeviceConfig.delete', 'Delete')}
                onClick={() => {
                  if (selectedDashboards.length === 1) {
                    setDeleteId(getDashboardId(selectedDashboards[0]))
                    setDeleteName(selectedDashboards[0]?.title ?? '')
                    setDeleteModalOpen(true)
                  } else {
                    message.info(t('energyDeviceDashboard.selectOneToDelete', 'Chọn một thiết bị để xóa'))
                  }
                }}
              />
            </Space>
          </div>
        )}
        <Table<DashboardItem>
          rowKey={(r) => getDashboardId(r) || String(Math.random())}
          loading={loading}
          dataSource={filteredData}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys ?? []),
          }}
          pagination={{
            current: page + 1,
            pageSize,
            total: searchText.trim() ? filteredData.length : total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (n) => `${t('common.total')}: ${n}`,
            onChange: (p, size) => {
              setPage((p ?? 1) - 1)
              setPageSize(size ?? pageSize)
              if (!searchText.trim()) fetchDashboards((p ?? 1) - 1, size ?? pageSize)
            },
          }}
          scroll={{ x: 900 }}
          columns={[
            {
              title: t('energyDeviceDashboard.createdTime', 'Created time'),
              dataIndex: 'createdTime',
              key: 'createdTime',
              width: 180,
              render: (ts: number) => (ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '—'),
            },
            {
              title: t('energyDeviceDashboard.deviceName', 'Tên thiết bị'),
              dataIndex: 'title',
              key: 'title',
              width: 140,
              ellipsis: true,
              render: (v: string) => v || '—',
            },
            {
              title: t('energyDeviceDashboard.assignedToCustomers', 'Assigned to customers'),
              dataIndex: 'customerTitle',
              key: 'assignedToCustomers',
              width: 180,
              ellipsis: true,
              render: (v: string) => v || '—',
            },
            {
              title: t('energyDeviceDashboard.public', 'Public'),
              dataIndex: 'customerIsPublic',
              key: 'isPublic',
              width: 90,
              render: (_: boolean, record: DashboardItem) => <Checkbox checked={dashboardIsPublic(record)} disabled />,
            },
            actionCol,
          ]}
        />
      </ContentCard>

      <Modal
        title={t('energyDeviceDashboard.makePublicConfirmTitle', 'Chuyển thiết bị sang công khai?')}
        open={makePublicModalOpen}
        onOk={handleMakePublic}
        onCancel={() => { setMakePublicModalOpen(false); setMakePublicIds([]) }}
        okText={t('common.yes', 'Có')}
        cancelText={t('common.no', 'Không')}
      >
        {makePublicIds.length <= 1
          ? t('energyDeviceDashboard.makePublicConfirmMessage', 'Bạn có chắc muốn chuyển thiết bị "{{name}}" sang công khai?', { name: makePublicName })
          : t('energyDeviceDashboard.makePublicConfirmMessagePlural', 'Bạn có chắc muốn chuyển {{count}} thiết bị đã chọn sang công khai?', { count: makePublicIds.length })}
      </Modal>

      <Modal
        title={t('energyDeviceDashboard.makePrivateConfirmTitle', 'Chuyển thiết bị sang riêng tư?')}
        open={makePrivateModalOpen}
        onOk={handleMakePrivate}
        onCancel={() => { setMakePrivateModalOpen(false); setMakePrivateIds([]) }}
        okText={t('common.yes', 'Có')}
        cancelText={t('common.no', 'Không')}
      >
        {makePrivateIds.length <= 1
          ? t('energyDeviceDashboard.makePrivateConfirmMessage', 'Bạn có chắc muốn chuyển thiết bị "{{name}}" sang riêng tư?', { name: makePrivateName })
          : t('energyDeviceDashboard.makePrivateConfirmMessagePlural', 'Bạn có chắc muốn chuyển {{count}} thiết bị đã chọn sang riêng tư?', { count: makePrivateIds.length })}
      </Modal>

      <Modal
        title={t('energyDeviceDashboard.assignToCustomerTitle', 'Gán thiết bị')}
        open={assignModalOpen}
        onOk={handleAssign}
        onCancel={() => { setAssignModalOpen(false); setAssignCustomerId(null) }}
        confirmLoading={assignLoading}
        okText={t('common.save', 'Lưu')}
        cancelText={t('common.cancel', 'Hủy')}
      >
        <div className="mb-2">
          <label className="block text-sm text-secondary mb-1">{t('energyDeviceDashboard.customer', 'Khách hàng')}</label>
          <Select
            placeholder={t('energyDeviceDashboard.selectCustomer', 'Chọn khách hàng')}
            allowClear
            style={{ width: '100%' }}
            options={customerOptions}
            value={assignCustomerId}
            onChange={setAssignCustomerId}
          />
        </div>
      </Modal>

      <Modal
        title={t('energyDeviceDashboard.deleteConfirmTitle', 'Xóa thiết bị?')}
        open={deleteModalOpen}
        onOk={() => deleteId && handleDelete(deleteId)}
        onCancel={() => { setDeleteModalOpen(false); setDeleteId(null) }}
        okText={t('energyDeviceConfig.delete', 'Xóa')}
        okButtonProps={{ danger: true }}
        cancelText={t('common.cancel', 'Hủy')}
      >
        {t('energyDeviceDashboard.deleteConfirmMessage', 'Bạn có chắc muốn xóa thiết bị "{{name}}"?', { name: deleteName })}
      </Modal>

      <Drawer
        title={null}
        placement="right"
        width={520}
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setDetailsDashboard(null) }}
        closable={false}
        styles={{ body: { paddingTop: 0 } }}
        extra={
          <Space>
            <Button type="text" icon={<QuestionCircleOutlined />} />
            <Button type="text" icon={<CloseOutlined />} onClick={() => { setDetailsOpen(false); setDetailsDashboard(null) }} />
            <Button type="primary" icon={<EditOutlined />}>{t('common.edit', 'Chỉnh sửa')}</Button>
          </Space>
        }
      >
        {detailsDashboard && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold m-0">{detailsDashboard.title}</h2>
              <p className="text-secondary text-sm mt-1 mb-0">{t('energyDeviceDashboard.dashboardDetails', 'Device details')}</p>
            </div>
            <Tabs
              activeKey={detailsTab}
              onChange={setDetailsTab}
              items={[
                {
                  key: 'details',
                  label: t('energyDeviceDashboard.tabDetails', 'Details'),
                  children: (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button type="primary">{t('energyDeviceDashboard.openDashboard', 'Open device')}</Button>
                        <Button icon={<DownloadOutlined />} onClick={exportToExcel}>{t('energyDeviceDashboard.exportDashboard', 'Export device')}</Button>
                        <Button icon={<UploadOutlined />}>{t('energyDeviceDashboard.uploadNewVersion', 'Upload new version')}</Button>
                        <Button
                          icon={<ShareAltOutlined />}
                          onClick={() => {
                            setMakePublicIds([detailsDashboard.id])
                            setMakePublicName(detailsDashboard.title)
                            setDetailsOpen(false)
                            setMakePublicModalOpen(true)
                          }}
                        >
                          {t('energyDeviceDashboard.makePublic', 'Make device public')}
                        </Button>
                        <Button
                          icon={<UserOutlined />}
                          onClick={() => {
                            setSelectedRowKeys([detailsDashboard.id])
                            setDetailsOpen(false)
                            openAssignModal()
                          }}
                        >
                          {t('energyDeviceDashboard.manageAssignedCustomers', 'Manage assigned customers')}
                        </Button>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setDeleteId(detailsDashboard.id)
                            setDeleteName(detailsDashboard.title)
                            setDetailsOpen(false)
                            setDeleteModalOpen(true)
                          }}
                        >
                          {t('energyDeviceConfig.delete', 'Delete')}
                        </Button>
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => {
                            navigator.clipboard.writeText(detailsDashboard.id).then(() => message.success(t('common.copied', 'Đã copy')))
                          }}
                        >
                          {t('energyDeviceDashboard.copyDashboardId', 'Copy device id')}
                        </Button>
                      </div>
                      <Form form={detailsForm} layout="vertical">
                        <Form.Item name="title" label={t('energyDeviceDashboard.fieldTitle', 'Title') + ' *'} rules={[{ required: true }]}>
                          <Input placeholder={t('energyDeviceDashboard.fieldTitle', 'Title')} />
                        </Form.Item>
                        <Form.Item name="description" label={t('energyDeviceDashboard.description', 'Description')}>
                          <Input.TextArea rows={3} placeholder={t('energyDeviceDashboard.description', 'Description')} />
                        </Form.Item>
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">{t('energyDeviceDashboard.mobileAppSettings', 'Mobile Application Settings')}</div>
                          <Form.Item name="hideInMobile" label={t('energyDeviceDashboard.hideInMobileApp', 'Hide dashboard in mobile application')} valuePropName="checked">
                            <Switch />
                          </Form.Item>
                          <Form.Item name="mobileOrder" label={t('energyDeviceDashboard.dashboardOrderInMobile', 'Dashboard order in mobile application')}>
                            <Input type="number" placeholder="0" />
                          </Form.Item>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">{t('energyDeviceDashboard.dashboardImage', 'Dashboard image')}</div>
                          <div className="border border-dashed rounded p-8 text-center text-secondary">
                            {t('energyDeviceDashboard.noImage', 'No image')}
                          </div>
                        </div>
                      </Form>
                    </>
                  ),
                },
                {
                  key: 'audit',
                  label: t('energyDeviceDashboard.tabAuditLogs', 'Audit logs'),
                  children: <div className="text-secondary py-4">{t('energyDeviceDashboard.auditLogsPlaceholder', 'Audit logs')}</div>,
                },
                {
                  key: 'version',
                  label: t('energyDeviceDashboard.tabVersionControl', 'Version control'),
                  children: <div className="text-secondary py-4">{t('energyDeviceDashboard.versionControlPlaceholder', 'Version control')}</div>,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  )
}
