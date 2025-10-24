/**
 * Money Value Object (Domain Layer)
 * Represents a monetary amount with currency
 * Immutable value object for financial calculations
 */

export class Money {
  private readonly _amount: number
  private readonly _currency: string

  constructor(amount: number, currency: string = 'TWD') {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative')
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number')
    }

    // Round to 2 decimal places
    this._amount = Math.round(amount * 100) / 100
    this._currency = currency.toUpperCase()
  }

  get amount(): number {
    return this._amount
  }

  get currency(): string {
    return this._currency
  }

  /**
   * Add two money objects
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other)
    return new Money(this._amount + other._amount, this._currency)
  }

  /**
   * Subtract two money objects
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other)
    const result = this._amount - other._amount
    if (result < 0) {
      throw new Error('Resulting amount cannot be negative')
    }
    return new Money(result, this._currency)
  }

  /**
   * Multiply money by a factor
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative')
    }
    return new Money(this._amount * factor, this._currency)
  }

  /**
   * Divide money by a divisor
   */
  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new Error('Divisor must be greater than zero')
    }
    return new Money(this._amount / divisor, this._currency)
  }

  /**
   * Check if money is zero
   */
  isZero(): boolean {
    return this._amount === 0
  }

  /**
   * Check if greater than another money
   */
  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount > other._amount
  }

  /**
   * Check if less than another money
   */
  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other)
    return this._amount < other._amount
  }

  /**
   * Check if equal to another money
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency
  }

  /**
   * Allocate money into portions
   */
  allocate(ratios: number[]): Money[] {
    const total = ratios.reduce((sum, ratio) => sum + ratio, 0)
    if (total === 0) {
      throw new Error('Total ratio cannot be zero')
    }

    const results: Money[] = []
    let remainder = this._amount

    for (let i = 0; i < ratios.length - 1; i++) {
      const allocation = Math.floor((this._amount * ratios[i]) / total * 100) / 100
      results.push(new Money(allocation, this._currency))
      remainder -= allocation
    }

    // Last portion gets the remainder
    results.push(new Money(remainder, this._currency))

    return results
  }

  /**
   * Format money for display
   */
  format(locale: string = 'zh-TW'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount)
  }

  /**
   * Format amount only (without currency symbol)
   */
  formatAmount(locale: string = 'zh-TW'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this._amount)
  }

  /**
   * Ensure same currency for operations
   */
  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        `Currency mismatch: ${this._currency} and ${other._currency}`
      )
    }
  }

  /**
   * Convert to plain number
   */
  toNumber(): number {
    return this._amount
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      amount: this._amount,
      currency: this._currency,
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: { amount: number; currency: string }): Money {
    return new Money(data.amount, data.currency)
  }

  /**
   * Create zero money
   */
  static zero(currency: string = 'TWD'): Money {
    return new Money(0, currency)
  }
}
