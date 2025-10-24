import { describe, it, expect } from 'vitest'
import { Money } from './Money'

describe('Money Value Object', () => {
  describe('Constructor', () => {
    it('should create a money instance with valid amount', () => {
      const money = new Money(100, 'TWD')
      expect(money.amount).toBe(100)
      expect(money.currency).toBe('TWD')
    })

    it('should default to TWD currency', () => {
      const money = new Money(100)
      expect(money.currency).toBe('TWD')
    })

    it('should throw error for negative amount', () => {
      expect(() => new Money(-100, 'TWD')).toThrow('Money amount cannot be negative')
    })

    it('should throw error for non-finite amount', () => {
      expect(() => new Money(Infinity, 'TWD')).toThrow('Money amount must be a finite number')
      expect(() => new Money(NaN, 'TWD')).toThrow('Money amount must be a finite number')
    })

    it('should round to 2 decimal places', () => {
      const money = new Money(100.556, 'TWD')
      expect(money.amount).toBe(100.56)
    })
  })

  describe('Arithmetic Operations', () => {
    it('should add two money objects', () => {
      const money1 = new Money(100, 'TWD')
      const money2 = new Money(50, 'TWD')
      const result = money1.add(money2)

      expect(result.amount).toBe(150)
      expect(result.currency).toBe('TWD')
    })

    it('should subtract two money objects', () => {
      const money1 = new Money(100, 'TWD')
      const money2 = new Money(50, 'TWD')
      const result = money1.subtract(money2)

      expect(result.amount).toBe(50)
      expect(result.currency).toBe('TWD')
    })

    it('should throw error when subtraction results in negative', () => {
      const money1 = new Money(50, 'TWD')
      const money2 = new Money(100, 'TWD')

      expect(() => money1.subtract(money2)).toThrow('Resulting amount cannot be negative')
    })

    it('should multiply money by a factor', () => {
      const money = new Money(100, 'TWD')
      const result = money.multiply(2.5)

      expect(result.amount).toBe(250)
    })

    it('should throw error when multiplying by negative factor', () => {
      const money = new Money(100, 'TWD')

      expect(() => money.multiply(-2)).toThrow('Multiplication factor cannot be negative')
    })

    it('should divide money by a divisor', () => {
      const money = new Money(100, 'TWD')
      const result = money.divide(4)

      expect(result.amount).toBe(25)
    })

    it('should throw error when dividing by zero or negative', () => {
      const money = new Money(100, 'TWD')

      expect(() => money.divide(0)).toThrow('Divisor must be greater than zero')
      expect(() => money.divide(-2)).toThrow('Divisor must be greater than zero')
    })

    it('should throw error for operations with different currencies', () => {
      const twd = new Money(100, 'TWD')
      const usd = new Money(100, 'USD')

      expect(() => twd.add(usd)).toThrow('Currency mismatch: TWD and USD')
    })
  })

  describe('Comparison Operations', () => {
    it('should check if money is zero', () => {
      const zero = new Money(0, 'TWD')
      const nonZero = new Money(100, 'TWD')

      expect(zero.isZero()).toBe(true)
      expect(nonZero.isZero()).toBe(false)
    })

    it('should compare if greater than', () => {
      const money1 = new Money(100, 'TWD')
      const money2 = new Money(50, 'TWD')

      expect(money1.isGreaterThan(money2)).toBe(true)
      expect(money2.isGreaterThan(money1)).toBe(false)
    })

    it('should compare if less than', () => {
      const money1 = new Money(50, 'TWD')
      const money2 = new Money(100, 'TWD')

      expect(money1.isLessThan(money2)).toBe(true)
      expect(money2.isLessThan(money1)).toBe(false)
    })

    it('should check equality', () => {
      const money1 = new Money(100, 'TWD')
      const money2 = new Money(100, 'TWD')
      const money3 = new Money(100, 'USD')

      expect(money1.equals(money2)).toBe(true)
      expect(money1.equals(money3)).toBe(false)
    })
  })

  describe('Static Methods', () => {
    it('should create zero money', () => {
      const zero = Money.zero('TWD')

      expect(zero.amount).toBe(0)
      expect(zero.currency).toBe('TWD')
      expect(zero.isZero()).toBe(true)
    })

    it('should create from JSON', () => {
      const data = { amount: 100, currency: 'TWD' }
      const money = Money.fromJSON(data)

      expect(money.amount).toBe(100)
      expect(money.currency).toBe('TWD')
    })
  })

  describe('Serialization', () => {
    it('should convert to JSON', () => {
      const money = new Money(100, 'TWD')
      const json = money.toJSON()

      expect(json).toEqual({ amount: 100, currency: 'TWD' })
    })

    it('should convert to number', () => {
      const money = new Money(100.50, 'TWD')

      expect(money.toNumber()).toBe(100.50)
    })
  })

  describe('Formatting', () => {
    it('should format with currency symbol', () => {
      const money = new Money(1000, 'TWD')
      const formatted = money.format()

      expect(formatted).toContain('1,000')
    })

    it('should format amount without currency symbol', () => {
      const money = new Money(1000.50, 'TWD')
      const formatted = money.formatAmount()

      expect(formatted).toContain('1,000.50')
    })
  })

  describe('Allocation', () => {
    it('should allocate money into portions', () => {
      const money = new Money(100, 'TWD')
      const portions = money.allocate([1, 1, 1])

      expect(portions).toHaveLength(3)
      expect(portions[0].amount + portions[1].amount + portions[2].amount).toBeCloseTo(100, 2)
    })

    it('should allocate with different ratios', () => {
      const money = new Money(100, 'TWD')
      const portions = money.allocate([2, 3])

      expect(portions).toHaveLength(2)
      expect(portions[0].amount).toBeCloseTo(40, 2)
      expect(portions[1].amount).toBeCloseTo(60, 2)
    })

    it('should throw error when total ratio is zero', () => {
      const money = new Money(100, 'TWD')

      expect(() => money.allocate([0, 0])).toThrow('Total ratio cannot be zero')
    })
  })
})
