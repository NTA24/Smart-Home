import api from '@/lib/http/client'
import { CHAT_WITH_AI_URL } from '@/lib/http/chatConfig'

export { CHAT_WITH_AI_URL }

export type ChatWithAiResponse = { result?: string }

/** POST chat-with-ai on campus IoT host (uses main api client + absolute path for cross-origin). */
export function postChatWithAi(text: string, model: string): Promise<ChatWithAiResponse> {
  return api.post(`${CHAT_WITH_AI_URL}/api/chat-with-ai/chat`, { text, model }) as unknown as Promise<ChatWithAiResponse>
}
