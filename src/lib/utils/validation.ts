/**
 * Validation Utilities
 * Reusable validation functions for common data types
 */

import type { ExpenseCategory } from '@/types'

/**
 * Validate expense category
 */
export function isValidExpenseCategory(category: string): category is ExpenseCategory {
  const validCategories: ExpenseCategory[] = [
    'FOOD',
    'TRANSPORT',
    'ENTERTAINMENT',
    'SHOPPING',
    'HOUSING',
    'MEDICAL',
    'EDUCATION',
    'SUBSCRIPTION',
    'OTHER',
    'INCOME',
  ]
  return validCategories.includes(category as ExpenseCategory)
}

/**
 * Validate billing cycle
 */
export function isValidBillingCycle(
  cycle: string
): cycle is 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' {
  return ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'].includes(cycle)
}

/**
 * Validate subscription status
 */
export function isValidSubscriptionStatus(
  status: string
): status is 'ACTIVE' | 'PAUSED' | 'CANCELLED' {
  return ['ACTIVE', 'PAUSED', 'CANCELLED'].includes(status)
}

/**
 * Validate sync status
 */
export function isValidSyncStatus(
  status: string
): status is 'SYNCED' | 'PENDING' | 'FAILED' {
  return ['SYNCED', 'PENDING', 'FAILED'].includes(status)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number): {
  page: number
  limit: number
} {
  const validPage = Math.max(1, Math.floor(page))
  const validLimit = Math.min(100, Math.max(1, Math.floor(limit)))

  return { page: validPage, limit: validLimit }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  return input.trim().slice(0, maxLength)
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: string, endDate: string): {
  startDate: Date
  endDate: Date
} {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date')
  }

  if (isNaN(end.getTime())) {
    throw new Error('Invalid end date')
  }

  if (start > end) {
    throw new Error('Start date must be before end date')
  }

  const oneYearInMs = 365 * 24 * 60 * 60 * 1000
  if (end.getTime() - start.getTime() > oneYearInMs) {
    throw new Error('Date range cannot exceed one year')
  }

  return { startDate: start, endDate: end }
}

/**
 * Validate reminder days array
 */
export function validateReminderDays(days: number[]): number[] {
  const validDays = days
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 30)
    .sort((a, b) => b - a)

  return [...new Set(validDays)] // Remove duplicates
}

/**
 * Validate amount with currency
 */
export function validateAmountWithCurrency(amount: number, currency?: string): {
  amount: number
  currency: string
} {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new Error('Amount must be a valid number')
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  if (amount > 1000000000) {
    throw new Error('Amount is too large')
  }

  // Round to 2 decimal places
  const roundedAmount = Math.round(amount * 100) / 100

  const validCurrency = currency?.toUpperCase() || 'TWD'
  if (validCurrency !== 'TWD') {
    throw new Error('Only TWD currency is supported')
  }

  return { amount: roundedAmount, currency: validCurrency }
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    throw new Error('Search query must be a string')
  }

  const sanitized = query.trim()

  if (sanitized.length === 0) {
    throw new Error('Search query cannot be empty')
  }

  if (sanitized.length > 100) {
    throw new Error('Search query is too long')
  }

  return sanitized
}

/**
 * Validate confidence score
 */
export function validateConfidence(confidence: number): number {
  if (typeof confidence !== 'number' || !Number.isFinite(confidence)) {
    throw new Error('Confidence must be a valid number')
  }

  if (confidence < 0 || confidence > 100) {
    throw new Error('Confidence must be between 0 and 100')
  }

  return Math.round(confidence)
}
