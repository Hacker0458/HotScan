/**
 * 数据源抽象接口
 * 
 * 设计原则：
 * 1. 接口抽象，实现可插拔
 * 2. 统一的错误处理
 * 3. 支持批量查询
 * 4. 包含元数据和来源信息
 */

// ============================================
// 核心数据类型
// ============================================

export interface Candle {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  volumeUSD?: number
}

export interface LiquidityData {
  pairAddress: string
  dex: string
  liquidityUSD: number
  volume24h: number
  priceUSD: number
  token0Reserve: number
  token1Reserve: number
  lpSupply: number
  updatedAt: Date
}

export interface HolderData {
  symbol: string
  totalHolders: number
  top5HoldingPct: number
  top10HoldingPct: number
  top20HoldingPct: number
  holderDistribution: {
    range: string
    count: number
    percentage: number
  }[]
  updatedAt: Date
}

export interface WalletActivityData {
  symbol: string
  newWalletCount: number
  newWalletNetBuyUSD: number
  totalBuyVolumeUSD: number
  totalSellVolumeUSD: number
  largeTransactions: {
    hash: string
    type: 'buy' | 'sell'
    amountUSD: number
    timestamp: Date
  }[]
  updatedAt: Date
}

// ============================================
// 数据源接口
// ============================================

export interface IDataSource {
  /**
   * 数据源名称（用于日志和识别）
   */
  readonly name: string

  /**
   * 数据源类型
   */
  readonly type: 'real' | 'mock' | 'cached'

  /**
   * 是否可用
   */
  isAvailable(): Promise<boolean>

  /**
   * 获取最近的 K 线数据
   * 
   * @param symbols - 资产符号列表（如 ['BTC', 'ETH']）
   * @param window - 时间窗口（如 '5m', '1h', '1d'）
   * @param limit - 返回的蜡烛数量（默认 100）
   * @returns K 线数据映射表
   */
  fetchRecentCandles(
    symbols: string[],
    window: '5m' | '15m' | '1h' | '4h' | '1d',
    limit?: number
  ): Promise<Record<string, Candle[]>>

  /**
   * 获取流动性和持仓数据
   * 
   * @param pairs - 交易对地址列表
   * @returns 流动性和持仓数据
   */
  fetchLiquidityAndHolders(
    pairs: Array<{
      address: string
      dex: string
      symbol: string
      chain: string
    }>
  ): Promise<{
    liquidity: Record<string, LiquidityData>
    holders: Record<string, HolderData>
  }>

  /**
   * 获取新钱包净买入数据
   * 
   * @param symbol - 资产符号
   * @param timeRange - 时间范围（小时）
   * @returns 钱包活动数据
   */
  fetchNewWalletNetBuy(
    symbol: string,
    timeRange?: number
  ): Promise<WalletActivityData>

  /**
   * 批量获取资产价格
   * 
   * @param symbols - 资产符号列表
   * @returns 价格映射表
   */
  fetchPrices(symbols: string[]): Promise<Record<string, number>>
}

// ============================================
// 数据源响应包装
// ============================================

export interface DataSourceResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata: {
    source: string
    timestamp: Date
    duration: number
    cached?: boolean
  }
}

// ============================================
// 数据源配置
// ============================================

export interface DataSourceConfig {
  name: string
  enabled: boolean
  priority: number
  rateLimit?: {
    requestsPerMinute: number
    requestsPerHour: number
  }
  timeout?: number
  retryConfig?: RetryConfig
}

export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors?: string[]
}

// ============================================
// 错误类型
// ============================================

export class DataSourceError extends Error {
  constructor(
    message: string,
    public code: string,
    public source: string,
    public details?: any
  ) {
    super(message)
    this.name = 'DataSourceError'
  }
}

export class RateLimitError extends DataSourceError {
  constructor(source: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${source}`,
      'RATE_LIMIT_EXCEEDED',
      source,
      { retryAfter }
    )
    this.name = 'RateLimitError'
  }
}

export class TimeoutError extends DataSourceError {
  constructor(source: string, timeoutMs: number) {
    super(
      `Request timed out after ${timeoutMs}ms`,
      'TIMEOUT',
      source,
      { timeoutMs }
    )
    this.name = 'TimeoutError'
  }
}
