/**
 * Subscription Entity (Domain Layer)
 * Represents a recurring subscription
 * Implements domain logic and business rules
 */

export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'

export class Subscription {
  readonly id: string
  readonly userId: string
  private _name: string
  private _amount: number
  private _billingCycle: BillingCycle
  private _nextBillingDate: Date
  private _reminderDays: number[]
  private _status: SubscriptionStatus
  private _autoRecord: boolean
  private _notes: string | null
  private _createdAt: Date
  private _updatedAt: Date

  constructor(data: {
    id: string
    userId: string
    name: string
    amount: number
    billingCycle: BillingCycle
    nextBillingDate: Date
    reminderDays?: number[]
    status?: SubscriptionStatus
    autoRecord?: boolean
    notes?: string | null
    createdAt?: Date
    updatedAt?: Date
  }) {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Subscription amount must be greater than 0')
    }

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Subscription name is required')
    }

    // Validate next billing date
    if (data.nextBillingDate < new Date()) {
      throw new Error('Next billing date must be in the future')
    }

    this.id = data.id
    this.userId = data.userId
    this._name = data.name.trim()
    this._amount = data.amount
    this._billingCycle = data.billingCycle
    this._nextBillingDate = data.nextBillingDate
    this._reminderDays = data.reminderDays || [3, 1, 0]
    this._status = data.status || 'ACTIVE'
    this._autoRecord = data.autoRecord !== false
    this._notes = data.notes || null
    this._createdAt = data.createdAt || new Date()
    this._updatedAt = data.updatedAt || new Date()
  }

  // Getters
  get name(): string {
    return this._name
  }

  get amount(): number {
    return this._amount
  }

  get billingCycle(): BillingCycle {
    return this._billingCycle
  }

  get nextBillingDate(): Date {
    return this._nextBillingDate
  }

  get reminderDays(): number[] {
    return [...this._reminderDays]
  }

  get status(): SubscriptionStatus {
    return this._status
  }

  get autoRecord(): boolean {
    return this._autoRecord
  }

  get notes(): string | null {
    return this._notes
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get isActive(): boolean {
    return this._status === 'ACTIVE'
  }

  get isPaused(): boolean {
    return this._status === 'PAUSED'
  }

  get isCancelled(): boolean {
    return this._status === 'CANCELLED'
  }

  // Business methods

  /**
   * Update subscription details
   */
  update(updates: {
    name?: string
    amount?: number
    billingCycle?: BillingCycle
    nextBillingDate?: Date
    reminderDays?: number[]
    autoRecord?: boolean
    notes?: string | null
  }): void {
    if (this.isCancelled) {
      throw new Error('Cannot update cancelled subscription')
    }

    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new Error('Subscription name is required')
      }
      this._name = updates.name.trim()
    }

    if (updates.amount !== undefined) {
      if (updates.amount <= 0) {
        throw new Error('Subscription amount must be greater than 0')
      }
      this._amount = updates.amount
    }

    if (updates.billingCycle !== undefined) {
      this._billingCycle = updates.billingCycle
    }

    if (updates.nextBillingDate !== undefined) {
      this._nextBillingDate = updates.nextBillingDate
    }

    if (updates.reminderDays !== undefined) {
      this._reminderDays = updates.reminderDays
    }

    if (updates.autoRecord !== undefined) {
      this._autoRecord = updates.autoRecord
    }

    if (updates.notes !== undefined) {
      this._notes = updates.notes
    }

    this._updatedAt = new Date()
  }

  /**
   * Pause subscription
   */
  pause(): void {
    if (this.isCancelled) {
      throw new Error('Cannot pause cancelled subscription')
    }

    if (this.isPaused) {
      throw new Error('Subscription is already paused')
    }

    this._status = 'PAUSED'
    this._updatedAt = new Date()
  }

  /**
   * Resume subscription
   */
  resume(): void {
    if (this.isCancelled) {
      throw new Error('Cannot resume cancelled subscription')
    }

    if (this.isActive) {
      throw new Error('Subscription is already active')
    }

    this._status = 'ACTIVE'
    this._updatedAt = new Date()
  }

  /**
   * Cancel subscription
   */
  cancel(): void {
    if (this.isCancelled) {
      throw new Error('Subscription is already cancelled')
    }

    this._status = 'CANCELLED'
    this._updatedAt = new Date()
  }

  /**
   * Process billing and calculate next billing date
   */
  processBilling(): Date {
    if (!this.isActive) {
      throw new Error('Cannot process billing for non-active subscription')
    }

    const nextDate = this.calculateNextBillingDate()
    this._nextBillingDate = nextDate
    this._updatedAt = new Date()

    return nextDate
  }

  /**
   * Calculate next billing date based on billing cycle
   */
  private calculateNextBillingDate(): Date {
    const nextDate = new Date(this._nextBillingDate)

    switch (this._billingCycle) {
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }

    return nextDate
  }

  /**
   * Get monthly cost equivalent
   */
  getMonthlyEquivalent(): number {
    switch (this._billingCycle) {
      case 'WEEKLY':
        return (this._amount * 52) / 12
      case 'MONTHLY':
        return this._amount
      case 'QUARTERLY':
        return this._amount / 3
      case 'YEARLY':
        return this._amount / 12
    }
  }

  /**
   * Check if billing is due within days
   */
  isDueWithin(days: number): boolean {
    const today = new Date()
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + days)

    return this._nextBillingDate <= dueDate && this._nextBillingDate >= today
  }

  /**
   * Get days until next billing
   */
  getDaysUntilBilling(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const billingDate = new Date(this._nextBillingDate)
    billingDate.setHours(0, 0, 0, 0)

    const diffTime = billingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  /**
   * Check if reminder is needed for specific days before
   */
  needsReminder(daysBeforeBilling: number): boolean {
    return (
      this.isActive &&
      this._reminderDays.includes(daysBeforeBilling) &&
      this.getDaysUntilBilling() === daysBeforeBilling
    )
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this._name,
      amount: this._amount,
      billingCycle: this._billingCycle,
      nextBillingDate: this._nextBillingDate.toISOString(),
      reminderDays: this._reminderDays,
      status: this._status,
      autoRecord: this._autoRecord,
      notes: this._notes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }
}
