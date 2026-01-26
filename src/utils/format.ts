import dayjs from 'dayjs'

export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN')
}

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num)
}

export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

export const formatPercent = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}
