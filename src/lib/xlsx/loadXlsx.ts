/**
 * Khi cần đọc/ghi Excel, gọi `import('xlsx')` qua `loadXlsx()` để tránh đưa vào main bundle.
 * (Hiện repo chưa dùng; giữ dependency sẵn cho tính năng export.)
 */
export function loadXlsx() {
  return import('xlsx')
}
