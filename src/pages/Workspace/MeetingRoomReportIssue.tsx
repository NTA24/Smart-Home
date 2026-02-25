import { useState } from 'react'
import {
  Typography, Button, Input, Upload, message, Result,
} from 'antd'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftOutlined, ExclamationCircleOutlined, UploadOutlined,
  EnvironmentOutlined, SendOutlined, SoundOutlined, VideoCameraOutlined,
  DesktopOutlined, BulbOutlined, MoreOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader, ContentCard } from '@/components'
import { createMeetingIssueTicket } from '@/services/mockPersistence'

const { Text } = Typography

const issueTypes = [
  { value: 'audio', icon: <SoundOutlined />, color: '#1890ff' },
  { value: 'video', icon: <VideoCameraOutlined />, color: '#13c2c2' },
  { value: 'projector', icon: <DesktopOutlined />, color: '#722ed1' },
  { value: 'ac_light', icon: <BulbOutlined />, color: '#fa8c16' },
  { value: 'other', icon: <MoreOutlined />, color: '#8c8c8c' },
]

const severities = [
  { value: 'low', color: '#52c41a' },
  { value: 'normal', color: '#1890ff' },
  { value: 'high', color: '#fa8c16' },
  { value: 'critical', color: '#ff4d4f' },
]

export default function MeetingRoomReportIssue() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [room] = useState('Phòng họp lớn A')
  const [issueType, setIssueType] = useState('audio')
  const [severity, setSeverity] = useState('normal')
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning(t('meeting.descRequired'))
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const createdId = createMeetingIssueTicket({
        room,
        issueType,
        severity,
        description: description.trim(),
      })
      setTicketId(createdId)
      setSubmitting(false)
      setSubmitted(true)
      message.success(t('meeting.submitSuccess'))
    }, 1200)
  }

  if (submitted) {
    return (
      <PageContainer centered>
        <ContentCard className="meeting_report-result-card">
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title={t('meeting.ticketCreated')}
            subTitle={<>
              <Text>{t('meeting.ticketId')}: <Text strong style={{ color: '#1890ff' }}>#{ticketId || 'MR-0000'}</Text></Text>
              <br />
              <Text type="secondary">{t('meeting.ticketDesc')}</Text>
            </>}
            extra={[
              <Button type="primary" key="tickets" className="meeting_report-result-btn"
                onClick={() => navigate('/smart-meeting-room/issue-tickets')}>
                {t('menu.issueTickets', 'Issue Tickets')}
              </Button>,
              <Button key="another" className="meeting_report-result-btn"
                onClick={() => { setSubmitted(false); setDescription(''); setFileList([]); setTicketId('') }}>
                {t('meeting.reportAnother')}
              </Button>,
            ]}
          />
        </ContentCard>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="page-container--flex-center">
      <div className="meeting_report-max-w">

        {/* Header */}
        <PageHeader
          title={<><Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)} />{t('meeting.reportTitle')}</>}
          icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        />

        {/* Room Info */}
        <ContentCard style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 18 }} />
            <div>
              <Text type="secondary" className="text-11 block">{t('meeting.room')}</Text>
              <Text strong className="text-lg">{room}</Text>
            </div>
          </div>
        </ContentCard>

        {/* Form */}
        <ContentCard className="mb-16">
          {/* Issue Type */}
          <div className="meeting_report-section-mb">
            <Text strong className="meeting_report-label">
              {t('meeting.type')}
            </Text>
            <div className="meeting_report-type-wrap">
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
                  {t(`meeting.type_${it.value}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="meeting_report-section-mb">
            <Text strong className="meeting_report-label">
              {t('meeting.severity')}
            </Text>
            <div className="meeting_report-sev-row">
              {severities.map(s => (
                <Button
                  key={s.value}
                  type={severity === s.value ? 'primary' : 'default'}
                  onClick={() => setSeverity(s.value)}
                  className="meeting_report-sev-btn"
                  style={severity === s.value ? { background: s.color, borderColor: s.color } : undefined}>
                  {t(`meeting.sev_${s.value}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="meeting_report-section-mb">
            <Text strong className="meeting_report-label">
              {t('meeting.description')}
            </Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t('meeting.descPlaceholder')}
              className="meeting_report-textarea"
            />
          </div>

          {/* Photo Upload */}
          <div className="meeting_report-section-mb">
            <Text strong className="meeting_report-label">
              {t('meeting.attachPhoto')}
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
                  <div className="meeting_report-upload-text">{t('meeting.upload')}</div>
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
            className="meeting_report-submit-btn">
            {t('meeting.submit')}
          </Button>
        </ContentCard>

      </div>
    </PageContainer>
  )
}
