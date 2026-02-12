import { useState } from 'react'
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Tree,
  Popconfirm,
  message,
  Switch,
  DatePicker,
  Tooltip,
} from 'antd'
import type { TreeDataNode } from 'antd'
import {
  LockOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useBuildingStore } from '@/stores'

const { Title, Text } = Typography

interface AccessRule {
  key: string
  subject: string
  subjectType: 'group' | 'user'
  allowedFloors: string[]
  timeSchedule: string
  method: string
  exceptions: string[]
  enabled: boolean
  expiration: string | null
  isTemporary: boolean
}

const ALL_FLOOR_KEYS = ['G', '1', '2', 'B1', 'B2', ...Array.from({ length: 18 }, (_, i) => `${i + 3}`), ...Array.from({ length: 15 }, (_, i) => `${i + 21}`), 'R', 'M']

export default function ElevatorAccessControl() {
  const { t } = useTranslation()

  const FLOOR_ZONES: TreeDataNode[] = [
    {
      title: t('elevatorAccess.zoneLobby'),
      key: 'lobby',
      icon: <ApartmentOutlined />,
      children: [
        { title: `${t('elevatorAccess.floorPrefix')} G`, key: 'G' },
        { title: `${t('elevatorAccess.floorPrefix')} 1`, key: '1' },
        { title: `${t('elevatorAccess.floorPrefix')} 2`, key: '2' },
      ],
    },
    {
      title: t('elevatorAccess.zoneParking'),
      key: 'parking',
      icon: <ApartmentOutlined />,
      children: [
        { title: 'B1', key: 'B1' },
        { title: 'B2', key: 'B2' },
      ],
    },
    {
      title: t('elevatorAccess.zoneOffice'),
      key: 'office',
      icon: <ApartmentOutlined />,
      children: Array.from({ length: 18 }, (_, i) => ({
        title: `${t('elevatorAccess.floorPrefix')} ${i + 3}`,
        key: `${i + 3}`,
      })),
    },
    {
      title: t('elevatorAccess.zoneResidential'),
      key: 'residential',
      icon: <ApartmentOutlined />,
      children: Array.from({ length: 15 }, (_, i) => ({
        title: `${t('elevatorAccess.floorPrefix')} ${i + 21}`,
        key: `${i + 21}`,
      })),
    },
    {
      title: t('elevatorAccess.zoneTechnical'),
      key: 'technical',
      icon: <ApartmentOutlined />,
      children: [
        { title: t('elevatorAccess.floorRoof'), key: 'R' },
        { title: t('elevatorAccess.floorMechanical'), key: 'M' },
      ],
    },
  ]

  const METHOD_COLORS: Record<string, string> = {
    [t('elevatorAccess.methodCard')]: 'blue',
    [t('elevatorAccess.methodCardPin')]: 'geekblue',
    [t('elevatorAccess.methodFaceRecognition')]: 'purple',
    [t('elevatorAccess.methodCardSupervisor')]: 'orange',
    [t('elevatorAccess.methodQrCode')]: 'cyan',
    [t('elevatorAccess.methodTempPass')]: 'gold',
  }

  const mockRules: AccessRule[] = [
    {
      key: '1', subject: t('elevatorAccess.subjectAllResidents'), subjectType: 'group',
      allowedFloors: ['G', '1', 'B1', 'B2', ...Array.from({ length: 15 }, (_, i) => `${i + 21}`)],
      timeSchedule: '24/7', method: t('elevatorAccess.methodCardPin'), exceptions: [], enabled: true, expiration: null, isTemporary: false,
    },
    {
      key: '2', subject: t('elevatorAccess.subjectOfficeStaff'), subjectType: 'group',
      allowedFloors: ['G', '1', '2', 'B1', ...Array.from({ length: 18 }, (_, i) => `${i + 3}`)],
      timeSchedule: 'Weekday 07:00–21:00', method: t('elevatorAccess.methodCard'), exceptions: [t('elevatorAccess.exHolidayOff')], enabled: true, expiration: null, isTemporary: false,
    },
    {
      key: '3', subject: t('elevatorAccess.subjectVipTenants'), subjectType: 'group',
      allowedFloors: ALL_FLOOR_KEYS.filter(f => !['R', 'M'].includes(f)),
      timeSchedule: '24/7', method: t('elevatorAccess.methodFaceRecognition'), exceptions: [], enabled: true, expiration: null, isTemporary: false,
    },
    {
      key: '4', subject: t('elevatorAccess.subjectMaintenanceTeam'), subjectType: 'group',
      allowedFloors: ALL_FLOOR_KEYS,
      timeSchedule: 'Weekday 08:00–18:00', method: t('elevatorAccess.methodCardSupervisor'), exceptions: [t('elevatorAccess.exWeekendApproval')], enabled: true, expiration: null, isTemporary: false,
    },
    {
      key: '5', subject: 'Nguyen Van A', subjectType: 'user',
      allowedFloors: ['G', '1', 'B1', '25', '26'],
      timeSchedule: '24/7', method: t('elevatorAccess.methodCardPin'), exceptions: [], enabled: true, expiration: '2026-03-15', isTemporary: true,
    },
    {
      key: '6', subject: t('elevatorAccess.subjectDeliveryService'), subjectType: 'group',
      allowedFloors: ['G', '1', 'B1'],
      timeSchedule: 'Daily 08:00–20:00', method: t('elevatorAccess.methodQrCode'), exceptions: [t('elevatorAccess.exNoB2')], enabled: true, expiration: null, isTemporary: false,
    },
    {
      key: '7', subject: 'Tran Thi B (Visitor)', subjectType: 'user',
      allowedFloors: ['G', '10'],
      timeSchedule: '2026-02-10 09:00–17:00', method: t('elevatorAccess.methodTempPass'), exceptions: [], enabled: true, expiration: '2026-02-10', isTemporary: true,
    },
  ]

  const { selectedBuilding } = useBuildingStore()
  const [rules, setRules] = useState<AccessRule[]>(mockRules)
  const [selectedZoneFloors, setSelectedZoneFloors] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null)
  const [form] = Form.useForm()

  // Filter rules by selected zone floors
  const filteredRules = selectedZoneFloors.length > 0
    ? rules.filter(r => r.allowedFloors.some(f => selectedZoneFloors.includes(f)))
    : rules

  const handleTreeSelect = (_: unknown, info: { node: TreeDataNode; selectedNodes: TreeDataNode[] }) => {
    const node = info.node
    if (node.children) {
      const childKeys = node.children.map(c => c.key as string)
      setSelectedZoneFloors(prev => {
        const hasAll = childKeys.every(k => prev.includes(k))
        if (hasAll) return prev.filter(k => !childKeys.includes(k))
        return [...new Set([...prev, ...childKeys])]
      })
    } else {
      const key = node.key as string
      setSelectedZoneFloors(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      )
    }
  }

  const handleCreate = () => {
    setEditingRule(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (rule: AccessRule) => {
    setEditingRule(rule)
    form.setFieldsValue({
      subject: rule.subject,
      subjectType: rule.subjectType,
      allowedFloors: rule.allowedFloors,
      timeSchedule: rule.timeSchedule,
      method: rule.method,
      isTemporary: rule.isTemporary,
      enabled: rule.enabled,
    })
    setModalOpen(true)
  }

  const handleDelete = (key: string) => {
    setRules(prev => prev.filter(r => r.key !== key))
    message.success(t('elevatorAccess.deleteSuccess'))
  }

  const handleToggle = (key: string, enabled: boolean) => {
    setRules(prev => prev.map(r => r.key === key ? { ...r, enabled } : r))
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingRule) {
        setRules(prev => prev.map(r => r.key === editingRule.key ? { ...r, ...values, exceptions: [] } : r))
        message.success(t('elevatorAccess.updateSuccess'))
      } else {
        const newRule: AccessRule = {
          key: Date.now().toString(),
          ...values,
          exceptions: [],
          expiration: values.isTemporary ? values.expiration?.format('YYYY-MM-DD') || null : null,
        }
        setRules(prev => [...prev, newRule])
        message.success(t('elevatorAccess.createSuccess'))
      }
      setModalOpen(false)
      form.resetFields()
    })
  }

  const summarizeFloors = (floors: string[]) => {
    if (floors.length === ALL_FLOOR_KEYS.length) return t('elevatorAccess.allFloors')
    if (floors.length > 6) return `${floors.slice(0, 5).join(', ')}… +${floors.length - 5}`
    return floors.join(', ')
  }

  const columns = [
    {
      title: t('elevatorAccess.subject'),
      dataIndex: 'subject',
      key: 'subject',
      width: 180,
      render: (subject: string, record: AccessRule) => (
        <Space size={6}>
          {record.subjectType === 'group'
            ? <TeamOutlined style={{ color: '#1890ff' }} />
            : <UserOutlined style={{ color: '#722ed1' }} />
          }
          <div>
            <Text strong style={{ fontSize: 13 }}>{subject}</Text>
            {record.isTemporary && (
              <div>
                <Tag color="gold" style={{ borderRadius: 6, fontSize: 10, marginTop: 2 }}>
                  <ClockCircleOutlined style={{ marginRight: 2 }} />
                  {record.expiration}
                </Tag>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: t('elevatorAccess.allowedFloors'),
      dataIndex: 'allowedFloors',
      key: 'allowedFloors',
      width: 200,
      render: (floors: string[]) => (
        <Tooltip title={floors.join(', ')}>
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{summarizeFloors(floors)}</Text>
        </Tooltip>
      ),
    },
    {
      title: t('elevatorAccess.time'),
      dataIndex: 'timeSchedule',
      key: 'timeSchedule',
      width: 170,
      render: (ts: string) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 11 }} />
          <Text style={{ fontSize: 12 }}>{ts}</Text>
        </Space>
      ),
    },
    {
      title: t('elevatorAccess.method'),
      dataIndex: 'method',
      key: 'method',
      width: 140,
      render: (method: string) => (
        <Tag color={METHOD_COLORS[method] || 'default'} style={{ borderRadius: 6 }}>
          <KeyOutlined style={{ marginRight: 4 }} />
          {method}
        </Tag>
      ),
    },
    {
      title: t('elevatorAccess.exceptions'),
      dataIndex: 'exceptions',
      key: 'exceptions',
      width: 160,
      render: (exceptions: string[]) =>
        exceptions.length > 0 ? (
          <Space direction="vertical" size={2}>
            {exceptions.map((ex, i) => (
              <Tag key={i} color="orange" style={{ borderRadius: 6, fontSize: 11 }}>
                <ExclamationCircleOutlined style={{ marginRight: 2 }} /> {ex}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
        ),
    },
    {
      title: t('elevatorAccess.actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: AccessRule) => (
        <Space size={4}>
          <Switch
            size="small"
            checked={record.enabled}
            onChange={v => handleToggle(record.key, v)}
          />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title={t('elevatorAccess.confirmDelete')}
            onConfirm={() => handleDelete(record.key)}
            okText={t('apiTest.yes')}
            cancelText={t('apiTest.no')}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
            <SafetyCertificateOutlined />
            {t('elevatorAccess.title')}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{selectedBuilding?.name || t('elevatorAccess.allSites')}</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}>{t('parkingMap.refresh')}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('elevatorAccess.createRule')}
          </Button>
        </Space>
      </div>

      {/* Main Layout: Tree + Table */}
      <Row gutter={16}>
        {/* Left: Zones/Floors tree */}
        <Col xs={24} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ApartmentOutlined />
                {t('elevatorAccess.zonesFloors')}
              </span>
            }
            extra={
              selectedZoneFloors.length > 0 ? (
                <Button type="link" size="small" onClick={() => setSelectedZoneFloors([])}>
                  {t('elevatorAccess.clearFilter')}
                </Button>
              ) : null
            }
          >
            <Tree
              treeData={FLOOR_ZONES}
              showIcon
              defaultExpandAll
              onSelect={(_, info) => handleTreeSelect(_, info as unknown as { node: TreeDataNode; selectedNodes: TreeDataNode[] })}
              style={{ fontSize: 13 }}
            />
            {selectedZoneFloors.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px 10px', background: '#e6f7ff', borderRadius: 8 }}>
                <Text style={{ fontSize: 11, color: '#1890ff' }}>
                  <LockOutlined style={{ marginRight: 4 }} />
                  {t('elevatorAccess.filterActive')}: {selectedZoneFloors.length} {t('elevatorAccess.floorsSelected')}
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Right: Rules table */}
        <Col xs={24} md={18}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LockOutlined style={{ color: '#1890ff' }} />
                {t('elevatorAccess.rulesTable')}
                <Tag color="blue" style={{ borderRadius: 8 }}>{filteredRules.length}</Tag>
              </span>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredRules}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${t('common.total')}: ${total}` }}
              size="small"
              scroll={{ x: 1050 }}
              rowClassName={(record) => !record.enabled ? 'disabled-row' : ''}
            />
          </Card>
        </Col>
      </Row>

      {/* Create / Edit Rule Modal */}
      <Modal
        title={
          <Space>
            {editingRule ? <EditOutlined /> : <PlusOutlined />}
            {editingRule ? t('elevatorAccess.editRule') : t('elevatorAccess.createRule')}
          </Space>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        onOk={handleSubmit}
        okText={editingRule ? t('apiTest.update') : t('apiTest.create')}
        cancelText={t('apiTest.cancel')}
        width={580}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ subjectType: 'group', method: t('elevatorAccess.methodCard'), isTemporary: false, enabled: true }}>
          {/* Subject */}
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="subjectType" label={t('elevatorAccess.subjectType')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="group"><TeamOutlined style={{ marginRight: 4 }} />{t('elevatorAccess.group')}</Select.Option>
                  <Select.Option value="user"><UserOutlined style={{ marginRight: 4 }} />{t('elevatorAccess.user')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="subject" label={t('elevatorAccess.subject')} rules={[{ required: true, message: t('elevatorAccess.subjectRequired') }]}>
                <Input placeholder={t('elevatorAccess.subjectPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          {/* Floors allowed */}
          <Form.Item name="allowedFloors" label={t('elevatorAccess.allowedFloors')} rules={[{ required: true, message: t('elevatorAccess.floorsRequired') }]}>
            <Select
              mode="multiple"
              placeholder={t('elevatorAccess.selectFloors')}
              maxTagCount={8}
              options={ALL_FLOOR_KEYS.map(f => ({ value: f, label: `${t('elevatorAccess.floorPrefix')} ${f}` }))}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Schedule */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="timeSchedule" label={t('elevatorAccess.schedule')} rules={[{ required: true, message: t('elevatorAccess.scheduleRequired') }]}>
                <Select placeholder={t('elevatorAccess.selectSchedule')}>
                  <Select.Option value="24/7">24/7</Select.Option>
                  <Select.Option value="Weekday 07:00–21:00">{t('elevatorAccess.weekday')} 07:00–21:00</Select.Option>
                  <Select.Option value="Weekday 08:00–18:00">{t('elevatorAccess.weekday')} 08:00–18:00</Select.Option>
                  <Select.Option value="Weekend 08:00–22:00">{t('elevatorAccess.weekend')} 08:00–22:00</Select.Option>
                  <Select.Option value="Daily 08:00–20:00">{t('elevatorAccess.daily')} 08:00–20:00</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="method" label={t('elevatorAccess.method')} rules={[{ required: true }]}>
                <Select>
                  <Select.Option value={t('elevatorAccess.methodCard')}>{t('elevatorAccess.methodCard')}</Select.Option>
                  <Select.Option value={t('elevatorAccess.methodCardPin')}>{t('elevatorAccess.methodCardPin')}</Select.Option>
                  <Select.Option value={t('elevatorAccess.methodFaceRecognition')}>{t('elevatorAccess.methodFaceRecognition')}</Select.Option>
                  <Select.Option value={t('elevatorAccess.methodCardSupervisor')}>{t('elevatorAccess.methodCardSupervisor')}</Select.Option>
                  <Select.Option value={t('elevatorAccess.methodQrCode')}>{t('elevatorAccess.methodQrCode')}</Select.Option>
                  <Select.Option value={t('elevatorAccess.methodTempPass')}>{t('elevatorAccess.methodTempPass')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Temporary pass / Expiration */}
          <Row gutter={12} align="middle">
            <Col span={8}>
              <Form.Item name="isTemporary" label={t('elevatorAccess.temporaryPass')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isTemporary !== cur.isTemporary}>
                {({ getFieldValue }) =>
                  getFieldValue('isTemporary') ? (
                    <Form.Item name="expiration" label={t('elevatorAccess.expiration')}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>

          {/* Enabled */}
          <Form.Item name="enabled" label={t('elevatorAccess.enabled')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .disabled-row { opacity: 0.45; }
        .disabled-row:hover td { background: #fafafa !important; }
      `}</style>
    </div>
  )
}
