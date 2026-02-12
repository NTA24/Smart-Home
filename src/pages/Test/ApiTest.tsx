import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ApiOutlined,
  CloudServerOutlined,
  BankOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { tenantApi } from '@/services'
import type {
  Tenant,
  CreateTenantPayload,
  UpdateTenantPayload,
} from '@/services'

const { Title, Text } = Typography

export default function ApiTest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchTenants() }, [])

  const fetchTenants = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const res = await tenantApi.getList({ limit, offset })
      setTenants(res?.items || [])
      setTotal(res?.total || 0)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenantById = async (id: string) => {
    setLoading(true)
    try {
      const res = await tenantApi.getById(id)
      setSelectedTenant(res)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateTenantPayload) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await tenantApi.create(values)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchTenants()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateTenantPayload) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await tenantApi.update(editingId, values)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchTenants()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await tenantApi.delete(id)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchTenants()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openEditModal = (record: Tenant) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 280,
      ellipsis: true,
      render: (id: string) => <Text copyable={{ text: id }} style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: t('apiTest.code'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: t('apiTest.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Tenant) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => navigate(`/test-api/campuses/${record.id}`)}
        >
          {name} <ArrowRightOutlined style={{ marginLeft: 4, fontSize: 11 }} />
        </Button>
      ),
    },
    {
      title: t('apiTest.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: t('apiTest.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: t('apiTest.actions'),
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Tenant) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchTenantById(record.id)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title={t('apiTest.confirmDelete')}
            onConfirm={() => handleDelete(record.id)}
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
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ApiOutlined style={{ color: '#1890ff' }} />
          {t('apiTest.title')}
        </Title>
        <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
          {t('apiTest.subtitle')}
        </Text>
        <div style={{ marginTop: 8 }}>
          <Tag color="blue">Base URL: {import.meta.env.VITE_API_URL || '/api'}</Tag>
          <Tag color="cyan">Swagger: campus.iot-platform.io.vn</Tag>
        </div>
      </div>

      {/* API Endpoints Info */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={[24, 12]}>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#1890ff' }}>
              <CloudServerOutlined /> Tenant APIs
            </Text>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <div><Tag color="green" style={{ width: 60, textAlign: 'center' }}>GET</Tag> <code>/api/tenants/list?limit=10&offset=0</code></div>
              <div style={{ marginTop: 4 }}><Tag color="green" style={{ width: 60, textAlign: 'center' }}>GET</Tag> <code>/api/tenants/:id</code></div>
              <div style={{ marginTop: 4 }}><Tag color="blue" style={{ width: 60, textAlign: 'center' }}>POST</Tag> <code>/api/tenants</code></div>
              <div style={{ marginTop: 4 }}><Tag color="orange" style={{ width: 60, textAlign: 'center' }}>PATCH</Tag> <code>/api/tenants/:id</code></div>
              <div style={{ marginTop: 4 }}><Tag color="red" style={{ width: 60, textAlign: 'center' }}>DELETE</Tag> <code>/api/tenants/:id</code></div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: '#52c41a' }}>
              <BankOutlined /> Campus APIs
            </Text>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <div><Tag color="green" style={{ width: 60, textAlign: 'center' }}>GET</Tag> <code>/api/campuses/list?limit=10&offset=0</code></div>
              <div style={{ marginTop: 4 }}><Tag color="green" style={{ width: 60, textAlign: 'center' }}>GET</Tag> <code>/api/campuses/:id</code></div>
              <div style={{ marginTop: 4 }}><Tag color="blue" style={{ width: 60, textAlign: 'center' }}>POST</Tag> <code>/api/campuses</code></div>
              <div style={{ marginTop: 4 }}><Tag color="orange" style={{ width: 60, textAlign: 'center' }}>PATCH</Tag> <code>/api/campuses/:id</code></div>
              <div style={{ marginTop: 4 }}><Tag color="red" style={{ width: 60, textAlign: 'center' }}>DELETE</Tag> <code>/api/campuses/:id</code></div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tenant Table */}
      <Spin spinning={loading}>
        <Card
          title={
            <Space>
              <CloudServerOutlined style={{ color: '#1890ff' }} />
              <span>{t('apiTest.tenantManagement')}</span>
              <Tag color="blue">GET / POST / PATCH / DELETE</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchTenants()} loading={loading}>
                {t('apiTest.loadData')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                {t('apiTest.create')}
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Total: ${t}`,
              onChange: (page, pageSize) => fetchTenants(pageSize, (page - 1) * pageSize),
            }}
            size="middle"
            locale={{ emptyText: t('apiTest.noData') }}
          />
        </Card>
      </Spin>

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? t('apiTest.editTenant') : t('apiTest.createTenant')}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingId ? handleUpdate : handleCreate}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label={t('apiTest.code')} rules={[{ required: true, message: t('apiTest.codeRequired') }]}>
                <Input placeholder={t('apiTest.enterCode')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label={t('apiTest.name')} rules={[{ required: true, message: t('apiTest.nameRequired') }]}>
                <Input placeholder={t('apiTest.enterName')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label={t('apiTest.status')} initialValue="ACTIVE">
            <Select>
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setModalVisible(false); form.resetFields() }}>
                {t('apiTest.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? t('apiTest.update') : t('apiTest.create')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={t('apiTest.tenantDetail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>{t('apiTest.close')}</Button>}
      >
        {selectedTenant ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedTenant.id}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.code')}>{selectedTenant.code}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.name')}>{selectedTenant.name}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.status')}>
              <Tag color={selectedTenant.status === 'ACTIVE' ? 'green' : 'red'}>
                {selectedTenant.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedTenant.created_at ? new Date(selectedTenant.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedTenant.updated_at ? new Date(selectedTenant.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  )
}
