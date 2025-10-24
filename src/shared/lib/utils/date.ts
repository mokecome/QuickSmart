/**
 * Date utilities
 */

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Get month range string (YYYY-MM format)
 */
export function getMonthString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Parse month string to date
 */
export function parseMonthString(monthStr: string): Date {
  const [year, month] = monthStr.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/**
 * Get days until date
 */
export function getDaysUntil(targetDate: Date | string): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffInMs = target.getTime() - now.getTime()
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * Add months to date
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Get month name in Chinese
 */
export function getMonthName(month: number): string {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]
  return months[month - 1] || '未知'
}
