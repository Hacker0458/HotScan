/**
 * 数据摄取任务
 * 
 * 定时从数据源获取最新数据并写入数据库
 * 
 * 运行方式:
 * - pnpm jobs:ingest
 * - Vercel Cron
 * - GitHub Actions
 */

import { prisma } from '@/lib/prisma'
import { dataSourceManager } from '@/lib/data-sources/data-source-manager'
import { MockDataSource } from '@/lib/data-sources/mock-source'
import { cacheManager } from '@/lib/data-sources/cache-manager'

async function main() {
  console.log('🚀 Starting data ingestion task...')
  const startTime = Date.now()

  try {
    // 1. 注册数据源
    console.log('\n📊 Step 1: Registering data sources...')
    const mockSource = new MockDataSource()
    dataSourceManager.register(mockSource, {
      enabled: true,
      priority: 100,
      retryConfig: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
      },
    })

    console.log('✅ Data sources registered:', dataSourceManager.listSources())

    // 2. 获取活跃资产列表
    console.log('\n📊 Step 2: Fetching active assets...')
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      take: 20, // 限制数量避免超时
    })

    console.log(`✅ Found ${assets.length} active assets`)

    if (assets.length === 0) {
      console.log('⚠️  No active assets found, skipping ingestion')
      return
    }

    // 3. 获取交易对
    console.log('\n📊 Step 3: Fetching pairs...')
    const pairs = await prisma.pair.findMany({
      where: {
        isActive: true,
        assetId: {
          in: assets.map((a) => a.id),
        },
      },
      include: {
        asset: true,
      },
      take: 50,
    })

    console.log(`✅ Found ${pairs.length} active pairs`)

    // 4. 获取 K 线数据
    console.log('\n📊 Step 4: Fetching candles...')
    const symbols = assets.map((a) => a.symbol)
    const windows: Array<'5m' | '15m' | '1h' | '4h' | '1d'> = ['5m', '1h', '4h']

    for (const window of windows) {
      try {
        console.log(`  Fetching ${window} candles for ${symbols.length} assets...`)
        const candles = await dataSourceManager.fetchRecentCandles(symbols, window, 100)

        // 缓存数据
        for (const [symbol, candleData] of Object.entries(candles)) {
          const asset = assets.find((a) => a.symbol === symbol)
          if (asset && candleData.length > 0) {
            await cacheManager.cacheCandles(
              asset.id,
              symbol,
              window,
              candleData,
              'mock'
            )
          }
        }

        console.log(`  ✅ Cached ${window} candles for ${Object.keys(candles).length} assets`)
      } catch (error) {
        console.error(`  ❌ Failed to fetch ${window} candles:`, error)
      }
    }

    // 5. 获取流动性和持仓数据
    console.log('\n📊 Step 5: Fetching liquidity and holders...')
    if (pairs.length > 0) {
      try {
        const pairData = pairs.map((p) => ({
          address: p.address,
          dex: p.dex,
          symbol: p.asset.symbol,
          chain: p.asset.chain,
        }))

        const { liquidity, holders } = await dataSourceManager.fetchLiquidityAndHolders(
          pairData
        )

        // 更新 Pair 表
        for (const [address, liqData] of Object.entries(liquidity)) {
          const pair = pairs.find((p) => p.address === address)
          if (pair) {
            await prisma.pair.update({
              where: { id: pair.id },
              data: {
                liquidityUSD: liqData.liquidityUSD,
              },
            })

            await cacheManager.cacheLiquidity(pair.id, liqData, 'mock')
          }
        }

        // 缓存持仓数据
        for (const [symbol, holderData] of Object.entries(holders)) {
          const asset = assets.find((a) => a.symbol === symbol)
          if (asset) {
            await cacheManager.cacheHolder(asset.id, holderData, 'mock')
          }
        }

        console.log(`  ✅ Updated ${Object.keys(liquidity).length} pairs`)
        console.log(`  ✅ Cached holder data for ${Object.keys(holders).length} assets`)
      } catch (error) {
        console.error('  ❌ Failed to fetch liquidity and holders:', error)
      }
    }

    // 6. 获取钱包活动数据
    console.log('\n📊 Step 6: Fetching wallet activity...')
    for (const asset of assets.slice(0, 10)) {
      // 限制数量
      try {
        const walletData = await dataSourceManager.fetchNewWalletNetBuy(asset.symbol)
        await cacheManager.cacheWalletActivity(asset.id, walletData, 'mock')
        console.log(`  ✅ Cached wallet activity for ${asset.symbol}`)
      } catch (error) {
        console.error(`  ❌ Failed to fetch wallet activity for ${asset.symbol}:`, error)
      }
    }

    // 7. 清理过期缓存
    console.log('\n📊 Step 7: Cleaning expired cache...')
    const cleaned = await cacheManager.cleanExpiredCache()
    console.log(`  ✅ Cleaned ${cleaned} expired entries`)

    // 8. 缓存统计
    console.log('\n📊 Step 8: Cache statistics...')
    const stats = await cacheManager.getCacheStats()
    console.log('  Cache stats:', {
      total: stats.total,
      byType: stats.byType,
      oldestEntry: stats.oldestEntry,
    })

    // 完成
    const duration = Date.now() - startTime
    console.log(`\n✨ Data ingestion completed in ${duration}ms`)

    // 记录任务运行
    await prisma.jobRun.create({
      data: {
        jobName: 'ingest-data',
        status: 'success',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration,
        processed: assets.length,
        succeeded: assets.length,
        failed: 0,
        metadata: {
          assets: assets.length,
          pairs: pairs.length,
          cacheStats: stats,
        },
      },
    })
  } catch (error) {
    console.error('❌ Data ingestion failed:', error)

    // 记录失败
    await prisma.jobRun.create({
      data: {
        jobName: 'ingest-data',
        status: 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        processed: 0,
        succeeded: 0,
        failed: 1,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })

    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
