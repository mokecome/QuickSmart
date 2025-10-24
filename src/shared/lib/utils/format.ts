/**
 * Formatting utilities
 */

/**
 * Format currency amount
 */
export function formatCurrency(amount: number | undefined | null, currency: string = 'TWD'): string {
  // Handle null/undefined values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0'
  }

  if (currency === 'TWD') {
    return `$${amount.toLocaleString('zh-TW')}`
  }

  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const formats = {
    short: { month: 'numeric', day: 'numeric' } as const,
    medium: { year: 'numeric', month: 'numeric', day: 'numeric' } as const,
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const,
  }

  return d.toLocaleDateString('zh-TW', formats[format])
}

/**
 * Format relative time (e.g., "3 天前", "剛剛")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return '剛剛'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分鐘前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小時前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`

  return formatDate(d, 'medium')
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with abbreviation (e.g., 1.5K, 2.3M)
 */
export function formatCompactNumber(num: number | undefined | null): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}
