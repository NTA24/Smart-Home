/**
 * Demo camera list.
 *
 * Stream URLs được đọc từ biến môi trường (.env / .env.local) thay vì hardcode.
 * Khi có backend thật, thay thế mảng này bằng API call.
 *
 * Để override URL một camera cụ thể khi dev:
 *   VITE_CAM_01_STREAM=rtmp://your-server/live/cam01  trong .env.local
 */

const e = import.meta.env

/** Public demo HLS URLs when env vars are not set. CAM_03–07 cùng nguồn highway traffic. CAM_02: WebSocket (wss://) — nhập URL trong Cấu hình camera. */
const FALLBACK_STREAMS: Record<string, string> = {
  CAM_01: 'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8',
  CAM_02: '', // CAM-2 dùng WebSocket (wss://) — cấu hình trong Cấu hình camera
  CAM_03: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
  CAM_04: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
  CAM_05: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
  CAM_06: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
  CAM_07: 'https://streaming4.highwaytraffic.go.th/DMT/1BKOP_CSV01.stream/playlist.m3u8',
}

/** Resolve stream URL: env trước, path tương đối thì prefix VITE_CAMERA_STREAM_BASE, không có thì dùng fallback demo */
function resolveStream(url: string | undefined, fallbackKey?: string): string | undefined {
  if (url && url.trim()) {
    const u = url.trim()
    if (u.startsWith('/')) {
      const base = (e.VITE_CAMERA_STREAM_BASE ?? '').replace(/\/$/, '')
      return base ? `${base}${u}` : u
    }
    return u
  }
  return fallbackKey ? FALLBACK_STREAMS[fallbackKey] : undefined
}

export interface CameraConfig {
  id: string
  name: string
  location: string
  floor: string
  status: 'online' | 'offline' | 'recording'
  type: 'indoor' | 'outdoor' | 'ptz'
  resolution: string
  streamUrl?: string
}

export const DEMO_CAMERAS: CameraConfig[] = [
  {
    id: 'CAM-01',
    name: 'Lobby Main Entrance',
    location: 'Lobby A',
    floor: '1F',
    status: 'recording',
    type: 'indoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_01_STREAM, 'CAM_01'),
  },
  {
    id: 'CAM-02',
    name: 'Parking Gate A',
    location: 'Parking',
    floor: 'B1',
    status: 'recording',
    type: 'outdoor',
    resolution: '4K',
    streamUrl: resolveStream(e.VITE_CAM_02_STREAM, 'CAM_02') || undefined,
  },
  {
    id: 'CAM-03',
    name: '1BKOP_CSV01',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_03_STREAM, 'CAM_03'),
  },
  {
    id: 'CAM-04',
    name: '1BKOP_CSV02',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_04_STREAM, 'CAM_04'),
  },
  {
    id: 'CAM-05',
    name: '1BKOP_CSV03',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_05_STREAM, 'CAM_05'),
  },
  {
    id: 'CAM-06',
    name: '1ANOP_CSV04',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_06_STREAM, 'CAM_06'),
  },
  {
    id: 'CAM-07',
    name: '1BKOP_CSV05',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_07_STREAM, 'CAM_07'),
  },
  {
    id: 'CAM-08',
    name: 'Elevator Hall 1F',
    location: 'Elevator',
    floor: '1F',
    status: 'online',
    type: 'indoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_08_STREAM),
  },
  {
    id: 'CAM-09',
    name: 'YouTube Live',
    location: 'YouTube',
    floor: '1F',
    status: 'online',
    type: 'indoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_09_STREAM),
  },
  {
    id: 'CAM-10',
    name: 'CCTV P2C070',
    location: 'Live',
    floor: '1F',
    status: 'offline',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_10_STREAM),
  },
]
