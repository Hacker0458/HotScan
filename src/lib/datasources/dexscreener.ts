/**
 * DexScreener API 数据源
 * 
 * 提供加密货币交易对的实时数据
 */

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex'

export interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd?: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd?: number
    base: number
    quote: number
  }
  fdv?: number
  pairCreatedAt?: number
}

export interface TokenResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

export interface SearchResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

/**
 * 获取指定代币的交易对信息
 */
export async function fetchTokenPairs(tokenAddress: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`${DEXSCREENER_BASE}/tokens/${tokenAddress}`)
    
    if (!response.ok) {
      console.error(`DexScreener API error: ${response.status}`)
      return []
    }
    
    const data: TokenResponse = await response.json()
    return data.pairs || []
  } catch (error) {
    console.error('Error fetching token pairs:', error)
    return []
  }
}

/**
 * 搜索代币（按 symbol 或名称）
 */
export async function searchToken(query: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`${DEXSCREENER_BASE}/search?q=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      console.error(`DexScreener search error: ${response.status}`)
      return []
    }
    
    const data: SearchResponse = await response.json()
    return data.pairs || []
  } catch (error) {
    console.error('Error searching token:', error)
    return []
  }
}

/**
 * 获取特定链上的交易对
 */
export async function fetchPairByAddress(chain: string, pairAddress: string): Promise<DexPair | null> {
  try {
    const response = await fetch(`${DEXSCREENER_BASE}/pairs/${chain}/${pairAddress}`)
    
    if (!response.ok) {
      console.error(`DexScreener pair error: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    return data.pair || null
  } catch (error) {
    console.error('Error fetching pair:', error)
    return null
  }
}

/**
 * 统一数据源接口
 */
export interface IDataSource {
  fetchRecent(symbols: string[]): Promise<Array<{
    symbol: string
    name: string
    chain: string
    price: number
    priceChange: {
      m5: number
      h1: number
      h24: number
    }
    volume: {
      h1: number
      h24: number
    }
    liquidity: number
    fdv?: number
    contractAgeDays?: number
  }>>
}

/**
 * DexScreener 数据源实现
 */
export class DexScreenerDataSource implements IDataSource {
  async fetchRecent(symbols: string[]) {
    const results = []
    
    for (const symbol of symbols) {
      try {
        console.log(`[DexScreener] Fetching ${symbol}...`)
        
        const pairs = await searchToken(symbol)
        
        if (!pairs || pairs.length === 0) {
          console.warn(`[DexScreener] No pairs found for ${symbol}`)
          continue
        }
        
        // 选择流动性最高的交易对
        const bestPair = pairs.sort((a, b) => {
          const liquidityA = a.liquidity?.usd || 0
          const liquidityB = b.liquidity?.usd || 0
          return liquidityB - liquidityA
        })[0]
        
        // 计算合约年龄（天数）
        let contractAgeDays: number | undefined
        if (bestPair.pairCreatedAt) {
          const ageMs = Date.now() - bestPair.pairCreatedAt
          contractAgeDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
        }
        
        results.push({
          symbol: bestPair.baseToken.symbol,
          name: bestPair.baseToken.name,
          chain: bestPair.chainId,
          price: parseFloat(bestPair.priceUsd || '0'),
          priceChange: {
            m5: bestPair.priceChange.m5,
            h1: bestPair.priceChange.h1,
            h24: bestPair.priceChange.h24,
          },
          volume: {
            h1: bestPair.volume.h1,
            h24: bestPair.volume.h24,
          },
          liquidity: bestPair.liquidity?.usd || 0,
          fdv: bestPair.fdv,
          contractAgeDays,
        })
        
        console.log(`[DexScreener] ✓ ${symbol}: $${bestPair.priceUsd}, liquidity: $${bestPair.liquidity?.usd?.toLocaleString()}`)
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`[DexScreener] Error fetching ${symbol}:`, error)
      }
    }
    
    return results
  }
}

/**
 * Mock 数据源（回退）
 */
export class MockDataSource implements IDataSource {
  async fetchRecent(symbols: string[]) {
    console.log('[MockDataSource] Using mock data for:', symbols.join(', '))
    
    return symbols.map(symbol => ({
      symbol,
      name: `${symbol} Token`,
      chain: 'ethereum',
      price: Math.random() * 1000,
      priceChange: {
        m5: (Math.random() - 0.5) * 20,
        h1: (Math.random() - 0.5) * 15,
        h24: (Math.random() - 0.5) * 30,
      },
      volume: {
        h1: Math.random() * 1000000,
        h24: Math.random() * 10000000,
      },
      liquidity: Math.random() * 5000000,
      fdv: Math.random() * 100000000,
      contractAgeDays: Math.floor(Math.random() * 365),
    }))
  }
}

/**
 * 获取数据源实例
 */
export function getDataSource(): IDataSource {
  const datasource = process.env.DATASOURCE || 'dexscreener'
  
  if (datasource === 'mock') {
    console.log('[DataSource] Using MockDataSource')
    return new MockDataSource()
  }
  
  console.log('[DataSource] Using DexScreenerDataSource')
  return new DexScreenerDataSource()
}

