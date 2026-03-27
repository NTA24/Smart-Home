import { useState, useEffect } from 'react'
import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tag,
  Row,
  Col,
  Descriptions,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  ApiOutlined,
  CloudServerOutlined,
  BankOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { tenantApi } from '@/services'
import type {
  Tenant,
  CreateTenantPayload,
  UpdateTenantPayload,
} from '@/services'
import { PageContainer, PageHeader, ContentCard, DataTable, TableActionButtons, CrudModal } from '@/components'

const { Text } = Typography

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
      render: (id: string) => <Text copyable={{ text: id }} className="test_id-copy">{id}</Text>,
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
          className="test_name-link"
          onClick={() => navigate(`/test-api/campuses/${record.id}`)}
        >
          {name} <ArrowRightOutlined className="test_arrow-ml" />
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
        <TableActionButtons
          onView={() => fetchTenantById(record.id)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.id)}
          deleteConfirmTitle={t('apiTest.confirmDelete')}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('apiTest.title')}
        icon={<ApiOutlined className="text-primary" />}
        subtitle={
          <>
            <Text type="secondary" className="test_subtitle-mt block">
              {t('apiTest.subtitle')}
            </Text>
            <div className="test_tag-row">
              <Tag color="blue">Base URL: {import.meta.env.VITE_API_URL}</Tag>
              <Tag color="cyan">API docs: your deployed backend / Swagger</Tag>
            </div>
          </>
        }
      />

      <ContentCard size="small" className="test_card-mb">
        <Row gutter={[24, 12]}>
          <Col xs={24} md={12}>
            <Text strong className="text-primary">
              <CloudServerOutlined /> Tenant APIs
            </Text>
            <div className="test_api-block">
              <div><Tag color="green" className="test_tag-method">GET</Tag> <code>/api/tenants/list?limit=10&offset=0</code></div>
              <div className="test_api-line"><Tag color="green" className="test_tag-method">GET</Tag> <code>/api/tenants/:id</code></div>
              <div className="test_api-line"><Tag color="blue" className="test_tag-method">POST</Tag> <code>/api/tenants</code></div>
              <div className="test_api-line"><Tag color="orange" className="test_tag-method">PATCH</Tag> <code>/api/tenants/:id</code></div>
              <div className="test_api-line"><Tag color="red" className="test_tag-method">DELETE</Tag> <code>/api/tenants/:id</code></div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text strong className="text-success">
              <BankOutlined /> Campus APIs
            </Text>
            <div className="test_api-block">
              <div><Tag color="green" className="test_tag-method">GET</Tag> <code>/api/campuses/list?limit=10&offset=0</code></div>
              <div className="test_api-line"><Tag color="green" className="test_tag-method">GET</Tag> <code>/api/campuses/:id</code></div>
              <div className="test_api-line"><Tag color="blue" className="test_tag-method">POST</Tag> <code>/api/campuses</code></div>
              <div className="test_api-line"><Tag color="orange" className="test_tag-method">PATCH</Tag> <code>/api/campuses/:id</code></div>
              <div className="test_api-line"><Tag color="red" className="test_tag-method">DELETE</Tag> <code>/api/campuses/:id</code></div>
            </div>
          </Col>
        </Row>
      </ContentCard>

      <Spin spinning={loading}>
        <ContentCard
          title={
            <Space>
              <CloudServerOutlined className="text-primary" />
              <span>{t('apiTest.tenantManagement')}</span>
              <Tag color="blue">GET / POST / PATCH / DELETE</Tag>
            </Space>
          }
          titleExtra={
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
          <DataTable<Tenant>
            columns={columns}
            dataSource={tenants}
            rowKey="id"
            loading={loading}
            pageSize={10}
            total={total}
            showSizeChanger
            onPageChange={(page, pageSize) => fetchTenants(pageSize, (page - 1) * pageSize)}
          />
        </ContentCard>
      </Spin>

      <CrudModal
        title={editingId ? t('apiTest.editTenant') : t('apiTest.createTenant')}
        open={modalVisible}
        isEdit={!!editingId}
        form={form}
        onSubmit={editingId ? handleUpdate : handleCreate}
        onClose={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        loading={loading}
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
      </CrudModal>

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
            <Descriptions.Item label={t('apiTest.code')}>{(selectedTenant as { code?: string }).code ?? '-'}</Descriptions.Item>
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
    </PageContainer>
  )
}
