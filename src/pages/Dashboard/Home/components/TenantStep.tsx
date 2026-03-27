import { Row, Col, Card, Typography, Tag, Button, Space, Empty, Popconfirm } from 'antd'
import { CloudServerOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { Tenant } from '@/services'

const { Title, Text } = Typography

type Props = {
  tenants: Tenant[]
  loading: boolean
  onSelect: (tenant: Tenant) => void
  onCreate: () => void
  onEdit: (tenant: Tenant) => void
  onDelete: (tenant: Tenant) => void
}

export function TenantStep({ tenants, loading, onSelect, onCreate, onEdit, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-12">
        <Button type="primary" onClick={onCreate} disabled={loading}>
          Thêm khách thuê
        </Button>
      </div>
      <Row className="home_tenant-row" gutter={[24, 24]}>
        {tenants.length === 0 && !loading && (
          <Col span={24}>
            <Empty description={t('apiTest.noData')} />
          </Col>
        )}
        {tenants.map((tenant) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={tenant.id}>
            <Card hoverable onClick={() => onSelect(tenant)} className="home_entity-card">
              <div className="home_entity-body">
                <div className="home_entity-avatar">
                  <CloudServerOutlined className="text-white text-2xl" />
                </div>
                <Title level={5} className="mb-4">
                  {tenant.name}
                </Title>
                <Tag>{(tenant as { code?: string }).code ?? tenant.slug ?? ''}</Tag>
                <div className="mt-12">
                  <Tag color={tenant.status === 'ACTIVE' ? 'green' : 'red'}>
                    {tenant.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                  </Tag>
                </div>
                <Text type="secondary" className="text-sm block mt-8 mb-12">
                  {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : ''}
                </Text>
                <div className="mt-12">
                  <Space>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(tenant)
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Popconfirm
                      title="Xóa khách thuê"
                      description="Bạn có chắc muốn xóa khách thuê này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={(e) => {
                        e?.stopPropagation?.()
                        onDelete(tenant)
                      }}
                      onCancel={(e) => e?.stopPropagation?.()}
                    >
                      <Button danger size="small" onClick={(e) => e.stopPropagation()}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
