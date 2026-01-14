/**
 * Format price in Vietnamese style (tỷ, triệu)
 * @param price - Price in VNĐ
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000
    // Show decimal only if needed
    if (billions % 1 === 0) {
      return `${billions} tỷ`
    }
    return `${billions.toFixed(1)} tỷ`
  }

  if (price >= 1_000_000) {
    const millions = price / 1_000_000
    if (millions % 1 === 0) {
      return `${millions} triệu`
    }
    return `${millions.toFixed(0)} triệu`
  }

  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

/**
 * Format price for input (without unit)
 * @param price - Price in VNĐ
 * @returns Formatted number string
 */
export function formatPriceInput(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price)
}

/**
 * Parse price from input string
 * @param value - Input string with possible formatting
 * @returns Price in VNĐ
 */
export function parsePriceInput(value: string): number {
  // Remove all non-numeric characters
  const numericValue = value.replace(/[^\d]/g, '')
  return parseInt(numericValue, 10) || 0
}

/**
 * Format area in m²
 * @param area - Area in square meters
 * @returns Formatted area string
 */
export function formatArea(area: number): string {
  if (area % 1 === 0) {
    return `${area} m²`
  }
  return `${area.toFixed(1)} m²`
}

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Vietnamese mobile format: 0xxx xxx xxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  // Vietnamese landline format: 0xx xxxx xxxx
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }

  return phone
}

/**
 * Format date in Vietnamese style
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format datetime in Vietnamese style
 * @param date - Date string or Date object
 * @returns Formatted datetime string
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format relative time (e.g., "2 ngày trước")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
  return `${Math.floor(diffDays / 365)} năm trước`
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
