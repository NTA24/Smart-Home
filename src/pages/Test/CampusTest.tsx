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
  Breadcrumb,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  BankOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
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
import { PageContainer, PageHeader, ContentCard, DataTable, TableActionButtons, CrudModal } from '@/components'

const { Text } = Typography

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
      render: (name: string, record: Campus) => (
        <Button
          type="link"
          className="test_name-link"
          onClick={() => navigate(`/test-api/buildings/${record.id}`)}
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
      render: (_: unknown, record: Campus) => (
        <TableActionButtons
          onView={() => fetchCampusById(record.id)}
          onEdit={() => openEditModal(record)}
          onDelete={() => handleDelete(record.id)}
          deleteConfirmTitle={t('apiTest.confirmDelete')}
        />
      ),
    },
  ]

  return (
    <PageContainer>
      <div className="test_breadcrumb-mb">
        <Breadcrumb
          items={[
            {
              title: (
                <Button type="link" className="test_link-p0" onClick={goBackToTenants}>
                  <ArrowLeftOutlined /> {t('apiTest.tenantManagement')}
                </Button>
              ),
            },
            { title: t('apiTest.campusManagement') },
          ]}
        />
      </div>

      <PageHeader
        title={t('apiTest.campusManagement')}
        icon={<BankOutlined style={{ color: '#52c41a' }} />}
        subtitle={<Tag color="purple">Tenant ID: {tenantId}</Tag>}
      />

      <Spin spinning={loading}>
        <ContentCard
          title={
            <Space>
              <BankOutlined style={{ color: '#52c41a' }} />
              <span>{t('apiTest.campusManagement')}</span>
              <Tag color="green">GET / POST / PATCH / DELETE</Tag>
            </Space>
          }
          titleExtra={
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
          <DataTable<Campus>
            columns={columns}
            dataSource={campuses}
            rowKey="id"
            loading={loading}
            pageSize={10}
            total={total}
            showSizeChanger
            onPageChange={(page, pageSize) => fetchCampuses(pageSize, (page - 1) * pageSize)}
          />
        </ContentCard>
      </Spin>

      <CrudModal
        title={editingId ? t('apiTest.editCampus') : t('apiTest.createCampus')}
        open={modalVisible}
        isEdit={!!editingId}
        form={form}
        onSubmit={editingId ? handleUpdate : handleCreate}
        onClose={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        loading={loading}
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
      </CrudModal>

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
    </PageContainer>
  )
}
