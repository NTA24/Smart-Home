import { useState, useMemo } from 'react'
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Drawer,
  Descriptions,
  Checkbox,
  Input,
  Timeline,
  Divider,
  Badge,
  message,
} from 'antd'
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography

interface RobotAlert {
  id: string
  time: string
  robot: string
  type: string
  location: string
  sla: string
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'acknowledged' | 'resolved'
  checklist: { step: string; done: boolean }[]
  notes: string
  assignee: string
}

const RobotAlerts = () => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<RobotAlert | null>(null)
  const [noteText, setNoteText] = useState('')

  /* ── mock alerts ── */
  const alerts: RobotAlert[] = useMemo(() => [
    {
      id: 'ALR-001', time: '10:14', robot: 'R-07',
      type: t('robotAlerts.typeStuck'), location: 'B1 Corr C',
      sla: '05m', severity: 'critical', status: 'active',
      checklist: [
        { step: t('robotAlerts.checkCamera'), done: false },
        { step: t('robotAlerts.checkReplan'), done: false },
        { step: t('robotAlerts.checkRetryTeleop'), done: false },
        { step: t('robotAlerts.checkSafetyStop'), done: false },
      ],
      notes: '', assignee: '',
    },
    {
      id: 'ALR-002', time: '10:10', robot: 'R-12',
      type: t('robotAlerts.typeLowBattery'), location: 'B1 Lobby',
      sla: '10m', severity: 'warning', status: 'active',
      checklist: [
        { step: t('robotAlerts.checkBatteryLevel'), done: true },
        { step: t('robotAlerts.checkRecallDock'), done: true },
        { step: t('robotAlerts.checkDockAvailable'), done: false },
      ],
      notes: t('robotAlerts.noteAutoRecall'), assignee: '',
    },
    {
      id: 'ALR-003', time: '10:05', robot: 'R-09',
      type: t('robotAlerts.typeSensorDrift'), location: 'B1 Zone 1',
      sla: '15m', severity: 'info', status: 'active',
      checklist: [
        { step: t('robotAlerts.checkSensorLogs'), done: false },
        { step: t('robotAlerts.checkRecalibrate'), done: false },
      ],
      notes: '', assignee: '',
    },
    {
      id: 'ALR-004', time: '09:55', robot: 'R-03',
      type: t('robotAlerts.typeCommLoss'), location: 'B1 Hallway',
      sla: '10m', severity: 'info', status: 'acknowledged',
      checklist: [
        { step: t('robotAlerts.checkWifi'), done: true },
        { step: t('robotAlerts.checkReboot'), done: false },
      ],
      notes: t('robotAlerts.noteWifiWeak'), assignee: 'Nguyen V.',
    },
    {
      id: 'ALR-005', time: '09:48', robot: 'R-01',
      type: t('robotAlerts.typeMotorTemp'), location: 'B1 Zone 2',
      sla: '20m', severity: 'info', status: 'active',
      checklist: [
        { step: t('robotAlerts.checkMotorLog'), done: false },
        { step: t('robotAlerts.checkCooldown'), done: false },
      ],
      notes: '', assignee: '',
    },
    {
      id: 'ALR-006', time: '09:30', robot: 'R-05',
      type: t('robotAlerts.typeDockFail'), location: 'Dock A',
      sla: '15m', severity: 'info', status: 'active',
      checklist: [
        { step: t('robotAlerts.checkDockAlign'), done: false },
        { step: t('robotAlerts.checkRetryDock'), done: false },
      ],
      notes: '', assignee: '',
    },
  ], [t])

  const sevConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    critical: { color: 'red', icon: <ExclamationCircleOutlined />, label: t('robotAlerts.critical') },
    warning: { color: 'orange', icon: <WarningOutlined />, label: t('robotAlerts.warning') },
    info: { color: 'blue', icon: <InfoCircleOutlined />, label: t('robotAlerts.info') },
  }

  const filteredAlerts = useMemo(() => {
    if (selectedTab === 'all') return alerts
    return alerts.filter(a => a.severity === selectedTab)
  }, [alerts, selectedTab])

  const counts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  }), [alerts])

  const openDetail = (alert: RobotAlert) => {
    setSelectedAlert({ ...alert })
    setDrawerOpen(true)
    setNoteText('')
  }

  const handleResolve = () => {
    message.success(t('robotAlerts.resolved'))
    setDrawerOpen(false)
  }

  const handleEscalate = () => {
    message.warning(t('robotAlerts.escalated'))
    setDrawerOpen(false)
  }

  const columns: ColumnsType<RobotAlert> = [
    {
      title: t('robotAlerts.colTime'), dataIndex: 'time', width: 80,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('robotAlerts.colRobot'), dataIndex: 'robot', width: 80,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: t('robotAlerts.colType'), dataIndex: 'type', width: 160,
      render: (v: string, rec: RobotAlert) => {
        const s = sevConfig[rec.severity]
        return <Tag color={s.color} icon={s.icon} style={{ borderRadius: 4 }}>{v}</Tag>
      },
    },
    {
      title: t('robotAlerts.colLocation'), dataIndex: 'location', width: 140,
    },
    {
      title: 'SLA', dataIndex: 'sla', width: 80,
      render: (v: string, rec: RobotAlert) => (
        <Text style={{ color: rec.severity === 'critical' ? '#ff4d4f' : '#595959', fontWeight: rec.severity === 'critical' ? 600 : 400 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />{v}
        </Text>
      ),
    },
    {
      title: t('robotAlerts.colStatus'), dataIndex: 'status', width: 120,
      render: (v: string) => {
        const config: Record<string, { color: string; label: string }> = {
          active: { color: 'red', label: t('robotAlerts.statusActive') },
          acknowledged: { color: 'orange', label: t('robotAlerts.statusAck') },
          resolved: { color: 'green', label: t('robotAlerts.statusResolved') },
        }
        const c = config[v] ?? config.active
        return <Tag color={c.color} style={{ borderRadius: 4 }}>{c.label}</Tag>
      },
    },
    {
      title: '', width: 80, align: 'center' as const,
      render: (_: unknown, rec: RobotAlert) => (
        <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => openDetail(rec)}>
          {t('robotAlerts.view')}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t('robotAlerts.title')}</Title>

      {/* ── Tabs ── */}
      <Space size={8} style={{ marginBottom: 12 }}>
        <Button
          type={selectedTab === 'all' ? 'primary' : 'default'}
          onClick={() => setSelectedTab('all')}
          size="small"
        >
          {t('robotAlerts.all')} ({alerts.length})
        </Button>
        <Badge count={counts.critical} size="small">
          <Button
            danger={selectedTab === 'critical'}
            type={selectedTab === 'critical' ? 'primary' : 'default'}
            onClick={() => setSelectedTab('critical')}
            size="small"
            icon={<ExclamationCircleOutlined />}
          >
            {t('robotAlerts.critical')} ({counts.critical})
          </Button>
        </Badge>
        <Button
          type={selectedTab === 'warning' ? 'primary' : 'default'}
          onClick={() => setSelectedTab('warning')}
          size="small"
          icon={<WarningOutlined />}
          style={selectedTab === 'warning' ? { background: '#faad14', borderColor: '#faad14' } : {}}
        >
          {t('robotAlerts.warning')} ({counts.warning})
        </Button>
        <Button
          type={selectedTab === 'info' ? 'primary' : 'default'}
          onClick={() => setSelectedTab('info')}
          size="small"
          icon={<InfoCircleOutlined />}
        >
          {t('robotAlerts.info')} ({counts.info})
        </Button>
      </Space>

      {/* ── Table ── */}
      <Card bordered={false} style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredAlerts}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          rowClassName={(rec) => rec.severity === 'critical' ? 'critical-row' : ''}
          style={{ borderRadius: 10 }}
        />
        <style>{`.critical-row { background: #fff1f0 !important; } .critical-row:hover > td { background: #ffe7e6 !important; }`}</style>
      </Card>

      {/* ── Incident Detail Drawer ── */}
      <Drawer
        title={selectedAlert ? `${t('robotAlerts.incidentDetail')}: ${selectedAlert.robot} ${selectedAlert.type}` : ''}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={460}
      >
        {selectedAlert && (
          <div>
            {/* Info */}
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('robotAlerts.colRobot')}><Text strong>{selectedAlert.robot}</Text></Descriptions.Item>
              <Descriptions.Item label={t('robotAlerts.colType')}>
                <Tag color={sevConfig[selectedAlert.severity].color} icon={sevConfig[selectedAlert.severity].icon} style={{ borderRadius: 4 }}>
                  {selectedAlert.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('robotAlerts.colLocation')}>{selectedAlert.location}</Descriptions.Item>
              <Descriptions.Item label={t('robotAlerts.colTime')}>{selectedAlert.time}</Descriptions.Item>
              <Descriptions.Item label="SLA">{selectedAlert.sla}</Descriptions.Item>
            </Descriptions>

            {/* Checklist (Playbook) */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <ToolOutlined style={{ marginRight: 4 }} />{t('robotAlerts.checklist')}
              </Text>
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12 }}>
                {selectedAlert.checklist.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <Checkbox defaultChecked={item.done}>
                      <Text style={{ fontSize: 13 }}>{idx + 1}) {item.step}</Text>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Notes / Attachments */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <FileTextOutlined style={{ marginRight: 4 }} />{t('robotAlerts.notesSection')}
              </Text>
              {selectedAlert.notes && (
                <Paragraph style={{ background: '#f6ffed', borderRadius: 6, padding: 8, fontSize: 12 }}>
                  {selectedAlert.notes}
                </Paragraph>
              )}
              <Input.TextArea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('robotAlerts.addNote')}
                style={{ marginBottom: 8 }}
              />
              <Button size="small" onClick={() => { if (noteText) { message.success(t('robotAlerts.noteAdded')); setNoteText('') } }}>
                {t('robotAlerts.saveNote')}
              </Button>
            </div>

            {/* Assign */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <UserOutlined style={{ marginRight: 4 }} />{t('robotAlerts.assignTo')}
              </Text>
              <Input placeholder={t('robotAlerts.assignPlaceholder')} defaultValue={selectedAlert.assignee} style={{ width: '100%' }} />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Timeline */}
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />{t('robotAlerts.timeline')}
            </Text>
            <div style={{ paddingTop: 4 }}>
              <Timeline
                items={[
                  { color: 'red', children: <Text style={{ fontSize: 12 }}>{selectedAlert.time} — {t('robotAlerts.tlDetected')}</Text> },
                  { color: 'orange', children: <Text style={{ fontSize: 12 }}>{selectedAlert.time} — {t('robotAlerts.tlNotified')}</Text> },
                  { color: 'gray', children: <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{t('robotAlerts.tlPending')}</Text> },
                ]}
              />
            </div>

            {/* Actions */}
            <Space style={{ width: '100%' }}>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleResolve}>
                {t('robotAlerts.resolve')}
              </Button>
              <Button danger icon={<AlertOutlined />} onClick={handleEscalate}>
                {t('robotAlerts.escalate')}
              </Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default RobotAlerts
