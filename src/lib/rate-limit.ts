/**
 * 速率限制中间件
 * 
 * 基于LRU缓存实现的速率限制器
 * 支持不同级别的限制策略
 */

import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  uniqueTokenPerInterval?: number
  interval?: number
}

interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>
  reset: (token: string) => void
  getRemaining: (token: string, limit: number) => number
}

export function rateLimit(options?: RateLimitOptions): RateLimiter {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 默认60秒
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0]
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage > limit

        if (isRateLimited) {
          reject(
            new Error(
              `Rate limit exceeded. Limit: ${limit}, Current: ${currentUsage}`
            )
          )
        } else {
          resolve()
        }
      }),

    reset: (token: string) => {
      tokenCache.delete(token)
    },

    getRemaining: (token: string, limit: number) => {
      const tokenCount = tokenCache.get(token) || [0]
      return Math.max(0, limit - tokenCount[0])
    },
  }
}

// 预定义限制器

/**
 * 标准限制器
 * 每分钟最多100次请求
 */
export const limiter = rateLimit({
  interval: 60 * 1000, // 60秒
  uniqueTokenPerInterval: 500,
})

/**
 * 严格限制器
 * 每分钟最多30次请求
 */
export const strictLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 200,
})

/**
 * AI限制器
 * 每分钟最多10次请求（用于OpenAI等高成本API）
 */
export const aiLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
})

/**
 * 获取客户端IP地址
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')
  
  return (
    forwardedFor?.split(',')[0].trim() ||
    realIp ||
    cfConnectingIp ||
    'anonymous'
  )
}

/**
 * 速率限制响应
 */
export function rateLimitResponse(
  remaining: number,
  limit: number,
  resetTime: number
) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
  }
}

