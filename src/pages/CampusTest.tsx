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
  Breadcrumb,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BankOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useTabStore, routeToLabelKey } from '@/stores'
import type { Tab } from '@/stores'
import { campusApi } from '@/services'
import type {
  Campus,
  CreateCampusPayload,
  UpdateCampusPayload,
} from '@/services'

const { Title, Text } = Typography

export default function CampusTest() {
  const { t } = useTranslation()
  const { tenantId } = useParams<{ tenantId: string }>()
  const navigate = useNavigate()
  const { addTab } = useTabStore()

  const goBackToTenants = () => {
    const labelKey = routeToLabelKey['/test-api']
    if (labelKey) {
      const tab: Tab = { key: '/test-api', labelKey, closable: true }
      addTab(tab)
    }
    navigate('/test-api')
  }
  const [loading, setLoading] = useState(false)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [total, setTotal] = useState(0)
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchCampuses() }, [tenantId])

  const fetchCampuses = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const res = await campusApi.getList({ limit, offset })
      setCampuses(res?.items || [])
      setTotal(res?.total || 0)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampusById = async (id: string) => {
    setLoading(true)
    try {
      const res = await campusApi.getById(id)
      setSelectedCampus(res)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateCampusPayload) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await campusApi.create(values)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchCampuses()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateCampusPayload) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await campusApi.update(editingId, values)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchCampuses()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await campusApi.delete(id)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchCampuses()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    if (tenantId) {
      form.setFieldsValue({ tenant_id: tenantId })
    }
    setModalVisible(true)
  }

  const openEditModal = (record: Campus) => {
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
      render: (name: string, record: Campus) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => navigate(`/test-api/buildings/${record.id}`)}
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
      render: (_: unknown, record: Campus) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchCampusById(record.id)} />
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
      {/* Breadcrumb + Back */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <Button type="link" style={{ padding: 0 }} onClick={goBackToTenants}>
                  <ArrowLeftOutlined /> {t('apiTest.tenantManagement')}
                </Button>
              ),
            },
            { title: t('apiTest.campusManagement') },
          ]}
        />
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BankOutlined style={{ color: '#52c41a' }} />
          {t('apiTest.campusManagement')}
        </Title>
        <div style={{ marginTop: 8 }}>
          <Tag color="purple">Tenant ID: {tenantId}</Tag>
        </div>
      </div>

      {/* Campus Table */}
      <Spin spinning={loading}>
        <Card
          title={
            <Space>
              <BankOutlined style={{ color: '#52c41a' }} />
              <span>{t('apiTest.campusManagement')}</span>
              <Tag color="green">GET / POST / PATCH / DELETE</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={goBackToTenants}>
                {t('apiTest.back')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchCampuses()} loading={loading}>
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
            dataSource={campuses}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Total: ${t}`,
              onChange: (page, pageSize) => fetchCampuses(pageSize, (page - 1) * pageSize),
            }}
            size="middle"
            locale={{ emptyText: t('apiTest.noData') }}
          />
        </Card>
      </Spin>

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? t('apiTest.editCampus') : t('apiTest.createCampus')}
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
          {!editingId && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="code" label={t('apiTest.code')} rules={[{ required: true, message: t('apiTest.codeRequired') }]}>
                  <Input placeholder={t('apiTest.enterCode')} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tenant_id" label="Tenant ID" rules={[{ required: true, message: t('apiTest.tenantIdRequired') }]}>
                  <Input placeholder={t('apiTest.enterTenantId')} />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Form.Item name="name" label={t('apiTest.name')}>
            <Input placeholder={t('apiTest.enterName')} />
          </Form.Item>
          <Form.Item name="address" label={t('apiTest.address')}>
            <Input placeholder={t('apiTest.enterAddress')} />
          </Form.Item>
          <Form.Item name="timezone" label={t('apiTest.timezone')}>
            <Input placeholder={t('apiTest.enterTimezone')} />
          </Form.Item>
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
        title={t('apiTest.campusDetail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>{t('apiTest.close')}</Button>}
      >
        {selectedCampus ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedCampus.id}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.code')}>{selectedCampus.code}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.name')}>{selectedCampus.name}</Descriptions.Item>
            <Descriptions.Item label="Tenant ID">{selectedCampus.tenant_id || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.address')}>{selectedCampus.address || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.timezone')}>{selectedCampus.timezone || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.status')}>
              <Tag color={selectedCampus.status === 'ACTIVE' ? 'green' : 'red'}>
                {selectedCampus.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedCampus.created_at ? new Date(selectedCampus.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedCampus.updated_at ? new Date(selectedCampus.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  )
}
