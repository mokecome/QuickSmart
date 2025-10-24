/**
 * Category constants
 */

import type { ExpenseCategory } from '@/types'

export const CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  FOOD: {
    label: '飲食',
    icon: '🍜',
    color: '#FF6B6B',
  },
  TRANSPORT: {
    label: '交通',
    icon: '🚗',
    color: '#4ECDC4',
  },
  ENTERTAINMENT: {
    label: '娛樂',
    icon: '🎮',
    color: '#FFD93D',
  },
  SHOPPING: {
    label: '購物',
    icon: '🛍️',
    color: '#95E1D3',
  },
  HOUSING: {
    label: '居住',
    icon: '🏠',
    color: '#F38181',
  },
  MEDICAL: {
    label: '醫療',
    icon: '💊',
    color: '#AA96DA',
  },
  EDUCATION: {
    label: '教育',
    icon: '📚',
    color: '#FCBAD3',
  },
  SUBSCRIPTION: {
    label: '訂閱',
    icon: '📱',
    color: '#A8DADC',
  },
  OTHER: {
    label: '其他',
    icon: '📝',
    color: '#B4B4B4',
  },
  INCOME: {
    label: '收入',
    icon: '💰',
    color: '#6BCF7F',
  },
}

export const CATEGORY_LIST = Object.entries(CATEGORIES).map(([key, value]) => ({
  value: key as ExpenseCategory,
  ...value,
}))

export function getCategoryLabel(category: ExpenseCategory): string {
  return CATEGORIES[category]?.label || '未知'
}

export function getCategoryIcon(category: ExpenseCategory): string {
  return CATEGORIES[category]?.icon || '❓'
}

export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORIES[category]?.color || '#B4B4B4'
}
