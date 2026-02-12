import { useState } from 'react'
import {
  Card, Typography, Space, Button, Input, Upload, message, Tag, Result,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftOutlined, ExclamationCircleOutlined, UploadOutlined,
  EnvironmentOutlined, SendOutlined, ToolOutlined, ThunderboltOutlined,
  CoffeeOutlined, MoreOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const issueTypes = [
  { value: 'device', icon: <ToolOutlined />, color: '#1890ff' },
  { value: 'cleaning', icon: <CoffeeOutlined />, color: '#52c41a' },
  { value: 'hvac', icon: <ThunderboltOutlined />, color: '#fa8c16' },
  { value: 'supplies', icon: <MoreOutlined />, color: '#722ed1' },
  { value: 'other', icon: <ExclamationCircleOutlined />, color: '#8c8c8c' },
]

const severities = [
  { value: 'low', color: '#52c41a' },
  { value: 'normal', color: '#1890ff' },
  { value: 'high', color: '#fa8c16' },
  { value: 'critical', color: '#ff4d4f' },
]

export default function WorkspaceReportIssue() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [room] = useState('A-1201')
  const [issueType, setIssueType] = useState('device')
  const [severity, setSeverity] = useState('normal')
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning(t('wsReport.descRequired'))
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      message.success(t('wsReport.submitSuccess'))
    }, 1200)
  }

  if (submitted) {
    return (
      <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title={t('wsReport.ticketCreated')}
            subTitle={<>
              <Text>{t('wsReport.ticketId')}: <Text strong style={{ color: '#1890ff' }}>#TK-1284</Text></Text>
              <br />
              <Text type="secondary">{t('wsReport.ticketDesc')}</Text>
            </>}
            extra={[
              <Button type="primary" key="kiosk" style={{ borderRadius: 8 }}
                onClick={() => navigate('/smart-workspace/kiosk')}>
                {t('wsReport.backToKiosk')}
              </Button>,
              <Button key="another" style={{ borderRadius: 8 }}
                onClick={() => { setSubmitted(false); setDescription(''); setFileList([]) }}>
                {t('wsReport.reportAnother')}
              </Button>,
            ]}
          />
        </Card>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f4f8', margin: -16, padding: 20, minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />
            <Title level={4} style={{ margin: 0 }}>
              <ExclamationCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
              {t('wsReport.title')}
            </Title>
          </div>
        </Card>

        {/* Room Info */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{t('wsReport.room')}</Text>
              <Text strong style={{ fontSize: 16 }}>{room}</Text>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          {/* Issue Type */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              {t('wsReport.type')}
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {issueTypes.map(it => (
                <Button
                  key={it.value}
                  icon={it.icon}
                  type={issueType === it.value ? 'primary' : 'default'}
                  onClick={() => setIssueType(it.value)}
                  style={{
                    borderRadius: 8, height: 38,
                    ...(issueType === it.value
                      ? { background: it.color, borderColor: it.color }
                      : {}),
                  }}>
                  {t(`wsReport.type_${it.value}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              {t('wsReport.severity')}
            </Text>
            <div style={{ display: 'flex', gap: 8 }}>
              {severities.map(s => (
                <Button
                  key={s.value}
                  type={severity === s.value ? 'primary' : 'default'}
                  onClick={() => setSeverity(s.value)}
                  style={{
                    borderRadius: 8, height: 36, flex: 1, fontWeight: 500, fontSize: 13,
                    ...(severity === s.value
                      ? { background: s.color, borderColor: s.color }
                      : {}),
                  }}>
                  {t(`wsReport.sev_${s.value}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              {t('wsReport.description')}
            </Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t('wsReport.descPlaceholder')}
              style={{ borderRadius: 8, fontSize: 14, resize: 'none' }}
            />
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
              {t('wsReport.attachPhoto')}
            </Text>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              beforeUpload={() => false}
              maxCount={3}
            >
              {fileList.length < 3 && (
                <div>
                  <UploadOutlined style={{ fontSize: 20, marginBottom: 4 }} />
                  <div style={{ fontSize: 12 }}>{t('wsReport.upload')}</div>
                </div>
              )}
            </Upload>
          </div>

          {/* Submit */}
          <Button
            type="primary"
            size="large"
            block
            danger
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmit}
            disabled={!description.trim()}
            style={{ borderRadius: 10, height: 48, fontWeight: 600, fontSize: 15 }}>
            {t('wsReport.submit')}
          </Button>
        </Card>

      </div>
    </div>
  )
}
