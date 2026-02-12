import { useState } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  Radio,
  Tag,
  Space,
  Divider,
  InputNumber,
  message,
  Checkbox,
} from 'antd'
import {
  SendOutlined,
  EyeOutlined,
  RobotOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography

const RobotCreateMission = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [robotMode, setRobotMode] = useState<'auto' | 'manual'>('auto')
  const [submitting, setSubmitting] = useState(false)

  const missionTypes = [
    { value: 'delivery', label: t('robotMission.typeDelivery') },
    { value: 'clean', label: t('robotMission.typeClean') },
    { value: 'patrol', label: t('robotMission.typePatrol') },
    { value: 'transport', label: t('robotMission.typeTransport') },
  ]

  const priorities = [
    { value: 'low', label: t('robotMission.priorityLow'), color: 'blue' },
    { value: 'medium', label: t('robotMission.priorityMedium'), color: 'orange' },
    { value: 'high', label: t('robotMission.priorityHigh'), color: 'red' },
    { value: 'urgent', label: t('robotMission.priorityUrgent'), color: 'magenta' },
  ]

  const schedules = [
    { value: 'now', label: t('robotMission.scheduleNow') },
    { value: 'scheduled', label: t('robotMission.scheduleScheduled') },
  ]

  const locations = [
    { value: 'lobby-reception', label: `${t('robotFleet.lobby')} - Reception` },
    { value: 'b1-dock-a', label: 'B1 - Dock A' },
    { value: 'b1-zone1', label: 'B1 - Zone 1' },
    { value: 'b1-zone2', label: 'B1 - Zone 2' },
    { value: 'f1-lobby', label: '1F - Lobby' },
    { value: 'f12-r1203', label: `Floor 12 - Room 1203` },
    { value: 'f12-r1205', label: `Floor 12 - Room 1205` },
    { value: 'f5-office', label: `Floor 5 - Office A` },
  ]

  const availableRobots = [
    { value: 'R-01', label: 'R-01', battery: 68, status: 'idle' },
    { value: 'R-03', label: 'R-03', battery: 55, status: 'idle' },
    { value: 'R-05', label: 'R-05', battery: 88, status: 'charging' },
    { value: 'R-09', label: 'R-09', battery: 72, status: 'idle' },
  ]

  const requirements = [
    { value: 'elevator', label: t('robotMission.reqElevator') },
    { value: 'door-access', label: t('robotMission.reqDoorAccess') },
    { value: 'heavy-load', label: t('robotMission.reqHeavyLoad') },
    { value: 'outdoor', label: t('robotMission.reqOutdoor') },
  ]

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        message.success(t('robotMission.dispatched'))
        form.resetFields()
      }, 1000)
    } catch {
      /* validation error */
    }
  }

  const handlePreview = () => {
    message.info(t('robotMission.previewRoute'))
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>{t('robotMission.title')}</Title>

      <Form form={form} layout="vertical" initialValues={{ schedule: 'now', priority: 'high', sla: 10 }}>
        <Row gutter={[16, 16]}>
          {/* Left: Main form */}
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 10 }} bodyStyle={{ padding: 20 }}>
              {/* Type, Priority, Schedule */}
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="type"
                    label={<span><FlagOutlined style={{ marginRight: 4 }} />{t('robotMission.type')}</span>}
                    rules={[{ required: true, message: t('robotMission.required') }]}
                  >
                    <Select options={missionTypes} placeholder={t('robotMission.selectType')} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="priority"
                    label={<span><ThunderboltOutlined style={{ marginRight: 4 }} />{t('robotMission.priority')}</span>}
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={priorities.map(p => ({
                        value: p.value,
                        label: <Tag color={p.color} style={{ margin: 0, borderRadius: 4 }}>{p.label}</Tag>,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="schedule"
                    label={<span><ClockCircleOutlined style={{ marginRight: 4 }} />{t('robotMission.schedule')}</span>}
                  >
                    <Select options={schedules} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '8px 0 16px' }} />

              {/* Pickup & Dropoff */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="pickup"
                    label={<span><EnvironmentOutlined style={{ color: '#52c41a', marginRight: 4 }} />{t('robotMission.pickup')}</span>}
                    rules={[{ required: true, message: t('robotMission.required') }]}
                  >
                    <Select options={locations} placeholder={t('robotMission.selectLocation')} showSearch />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="dropoff"
                    label={<span><EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />{t('robotMission.dropoff')}</span>}
                    rules={[{ required: true, message: t('robotMission.required') }]}
                  >
                    <Select options={locations} placeholder={t('robotMission.selectLocation')} showSearch />
                  </Form.Item>
                </Col>
              </Row>

              {/* Notes */}
              <Form.Item
                name="notes"
                label={<span><FileTextOutlined style={{ marginRight: 4 }} />{t('robotMission.notes')}</span>}
              >
                <Input.TextArea rows={2} placeholder={t('robotMission.notesPlaceholder')} />
              </Form.Item>

              <Divider style={{ margin: '8px 0 16px' }} />

              {/* Robot selection */}
              <Form.Item label={<span><RobotOutlined style={{ marginRight: 4 }} />{t('robotMission.robotSelection')}</span>}>
                <Radio.Group value={robotMode} onChange={(e) => setRobotMode(e.target.value)} style={{ marginBottom: 8 }}>
                  <Radio value="auto">{t('robotMission.autoAssign')}</Radio>
                  <Radio value="manual">{t('robotMission.manualChoose')}</Radio>
                </Radio.Group>
                {robotMode === 'manual' && (
                  <Form.Item name="robotId" noStyle>
                    <Select placeholder={t('robotMission.selectRobot')} style={{ width: '100%' }}>
                      {availableRobots.map(r => (
                        <Select.Option key={r.value} value={r.value}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span><RobotOutlined style={{ marginRight: 6 }} />{r.label}</span>
                            <Space size={6}>
                              <Tag color={r.status === 'idle' ? 'green' : 'cyan'} style={{ margin: 0, borderRadius: 4, fontSize: 11 }}>
                                {r.status === 'idle' ? t('robotFleet.status_idle') : t('robotFleet.status_charging')}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                <ThunderboltOutlined /> {r.battery}%
                              </Text>
                            </Space>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>

              {/* Requirements */}
              <Form.Item
                name="requirements"
                label={<span><SettingOutlined style={{ marginRight: 4 }} />{t('robotMission.requirements')}</span>}
              >
                <Checkbox.Group>
                  <Space wrap>
                    {requirements.map(r => (
                      <Checkbox key={r.value} value={r.value}>
                        <Tag style={{ margin: 0, borderRadius: 4 }}>{r.label}</Tag>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              {/* SLA */}
              <Form.Item
                name="sla"
                label="SLA"
              >
                <InputNumber min={1} max={120} addonAfter={t('robotMission.minutes')} style={{ width: 180 }} />
              </Form.Item>
            </Card>
          </Col>

          {/* Right: Summary & Actions */}
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 10, position: 'sticky', top: 16 }} bodyStyle={{ padding: 20 }}>
              <Title level={5} style={{ marginTop: 0 }}>{t('robotMission.summary')}</Title>
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const values = form.getFieldsValue()
                    const typeLabel = missionTypes.find(m => m.value === values.type)?.label ?? '—'
                    const prioObj = priorities.find(p => p.value === values.priority)
                    const pickLabel = locations.find(l => l.value === values.pickup)?.label ?? '—'
                    const dropLabel = locations.find(l => l.value === values.dropoff)?.label ?? '—'
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>{t('robotMission.type')}: </Text><Text strong>{typeLabel}</Text></div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>{t('robotMission.priority')}: </Text>
                          {prioObj ? <Tag color={prioObj.color} style={{ margin: 0, borderRadius: 4 }}>{prioObj.label}</Tag> : '—'}
                        </div>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>{t('robotMission.pickup')}: </Text><Text>{pickLabel}</Text></div>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>{t('robotMission.dropoff')}: </Text><Text>{dropLabel}</Text></div>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>SLA: </Text><Text>{values.sla ?? 10} {t('robotMission.minutes')}</Text></div>
                        <div><Text type="secondary" style={{ fontSize: 11 }}>Robot: </Text><Text>{robotMode === 'auto' ? t('robotMission.autoAssign') : (values.robotId ?? '—')}</Text></div>
                      </div>
                    )
                  }}
                </Form.Item>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<EyeOutlined />} onClick={handlePreview}>
                  {t('robotMission.previewRouteBtn')}
                </Button>
                <Button block type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit} size="large">
                  {t('robotMission.dispatch')}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default RobotCreateMission
