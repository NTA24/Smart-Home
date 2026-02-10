// ========================
// Common API Types
// ========================

/**
 * Tham số phân trang chung cho các API list
 */
export interface ListParams {
  limit?: number
  offset?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Response chung cho các API trả về danh sách
 * Ví dụ: { items: [...], total: 6, limit: 10, offset: 1 }
 */
export interface ListResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

/**
 * Response chung cho các API trả về một item
 */
export interface SingleResponse<T> {
  data: T
}

/**
 * Response khi xóa thành công
 */
export interface DeleteResponse {
  success: boolean
  message?: string
}
