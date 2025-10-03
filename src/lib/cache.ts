// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>
  private defaultTTL: number

  constructor(defaultTTL: number = 15000) {
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}

// Global cache instance
export const apiCache = new MemoryCache(15000) // 15 seconds

// Simple rate limiter
interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.limits = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetAt) {
      // Reset or new entry
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetIn: this.windowMs,
      }
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetAt - now,
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetIn: entry.resetAt - now,
    }
  }

  reset(identifier: string): void {
    this.limits.delete(identifier)
  }
}

// Global rate limiter (60 req/min per IP)
export const rateLimiter = new RateLimiter(60, 60000)

