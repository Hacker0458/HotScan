/**
 * 重试处理器 - 带指数退避
 * 
 * 特性：
 * 1. 指数退避算法
 * 2. 可配置的最大重试次数
 * 3. 抖动（Jitter）避免惊群效应
 * 4. 可重试错误判断
 */

import type { RetryConfig } from './types'
import { DataSourceError, RateLimitError, TimeoutError } from './types'

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'TIMEOUT',
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE',
  ],
}

export class RetryHandler {
  private config: RetryConfig

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * 执行带重试的异步操作
   * 
   * @param fn - 要执行的异步函数
   * @param context - 上下文信息（用于日志）
   * @returns 操作结果
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: { operation: string; source: string }
  ): Promise<T> {
    let lastError: Error | undefined
    let attempt = 0

    while (attempt < this.config.maxAttempts) {
      attempt++

      try {
        console.log(
          `[RetryHandler] ${context.operation} - Attempt ${attempt}/${this.config.maxAttempts}`
        )

        const startTime = Date.now()
        const result = await fn()
        const duration = Date.now() - startTime

        console.log(
          `[RetryHandler] ${context.operation} succeeded (${duration}ms)`
        )

        return result
      } catch (error) {
        lastError = error as Error
        
        console.error(
          `[RetryHandler] ${context.operation} failed (attempt ${attempt}):`,
          error instanceof Error ? error.message : error
        )

        // 判断是否应该重试
        if (attempt >= this.config.maxAttempts) {
          console.error(
            `[RetryHandler] ${context.operation} - Max attempts reached, giving up`
          )
          break
        }

        if (!this.isRetryable(error)) {
          console.error(
            `[RetryHandler] ${context.operation} - Error not retryable, giving up`
          )
          break
        }

        // 特殊处理速率限制错误
        if (error instanceof RateLimitError && error.details?.retryAfter) {
          const delayMs = error.details.retryAfter * 1000
          console.log(
            `[RetryHandler] ${context.operation} - Rate limited, waiting ${delayMs}ms`
          )
          await this.delay(delayMs)
          continue
        }

        // 计算退避延迟
        const delayMs = this.calculateDelay(attempt)
        console.log(
          `[RetryHandler] ${context.operation} - Retrying after ${delayMs}ms`
        )
        await this.delay(delayMs)
      }
    }

    // 所有重试都失败了
    throw new DataSourceError(
      `Operation failed after ${attempt} attempts: ${lastError?.message}`,
      'MAX_RETRIES_EXCEEDED',
      context.source,
      { attempts: attempt, lastError: lastError?.message }
    )
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof DataSourceError) {
      return this.config.retryableErrors?.includes(error.code) ?? false
    }

    // 网络错误通常可重试
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')
      )
    }

    return false
  }

  /**
   * 计算退避延迟（带抖动）
   * 
   * 使用指数退避算法: delay = min(initialDelay * (backoffMultiplier ^ attempt), maxDelay)
   * 添加随机抖动避免惊群效应: jitter = delay * (0.5 + random * 0.5)
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay =
      this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1)

    const delayMs = Math.min(exponentialDelay, this.config.maxDelayMs)

    // 添加抖动（50% - 100% 之间）
    const jitter = delayMs * (0.5 + Math.random() * 0.5)

    return Math.floor(jitter)
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * 便捷函数：执行带重试的操作
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: { operation: string; source: string },
  config?: Partial<RetryConfig>
): Promise<T> {
  const handler = new RetryHandler(config)
  return handler.execute(fn, context)
}
