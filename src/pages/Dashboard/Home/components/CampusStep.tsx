import { Row, Col, Card, Typography, Tag, Button, Space, Empty, Popconfirm } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { Campus } from '@/services'
import { HOME_BUILDING_IMAGES } from '../constants'

const { Title, Text } = Typography

type Props = {
  campuses: Campus[]
  loading: boolean
  onSelect: (campus: Campus) => void
  onCreate: () => void
  onEdit: (campus: Campus) => void
  onDelete: (campus: Campus) => void
}

export function CampusStep({ campuses, loading, onSelect, onCreate, onEdit, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-12">
        <Button type="primary" onClick={onCreate} disabled={loading}>
          Thêm khu viên
        </Button>
      </div>
      <Row gutter={[24, 24]}>
        {campuses.length === 0 && !loading && (
          <Col span={24}>
            <Empty description={t('apiTest.noData')} />
          </Col>
        )}
        {campuses.map((campus, i) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={String(campus?.id ?? i)}>
            <Card
              hoverable
              onClick={() => onSelect(campus)}
              className="home_entity-card"
              bodyStyle={{ padding: 0 }}
            >
              <div className="home_campus-img-wrap">
                <img src={HOME_BUILDING_IMAGES[i % HOME_BUILDING_IMAGES.length]} alt={campus.name} className="home_campus-img" />
                <Tag color={campus.status === 'ACTIVE' ? 'green' : 'red'} className="home_campus-status-tag font-medium">
                  {campus.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                </Tag>
              </div>
              <div className="home_campus-info">
                <Title level={5} className="mb-4">
                  {campus.name}
                </Title>
                <Tag color="blue">{(campus as { code?: string }).code ?? ''}</Tag>
                {campus.address && (
                  <div className="flex items-center gap-6 mt-8">
                    <EnvironmentOutlined className="text-muted text-base" />
                    <Text type="secondary" className="text-base">
                      {campus.address}
                    </Text>
                  </div>
                )}
                <div className="mt-12">
                  <Space>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(campus)
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Popconfirm
                      title="Xóa khu viên"
                      description="Bạn có chắc muốn xóa khu viên này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={(e) => {
                        e?.stopPropagation?.()
                        onDelete(campus)
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
