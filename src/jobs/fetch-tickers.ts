/**
 * Job: Fetch Tickers
 * 
 * 从 DexScreener 获取最新的交易对数据
 * 支持通过 HOTSCAN_QUERIES 环境变量自定义查询列表
 */

import { prisma } from '@/lib/prisma'
import { searchTopPairs, getMockPairs } from '@/lib/datasources/dexscreener'

const DEFAULT_QUERIES = 'BTC,ETH,SOL,PEPE,DOGE,SHIB,TON,ARB,OP,BNB,MATIC,LDO'
const QUERIES = (process.env.HOTSCAN_QUERIES || DEFAULT_QUERIES).split(',').map(q => q.trim())
const PAIRS_PER_QUERY = 4

export interface FetchTickersResult {
  assetsCreated: number
  assetsUpdated: number
  pairsCreated: number
  pairsUpdated: number
  totalPairs: number
  isMockFallback: boolean
}

/**
 * 执行数据抓取
 */
export async function fetchTickers(): Promise<FetchTickersResult> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Fetch Tickers Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📋 查询列表: ${QUERIES.join(', ')}`)
  console.log(`🎯 目标: ~${QUERIES.length * PAIRS_PER_QUERY} 个交易对\n`)

  const startTime = Date.now()
  let assetsCreated = 0
  let assetsUpdated = 0
  let pairsCreated = 0
  let pairsUpdated = 0
  let isMockFallback = false

  const seenPairs = new Set<string>() // chain:pairAddress

  for (const query of QUERIES) {
    console.log(`\n🔍 查询: ${query}`)
    
    // 调用 DexScreener API
    const result = await searchTopPairs({ q: query, limit: PAIRS_PER_QUERY })
    
    if (result.mock) {
      console.log(`⚠️  mock fallback（受限流/网络）- 使用演示数据`)
      isMockFallback = true
      
      // 使用 mock 数据
      const mockPairs = getMockPairs(query)
      
      for (const pair of mockPairs) {
        const pairKey = `${pair.chainId}:${pair.pairAddress}`
        if (seenPairs.has(pairKey)) continue
        seenPairs.add(pairKey)

        // 处理 Asset
        const symbol = pair.baseToken.symbol
        const name = pair.baseToken.name
        const chain = pair.chainId

        // 使用 upsert 避免唯一约束冲突（symbol 是唯一的）
        const existingAsset = await prisma.asset.findUnique({
          where: { symbol }
        })

        let asset
        if (!existingAsset) {
          asset = await prisma.asset.create({
            data: { symbol, name, chain }
          })
          assetsCreated++
          console.log(`  ✅ 创建 Asset: ${symbol} (${chain})`)
        } else {
          asset = await prisma.asset.update({
            where: { symbol },
            data: { name, chain } // 更新 chain 以匹配最新数据
          })
          assetsUpdated++
        }

        // 处理 Pair
        const liquidityUSD = pair.liquidity?.usd || 0
        const priceUsd = parseFloat(pair.priceUsd || '0')

        let existingPair = await prisma.pair.findFirst({
          where: {
            assetId: asset.id,
            address: pair.pairAddress
          }
        })

        if (!existingPair) {
          await prisma.pair.create({
            data: {
              assetId: asset.id,
              dex: pair.dexId || 'unknown',
              address: pair.pairAddress,
              liquidityUSD,
            }
          })
          pairsCreated++
          console.log(`  ✅ 创建 Pair: ${pair.pairAddress} (流动性: $${(liquidityUSD / 1000000).toFixed(2)}M)`)
        } else {
          await prisma.pair.update({
            where: { id: existingPair.id },
            data: { liquidityUSD }
          })
          pairsUpdated++
        }
      }
      
      continue
    }

    // 真实数据处理
    const pairs = result.pairs
    console.log(`  📊 找到 ${pairs.length} 个交易对`)

    for (const pair of pairs) {
      const pairKey = `${pair.chainId}:${pair.pairAddress}`
      if (seenPairs.has(pairKey)) {
        console.log(`  ⏭️  跳过重复: ${pairKey}`)
        continue
      }
      seenPairs.add(pairKey)

      // 处理 Asset
      const symbol = pair.baseToken.symbol
      const name = pair.baseToken.name
      const chain = pair.chainId

      const existingAsset = await prisma.asset.findUnique({
        where: { symbol }
      })

      let asset
      if (!existingAsset) {
        asset = await prisma.asset.create({
          data: { symbol, name, chain }
        })
        assetsCreated++
        console.log(`  ✅ 创建 Asset: ${symbol} (${chain})`)
      } else {
        asset = await prisma.asset.update({
          where: { symbol },
          data: { name, chain }
        })
        assetsUpdated++
      }

      // 处理 Pair
      const liquidityUSD = pair.liquidity?.usd || 0
      const priceUsd = parseFloat(pair.priceUsd || '0')

      let existingPair = await prisma.pair.findFirst({
        where: {
          assetId: asset.id,
          address: pair.pairAddress
        }
      })

      if (!existingPair) {
        await prisma.pair.create({
          data: {
            assetId: asset.id,
            dex: pair.dexId || 'unknown',
            address: pair.pairAddress,
            liquidityUSD,
          }
        })
        pairsCreated++
        console.log(`  ✅ 创建 Pair: ${pair.pairAddress.substring(0, 10)}... (流动性: $${(liquidityUSD / 1000000).toFixed(2)}M)`)
      } else {
        await prisma.pair.update({
          where: { id: existingPair.id },
          data: { liquidityUSD }
        })
        pairsUpdated++
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Fetch Tickers Completed')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 统计:`)
  console.log(`   - 扫描交易对: ${seenPairs.size}`)
  console.log(`   - Assets 创建: ${assetsCreated}`)
  console.log(`   - Assets 更新: ${assetsUpdated}`)
  console.log(`   - Pairs 创建: ${pairsCreated}`)
  console.log(`   - Pairs 更新: ${pairsUpdated}`)
  console.log(`   - 数据源: ${isMockFallback ? '⚠️ Mock (降级)' : '✅ DexScreener (真实)'}`)
  console.log(`⏱️  耗时: ${duration}s\n`)

  return {
    assetsCreated,
    assetsUpdated,
    pairsCreated,
    pairsUpdated,
    totalPairs: seenPairs.size,
    isMockFallback
  }
}

// 如果直接运行此文件
if (require.main === module) {
  fetchTickers()
    .then(result => {
      console.log('✅ 完成:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ 失败:', error)
      process.exit(1)
    })
}
