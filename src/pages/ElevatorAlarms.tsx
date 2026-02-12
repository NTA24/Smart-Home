import { useState } from 'react'
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Drawer,
  Divider,
  Steps,
  Input,
  Row,
  Col,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Segmented,
  Upload,
} from 'antd'
import {
  AlertOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  PhoneOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

type Severity = 'critical' | 'warning' | 'info'
type AlarmStatus = 'open' | 'acknowledged' | 'resolved'

interface ElevatorAlarm {
  key: string
  time: string
  elevator: string
  type: string
  location: string
  status: AlarmStatus
  severity: Severity
  sla: string
  slaExpired: boolean
  description: string
  checklist: { step: string; role: string; done: boolean }[]
  notes: { time: string; user: string; text: string }[]
}

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; icon: React.ReactNode }> = {
  critical: { color: '#f5222d', bg: '#fff1f0', icon: <ExclamationCircleOutlined /> },
  warning: { color: '#fa8c16', bg: '#fffbe6', icon: <WarningOutlined /> },
  info: { color: '#1890ff', bg: '#e6f7ff', icon: <InfoCircleOutlined /> },
}

export default function ElevatorAlarms() {
  const { t } = useTranslation()
  const STATUS_CONFIG: Record<AlarmStatus, { color: string; label: string }> = {
    open: { color: 'red', label: t('elevatorAlarms.statusOpen') },
    acknowledged: { color: 'orange', label: t('elevatorAlarms.statusAcknowledged') },
    resolved: { color: 'green', label: t('elevatorAlarms.statusResolved') },
  }
  const mockAlarms: ElevatorAlarm[] = [
    {
      key: '1', time: '08:15', elevator: 'E05', type: t('elevatorAlarms.typeTrappedPassenger'), location: t('elevatorAlarms.locBetween8_9'), status: 'open', severity: 'critical', sla: '02:10', slaExpired: false,
      description: t('elevatorAlarms.descTrapped'),
      checklist: [
        { step: t('elevatorAlarms.stepConfirmIntercom'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepNotifySecurity'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepContactTechnician'), role: 'operator', done: false },
        { step: t('elevatorAlarms.stepNotifyFire'), role: 'security', done: false },
        { step: t('elevatorAlarms.stepGuidePassenger'), role: 'operator', done: true },
      ],
      notes: [
        { time: '08:16', user: 'Operator A', text: t('elevatorAlarms.noteIntercomConfirmed') },
        { time: '08:18', user: 'Security B', text: t('elevatorAlarms.noteOnSite') },
      ],
    },
    {
      key: '2', time: '08:13', elevator: 'E03', type: t('elevatorAlarms.typeOverload'), location: t('elevatorAlarms.locFloor7'), status: 'open', severity: 'warning', sla: '01:45', slaExpired: false,
      description: t('elevatorAlarms.descOverload'),
      checklist: [
        { step: t('elevatorAlarms.stepAnnounceOverload'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepMonitorLoad'), role: 'operator', done: false },
        { step: t('elevatorAlarms.stepLogIncident'), role: 'operator', done: false },
      ],
      notes: [
        { time: '08:14', user: 'Operator A', text: t('elevatorAlarms.noteAnnouncementMade') },
      ],
    },
    {
      key: '3', time: '08:10', elevator: 'E12', type: t('elevatorAlarms.typeCommTimeout'), location: t('elevatorAlarms.locB2'), status: 'acknowledged', severity: 'warning', sla: '00:30', slaExpired: true,
      description: t('elevatorAlarms.descCommTimeout'),
      checklist: [
        { step: t('elevatorAlarms.stepCheckNetwork'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepVerifyFirmware'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepScheduleMaintenance'), role: 'operator', done: false },
      ],
      notes: [
        { time: '08:11', user: 'System', text: t('elevatorAlarms.noteAutoRecovered') },
        { time: '08:12', user: 'Operator A', text: t('elevatorAlarms.noteNetworkChecked') },
      ],
    },
    {
      key: '4', time: '07:45', elevator: 'E09', type: t('elevatorAlarms.typeEmergencyCall'), location: t('elevatorAlarms.locFloor10'), status: 'resolved', severity: 'critical', sla: '00:00', slaExpired: false,
      description: t('elevatorAlarms.descEmergency'),
      checklist: [
        { step: t('elevatorAlarms.stepRespondIntercom'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepVerifyEmergency'), role: 'security', done: true },
        { step: t('elevatorAlarms.stepCancelEmergency'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepLogReport'), role: 'operator', done: true },
      ],
      notes: [
        { time: '07:46', user: 'Operator A', text: t('elevatorAlarms.noteChildPressed') },
        { time: '07:47', user: 'Security B', text: t('elevatorAlarms.noteFalseAlarm') },
      ],
    },
    {
      key: '5', time: '07:30', elevator: 'E04', type: t('elevatorAlarms.typeDoorObstruction'), location: t('elevatorAlarms.locG'), status: 'open', severity: 'info', sla: '03:00', slaExpired: false,
      description: t('elevatorAlarms.descDoorObstruction'),
      checklist: [
        { step: t('elevatorAlarms.stepInspectDoor'), role: 'operator', done: false },
        { step: t('elevatorAlarms.stepClearObstruction'), role: 'operator', done: false },
        { step: t('elevatorAlarms.stepTestDoor'), role: 'operator', done: false },
      ],
      notes: [],
    },
    {
      key: '6', time: '07:15', elevator: 'E07', type: t('elevatorAlarms.typeMotorVibration'), location: t('elevatorAlarms.locMachineRoom'), status: 'acknowledged', severity: 'info', sla: '04:00', slaExpired: false,
      description: t('elevatorAlarms.descMotorVibration'),
      checklist: [
        { step: t('elevatorAlarms.stepCheckVibration'), role: 'operator', done: true },
        { step: t('elevatorAlarms.stepSchedulePreventive'), role: 'operator', done: true },
      ],
      notes: [
        { time: '07:20', user: 'Operator A', text: t('elevatorAlarms.noteVibrationReading') },
      ],
    },
  ]
  const { selectedBuilding } = useBuildingStore()
  const [severityTab, setSeverityTab] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAlarm, setSelectedAlarm] = useState<ElevatorAlarm | null>(null)
  const [noteText, setNoteText] = useState('')

  const filtered = mockAlarms.filter(a => {
    if (severityTab === 'all') return true
    return a.severity === severityTab
  })

  const counts = {
    all: mockAlarms.length,
    critical: mockAlarms.filter(a => a.severity === 'critical').length,
    warning: mockAlarms.filter(a => a.severity === 'warning').length,
    info: mockAlarms.filter(a => a.severity === 'info').length,
  }

  const handleViewDetail = (alarm: ElevatorAlarm) => {
    setSelectedAlarm(alarm)
    setDrawerOpen(true)
  }

  const handleResolve = () => {
    message.success(t('elevatorAlarms.resolveSuccess'))
    setDrawerOpen(false)
  }

  const handleEscalate = () => {
    message.warning(t('elevatorAlarms.escalateSuccess'))
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return
    message.success(t('elevatorAlarms.noteAdded'))
    setNoteText('')
  }

  const columns = [
    {
      title: t('elevatorAlarms.time'),
      dataIndex: 'time',
      key: 'time',
      width: 80,
      render: (time: string) => <Text style={{ fontSize: 13, fontFamily: 'monospace' }}>{time}</Text>,
    },
    {
      title: t('elevatorAlarms.elevator'),
      dataIndex: 'elevator',
      key: 'elevator',
      width: 70,
      render: (e: string) => <Text strong style={{ fontFamily: 'monospace' }}>{e}</Text>,
    },
    {
      title: t('elevatorAlarms.type'),
      dataIndex: 'type',
      key: 'type',
      width: 170,
      render: (type: string, record: ElevatorAlarm) => (
        <Space size={6}>
          <span style={{ color: SEVERITY_CONFIG[record.severity].color }}>{SEVERITY_CONFIG[record.severity].icon}</span>
          <Text style={{ fontSize: 13 }}>{type}</Text>
        </Space>
      ),
    },
    {
      title: t('elevatorAlarms.location'),
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (loc: string) => <Text style={{ fontSize: 12 }}>{loc}</Text>,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AlarmStatus) => (
        <Tag color={STATUS_CONFIG[status].color} style={{ borderRadius: 8 }}>
          {STATUS_CONFIG[status].label}
        </Tag>
      ),
    },
    {
      title: 'SLA',
      dataIndex: 'sla',
      key: 'sla',
      width: 90,
      render: (sla: string, record: ElevatorAlarm) => (
        <Text style={{
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 600,
          color: record.slaExpired ? '#f5222d' : record.status === 'resolved' ? '#52c41a' : '#1a1a1a',
        }}>
          <ClockCircleOutlined style={{ marginRight: 4, fontSize: 11 }} />
          {sla}
          {record.slaExpired && <WarningOutlined style={{ marginLeft: 4, color: '#f5222d', fontSize: 10 }} />}
        </Text>
      ),
    },
    {
      title: t('elevatorAlarms.actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ElevatorAlarm) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            {t('elevatorAlarms.viewPlaybook')}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertOutlined />
            {t('elevatorAlarms.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('elevatorAlarms.allSites')}</Text>
        </div>
        <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
      </div>

      {/* Severity tabs */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }} bodyStyle={{ padding: '12px 20px' }}>
        <Segmented
          value={severityTab}
          onChange={v => setSeverityTab(v as string)}
          options={[
            { value: 'all', label: <Space><Badge count={counts.all} style={{ backgroundColor: '#8c8c8c' }} />{t('elevatorAlarms.all')}</Space> },
            { value: 'critical', label: <Space><Badge count={counts.critical} style={{ backgroundColor: '#f5222d' }} />{t('elevatorAlarms.critical')}</Space> },
            { value: 'warning', label: <Space><Badge count={counts.warning} style={{ backgroundColor: '#fa8c16' }} />{t('elevatorAlarms.warningLabel')}</Space> },
            { value: 'info', label: <Space><Badge count={counts.info} style={{ backgroundColor: '#1890ff' }} />{t('elevatorAlarms.info')}</Space> },
          ]}
          block
          style={{ fontWeight: 500 }}
        />
      </Card>

      {/* Alarm Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertOutlined style={{ color: '#f5222d' }} />
            {t('elevatorAlarms.alarmList')}
            <Tag color="red" style={{ borderRadius: 8 }}>{filtered.length}</Tag>
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${t('common.total')}: ${total}` }}
          size="small"
          scroll={{ x: 850 }}
          rowClassName={(record) => record.severity === 'critical' && record.status === 'open' ? 'critical-row' : ''}
        />
      </Card>

      {/* Alarm Detail Drawer */}
      <Drawer
        title={
          selectedAlarm ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: SEVERITY_CONFIG[selectedAlarm.severity].color, fontSize: 18 }}>
                  {SEVERITY_CONFIG[selectedAlarm.severity].icon}
                </span>
                <Text strong style={{ fontSize: 16 }}>{selectedAlarm.type}</Text>
                <Tag color={STATUS_CONFIG[selectedAlarm.status].color} style={{ borderRadius: 8 }}>
                  {STATUS_CONFIG[selectedAlarm.status].label}
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedAlarm.elevator} · {selectedAlarm.location} · {selectedAlarm.time}
              </Text>
            </div>
          ) : ''
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {selectedAlarm && (
          <>
            {/* Description */}
            <Card size="small" style={{
              borderRadius: 10,
              marginBottom: 16,
              background: SEVERITY_CONFIG[selectedAlarm.severity].bg,
              border: `1px solid ${SEVERITY_CONFIG[selectedAlarm.severity].color}30`,
            }}>
              <Text style={{ fontSize: 13 }}>{selectedAlarm.description}</Text>
            </Card>

            {/* Steps Checklist */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 600 }}>
              <CheckCircleOutlined style={{ marginRight: 6 }} />
              {t('elevatorAlarms.checklist')}
            </Divider>
            <Steps
              direction="vertical"
              size="small"
              current={selectedAlarm.checklist.filter(c => c.done).length}
              items={selectedAlarm.checklist.map(step => ({
                title: <Text style={{ fontSize: 13 }}>{step.step}</Text>,
                description: <Tag color={step.role === 'operator' ? 'blue' : 'purple'} style={{ borderRadius: 6, fontSize: 10 }}>{step.role === 'operator' ? t('elevatorAlarms.roleOperator') : t('elevatorAlarms.roleSecurity')}</Tag>,
                status: step.done ? 'finish' : 'wait',
              }))}
              style={{ marginBottom: 16 }}
            />

            {/* Contact buttons */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 600 }}>
              <PhoneOutlined style={{ marginRight: 6 }} />
              {t('elevatorAlarms.contacts')}
            </Divider>
            <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Button icon={<PhoneOutlined />} block style={{ height: 40, borderRadius: 8, borderColor: '#1890ff', color: '#1890ff' }}>
                  {t('elevatorAlarms.callIntercom')}
                </Button>
              </Col>
              <Col span={12}>
                <Button icon={<BellOutlined />} block style={{ height: 40, borderRadius: 8, borderColor: '#fa8c16', color: '#fa8c16' }}>
                  {t('elevatorAlarms.notifySupervisor')}
                </Button>
              </Col>
            </Row>

            {/* Notes + Attachments */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 600 }}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              {t('elevatorAlarms.notes')} ({selectedAlarm.notes.length})
            </Divider>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
              {selectedAlarm.notes.length > 0 ? selectedAlarm.notes.map((note, i) => (
                <div key={i} style={{ marginBottom: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 12 }}>{note.user}</Text>
                    <Text style={{ fontSize: 11, color: '#8c8c8c', fontFamily: 'monospace' }}>{note.time}</Text>
                  </div>
                  <Text style={{ fontSize: 13 }}>{note.text}</Text>
                </div>
              )) : (
                <Text type="secondary" style={{ fontSize: 12 }}>{t('elevatorAlarms.noNotes')}</Text>
              )}
            </div>
            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
              <Input
                placeholder={t('elevatorAlarms.addNotePlaceholder')}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onPressEnter={handleAddNote}
              />
              <Button type="primary" onClick={handleAddNote}>{t('elevatorAlarms.addNote')}</Button>
            </Space.Compact>
            <Upload maxCount={3} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />} size="small" style={{ borderRadius: 6 }}>
                <PaperClipOutlined /> {t('elevatorAlarms.attachFile')}
              </Button>
            </Upload>

            {/* Resolve / Escalate */}
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={10}>
              <Col span={12}>
                <Popconfirm title={t('elevatorAlarms.confirmResolve')} onConfirm={handleResolve} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    block
                    size="large"
                    style={{
                      height: 48,
                      borderRadius: 10,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      border: 'none',
                    }}
                  >
                    {t('elevatorAlarms.resolve')}
                  </Button>
                </Popconfirm>
              </Col>
              <Col span={12}>
                <Popconfirm title={t('elevatorAlarms.confirmEscalate')} onConfirm={handleEscalate} okText={t('apiTest.yes')} cancelText={t('apiTest.no')}>
                  <Button
                    danger
                    icon={<ArrowUpOutlined />}
                    block
                    size="large"
                    style={{ height: 48, borderRadius: 10, fontWeight: 600 }}
                  >
                    {t('elevatorAlarms.escalate')}
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          </>
        )}
      </Drawer>

      <style>{`
        .critical-row { background: #fff1f0 !important; }
        .critical-row:hover td { background: #ffccc7 !important; }
      `}</style>
    </div>
  )
}
