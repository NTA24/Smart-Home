import axios from 'axios'
import { APP_API_BASE_URL } from '@/lib/config/appEnv'
import { shouldSendCredentials } from '@/lib/auth/authConfig'

/** Client tối giản cho POST refresh / logout — không gắn interceptor auth của app (tránh vòng lặp). */
export const refreshClient = axios.create({
  baseURL: APP_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: shouldSendCredentials(),
})
