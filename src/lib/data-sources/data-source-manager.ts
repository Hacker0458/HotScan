/**
 * 数据源管理器
 * 
 * 特性：
 * 1. 多数据源支持和优先级
 * 2. 自动故障转移
 * 3. 缓存管理
 * 4. 统一的错误处理和日志
 */

import type { IDataSource, DataSourceConfig } from './types'
import { DataSourceError } from './types'
import { withRetry } from './retry-handler'

export class DataSourceManager {
  private sources: Map<string, { source: IDataSource; config: DataSourceConfig }> = new Map()
  private primarySource: string | null = null

  /**
   * 注册数据源
   */
  register(source: IDataSource, config: Partial<DataSourceConfig> = {}): void {
    const fullConfig: DataSourceConfig = {
      name: source.name,
      enabled: true,
      priority: 0,
      timeout: 30000,
      ...config,
    }

    this.sources.set(source.name, { source, config: fullConfig })

    // 更新主数据源（优先级最高的启用源）
    this.updatePrimarySource()

    console.log(`[DataSourceManager] Registered data source: ${source.name}`)
  }

  /**
   * 获取数据源
   */
  getSource(name?: string): IDataSource {
    if (name) {
      const entry = this.sources.get(name)
      if (!entry) {
        throw new DataSourceError(
          `Data source not found: ${name}`,
          'SOURCE_NOT_FOUND',
          'DataSourceManager'
        )
      }
      if (!entry.config.enabled) {
        throw new DataSourceError(
          `Data source is disabled: ${name}`,
          'SOURCE_DISABLED',
          'DataSourceManager'
        )
      }
      return entry.source
    }

    // 返回主数据源
    if (!this.primarySource) {
      throw new DataSourceError(
        'No data source available',
        'NO_SOURCE_AVAILABLE',
        'DataSourceManager'
      )
    }

    const entry = this.sources.get(this.primarySource)
    return entry!.source
  }

  /**
   * 执行操作（带故障转移）
   */
  async executeWithFallback<T>(
    operation: (source: IDataSource) => Promise<T>,
    operationName: string
  ): Promise<T> {
    // 按优先级排序的可用数据源
    const availableSources = Array.from(this.sources.values())
      .filter((entry) => entry.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority)

    if (availableSources.length === 0) {
      throw new DataSourceError(
        'No data sources available',
        'NO_SOURCE_AVAILABLE',
        'DataSourceManager'
      )
    }

    let lastError: Error | undefined

    for (const { source, config } of availableSources) {
      try {
        console.log(
          `[DataSourceManager] Executing ${operationName} with ${source.name}`
        )

        // 检查数据源是否可用
        const isAvailable = await source.isAvailable()
        if (!isAvailable) {
          console.warn(
            `[DataSourceManager] ${source.name} is not available, trying next source`
          )
          continue
        }

        // 执行操作（带重试）
        const result = await withRetry(
          () => operation(source),
          {
            operation: operationName,
            source: source.name,
          },
          config.retryConfig
        )

        return result
      } catch (error) {
        lastError = error as Error
        console.error(
          `[DataSourceManager] ${operationName} failed with ${source.name}:`,
          error instanceof Error ? error.message : error
        )

        // 继续尝试下一个数据源
        continue
      }
    }

    // 所有数据源都失败了
    throw new DataSourceError(
      `All data sources failed for ${operationName}: ${lastError?.message}`,
      'ALL_SOURCES_FAILED',
      'DataSourceManager',
      { lastError: lastError?.message }
    )
  }

  /**
   * 获取K线数据（带故障转移）
   */
  async fetchRecentCandles(
    symbols: string[],
    window: '5m' | '15m' | '1h' | '4h' | '1d',
    limit?: number
  ) {
    return this.executeWithFallback(
      (source) => source.fetchRecentCandles(symbols, window, limit),
      `fetchRecentCandles(${symbols.join(',')}, ${window})`
    )
  }

  /**
   * 获取流动性和持仓（带故障转移）
   */
  async fetchLiquidityAndHolders(
    pairs: Array<{
      address: string
      dex: string
      symbol: string
      chain: string
    }>
  ) {
    return this.executeWithFallback(
      (source) => source.fetchLiquidityAndHolders(pairs),
      `fetchLiquidityAndHolders(${pairs.length} pairs)`
    )
  }

  /**
   * 获取新钱包净买入（带故障转移）
   */
  async fetchNewWalletNetBuy(symbol: string, timeRange?: number) {
    return this.executeWithFallback(
      (source) => source.fetchNewWalletNetBuy(symbol, timeRange),
      `fetchNewWalletNetBuy(${symbol})`
    )
  }

  /**
   * 获取价格（带故障转移）
   */
  async fetchPrices(symbols: string[]) {
    return this.executeWithFallback(
      (source) => source.fetchPrices(symbols),
      `fetchPrices(${symbols.join(',')})`
    )
  }

  /**
   * 列出所有数据源
   */
  listSources(): Array<{
    name: string
    type: string
    enabled: boolean
    priority: number
  }> {
    return Array.from(this.sources.values()).map(({ source, config }) => ({
      name: source.name,
      type: source.type,
      enabled: config.enabled,
      priority: config.priority,
    }))
  }

  /**
   * 更新主数据源
   */
  private updatePrimarySource(): void {
    const enabledSources = Array.from(this.sources.values())
      .filter((entry) => entry.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority)

    this.primarySource = enabledSources.length > 0 ? enabledSources[0].source.name : null
  }
}

// 全局实例
export const dataSourceManager = new DataSourceManager()
