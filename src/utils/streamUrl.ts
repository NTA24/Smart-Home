export type RtspConversionMode = 'hls-direct' | 'wss-proxy'

const DEFAULT_RTSP_PROXY_BASE = 'wss://yuanqu.smartmk.cn:19993/proxy'
const DEFAULT_HLS_PORT = 8888
const CAMERA_GLOBAL_STORAGE_KEY = 'securityCamera.globalConfig'
const DEFAULT_CAMERA_STREAM_BASE = '/camera-stream'

interface RtspConversionConfig {
  rtspConversionMode?: RtspConversionMode
  rtspProxyBaseUrl?: string
  rtspHlsPort?: number
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

function getConversionConfig(): RtspConversionConfig {
  try {
    const raw = localStorage.getItem(CAMERA_GLOBAL_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as RtspConversionConfig
  } catch {
    return {}
  }
}

export function toWebPlayableStreamUrl(rawUrl?: string): string {
  return getWebPlayableStreamCandidates(rawUrl)[0] || ''
}

export function resolveCameraStreamUrl(rawUrl?: string): string {
  const input = (rawUrl || '').trim()
  if (!input) return ''

  // Absolute/protocol URLs should be used as-is.
  if (
    input.startsWith('http://') ||
    input.startsWith('https://') ||
    input.startsWith('ws://') ||
    input.startsWith('wss://') ||
    input.startsWith('rtsp://') ||
    input.startsWith('rtsps://')
  ) {
    return input
  }

  if (input.startsWith('/camera-stream/')) {
    return input
  }

  const envBase = (import.meta.env.VITE_CAMERA_STREAM_BASE || '').trim()
  const base = (envBase || DEFAULT_CAMERA_STREAM_BASE).replace(/\/+$/, '')
  const path = input.startsWith('/') ? input : `/${input}`
  return `${base}${path}`
}

export function getWebPlayableStreamCandidates(rawUrl?: string): string[] {
  const input = (rawUrl || '').trim()
  if (!input) return []

  if (!input.startsWith('rtsp://') && !input.startsWith('rtsps://')) {
    return [input]
  }

  try {
    const parsed = new URL(input)
    const hostname = parsed.hostname
    const streamPath = trimSlashes(parsed.pathname)
    if (!hostname || !streamPath) return [input]

    const config = getConversionConfig()
    // Default to ws proxy for broader compatibility in browser playback.
    const mode: RtspConversionMode = config.rtspConversionMode || 'wss-proxy'
    const query = parsed.search || ''
    const hlsPort = typeof config.rtspHlsPort === 'number' && config.rtspHlsPort > 0
      ? config.rtspHlsPort
      : DEFAULT_HLS_PORT
    const hlsIndexUrl = `http://${hostname}:${hlsPort}/${streamPath}/index.m3u8`
    const hlsDirectUrl = `http://${hostname}:${hlsPort}/${streamPath}.m3u8`
    const mp4IndexUrl = `http://${hostname}:${hlsPort}/${streamPath}/index.mp4`
    const mp4DirectUrl = `http://${hostname}:${hlsPort}/${streamPath}.mp4`

    const port = parsed.port || '554'
    const proxyBase = (config.rtspProxyBaseUrl || DEFAULT_RTSP_PROXY_BASE).replace(/\/+$/, '')
    const wsProxyOpenUrl = `${proxyBase}/${hostname}:${port}/openUrl/${streamPath}${query}`
    const wsProxyDirectUrl = `${proxyBase}/${hostname}:${port}/${streamPath}${query}`

    const ordered =
      mode === 'hls-direct'
        ? [hlsIndexUrl, hlsDirectUrl, mp4IndexUrl, mp4DirectUrl, wsProxyOpenUrl, wsProxyDirectUrl]
        : [wsProxyOpenUrl, wsProxyDirectUrl, hlsIndexUrl, hlsDirectUrl, mp4IndexUrl, mp4DirectUrl]
    return Array.from(new Set(ordered))
  } catch {
    return [input]
  }
}
