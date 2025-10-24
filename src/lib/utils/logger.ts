/**
 * Logger Utility
 * Centralized logging for the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private log(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry

    const logMessage = `[${timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logMessage, context, error)
        }
        break
      case 'info':
        console.info(logMessage, context)
        break
      case 'warn':
        console.warn(logMessage, context)
        break
      case 'error':
        console.error(logMessage, context, error)
        break
    }

    // In production, you would send logs to a logging service
    // e.g., Sentry, LogRocket, or CloudWatch
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'debug',
      message,
      timestamp: new Date(),
      context,
    })
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'info',
      message,
      timestamp: new Date(),
      context,
    })
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'warn',
      message,
      timestamp: new Date(),
      context,
    })
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({
      level: 'error',
      message,
      timestamp: new Date(),
      context,
      error,
    })
  }

  // Specific logging methods for common scenarios

  apiRequest(method: string, path: string, userId?: string): void {
    this.info('API Request', {
      method,
      path,
      userId,
    })
  }

  apiResponse(method: string, path: string, status: number, duration: number): void {
    this.info('API Response', {
      method,
      path,
      status,
      duration: `${duration}ms`,
    })
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error(
      'API Error',
      error,
      {
        method,
        path,
        userId,
      }
    )
  }

  databaseQuery(operation: string, table: string, duration?: number): void {
    this.debug('Database Query', {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  aiParsing(input: string, confidence: number, fallbackUsed: boolean): void {
    this.info('AI Parsing', {
      inputLength: input.length,
      confidence,
      fallbackUsed,
    })
  }

  subscriptionBilling(subscriptionId: string, userId: string, amount: number): void {
    this.info('Subscription Billing Processed', {
      subscriptionId,
      userId,
      amount,
    })
  }

  anomalyDetected(userId: string, expenseId: string, category: string, zScore: number): void {
    this.warn('Anomaly Detected', {
      userId,
      expenseId,
      category,
      zScore,
    })
  }
}

export const logger = new Logger()
