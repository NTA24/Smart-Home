import { useState } from 'react'
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Badge,
  Tooltip,
  Checkbox,
  Timeline,
  message,
  Select,
  Form,
  Input,
  Modal,
} from 'antd'
import {
  ToolOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  InboxOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CalendarOutlined,
  ReloadOutlined,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'
import { PageContainer, PageHeader, FilterBar, SearchInput, DetailDrawer } from '@/components'

const { Text, Paragraph } = Typography

type WOStatus = 'todo' | 'in_progress' | 'waiting_parts' | 'done'
type Priority = 'critical' | 'high' | 'medium' | 'low'

interface ChecklistItem {
  text: string
  done: boolean
}

interface PartUsed {
  name: string
  qty: number
  code: string
}

interface LogEntry {
  time: string
  user: string
  action: string
}

interface WorkOrder {
  id: string
  elevator: string
  symptom: string
  description: string
  status: WOStatus
  priority: Priority
  assignee: string
  createdAt: string
  downtimeStart: string | null
  downtimeEnd: string | null
  checklist: ChecklistItem[]
  parts: PartUsed[]
  logs: LogEntry[]
  attachments: number
}

const COLUMNS: WOStatus[] = ['todo', 'in_progress', 'waiting_parts', 'done']

export default function ElevatorMaintenance() {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingStore()

  const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
    critical: { color: '#f5222d', label: t('elevatorMaintenance.priorityCritical') },
    high: { color: '#fa541c', label: t('elevatorMaintenance.priorityHigh') },
    medium: { color: '#faad14', label: t('elevatorMaintenance.priorityMedium') },
    low: { color: '#8c8c8c', label: t('elevatorMaintenance.priorityLow') },
  }

  const STATUS_CONFIG: Record<WOStatus, { color: string; bg: string; borderColor: string; label: string; icon: React.ReactNode }> = {
    todo: { color: '#595959', bg: '#fafafa', borderColor: '#d9d9d9', label: t('elevatorMaintenance.todo'), icon: <InboxOutlined /> },
    in_progress: { color: '#1890ff', bg: '#e6f7ff', borderColor: '#91d5ff', label: t('elevatorMaintenance.in_progress'), icon: <SyncOutlined spin /> },
    waiting_parts: { color: '#fa8c16', bg: '#fff7e6', borderColor: '#ffd591', label: t('elevatorMaintenance.waiting_parts'), icon: <ClockCircleOutlined /> },
    done: { color: '#52c41a', bg: '#f6ffed', borderColor: '#b7eb8f', label: t('elevatorMaintenance.done'), icon: <CheckCircleOutlined /> },
  }

  const mockOrders: WorkOrder[] = [
    {
      id: 'WO-2026-001', elevator: 'E03', symptom: t('elevatorMaintenance.symptomDoorObstruction'),
      description: t('elevatorMaintenance.descDoorObstruction'),
      status: 'in_progress', priority: 'high', assignee: 'test1',
      createdAt: '2026-02-09 08:30', downtimeStart: '2026-02-10 09:00', downtimeEnd: null,
      checklist: [
        { text: t('elevatorMaintenance.stepInspectDoorTrack'), done: true },
        { text: t('elevatorMaintenance.stepCleanDoorRail'), done: true },
        { text: t('elevatorMaintenance.stepRecalibrateSensor'), done: false },
        { text: t('elevatorMaintenance.stepRunTestCycles'), done: false },
        { text: t('elevatorMaintenance.stepRestoreService'), done: false },
      ],
      parts: [
        { name: t('elevatorMaintenance.partDoorRollerSet'), qty: 2, code: 'DR-420' },
        { name: t('elevatorMaintenance.partSensorCleaningKit'), qty: 1, code: 'SK-101' },
      ],
      logs: [
        { time: '09:00', user: 'test1', action: t('elevatorMaintenance.logStartedWork') },
        { time: '09:15', user: 'test1', action: t('elevatorMaintenance.logFoundMetalShaving') },
        { time: '09:25', user: 'test1', action: t('elevatorMaintenance.logCleanedTrack') },
      ],
      attachments: 3,
    },
    {
      id: 'WO-2026-002', elevator: 'E07', symptom: t('elevatorMaintenance.symptomMotorVibration'),
      description: t('elevatorMaintenance.descMotorVibration'),
      status: 'waiting_parts', priority: 'medium', assignee: 'test1',
      createdAt: '2026-02-08 14:00', downtimeStart: null, downtimeEnd: null,
      checklist: [
        { text: t('elevatorMaintenance.stepConfirmVibration'), done: true },
        { text: t('elevatorMaintenance.stepInspectBearings'), done: true },
        { text: t('elevatorMaintenance.stepReplaceBearings'), done: false },
        { text: t('elevatorMaintenance.stepLubricateMotor'), done: false },
        { text: t('elevatorMaintenance.stepVerifyVibration'), done: false },
      ],
      parts: [
        { name: t('elevatorMaintenance.partMotorBearing'), qty: 2, code: 'MB-6205' },
      ],
      logs: [
        { time: '14:20', user: 'test1', action: t('elevatorMaintenance.logInspectedMotor') },
        { time: '15:00', user: 'test1', action: t('elevatorMaintenance.logOrderedBearings') },
      ],
      attachments: 1,
    },
    {
      id: 'WO-2026-003', elevator: 'E12', symptom: t('elevatorMaintenance.symptomCommTimeout'),
      description: t('elevatorMaintenance.descCommTimeout'),
      status: 'todo', priority: 'medium', assignee: 'test1',
      createdAt: '2026-02-10 07:30', downtimeStart: null, downtimeEnd: null,
      checklist: [
        { text: t('elevatorMaintenance.stepCheckNetworkCables'), done: false },
        { text: t('elevatorMaintenance.stepVerifyFirmwareVersion'), done: false },
        { text: t('elevatorMaintenance.stepUpdateFirmware'), done: false },
        { text: t('elevatorMaintenance.stepMonitor24h'), done: false },
      ],
      parts: [],
      logs: [],
      attachments: 0,
    },
    {
      id: 'WO-2026-004', elevator: 'E05', symptom: t('elevatorMaintenance.symptomIntercomNoise'),
      description: t('elevatorMaintenance.descIntercomNoise'),
      status: 'todo', priority: 'high', assignee: 'test1',
      createdAt: '2026-02-10 08:45', downtimeStart: null, downtimeEnd: null,
      checklist: [
        { text: t('elevatorMaintenance.stepTestIntercom'), done: false },
        { text: t('elevatorMaintenance.stepCleanSpeaker'), done: false },
        { text: t('elevatorMaintenance.stepReplaceCable'), done: false },
        { text: t('elevatorMaintenance.stepConfirmAudio'), done: false },
      ],
      parts: [],
      logs: [],
      attachments: 1,
    },
    {
      id: 'WO-2026-005', elevator: 'E09', symptom: t('elevatorMaintenance.symptomMonthlyInspection'),
      description: t('elevatorMaintenance.descMonthlyInspection'),
      status: 'todo', priority: 'low', assignee: 'test1',
      createdAt: '2026-02-10 06:00', downtimeStart: null, downtimeEnd: null,
      checklist: [
        { text: t('elevatorMaintenance.stepBrakeTest'), done: false },
        { text: t('elevatorMaintenance.stepSafetyGear'), done: false },
        { text: t('elevatorMaintenance.stepGovernorTest'), done: false },
        { text: t('elevatorMaintenance.stepRopeInspection'), done: false },
        { text: t('elevatorMaintenance.stepPitInspection'), done: false },
        { text: t('elevatorMaintenance.stepCarTopInspection'), done: false },
        { text: t('elevatorMaintenance.stepEmergencyLighting'), done: false },
      ],
      parts: [],
      logs: [],
      attachments: 0,
    },
    {
      id: 'WO-2025-098', elevator: 'E01', symptom: t('elevatorMaintenance.symptomLevelMisalignment'),
      description: t('elevatorMaintenance.descLevelMisalignment'),
      status: 'done', priority: 'medium', assignee: 'test1',
      createdAt: '2026-02-07 10:00', downtimeStart: '2026-02-08 08:00', downtimeEnd: '2026-02-08 10:30',
      checklist: [
        { text: t('elevatorMaintenance.stepMeasureMisalignment'), done: true },
        { text: t('elevatorMaintenance.stepCheckEncoder'), done: true },
        { text: t('elevatorMaintenance.stepRecalibrateEncoder'), done: true },
        { text: t('elevatorMaintenance.stepTestLeveling'), done: true },
      ],
      parts: [],
      logs: [
        { time: '08:00', user: 'test1', action: t('elevatorMaintenance.logStartedMeasured') },
        { time: '09:00', user: 'test1', action: t('elevatorMaintenance.logEncoderDrift') },
        { time: '10:15', user: 'test1', action: t('elevatorMaintenance.logTestedFloors') },
        { time: '10:30', user: 'test1', action: t('elevatorMaintenance.logRestoredService') },
      ],
      attachments: 2,
    },
    {
      id: 'WO-2025-097', elevator: 'E04', symptom: t('elevatorMaintenance.symptomRopeTension'),
      description: t('elevatorMaintenance.descRopeTension'),
      status: 'done', priority: 'low', assignee: 'test1',
      createdAt: '2026-02-05 09:00', downtimeStart: '2026-02-06 07:00', downtimeEnd: '2026-02-06 11:00',
      checklist: [
        { text: t('elevatorMaintenance.stepMeasureRopeTensions'), done: true },
        { text: t('elevatorMaintenance.stepEqualizeTensions'), done: true },
        { text: t('elevatorMaintenance.stepDocumentReadings'), done: true },
      ],
      parts: [],
      logs: [
        { time: '07:00', user: 'test1', action: t('elevatorMaintenance.logStartedRopeTension') },
        { time: '11:00', user: 'test1', action: t('elevatorMaintenance.logRopesWithinSpec') },
      ],
      attachments: 1,
    },
  ]

  const [orders, setOrders] = useState<WorkOrder[]>(mockOrders)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const filtered = orders.filter(o => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return o.id.toLowerCase().includes(q) || o.elevator.toLowerCase().includes(q) || o.symptom.toLowerCase().includes(q) || o.assignee.toLowerCase().includes(q)
  })

  const getColumnOrders = (status: WOStatus) => filtered.filter(o => o.status === status)

  const handleCardClick = (order: WorkOrder) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleMoveOrder = (order: WorkOrder, direction: 'left' | 'right') => {
    const idx = COLUMNS.indexOf(order.status)
    const newIdx = direction === 'right' ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= COLUMNS.length) return
    const newStatus = COLUMNS[newIdx]
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, status: newStatus })
    }
    message.success(`${order.id} → ${STATUS_CONFIG[newStatus].label}`)
  }

  const handleToggleChecklist = (orderKey: string, stepIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderKey) return o
      const newChecklist = [...o.checklist]
      newChecklist[stepIdx] = { ...newChecklist[stepIdx], done: !newChecklist[stepIdx].done }
      return { ...o, checklist: newChecklist }
    }))
    if (selectedOrder?.id === orderKey) {
      const newChecklist = [...selectedOrder.checklist]
      newChecklist[stepIdx] = { ...newChecklist[stepIdx], done: !newChecklist[stepIdx].done }
      setSelectedOrder({ ...selectedOrder, checklist: newChecklist })
    }
  }

  const handleCreate = () => {
    form.validateFields().then(values => {
      const newOrder: WorkOrder = {
        id: `WO-2026-${String(orders.length + 1).padStart(3, '0')}`,
        elevator: values.elevator,
        symptom: values.symptom,
        description: values.description || '',
        status: 'todo',
        priority: values.priority,
        assignee: values.assignee,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        downtimeStart: null,
        downtimeEnd: null,
        checklist: [],
        parts: [],
        logs: [],
        attachments: 0,
      }
      setOrders(prev => [newOrder, ...prev])
      message.success(t('elevatorMaintenance.createSuccess'))
      setCreateOpen(false)
      form.resetFields()
    })
  }

  const renderKanbanCard = (order: WorkOrder) => {
    const priorityCfg = PRIORITY_CONFIG[order.priority]
    const checkDone = order.checklist.filter(c => c.done).length
    const checkTotal = order.checklist.length

    return (
      <Card
        key={order.id}
        size="small"
        hoverable
        onClick={() => handleCardClick(order)}
        className="elevator_kanban-card"
        style={{ borderLeft: `4px solid ${priorityCfg.color}` }}
        bodyStyle={{ padding: '10px 12px' }}
      >
        <div className="flex-between items-start mb-4">
          <Text strong className="text-sm font-mono">{order.id}</Text>
          <Tag color={priorityCfg.color} className="rounded-sm text-xs m-0">
            {priorityCfg.label}
          </Tag>
        </div>
        <div className="mb-4">
          <Tag color="geekblue" className="rounded-sm text-11">{order.elevator}</Tag>
          <Text className="text-sm">{order.symptom}</Text>
        </div>
        <div className="flex-between items-center">
          <Space size={4}>
            <UserOutlined className="text-xs text-muted" />
            <Text className="text-11 text-muted">{order.assignee}</Text>
          </Space>
          {checkTotal > 0 && (
            <Tooltip title={`${checkDone}/${checkTotal} ${t('elevatorMaintenance.steps')}`}>
              <Text className="text-11 font-mono" style={{ color: checkDone === checkTotal ? '#52c41a' : undefined }}>
                <CheckCircleOutlined className="mr-2" />
                {checkDone}/{checkTotal}
              </Text>
            </Tooltip>
          )}
        </div>
        {order.attachments > 0 && (
          <div className="mt-4">
            <PaperClipOutlined className="text-xs text-muted mr-2" />
            <Text className="text-xs text-muted">{order.attachments}</Text>
          </div>
        )}
      </Card>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('elevatorMaintenance.title')}
        icon={<ToolOutlined />}
        subtitle={selectedBuilding?.name || t('elevatorMaintenance.allSites')}
        actions={
          <FilterBar>
            <SearchInput
              placeholder={t('elevatorMaintenance.search')}
              value={searchText}
              onChange={setSearchText}
              width={220}
            />
            <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
              {t('elevatorMaintenance.createOrder')}
            </Button>
          </FilterBar>
        }
      />

      {/* Kanban Board */}
      <Row gutter={12} className="overflow-auto">
        {COLUMNS.map(status => {
          const cfg = STATUS_CONFIG[status]
          const columnOrders = getColumnOrders(status)
          return (
            <Col key={status} xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                className="elevator_kanban-column"
                title={
                  <div className="flex items-center gap-8">
                    <div
                      className="elevator_kanban-column-icon"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.borderColor}`, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <Text strong className="text-base">{t(`elevatorMaintenance.${status}`)}</Text>
                    <Badge count={columnOrders.length} style={{ backgroundColor: cfg.color }} />
                  </div>
                }
                bodyStyle={{ padding: '8px 12px', maxHeight: 600, overflowY: 'auto' }}
              >
                {columnOrders.length > 0 ? (
                  columnOrders.map(renderKanbanCard)
                ) : (
                  <div className="elevator_kanban-empty">
                    <InboxOutlined className="text-3xl text-secondary" />
                    <br />
                    <Text type="secondary" className="text-sm">{t('elevatorMaintenance.noOrders')}</Text>
                  </div>
                )}
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Work Order Detail Drawer */}
      <DetailDrawer
        title={
          selectedOrder ? (
            <div>
              <div className="flex items-center gap-8 mb-4">
                <Text strong className="text-lg font-mono">{selectedOrder.id}</Text>
                <Tag color={PRIORITY_CONFIG[selectedOrder.priority].color} className="rounded-sm">
                  {PRIORITY_CONFIG[selectedOrder.priority].label}
                </Tag>
                <Tag
                  className="rounded-sm"
                  style={{
                    background: STATUS_CONFIG[selectedOrder.status].bg,
                    color: STATUS_CONFIG[selectedOrder.status].color,
                    border: `1px solid ${STATUS_CONFIG[selectedOrder.status].borderColor}`,
                  }}
                >
                  {STATUS_CONFIG[selectedOrder.status].icon}
                  <span className="ml-4">{t(`elevatorMaintenance.${selectedOrder.status}`)}</span>
                </Tag>
              </div>
              <Text type="secondary" className="text-sm">
                <CalendarOutlined className="mr-4" />
                {selectedOrder.createdAt}
              </Text>
            </div>
          ) : ''
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {selectedOrder && (
          <>
            {/* Elevator + Symptom */}
            <Card size="small" className="elevator_summary-card mb-16" style={{ background: '#f6f8fa' }}>
              <Row gutter={12}>
                <Col span={6}>
                  <Text type="secondary" className="text-11">{t('elevatorMaintenance.elevator')}</Text>
                  <br />
                  <Tag color="geekblue" className="rounded-sm text-md font-semibold mt-2">{selectedOrder.elevator}</Tag>
                </Col>
                <Col span={18}>
                  <Text type="secondary" className="text-11">{t('elevatorMaintenance.symptom')}</Text>
                  <br />
                  <Text strong className="text-base">
                    <ExclamationCircleOutlined style={{ color: PRIORITY_CONFIG[selectedOrder.priority].color }} className="mr-4" />
                    {selectedOrder.symptom}
                  </Text>
                </Col>
              </Row>
              <div className="mt-8">
                <Text type="secondary" className="text-11">{t('elevatorMaintenance.assignee')}</Text>
                <br />
                <Text className="text-sm"><UserOutlined className="mr-4" />{selectedOrder.assignee}</Text>
              </div>
              {selectedOrder.description && (
                <div className="mt-8">
                  <Paragraph className="text-sm m-0 text-secondary">{selectedOrder.description}</Paragraph>
                </div>
              )}
            </Card>

            {/* Move buttons */}
            <Space className="mb-16 w-full flex justify-center">
              <Button
                icon={<LeftOutlined />}
                disabled={COLUMNS.indexOf(selectedOrder.status) === 0}
                onClick={() => handleMoveOrder(selectedOrder, 'left')}
                className="rounded"
              >
                {COLUMNS.indexOf(selectedOrder.status) > 0 && t(`elevatorMaintenance.${COLUMNS[COLUMNS.indexOf(selectedOrder.status) - 1]}`)}
              </Button>
              <Button
                icon={<RightOutlined />}
                type="primary"
                disabled={COLUMNS.indexOf(selectedOrder.status) === COLUMNS.length - 1}
                onClick={() => handleMoveOrder(selectedOrder, 'right')}
                className="rounded"
              >
                {COLUMNS.indexOf(selectedOrder.status) < COLUMNS.length - 1 && t(`elevatorMaintenance.${COLUMNS[COLUMNS.indexOf(selectedOrder.status) + 1]}`)}
              </Button>
            </Space>

            {/* Downtime */}
            <Divider orientation="left" className="text-base font-semibold">
              <ClockCircleOutlined className="mr-2" />
              {t('elevatorMaintenance.downtime')}
            </Divider>
            <Row gutter={12} className="mb-16">
              <Col span={12}>
                <Card size="small" className="elevator_downtime-card rounded text-center">
                  <Text type="secondary" className="text-11">{t('elevatorMaintenance.downtimeStart')}</Text>
                  <br />
                  <Text strong className={`text-base font-mono ${!selectedOrder.downtimeStart ? 'text-muted' : ''}`} style={selectedOrder.downtimeStart ? { color: '#fa541c' } : undefined}>
                    {selectedOrder.downtimeStart || '—'}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="elevator_downtime-card rounded text-center">
                  <Text type="secondary" className="text-11">{t('elevatorMaintenance.downtimeEnd')}</Text>
                  <br />
                  <Text strong className={`text-base font-mono ${!selectedOrder.downtimeEnd ? 'text-muted' : ''}`} style={selectedOrder.downtimeEnd ? { color: '#52c41a' } : undefined}>
                    {selectedOrder.downtimeEnd || '—'}
                  </Text>
                </Card>
              </Col>
            </Row>

            {/* Checklist Steps */}
            <Divider orientation="left" className="text-base font-semibold">
              <CheckCircleOutlined className="mr-2" />
              {t('elevatorMaintenance.checklist')} ({selectedOrder.checklist.filter(c => c.done).length}/{selectedOrder.checklist.length})
            </Divider>
            {selectedOrder.checklist.length > 0 ? (
              <div className="mb-16">
                {selectedOrder.checklist.map((step, i) => (
                  <div
                    key={i}
                    className={`elevator_checklist-step ${step.done ? 'elevator_checklist-step--done' : 'elevator_checklist-step--pending'}`}
                  >
                    <Checkbox checked={step.done} onChange={() => handleToggleChecklist(selectedOrder.id, i)} />
                    <Text className={`text-base ${step.done ? 'line-through text-muted' : ''}`}>
                      {step.text}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary" className="text-sm mb-16 block">{t('elevatorMaintenance.noChecklist')}</Text>
            )}

            {/* Parts Used */}
            <Divider orientation="left" className="text-base font-semibold">
              <ToolOutlined className="mr-2" />
              {t('elevatorMaintenance.partsUsed')} ({selectedOrder.parts.length})
            </Divider>
            {selectedOrder.parts.length > 0 ? (
              <div className="mb-16">
                {selectedOrder.parts.map((part, i) => (
                  <div key={i} className="elevator_part-row">
                    <div>
                      <Text strong className="text-sm">{part.name}</Text>
                      <Text className="text-11 text-muted ml-8 font-mono">{part.code}</Text>
                    </div>
                    <Tag color="blue" className="rounded-sm">×{part.qty}</Tag>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary" className="text-sm mb-16 block">{t('elevatorMaintenance.noParts')}</Text>
            )}

            {/* Logs */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 600 }}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              {t('elevatorMaintenance.logs')} ({selectedOrder.logs.length})
            </Divider>
            {selectedOrder.logs.length > 0 ? (
              <Timeline style={{ marginBottom: 16 }}>
                {selectedOrder.logs.map((log, i) => (
                  <Timeline.Item key={i} color="blue">
                    <Text strong style={{ fontSize: 11, fontFamily: 'monospace' }}>{log.time}</Text>
                    <Text style={{ fontSize: 11, color: '#8c8c8c', marginLeft: 6 }}>{log.user}</Text>
                    <br />
                    <Text style={{ fontSize: 12 }}>{log.action}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: 'block' }}>{t('elevatorMaintenance.noLogs')}</Text>
            )}

            {/* Attachments */}
            {selectedOrder.attachments > 0 && (
              <>
                <Divider orientation="left" className="text-base font-semibold">
                  <PaperClipOutlined className="mr-2" />
                  {t('elevatorMaintenance.attachments')} ({selectedOrder.attachments})
                </Divider>
                <Space wrap className="mb-16">
                  {Array.from({ length: selectedOrder.attachments }, (_, i) => (
                    <Tag key={i} icon={<PaperClipOutlined />} className="rounded-sm cursor-pointer">
                      attachment_{i + 1}.jpg
                    </Tag>
                  ))}
                </Space>
              </>
            )}
          </>
        )}
      </DetailDrawer>

      {/* Create Work Order Modal */}
      <Modal
        title={<Space><PlusOutlined />{t('elevatorMaintenance.createOrder')}</Space>}
        open={createOpen}
        onCancel={() => { setCreateOpen(false); form.resetFields() }}
        onOk={handleCreate}
        okText={t('apiTest.create')}
        cancelText={t('apiTest.cancel')}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-16" initialValues={{ priority: 'medium' }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="elevator" label={t('elevatorMaintenance.elevator')} rules={[{ required: true, message: t('elevatorMaintenance.elevatorRequired') }]}>
                <Select placeholder="E01">
                  {['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12'].map(e => (
                    <Select.Option key={e} value={e}>{e}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="symptom" label={t('elevatorMaintenance.symptom')} rules={[{ required: true, message: t('elevatorMaintenance.symptomRequired') }]}>
                <Input placeholder={t('elevatorMaintenance.symptomPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={t('elevatorMaintenance.description')}>
            <Input.TextArea rows={3} placeholder={t('elevatorMaintenance.descriptionPlaceholder')} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="priority" label={t('elevatorMaintenance.priority')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="critical"><Tag color="red" className="rounded-sm">{t('elevatorMaintenance.priorityCritical')}</Tag></Select.Option>
                  <Select.Option value="high"><Tag color="volcano" className="rounded-sm">{t('elevatorMaintenance.priorityHigh')}</Tag></Select.Option>
                  <Select.Option value="medium"><Tag color="gold" className="rounded-sm">{t('elevatorMaintenance.priorityMedium')}</Tag></Select.Option>
                  <Select.Option value="low"><Tag color="default" className="rounded-sm">{t('elevatorMaintenance.priorityLow')}</Tag></Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assignee" label={t('elevatorMaintenance.assignee')} rules={[{ required: true, message: t('elevatorMaintenance.assigneeRequired') }]}>
                <Select placeholder={t('elevatorMaintenance.selectAssignee')}>
                  <Select.Option value="test1">test1</Select.Option>
                  <Select.Option value="test1">test1</Select.Option>
                  <Select.Option value="test1">test1</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  )
}
