import { useMemo, useState } from 'react'
import { Table, Select, Input, Button, Space, Drawer, Tag, Modal, message, Form, Switch } from 'antd'
import { useTranslation } from 'react-i18next'
import { BellOutlined, SettingOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'

type SeverityKey = 'HIGH' | 'MED' | 'LOW'
type AlertTypeKey = 'Forced Door Open' | 'Elevator Door Held' | 'Visitor Overstay'
type LocationKey = 'Server Room' | 'Tower A / Lift 2' | 'Lobby'
type StatusKey = 'OPEN' | 'ACK' | 'CLOSED'

const SEVERITY_LABEL_KEY: Record<SeverityKey, string> = {
  HIGH: 'alertsPage.severityHigh',
  MED: 'alertsPage.severityMed',
  LOW: 'alertsPage.severityLow',
}

const TYPE_LABEL_KEY: Record<AlertTypeKey, string> = {
  'Forced Door Open': 'alertsPage.typeForcedDoorOpen',
  'Elevator Door Held': 'alertsPage.typeElevatorDoorHeld',
  'Visitor Overstay': 'alertsPage.typeVisitorOverstay',
}

const LOCATION_LABEL_KEY: Record<string, string> = {
  'Server Room': 'alertsPage.locationServerRoom',
  'Tower A / Lift 2': 'alertsPage.locationTowerALift2',
  'Lobby': 'alertsPage.locationLobby',
}

const STATUS_LABEL_KEY: Record<StatusKey, string> = {
  OPEN: 'alertsPage.statusOpen',
  ACK: 'alertsPage.statusAck',
  CLOSED: 'alertsPage.statusClosed',
}

type AlertRow = { key: string; severity: SeverityKey; time: string; type: AlertTypeKey; location: LocationKey; assignee: string; status: StatusKey }
const INITIAL_ALERTS: AlertRow[] = [
  { key: '1', severity: 'HIGH', time: '10:06', type: 'Forced Door Open', location: 'Server Room', assignee: '-', status: 'OPEN' },
  { key: '2', severity: 'MED', time: '10:02', type: 'Elevator Door Held', location: 'Tower A / Lift 2', assignee: 'Security1', status: 'ACK' },
  { key: '3', severity: 'LOW', time: '09:40', type: 'Visitor Overstay', location: 'Lobby', assignee: '-', status: 'OPEN' },
]

const SEVERITY_OPTIONS = [{ value: 'all', labelKey: 'alertsPage.filterAll' }, { value: 'HIGH', labelKey: 'alertsPage.severityHigh' }, { value: 'MED', labelKey: 'alertsPage.severityMed' }, { value: 'LOW', labelKey: 'alertsPage.severityLow' }] as const
const TYPE_OPTIONS = [{ value: 'all', labelKey: 'alertsPage.filterAll' }, { value: 'Forced Door Open', labelKey: 'alertsPage.typeForcedDoorOpen' }, { value: 'Elevator Door Held', labelKey: 'alertsPage.typeElevatorDoorHeld' }, { value: 'Visitor Overstay', labelKey: 'alertsPage.typeVisitorOverstay' }] as const
const LOCATION_OPTIONS = [{ value: 'all', labelKey: 'alertsPage.filterAll' }, { value: 'Server Room', labelKey: 'alertsPage.locationServerRoom' }, { value: 'Tower A / Lift 2', labelKey: 'alertsPage.locationTowerALift2' }, { value: 'Lobby', labelKey: 'alertsPage.locationLobby' }] as const
const STATUS_OPTIONS = [{ value: 'OPEN', labelKey: 'alertsPage.statusOpen' }, { value: 'ACK', labelKey: 'alertsPage.statusAck' }, { value: 'CLOSED', labelKey: 'alertsPage.statusClosed' }] as const
const REFRESH_OPTIONS = [{ value: '10s', labelKey: 'alertsPage.refresh10s' }, { value: '30s', labelKey: 'alertsPage.refresh30s' }, { value: '1m', labelKey: 'alertsPage.refresh1m' }] as const

export default function AlertsPage() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState<AlertRow[]>(() => [...INITIAL_ALERTS])
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('OPEN')
  const [refreshInterval, setRefreshInterval] = useState<string>('10s')
  const [search, setSearch] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<AlertRow | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigneeValue, setAssigneeValue] = useState('')
  const [incidentModalOpen, setIncidentModalOpen] = useState(false)
  const [incidentForm] = Form.useForm()
  const [incidents, setIncidents] = useState<Array<{ id: string; alertKey: string; title: string; priority: string; createdAt: string }>>([])
  const [settingsNotify, setSettingsNotify] = useState(true)
  const [settingsSound, setSettingsSound] = useState(true)
  const [settingsDefaultSeverity, setSettingsDefaultSeverity] = useState<string>('HIGH')

  const filteredAlerts = useMemo(() => {
    return alerts.filter((row) => {
      if (severityFilter !== 'all' && row.severity !== severityFilter) return false
      if (locationFilter !== 'all' && row.location !== locationFilter) return false
      if (typeFilter !== 'all' && row.type !== typeFilter) return false
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const typeLabel = t(TYPE_LABEL_KEY[row.type] || row.type).toLowerCase()
        const locLabel = t(LOCATION_LABEL_KEY[row.location] || row.location).toLowerCase()
        if (!typeLabel.includes(q) && !locLabel.includes(q) && !row.assignee.toLowerCase().includes(q) && !row.time.includes(q)) return false
      }
      return true
    })
  }, [t, severityFilter, locationFilter, typeFilter, statusFilter, search, alerts])

  const handleAcknowledge = () => {
    if (!selectedAlert) return
    setAlerts((prev) => prev.map((a) => (a.key === selectedAlert.key ? { ...a, status: 'ACK' as StatusKey } : a)))
    setSelectedAlert((a) => (a ? { ...a, status: 'ACK' } : null))
    message.success(t('alertsPage.ackSuccess', 'Đã xác nhận cảnh báo'))
  }

  const handleAssign = () => {
    setAssigneeValue(selectedAlert?.assignee ?? '-')
    setAssignModalOpen(true)
  }

  const handleAssignSubmit = () => {
    if (!selectedAlert) return
    const name = assigneeValue.trim() || '-'
    setAlerts((prev) => prev.map((a) => (a.key === selectedAlert.key ? { ...a, assignee: name } : a)))
    setSelectedAlert((a) => (a ? { ...a, assignee: name } : null))
    setAssignModalOpen(false)
    setAssigneeValue('')
    message.success(t('alertsPage.assignSuccess', 'Đã gán người xử lý'))
  }

  const handleResolve = () => {
    if (!selectedAlert) return
    setAlerts((prev) => prev.map((a) => (a.key === selectedAlert.key ? { ...a, status: 'CLOSED' as StatusKey } : a)))
    setSelectedAlert(null)
    message.success(t('alertsPage.resolveSuccess', 'Đã đánh dấu đã xử lý'))
  }

  const handleCreateIncident = () => {
    if (!selectedAlert) return
    incidentForm.setFieldsValue({
      title: `${t(TYPE_LABEL_KEY[selectedAlert.type])} - ${selectedAlert.location}`,
      priority: selectedAlert.severity,
      description: '',
    })
    setIncidentModalOpen(true)
  }

  const handleIncidentSubmit = () => {
    incidentForm.validateFields().then((values) => {
      const newIncident = {
        id: `inc-${Date.now()}`,
        alertKey: selectedAlert!.key,
        title: values.title,
        priority: values.priority,
        createdAt: new Date().toLocaleString(),
      }
      setIncidents((prev) => [newIncident, ...prev])
      setIncidentModalOpen(false)
      incidentForm.resetFields()
      message.success(t('alertsPage.incidentCreated', 'Đã tạo sự cố và ghi nhận'))
    }).catch(() => {})
  }

  const handleAddNote = () => {
    message.info(t('alertsPage.addNoteHint', 'Thêm ghi chú'))
  }

  const columns = [
    {
      title: t('alertsPage.sev', 'Sev'),
      dataIndex: 'severity',
      key: 'severity',
      width: 90,
      render: (v: SeverityKey) => <Tag color={v === 'HIGH' ? 'red' : v === 'MED' ? 'orange' : 'default'}>{t(SEVERITY_LABEL_KEY[v])}</Tag>,
    },
    { title: t('alertsPage.time', 'Time'), dataIndex: 'time', key: 'time', width: 70 },
    {
      title: t('alertsPage.type', 'Type'),
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (v: AlertTypeKey) => t(TYPE_LABEL_KEY[v] || v),
    },
    {
      title: t('alertsPage.location', 'Location'),
      dataIndex: 'location',
      key: 'location',
      width: 160,
      render: (v: string) => t(LOCATION_LABEL_KEY[v] || v),
    },
    { title: t('alertsPage.assignee', 'Assignee'), dataIndex: 'assignee', key: 'assignee', width: 100 },
    {
      title: t('alertsPage.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: StatusKey) => t(STATUS_LABEL_KEY[v] || v),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('alertsPage.title', 'Alerts (Realtime)')}
        icon={<BellOutlined />}
        subtitle={t('alertsPage.subtitle', 'Realtime + processing')}
        actions={
          <Button type="link" size="small" className="p-0" icon={<SettingOutlined />} onClick={() => setSettingsOpen(true)}>{t('common.settings', 'Cài đặt')}</Button>
        }
      />
      <ContentCard>
        <div className="mb-12 flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('alertsPage.filterSeverity', 'Severity')}</span>
            <Select
              value={severityFilter}
              onChange={setSeverityFilter}
              style={{ width: 140 }}
              placeholder={t('alertsPage.filterAll', 'All')}
              options={SEVERITY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('alertsPage.filterType', 'Alert type')}</span>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 180 }}
              placeholder={t('alertsPage.filterAll', 'All')}
              options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('alertsPage.filterLocation', 'Location')}</span>
            <Select
              value={locationFilter}
              onChange={setLocationFilter}
              style={{ width: 180 }}
              placeholder={t('alertsPage.filterAll', 'All')}
              options={LOCATION_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('alertsPage.filterStatus', 'Status')}</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 130 }}
              placeholder={t('alertsPage.filterAll', 'All')}
              options={[{ value: 'all', label: t('alertsPage.filterAll') }, ...STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('alertsPage.refreshInterval', 'Refresh')}</span>
            <Select
              value={refreshInterval}
              onChange={setRefreshInterval}
              style={{ width: 130 }}
              options={REFRESH_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-secondary whitespace-nowrap">{t('common.search', 'Search')}</span>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 180 }} placeholder={t('common.search', 'Search')} />
          </div>
        </div>
        <div className="mb-8"><strong>{t('alertsPage.openAlerts', 'Open Alerts')}</strong></div>
        <Table
          size="small"
          columns={columns}
          dataSource={filteredAlerts}
          pagination={false}
          onRow={(r) => ({ onClick: () => setSelectedAlert(r), style: { cursor: 'pointer' } })}
        />
      </ContentCard>
      <Drawer
        title={t('alertsPage.selectedDetail', 'Selected Alert Detail')}
        width={400}
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
      >
        {selectedAlert && (
          <>
            <ul className="list-disc pl-4 mb-12"><li>{t('alertsPage.drawerHint', 'Timeline, related access events, camera snapshot (if any)')}</li></ul>
            <Space wrap>
              <Button size="small" onClick={handleAcknowledge}>{t('alertsPage.acknowledge', 'Xác nhận')}</Button>
              <Button size="small" onClick={handleAssign}>{t('alertsPage.assign', 'Gán')}</Button>
              <Button size="small" onClick={handleResolve}>{t('alertsPage.resolve', 'Đã xử lý')}</Button>
              <Button size="small" onClick={handleCreateIncident}>{t('alertsPage.createIncident', 'Tạo sự cố')}</Button>
              <Button size="small" onClick={handleAddNote}>{t('alertsPage.addNote', 'Thêm ghi chú')}</Button>
            </Space>
          </>
        )}
      </Drawer>

      <Modal
        className="alerts-page-settings-modal"
        title={t('common.settings', 'Cài đặt')}
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsOpen(false)}>{t('common.cancel', 'Hủy')}</Button>,
          <Button key="save" type="primary" onClick={() => { message.success(t('alertsPage.settingsSaved', 'Đã lưu cài đặt')); setSettingsOpen(false) }}>{t('common.save', 'Lưu')}</Button>,
        ]}
        width={440}
      >
        <div className="alerts-settings-body">
          <div className="alerts-settings-row">
            <span className="alerts-settings-label">{t('alertsPage.settingsNotifyNew', 'Thông báo khi có cảnh báo mới')}</span>
            <Switch checked={settingsNotify} onChange={setSettingsNotify} />
          </div>
          <div className="alerts-settings-row">
            <span className="alerts-settings-label">{t('alertsPage.settingsSound', 'Phát âm thanh cảnh báo')}</span>
            <Switch checked={settingsSound} onChange={setSettingsSound} />
          </div>
          <div className="alerts-settings-field">
            <label className="alerts-settings-field-label">{t('alertsPage.settingsDefaultSeverity', 'Mức độ ưu tiên mặc định')}</label>
            <Select
              value={settingsDefaultSeverity}
              onChange={setSettingsDefaultSeverity}
              className="alerts-settings-select"
              options={[
                { value: 'HIGH', label: t('alertsPage.severityHigh') },
                { value: 'MED', label: t('alertsPage.severityMed') },
                { value: 'LOW', label: t('alertsPage.severityLow') },
              ]}
            />
          </div>
          <div className="alerts-settings-note">
            {t('alertsPage.settingsIntegrations', 'Tích hợp: Email, Slack (cấu hình tại Hệ thống).')}
          </div>
        </div>
      </Modal>

      <Modal
        title={t('alertsPage.createIncident', 'Tạo sự cố')}
        open={incidentModalOpen}
        onCancel={() => { setIncidentModalOpen(false); incidentForm.resetFields() }}
        onOk={handleIncidentSubmit}
        okText={t('alertsPage.createIncidentSubmit', 'Tạo sự cố')}
        cancelText={t('common.cancel', 'Hủy')}
        width={480}
      >
        <Form form={incidentForm} layout="vertical" className="mt-8">
          <Form.Item name="title" label={t('alertsPage.incidentTitle', 'Tiêu đề sự cố')} rules={[{ required: true }]}>
            <Input placeholder={t('alertsPage.incidentTitlePlaceholder', 'Từ cảnh báo đang chọn')} />
          </Form.Item>
          <Form.Item name="priority" label={t('alertsPage.incidentPriority', 'Mức độ ưu tiên')}>
            <Select
              options={[
                { value: 'HIGH', label: t('alertsPage.severityHigh') },
                { value: 'MED', label: t('alertsPage.severityMed') },
                { value: 'LOW', label: t('alertsPage.severityLow') },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label={t('alertsPage.incidentDescription', 'Mô tả')}>
            <Input.TextArea rows={3} placeholder={t('alertsPage.incidentDescriptionPlaceholder', 'Ghi chú thêm (tùy chọn)')} />
          </Form.Item>
        </Form>
        {incidents.length > 0 && (
          <div className="mt-8 pt-8 border-t text-sm text-secondary">
            {t('alertsPage.incidentsCreatedCount', 'Đã tạo {{count}} sự cố từ cảnh báo', { count: incidents.length })}
          </div>
        )}
      </Modal>

      <Modal
        title={t('alertsPage.assign', 'Gán người xử lý')}
        open={assignModalOpen}
        onCancel={() => { setAssignModalOpen(false); setAssigneeValue('') }}
        onOk={handleAssignSubmit}
        okText={t('common.confirm', 'Xác nhận')}
        cancelText={t('common.cancel', 'Hủy')}
      >
        <div className="py-8">
          <label className="block text-sm text-secondary mb-4">{t('alertsPage.assignee', 'Người xử lý')}</label>
          <Input value={assigneeValue} onChange={(e) => setAssigneeValue(e.target.value)} placeholder="Security1, An ninh..." />
        </div>
      </Modal>
    </PageContainer>
  )
}
