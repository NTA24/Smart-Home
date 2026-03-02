export type RtspConversionMode = 'hls-direct' | 'wss-proxy'

const DEFAULT_RTSP_PROXY_BASE = ''
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

/** Params: mute+autoplay so video starts immediately and initial play overlay disappears; minimal UI. */
const YOUTUBE_EMBED_PARAMS = 'autoplay=1&mute=1&modestbranding=1&rel=0&iv_load_policy=3&controls=0&showinfo=0&disablekb=0&fs=1'

/** Returns YouTube embed URL if input is a YouTube watch/share URL, otherwise null. */
export function getYoutubeEmbedUrl(rawUrl?: string): string | null {
  const input = (rawUrl || '').trim()
  if (!input) return null
  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' && url.pathname === '/watch' && url.searchParams.get('v')) {
      const vid = url.searchParams.get('v')
      return `https://www.youtube-nocookie.com/embed/${vid}?${YOUTUBE_EMBED_PARAMS}`
    }
    if (host === 'youtu.be' && url.pathname.length > 1) {
      const id = url.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube-nocookie.com/embed/${id}?${YOUTUBE_EMBED_PARAMS}` : null
    }
  } catch {
    /* ignore */
  }
  return null
}

export function isYoutubeUrl(rawUrl?: string): boolean {
  return getYoutubeEmbedUrl(rawUrl) != null
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
    const wsUrls = proxyBase
      ? [`${proxyBase}/${hostname}:${port}/openUrl/${streamPath}${query}`, `${proxyBase}/${hostname}:${port}/${streamPath}${query}`]
      : []
    // Chỉ thử HLS trực tiếp (camera:8888) khi user chọn "HLS trực tiếp"; tránh timeout khi chưa cấu hình.
    const hlsMp4 = mode === 'hls-direct' ? [hlsIndexUrl, hlsDirectUrl, mp4IndexUrl, mp4DirectUrl] : []

    const ordered =
      mode === 'hls-direct'
        ? [...hlsMp4, ...wsUrls]
        : [...wsUrls, ...hlsMp4]
    return Array.from(new Set(ordered.filter(Boolean)))
  } catch {
    return [input]
  }
}
