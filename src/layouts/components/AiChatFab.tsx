import { useState, useRef, useEffect } from 'react'
import { Button, Drawer, Dropdown, Input, Spin, message, Popover } from 'antd'
import type { MenuProps } from 'antd'
import { CommentOutlined, SendOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { postChatWithAi } from '@/services'
import './AiChatFab.css'

const AI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
] as const

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function AiChatFab() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hintVisible, setHintVisible] = useState(false)
  const hintShownRef = useRef(false)

  useEffect(() => {
    if (hintShownRef.current) return
    const timer = window.setTimeout(() => {
      hintShownRef.current = true
      setHintVisible(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await postChatWithAi(text, selectedModel)
      const result = res?.result != null ? String(res.result) : (typeof res === 'string' ? res : '')
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result || t('aiChat.noResult', 'Không có phản hồi'),
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      message.error(t('aiChat.error', 'Lỗi kết nối AI') + ': ' + msg)
      const errMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('aiChat.error', 'Lỗi kết nối AI') + ': ' + msg,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setOpen(true)
    setHintVisible(false)
  }

  const closeHint = () => {
    setHintVisible(false)
  }

  const dropdownItems: MenuProps['items'] = AI_MODELS.map((m) => ({
    key: m.id,
    label: m.label,
    onClick: () => handleModelSelect(m.id),
  }))

  const selectedModelLabel = AI_MODELS.find((m) => m.id === selectedModel)?.label ?? selectedModel

  const hintContent = (
    <div className="ai-chat-fab-hint">
      <p className="ai-chat-fab-hint-text">{t('aiChat.hintText', 'Bấm vào nút bên dưới để chat với AI. Chọn model rồi bắt đầu trò chuyện.')}</p>
      <button type="button" className="ai-chat-fab-hint-close" onClick={closeHint}>
        {t('aiChat.hintGotIt', 'Đã hiểu')}
      </button>
    </div>
  )

  return (
    <>
      <Popover
        open={hintVisible}
        content={hintContent}
        placement="topRight"
        trigger={[]}
      >
        <div className="ai-chat-fab-wrapper">
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={['click']}
            placement="topRight"
            onOpenChange={(open) => { if (open) { closeHint() } }}
          >
            <button
              type="button"
              className="ai-chat-fab"
              aria-label={t('aiChat.open', 'Mở chat AI')}
            >
              <CommentOutlined className="ai-chat-fab-icon" />
            </button>
          </Dropdown>
        </div>
      </Popover>

      <Drawer
        title={
          <span className="ai-chat-drawer-title">
            <CommentOutlined className="ai-chat-drawer-title-icon" />
            {t('aiChat.title', 'Chat với AI')}
            <span className="ai-chat-drawer-model"> · {selectedModelLabel}</span>
          </span>
        }
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        width={480}
        className="ai-chat-drawer"
        destroyOnClose
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        <div className="ai-chat-body">
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                {t('aiChat.placeholder', 'Nhập tin nhắn để bắt đầu trò chuyện với AI...')}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ai-chat-message ai-chat-message--${m.role}`}
              >
                <div className="ai-chat-message-content">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-chat-message ai-chat-message--assistant">
                <Spin size="small" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-chat-input-wrap">
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiChat.inputPlaceholder', 'Nhập tin nhắn...')}
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={loading}
              className="ai-chat-input"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              disabled={!input.trim()}
              className="ai-chat-send"
            >
              {t('aiChat.send', 'Gửi')}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
