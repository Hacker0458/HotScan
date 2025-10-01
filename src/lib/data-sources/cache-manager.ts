/**
 * 缓存管理器
 * 
 * 使用数据库存储原始指标数据，减少外部 API 调用
 */

import { prisma } from '@/lib/prisma'
import type { Candle, LiquidityData, HolderData, WalletActivityData } from './types'

export class CacheManager {
  /**
   * 缓存 K 线数据
   */
  async cacheCandles(
    assetId: string,
    symbol: string,
    window: string,
    candles: Candle[],
    source: string
  ): Promise<void> {
    try {
      await prisma.rawMetric.create({
        data: {
          assetId,
          metricType: 'candle',
          window,
          data: {
            symbol,
            window,
            candles: candles.map((c) => ({
              timestamp: c.timestamp.toISOString(),
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
              volume: c.volume,
              volumeUSD: c.volumeUSD,
            })),
          },
          source,
          expiresAt: this.getExpiryTime(window),
        },
      })

      console.log(`[CacheManager] Cached ${candles.length} candles for ${symbol} (${window})`)
    } catch (error) {
      console.error('[CacheManager] Failed to cache candles:', error)
    }
  }

  /**
   * 获取缓存的 K 线数据
   */
  async getCachedCandles(
    assetId: string,
    window: string
  ): Promise<Candle[] | null> {
    try {
      const cached = await prisma.rawMetric.findFirst({
        where: {
          assetId,
          metricType: 'candle',
          window,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          fetchedAt: 'desc',
        },
      })

      if (!cached) return null

      const data = cached.data as any
      const candles = data.candles.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp),
      }))

      console.log(`[CacheManager] Retrieved ${candles.length} candles from cache`)
      return candles
    } catch (error) {
      console.error('[CacheManager] Failed to get cached candles:', error)
      return null
    }
  }

  /**
   * 缓存流动性数据
   */
  async cacheLiquidity(
    pairId: string,
    data: LiquidityData,
    source: string
  ): Promise<void> {
    try {
      await prisma.rawMetric.create({
        data: {
          pairId,
          metricType: 'liquidity',
          data: {
            ...data,
            updatedAt: data.updatedAt.toISOString(),
          },
          source,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟
        },
      })

      console.log(`[CacheManager] Cached liquidity for pair ${pairId}`)
    } catch (error) {
      console.error('[CacheManager] Failed to cache liquidity:', error)
    }
  }

  /**
   * 缓存持仓数据
   */
  async cacheHolder(
    assetId: string,
    data: HolderData,
    source: string
  ): Promise<void> {
    try {
      await prisma.rawMetric.create({
        data: {
          assetId,
          metricType: 'holder',
          data: {
            ...data,
            updatedAt: data.updatedAt.toISOString(),
          },
          source,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1小时
        },
      })

      console.log(`[CacheManager] Cached holder data for asset ${assetId}`)
    } catch (error) {
      console.error('[CacheManager] Failed to cache holder:', error)
    }
  }

  /**
   * 缓存钱包活动数据
   */
  async cacheWalletActivity(
    assetId: string,
    data: WalletActivityData,
    source: string
  ): Promise<void> {
    try {
      await prisma.rawMetric.create({
        data: {
          assetId,
          metricType: 'wallet',
          data: {
            ...data,
            updatedAt: data.updatedAt.toISOString(),
            largeTransactions: data.largeTransactions.map((tx) => ({
              ...tx,
              timestamp: tx.timestamp.toISOString(),
            })),
          },
          source,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟
        },
      })

      console.log(`[CacheManager] Cached wallet activity for asset ${assetId}`)
    } catch (error) {
      console.error('[CacheManager] Failed to cache wallet activity:', error)
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const result = await prisma.rawMetric.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      console.log(`[CacheManager] Cleaned ${result.count} expired cache entries`)
      return result.count
    } catch (error) {
      console.error('[CacheManager] Failed to clean cache:', error)
      return 0
    }
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats(): Promise<{
    total: number
    byType: Record<string, number>
    oldestEntry: Date | null
  }> {
    try {
      const [total, byType, oldest] = await Promise.all([
        prisma.rawMetric.count(),
        prisma.rawMetric.groupBy({
          by: ['metricType'],
          _count: true,
        }),
        prisma.rawMetric.findFirst({
          orderBy: {
            fetchedAt: 'asc',
          },
          select: {
            fetchedAt: true,
          },
        }),
      ])

      return {
        total,
        byType: Object.fromEntries(
          byType.map((item) => [item.metricType, item._count])
        ),
        oldestEntry: oldest?.fetchedAt || null,
      }
    } catch (error) {
      console.error('[CacheManager] Failed to get cache stats:', error)
      return { total: 0, byType: {}, oldestEntry: null }
    }
  }

  /**
   * 计算过期时间
   */
  private getExpiryTime(window: string): Date {
    const now = Date.now()
    const expiryMap: Record<string, number> = {
      '5m': 5 * 60 * 1000,      // 5分钟
      '15m': 15 * 60 * 1000,    // 15分钟
      '1h': 60 * 60 * 1000,     // 1小时
      '4h': 4 * 60 * 60 * 1000, // 4小时
      '1d': 24 * 60 * 60 * 1000, // 24小时
    }

    const ttl = expiryMap[window] || 60 * 60 * 1000 // 默认1小时
    return new Date(now + ttl)
  }
}

export const cacheManager = new CacheManager()
