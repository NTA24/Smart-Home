import { useMemo } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Table,
  Progress,
  Space,
  Statistic,
  Badge,
  Tooltip,
} from 'antd'
import {
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ToolOutlined,
  CloudServerOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface WorkOrder {
  id: string
  robot: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in_progress' | 'done'
  assignee: string
  created: string
}

const RobotMaintenance = () => {
  const { t } = useTranslation()

  /* ── Health summary ── */
  const health = useMemo(() => ({
    ok: 16, warn: 3, critical: 1, total: 20,
  }), [])

  const workOrderSummary = useMemo(() => ({
    todo: 4, inProgress: 2, done: 18,
  }), [])

  const firmware = useMemo(() => ({
    compliant: 15, total: 20, version: 'v2.3.1',
  }), [])

  /* ── Work orders ── */
  const workOrders: WorkOrder[] = useMemo(() => [
    { id: 'WO-101', robot: 'R-07', type: t('robotMaint.woTypeBumper'), priority: 'critical', status: 'todo', assignee: '', created: '10:14' },
    { id: 'WO-102', robot: 'R-12', type: t('robotMaint.woTypeBattery'), priority: 'high', status: 'in_progress', assignee: 'Tran V.', created: '09:30' },
    { id: 'WO-103', robot: 'R-03', type: t('robotMaint.woTypeWheel'), priority: 'medium', status: 'todo', assignee: '', created: '09:00' },
    { id: 'WO-104', robot: 'R-09', type: t('robotMaint.woTypeLidar'), priority: 'medium', status: 'todo', assignee: '', created: '08:45' },
    { id: 'WO-105', robot: 'R-05', type: t('robotMaint.woTypeFirmware'), priority: 'low', status: 'in_progress', assignee: 'Le H.', created: '08:30' },
    { id: 'WO-106', robot: 'R-01', type: t('robotMaint.woTypeMotor'), priority: 'high', status: 'todo', assignee: '', created: '08:15' },
    { id: 'WO-107', robot: 'R-04', type: t('robotMaint.woTypeClean'), priority: 'low', status: 'done', assignee: 'Nguyen V.', created: t('robotMaint.yesterday') },
    { id: 'WO-108', robot: 'R-02', type: t('robotMaint.woTypeFirmware'), priority: 'low', status: 'done', assignee: 'Le H.', created: t('robotMaint.yesterday') },
  ], [t])

  /* ── Robot health table ── */
  interface RobotHealth {
    id: string
    name: string
    health: 'ok' | 'warn' | 'critical'
    firmware: string
    uptime: string
    lastMaint: string
    nextMaint: string
  }

  const robotHealthData: RobotHealth[] = useMemo(() => [
    { id: '1', name: 'R-01', health: 'ok', firmware: 'v2.3.1', uptime: '99.2%', lastMaint: '05/02', nextMaint: '05/03' },
    { id: '2', name: 'R-03', health: 'warn', firmware: 'v2.3.0', uptime: '95.1%', lastMaint: '03/02', nextMaint: '03/03' },
    { id: '3', name: 'R-05', health: 'ok', firmware: 'v2.3.1', uptime: '98.7%', lastMaint: '04/02', nextMaint: '04/03' },
    { id: '4', name: 'R-07', health: 'critical', firmware: 'v2.2.9', uptime: '88.5%', lastMaint: '01/02', nextMaint: t('robotMaint.overdue') },
    { id: '5', name: 'R-09', health: 'warn', firmware: 'v2.3.0', uptime: '94.3%', lastMaint: '02/02', nextMaint: '10/02' },
    { id: '6', name: 'R-12', health: 'warn', firmware: 'v2.3.1', uptime: '91.8%', lastMaint: '07/02', nextMaint: '07/03' },
  ], [t])

  const prioConfig: Record<string, { color: string; label: string }> = {
    low: { color: 'blue', label: t('robotMaint.prioLow') },
    medium: { color: 'orange', label: t('robotMaint.prioMedium') },
    high: { color: 'red', label: t('robotMaint.prioHigh') },
    critical: { color: 'magenta', label: t('robotMaint.prioCritical') },
  }

  const statusConfig: Record<string, { color: string; label: string }> = {
    todo: { color: 'default', label: t('robotMaint.statusTodo') },
    in_progress: { color: 'processing', label: t('robotMaint.statusInProgress') },
    done: { color: 'success', label: t('robotMaint.statusDone') },
  }

  const healthIcon: Record<string, React.ReactNode> = {
    ok: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    warn: <WarningOutlined style={{ color: '#faad14' }} />,
    critical: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
  }

  /* ── Work order columns ── */
  const woCols: ColumnsType<WorkOrder> = [
    { title: 'ID', dataIndex: 'id', width: 90, render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text> },
    { title: t('robotAlerts.colRobot'), dataIndex: 'robot', width: 70 },
    { title: t('robotMaint.woType'), dataIndex: 'type', width: 160 },
    {
      title: t('robotMission.priority'), dataIndex: 'priority', width: 100,
      render: (v: string) => { const c = prioConfig[v]; return <Tag color={c.color} style={{ borderRadius: 4, margin: 0 }}>{c.label}</Tag> },
    },
    {
      title: t('robotAlerts.colStatus'), dataIndex: 'status', width: 120,
      render: (v: string) => { const c = statusConfig[v]; return <Tag color={c.color} style={{ borderRadius: 4, margin: 0 }}>{c.label}</Tag> },
    },
    { title: t('robotMaint.assignee'), dataIndex: 'assignee', width: 100, render: (v: string) => v || <Text type="secondary">—</Text> },
    { title: t('robotMaint.created'), dataIndex: 'created', width: 90 },
  ]

  /* ── Robot health columns ── */
  const healthCols: ColumnsType<RobotHealth> = [
    { title: 'Robot', dataIndex: 'name', width: 80, render: (v: string) => <Text strong>{v}</Text> },
    {
      title: t('robotMaint.health'), dataIndex: 'health', width: 100,
      render: (v: string) => (
        <Space size={4}>
          {healthIcon[v]}
          <Text style={{ textTransform: 'capitalize' }}>{v === 'ok' ? 'OK' : v === 'warn' ? t('robotAlerts.warning') : t('robotAlerts.critical')}</Text>
        </Space>
      ),
    },
    {
      title: 'Firmware', dataIndex: 'firmware', width: 100,
      render: (v: string) => (
        <Tag color={v === firmware.version ? 'green' : 'orange'} style={{ borderRadius: 4, margin: 0 }}>
          {v} {v !== firmware.version && <WarningOutlined />}
        </Tag>
      ),
    },
    { title: 'Uptime', dataIndex: 'uptime', width: 80 },
    { title: t('robotMaint.lastMaint'), dataIndex: 'lastMaint', width: 90 },
    {
      title: t('robotMaint.nextMaint'), dataIndex: 'nextMaint', width: 100,
      render: (v: string) => (
        <Text style={{ color: v === t('robotMaint.overdue') ? '#ff4d4f' : '#595959', fontWeight: v === t('robotMaint.overdue') ? 600 : 400 }}>
          {v}
        </Text>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t('robotMaint.title')}</Title>

      {/* ── Summary cards ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16, display: 'flex' }}>
        {/* Health */}
        <Col xs={24} sm={8} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 10, width: '100%' }} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14 }}><RobotOutlined style={{ marginRight: 6 }} />{t('robotMaint.health')}</Text>
            </div>
            <Space size={12} wrap>
              <Tooltip title="OK">
                <Badge count={health.ok} style={{ backgroundColor: '#52c41a' }} overflowCount={999}>
                  <Tag color="success" style={{ borderRadius: 6, fontSize: 13, padding: '2px 12px' }}>
                    <CheckCircleOutlined /> OK
                  </Tag>
                </Badge>
              </Tooltip>
              <Tooltip title={t('robotAlerts.warning')}>
                <Badge count={health.warn} style={{ backgroundColor: '#faad14' }} overflowCount={999}>
                  <Tag color="warning" style={{ borderRadius: 6, fontSize: 13, padding: '2px 12px' }}>
                    <WarningOutlined /> {t('robotMaint.warn')}
                  </Tag>
                </Badge>
              </Tooltip>
              <Tooltip title={t('robotAlerts.critical')}>
                <Badge count={health.critical} style={{ backgroundColor: '#ff4d4f' }} overflowCount={999}>
                  <Tag color="error" style={{ borderRadius: 6, fontSize: 13, padding: '2px 12px' }}>
                    <ExclamationCircleOutlined /> {t('robotMaint.criticalLabel')}
                  </Tag>
                </Badge>
              </Tooltip>
            </Space>
          </Card>
        </Col>

        {/* Work Orders */}
        <Col xs={24} sm={8} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 10, width: '100%' }} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14 }}><ToolOutlined style={{ marginRight: 6 }} />{t('robotMaint.workOrders')}</Text>
            </div>
            <Space size={12} wrap>
              <Statistic
                title={t('robotMaint.statusTodo')}
                value={workOrderSummary.todo}
                valueStyle={{ fontSize: 20, color: '#595959' }}
                prefix={<ClockCircleOutlined />}
              />
              <Statistic
                title={t('robotMaint.statusInProgress')}
                value={workOrderSummary.inProgress}
                valueStyle={{ fontSize: 20, color: '#1890ff' }}
                prefix={<SyncOutlined spin />}
              />
              <Statistic
                title={t('robotMaint.statusDone')}
                value={workOrderSummary.done}
                valueStyle={{ fontSize: 20, color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Space>
          </Card>
        </Col>

        {/* Firmware */}
        <Col xs={24} sm={8} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 10, width: '100%' }} bodyStyle={{ padding: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14 }}><CloudServerOutlined style={{ marginRight: 6 }} />{t('robotMaint.firmware')}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress
                type="circle"
                percent={Math.round((firmware.compliant / firmware.total) * 100)}
                size={60}
                strokeColor={firmware.compliant === firmware.total ? '#52c41a' : '#faad14'}
                format={() => `${firmware.compliant}/${firmware.total}`}
              />
              <div>
                <Text style={{ display: 'block', fontSize: 13 }}>{firmware.compliant}/{firmware.total} {t('robotMaint.onVersion')}</Text>
                <Tag color="green" style={{ borderRadius: 4, margin: 0 }}>
                  <ThunderboltOutlined style={{ marginRight: 2 }} />{firmware.version}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Work Orders table ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 10, marginBottom: 16 }}
        bodyStyle={{ padding: 0 }}
        title={<span><ToolOutlined style={{ marginRight: 6 }} />{t('robotMaint.workOrders')}</span>}
      >
        <Table
          dataSource={workOrders}
          columns={woCols}
          rowKey="id"
          size="small"
          pagination={false}
          rowClassName={(rec) => rec.priority === 'critical' ? 'critical-row' : ''}
        />
        <style>{`.critical-row { background: #fff1f0 !important; } .critical-row:hover > td { background: #ffe7e6 !important; }`}</style>
      </Card>

      {/* ── Robot Health table ── */}
      <Card
        bordered={false}
        style={{ borderRadius: 10 }}
        bodyStyle={{ padding: 0 }}
        title={<span><RobotOutlined style={{ marginRight: 6 }} />{t('robotMaint.robotHealth')}</span>}
      >
        <Table
          dataSource={robotHealthData}
          columns={healthCols}
          rowKey="id"
          size="small"
          pagination={false}
          rowClassName={(rec) => rec.health === 'critical' ? 'critical-row' : ''}
        />
      </Card>
    </div>
  )
}

export default RobotMaintenance
