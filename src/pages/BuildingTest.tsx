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
  HomeOutlined,
  ArrowLeftOutlined,
  CloudServerOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useTabStore, routeToLabelKey } from '@/stores'
import type { Tab } from '@/stores'
import { buildingApi } from '@/services'
import type {
  Building,
  CreateBuildingPayload,
  UpdateBuildingPayload,
} from '@/services'

const { Title, Text } = Typography

export default function BuildingTest() {
  const { t } = useTranslation()
  const { campusId } = useParams<{ campusId: string }>()
  const navigate = useNavigate()
  const { addTab } = useTabStore()
  const [loading, setLoading] = useState(false)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [total, setTotal] = useState(0)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchBuildings() }, [campusId])

  const goBackToTenants = () => {
    const labelKey = routeToLabelKey['/test-api']
    if (labelKey) {
      const tab: Tab = { key: '/test-api', labelKey, closable: true }
      addTab(tab)
    }
    navigate('/test-api')
  }

  const fetchBuildings = async (limit = 10, offset = 0) => {
    setLoading(true)
    try {
      const res = await buildingApi.getList({ limit, offset })
      setBuildings(res?.items || [])
      setTotal(res?.total || 0)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuildingById = async (id: string) => {
    setLoading(true)
    try {
      const res = await buildingApi.getById(id)
      setSelectedBuilding(res)
      setDetailVisible(true)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.fetchDetailError')}: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (values: CreateBuildingPayload) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await buildingApi.create(values)
      hide()
      message.success(t('apiTest.createSuccess'))
      setModalVisible(false)
      form.resetFields()
      fetchBuildings()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.createError')}: ${errorMsg}`)
    }
  }

  const handleUpdate = async (values: UpdateBuildingPayload) => {
    if (!editingId) return
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await buildingApi.update(editingId, values)
      hide()
      message.success(t('apiTest.updateSuccess'))
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
      fetchBuildings()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.updateError')}: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    const hide = message.loading(t('apiTest.processing'), 0)
    try {
      await buildingApi.delete(id)
      hide()
      message.success(t('apiTest.deleteSuccess'))
      fetchBuildings()
    } catch (err: unknown) {
      hide()
      const errorMsg = err instanceof Error ? err.message : String(err)
      message.error(`${t('apiTest.deleteError')}: ${errorMsg}`)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    form.resetFields()
    if (campusId) {
      form.setFieldsValue({ campus_id: campusId })
    }
    setModalVisible(true)
  }

  const openEditModal = (record: Building) => {
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
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('apiTest.buildingType'),
      dataIndex: 'building_type',
      key: 'building_type',
      width: 150,
      render: (type: string) => type ? <Tag color="geekblue">{type}</Tag> : '-',
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
      render: (_: unknown, record: Building) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => fetchBuildingById(record.id)} />
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
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <Button type="link" style={{ padding: 0 }} onClick={goBackToTenants}>
                  <CloudServerOutlined /> Tenants
                </Button>
              ),
            },
            {
              title: (
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate(-1)}>
                  <BankOutlined /> Campuses
                </Button>
              ),
            },
            { title: <><HomeOutlined /> Buildings</> },
          ]}
        />
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <HomeOutlined style={{ color: '#fa8c16' }} />
          {t('apiTest.buildingManagement')}
        </Title>
        <div style={{ marginTop: 8 }}>
          <Tag color="cyan">Campus ID: {campusId}</Tag>
        </div>
      </div>

      {/* Building Table */}
      <Spin spinning={loading}>
        <Card
          title={
            <Space>
              <HomeOutlined style={{ color: '#fa8c16' }} />
              <span>{t('apiTest.buildingManagement')}</span>
              <Tag color="orange">GET / POST / PATCH / DELETE</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                {t('apiTest.back')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchBuildings()} loading={loading}>
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
            dataSource={buildings}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Total: ${t}`,
              onChange: (page, pageSize) => fetchBuildings(pageSize, (page - 1) * pageSize),
            }}
            size="middle"
            locale={{ emptyText: t('apiTest.noData') }}
          />
        </Card>
      </Spin>

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? t('apiTest.editBuilding') : t('apiTest.createBuilding')}
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
                <Form.Item name="campus_id" label="Campus ID" rules={[{ required: true, message: t('apiTest.campusIdRequired') }]}>
                  <Input placeholder="Campus ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code" label={t('apiTest.code')} rules={[{ required: true, message: t('apiTest.codeRequired') }]}>
                  <Input placeholder={t('apiTest.enterCode')} />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Form.Item name="name" label={t('apiTest.name')}>
            <Input placeholder={t('apiTest.enterName')} />
          </Form.Item>
          <Form.Item name="building_type" label={t('apiTest.buildingType')}>
            <Input placeholder={t('apiTest.enterBuildingType')} />
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
        title={t('apiTest.buildingDetail')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>{t('apiTest.close')}</Button>}
      >
        {selectedBuilding ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedBuilding.id}</Descriptions.Item>
            <Descriptions.Item label="Campus ID">{selectedBuilding.campus_id}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.code')}>{selectedBuilding.code}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.name')}>{selectedBuilding.name}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.buildingType')}>{selectedBuilding.building_type || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('apiTest.status')}>
              <Tag color={selectedBuilding.status === 'ACTIVE' ? 'green' : 'red'}>
                {selectedBuilding.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.createdAt')}>
              {selectedBuilding.created_at ? new Date(selectedBuilding.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('apiTest.updatedAt')}>
              {selectedBuilding.updated_at ? new Date(selectedBuilding.updated_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  )
}
