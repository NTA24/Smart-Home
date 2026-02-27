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

/** Resolve stream URL: nếu là path tương đối thì prefix bằng VITE_CAMERA_STREAM_BASE */
function resolveStream(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('/')) {
    const base = (e.VITE_CAMERA_STREAM_BASE ?? '').replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
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
    streamUrl: resolveStream(e.VITE_CAM_01_STREAM),
  },
  {
    id: 'CAM-02',
    name: 'Parking Gate A',
    location: 'Parking',
    floor: 'B1',
    status: 'recording',
    type: 'outdoor',
    resolution: '4K',
    streamUrl: resolveStream(e.VITE_CAM_02_STREAM),
  },
  {
    id: 'CAM-03',
    name: '1BKOP_CSV01',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_03_STREAM),
  },
  {
    id: 'CAM-04',
    name: '1BKOP_CSV02',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_04_STREAM),
  },
  {
    id: 'CAM-05',
    name: '1BKOP_CSV03',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_05_STREAM),
  },
  {
    id: 'CAM-06',
    name: '1ANOP_CSV04',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_06_STREAM),
  },
  {
    id: 'CAM-07',
    name: '1BKOP_CSV05',
    location: 'Highway Traffic',
    floor: '1F',
    status: 'online',
    type: 'outdoor',
    resolution: '1080p',
    streamUrl: resolveStream(e.VITE_CAM_07_STREAM),
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
