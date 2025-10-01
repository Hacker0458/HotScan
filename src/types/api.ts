/**
 * API响应类型定义
 * 
 * 统一的API响应格式，提供类型安全
 */

/**
 * 基础API响应
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * 游标分页响应
 */
export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    nextCursor: string | null
    hasMore: boolean
  }
}

/**
 * 信号响应
 */
export interface SignalResponse {
  id: string
  assetId: string
  window: string
  priceChangePct: number
  currentPrice: number
  volZScore: number
  volumeUSD: number
  liqDeltaPct: number
  totalLiquidityUSD: number
  top5HoldPct: number
  holderCount: number
  newWalletNetBuy: number
  newWalletCount: number
  riskScore: number
  contractAgeDays: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  aiSummary: {
    cn: string
    en: string
  }
  alertLevel: 'critical' | 'high' | 'medium' | 'low'
  createdAt: string
  asset: AssetResponse
}

/**
 * 资产响应
 */
export interface AssetResponse {
  id: string
  symbol: string
  name: string
  chain: string
  imageUrl: string | null
  createdAt: string
}

/**
 * 术语响应
 */
export interface TermResponse {
  term: string
  definition: string
  createdAt: string
}

/**
 * RAG问答响应
 */
export interface LearnResponse extends ApiResponse {
  data: {
    query: string
    answer: string
    sources: Array<{
      term: string
      definition: string
      similarity: number
    }>
  }
}

/**
 * 分享响应
 */
export interface ShareResponse extends ApiResponse {
  data: {
    shareId: string
    shareUrl: string
    expiresAt: string
  }
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
}

/**
 * 验证错误详情
 */
export interface ValidationErrorDetail {
  path: string
  message: string
  code: string
}

