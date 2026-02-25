import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  PageContainer,
  PageHeader,
  ContentCard,
  DataTable,
  CrudModal,
  TableActionButtons,
  FilterBar,
  SearchInput,
} from '@/components'
import {
  getRobotManagementFilters,
  getRobotManagementItems,
  saveRobotManagementFilters,
  saveRobotManagementItems,
} from '@/services/mockPersistence'
import type { RobotManagementItem as RobotItem } from './robotShared'
import { seedRobotManagementItems } from './robotShared'

type RobotManagementFilters = {
  keyword: string
  status: 'all' | RobotItem['status']
  floor: 'all' | string
}

export default function RobotManagement() {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [robots, setRobots] = useState<RobotItem[]>(() => getRobotManagementItems(seedRobotManagementItems))
  const [filters, setFilters] = useState<RobotManagementFilters>(() => getRobotManagementFilters({
    keyword: '',
    status: 'all',
    floor: 'all',
  }))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingRobot, setViewingRobot] = useState<RobotItem | null>(null)

  useEffect(() => {
    saveRobotManagementItems(robots)
  }, [robots])

  useEffect(() => {
    saveRobotManagementFilters(filters)
  }, [filters])

  const statusTagColor: Record<RobotItem['status'], string> = {
    idle: 'default',
    running: 'processing',
    charging: 'cyan',
    error: 'error',
    offline: 'default',
  }

  const typeLabel: Record<RobotItem['type'], string> = {
    delivery: t('robotDash.missionDeliver'),
    cleaning: t('robotDash.missionClean'),
    patrol: t('robotDash.missionPatrol'),
  }

  const filteredRobots = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return robots.filter((robot) => {
      const matchKeyword = !keyword
        || robot.id.toLowerCase().includes(keyword)
        || robot.name.toLowerCase().includes(keyword)
        || robot.zone.toLowerCase().includes(keyword)
      const matchStatus = filters.status === 'all' || robot.status === filters.status
      const matchFloor = filters.floor === 'all' || robot.floor === filters.floor
      return matchKeyword && matchStatus && matchFloor
    })
  }, [robots, filters])

  const floorOptions = useMemo(() => {
    const values = Array.from(new Set(robots.map((robot) => robot.floor)))
    return [{ value: 'all', label: t('issueTickets.all') }, ...values.map((value) => ({ value, label: value }))]
  }, [robots, t])

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ battery: 60, status: 'idle', type: 'delivery', floor: 'B1' })
    setModalOpen(true)
  }

  const openEditModal = (robot: RobotItem) => {
    setEditingId(robot.id)
    form.setFieldsValue(robot)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setRobots((prev) => prev.filter((robot) => robot.id !== id))
    if (viewingRobot?.id === id) setViewingRobot(null)
  }

  const handleSubmit = (values: RobotItem) => {
    if (editingId) {
      setRobots((prev) => prev.map((robot) => (robot.id === editingId ? { ...robot, ...values } : robot)))
    } else {
      if (robots.some((robot) => robot.id === values.id)) {
        form.setFields([{ name: 'id', errors: ['Robot ID already exists'] }])
        return
      }
      setRobots((prev) => [{ ...values }, ...prev])
    }
    setModalOpen(false)
    setEditingId(null)
    form.resetFields()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: t('common.name'), dataIndex: 'name', key: 'name', width: 160 },
    {
      title: t('robotMission.type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (value: RobotItem['type']) => <Tag>{typeLabel[value]}</Tag>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: RobotItem['status']) => <Tag color={statusTagColor[value]}>{value.toUpperCase()}</Tag>,
    },
    {
      title: t('robotFleet.battery'),
      dataIndex: 'battery',
      key: 'battery',
      width: 100,
      render: (value: number) => `${value}%`,
    },
    { title: t('robotFleet.floor'), dataIndex: 'floor', key: 'floor', width: 90 },
    { title: t('robotFleet.zones'), dataIndex: 'zone', key: 'zone', width: 130 },
    { title: t('robotDetail.lastHeartbeat'), dataIndex: 'lastSeen', key: 'lastSeen', width: 160 },
    {
      title: t('common.action'),
      key: 'action',
      width: 130,
      render: (_: unknown, record: RobotItem) => (
        <TableActionButtons
          onView={() => setViewingRobot(record)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.id)}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('menu.robotManagement')}
        subtitle={`${t('common.total')}: ${filteredRobots.length}`}
        actions={<Button type="primary" onClick={openCreateModal}>{t('apiTest.create')}</Button>}
      />
      <ContentCard>
        <FilterBar className="mb-12">
          <SearchInput
            value={filters.keyword}
            onChange={(value) => setFilters((prev) => ({ ...prev, keyword: value }))}
            placeholder={t('robotDash.searchPlaceholder')}
            width={260}
          />
          <Select
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: t('issueTickets.all') },
              { value: 'idle', label: t('robotDash.statusIdle') },
              { value: 'running', label: t('robotDash.statusRunning') },
              { value: 'charging', label: t('robotDash.statusCharging') },
              { value: 'error', label: t('robotDash.statusError') },
              { value: 'offline', label: t('robotDash.statusOffline') },
            ]}
          />
          <Select
            value={filters.floor}
            onChange={(value) => setFilters((prev) => ({ ...prev, floor: value }))}
            style={{ width: 120 }}
            options={floorOptions}
          />
          <Button onClick={() => setFilters({ keyword: '', status: 'all', floor: 'all' })}>{t('common.reset')}</Button>
        </FilterBar>

        <DataTable<RobotItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredRobots}
          scroll={{ x: 1100 }}
        />
      </ContentCard>

      <CrudModal
        open={modalOpen}
        title={editingId ? t('apiTest.edit') : t('apiTest.create')}
        isEdit={!!editingId}
        form={form}
        onSubmit={handleSubmit}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
          form.resetFields()
        }}
      >
        {!editingId && (
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input placeholder="R-15" />
          </Form.Item>
        )}
        <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Space className="w-full" size={12}>
          <Form.Item className="flex-1" name="type" label={t('robotMission.type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'delivery', label: t('robotDash.missionDeliver') },
                { value: 'cleaning', label: t('robotDash.missionClean') },
                { value: 'patrol', label: t('robotDash.missionPatrol') },
              ]}
            />
          </Form.Item>
          <Form.Item className="flex-1" name="status" label={t('common.status')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'idle', label: t('robotDash.statusIdle') },
                { value: 'running', label: t('robotDash.statusRunning') },
                { value: 'charging', label: t('robotDash.statusCharging') },
                { value: 'error', label: t('robotDash.statusError') },
                { value: 'offline', label: t('robotDash.statusOffline') },
              ]}
            />
          </Form.Item>
        </Space>
        <Space className="w-full" size={12}>
          <Form.Item className="flex-1" name="battery" label={t('robotFleet.battery')} rules={[{ required: true }]}>
            <InputNumber min={0} max={100} className="w-full" addonAfter="%" />
          </Form.Item>
          <Form.Item className="flex-1" name="floor" label={t('robotFleet.floor')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Space>
        <Form.Item name="zone" label={t('robotFleet.zones')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastSeen" label={t('robotDetail.lastHeartbeat')} rules={[{ required: true }]}>
          <Input placeholder="2026-02-23 10:25" />
        </Form.Item>
      </CrudModal>

      <Modal
        open={!!viewingRobot}
        title={viewingRobot?.name}
        onCancel={() => setViewingRobot(null)}
        footer={<Button onClick={() => setViewingRobot(null)}>{t('apiTest.close')}</Button>}
      >
        {viewingRobot ? (
          <Space direction="vertical" size={8}>
            <Typography.Text><strong>ID:</strong> {viewingRobot.id}</Typography.Text>
            <Typography.Text><strong>{t('robotMission.type')}:</strong> {typeLabel[viewingRobot.type]}</Typography.Text>
            <Typography.Text><strong>{t('common.status')}:</strong> {viewingRobot.status}</Typography.Text>
            <Typography.Text><strong>{t('robotFleet.battery')}:</strong> {viewingRobot.battery}%</Typography.Text>
            <Typography.Text><strong>{t('robotFleet.floor')}:</strong> {viewingRobot.floor}</Typography.Text>
            <Typography.Text><strong>{t('robotFleet.zones')}:</strong> {viewingRobot.zone}</Typography.Text>
            <Typography.Text><strong>{t('robotDetail.lastHeartbeat')}:</strong> {viewingRobot.lastSeen}</Typography.Text>
          </Space>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
