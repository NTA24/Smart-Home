import { Button, Card, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { DEFAULT_HOME_PATH } from '@/routes/routeConfig'
import { getAuthStrategy, tryRefreshAccessToken } from '@/lib/auth'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleContinue = async () => {
    if (getAuthStrategy() === 'bearer_memory') {
      const ok = await tryRefreshAccessToken()
      if (!ok) {
        message.error(t('auth.login.failed', 'Không thể xác thực phiên đăng nhập. Vui lòng đăng nhập lại.'))
        return
      }
    }
    navigate(DEFAULT_HOME_PATH)
  }

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
        <Button type="primary" block onClick={() => void handleContinue()}>
          {t('auth.login.continueHome')}
        </Button>
      </Card>
    </div>
  )
}
