import { Row, Col, Card, Typography, Tag, Button, Space, Empty, Popconfirm } from 'antd'
import { AppstoreOutlined, BuildOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { Building } from '@/services'
import { HOME_BUILDING_IMAGES } from '../constants'

const { Title, Text } = Typography

type Props = {
  buildings: Building[]
  loading: boolean
  onSelect: (building: Building) => void
  onCreate: () => void
  onEdit: (building: Building) => void
  onDelete: (building: Building) => void
}

export function BuildingStep({ buildings, loading, onSelect, onCreate, onEdit, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-12">
        <Button type="primary" onClick={onCreate} disabled={loading}>
          Thêm tòa nhà
        </Button>
      </div>
      <Row gutter={[24, 24]}>
        {buildings.length === 0 && !loading && (
          <Col span={24}>
            <Empty description={t('apiTest.noData')} />
          </Col>
        )}
        {buildings.map((building, i) => (
          <Col xs={24} sm={12} lg={8} key={String(building?.id ?? i)}>
            <Card
              hoverable
              onClick={() => onSelect(building)}
              className="home_entity-card"
              bodyStyle={{ padding: 0 }}
            >
              <div className="home_building-img-wrap">
                <img
                  src={HOME_BUILDING_IMAGES[i % HOME_BUILDING_IMAGES.length]}
                  alt={building.name}
                  className="home_building-img"
                />
                <Tag color={building.status === 'ACTIVE' ? 'green' : 'red'} className="home_building-status-tag font-medium">
                  {building.status === 'ACTIVE' ? t('home.active') : t('home.inactive')}
                </Tag>
              </div>
              <div className="home_building-info">
                <Title level={5} className="mb-8">
                  {building.name}
                </Title>
                <div className="home_building-tags">
                  <Tag icon={<AppstoreOutlined />} className="home_building-tag-blue">
                    {building.code}
                  </Tag>
                  {building.building_type && (
                    <Tag icon={<BuildOutlined />} className="home_building-tag-green">
                      {building.building_type}
                    </Tag>
                  )}
                </div>
                <div className="home_building-footer">
                  <Text type="secondary" className="text-sm">
                    {building.created_at ? new Date(building.created_at).toLocaleDateString() : ''}
                  </Text>
                </div>
                <div className="mt-12">
                  <Space>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(building)
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Popconfirm
                      title="Xóa tòa nhà"
                      description="Bạn có chắc muốn xóa tòa nhà này?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={(e) => {
                        e?.stopPropagation?.()
                        onDelete(building)
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
