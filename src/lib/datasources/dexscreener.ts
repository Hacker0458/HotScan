/**
 * DexScreener 数据源客户端
 * 提供实时 DEX 交易对数据
 */

const DEXSCREENER_BASE = process.env.DEXSCREENER_BASE || 'https://api.dexscreener.com'

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

export interface SearchResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

interface DataSourceResult {
  mock: boolean
  pairs: DexPair[]
}

/**
 * 带重试和超时的 fetch 请求
 */
async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response | null> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'HotScan/1.0'
        }
      })

      clearTimeout(timeoutId)

      // 检查状态码
      if (response.ok) {
        return response
      }

      // 429 或 5xx 需要重试
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`)
        
        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000
          console.warn(`⚠️  DexScreener API ${response.status}, 重试 ${attempt + 1}/${maxRetries} (等待 ${backoffMs}ms)`)
          await new Promise(resolve => setTimeout(resolve, backoffMs))
          continue
        }
      }

      // 其他错误不重试
      return response

    } catch (error: any) {
      lastError = error
      
      if (attempt < maxRetries && (error.name === 'AbortError' || error.name === 'TypeError')) {
        const backoffMs = Math.pow(2, attempt) * 1000
        console.warn(`⚠️  网络错误, 重试 ${attempt + 1}/${maxRetries} (等待 ${backoffMs}ms)`)
        await new Promise(resolve => setTimeout(resolve, backoffMs))
        continue
      }
      
      break
    }
  }

  console.error('❌ DexScreener API 请求失败:', lastError?.message || 'Unknown error')
  return null
}

/**
 * 搜索顶级交易对
 * @param q 查询字符串 (symbol)
 * @param limit 返回数量
 */
export async function searchTopPairs({ q, limit = 4 }: { q: string; limit?: number }): Promise<DataSourceResult> {
  try {
    const url = `${DEXSCREENER_BASE}/latest/dex/search?q=${encodeURIComponent(q)}`
    console.log(`🔍 查询 DexScreener: ${q}`)
    
    const response = await fetchWithRetry(url)

    if (!response || !response.ok) {
      console.warn(`⚠️  DexScreener API 失败 (${q}): ${response?.status || 'no response'}`)
      return { mock: true, pairs: [] }
    }

    const data: SearchResponse = await response.json()
    const pairs = data.pairs || []

    // 按 liquidityUsd 降序排序并取前 limit 个
    const sortedPairs = pairs
      .filter(p => p.liquidity?.usd !== undefined && p.liquidity.usd > 0)
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      .slice(0, limit)

    console.log(`  ✅ 找到 ${sortedPairs.length} 个交易对（流动性最高）`)

    return { mock: false, pairs: sortedPairs }
  } catch (error: any) {
    console.error(`❌ 查询 ${q} 失败:`, error.message)
    return { mock: true, pairs: [] }
  }
}

/**
 * 批量查询交易对详情
 * @param chain 链ID
 * @param pairAddresses 交易对地址数组
 */
export async function fetchPairsByAddresses({ 
  chain, 
  pairAddresses 
}: { 
  chain: string
  pairAddresses: string[] 
}): Promise<DataSourceResult> {
  if (pairAddresses.length === 0) {
    return { mock: false, pairs: [] }
  }

  try {
    const addresses = pairAddresses.join(',')
    const url = `${DEXSCREENER_BASE}/latest/dex/pairs/${chain}/${addresses}`
    
    const response = await fetchWithRetry(url)

    if (!response || !response.ok) {
      console.warn(`⚠️  DexScreener API 失败 (${chain}/${addresses}): ${response?.status || 'no response'}`)
      return { mock: true, pairs: [] }
    }

    const data: SearchResponse = await response.json()
    return { mock: false, pairs: data.pairs || [] }
  } catch (error: any) {
    console.error(`❌ 查询 ${chain}/${pairAddresses.join(',')} 失败:`, error.message)
    return { mock: true, pairs: [] }
  }
}

/**
 * 获取数据源实例
 */
export function getDataSource() {
  return {
    searchTopPairs,
    fetchPairsByAddresses
  }
}
