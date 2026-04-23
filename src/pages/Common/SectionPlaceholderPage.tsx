import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

export default function SectionPlaceholderPage() {
  const { t } = useTranslation()

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
          {t('placeholder.title', 'Tính năng đang phát triển')}
        </Title>
        <Paragraph style={{ marginBottom: 0 }}>
          {t('placeholder.description', 'Nội dung cho mục này chưa được triển khai.')}
        </Paragraph>
      </Card>
    </div>
  )
}
