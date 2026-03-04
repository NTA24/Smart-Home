import { useState } from 'react'
import {
  Typography, Button, Input, Upload, message, Result,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftOutlined, ExclamationCircleOutlined, UploadOutlined,
  EnvironmentOutlined, SendOutlined, ToolOutlined, ThunderboltOutlined,
  CoffeeOutlined, MoreOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { createWorkspaceIssueTicket } from '@/services/mockPersistence'

const { Text } = Typography

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
  const [ticketId, setTicketId] = useState('')

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning(t('wsReport.descRequired'))
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const createdId = createWorkspaceIssueTicket({
        room,
        issueType,
        severity,
        description: description.trim(),
      })
      setTicketId(createdId)
      setSubmitting(false)
      setSubmitted(true)
      message.success(t('wsReport.submitSuccess'))
    }, 1200)
  }

  if (submitted) {
    return (
      <PageContainer centered>
        <ContentCard className="workspace_report-result-card">
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title={t('wsReport.ticketCreated')}
            subTitle={<>
              <Text>{t('wsReport.ticketId')}: <Text strong style={{ color: '#1890ff' }}>#{ticketId || 'TK-0000'}</Text></Text>
              <br />
              <Text type="secondary">{t('wsReport.ticketDesc')}</Text>
            </>}
            extra={[
              <Button type="primary" key="tickets" className="workspace_report-result-btn"
                onClick={() => navigate('/smart-workspace/issue-tickets')}>
                {t('menu.issueTickets', 'Issue Tickets')}
              </Button>,
              <Button key="another" className="workspace_report-result-btn"
                onClick={() => { setSubmitted(false); setDescription(''); setFileList([]); setTicketId('') }}>
                {t('wsReport.reportAnother')}
              </Button>,
            ]}
          />
        </ContentCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="page-container--flex-center">
      <div className="workspace_report-max-w">

        {/* Header */}
        <PageHeader
          title={<><Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />{t('wsReport.title')}</>}
          icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        />

        {/* Room Info */}
        <ContentCard style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <div>
              <Text type="secondary" className="text-11 block">{t('wsReport.room')}</Text>
              <Text strong className="text-lg">{room}</Text>
            </div>
          </div>
        </ContentCard>

        {/* Form */}
        <ContentCard className="mb-16">
          {/* Issue Type */}
          <div className="workspace_report-section-mb">
            <Text strong className="workspace_report-label">
              {t('wsReport.type')}
            </Text>
            <div className="workspace_report-type-wrap">
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
          <div className="workspace_report-section-mb">
            <Text strong className="workspace_report-label">
              {t('wsReport.severity')}
            </Text>
            <div className="workspace_report-sev-row">
              {severities.map(s => (
                <Button
                  key={s.value}
                  type={severity === s.value ? 'primary' : 'default'}
                  onClick={() => setSeverity(s.value)}
                  className="workspace_report-sev-btn"
                  style={severity === s.value ? { background: s.color, borderColor: s.color } : undefined}>
                  {t(`wsReport.sev_${s.value}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="workspace_report-section-mb">
            <Text strong className="workspace_report-label">
              {t('wsReport.description')}
            </Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t('wsReport.descPlaceholder')}
              className="workspace_report-textarea"
            />
          </div>

          {/* Photo Upload */}
          <div className="workspace_report-section-mb">
            <Text strong className="workspace_report-label">
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
                  <UploadOutlined className="text-xl mb-4" />
                  <div className="workspace_report-upload-text">{t('wsReport.upload')}</div>
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
            className="workspace_report-submit-btn">
            {t('wsReport.submit')}
          </Button>
        </ContentCard>

      </div>
    </PageContainer>
  )
}
