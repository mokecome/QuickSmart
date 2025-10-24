/**
 * Expense Entity (Domain Layer)
 * Represents a single expense/income transaction
 * Implements domain logic and business rules
 */

import type { ExpenseCategory, SyncStatus } from '@/types'

export class Expense {
  readonly id: string
  readonly userId: string
  private _amount: number
  private _category: ExpenseCategory
  private _description: string | null
  private _date: Date
  private _aiConfidence: number | null
  private _fallbackUsed: boolean
  private _version: number
  private _syncStatus: SyncStatus
  private _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | null

  constructor(data: {
    id: string
    userId: string
    amount: number
    category: ExpenseCategory
    description?: string | null
    date: Date
    aiConfidence?: number | null
    fallbackUsed?: boolean
    version?: number
    syncStatus?: SyncStatus
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
  }) {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Validate AI confidence
    if (data.aiConfidence !== null && data.aiConfidence !== undefined) {
      if (data.aiConfidence < 0 || data.aiConfidence > 100) {
        throw new Error('AI confidence must be between 0 and 100')
      }
    }

    this.id = data.id
    this.userId = data.userId
    this._amount = data.amount
    this._category = data.category
    this._description = data.description || null
    this._date = data.date
    this._aiConfidence = data.aiConfidence || null
    this._fallbackUsed = data.fallbackUsed || false
    this._version = data.version || 1
    this._syncStatus = data.syncStatus || 'SYNCED'
    this._createdAt = data.createdAt || new Date()
    this._updatedAt = data.updatedAt || new Date()
    this._deletedAt = data.deletedAt || null
  }

  // Getters
  get amount(): number {
    return this._amount
  }

  get category(): ExpenseCategory {
    return this._category
  }

  get description(): string | null {
    return this._description
  }

  get date(): Date {
    return this._date
  }

  get aiConfidence(): number | null {
    return this._aiConfidence
  }

  get fallbackUsed(): boolean {
    return this._fallbackUsed
  }

  get version(): number {
    return this._version
  }

  get syncStatus(): SyncStatus {
    return this._syncStatus
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  get isDeleted(): boolean {
    return this._deletedAt !== null
  }

  get isIncome(): boolean {
    return this._category === 'INCOME'
  }

  // Business methods

  /**
   * Update expense details
   */
  update(updates: {
    amount?: number
    category?: ExpenseCategory
    description?: string | null
    date?: Date
  }): void {
    if (this.isDeleted) {
      throw new Error('Cannot update deleted expense')
    }

    if (updates.amount !== undefined) {
      if (updates.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      this._amount = updates.amount
    }

    if (updates.category !== undefined) {
      this._category = updates.category
    }

    if (updates.description !== undefined) {
      this._description = updates.description
    }

    if (updates.date !== undefined) {
      this._date = updates.date
    }

    this._version += 1
    this._updatedAt = new Date()
    this._syncStatus = 'PENDING'
  }

  /**
   * Soft delete the expense
   */
  delete(): void {
    if (this.isDeleted) {
      throw new Error('Expense is already deleted')
    }

    this._deletedAt = new Date()
    this._updatedAt = new Date()
    this._syncStatus = 'PENDING'
  }

  /**
   * Mark as synced
   */
  markAsSynced(): void {
    this._syncStatus = 'SYNCED'
  }

  /**
   * Mark as failed to sync
   */
  markAsFailed(): void {
    this._syncStatus = 'FAILED'
  }

  /**
   * Correct category (for AI learning)
   */
  correctCategory(newCategory: ExpenseCategory): {
    originalCategory: ExpenseCategory
    correctedCategory: ExpenseCategory
  } {
    const originalCategory = this._category
    this._category = newCategory
    this._version += 1
    this._updatedAt = new Date()
    this._syncStatus = 'PENDING'

    return {
      originalCategory,
      correctedCategory: newCategory,
    }
  }

  /**
   * Check if expense is from this month
   */
  isFromMonth(year: number, month: number): boolean {
    return (
      this._date.getFullYear() === year && this._date.getMonth() === month - 1
    )
  }

  /**
   * Check if expense is within date range
   */
  isWithinRange(startDate: Date, endDate: Date): boolean {
    return this._date >= startDate && this._date <= endDate
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      amount: this._amount,
      category: this._category,
      description: this._description,
      date: this._date.toISOString(),
      aiConfidence: this._aiConfidence,
      fallbackUsed: this._fallbackUsed,
      version: this._version,
      syncStatus: this._syncStatus,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt?.toISOString() || null,
    }
  }
}
