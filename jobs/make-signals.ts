import { prisma } from '../src/lib/prisma'
import { getDataSource, DexPair } from '../src/lib/datasources/dexscreener'

const SIGNAL_WINDOWS = ['5m', '1h'] as const
const MOCK_AI = process.env.MOCK_AI === '1'

/**
 * 计算风险评分（0-100，越高越危险）
 */
function calculateRiskScore(data: {
  priceChange: { m5: number; h1: number; h24: number }
  liquidityUsd: number
  contractAgeDays?: number
  volume: { h1: number; h24: number }
  fdv?: number
}): number {
  let score = 0

  // 1. 合约年龄（最多 +20 分）
  if (data.contractAgeDays !== undefined) {
    if (data.contractAgeDays <= 7) {
      score += 20
    } else if (data.contractAgeDays <= 30) {
      score += 10
    } else if (data.contractAgeDays <= 90) {
      score += 5
    }
  }

  // 2. 价格波动（最多 +25 分）
  const volatility = Math.abs(data.priceChange.h1)
  if (volatility > 50) {
    score += 25
  } else if (volatility > 30) {
    score += 15
  } else if (volatility > 15) {
    score += 10
  }

  // 3. 流动性（最多 +20 分）- 低流动性高风险
  if (data.liquidityUsd < 100000) {
    score += 20
  } else if (data.liquidityUsd < 500000) {
    score += 10
  } else if (data.liquidityUsd < 1000000) {
    score += 5
  }

  // 4. 成交量异常（最多 +15 分）
  const avgHourlyVolume = data.volume.h24 / 24
  if (avgHourlyVolume > 0) {
    const volRatio = data.volume.h1 / avgHourlyVolume
    if (volRatio > 5) {
      score += 15
    } else if (volRatio > 3) {
      score += 10
    } else if (volRatio > 2) {
      score += 5
    }
  }

  // 5. FDV 异常低（可能是 rug pull）
  if (data.fdv && data.fdv < 100000) {
    score += 20
  }

  return Math.min(score, 100)
}

/**
 * 生成 AI 摘要
 */
function generateSimpleSummary(signal: any, asset: any): { cn: string; en: string } {
  const priceDir = signal.priceChangePct > 0 ? '上涨' : signal.priceChangePct < 0 ? '下跌' : '持平'
  const priceChange = Math.abs(signal.priceChangePct).toFixed(1)
  const riskLevel = signal.riskScore >= 70 ? '极高风险' : signal.riskScore >= 50 ? '高风险' : '中等风险'
  const liquidityText = signal.totalLiquidityUSD >= 1000000 
    ? `流动性 $${(signal.totalLiquidityUSD / 1000000).toFixed(1)}M` 
    : `流动性较低`

  return {
    cn: `「${asset.name}」${signal.window} 窗口${priceDir} ${priceChange}%，${liquidityText}。风险评分 ${signal.riskScore}/100，${riskLevel}。${signal.riskScore >= 70 ? '⚠️ 请谨慎交易！' : ''}`,
    en: `${asset.name} ${signal.window} ${priceDir} ${priceChange}%, Risk ${signal.riskScore}/100. ${riskLevel}.`
  }
}

export async function makeSignals() {
  const startTime = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Make Signals Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  let signalsCreated = 0
  let assetsProcessed = 0
  let mockFallbackCount = 0

  // 获取所有 Asset
  const assets = await prisma.asset.findMany({
    include: {
      pairs: {
        orderBy: {
          liquidityUSD: 'desc'
        },
        take: 1 // 只取流动性最高的 pair
      }
    }
  })

  console.log(`📦 找到 ${assets.length} 个资产`)

  const dataSource = getDataSource()

  for (const asset of assets) {
    assetsProcessed++
    console.log(`\n🔍 [${assetsProcessed}/${assets.length}] 处理: ${asset.symbol} (${asset.chain})`)

    // 尝试从 DexScreener 获取实时数据
    let realTimePairs: DexPair[] = []
    let isMock = false

    if (asset.pairs.length > 0) {
      const pairAddresses = asset.pairs.map(p => p.pairAddress)
      const { mock, pairs } = await dataSource.fetchPairsByAddresses({ 
        chain: asset.chain, 
        pairAddresses 
      })
      realTimePairs = pairs
      isMock = mock
      
      if (mock) {
        mockFallbackCount++
        console.warn(`  ⚠️  API 失败，使用数据库缓存数据`)
      }
    }

    // 使用实时数据或数据库缓存数据
    const mainPair = realTimePairs.length > 0 ? realTimePairs[0] : null
    const dbPair = asset.pairs[0]

    if (!mainPair && !dbPair) {
      console.warn(`  ⏭️  跳过（无可用数据）`)
      continue
    }

    // 为每个时间窗口生成信号
    for (const window of SIGNAL_WINDOWS) {
      let priceChangePct = 0
      let volumeH1 = 0
      let volumeH24 = 0
      let liquidityUsd = 0
      let contractAgeDays = 0
      let currentPrice = 0
      let fdv = 0

      if (mainPair) {
        const rawPriceChange = window === '5m' ? mainPair.priceChange.m5 : mainPair.priceChange.h1
        priceChangePct = isNaN(rawPriceChange) || !isFinite(rawPriceChange) ? 0 : rawPriceChange
        volumeH1 = mainPair.volume.h1 || 0
        volumeH24 = mainPair.volume.h24 || 0
        liquidityUsd = mainPair.liquidity?.usd || 0
        currentPrice = parseFloat(mainPair.priceUsd || '0')
        fdv = mainPair.fdv || 0
        contractAgeDays = mainPair.pairCreatedAt 
          ? Math.floor((Date.now() - mainPair.pairCreatedAt) / (1000 * 60 * 60 * 24))
          : 0
      } else if (dbPair) {
        // 使用数据库缓存数据
        priceChangePct = dbPair.priceChangeH24 || 0
        volumeH24 = dbPair.volumeH24 || 0
        volumeH1 = volumeH24 / 24 // 估算
        liquidityUsd = dbPair.liquidityUSD
        currentPrice = dbPair.priceUsd || 0
        fdv = dbPair.fdv || 0
      }

      // 计算风险评分
      const riskScore = calculateRiskScore({
        priceChange: {
          m5: mainPair?.priceChange.m5 || 0,
          h1: mainPair?.priceChange.h1 || priceChangePct,
          h24: mainPair?.priceChange.h24 || priceChangePct
        },
        liquidityUsd: liquidityUsd,
        contractAgeDays: contractAgeDays,
        volume: { h1: volumeH1, h24: volumeH24 },
        fdv: fdv
      })

      // 计算 Z-Score（简化版）
      const avgHourlyVolume = volumeH24 / 24
      const volZScore = avgHourlyVolume > 0 
        ? (volumeH1 - avgHourlyVolume) / (avgHourlyVolume * 0.5 + 1)
        : 0

      // 生成 AI 摘要
      const aiSummary = generateSimpleSummary(
        { priceChangePct, window, riskScore, totalLiquidityUSD: liquidityUsd },
        asset
      )

      // 判断情绪
      const sentiment = priceChangePct > 5 ? 'bullish' : 
                       priceChangePct < -5 ? 'bearish' : 
                       'neutral'

      // 判断警告级别
      const alertLevel = riskScore >= 70 ? 'high' : 
                        riskScore >= 50 ? 'medium' : 
                        'low'

      try {
        // 创建 Signal
        await prisma.signal.create({
          data: {
            assetId: asset.id,
            window: window,
            priceChangePct: priceChangePct,
            currentPrice: currentPrice,
            volZScore: volZScore,
            volumeUSD: volumeH1,
            liqDeltaPct: 0, // 需要历史数据才能计算
            totalLiquidityUSD: liquidityUsd,
            top5HoldPct: 0, // DexScreener 不提供
            holderCount: 0, // DexScreener 不提供
            newWalletNetBuy: 0, // DexScreener 不提供
            newWalletCount: 0, // DexScreener 不提供
            riskScore: riskScore,
            contractAgeDays: contractAgeDays,
            sentiment: sentiment,
            aiSummary: aiSummary.cn, // 使用中文摘要，英文摘要可以附加在末尾
            alertLevel: alertLevel
          }
        })
        
        signalsCreated++
        console.log(`  ✅ ${window} 信号: Δ${priceChangePct.toFixed(2)}%, 风险${riskScore}/100`)
      } catch (error: any) {
        console.error(`  ❌ 创建信号失败:`, error.message)
      }
    }

    // 添加节流
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const duration = (Date.now() - startTime) / 1000

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Make Signals Completed')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 统计:')
  console.log(`   - 资产处理: ${assetsProcessed}`)
  console.log(`   - 信号生成: ${signalsCreated}`)
  console.log(`   - 数据源: ${mockFallbackCount > 0 ? '⚠️ 部分缓存数据' : '✅ 全部实时数据'}`)
  console.log(`⏱️  耗时: ${duration.toFixed(2)}s`)

  return { signalsCreated, assetsProcessed, mockFallbackCount, duration }
}

// 直接运行
if (require.main === module) {
  makeSignals()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

