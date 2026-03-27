import { Button, Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DEFAULT_HOME_PATH } from '@/routes/routeConfig'

export default function LoginPage() {
  const { t } = useTranslation()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          {t('auth.login.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary">{t('auth.login.subtitle')}</Typography.Paragraph>
        <Link to={DEFAULT_HOME_PATH}>
          <Button type="primary" block>
            {t('auth.login.continueHome')}
          </Button>
        </Link>
      </Card>
    </div>
  )
}
