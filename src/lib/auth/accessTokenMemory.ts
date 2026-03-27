/** In-memory access token — không đọc được từ kho script khác như localStorage (vẫn lộ nếu XSS chạy trong app). */
let accessToken: string | null = null

export function getMemoryAccessToken(): string | null {
  return accessToken
}

export function setMemoryAccessToken(token: string | null): void {
  accessToken = token
}
