import axios from 'axios'
import { APP_API_BASE_URL } from '@/lib/config/appEnv'
import { shouldSendCredentials } from '@/lib/auth/authConfig'
import {
  attachAuthRequestInterceptor,
  attachMainApiResponseInterceptor,
} from './interceptors'

const api = axios.create({
  baseURL: APP_API_BASE_URL,
  timeout: 10000,
  withCredentials: shouldSendCredentials(),
  headers: {
    'Content-Type': 'application/json',
  },
})

attachAuthRequestInterceptor(api)
attachMainApiResponseInterceptor(api)

export default api
