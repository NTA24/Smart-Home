import { useState } from 'react'
import { Table, Select, Input, Button, Space, Drawer, Tabs, Typography, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { TeamOutlined, ExportOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons'
import { PageContainer, PageHeader, ContentCard } from '@/components'

const { Text } = Typography

const MOCK_PEOPLE = [
  { key: '1', name: 'Nguyen Van A', id: 'NV001', type: 'Resident', tenantUnit: 'Apt A-1201', zoneFloor: 'Tower A/F12', status: 'ACTIVE' },
  { key: '2', name: 'Tran Linh', id: 'NV002', type: 'Employee', tenantUnit: 'ABC Corp', zoneFloor: 'Office/F10', status: 'ACTIVE' },
  { key: '3', name: 'Bao Nguyen', id: 'NV003', type: 'Contractor', tenantUnit: 'XYZ Ltd', zoneFloor: 'Service/F-B1', status: 'EXPIRED' },
  { key: '4', name: 'GHN Delivery', id: 'V001', type: 'Visitor', tenantUnit: '(Invited)', zoneFloor: 'Lobby', status: 'CHECKIN' },
]

function PersonDetailDrawer({
  open,
  onClose,
  person,
  t,
}: {
  open: boolean
  onClose: () => void
  person: (typeof MOCK_PEOPLE)[0] | null
  t: (key: string, fallback?: string) => string
}) {
  if (!person) return null
  const tabItems = [
    {
      key: 'profile',
      label: t('peopleDirectory.profile', 'Profile'),
      children: (
        <div className="space-y-4">
          <div><Text type="secondary">Phone:</Text> 09xx...</div>
          <div><Text type="secondary">Email:</Text> a@...</div>
          <div><Text type="secondary">{t('peopleDirectory.tenantUnit', 'Tenant/Unit')}:</Text> {person.tenantUnit}</div>
          <div><Text type="secondary">{t('peopleDirectory.status', 'Status')}:</Text> {person.status}</div>
          <div><Text type="secondary">Created:</Text> 2026-02-10</div>
          <div><Text type="secondary">Owner:</Text> Building Admin</div>
          <div><Text type="secondary">Tags:</Text> <Tag>VIP</Tag> <Tag>Parking A</Tag></div>
        </div>
      ),
    },
    {
      key: 'credentials',
      label: t('peopleDirectory.credentials', 'Credentials'),
      children: (
        <div className="flex flex-wrap gap-8">
          <div className="flex-1 min-w-0">
            <div>RFID Card: 0xA12F... (ACTIVE)</div>
            <div>Mobile Key: iOS BLE (ACTIVE)</div>
            <div>Face ID: (NOT ENROLLED)</div>
          </div>
          <div>
            <Button size="small" className="block mb-4">{t('peopleDirectory.addCredential', 'Add Credential')}</Button>
            <Button size="small" className="block mb-4">{t('peopleDirectory.disable', 'Disable')}</Button>
            <Button size="small" className="block mb-4">{t('peopleDirectory.resetMobileKey', 'Reset Mobile Key')}</Button>
            <Button size="small" className="block">{t('peopleDirectory.enrollFace', 'Enroll Face')}</Button>
          </div>
        </div>
      ),
    },
    {
      key: 'access',
      label: t('peopleDirectory.accessRules', 'Access Rules'),
      children: (
        <div className="space-y-2">
          <div><Text type="secondary">Areas:</Text> Lobby, Elevator, Floor 12, Parking A</div>
          <div><Text type="secondary">Time:</Text> Always</div>
          <div><Text type="secondary">Exceptions:</Text> Gym only 06:00-22:00</div>
        </div>
      ),
    },
    {
      key: 'history',
      label: t('peopleDirectory.history', 'History'),
      children: (
        <Table
          size="small"
          pagination={false}
          dataSource={[
            { time: '10:02 2026-02-25', point: 'Lobby Gate', result: 'OK', method: 'Mobile Key', ref: 'EVT-9321' },
            { time: '10:05 2026-02-25', point: 'Elevator Panel', result: 'OK', method: 'RFID Card', ref: 'EVT-9322' },
            { time: '22:14 2026-02-24', point: 'Parking A Barrier', result: 'DENY', method: 'Mobile Key', ref: 'EVT-9100' },
          ]}
          columns={[
            { title: t('peopleDirectory.time', 'Time'), dataIndex: 'time', key: 'time', width: 140 },
            { title: t('peopleDirectory.point', 'Point'), dataIndex: 'point', key: 'point' },
            { title: t('peopleDirectory.result', 'Result'), dataIndex: 'result', key: 'result', width: 70 },
            { title: t('peopleDirectory.method', 'Method'), dataIndex: 'method', key: 'method', width: 100 },
            { title: 'Ref', dataIndex: 'ref', key: 'ref', width: 90 },
          ]}
        />
      ),
    },
    {
      key: 'notes',
      label: t('peopleDirectory.notes', 'Notes'),
      children: <Text type="secondary">{t('common.noData')}</Text>,
    },
  ]
  return (
    <Drawer
      title={`${t('peopleDirectory.personDetail', 'Person Detail')}: ${person.name} (${person.type})`}
      width={520}
      open={open}
      onClose={onClose}
      extra={
        <Space>
          <Button size="small">{t('common.edit', 'Edit')}</Button>
          <Button size="small">{t('peopleDirectory.more', 'More')} <DownOutlined /></Button>
        </Space>
      }
    >
      <Tabs items={tabItems} />
    </Drawer>
  )
}

export default function PeopleDirectory() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [tenantFilter, setTenantFilter] = useState<string>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [credentialFilter, setCredentialFilter] = useState<string>('all')
  const [updatedFilter, setUpdatedFilter] = useState<string>('30d')
  const [sortBy, setSortBy] = useState<string>('name')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [drawerPerson, setDrawerPerson] = useState<(typeof MOCK_PEOPLE)[0] | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = MOCK_PEOPLE.filter((row) => {
    if (search && !row.name.toLowerCase().includes(search.toLowerCase()) && !row.id.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && row.type !== typeFilter) return false
    if (statusFilter !== 'all' && row.status !== statusFilter) return false
    return true
  })

  const columns = [
    {
      title: t('peopleDirectory.nameId', 'Name/ID'),
      key: 'name',
      width: 200,
      render: (_: unknown, r: (typeof MOCK_PEOPLE)[0]) => (
        <span className="cursor-pointer hover:underline" onClick={() => setDrawerPerson(r)}>
          {r.name} ({r.id})
        </span>
      ),
    },
    { title: t('peopleDirectory.type', 'Type'), dataIndex: 'type', key: 'type', width: 110 },
    { title: t('peopleDirectory.tenantUnit', 'Tenant/Unit'), dataIndex: 'tenantUnit', key: 'tenantUnit', width: 140 },
    { title: t('peopleDirectory.zoneFloor', 'Zone/Floor'), dataIndex: 'zoneFloor', key: 'zoneFloor', width: 130 },
    {
      title: t('peopleDirectory.status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => <Tag color={v === 'ACTIVE' ? 'green' : v === 'CHECKIN' ? 'blue' : 'default'}>{v}</Tag>,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('peopleDirectory.title', 'People Directory')}
        icon={<TeamOutlined />}
        subtitle={t('peopleDirectory.subtitle', 'List + filter by type, tenant, zone, status')}
        actions={
          <Space>
            <Button icon={<ExportOutlined />}>{t('common.export', 'Export')}</Button>
            <Button type="primary" icon={<PlusOutlined />}>{t('peopleDirectory.add', '+ Add')}</Button>
          </Space>
        }
      />
      <ContentCard>
        <div className="mb-12 flex flex-wrap gap-8 align-center">
          <Input
            placeholder={t('common.search', 'Search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }, { value: 'Resident', label: 'Resident' }, { value: 'Employee', label: 'Employee' }, { value: 'Contractor', label: 'Contractor' }, { value: 'Visitor', label: 'Visitor' }]} />
          <Select value={tenantFilter} onChange={setTenantFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }]} />
          <Select value={zoneFilter} onChange={setZoneFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }]} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }, { value: 'ACTIVE', label: 'ACTIVE' }, { value: 'EXPIRED', label: 'EXPIRED' }, { value: 'CHECKIN', label: 'CHECKIN' }]} />
          <Select value={buildingFilter} onChange={setBuildingFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }]} />
          <Select value={credentialFilter} onChange={setCredentialFilter} style={{ width: 120 }} options={[{ value: 'all', label: t('common.all', 'All') }]} />
          <Select value={updatedFilter} onChange={setUpdatedFilter} style={{ width: 130 }} options={[{ value: '30d', label: t('peopleDirectory.last30d', 'Last 30d') }]} />
          <Select value={sortBy} onChange={setSortBy} style={{ width: 110 }} options={[{ value: 'name', label: t('peopleDirectory.sortName', 'Name') }]} />
        </div>
        <Table
          size="small"
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          columns={columns}
          dataSource={filtered}
          pagination={{ current: page, pageSize, total: filtered.length, onChange: setPage, showSizeChanger: false }}
          onRow={(r) => ({ onClick: () => setDrawerPerson(r), style: { cursor: 'pointer' } })}
        />
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <Text type="secondary">Bulk:</Text>
          <Button size="small">{t('peopleDirectory.deactivate', 'Deactivate')}</Button>
          <Button size="small">{t('peopleDirectory.suspend', 'Suspend')}</Button>
          <Button size="small">{t('peopleDirectory.assignRole', 'Assign Role')}</Button>
          <Button size="small">{t('peopleDirectory.moveTenant', 'Move Tenant')}</Button>
        </div>
      </ContentCard>
      <PersonDetailDrawer open={!!drawerPerson} onClose={() => setDrawerPerson(null)} person={drawerPerson} t={t} />
    </PageContainer>
  )
}
