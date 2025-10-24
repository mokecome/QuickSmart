/**
 * DateRange Value Object (Domain Layer)
 * Represents a date range for queries and analysis
 * Immutable value object
 */

export class DateRange {
  private readonly _startDate: Date
  private readonly _endDate: Date

  constructor(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date')
    }

    // Normalize dates to start and end of day
    this._startDate = new Date(startDate)
    this._startDate.setHours(0, 0, 0, 0)

    this._endDate = new Date(endDate)
    this._endDate.setHours(23, 59, 59, 999)
  }

  get startDate(): Date {
    return new Date(this._startDate)
  }

  get endDate(): Date {
    return new Date(this._endDate)
  }

  /**
   * Get number of days in range
   */
  getDays(): number {
    const diffTime = this._endDate.getTime() - this._startDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Get number of months in range (approximate)
   */
  getMonths(): number {
    const years =
      this._endDate.getFullYear() - this._startDate.getFullYear()
    const months =
      this._endDate.getMonth() - this._startDate.getMonth()
    return years * 12 + months + 1
  }

  /**
   * Check if date is within range
   */
  contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate
  }

  /**
   * Check if overlaps with another range
   */
  overlaps(other: DateRange): boolean {
    return (
      this._startDate <= other._endDate && this._endDate >= other._startDate
    )
  }

  /**
   * Check if equals another range
   */
  equals(other: DateRange): boolean {
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime()
    )
  }

  /**
   * Extend range by days
   */
  extend(days: number): DateRange {
    const newEndDate = new Date(this._endDate)
    newEndDate.setDate(newEndDate.getDate() + days)
    return new DateRange(this._startDate, newEndDate)
  }

  /**
   * Split range into monthly ranges
   */
  splitByMonth(): DateRange[] {
    const ranges: DateRange[] = []
    let current = new Date(this._startDate)

    while (current <= this._endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

      const rangeStart = monthStart < this._startDate ? this._startDate : monthStart
      const rangeEnd = monthEnd > this._endDate ? this._endDate : monthEnd

      ranges.push(new DateRange(rangeStart, rangeEnd))

      current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    }

    return ranges
  }

  /**
   * Convert to ISO string range
   */
  toISOString(): { start: string; end: string } {
    return {
      start: this._startDate.toISOString(),
      end: this._endDate.toISOString(),
    }
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: { startDate: string; endDate: string }): DateRange {
    return new DateRange(new Date(data.startDate), new Date(data.endDate))
  }

  /**
   * Create for current month
   */
  static currentMonth(): DateRange {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return new DateRange(start, end)
  }

  /**
   * Create for specific month
   */
  static forMonth(year: number, month: number): DateRange {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    return new DateRange(start, end)
  }

  /**
   * Create for last N days
   */
  static lastNDays(days: number): DateRange {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    return new DateRange(start, end)
  }

  /**
   * Create for last N months
   */
  static lastNMonths(months: number): DateRange {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - months)
    return new DateRange(start, end)
  }

  /**
   * Create for current year
   */
  static currentYear(): DateRange {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31)
    return new DateRange(start, end)
  }
}
