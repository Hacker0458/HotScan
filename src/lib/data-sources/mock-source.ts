/**
 * Mock 数据源实现
 * 
 * 用于开发和测试，生成真实感的模拟数据
 * 可作为付费数据源的占位符
 */

import type {
  IDataSource,
  Candle,
  LiquidityData,
  HolderData,
  WalletActivityData,
} from './types'

export class MockDataSource implements IDataSource {
  readonly name = 'Mock Data Source'
  readonly type = 'mock' as const

  private basePrice: Record<string, number> = {
    BTC: 67234.5,
    ETH: 3245.67,
    SOL: 98.45,
    PEPE: 0.000001234,
    DOGE: 0.0876,
    SHIB: 0.00001456,
    MATIC: 0.7845,
    AVAX: 23.45,
    LINK: 14.56,
    UNI: 7.89,
  }

  async isAvailable(): Promise<boolean> {
    // Mock 数据源始终可用
    return true
  }

  async fetchRecentCandles(
    symbols: string[],
    window: '5m' | '15m' | '1h' | '4h' | '1d',
    limit: number = 100
  ): Promise<Record<string, Candle[]>> {
    console.log(`[MockDataSource] Fetching candles for ${symbols.join(', ')} (${window})`)

    const result: Record<string, Candle[]> = {}
    const windowMs = this.getWindowMs(window)

    for (const symbol of symbols) {
      const basePrice = this.basePrice[symbol] || 100
      const candles: Candle[] = []

      // 生成最近的 K 线数据
      const now = Date.now()
      for (let i = limit - 1; i >= 0; i--) {
        const timestamp = new Date(now - i * windowMs)
        const volatility = 0.02 // 2% 波动
        const trend = Math.sin(i / 10) * 0.01 // 轻微趋势

        const open = basePrice * (1 + trend + (Math.random() - 0.5) * volatility)
        const close = open * (1 + (Math.random() - 0.5) * volatility)
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)
        const volume = basePrice * 1000000 * (0.5 + Math.random())

        candles.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
          volumeUSD: volume * ((open + close) / 2),
        })
      }

      result[symbol] = candles

      // 更新基础价格为最后一根 K 线的收盘价
      this.basePrice[symbol] = candles[candles.length - 1].close
    }

    return result
  }

  async fetchLiquidityAndHolders(
    pairs: Array<{
      address: string
      dex: string
      symbol: string
      chain: string
    }>
  ): Promise<{
    liquidity: Record<string, LiquidityData>
    holders: Record<string, HolderData>
  }> {
    console.log(`[MockDataSource] Fetching liquidity and holders for ${pairs.length} pairs`)

    const liquidity: Record<string, LiquidityData> = {}
    const holders: Record<string, HolderData> = {}

    for (const pair of pairs) {
      const basePrice = this.basePrice[pair.symbol] || 100

      // 生成流动性数据
      liquidity[pair.address] = {
        pairAddress: pair.address,
        dex: pair.dex,
        liquidityUSD: 1000000 + Math.random() * 50000000,
        volume24h: 500000 + Math.random() * 10000000,
        priceUSD: basePrice,
        token0Reserve: 10000 + Math.random() * 100000,
        token1Reserve: (10000 + Math.random() * 100000) * basePrice,
        lpSupply: 1000000 + Math.random() * 5000000,
        updatedAt: new Date(),
      }

      // 生成持仓数据
      const totalHolders = Math.floor(10000 + Math.random() * 1000000)
      holders[pair.symbol] = {
        symbol: pair.symbol,
        totalHolders,
        top5HoldingPct: 10 + Math.random() * 40,
        top10HoldingPct: 15 + Math.random() * 50,
        top20HoldingPct: 20 + Math.random() * 60,
        holderDistribution: [
          { range: '0-0.001%', count: Math.floor(totalHolders * 0.7), percentage: 70 },
          { range: '0.001-0.01%', count: Math.floor(totalHolders * 0.2), percentage: 20 },
          { range: '0.01-0.1%', count: Math.floor(totalHolders * 0.08), percentage: 8 },
          { range: '0.1-1%', count: Math.floor(totalHolders * 0.015), percentage: 1.5 },
          { range: '1%+', count: Math.floor(totalHolders * 0.005), percentage: 0.5 },
        ],
        updatedAt: new Date(),
      }
    }

    return { liquidity, holders }
  }

  async fetchNewWalletNetBuy(
    symbol: string,
    timeRange: number = 24
  ): Promise<WalletActivityData> {
    console.log(`[MockDataSource] Fetching wallet activity for ${symbol} (${timeRange}h)`)

    const basePrice = this.basePrice[symbol] || 100
    const newWalletCount = Math.floor(50 + Math.random() * 500)
    const totalBuyVolumeUSD = 100000 + Math.random() * 1000000
    const totalSellVolumeUSD = 80000 + Math.random() * 900000

    // 生成大额交易
    const largeTransactions = []
    const txCount = Math.floor(5 + Math.random() * 15)
    for (let i = 0; i < txCount; i++) {
      largeTransactions.push({
        hash: `0x${Math.random().toString(16).slice(2)}`,
        type: Math.random() > 0.5 ? 'buy' as const : 'sell' as const,
        amountUSD: 10000 + Math.random() * 100000,
        timestamp: new Date(Date.now() - Math.random() * timeRange * 3600000),
      })
    }

    return {
      symbol,
      newWalletCount,
      newWalletNetBuyUSD: totalBuyVolumeUSD - totalSellVolumeUSD,
      totalBuyVolumeUSD,
      totalSellVolumeUSD,
      largeTransactions,
      updatedAt: new Date(),
    }
  }

  async fetchPrices(symbols: string[]): Promise<Record<string, number>> {
    console.log(`[MockDataSource] Fetching prices for ${symbols.join(', ')}`)

    const result: Record<string, number> = {}
    for (const symbol of symbols) {
      result[symbol] = this.basePrice[symbol] || 100
    }

    return result
  }

  private getWindowMs(window: string): number {
    const map: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    }
    return map[window] || 60 * 60 * 1000
  }
}
