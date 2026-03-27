import axios from 'axios'
import { shouldSendCredentials } from '@/lib/auth/authConfig'
import { CHAT_WITH_AI_URL } from './chatConfig'
import { attachAuthRequestInterceptor, attachDataOnlyResponseInterceptor } from './interceptors'

/** Axios client for campus IoT host (parking APIs, etc.). Same base as chat AI. */
export const campusApiClient = axios.create({
  baseURL: CHAT_WITH_AI_URL,
  timeout: 15000,
  withCredentials: shouldSendCredentials(),
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

attachAuthRequestInterceptor(campusApiClient)
attachDataOnlyResponseInterceptor(campusApiClient)
