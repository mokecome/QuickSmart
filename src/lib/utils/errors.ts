/**
 * Error Classes and Error Handling Utilities
 * Standardized error handling across the application
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true)
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, true)
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true)
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`${service} service error: ${originalError?.message || 'Unknown error'}`, 502, true)
    Object.setPrototypeOf(this, ExternalServiceError.prototype)
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        type: error.constructor.name,
      },
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      error: {
        message: process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
        statusCode: 500,
        type: 'InternalError',
      },
      statusCode: 500,
    }
  }

  return {
    error: {
      message: 'Unknown error occurred',
      statusCode: 500,
      type: 'UnknownError',
    },
    statusCode: 500,
  }
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler<T>(
  handler: (req: Request, context: T) => Promise<Response>
) {
  return async (req: Request, context: T): Promise<Response> => {
    try {
      return await handler(req, context)
    } catch (error) {
      const { error: errorData, statusCode } = formatErrorResponse(error)
      return new Response(JSON.stringify(errorData), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => !(field in body))

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    )
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate amount
 */
export function validateAmount(amount: number): void {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new ValidationError('Amount must be a valid number')
  }

  if (amount <= 0) {
    throw new ValidationError('Amount must be greater than 0')
  }

  if (amount > 1000000000) {
    throw new ValidationError('Amount is too large')
  }
}

/**
 * Validate date
 */
export function validateDate(date: string): void {
  const parsedDate = new Date(date)

  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError('Invalid date format')
  }

  const now = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const oneYearLater = new Date()
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  if (parsedDate < oneYearAgo || parsedDate > oneYearLater) {
    throw new ValidationError('Date must be within one year from now')
  }
}
