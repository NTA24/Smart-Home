/**
 * Dữ liệu nhật ký ra vào dùng chung cho Access Logs và Quản lý khách ra vào.
 */

export const FACE_IMAGES = [
  '/security-faces/stored-face-1.png',
  '/security-faces/stored-face-2.png',
  '/security-faces/stored-face-3.png',
  '/security-faces/stored-face-4.png',
  '/security-faces/stored-face-5.png',
  '/security-faces/stored-face-6.png',
  '/security-faces/stored-face-7.png',
]

export interface AccessLogEntry {
  key: string
  date: string
  name: string
  subText: string
  accessPoint: string
  credential: string
  credentialId: string
  status: 'success' | 'default' | 'processing'
  time: string
}

export const ACCESS_LOG_ENTRIES: AccessLogEntry[] = [
  { key: '1', date: '2026-02-25', name: 'Linh Tran', subText: 'Rapid visit', accessPoint: 'Lobby Gate', credential: 'Mobile Key', credentialId: 'RFID Card', status: 'success', time: '13:50' },
  { key: '2', date: '2026-02-25', name: 'Nguyễn Văn A', subText: 'Tenant', accessPoint: 'Elevator Panel', credential: 'Mobile Key', credentialId: 'MPRO-0080', status: 'success', time: '23:10' },
  { key: '3', date: '2026-02-25', name: 'Delivery (GHN)', subText: 'Visitor', accessPoint: 'Parking Barrier', credential: 'Badge', credentialId: 'RE6122034', status: 'default', time: '10:00' },
  { key: '4', date: '2026-02-25', name: 'Linh Tran', subText: 'Employee', accessPoint: 'Floor 15', credential: 'Mobile Key', credentialId: 'MBOIB Card', status: 'processing', time: '19:05' },
  { key: '5', date: '2026-02-24', name: 'Trần Văn B', subText: 'Tenant', accessPoint: 'Lobby Gate', credential: 'Mobile Key', credentialId: 'RFID Card', status: 'success', time: '08:30' },
  { key: '6', date: '2026-02-23', name: 'Linh Tran', subText: 'Employee', accessPoint: 'Elevator Panel', credential: 'Badge', credentialId: 'RE6122035', status: 'success', time: '14:20' },
]

export type AccessLogWithFace = AccessLogEntry & { face: string }

/** Danh sách log kèm ảnh (dùng cho Access Logs page). */
export function getAccessLogsWithFace(): AccessLogWithFace[] {
  return ACCESS_LOG_ENTRIES.map((r, i) => ({
    ...r,
    face: FACE_IMAGES[Number(r.key) % FACE_IMAGES.length] ?? FACE_IMAGES[i % FACE_IMAGES.length],
  }))
}

/** Người được đánh dấu VIP (dùng chung Access Logs & Visitor Management). */
export const VIP_NAMES = ['Nguyễn Văn A', 'Nguyen Van A']

export function isVipByName(name: string): boolean {
  return VIP_NAMES.some((vip) => name.includes(vip) || vip.includes(name))
}

/** Kiểu khách ra vào (dùng cho Quản lý khách) – map từ nhật ký. */
export interface VisitorFromLog {
  key: string
  name: string
  email: string
  visitTime: string
  hostUnit: string
  accessScope: string
  slot: string
  type: string
  qrCode: string
  status: 'CHECKEDIN' | 'PENDING' | 'CHECKOUT'
  face: string
  isVip: boolean
}

const statusMap: Record<AccessLogEntry['status'], VisitorFromLog['status']> = {
  success: 'CHECKEDIN',
  processing: 'PENDING',
  default: 'CHECKOUT',
}

/** Chuyển nhật ký ra vào thành danh sách khách (cho Quản lý khách ra vào). */
export function getVisitorsFromAccessLogs(entries = ACCESS_LOG_ENTRIES): VisitorFromLog[] {
  const withFace = getAccessLogsWithFace()
  return withFace.map((r) => ({
    key: r.key,
    name: r.name,
    email: '-',
    visitTime: `${r.date.replace(/-/g, '/')} ${r.time}`,
    hostUnit: r.credentialId || '-',
    accessScope: r.accessPoint,
    slot: `${r.date}, ${r.time}`,
    type: r.subText,
    qrCode: r.credentialId?.startsWith('QR') ? r.credentialId : `QR${r.key}`,
    status: statusMap[r.status],
    face: r.face,
    isVip: isVipByName(r.name),
  }))
}
