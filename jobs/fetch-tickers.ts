import { prisma } from '../src/lib/prisma'
import { getDataSource, DexPair } from '../src/lib/datasources/dexscreener'

const HOTSCAN_QUERIES = (process.env.HOTSCAN_QUERIES || 'BTC,ETH,SOL,PEPE,DOGE,SHIB').split(',').map(s => s.trim())
const PAIRS_PER_QUERY = 4

export async function fetchTickers() {
  const startTime = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Fetch Tickers Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 查询列表:', HOTSCAN_QUERIES.join(', '))
  console.log(`🎯 目标: ~${HOTSCAN_QUERIES.length * PAIRS_PER_QUERY} 个交易对`)

  const dataSource = getDataSource()
  let assetsCreated = 0
  let assetsUpdated = 0
  let pairsCreated = 0
  let pairsUpdated = 0
  const seenPairs = new Set<string>() // 用于去重 chainId:pairAddress
  const allFetchedPairs: DexPair[] = []
  let mockFallbackCount = 0

  // 添加节流：每次查询间隔 1 秒
  for (let i = 0; i < HOTSCAN_QUERIES.length; i++) {
    const query = HOTSCAN_QUERIES[i]
    console.log(`\n🔍 [${i + 1}/${HOTSCAN_QUERIES.length}] 查询: ${query}`)
    
    const { mock, pairs } = await dataSource.searchTopPairs({ q: query, limit: PAIRS_PER_QUERY })
    
    if (mock) {
      mockFallbackCount++
      console.warn(`  ⚠️  Mock fallback (受限流/网络) - 跳过`)
      continue
    }

    console.log(`  ✅ 获取到 ${pairs.length} 个交易对`)

    for (const pair of pairs) {
      const pairKey = `${pair.chainId}:${pair.pairAddress}`
      if (seenPairs.has(pairKey)) {
        console.log(`  ⏭️  跳过重复: ${pairKey}`)
        continue
      }
      seenPairs.add(pairKey)
      allFetchedPairs.push(pair)

      // 处理 Asset
      const symbol = pair.baseToken.symbol
      const name = pair.baseToken.name || symbol
      const chain = pair.chainId

      try {
        // 使用 upsert 避免唯一约束冲突
        const asset = await prisma.asset.upsert({
          where: { symbol },
          create: { 
            symbol, 
            name, 
            chain,
            logo: null
          },
          update: { 
            name, 
            chain 
          }
        })

        if (await prisma.asset.count({ where: { symbol } }) === 1) {
          assetsCreated++
          console.log(`    ✅ 创建 Asset: ${symbol} (${chain})`)
        } else {
          assetsUpdated++
        }

        // 处理 Pair
        const liquidityUSD = pair.liquidity?.usd || 0
        const priceUsd = parseFloat(pair.priceUsd || '0')
        const fdv = pair.fdv || 0
        const priceChange1h = pair.priceChange?.h1 || 0
        const priceChange24h = pair.priceChange?.h24 || 0

        const existingPair = await prisma.pair.findFirst({
          where: { 
            pairAddress: pair.pairAddress,
            chainId: pair.chainId 
          }
        })

        if (!existingPair) {
          await prisma.pair.create({
            data: {
              assetId: asset.id,
              dexId: pair.dexId || 'unknown',
              dex: pair.dexId || 'unknown',
              pairAddress: pair.pairAddress,
              address: pair.pairAddress,
              chainId: pair.chainId,
              liquidityUSD: liquidityUSD,
              priceUsd: priceUsd,
              priceChange1h: priceChange1h,
              priceChange24h: priceChange24h,
              fdv: fdv,
              volumeH24: pair.volume?.h24 || 0,
            },
          })
          pairsCreated++
          console.log(`    ✅ 创建 Pair: ${symbol}/${pair.quoteToken.symbol} ($${priceUsd.toFixed(6)} | Δ1h: ${priceChange1h.toFixed(2)}%)`)
        } else {
          await prisma.pair.update({
            where: { id: existingPair.id },
            data: {
              liquidityUSD: liquidityUSD,
              priceUsd: priceUsd,
              priceChange1h: priceChange1h,
              priceChange24h: priceChange24h,
              fdv: fdv,
              volumeH24: pair.volume?.h24 || 0,
            },
          })
          pairsUpdated++
        }
      } catch (error: any) {
        console.error(`    ❌ 处理失败 ${symbol}:`, error.message)
      }
    }

    // 节流：避免 API 限流
    if (i < HOTSCAN_QUERIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const duration = (Date.now() - startTime) / 1000

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Fetch Tickers Completed')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 统计:')
  console.log(`   - 查询次数: ${HOTSCAN_QUERIES.length}`)
  console.log(`   - 成功查询: ${HOTSCAN_QUERIES.length - mockFallbackCount}`)
  console.log(`   - 失败查询: ${mockFallbackCount}`)
  console.log(`   - 找到交易对: ${allFetchedPairs.length} 个`)
  console.log(`   - Assets 创建: ${assetsCreated}`)
  console.log(`   - Assets 更新: ${assetsUpdated}`)
  console.log(`   - Pairs 创建: ${pairsCreated}`)
  console.log(`   - Pairs 更新: ${pairsUpdated}`)
  console.log(`   - 数据源: ${mockFallbackCount > 0 ? '⚠️ 部分 Mock (降级)' : '✅ 全部真实数据'}`)
  console.log(`⏱️  耗时: ${duration.toFixed(2)}s`)

  return { 
    assetsCreated, 
    assetsUpdated, 
    pairsCreated, 
    pairsUpdated, 
    totalPairs: allFetchedPairs.length, 
    mockFallbackCount,
    duration 
  }
}

// 直接运行
if (require.main === module) {
  fetchTickers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

