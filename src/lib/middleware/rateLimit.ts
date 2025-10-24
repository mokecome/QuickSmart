/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting request rates
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export function createRateLimiter(config: RateLimitConfig) {
  return {
    check(identifier: string): {
      allowed: boolean
      remaining: number
      resetTime: number
    } {
      const now = Date.now()
      const key = identifier

      // Initialize or reset if window expired
      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 0,
          resetTime: now + config.windowMs,
        }
      }

      // Increment count
      store[key].count++

      const allowed = store[key].count <= config.maxRequests
      const remaining = Math.max(0, config.maxRequests - store[key].count)

      return {
        allowed,
        remaining,
        resetTime: store[key].resetTime,
      }
    },
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API endpoints: 100 requests per minute
  general: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),

  // AI parsing: 20 requests per minute (expensive)
  aiParsing: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
  }),

  // Authentication: 5 attempts per 15 minutes
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),

  // Expensive operations: 10 per minute
  expensive: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
}

/**
 * Check rate limit and throw error if exceeded
 */
export function checkRateLimit(
  identifier: string,
  limiter: ReturnType<typeof createRateLimiter>
): void {
  const result = limiter.check(identifier)

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime)
    throw new Error(
      `Rate limit exceeded. Try again at ${resetDate.toISOString()}`
    )
  }
}
